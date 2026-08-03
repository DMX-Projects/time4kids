"use client";

import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { AccessLoading } from "@/components/auth/AccessLoading";
import { normalizeRole, useAuth } from "@/components/auth/AuthProvider";
import crmApi from "@/lib/crmApi";
import {
    buildCrmDashboardHref,
    clearCrmDashboardFilters,
    datesFromSnapshot,
    hardRefreshCrmDashboard,
    loadCrmDashboardFilters,
    saveCrmDashboardFilters,
    snapshotFromSearchParams,
    type CrmDashboardFiltersSnapshot,
} from "@/lib/crmDashboardFilters";
import DashboardStats from "@/components/crm/admin/DashboardStats";
import LeadsTable from "@/components/crm/admin/LeadsTable";
import { isCampaignOnlyCrmEmail, isCampaignExternalViewerEmail, isAgencyCrmEmail, agencyViewerLabel, isRestrictedCrmViewerEmail } from "@/lib/crmCampaignAccess";
import DateRangePicker from "@/components/crm/admin/DateRangePicker";
import CitySelector from "@/components/crm/admin/CitySelector";
import StateSelector from "@/components/crm/admin/StateSelector";
import CentreSelector from "@/components/crm/admin/CentreSelector";
import { SearchableSelect } from "@/components/crm/SearchableSelect";
import RemindersWidget from "@/components/crm/admin/RemindersWidget";
import ReportsView from "@/components/crm/admin/ReportsView";

const LeadSourceChart = lazy(() => import("@/components/crm/admin/LeadSourceChart"));
const ConversionFunnel = lazy(() => import("@/components/crm/admin/ConversionFunnel"));

const CRM_DOC_ID_KEY = "crm-page-doc-id";

function isBrowserReload(): boolean {
    if (typeof window === "undefined" || typeof performance === "undefined") return false;
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === "reload") return true;
    const legacy = (performance as Performance & { navigation?: { type?: number } }).navigation;
    return legacy?.type === 1;
}

/** True only on the first dashboard mount after a full document load (not remount from lead back). */
function isFirstMountOfThisDocument(): boolean {
    if (typeof window === "undefined") return true;
    const docId = String(performance.timeOrigin);
    try {
        const prev = sessionStorage.getItem(CRM_DOC_ID_KEY);
        if (prev === docId) return false;
        sessionStorage.setItem(CRM_DOC_ID_KEY, docId);
        return true;
    } catch {
        return true;
    }
}

type LeadType = "all" | "franchise" | "admission";
/** Effective API source derived from lead type + sub-filter */
type SourceFilter =
    | "all"
    | "admission_all"
    | "franchise_all"
    | "admission"
    | "contact"
    | "landing"
    | "campaign"
    | "franchise"
    | "others"
    | "admission_others";
type FranchiseSubFilter = "" | "franchise" | "campaign" | "others";
/** Admission family: Website form, city Landing pages, Centerpage contact, Others */
type AdmissionSubFilter = "" | "website" | "landing" | "contact" | "others";
type SubFilter = FranchiseSubFilter | AdmissionSubFilter;
type CampaignChannelFilter = "" | "google" | "july_meta" | "youtube";
type OthersChannelFilter =
    | ""
    | "whatsapp"
    | "sms"
    | "email"
    | "franchise_referral"
    | "franchise_friends_family"
    | "referral_parents"
    | "referral_family_friends";
type ChannelFilter = CampaignChannelFilter | OthersChannelFilter;
type StatusFilter =
    | "all"
    | "untouched"
    | "not_answering"
    | "follow_up"
    | "visited_school"
    | "converted_admission"
    | "joined_competition"
    | "not_interested"
    | "wrong_enquiry"
    | "hot"
    | "warm"
    | "cold"
    | "converted_mou_signed"
    | "converted_agreement_signed"
    | "join_later"
    | "not_answering_calls"
    // Legacy just in case
    | "new"
    | "contacted"
    | "called"
    | "interested"
    | "meeting_scheduled"
    | "converted"
    | "dropped"
    | "";

function leadTypeFromSource(source: string): LeadType {
    if (!source || source === "all") return "all";
    if (
        source === "campaign" ||
        source === "franchise" ||
        source === "franchise_all" ||
        source === "others"
    ) {
        return "franchise";
    }
    return "admission";
}

function subFilterFromSource(source: string): SubFilter {
    if (source === "campaign") return "campaign";
    if (source === "franchise") return "franchise";
    if (source === "others") return "others";
    if (source === "franchise_all") return "";
    if (source === "landing") return "landing";
    if (source === "contact") return "contact";
    if (source === "admission") return "website";
    if (source === "admission_others") return "others";
    if (source === "admission_all") return "";
    return "";
}

function sourceFromLeadTypeAndSub(leadType: LeadType, sub: SubFilter): SourceFilter {
    if (leadType === "all") return "all";
    if (leadType === "franchise") {
        if (sub === "campaign") return "campaign";
        if (sub === "franchise") return "franchise";
        if (sub === "others") return "others";
        return "franchise_all";
    }
    // Admission family
    if (sub === "landing") return "landing";
    if (sub === "contact") return "contact";
    if (sub === "website") return "admission";
    if (sub === "others") return "admission_others";
    return "admission_all";
}

function migrateLegacySource(raw: string): SourceFilter {
    if (raw === "website") return "admission";
    if (
        raw === "all" ||
        raw === "admission_all" ||
        raw === "franchise_all" ||
        raw === "campaign" ||
        raw === "franchise" ||
        raw === "admission" ||
        raw === "landing" ||
        raw === "contact" ||
        raw === "others" ||
        raw === "admission_others"
    ) {
        return raw;
    }
    // Empty / unknown → All Leads
    return "all";
}

function apiSourceParam(source: SourceFilter, channel: ChannelFilter): string {
    if (source === "all") return "";
    if (source === "campaign") return channel || "campaign";
    if (source === "others") return channel || "others";
    if (source === "admission_others") {
        if (!channel) return "admission_others";
        // Prefix shared channel ids so reports can tell admission vs franchise Others apart
        if (channel === "whatsapp" || channel === "sms" || channel === "email") {
            return `admission_${channel}`;
        }
        return channel;
    }
    return source;
}

function apiStatusParam(status: StatusFilter): string {
    if (!status || status === "all") return "";
    return status;
}

const LEAD_TYPE_OPTIONS: { id: LeadType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "franchise", label: "Franchise Lead" },
    { id: "admission", label: "Admission Lead" },
];

const FRANCHISE_SUB_FILTERS: { id: FranchiseSubFilter; label: string }[] = [
    { id: "", label: "All" },
    { id: "franchise", label: "Website Leads" },
    { id: "campaign", label: "Paid Campaign" },
    { id: "others", label: "Others" },
];

const ADMISSION_SUB_FILTERS: { id: AdmissionSubFilter; label: string }[] = [
    { id: "", label: "All" },
    { id: "website", label: "Website" },
    { id: "landing", label: "Paid Campaign" },
    { id: "contact", label: "Centerpage" },
    { id: "others", label: "Others" },
];

const SOURCE_LABELS: Record<SourceFilter, string> = {
    all: "All",
    admission_all: "Admission",
    franchise_all: "Franchise",
    franchise: "Website Leads",
    campaign: "Paid Campaign",
    admission: "Website",
    landing: "Paid Campaign",
    contact: "Centerpage",
    others: "Others",
    admission_others: "Others",
};

const CAMPAIGN_CHANNEL_FILTERS: { id: CampaignChannelFilter; label: string }[] = [
    { id: "", label: "All Channels" },
    { id: "google", label: "Google" },
    { id: "july_meta", label: "META" },
    { id: "youtube", label: "YouTube" },
];

const OTHERS_CHANNEL_FILTERS: { id: OthersChannelFilter; label: string }[] = [
    { id: "", label: "All Channels" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "sms", label: "SMS" },
    { id: "email", label: "Email" },
    { id: "franchise_referral", label: "Referral-Franchise" },
    { id: "franchise_friends_family", label: "Referral - Friends & Family" },
];

const ADMISSION_OTHERS_CHANNEL_FILTERS: { id: OthersChannelFilter; label: string }[] = [
    { id: "", label: "All Channels" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "sms", label: "SMS" },
    { id: "email", label: "Email" },
    { id: "referral_parents", label: "Referral – Parents" },
    { id: "referral_family_friends", label: "Referral - Family & Friends" },
];

const FRANCHISE_CAMPAIGN_CHANNELS: CampaignChannelFilter[] = ["google", "july_meta"];

/** LP channels that use franchise-lp geo (no centre). */
function isFranchiseLpGeoChannel(channel: ChannelFilter): boolean {
    return (FRANCHISE_CAMPAIGN_CHANNELS as string[]).includes(channel);
}

const NON_FRANCHISE_FILTERS: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All Status" },
    { id: "untouched", label: "Untouched" },
    { id: "not_answering", label: "Not answering" },
    { id: "wrong_enquiry", label: "Wrong enquiry" },
    { id: "not_interested", label: "Not Interested" },
    { id: "follow_up", label: "Follow-up" },
    { id: "joined_competition", label: "Joined competition" },
    { id: "visited_school", label: "Visited the school" },
    { id: "converted_admission", label: "Converted to Admission" },
];

const FRANCHISE_FILTERS: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All Status" },
    { id: "untouched", label: "Untouched" },
    { id: "not_answering_calls", label: "Not Answering Calls" },
    { id: "follow_up", label: "Follow-up" },
    { id: "join_later", label: "Join Later" },
    { id: "cold", label: "Cold" },
    { id: "warm", label: "Warm" },
    { id: "hot", label: "Hot" },
    { id: "not_interested", label: "Not Interested" },
    { id: "wrong_enquiry", label: "Wrong enquiry" },
    { id: "converted_mou_signed", label: "Converted – MOU" },
    { id: "converted_agreement_signed", label: "Converted – Agreement" },
];

export default function CrmDashboard({ view = 'all' }: { view?: 'dashboard' | 'reports' | 'all' }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading: authLoading, logout } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [filtersReady, setFiltersReady] = useState(false);
    const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: null,
        endDate: null,
    });
    const [selectedCity, setSelectedCity] = useState<string[]>([]);
    const [selectedState, setSelectedState] = useState<string[]>([]);
    const [selectedCentre, setSelectedCentre] = useState<string[]>([]);
    const [filterDateRange, setFilterDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: null,
        endDate: null,
    });
    const [selectedSource, setSelectedSource] = useState<SourceFilter>("all");
    const [selectedCampaignChannel, setSelectedCampaignChannel] = useState<ChannelFilter>("");
    const [selectedUtmCampaign, setSelectedUtmCampaign] = useState<string>("");
    const [campaignOptions, setCampaignOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedUtmMedium, setSelectedUtmMedium] = useState<string>("");
    const [mediumOptions, setMediumOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [crmUsers, setCrmUsers] = useState<{ id: number; label: string }[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);
    const [reportsFiltersApplied, setReportsFiltersApplied] = useState(false);
    const snapshotRef = useRef<CrmDashboardFiltersSnapshot | null>(null);

    const isCrmUser = normalizeRole(user?.role) === "crm";
    const isCampaignOnlyUser = isCampaignOnlyCrmEmail(user?.email);
    const isAgencyUser = isAgencyCrmEmail(user?.email);
    const isRestrictedViewer = isRestrictedCrmViewerEmail(user?.email);
    const isExternalCampaignViewer = isCampaignExternalViewerEmail(user?.email);
    const returnPath = view === "reports" ? "/crm-admin/reports" : "/crm-admin";
    const selectedLeadType = leadTypeFromSource(selectedSource);
    const selectedSubFilter = subFilterFromSource(selectedSource);

    // External campaign / agency viewer has Dashboard only — block direct /reports URL access.
    useEffect(() => {
        if (!authLoading && user && isExternalCampaignViewer && view === "reports") {
            router.replace("/crm-admin");
        }
    }, [authLoading, user, isExternalCampaignViewer, view, router]);

    const applySnapshot = (saved: CrmDashboardFiltersSnapshot) => {
        const { filterDateRange: savedFilter, dateRange: savedApplied } = datesFromSnapshot(saved);
        setSelectedCity(Array.isArray(saved.selectedCity) ? saved.selectedCity : []);
        setSelectedState(Array.isArray(saved.selectedState) ? saved.selectedState : []);
        setSelectedCentre(Array.isArray(saved.selectedCentre) ? saved.selectedCentre : []);
        const migrated = migrateLegacySource(saved.selectedSource || "");
        setSelectedSource(migrated);
        const savedChannel = (saved.selectedCampaignChannel as ChannelFilter) || "";
        const campaignIds = new Set(CAMPAIGN_CHANNEL_FILTERS.map((f) => f.id));
        const franchiseOthersIds = new Set(OTHERS_CHANNEL_FILTERS.map((f) => f.id));
        const admissionOthersIds = new Set(ADMISSION_OTHERS_CHANNEL_FILTERS.map((f) => f.id));
        if (migrated === "campaign" && campaignIds.has(savedChannel as CampaignChannelFilter)) {
            setSelectedCampaignChannel(savedChannel);
        } else if (migrated === "others" && franchiseOthersIds.has(savedChannel as OthersChannelFilter)) {
            setSelectedCampaignChannel(savedChannel);
        } else if (
            migrated === "admission_others" &&
            admissionOthersIds.has(savedChannel as OthersChannelFilter)
        ) {
            setSelectedCampaignChannel(savedChannel);
        } else {
            setSelectedCampaignChannel("");
            setSelectedUtmCampaign("");
            setSelectedUtmMedium("");
        }
        const restoredStatus = (saved.selectedStatus as StatusFilter) || "all";
        setSelectedStatus(restoredStatus);
        setSelectedUserId(typeof saved.selectedUserId === "string" ? saved.selectedUserId : "");
        setSelectedUtmCampaign(typeof saved.selectedUtmCampaign === "string" ? saved.selectedUtmCampaign : "");
        setSelectedUtmMedium(typeof saved.selectedUtmMedium === "string" ? saved.selectedUtmMedium : "");
        setFilterDateRange(savedFilter);
        setDateRange(savedApplied);
        setReportsFiltersApplied(Boolean(saved.reportsFiltersApplied));
    };

    useEffect(() => {
        if (typeof window === "undefined") {
            setFiltersReady(true);
            return;
        }

        const restore = () => {
            const fromUrl = snapshotFromSearchParams(new URLSearchParams(window.location.search));
            // Prefer URL only when it matches this view; otherwise load that view's own saved filters.
            // Dashboard and Reports use separate storage keys so filters do not cross-contaminate.
            const fromUrlForView = fromUrl
                ? { ...fromUrl, returnPath }
                : null;
            const saved = fromUrlForView || loadCrmDashboardFilters(returnPath);
            if (saved) {
                applySnapshot({ ...saved, returnPath });
            }
        };

        // F5 / hard refresh: reset filters once. Back from lead remounts the page but is NOT a new document.
        if (isBrowserReload() && isFirstMountOfThisDocument()) {
            clearCrmDashboardFilters();
            setSelectedCity([]);
            setSelectedState([]);
            setSelectedCentre([]);
            setSelectedSource("all");
            setSelectedCampaignChannel("");
        setSelectedUtmCampaign("");
        setSelectedUtmMedium("");
            setSelectedStatus("all");
            setSelectedUserId("");
            setFilterDateRange({ startDate: null, endDate: null });
            setDateRange({ startDate: null, endDate: null });
            setReportsFiltersApplied(false);
            const cleanPath = returnPath.startsWith("/crm-admin/reports")
                ? "/crm-admin/reports"
                : "/crm-admin";
            if (`${window.location.pathname}${window.location.search}` !== cleanPath) {
                router.replace(cleanPath, { scroll: false });
            }
            setFiltersReady(true);
            return;
        }

        // Mark this document seen so remounts (lead → back) restore filters instead of resetting.
        isFirstMountOfThisDocument();
        restore();
        setFiltersReady(true);

        const onPopState = () => restore();
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount + back navigation
    }, []);

    const currentSnapshot: CrmDashboardFiltersSnapshot = useMemo(
        () => ({
            returnPath,
            selectedCity,
            selectedState,
            selectedCentre,
            selectedSource,
            selectedCampaignChannel,
            selectedUtmCampaign,
            selectedUtmMedium,
            selectedStatus,
            selectedUserId,
            filterStart: filterDateRange.startDate?.toISOString() ?? null,
            filterEnd: filterDateRange.endDate?.toISOString() ?? null,
            appliedStart: dateRange.startDate?.toISOString() ?? null,
            appliedEnd: dateRange.endDate?.toISOString() ?? null,
            reportsFiltersApplied,
        }),
        [
            returnPath,
            selectedCity,
            selectedState,
            selectedCentre,
            selectedSource,
            selectedCampaignChannel,
            selectedUtmCampaign,
            selectedUtmMedium,
            selectedStatus,
            selectedUserId,
            filterDateRange,
            dateRange,
            reportsFiltersApplied,
        ],
    );

    snapshotRef.current = currentSnapshot;

    const returnHref = useMemo(() => buildCrmDashboardHref(currentSnapshot), [currentSnapshot]);

    const persistFiltersNow = () => {
        if (snapshotRef.current) {
            saveCrmDashboardFilters(snapshotRef.current);
        }
    };

    useEffect(() => {
        if (!filtersReady) return;
        saveCrmDashboardFilters(currentSnapshot);
        const next = buildCrmDashboardHref(currentSnapshot);
        const current =
            typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";
        if (pathname?.startsWith("/crm-admin") && current !== next) {
            router.replace(next, { scroll: false });
        }
    }, [filtersReady, currentSnapshot, pathname, router]);

    const getHeaderTitle = () => {
        if (isAgencyUser) {
            const label = agencyViewerLabel(user?.email);
            return view === "reports" ? `${label} Reports` : `${label} Dashboard`;
        }
        if (isCampaignOnlyUser) {
            return view === "reports" ? "Paid Campaign Reports" : "Paid Campaign Dashboard";
        }
        const leadLabel = LEAD_TYPE_OPTIONS.find((f) => f.id === selectedLeadType)?.label || "";
        const subLabel =
            selectedLeadType === "admission" && selectedSource !== "admission_all"
                ? SOURCE_LABELS[selectedSource]
                : selectedLeadType === "admission"
                  ? "All"
                  : selectedLeadType === "franchise" && selectedSource !== "franchise_all"
                    ? SOURCE_LABELS[selectedSource]
                    : selectedLeadType === "franchise"
                      ? "All"
                      : "";
        if (view === "reports") {
            if (!leadLabel) return "Reports";
            return subLabel ? `${leadLabel} — ${subLabel} Reports` : `${leadLabel} Reports`;
        }
        return subLabel ? `${leadLabel} — ${subLabel} Dashboard` : leadLabel ? `${leadLabel} Dashboard` : "Admin Dashboard";
    };

    const handleCityChange = (city: string[]) => {
        setSelectedCity(city);
        // Centre filter only works for a single city
        setSelectedCentre([]);
        setSelectedUserId("");
        if (view === 'reports') {
            setReportsFiltersApplied(false);
        }
    };

    const handleStateChange = (state: string[]) => {
        setSelectedState(state);
        setSelectedCity([]);
        setSelectedCentre([]);
        setSelectedUserId("");
        if (view === 'reports') {
            setReportsFiltersApplied(false);
        }
    };

    const isCampaignView = selectedSource === "campaign";
    const isOthersView = selectedSource === "others" || selectedSource === "admission_others";
    const othersChannelFilters =
        selectedSource === "admission_others" ? ADMISSION_OTHERS_CHANNEL_FILTERS : OTHERS_CHANNEL_FILTERS;
    const isFranchiseLpGeoView = isFranchiseLpGeoChannel(selectedCampaignChannel);
    // All campaign channels (Web/FB/Insta + LP) use franchise status workflow
    // Agency viewers see Meta/FB + landing — use franchise status list for filters.
    const isFranchise =
        isAgencyUser ||
        selectedSource === "franchise" ||
        selectedSource === "campaign" ||
        selectedSource === "franchise_all" ||
        selectedSource === "others";
    const apiSource = isAgencyUser
        ? "agency"
        : apiSourceParam(selectedSource, selectedCampaignChannel);
    const apiStatus = apiStatusParam(selectedStatus);
    // Paid Campaign leads (LP + Meta inline) use franchise-lp state/city lists — same as the forms.
    const usesFranchiseLpGeo = isFranchiseLpGeoView || selectedSource === "campaign";
    const hidesCentreForCampaignChannel = usesFranchiseLpGeo;
    // Select Centre only for Admission — hidden for Franchise Lead (and when Lead = All)
    const showCentreSelector =
        !isRestrictedViewer &&
        selectedLeadType === "admission" &&
        !hidesCentreForCampaignChannel;
    const activeCentreIds = useMemo(
        () => (showCentreSelector ? selectedCentre : []),
        [showCentreSelector, selectedCentre],
    );
    const geoScope = usesFranchiseLpGeo ? "franchise-lp" : "default";
    const geoUserId =
        selectedUserId && selectedUserId !== "unassigned" && selectedUserId !== "all"
            ? selectedUserId
            : "";
    const userFilterOptions = useMemo(() => {
        const base = [
            { value: "", label: "All Users" },
            ...crmUsers.map((u) => ({
                value: String(u.id),
                label: u.label,
            })),
        ];
        return base;
    }, [crmUsers]);
    const currentStatusFilters = isFranchise ? FRANCHISE_FILTERS : NON_FRANCHISE_FILTERS;

    useEffect(() => {
        if (selectedUserId === "unassigned") {
            setSelectedUserId("");
        }
    }, [selectedUserId]);

    useEffect(() => {
        if (!isCampaignOnlyUser && !isAgencyUser) return;
        // Hard lock campaign-only → Paid Campaign; agency → landing + Facebook/Meta.
        if (isCampaignOnlyUser && selectedSource !== "campaign") {
            setSelectedSource("campaign");
        }
        if (isAgencyUser && selectedSource !== "landing") {
            // Keep a stable non-editable source label in UI filters; API uses `agency`.
            setSelectedSource("landing");
        }
        if (selectedCampaignChannel !== "") {
            setSelectedCampaignChannel("");
        setSelectedUtmCampaign("");
        setSelectedUtmMedium("");
        }
        if (selectedUserId !== "") {
            setSelectedUserId("");
        }
    }, [isCampaignOnlyUser, isAgencyUser, selectedSource, selectedCampaignChannel, selectedUserId]);

    const resetOnLeadChange = () => {
        setSelectedStatus("all");
        if (view === "reports") {
            setReportsFiltersApplied(false);
            setSelectedState([]);
            setSelectedCity([]);
            setSelectedCentre([]);
            setFilterDateRange({ startDate: null, endDate: null });
            setDateRange({ startDate: null, endDate: null });
        }
    };

    const handleLeadTypeChange = (leadType: LeadType) => {
        // Franchise and Admission sub-filters default to All
        const defaultSub: SubFilter = "";
        const next = sourceFromLeadTypeAndSub(leadType, defaultSub);
        setSelectedSource(next);
        setSelectedCampaignChannel("");
        setSelectedUtmCampaign("");
        setSelectedUtmMedium("");
        setSelectedState([]);
        setSelectedCity([]);
        setSelectedCentre([]);
        resetOnLeadChange();
    };

    const handleSubFilterChange = (sub: SubFilter) => {
        const next = sourceFromLeadTypeAndSub(selectedLeadType, sub);
        const wasFranchiseLpGeo = isFranchiseLpGeoChannel(selectedCampaignChannel);
        setSelectedSource(next);
        if (next !== "campaign" && next !== "others" && next !== "admission_others") {
            setSelectedCampaignChannel("");
            setSelectedUtmCampaign("");
            setSelectedUtmMedium("");
            if (wasFranchiseLpGeo) {
                setSelectedState([]);
                setSelectedCity([]);
                setSelectedCentre([]);
            }
        } else {
            setSelectedCampaignChannel("");
            setSelectedUtmCampaign("");
            setSelectedUtmMedium("");
        }
        resetOnLeadChange();
    };

    const usersApiPipeline =
        selectedLeadType === "franchise" ? "franchise" : selectedLeadType === "admission" ? "admission" : "";

    const appendLeadQueryParams = (params: URLSearchParams, opts?: { includeDates?: boolean }) => {
        const includeDates = opts?.includeDates ?? true;
        if (includeDates && dateRange.startDate) {
            const start = new Date(dateRange.startDate);
            start.setHours(0, 0, 0, 0);
            params.append("startDate", start.toISOString());
        }
        if (includeDates && dateRange.endDate) {
            const end = new Date(dateRange.endDate);
            end.setHours(23, 59, 59, 999);
            params.append("endDate", end.toISOString());
        }
        if (selectedCity.length > 0) params.append("city", selectedCity.join(","));
        if (selectedState.length > 0) params.append("state", selectedState.join(","));
        if (activeCentreIds.length > 0) params.append("centreId", activeCentreIds.join(","));
        if (apiSource) params.append("source", apiSource);
        if (apiStatus) params.append("status", apiStatus);
        if (selectedUtmCampaign) params.append("campaign", selectedUtmCampaign);
        if (selectedUtmMedium) params.append("medium", selectedUtmMedium);
        if (selectedUserId) params.append("userId", selectedUserId);
    };

    useEffect(() => {
        if (!isCampaignView || !filtersReady) {
            setCampaignOptions([]);
            return;
        }
        let cancelled = false;
        const params = new URLSearchParams();
        if (apiSource) params.set("source", apiSource);
        if (selectedState.length > 0) params.set("state", selectedState.join(","));
        if (selectedCity.length > 0) params.set("city", selectedCity.join(","));
        crmApi
            .get(`/campaigns?${params.toString()}`)
            .then((res) => {
                if (cancelled) return;
                const list = Array.isArray(res.data?.campaigns) ? res.data.campaigns : [];
                setCampaignOptions(list.map((name: string) => ({ value: name, label: name })));
            })
            .catch(() => {
                if (!cancelled) setCampaignOptions([]);
            });
        return () => {
            cancelled = true;
        };
    }, [isCampaignView, filtersReady, apiSource, selectedState, selectedCity]);

    useEffect(() => {
        if (!selectedUtmCampaign) return;
        const stillValid = campaignOptions.some((o) => o.value === selectedUtmCampaign);
        if (!stillValid) setSelectedUtmCampaign("");
    }, [campaignOptions, selectedUtmCampaign]);

    useEffect(() => {
        if (!isCampaignView || !filtersReady) {
            setMediumOptions([]);
            return;
        }
        let cancelled = false;
        const params = new URLSearchParams();
        if (apiSource) params.set("source", apiSource);
        if (selectedState.length > 0) params.set("state", selectedState.join(","));
        if (selectedCity.length > 0) params.set("city", selectedCity.join(","));
        if (selectedUtmCampaign) params.set("campaign", selectedUtmCampaign);
        crmApi
            .get(`/mediums?${params.toString()}`)
            .then((res) => {
                if (cancelled) return;
                const list = Array.isArray(res.data?.mediums) ? res.data.mediums : [];
                setMediumOptions(list.map((name: string) => ({ value: name, label: name })));
            })
            .catch(() => {
                if (!cancelled) setMediumOptions([]);
            });
        return () => {
            cancelled = true;
        };
    }, [isCampaignView, filtersReady, apiSource, selectedState, selectedCity, selectedUtmCampaign]);

    useEffect(() => {
        if (!selectedUtmMedium) return;
        const stillValid = mediumOptions.some((o) => o.value === selectedUtmMedium);
        if (!stillValid) setSelectedUtmMedium("");
    }, [mediumOptions, selectedUtmMedium]);

    useEffect(() => {
        if (!isCrmUser || isRestrictedViewer) return;
        let cancelled = false;
        const params = new URLSearchParams();
        params.set("forAssign", "1");
        if (usersApiPipeline) params.set("pipeline", usersApiPipeline);
        if (selectedState.length > 0) params.set("state", selectedState.join(","));
        if (selectedCity.length > 0) params.set("city", selectedCity.join(","));
        crmApi
            .get(`/users?${params.toString()}`)
            .then((res) => {
                if (cancelled) return;
                const list = Array.isArray(res.data?.users) ? res.data.users : [];
                setCrmUsers(
                    list.map((u: { id: number; label: string; fullName?: string }) => ({
                        id: u.id,
                        label: u.label || u.fullName || `User ${u.id}`,
                    })),
                );
            })
            .catch(() => {
                if (!cancelled) setCrmUsers([]);
            });
        return () => {
            cancelled = true;
        };
    }, [isCrmUser, isRestrictedViewer, usersApiPipeline, selectedState, selectedCity]);

    useEffect(() => {
        if (!selectedUserId) return;
        const stillValid = crmUsers.some((u) => String(u.id) === selectedUserId);
        if (!stillValid) {
            setSelectedUserId("");
        }
    }, [crmUsers, selectedUserId]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/crm-admin/login?next=/crm-admin");
        }
    }, [authLoading, router, user]);

    useEffect(() => {
        if (!filtersReady || !isCrmUser) return;
        let cancelled = false;
        setStatsLoading(true);
        const params = new URLSearchParams();
        params.append("_t", Date.now().toString());
        appendLeadQueryParams(params);
        crmApi
            .get(`/leads/dashboard?${params.toString()}`)
            .then((res) => {
                if (!cancelled) setStats(res.data);
            })
            .catch((err) => {
                if (!cancelled) console.error("Failed to load dashboard:", err);
            })
            .finally(() => {
                if (!cancelled) setStatsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [filtersReady, isCrmUser, dateRange, selectedCity, selectedState, activeCentreIds, apiSource, apiStatus, selectedUtmCampaign, selectedUtmMedium, selectedUserId]);

    const fetchStats = () => {
        setStatsLoading(true);
        const params = new URLSearchParams();
        appendLeadQueryParams(params);
        crmApi
            .get(`/leads/dashboard?${params.toString()}`)
            .then((res) => setStats(res.data))
            .catch((err) => console.error("Failed to load dashboard:", err))
            .finally(() => setStatsLoading(false));
    };

    const handleApplyFilters = () => {
        if (view === 'reports') {
            // Empty state/city means All — allowed; lead type defaults to All
            if (!filterDateRange.startDate || !filterDateRange.endDate) {
                toast.error("Please select a complete Date Range before generating the report.");
                return;
            }
        }
        setDateRange(filterDateRange);
        setReportsFiltersApplied(true);
    };

    const silentRefreshStats = () => {
        const params = new URLSearchParams();
        appendLeadQueryParams(params);
        crmApi
            .get(`/leads/dashboard?${params.toString()}`)
            .then((res) => setStats(res.data))
            .catch((err) => console.error("Failed to silent refresh stats:", err));
    };

    const handleRefresh = () => {
        setRefreshKey((k) => k + 1);
        fetchStats();
    };

    const handleDownload = async () => {
        try {
            const params = new URLSearchParams();
            params.append("limit", "10000");
            // Same filters as the on-screen leads list (incl. state + userId).
            appendLeadQueryParams(params);
            const response = await crmApi.get(`/leads?${params.toString()}`);
            const leads = response.data?.leads || [];
            if (leads.length === 0) {
                alert("No leads to download.");
                return;
            }
            const headers = [
                "Name",
                "Mobile",
                "Email",
                "City",
                "State",
                "Preferred Location",
                "Channel",
                "Source",
                "Medium",
                "Campaign",
                "Content",
                "Status",
                "Created At",
            ];
            const escape = (v: string) => `"${String(v || "").replace(/"/g, '""')}"`;
            const rows = leads.map((l: any) => {
                const values = [
                    l.fullName || "",
                    l.mobile || "",
                    l.email || "",
                    l.city || "",
                    l.state || "",
                    l.preferredCentreLocation || "",
                    l.source || "",
                    l.utmSource || "",
                    l.utmMedium || "",
                    l.utmCampaign || l.campaign || "",
                    l.utmContent || "",
                    l.status || "",
                    l.createdAt ? new Date(l.createdAt).toLocaleString() : "",
                ];
                return values.map((v) => escape(String(v))).join(",");
            });
            const csv = [headers.map(escape).join(","), ...rows].join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Download failed. Please try again.");
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/crm-admin/login");
    };

    if (authLoading || !user || !filtersReady) {
        return <AccessLoading />;
    }

    if (isExternalCampaignViewer && view === "reports") {
        return <AccessLoading />;
    }

    if (!isCrmUser) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-xl font-bold text-gray-900">CRM access only</h1>
                    <p className="mt-2 text-sm text-gray-600">Please sign in with a CRM account.</p>
                    <button
                        type="button"
                        onClick={() => router.replace("/crm-admin/login")}
                        className="btn-primary mt-5 !py-2 !px-4 text-sm"
                    >
                        Sign in as CRM
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />
            <header className="border-b bg-white shadow-sm sticky top-0 z-30">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-4">
                        <button
                            type="button"
                            onClick={hardRefreshCrmDashboard}
                            className="flex items-center gap-2.5 bg-transparent border-0 p-0 cursor-pointer hover:opacity-80"
                            title="Refresh CRM dashboard"
                        >
                            <img
                                src="/time-kids-logo-new.png"
                                alt="T.I.M.E. Kids Logo"
                                className="md:hidden h-8 w-auto object-contain"
                            />
                            <h1 className="flex items-center gap-2 text-lg md:text-2xl font-bold text-gray-800">
                                {getHeaderTitle()}
                            </h1>
                        </button>
                        <div className="hidden md:flex items-center gap-4">
                            {user.crmRegion ? (
                                <span className="rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-700">
                                    {user.crmRegion.replace("_", " ")}
                                </span>
                            ) : user.crmZone ? (
                                <span className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
                                    {user.crmZone} Zone
                                </span>
                            ) : (
                                <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                                    All Zones
                                </span>
                            )}
                            <span className="text-sm text-gray-600">Welcome, {user.fullName || user.email}</span>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 rounded-xl bg-white p-6 shadow-lg">
                    <div className="flex flex-col gap-3">

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap items-end gap-3 w-full pb-2">
                            {!isRestrictedViewer && (
                                <div className="flex-1 min-w-[140px] w-full">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Lead Source</label>
                                     <SearchableSelect
                                        value={selectedLeadType}
                                        onChange={(val) => handleLeadTypeChange(val as LeadType)}
                                        options={LEAD_TYPE_OPTIONS.map((f) => ({ value: f.id, label: f.label }))}
                                        placeholder="Select Type"
                                    />
                                </div>
                            )}

                            {!isRestrictedViewer && (selectedLeadType === "franchise" || selectedLeadType === "admission") && (
                                <div className="flex-1 min-w-[140px] w-full">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Lead Source</label>
                                    <SearchableSelect
                                        key={`sub-${selectedLeadType}`}
                                        value={selectedSubFilter}
                                        onChange={(val) => handleSubFilterChange(val as SubFilter)}
                                        options={(selectedLeadType === "franchise" ? FRANCHISE_SUB_FILTERS : ADMISSION_SUB_FILTERS).map(
                                            (f) => ({ value: f.id, label: f.label }),
                                        )}
                                        placeholder="All"
                                    />
                                </div>
                            )}

                            {isCampaignView && !isRestrictedViewer && (
                                <div className="flex-1 min-w-[140px]">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Select Channel</label>
                                    <SearchableSelect
                                        value={selectedCampaignChannel}
                                        onChange={(val) => {
                                            const next = val as CampaignChannelFilter;
                                            const wasFranchiseLpGeo = isFranchiseLpGeoChannel(selectedCampaignChannel);
                                            const nextFranchiseLpGeo = isFranchiseLpGeoChannel(next);
                                            setSelectedCampaignChannel(next);
                                            setSelectedUtmCampaign("");
                                            setSelectedUtmMedium("");
                                            if (wasFranchiseLpGeo !== nextFranchiseLpGeo) {
                                                setSelectedState([]);
                                                setSelectedCity([]);
                                                setSelectedCentre([]);
                                            }
                                            if (view === "reports") setReportsFiltersApplied(false);
                                        }}
                                        options={CAMPAIGN_CHANNEL_FILTERS.map(f => ({ value: f.id, label: f.label }))}
                                        placeholder="All Channels"
                                    />
                                </div>
                            )}

                            {isCampaignView && !isRestrictedViewer && (
                                <div className="flex-1 min-w-[160px]">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Select Campaign</label>
                                    <SearchableSelect
                                        value={selectedUtmCampaign}
                                        onChange={(val) => {
                                            setSelectedUtmCampaign(val || "");
                                            if (view === "reports") setReportsFiltersApplied(false);
                                        }}
                                        options={[
                                            { value: "", label: "All Campaigns" },
                                            ...campaignOptions,
                                        ]}
                                        placeholder="All Campaigns"
                                    />
                                </div>
                            )}

                            {isCampaignView && !isRestrictedViewer && view !== "reports" && (
                                <div className="flex-1 min-w-[160px]">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Medium</label>
                                    <SearchableSelect
                                        value={selectedUtmMedium}
                                        onChange={(val) => {
                                            setSelectedUtmMedium(val || "");
                                        }}
                                        options={[
                                            { value: "", label: "All" },
                                            ...mediumOptions,
                                        ]}
                                        placeholder="All"
                                    />
                                </div>
                            )}

                            {isOthersView && (
                                <div className="flex-1 min-w-[140px]">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Select Channel</label>
                                    <SearchableSelect
                                        key={`others-channel-${selectedSource}`}
                                        value={selectedCampaignChannel}
                                        onChange={(val) => {
                                            setSelectedCampaignChannel((val || "") as OthersChannelFilter);
                                            if (view === "reports") setReportsFiltersApplied(false);
                                        }}
                                        options={othersChannelFilters.map((f) => ({ value: f.id, label: f.label }))}
                                        placeholder="All Channels"
                                    />
                                </div>
                            )}

                            {view !== 'reports' && (
                                <div className="flex-1 min-w-[140px]">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Select Status</label>
                                    <SearchableSelect
                                        key={`status-${selectedSource}`}
                                        value={selectedStatus || "all"}
                                        onChange={(val) => setSelectedStatus((val || "all") as StatusFilter)}
                                        options={currentStatusFilters.map(f => ({ value: f.id, label: f.label }))}
                                        placeholder="All Status"
                                    />
                                </div>
                            )}

                            {!isRestrictedViewer && (
                                <div className="flex-1 min-w-[140px]">
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">Select User</label>
                                        <SearchableSelect
                                            value={selectedUserId}
                                            onChange={(val) => {
                                                setSelectedUserId(val || "");
                                                // User territory drives state/city options — reset geo filters.
                                                setSelectedState([]);
                                                setSelectedCity([]);
                                                setSelectedCentre([]);
                                                if (view === "reports") setReportsFiltersApplied(false);
                                            }}
                                            options={userFilterOptions}
                                            placeholder="All Users"
                                        />
                                    </div>
                            )}

                            <>
                                    <StateSelector
                                        key={`states-${geoScope}-${geoUserId}`}
                                        value={selectedState}
                                        onChange={handleStateChange}
                                        scope={geoScope}
                                        userId={geoUserId}
                                    />
                                    <CitySelector
                                        key={`cities-${geoScope}-${geoUserId}-${selectedState.join("|")}`}
                                        value={selectedCity}
                                        onChange={handleCityChange}
                                        state={selectedState.join(",")}
                                        scope={geoScope}
                                        userId={geoUserId}
                                    />
                                    {showCentreSelector && (
                                        <CentreSelector
                                            key={`centres-${geoUserId}-${selectedCity.join('|')}-${selectedState.join('|')}`}
                                            cities={selectedCity}
                                            states={selectedState}
                                            value={selectedCentre}
                                            userId={geoUserId}
                                            onChange={(val) => {
                                                setSelectedCentre(val);
                                                if (view === "reports") setReportsFiltersApplied(false);
                                            }}
                                        />
                                    )}
                                    <DateRangePicker
                                        startDate={filterDateRange.startDate}
                                        endDate={filterDateRange.endDate}
                                        onChange={(start, end) => {
                                            setFilterDateRange({ startDate: start, endDate: end });
                                            if (view === 'reports') {
                                                setReportsFiltersApplied(false);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyFilters}
                                        className="btn-primary flex h-[42px] items-center justify-center whitespace-nowrap !py-0 px-6 w-full lg:w-auto self-end"
                                    >
                                        {view === 'reports' ? 'Generate' : 'Apply Filters'}
                                    </button>
                                    
                                    {view === 'reports' && reportsFiltersApplied && (
                                        <button
                                            type="button"
                                            onClick={handleDownload}
                                            className="btn-secondary flex h-[42px] items-center justify-center whitespace-nowrap !py-0 px-6 gap-2 w-full lg:w-auto"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download CSV
                                        </button>
                                    )}
                                </>
                        </div>
                    </div>
                </div>

                <>
                        {(view === 'dashboard' || view === 'all') && (
                            <>
                                {statsLoading && !stats ? (
                            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="animate-pulse rounded-xl bg-white p-6 shadow">
                                        <div className="mb-4 h-4 w-1/2 rounded bg-gray-200" />
                                        <div className="h-8 w-16 rounded bg-gray-200" />
                                    </div>
                                ))}
                            </div>
                        ) : stats ? (
                            <DashboardStats stats={stats} />
                        ) : null}

                        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <RemindersWidget
                                key={refreshKey}
                                source={apiSource}
                                city={selectedCity.join(",")}
                                state={selectedState.join(",")}
                                userId={selectedUserId}
                                centreId={activeCentreIds.join(",")}
                                returnHref={returnHref}
                                onBeforeNavigate={persistFiltersNow}
                            />

                            {statsLoading && !stats ? (
                                <>
                                    <div className="flex items-center justify-center py-12 text-gray-500">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                    </div>
                                    <div className="flex items-center justify-center py-12 text-gray-500">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                    </div>
                                </>
                            ) : stats ? (
                                <Suspense
                                    fallback={
                                        <>
                                            <div className="flex justify-center py-12">
                                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                            </div>
                                            <div className="flex justify-center py-12">
                                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                            </div>
                                        </>
                                    }
                                >
                                    <LeadSourceChart
                                        data={stats.sourceBreakdown}
                                        meetingFixed={Number(stats.meetingFixed) || 0}
                                        meetingDone={Number(stats.meetingDone) || 0}
                                        showMeetings
                                    />
                                    <ConversionFunnel
                                        data={stats.statusBreakdown}
                                        funnelMode={
                                            isFranchise
                                                ? "franchise"
                                                : selectedLeadType === "admission"
                                                  ? "admission"
                                                  : "all"
                                        }
                                    />
                                </Suspense>
                            ) : null}
                        </div>
                            </>
                        )}

                        {(view === 'reports' || view === 'all') && (
                            view === 'reports' ? (
                                reportsFiltersApplied ? (
                                    <ReportsView
                                        dateRange={dateRange}
                                        city={selectedCity}
                                        state={selectedState}
                                        source={apiSource || selectedSource}
                                        campaign={selectedUtmCampaign}
                                        userId={selectedUserId}
                                        centreId={activeCentreIds.join(",")}
                                    />
                                ) : (
                                    <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
                                        <p className="text-sm text-gray-500">
                                            Set filters and click Generate to view the report.
                                        </p>
                                    </div>
                                )
                            ) : (
                                <LeadsTable
                                    key={`${refreshKey}-${apiSource}-${apiStatus}-${selectedUtmCampaign}-${selectedUtmMedium}-${selectedUserId}-${selectedCity}-${activeCentreIds.join(",")}-${selectedState.join(",")}`}
                                    dateRange={dateRange}
                                    city={selectedCity.join(",")}
                                    state={selectedState.join(",")}
                                    centreId={activeCentreIds.join(",")}
                                    source={apiSource}
                                    campaign={selectedUtmCampaign}
                                    medium={selectedUtmMedium}
                                    status={apiStatus}
                                    userId={selectedUserId}
                                    returnHref={returnHref}
                                    onBeforeNavigate={persistFiltersNow}
                                    onLeadUpdated={silentRefreshStats}
                                    hideContact={isExternalCampaignViewer}
                                    campaignViewer={isExternalCampaignViewer}
                                    title={
                                        isAgencyUser
                                            ? `${agencyViewerLabel(user?.email)} Leads`
                                            : selectedSource === "all"
                                            ? "All Leads"
                                            : selectedSource === "campaign"
                                              ? selectedCampaignChannel
                                                  ? selectedUtmCampaign
                                                      ? `Paid Campaign — ${CAMPAIGN_CHANNEL_FILTERS.find((c) => c.id === selectedCampaignChannel)?.label ?? ""} — ${selectedUtmCampaign}`
                                                      : `Paid Campaign — ${CAMPAIGN_CHANNEL_FILTERS.find((c) => c.id === selectedCampaignChannel)?.label ?? ""}`
                                                  : selectedUtmCampaign
                                                    ? `Paid Campaign — ${selectedUtmCampaign}`
                                                    : "Paid Campaign"
                                              : selectedSource === "others" || selectedSource === "admission_others"
                                                ? selectedCampaignChannel
                                                    ? `Others — ${othersChannelFilters.find((c) => c.id === selectedCampaignChannel)?.label ?? ""}`
                                                    : "Others"
                                                : `${SOURCE_LABELS[selectedSource]} Leads`
                                    }
                                />
                            )
                        )}
                </>
            </div>
        </div>
    );
}

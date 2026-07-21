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
    datesFromSnapshot,
    hardRefreshCrmDashboard,
    loadCrmDashboardFilters,
    saveCrmDashboardFilters,
    snapshotFromSearchParams,
    type CrmDashboardFiltersSnapshot,
} from "@/lib/crmDashboardFilters";
import DashboardStats from "@/components/crm/admin/DashboardStats";
import LeadsTable from "@/components/crm/admin/LeadsTable";
import DateRangePicker from "@/components/crm/admin/DateRangePicker";
import CitySelector from "@/components/crm/admin/CitySelector";
import StateSelector from "@/components/crm/admin/StateSelector";
import CentreSelector from "@/components/crm/admin/CentreSelector";
import { SearchableSelect } from "@/components/crm/SearchableSelect";
import RemindersWidget from "@/components/crm/admin/RemindersWidget";
import LandingLeadsReport from "@/components/leads/LandingLeadsReport";
import ReportsView from "@/components/crm/admin/ReportsView";

const LeadSourceChart = lazy(() => import("@/components/crm/admin/LeadSourceChart"));
const ConversionFunnel = lazy(() => import("@/components/crm/admin/ConversionFunnel"));

type SourceFilter = "" | "admission" | "contact" | "landing" | "campaign" | "franchise" | "all";
type CampaignChannelFilter = "" | "website" | "facebook" | "instagram" | "july_lp" | "july_meta" | "lp_wb";
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

function apiSourceParam(source: SourceFilter, channel: CampaignChannelFilter): string {
    if (source === "campaign") return channel || "campaign";
    if (source === "all") return "";
    return source;
}

function apiStatusParam(status: StatusFilter): string {
    if (!status || status === "all") return "";
    return status;
}

const SOURCE_FILTERS: { id: SourceFilter; label: string; active: string; idle: string }[] = [
    { id: "all", label: "All", active: "border-gray-800 bg-gray-800 text-white", idle: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100" },
    { id: "admission", label: "Admission", active: "border-blue-700 bg-blue-700 text-white", idle: "border-blue-100 bg-blue-50 text-blue-800 hover:bg-blue-100" },
    { id: "contact", label: "CenterPage", active: "border-sky-600 bg-sky-600 text-white", idle: "border-sky-100 bg-sky-50 text-sky-800 hover:bg-sky-100" },
    { id: "campaign", label: "Campaign", active: "border-violet-600 bg-violet-600 text-white", idle: "border-violet-100 bg-violet-50 text-violet-800 hover:bg-violet-100" },
    { id: "franchise", label: "Franchise", active: "border-orange-600 bg-orange-600 text-white", idle: "border-orange-100 bg-orange-50 text-orange-800 hover:bg-orange-100" },
    { id: "landing", label: "Landing", active: "border-teal-600 bg-teal-600 text-white", idle: "border-teal-100 bg-teal-50 text-teal-800 hover:bg-teal-100" },
];

const CAMPAIGN_CHANNEL_FILTERS: { id: CampaignChannelFilter; label: string }[] = [
    { id: "", label: "All Channels" },
    { id: "website", label: "Website" },
    { id: "facebook", label: "Facebook" },
    { id: "instagram", label: "Instagram" },
    { id: "july_lp", label: "Landingpage July" },
    { id: "july_meta", label: "Meta July" },
    { id: "lp_wb", label: "Landingpage-WB" },
];

const FRANCHISE_CAMPAIGN_CHANNELS: CampaignChannelFilter[] = ["july_lp", "july_meta", "lp_wb"];

function isFranchiseCampaignChannel(channel: CampaignChannelFilter): boolean {
    return FRANCHISE_CAMPAIGN_CHANNELS.includes(channel);
}

const NON_FRANCHISE_FILTERS: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All Status" },
    { id: "untouched", label: "Untouched" },
    { id: "not_answering", label: "Not answering" },
    { id: "follow_up", label: "Follow-up" },
    { id: "visited_school", label: "Visited the school" },
    { id: "converted_admission", label: "Converted to Admission" },
    { id: "joined_competition", label: "Joined competition" },
    { id: "not_interested", label: "Not Interested" },
    { id: "wrong_enquiry", label: "Wrong enquiry" },
];

const FRANCHISE_FILTERS: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All Status" },
    { id: "untouched", label: "Untouched" },
    { id: "hot", label: "Hot" },
    { id: "warm", label: "Warm" },
    { id: "follow_up", label: "Follow-up" },
    { id: "cold", label: "Cold" },
    { id: "converted_mou_signed", label: "Converted – MOU Signed" },
    { id: "converted_agreement_signed", label: "Converted – Agreement Signed" },
    { id: "join_later", label: "Join Later" },
    { id: "not_interested", label: "Not Interested" },
    { id: "not_answering_calls", label: "Not Answering Calls" },
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
    const [selectedCampaignChannel, setSelectedCampaignChannel] = useState<CampaignChannelFilter>("");
    const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
    const [refreshKey, setRefreshKey] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);
    const [reportsFiltersApplied, setReportsFiltersApplied] = useState(false);
    const snapshotRef = useRef<CrmDashboardFiltersSnapshot | null>(null);

    const isCrmUser = normalizeRole(user?.role) === "crm";
    const returnPath = view === "reports" ? "/crm-admin/reports" : "/crm-admin";

    const applySnapshot = (saved: CrmDashboardFiltersSnapshot) => {
        const { filterDateRange: savedFilter, dateRange: savedApplied } = datesFromSnapshot(saved);
        setSelectedCity(Array.isArray(saved.selectedCity) ? saved.selectedCity : []);
        setSelectedState(Array.isArray(saved.selectedState) ? saved.selectedState : []);
        setSelectedCentre(Array.isArray(saved.selectedCentre) ? saved.selectedCentre : []);
        setSelectedSource((saved.selectedSource as SourceFilter) || "all");
        setSelectedCampaignChannel((saved.selectedCampaignChannel as CampaignChannelFilter) || "");
        const restoredStatus = (saved.selectedStatus as StatusFilter) || "all";
        setSelectedStatus(restoredStatus);
        setFilterDateRange(savedFilter);
        setDateRange(savedApplied);
        setReportsFiltersApplied(Boolean(saved.reportsFiltersApplied));
    };

    useEffect(() => {
        const fromUrl =
            typeof window !== "undefined"
                ? snapshotFromSearchParams(new URLSearchParams(window.location.search))
                : null;
        const saved = fromUrl || loadCrmDashboardFilters();
        if (saved) {
            applySnapshot({ ...saved, returnPath });
        }
        setFiltersReady(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once on mount
    }, []);

    const currentSnapshot: CrmDashboardFiltersSnapshot = useMemo(
        () => ({
            returnPath,
            selectedCity,
            selectedState,
            selectedCentre,
            selectedSource,
            selectedCampaignChannel,
            selectedStatus,
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
            selectedStatus,
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
        const sourceObj = SOURCE_FILTERS.find((f) => f.id === selectedSource);
        const label = sourceObj && sourceObj.id !== "" ? sourceObj.label : "";
        if (view === "reports") {
            return label ? `${label} Reports` : "Reports";
        }
        return label ? `${label} Dashboard` : "Admin Dashboard";
    };

    const handleCityChange = (city: string[]) => {
        setSelectedCity(city);
        // Centre filter only works for a single city
        setSelectedCentre([]);
        if (view === 'reports') {
            setReportsFiltersApplied(false);
        }
    };

    const handleStateChange = (state: string[]) => {
        setSelectedState(state);
        setSelectedCity([]);
        setSelectedCentre([]);
        if (view === 'reports') {
            setReportsFiltersApplied(false);
        }
    };

    const isLandingView = selectedSource === "landing";
    const isCampaignView = selectedSource === "campaign";
    const isFranchiseCampaignView = isFranchiseCampaignChannel(selectedCampaignChannel);
    const isFranchise = selectedSource === "franchise" || isFranchiseCampaignView;
    const apiSource = apiSourceParam(selectedSource, selectedCampaignChannel);
    const apiStatus = apiStatusParam(selectedStatus);
    const usesFranchiseLpGeo = isFranchiseCampaignView;
    const hidesCentreForCampaignChannel = isFranchiseCampaignView;
    const geoScope = usesFranchiseLpGeo ? "franchise-lp" : "default";
    const currentStatusFilters = isFranchise ? FRANCHISE_FILTERS : NON_FRANCHISE_FILTERS;

    const handleSourceChange = (source: SourceFilter) => {
        setSelectedSource(source);
        if (source !== "campaign") {
            setSelectedCampaignChannel("");
        }

        // Always reset to All Status when lead type changes
        setSelectedStatus("all");
        
        // Reset reports filter application state on source change
        if (view === 'reports') {
            setReportsFiltersApplied(false);
            setSelectedState([]);
            setSelectedCity([]);
            setSelectedCentre([]);
            setFilterDateRange({ startDate: null, endDate: null });
            setDateRange({ startDate: null, endDate: null });
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/crm-admin/login?next=/crm-admin");
        }
    }, [authLoading, router, user]);

    useEffect(() => {
        if (!filtersReady || !isCrmUser || isLandingView) return;
        let cancelled = false;
        setStatsLoading(true);
        const params = new URLSearchParams();
        params.append("_t", Date.now().toString());
        if (dateRange.startDate) {
            const start = new Date(dateRange.startDate);
            start.setHours(0, 0, 0, 0);
            params.append("startDate", start.toISOString());
        }
        if (dateRange.endDate) {
            const end = new Date(dateRange.endDate);
            end.setHours(23, 59, 59, 999);
            params.append("endDate", end.toISOString());
        }
        if (selectedCity.length > 0) params.append("city", selectedCity.join(","));
        if (selectedState.length > 0) params.append("state", selectedState.join(","));
        if (selectedCentre.length > 0) params.append("centreId", selectedCentre.join(","));
        if (apiSource) params.append("source", apiSource);
        if (apiStatus) params.append("status", apiStatus);
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
    }, [filtersReady, isCrmUser, isLandingView, dateRange, selectedCity, selectedState, selectedCentre, apiSource, apiStatus]);

    const fetchStats = () => {
        setStatsLoading(true);
        const params = new URLSearchParams();
        if (dateRange.startDate) {
            const start = new Date(dateRange.startDate);
            start.setHours(0, 0, 0, 0);
            params.append("startDate", start.toISOString());
        }
        if (dateRange.endDate) {
            const end = new Date(dateRange.endDate);
            end.setHours(23, 59, 59, 999);
            params.append("endDate", end.toISOString());
        }
        if (selectedCity.length > 0) params.append("city", selectedCity.join(","));
        if (selectedState.length > 0) params.append("state", selectedState.join(","));
        if (selectedCentre.length > 0) params.append("centreId", selectedCentre.join(","));
        if (apiSource) params.append("source", apiSource);
        if (apiStatus) params.append("status", apiStatus);
        crmApi
            .get(`/leads/dashboard?${params.toString()}`)
            .then((res) => setStats(res.data))
            .catch((err) => console.error("Failed to load dashboard:", err))
            .finally(() => setStatsLoading(false));
    };

    const handleApplyFilters = () => {
        if (view === 'reports') {
            if (!selectedSource) {
                toast.error("Please select a Lead Type first.");
                return;
            }
            // Empty state/city means All — allowed
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
        if (dateRange.startDate) {
            const start = new Date(dateRange.startDate);
            start.setHours(0, 0, 0, 0);
            params.append("startDate", start.toISOString());
        }
        if (dateRange.endDate) {
            const end = new Date(dateRange.endDate);
            end.setHours(23, 59, 59, 999);
            params.append("endDate", end.toISOString());
        }
        if (selectedCity.length > 0) params.append("city", selectedCity.join(","));
        if (selectedState.length > 0) params.append("state", selectedState.join(","));
        if (selectedCentre.length > 0) params.append("centreId", selectedCentre.join(","));
        if (apiSource) params.append("source", apiSource);
        if (apiStatus) params.append("status", apiStatus);
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
            if (dateRange.startDate) {
                const start = new Date(dateRange.startDate);
                start.setHours(0, 0, 0, 0);
                params.append("startDate", start.toISOString());
            }
            if (dateRange.endDate) {
                const end = new Date(dateRange.endDate);
                end.setHours(23, 59, 59, 999);
                params.append("endDate", end.toISOString());
            }
            if (selectedCity.length > 0) params.append("city", selectedCity.join(","));
            if (selectedCentre.length > 0) params.append("centreId", selectedCentre.join(","));
            if (apiSource) params.append("source", apiSource);
            if (apiStatus) params.append("status", apiStatus);
            const response = await crmApi.get(`/leads?${params.toString()}`);
            const leads = response.data?.leads || [];
            if (leads.length === 0) {
                alert("No leads to download.");
                return;
            }
            const headers = ["Name", "Mobile", "Email", "City", "State", "Preferred Location", "Source", "Status", "Created At"];
            const escape = (v: string) => `"${String(v || "").replace(/"/g, '""')}"`;
            const rows = leads.map((l: any) =>
                headers
                    .map((h, i) => {
                        const key = [
                            "fullName",
                            "mobile",
                            "email",
                            "city",
                            "state",
                            "preferredCentreLocation",
                            "source",
                            "status",
                            "createdAt",
                        ][i];
                        const val = l[key];
                        return escape(typeof val === "string" ? val : val ? new Date(val).toLocaleString() : "");
                    })
                    .join(","),
            );
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
                            <div className="flex-1 min-w-[140px] w-full">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Select Lead Type</label>
                                 <SearchableSelect
                                    value={selectedSource}
                                    onChange={(val) => handleSourceChange(val as any)}
                                    options={SOURCE_FILTERS.map(f => ({ value: f.id, label: f.label }))}
                                    placeholder="Select Type"
                                />
                            </div>

                            {isCampaignView && (
                                <div className="flex-1 min-w-[140px]">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Select Channel</label>
                                    <SearchableSelect
                                        value={selectedCampaignChannel}
                                        onChange={(val) => {
                                            const next = val as CampaignChannelFilter;
                                            const wasFranchiseLpGeo = isFranchiseCampaignChannel(selectedCampaignChannel);
                                            const nextFranchiseLpGeo = isFranchiseCampaignChannel(next);
                                            setSelectedCampaignChannel(next);
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

                            {!isLandingView && view !== 'reports' && (
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

                            {!isLandingView && (
                                <>
                                    <StateSelector
                                        key={`states-${geoScope}`}
                                        value={selectedState}
                                        onChange={handleStateChange}
                                        scope={geoScope}
                                    />
                                    <CitySelector
                                        key={`cities-${geoScope}-${selectedState.join("|")}`}
                                        value={selectedCity}
                                        onChange={handleCityChange}
                                        state={selectedState.join(",")}
                                        scope={geoScope}
                                    />
                                    {view !== 'reports' && selectedSource !== "franchise" && !hidesCentreForCampaignChannel && (
                                        <CentreSelector
                                            key={`centres-${selectedCity.join('|')}-${selectedState.join('|')}`}
                                            cities={selectedCity}
                                            states={selectedState}
                                            value={selectedCentre}
                                            onChange={setSelectedCentre}
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
                                            onClick={() => alert("CSV Download will be ready once the data is hooked up!")}
                                            className="btn-secondary flex h-[42px] items-center justify-center whitespace-nowrap !py-0 px-6 gap-2 w-full lg:w-auto"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download CSV
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {isLandingView ? (
                    <LandingLeadsReport title="Landing page leads" embedded basePath="/crm-admin/" />
                ) : (
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
                                centreId={selectedCentre.join(",")}
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
                                    <LeadSourceChart data={stats.sourceBreakdown} />
                                    <ConversionFunnel data={stats.statusBreakdown} isFranchise={isFranchise} />
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
                                    key={`${refreshKey}-${apiSource}-${apiStatus}-${selectedCity}-${selectedCentre.join(",")}-${selectedState.join(",")}`}
                                    dateRange={dateRange}
                                    city={selectedCity.join(",")}
                                    state={selectedState.join(",")}
                                    centreId={selectedCentre.join(",")}
                                    source={apiSource}
                                    status={apiStatus}
                                    returnHref={returnHref}
                                    onBeforeNavigate={persistFiltersNow}
                                    onLeadUpdated={silentRefreshStats}
                                    title={
                                        selectedSource === "campaign"
                                            ? selectedCampaignChannel
                                                ? `Campaign Enquiry — ${CAMPAIGN_CHANNEL_FILTERS.find((c) => c.id === selectedCampaignChannel)?.label ?? ""}`
                                                : "Campaign Enquiry"
                                            : selectedSource
                                              ? `${SOURCE_FILTERS.find((s) => s.id === selectedSource)?.label ?? "Filtered"} Leads`
                                              : "All Enquiry Reports"
                                    }
                                />
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

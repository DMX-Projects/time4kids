"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import api from "@/lib/crmApi";
import { ArrowDownUp, ChevronLeft, ChevronRight, Search, FileSpreadsheet, Download, Loader2 } from "lucide-react";

interface ReportsViewProps {
    dateRange: { startDate: Date | null; endDate: Date | null };
    city: string[];
    state: string[];
    source?: string;
    campaign?: string;
    medium?: string;
    /** Super-admin only: bcww | ants */
    agency?: string;
    /** Agency slug for scoped column view: bcww | ants */
    agencySlug?: "bcww" | "ants" | "";
    userId?: string;
    centreId?: string;
    isSuperAdmin?: boolean;
}

type SortKey = "city" | "total";
type SortDir = "asc" | "desc";

const NON_FRANCHISE_COLUMNS = [
    { label: "Untouched", keys: ["untouched", "new"] },
    { label: "Not Answering", keys: ["not_answering", "called", "contacted"] },
    { label: "Wrong Enquiry", keys: ["wrong_enquiry"] },
    { label: "Not Interested", keys: ["not_interested", "dropped"] },
    { label: "Follow Up", keys: ["follow_up"] },
    { label: "Joined Competition", keys: ["joined_competition"] },
    { label: "Visited School", keys: ["visited_school", "meeting_scheduled"] },
    { label: "Converted to Admission", keys: ["converted_admission", "converted"] },
];

const FRANCHISE_COLUMNS = [
    { label: "Untouched", keys: ["untouched"] },
    { label: "Not Answering Calls", keys: ["not_answering_calls"] },
    { label: "Follow Up", keys: ["follow_up", "interested"] },
    { label: "Join Later", keys: ["join_later"] },
    { label: "Cold", keys: ["cold"] },
    { label: "Warm", keys: ["warm"] },
    { label: "Hot", keys: ["hot"] },
    { label: "Not Interested", keys: ["not_interested"] },
    { label: "Wrong Enquiry", keys: ["wrong_enquiry"] },
    { label: "MOU", keys: ["converted_mou_signed"] },
    { label: "Agreement", keys: ["converted_agreement_signed"] },
];

const FRANCHISE_CAMPAIGN_SOURCES = new Set([
    "google",
    "july_lp",
    "july_meta",
    "lp_wb",
    "ants_meta",
    "youtube",
]);

const FRANCHISE_OTHERS_SOURCES = new Set([
    "whatsapp",
    "sms",
    "email",
    "franchise_referral",
    "franchise_friends_family",
]);

const ADMISSION_OTHERS_SOURCES = new Set([
    "admission_whatsapp",
    "admission_sms",
    "admission_email",
    "referral_parents",
    "referral_family_friends",
]);

const getCategoryColumns = (categoryId: string, source?: string) => {
    if (
        categoryId === "franchise" ||
        categoryId === "campaign" ||
        categoryId === "google" ||
        categoryId === "lp_wb" ||
        categoryId === "ants_meta" ||
        categoryId === "july_meta" ||
        categoryId === "youtube" ||
        FRANCHISE_OTHERS_SOURCES.has(categoryId)
    ) {
        return FRANCHISE_COLUMNS;
    }
    if (
        source &&
        (source === "campaign" ||
            source === "others" ||
            FRANCHISE_CAMPAIGN_SOURCES.has(source) ||
            FRANCHISE_OTHERS_SOURCES.has(source))
    ) {
        return FRANCHISE_COLUMNS;
    }
    return NON_FRANCHISE_COLUMNS;
};

const CATEGORIES = [
    { id: "admission", label: "Website", bg: "bg-blue-50 text-blue-800", subkey: "adm" },
    { id: "landing", label: "Paid Campaign", bg: "bg-teal-50 text-teal-800", subkey: "lnd" },
    { id: "contact", label: "Centerpage", bg: "bg-sky-50 text-sky-800", subkey: "cen" },
    { id: "campaign", label: "Paid Campaign", bg: "bg-violet-50 text-violet-800", subkey: "cam" },
    { id: "franchise", label: "Website Leads", bg: "bg-orange-50 text-orange-800", subkey: "fra" },
];

const CAMPAIGN_CHANNEL_CATEGORIES = [
    { id: "google", label: "BCWW_Google", bg: "bg-amber-50 text-amber-800", subkey: "lp" },
    { id: "july_meta", label: "BCWW_Meta", bg: "bg-fuchsia-50 text-fuchsia-800", subkey: "meta" },
    { id: "lp_wb", label: "Ants_Google", bg: "bg-teal-50 text-teal-800", subkey: "ants" },
    { id: "ants_meta", label: "Ants_Meta", bg: "bg-emerald-50 text-emerald-800", subkey: "antsm" },
    { id: "youtube", label: "YouTube", bg: "bg-red-50 text-red-800", subkey: "yt" },
];

const FRANCHISE_OTHERS_CHANNEL_CATEGORIES = [
    { id: "whatsapp", label: "WhatsApp", bg: "bg-emerald-50 text-emerald-800", subkey: "wa" },
    { id: "sms", label: "SMS", bg: "bg-lime-50 text-lime-800", subkey: "sms" },
    { id: "email", label: "Email", bg: "bg-cyan-50 text-cyan-800", subkey: "em" },
    { id: "franchise_referral", label: "Referral-Franchise", bg: "bg-rose-50 text-rose-800", subkey: "fr" },
    {
        id: "franchise_friends_family",
        label: "Referral - Friends & Family",
        bg: "bg-pink-50 text-pink-800",
        subkey: "ff",
    },
];

const ADMISSION_OTHERS_CHANNEL_CATEGORIES = [
    { id: "admission_whatsapp", label: "WhatsApp", bg: "bg-emerald-50 text-emerald-800", subkey: "awa" },
    { id: "admission_sms", label: "SMS", bg: "bg-lime-50 text-lime-800", subkey: "asms" },
    { id: "admission_email", label: "Email", bg: "bg-cyan-50 text-cyan-800", subkey: "aem" },
    { id: "referral_parents", label: "Referral – Parents", bg: "bg-rose-50 text-rose-800", subkey: "rp" },
    {
        id: "referral_family_friends",
        label: "Referral - Family & Friends",
        bg: "bg-pink-50 text-pink-800",
        subkey: "rff",
    },
];

const CHANNEL_LABELS: Record<string, string> = {
    google: "Google",
    july_lp: "Google",
    july_meta: "META",
    lp_wb: "Ants_Google",
    ants_meta: "Ants_Meta",
    youtube: "YouTube",
    whatsapp: "WhatsApp",
    sms: "SMS",
    email: "Email",
    franchise_referral: "Referral-Franchise",
    franchise_friends_family: "Referral - Friends & Family",
    admission_whatsapp: "WhatsApp",
    admission_sms: "SMS",
    admission_email: "Email",
    referral_parents: "Referral – Parents",
    referral_family_friends: "Referral - Family & Friends",
};

function cityRowTotal(
    cityName: string,
    reportData: Record<string, any>,
    activeCategories: typeof CATEGORIES,
    source?: string,
    agencySlug?: string,
): number {
    const categoriesForTotal = agencySlug
        ? activeCategories
        : source === "campaign"
        ? activeCategories.filter((c) => c.id === "campaign")
        : activeCategories;
    return categoriesForTotal.reduce((sum, cat) => {
        const cols = getCategoryColumns(cat.id, source);
        return (
            sum +
            cols.reduce((cSum, col) => {
                return (
                    cSum +
                    col.keys.reduce((acc, k) => {
                        return acc + (reportData[cityName.toLowerCase()]?.[cat.id]?.[k] || 0);
                    }, 0)
                );
            }, 0)
        );
    }, 0);
}

export default function ReportsView({ dateRange, city, state, source, campaign, medium, agency, agencySlug, userId, centreId, isSuperAdmin }: ReportsViewProps) {
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [cities, setCities] = useState<{ name: string }[]>([]);
    const [reportData, setReportData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [citySearch, setCitySearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("city");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [hideEmptyCities, setHideEmptyCities] = useState(false);
    const [isAgencyMode, setIsAgencyMode] = useState(Boolean(agencySlug));
    const [agencyLeads, setAgencyLeads] = useState<any[]>([]);
    const [agencyTotal, setAgencyTotal] = useState(0);
    const [exportingCsv, setExportingCsv] = useState(false);
    const [stateReportData, setStateReportData] = useState<any>(null);
    const [stateReportLoading, setStateReportLoading] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [excelError, setExcelError] = useState<string | null>(null);

    const loadStateReportData = async () => {
        setStateReportLoading(true);
        try {
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
            const res = await api.get(`/leads/reports/state-summary?${params.toString()}`);
            setStateReportData(res.data);
        } catch (err) {
            console.error("Failed to load state lead report:", err);
        } finally {
            setStateReportLoading(false);
        }
    };

    const downloadStateReportExcel = async () => {
        setExportingExcel(true);
        setExcelError(null);
        try {
            const params = new URLSearchParams();
            params.append("export", "excel");
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

            const res = await api.get(`/leads/reports/state-summary?${params.toString()}`, {
                responseType: "blob",
            });

            // If server returned an error as blob, decode it and surface the message
            const contentType = String(res.headers?.["content-type"] || "");
            if (contentType.includes("application/json")) {
                const text = await (res.data as Blob).text();
                let msg = "Export failed. Please try again.";
                try { msg = JSON.parse(text)?.detail || msg; } catch { /* ignore */ }
                setExcelError(msg);
                return;
            }

            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `State_Wise_Lead_Report_${stateReportData?.startDate || "all"}_to_${stateReportData?.endDate || "present"}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Failed to export excel:", err);
            // When axios gets a blob error response, decode it
            const errBlob = err?.response?.data;
            if (errBlob instanceof Blob) {
                const text = await errBlob.text();
                let msg = "Export failed. Please try again.";
                try { msg = JSON.parse(text)?.detail || msg; } catch { /* ignore */ }
                setExcelError(msg);
            } else {
                setExcelError("Export failed. Please try again.");
            }
        } finally {
            setExportingExcel(false);
        }
    };

    const getSourceLabel = () => {
        if (source === "admission_all") return "Admission";
        if (source === "franchise_all") return "Franchise";
        if (source === "admission") return "Website";
        if (source === "contact") return "CenterPage";
        if (source === "campaign") return "Paid Campaign";
        if (source === "franchise") return "Website Leads";
        if (source === "landing") return "Paid Campaign";
        if (source === "others") return "Others";
        if (source === "admission_others") return "Others";
        if (source && CHANNEL_LABELS[source]) return CHANNEL_LABELS[source];
        return "All Leads";
    };

    const scrollTable = (direction: "left" | "right") => {
        if (tableContainerRef.current) {
            const scrollAmount = 250;
            tableContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const activeCategories = useMemo(() => {
        // Agency-scoped views: show only the relevant channels for that agency
        if (agencySlug === "bcww") {
            return [
                { id: "google", label: "BCWW Google", bg: "bg-amber-50 text-amber-800", subkey: "lp" },
                { id: "july_meta", label: "BCWW Meta", bg: "bg-fuchsia-50 text-fuchsia-800", subkey: "meta" },
            ];
        }
        if (agencySlug === "ants") {
            return [
                { id: "lp_wb", label: "Ants Google", bg: "bg-teal-50 text-teal-800", subkey: "ants" },
                { id: "ants_meta", label: "Ants Meta", bg: "bg-emerald-50 text-emerald-800", subkey: "antsm" },
            ];
        }
        if (!source || source === "all") return CATEGORIES;
        if (source === "admission_all") {
            // Admission All = Website + Landing + Centerpage
            return CATEGORIES.filter(
                (c) => c.id === "admission" || c.id === "landing" || c.id === "contact",
            );
        }
        if (source === "franchise_all") {
            // Franchise Form + Campaign channels (Google + META)
            return [
                ...CATEGORIES.filter((c) => c.id === "franchise"),
                ...CAMPAIGN_CHANNEL_CATEGORIES,
            ];
        }
        if (source === "admission") {
            return CATEGORIES.filter((c) => c.id === "admission");
        }
        if (source === "campaign")
            return [
                {
                    id: "campaign",
                    label: "Paid Campaign",
                    bg: "bg-violet-50 text-violet-800",
                    subkey: "cam",
                },
                ...CAMPAIGN_CHANNEL_CATEGORIES,
            ];
        if (source === "others") return FRANCHISE_OTHERS_CHANNEL_CATEGORIES;
        if (source === "admission_others") return ADMISSION_OTHERS_CHANNEL_CATEGORIES;
        if (source === "google" || source === "july_lp") {
            return [
                {
                    id: "google",
                    label: "BCWW_Google Leads",
                    bg: "bg-amber-50 text-amber-800",
                    subkey: "lp",
                },
                {
                    id: "lp_wb",
                    label: "Ants_Google Leads",
                    bg: "bg-teal-50 text-teal-800",
                    subkey: "ants",
                },
            ];
        }
        if (source === "lp_wb") {
            return [
                {
                    id: "campaign",
                    label: "Ants_Google Leads",
                    bg: "bg-teal-50 text-teal-800",
                    subkey: "ants",
                },
            ];
        }
        if (source === "ants_meta") {
            return [
                {
                    id: "campaign",
                    label: "Ants_Meta Leads",
                    bg: "bg-emerald-50 text-emerald-800",
                    subkey: "antsm",
                },
            ];
        }
        if (source === "july_meta") {
            return [
                {
                    id: "july_meta",
                    label: "BCWW_Meta Leads",
                    bg: "bg-fuchsia-50 text-fuchsia-800",
                    subkey: "meta",
                },
                {
                    id: "ants_meta",
                    label: "Ants_Meta Leads",
                    bg: "bg-emerald-50 text-emerald-800",
                    subkey: "antsm",
                },
            ];
        }
        if (source === "youtube") {
            return [
                {
                    id: "youtube",
                    label: "YouTube Leads",
                    bg: "bg-red-50 text-red-800",
                    subkey: "yt",
                },
            ];
        }
        if (FRANCHISE_OTHERS_SOURCES.has(source)) {
            const cat = FRANCHISE_OTHERS_CHANNEL_CATEGORIES.find((c) => c.id === source);
            return [
                {
                    id: source,
                    label: `${CHANNEL_LABELS[source] || cat?.label || source} Leads`,
                    bg: cat?.bg || "bg-emerald-50 text-emerald-800",
                    subkey: cat?.subkey || "oth",
                },
            ];
        }
        if (ADMISSION_OTHERS_SOURCES.has(source)) {
            const cat = ADMISSION_OTHERS_CHANNEL_CATEGORIES.find((c) => c.id === source);
            return [
                {
                    id: source,
                    label: `${CHANNEL_LABELS[source] || cat?.label || source} Leads`,
                    bg: cat?.bg || "bg-emerald-50 text-emerald-800",
                    subkey: cat?.subkey || "aoth",
                },
            ];
        }
        if (CHANNEL_LABELS[source]) {
            return [
                {
                    id: "campaign",
                    label: `${CHANNEL_LABELS[source]} Leads`,
                    bg:
                        CAMPAIGN_CHANNEL_CATEGORIES.find((c) => c.id === source)?.bg ||
                        "bg-violet-50 text-violet-800",
                    subkey: CAMPAIGN_CHANNEL_CATEGORIES.find((c) => c.id === source)?.subkey || "cam",
                },
            ];
        }
        return CATEGORIES.filter((c) => c.id === source);
    }, [source, agencySlug]);

    // Sync agency mode when agencySlug prop changes
    useEffect(() => {
        setIsAgencyMode(Boolean(agencySlug));
    }, [agencySlug]);

    const cityKey = (city || []).join(",");
    const stateKey = (state || []).join(",");
    const startKey = dateRange.startDate?.toISOString() ?? "";
    const endKey = dateRange.endDate?.toISOString() ?? "";

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            try {
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
                const activeStateList = (state || []).filter(
                    (s) => Boolean(s) && String(s).trim().toLowerCase() !== "all" && String(s).trim() !== ""
                );
                const activeCityList = (city || []).filter(
                    (c) => Boolean(c) && String(c).trim().toLowerCase() !== "all" && String(c).trim() !== ""
                );

                if (activeStateList.length > 0) params.append("state", activeStateList.join(","));
                if (activeCityList.length > 0) params.append("city", activeCityList.join(","));
                if (agencySlug) {
                    params.append("mode", "agency");
                    params.append("agency", agency || agencySlug);
                    params.append("source", "agency");
                } else {
                    if (source && source !== "all") params.append("source", source);
                    if (agency) params.append("agency", agency);
                }
                if (campaign) params.append("campaign", campaign);
                if (medium) params.append("medium", medium);
                if (userId) params.append("userId", userId);
                if (centreId) params.append("centreId", centreId);

                const response = await api.get(`/leads/reports?${params.toString()}`);
                if (cancelled) return;
                if (response.data?.mode === "agency" || Boolean(agencySlug)) {
                    setIsAgencyMode(true);
                    const leads = response.data?.leads || [];
                    setAgencyLeads(leads);
                    setAgencyTotal(response.data?.total || leads.length);
                } else {
                    setIsAgencyMode(false);
                    const data = response.data?.cities || {};
                    const normalizedData: any = {};
                    Object.keys(data).forEach((k) => {
                        const cityData = { ...(data[k] || {}) };
                        // Merge legacy july_lp into Google; keep Ants (lp_wb) separate.
                        const googleBucket = { ...(cityData.google || {}) };
                        const part = cityData.july_lp;
                        if (part && typeof part === "object") {
                            Object.entries(part).forEach(([status, count]) => {
                                googleBucket[status] = (googleBucket[status] || 0) + Number(count || 0);
                            });
                            delete cityData.july_lp;
                        }
                        if (Object.keys(googleBucket).length > 0) {
                            cityData.google = googleBucket;
                        }
                        normalizedData[k.toLowerCase()] = cityData;
                    });
                    setReportData(normalizedData);
                    // Empty / "All" city = use cities returned by the API
                    if (activeCityList.length > 0) {
                        setCities(activeCityList.map((name) => ({ name })));
                    } else {
                        const fromApi = Object.keys(data)
                            .map((name) => name.trim())
                            .filter(Boolean)
                            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
                            .map((name) => ({ name }));
                        setCities(fromApi);
                    }
                }
            } catch (error) {
                if (!cancelled) console.error("Failed to load reports data:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        if (!agencySlug) loadStateReportData();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- stable serialized filter keys
    }, [startKey, endKey, cityKey, stateKey, source, campaign, medium, agency, agencySlug, userId, centreId]);

    useEffect(() => {
        setPage(1);
    }, [cityKey, pageSize, citySearch, sortKey, sortDir, hideEmptyCities, centreId]);

    const filteredSortedCities = useMemo(() => {
        const search = citySearch.trim().toLowerCase();
        let rows = cities.map((c) => ({
            name: c.name,
            total: cityRowTotal(c.name, reportData, activeCategories, source, agencySlug),
        }));

        if (search) {
            rows = rows.filter((r) => r.name.toLowerCase().includes(search));
        }
        if (hideEmptyCities) {
            rows = rows.filter((r) => r.total > 0);
        }

        rows.sort((a, b) => {
            if (sortKey === "city") {
                const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
                return sortDir === "asc" ? cmp : -cmp;
            }
            const cmp = a.total - b.total;
            if (cmp !== 0) return sortDir === "asc" ? cmp : -cmp;
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        });

        return rows;
    }, [cities, reportData, activeCategories, citySearch, hideEmptyCities, sortKey, sortDir]);

    const paginatedCities = filteredSortedCities.slice((page - 1) * pageSize, page * pageSize);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir(key === "total" ? "desc" : "asc");
        }
    };

    const sortHint = (key: SortKey) => {
        if (sortKey !== key) return "Sort";
        return sortDir === "asc" ? "Ascending" : "Descending";
    };

    const totalColumns = activeCategories.reduce((acc, cat) => acc + getCategoryColumns(cat.id, source).length, 0) + 2;

    const filteredAgencyLeads = useMemo(() => {
        if (!isAgencyMode) return [];
        const search = citySearch.trim().toLowerCase();
        if (!search) return agencyLeads;
        return agencyLeads.filter(
            (l) =>
                (l.name || "").toLowerCase().includes(search) ||
                (l.city || "").toLowerCase().includes(search) ||
                (l.state || "").toLowerCase().includes(search) ||
                (l.utm_source || "").toLowerCase().includes(search) ||
                (l.utm_medium || "").toLowerCase().includes(search) ||
                (l.utm_campaign || "").toLowerCase().includes(search) ||
                (l.status || "").toLowerCase().includes(search) ||
                (l.gclid || "").toLowerCase().includes(search) ||
                (l.description || "").toLowerCase().includes(search),
        );
    }, [isAgencyMode, agencyLeads, citySearch]);

    const paginatedAgencyLeads = useMemo(() => {
        return filteredAgencyLeads.slice((page - 1) * pageSize, page * pageSize);
    }, [filteredAgencyLeads, page, pageSize]);

    const downloadAgencyCsv = async () => {
        try {
            setExportingCsv(true);

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
            const activeStateList = (state || []).filter(
                (s) => Boolean(s) && String(s).trim().toLowerCase() !== "all" && String(s).trim() !== "",
            );
            const activeCityList = (city || []).filter(
                (c) => Boolean(c) && String(c).trim().toLowerCase() !== "all" && String(c).trim() !== "",
            );
            if (activeStateList.length > 0) params.append("state", activeStateList.join(","));
            if (activeCityList.length > 0) params.append("city", activeCityList.join(","));
            if (agency) params.append("agency", agency);
            params.append("export", "csv");

            // Use axios with blob responseType to ensure JWT auth header is sent
            const response = await api.get(`/leads/reports?${params.toString()}`, {
                responseType: "arraybuffer",
            });

            const uint8 = new Uint8Array(response.data as ArrayBuffer);
            const blob = new Blob([uint8], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.style.display = "none";
            link.href = url;
            link.setAttribute(
                "download",
                `Agency_Lead_Report_${agency || agencySlug || "export"}.csv`,
            );
            document.body.appendChild(link);
            link.click();
            // Clean up after a short delay to allow the download to initiate
            setTimeout(() => {
                URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }, 200);
        } catch (err) {
            console.error("Failed to download CSV report:", err);
            alert("CSV download failed. Please try again.");
        } finally {
            setExportingCsv(false);
        }
    };

    function getStatusBadgeClass(st: string): string {
        const s = String(st || "").toLowerCase();
        if (s.includes("untouched")) return "bg-slate-100 text-slate-800 border-slate-300";
        if (s.includes("not_answering")) return "bg-amber-100 text-amber-800 border-amber-300";
        if (s.includes("follow_up") || s.includes("interested")) return "bg-blue-100 text-blue-800 border-blue-300";
        if (s.includes("converted") || s.includes("mou") || s.includes("agreement")) return "bg-emerald-100 text-emerald-800 border-emerald-300";
        if (s.includes("wrong") || s.includes("dropped")) return "bg-rose-100 text-rose-800 border-rose-300";
        return "bg-gray-100 text-gray-800 border-gray-300";
    }

    if (isAgencyMode) {
        const agencyTotalPages = Math.ceil(filteredAgencyLeads.length / pageSize) || 1;
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span>Agency Campaign Leads Report</span>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                    {filteredAgencyLeads.length} Leads
                                </span>
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Showing campaign leads with full UTM parameter detail & description.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={downloadAgencyCsv}
                                disabled={exportingCsv}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-150 disabled:opacity-50 cursor-pointer"
                            >
                                {exportingCsv ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Downloading CSV...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 text-white" />
                                        <span>Download CSV</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="p-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Filter leads by name, city, UTM..."
                                value={citySearch}
                                onChange={(e) => setCitySearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead>
                                <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                                    <th className="p-3 border border-slate-800">name</th>
                                    <th className="p-3 border border-slate-800">state</th>
                                    <th className="p-3 border border-slate-800">city</th>
                                    <th className="p-3 border border-slate-800">utm_source</th>
                                    <th className="p-3 border border-slate-800">utm_medium</th>
                                    <th className="p-3 border border-slate-800">utm_campaign</th>
                                    <th className="p-3 border border-slate-800">status</th>
                                    <th className="p-3 border border-slate-800">created_at</th>
                                    <th className="p-3 border border-slate-800">utm_content</th>
                                    <th className="p-3 border border-slate-800">gclid</th>
                                    <th className="p-3 border border-slate-800">description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={11} className="p-8 text-center">
                                            <div className="flex justify-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedAgencyLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="p-8 text-center text-gray-500">
                                            No agency leads found matching the current filters.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedAgencyLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-slate-50 transition-colors border-b border-gray-200 text-sm">
                                            <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">{lead.name || "-"}</td>
                                            <td className="p-3 text-gray-700 whitespace-nowrap">{lead.state || "-"}</td>
                                            <td className="p-3 text-gray-700 whitespace-nowrap">{lead.city || "-"}</td>
                                            <td className="p-3 text-gray-600 font-mono text-xs whitespace-nowrap">{lead.utm_source || "-"}</td>
                                            <td className="p-3 text-gray-600 font-mono text-xs max-w-[150px] truncate" title={lead.utm_medium}>{lead.utm_medium || "-"}</td>
                                            <td className="p-3 text-gray-600 font-mono text-xs max-w-[150px] truncate" title={lead.utm_campaign}>{lead.utm_campaign || "-"}</td>
                                            <td className="p-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadgeClass(lead.status)}`}>
                                                    {lead.status || "Untouched"}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-600 font-mono text-xs whitespace-nowrap">{lead.created_at || "-"}</td>
                                            <td className="p-3 text-gray-600 font-mono text-xs whitespace-nowrap">{lead.utm_content || "-"}</td>
                                            <td className="p-3 text-gray-600 font-mono text-xs max-w-[150px] truncate" title={lead.gclid}>{lead.gclid || "-"}</td>
                                            <td className="p-3 text-gray-600 text-xs max-w-xs truncate" title={lead.description}>{lead.description || "-"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {!loading && filteredAgencyLeads.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50/50 text-sm text-gray-500 gap-4">
                            <div className="flex items-center gap-4">
                                <span>
                                    Showing {(page - 1) * pageSize + 1} to{" "}
                                    {Math.min(page * pageSize, filteredAgencyLeads.length)} of{" "}
                                    {filteredAgencyLeads.length} leads
                                </span>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className="text-gray-400 uppercase tracking-widest font-medium">Show:</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                        className="bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-gray-700 cursor-pointer"
                                    >
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="px-2.5 py-1.5 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 text-xs font-medium transition-all"
                                >
                                    Prev
                                </button>
                                <span className="px-3 py-1 text-xs font-semibold text-gray-700">
                                    Page {page} of {agencyTotalPages}
                                </span>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= agencyTotalPages}
                                    className="px-2.5 py-1.5 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 text-xs font-medium transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* State-Wise Total Leads Generated Report (Excel Export & Summary Card) - Super Admins Only */}
            {isSuperAdmin && (
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 text-white shadow-xl border border-indigo-900">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/50 pb-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                                <h2 className="text-lg font-bold tracking-tight text-white">
                                    State-Wise Total Leads Generated Report
                                </h2>
                            </div>
                            <p className="text-xs text-indigo-200 mt-1">
                                Captured across BCWW, ANTS, Franchise Referrals, and Website franchise forms ({stateReportData?.period || "Selected Date Period"}).
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                            <button
                                onClick={downloadStateReportExcel}
                                disabled={exportingExcel}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-md transition-all duration-150 disabled:opacity-50 cursor-pointer shrink-0"
                            >
                                {exportingExcel ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Generating Excel...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 text-white" />
                                        <span>Download Excel Report (.xlsx)</span>
                                    </>
                                )}
                            </button>
                            {excelError && (
                                <p className="text-xs text-red-300 bg-red-900/40 border border-red-700/50 rounded px-2 py-1 max-w-xs text-right">
                                    ⚠️ {excelError}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* State Summary Table Preview */}
                    {stateReportLoading ? (
                        <div className="flex items-center justify-center py-8 text-indigo-300 gap-2 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Loading state report data...</span>
                        </div>
                    ) : stateReportData?.rows ? (
                        <div className="overflow-x-auto rounded-lg border border-indigo-800/40 bg-slate-950/60">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="bg-indigo-900/80 text-indigo-200 border-b border-indigo-700/60 text-center font-bold">
                                        <th className="p-2 text-left">Count</th>
                                        <th className="p-2 border-l border-indigo-700/60">A</th>
                                        <th className="p-2 border-l border-indigo-700/60">B</th>
                                        <th className="p-2 border-l border-indigo-700/60">C</th>
                                        <th className="p-2 border-l border-indigo-700/60 bg-indigo-800/90 text-white">D = A+B+C</th>
                                        <th className="p-2 border-l border-indigo-700/60">E</th>
                                        <th className="p-2 border-l border-indigo-700/60">F</th>
                                        <th className="p-2 border-l border-indigo-700/60">G</th>
                                        <th className="p-2 border-l border-indigo-700/60 bg-indigo-800/90 text-white">H = E+F+G</th>
                                        <th className="p-2 border-l border-indigo-700/60">I</th>
                                        <th className="p-2 border-l border-indigo-700/60">J</th>
                                        <th className="p-2 border-l border-indigo-700/60 bg-emerald-900/80 text-emerald-300">K = D+H+I+J</th>
                                    </tr>
                                    <tr className="bg-indigo-950/90 text-indigo-100 border-b border-indigo-700/80 font-semibold text-center">
                                        <th className="p-2.5 text-left font-bold text-white">State</th>
                                        <th className="p-2.5 border-l border-indigo-800">BCWW - Google</th>
                                        <th className="p-2.5 border-l border-indigo-800">BCWW - META</th>
                                        <th className="p-2.5 border-l border-indigo-800">BCWW - Others</th>
                                        <th className="p-2.5 border-l border-indigo-800 bg-indigo-900 text-white font-bold">BCWW Total</th>
                                        <th className="p-2.5 border-l border-indigo-800">ANTS - Google</th>
                                        <th className="p-2.5 border-l border-indigo-800">ANTS - Meta</th>
                                        <th className="p-2.5 border-l border-indigo-800">ANTS - Others</th>
                                        <th className="p-2.5 border-l border-indigo-800 bg-indigo-900 text-white font-bold">ANTS Total</th>
                                        <th className="p-2.5 border-l border-indigo-800">Franchise referrals</th>
                                        <th className="p-2.5 border-l border-indigo-800">Website</th>
                                        <th className="p-2.5 border-l border-indigo-800 bg-emerald-900/90 text-emerald-200 font-bold">Grand Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-900/40 font-mono text-indigo-100">
                                    {stateReportData.rows.map((row: any, idx: number) => (
                                        <tr key={row.state} className={idx % 2 === 0 ? "bg-slate-900/40" : "bg-slate-950/40 hover:bg-indigo-950/30"}>
                                            <td className="p-2.5 font-sans font-medium text-white">{row.state}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-900/40">{row.bcww_google || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-900/40">{row.bcww_meta || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-900/40">{row.bcww_others || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-900/40 font-bold text-white bg-indigo-950/50">{row.bcww_total || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-900/40">{row.ants_google || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-900/40">{row.ants_meta || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-900/40">{row.ants_others || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-900/40 font-bold text-white bg-indigo-950/50">{row.ants_total || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-900/40">{row.franchise_referrals || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-900/40">{row.website || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-900/40 font-bold text-emerald-400 bg-emerald-950/40">{row.grand_total || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {stateReportData.grandTotal && (
                                    <tfoot>
                                        <tr className="bg-indigo-900/90 text-white font-bold border-t-2 border-indigo-600">
                                            <td className="p-2.5 font-sans">Grand Total</td>
                                            <td className="p-2.5 text-right border-l border-indigo-800">{stateReportData.grandTotal.bcww_google || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-800">{stateReportData.grandTotal.bcww_meta || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-800">{stateReportData.grandTotal.bcww_others || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-800 text-indigo-200">{stateReportData.grandTotal.bcww_total || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-800">{stateReportData.grandTotal.ants_google || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-800">{stateReportData.grandTotal.ants_meta || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-800">{stateReportData.grandTotal.ants_others || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-800 text-indigo-200">{stateReportData.grandTotal.ants_total || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-800">{stateReportData.grandTotal.franchise_referrals || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-800">{stateReportData.grandTotal.website || "-"}</td>
                                            <td className="p-2.5 text-right border-l border-indigo-800 text-emerald-300 text-sm">{stateReportData.grandTotal.grand_total || "-"}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    ) : null}
                </div>
            )}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        placeholder="Filter cities..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap">
                        <ArrowDownUp className="w-4 h-4 text-gray-400" />
                        Sort by
                    </label>
                    <select
                        value={`${sortKey}-${sortDir}`}
                        onChange={(e) => {
                            const [key, dir] = e.target.value.split("-") as [SortKey, SortDir];
                            setSortKey(key);
                            setSortDir(dir);
                        }}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                        <option value="city-asc">City A–Z</option>
                        <option value="city-desc">City Z–A</option>
                        <option value="total-desc">Total high → low</option>
                        <option value="total-asc">Total low → high</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap ml-1">
                        <input
                            type="checkbox"
                            checked={hideEmptyCities}
                            onChange={(e) => setHideEmptyCities(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Hide empty cities
                    </label>
                </div>
            </div>

            {!loading && cities.length > 0 && (
                <div className="lg:hidden flex items-center justify-between px-2 py-2 bg-gray-50 rounded-xl mb-3 border border-gray-200 text-xs">
                    <span className="text-gray-500 font-medium pl-1.5">
                        Scroll table horizontally to view all columns
                    </span>
                    <div className="flex gap-1.5">
                        <button
                            type="button"
                            onClick={() => scrollTable("left")}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 shadow-sm active:bg-gray-100 focus:outline-none"
                            aria-label="Scroll Left"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTable("right")}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 shadow-sm active:bg-gray-100 focus:outline-none"
                            aria-label="Scroll Right"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div ref={tableContainerRef} className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                        <tr>
                            <th
                                rowSpan={2}
                                className="border border-gray-200 border-r-2 p-3 bg-gray-50 text-left sticky left-0 z-20 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleSort("city")}
                                    className="flex flex-col gap-0.5 text-left w-full hover:opacity-80"
                                    title={sortHint("city")}
                                >
                                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block leading-none">
                                        {getSourceLabel()}
                                    </span>
                                    <span className="font-bold text-gray-800 text-sm block">
                                        City {sortKey === "city" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                                    </span>
                                </button>
                            </th>
                            {activeCategories.map((cat) => (
                                <th
                                    key={cat.id}
                                    colSpan={getCategoryColumns(cat.id, source).length}
                                    className={`border border-gray-200 p-3 ${cat.bg} text-center font-bold text-lg`}
                                >
                                    {cat.label}
                                </th>
                            ))}
                            <th
                                rowSpan={2}
                                className="border border-gray-200 p-4 bg-gray-100 text-gray-900 text-center font-bold text-lg align-bottom whitespace-nowrap"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleSort("total")}
                                    className="w-full hover:opacity-80"
                                    title={sortHint("total")}
                                >
                                    Overall Total {sortKey === "total" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                                </button>
                            </th>
                        </tr>
                        <tr>
                            {activeCategories.map((cat) =>
                                getCategoryColumns(cat.id, source).map((col) => (
                                    <th
                                        key={`${cat.subkey}-${col.label}`}
                                        className="border border-gray-200 p-3 bg-gray-50 text-sm font-semibold text-gray-600 text-center whitespace-nowrap"
                                    >
                                        {col.label}
                                    </th>
                                )),
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={totalColumns} className="border border-gray-200 p-8 text-center">
                                    <div className="flex justify-center">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                    </div>
                                </td>
                            </tr>
                        ) : filteredSortedCities.length === 0 ? (
                            <tr>
                                <td colSpan={totalColumns} className="border border-gray-200 p-8 text-center text-gray-500">
                                    No cities match the current filters.
                                </td>
                            </tr>
                        ) : (
                            paginatedCities.map((row) => (
                                <tr key={row.name} className="hover:bg-gray-50 transition-colors">
                                    <td className="border border-gray-200 border-r-2 p-3 font-semibold text-gray-800 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        {row.name}
                                    </td>
                                    {activeCategories.map((cat) =>
                                        getCategoryColumns(cat.id, source).map((col) => {
                                            const sum = col.keys.reduce(
                                                (acc, k) =>
                                                    acc + (reportData[row.name.toLowerCase()]?.[cat.id]?.[k] || 0),
                                                0,
                                            );
                                            return (
                                                <td
                                                    key={`${cat.subkey}-${row.name}-${col.label}`}
                                                    className="border border-gray-200 p-3 text-center text-gray-700 font-medium"
                                                >
                                                    {sum || "-"}
                                                </td>
                                            );
                                        }),
                                    )}
                                    <td className="border border-gray-200 p-3 text-center text-gray-900 font-bold bg-gray-100/50 text-lg">
                                        {row.total || "-"}
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loading && filteredSortedCities.length > 0 && (
                            <tr className="bg-gray-100 font-bold sticky bottom-0 z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
                                <td className="border border-gray-200 border-r-2 p-3 text-gray-900 sticky left-0 bg-gray-100 z-10 uppercase tracking-wider text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    Total
                                </td>
                                {activeCategories.map((cat) =>
                                    getCategoryColumns(cat.id, source).map((col) => {
                                        const colTotal = filteredSortedCities.reduce(
                                            (sum, row) =>
                                                sum +
                                                col.keys.reduce(
                                                    (acc, k) =>
                                                        acc +
                                                        (reportData[row.name.toLowerCase()]?.[cat.id]?.[k] || 0),
                                                    0,
                                                ),
                                            0,
                                        );
                                        return (
                                            <td
                                                key={`total-${cat.subkey}-${col.label}`}
                                                className={`border border-gray-200 p-3 text-center ${cat.bg}`}
                                            >
                                                {colTotal || "-"}
                                            </td>
                                        );
                                    }),
                                )}
                                <td className="border border-gray-200 p-3 text-center text-gray-900 font-bold bg-gray-300/50 text-lg">
                                    {filteredSortedCities.reduce((sum, row) => sum + row.total, 0) || "-"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && filteredSortedCities.length > 0 &&
                (() => {
                    const totalPages = Math.ceil(filteredSortedCities.length / pageSize);

                    const getPageNumbers = () => {
                        const items: (number | string)[] = [];
                        if (totalPages <= 7) {
                            for (let i = 1; i <= totalPages; i++) items.push(i);
                        } else if (page <= 4) {
                            items.push(1, 2, 3, 4, 5, "...", totalPages);
                        } else if (page >= totalPages - 3) {
                            items.push(
                                1,
                                "...",
                                totalPages - 4,
                                totalPages - 3,
                                totalPages - 2,
                                totalPages - 1,
                                totalPages,
                            );
                        } else {
                            items.push(1, "...", page - 1, page, page + 1, "...", totalPages);
                        }
                        return items;
                    };

                    return (
                        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50/50 text-sm text-gray-500 gap-4">
                            <div className="flex items-center gap-4">
                                <span>
                                    Showing {(page - 1) * pageSize + 1} to{" "}
                                    {Math.min(page * pageSize, filteredSortedCities.length)} of{" "}
                                    {filteredSortedCities.length} cities
                                </span>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className="text-gray-400 uppercase tracking-widest font-medium">Show:</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                        className="bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-gray-700 cursor-pointer"
                                    >
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="px-2.5 py-1.5 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 text-xs font-medium transition-all"
                                >
                                    Prev
                                </button>

                                {getPageNumbers().map((item, idx) =>
                                    item === "..." ? (
                                        <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={`page-${item}`}
                                            type="button"
                                            onClick={() => setPage(Number(item))}
                                            className={`px-3 py-1.5 rounded border text-xs font-medium transition-all ${
                                                page === item
                                                    ? "bg-blue-600 text-white border-blue-600 font-bold"
                                                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    ),
                                )}

                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages}
                                    className="px-2.5 py-1.5 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 text-xs font-medium transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    );
                })()}
        </div>
        </div>
    );
}

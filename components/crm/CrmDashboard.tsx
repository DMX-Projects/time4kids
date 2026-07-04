"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { AccessLoading } from "@/components/auth/AccessLoading";
import { normalizeRole, useAuth } from "@/components/auth/AuthProvider";
import crmApi from "@/lib/crmApi";
import DashboardStats from "@/components/crm/admin/DashboardStats";
import LeadsTable from "@/components/crm/admin/LeadsTable";
import DateRangePicker from "@/components/crm/admin/DateRangePicker";
import CitySelector from "@/components/crm/admin/CitySelector";
import CentreSelector from "@/components/crm/admin/CentreSelector";
import RemindersWidget from "@/components/crm/admin/RemindersWidget";
import LandingLeadsReport from "@/components/leads/LandingLeadsReport";

const LeadSourceChart = lazy(() => import("@/components/crm/admin/LeadSourceChart"));
const ConversionFunnel = lazy(() => import("@/components/crm/admin/ConversionFunnel"));

type SourceFilter = "" | "admission" | "contact" | "landing" | "campaign" | "franchise";
type CampaignChannelFilter = "" | "website" | "facebook" | "instagram";
type StatusFilter = "" | "new" | "contacted" | "called" | "follow_up" | "interested" | "meeting_scheduled" | "converted" | "dropped" | "not_interested";

function apiSourceParam(source: SourceFilter, channel: CampaignChannelFilter): string {
    if (source === "campaign") return channel || "campaign";
    return source;
}

const SOURCE_FILTERS: { id: SourceFilter; label: string; active: string; idle: string }[] = [
    { id: "", label: "All", active: "border-gray-800 bg-gray-800 text-white", idle: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100" },
    { id: "admission", label: "Admission", active: "border-blue-700 bg-blue-700 text-white", idle: "border-blue-100 bg-blue-50 text-blue-800 hover:bg-blue-100" },
    { id: "contact", label: "Centers Enquiry", active: "border-sky-600 bg-sky-600 text-white", idle: "border-sky-100 bg-sky-50 text-sky-800 hover:bg-sky-100" },
    { id: "campaign", label: "Campaign Enquiry", active: "border-violet-600 bg-violet-600 text-white", idle: "border-violet-100 bg-violet-50 text-violet-800 hover:bg-violet-100" },
    { id: "landing", label: "Landing", active: "border-teal-600 bg-teal-600 text-white", idle: "border-teal-100 bg-teal-50 text-teal-800 hover:bg-teal-100" },
    { id: "franchise", label: "Franchise Enquiry", active: "border-orange-600 bg-orange-600 text-white", idle: "border-orange-100 bg-orange-50 text-orange-800 hover:bg-orange-100" },
];

const CAMPAIGN_CHANNEL_FILTERS: { id: CampaignChannelFilter; label: string }[] = [
    { id: "", label: "All Channels" },
    { id: "website", label: "Website" },
    { id: "facebook", label: "Facebook" },
    { id: "instagram", label: "Instagram" },
];

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
    { id: "", label: "All Statuses" },
    { id: "new", label: "New" },
    { id: "contacted", label: "Contacted" },
    { id: "called", label: "Called" },
    { id: "follow_up", label: "Follow Up" },
    { id: "interested", label: "Interested" },
    { id: "meeting_scheduled", label: "Meeting Scheduled" },
    { id: "dropped", label: "Dropped" },
    { id: "not_interested", label: "Not Interested" },
    { id: "converted", label: "Converted" },
];

export default function CrmDashboard() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: null,
        endDate: null,
    });
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [selectedCentre, setSelectedCentre] = useState<string>("");
    const [filterDateRange, setFilterDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: null,
        endDate: null,
    });
    const [selectedSource, setSelectedSource] = useState<SourceFilter>("");
    const [selectedCampaignChannel, setSelectedCampaignChannel] = useState<CampaignChannelFilter>("");
    const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);

    const isCrmUser = normalizeRole(user?.role) === "crm";

    const handleCityChange = (city: string) => {
        setSelectedCity(city);
        setSelectedCentre("");
    };

    const isLandingView = selectedSource === "landing";
    const isCampaignView = selectedSource === "campaign";
    const apiSource = apiSourceParam(selectedSource, selectedCampaignChannel);

    const handleSourceChange = (source: SourceFilter) => {
        setSelectedSource(source);
        if (source !== "campaign") {
            setSelectedCampaignChannel("");
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/crm-admin/login?next=/crm-admin");
        }
    }, [authLoading, router, user]);

    useEffect(() => {
        if (!isCrmUser || isLandingView) return;
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
        if (selectedCity) params.append("city", selectedCity);
        if (selectedCentre) params.append("centreId", selectedCentre);
        if (apiSource) params.append("source", apiSource);
        if (selectedStatus) params.append("status", selectedStatus);
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
    }, [isCrmUser, isLandingView, dateRange, selectedCity, selectedCentre, apiSource, selectedStatus]);

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
        if (selectedCity) params.append("city", selectedCity);
        if (selectedCentre) params.append("centreId", selectedCentre);
        if (apiSource) params.append("source", apiSource);
        if (selectedStatus) params.append("status", selectedStatus);
        crmApi
            .get(`/leads/dashboard?${params.toString()}`)
            .then((res) => setStats(res.data))
            .catch((err) => console.error("Failed to load dashboard:", err))
            .finally(() => setStatsLoading(false));
    };

    const handleApplyFilters = () => {
        setDateRange(filterDateRange);
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
            if (selectedCity) params.append("city", selectedCity);
            if (selectedCentre) params.append("centreId", selectedCentre);
            if (apiSource) params.append("source", apiSource);
            if (selectedStatus) params.append("status", selectedStatus);
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

    if (authLoading || !user) {
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
            <header className="border-b bg-white shadow-sm">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-4">
                        <h1
                            onClick={() => window.location.reload()}
                            className="flex cursor-pointer items-center gap-2 text-2xl font-bold text-gray-800 transition-colors hover:text-blue-600"
                            title="Click to reload page"
                        >
                            Admin Dashboard
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Welcome, {user.fullName || user.email}</span>
                        <button onClick={handleLogout} className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 rounded-xl bg-white p-6 shadow-lg">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="flex flex-col min-w-0">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Select Source</label>
                            <div className="flex flex-wrap gap-2">
                                {SOURCE_FILTERS.map((item) => {
                                    const isActive = selectedSource === item.id;
                                    return (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => handleSourceChange(item.id)}
                                            className={`flex h-[42px] items-center rounded-lg border px-4 sm:px-6 text-sm font-semibold transition-colors whitespace-nowrap ${isActive ? item.active : item.idle}`}
                                        >
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {!isLandingView ? (
                                <p className="mt-2 text-xs text-gray-500">
                                    {selectedSource === ""
                                        ? "Showing admission, centers enquiry, and campaign leads. Landing page leads are separate."
                                        : selectedSource === "campaign"
                                          ? "Campaign enquiry leads from /crm/web, /crm/fb, and /crm/insta forms."
                                          : `Showing only ${SOURCE_FILTERS.find((s) => s.id === selectedSource)?.label ?? selectedSource} leads.`}
                                </p>
                            ) : null}
                            {isCampaignView ? (
                                <>
                                    <label className="mb-2 mt-4 block text-sm font-semibold text-gray-700">Campaign Channel</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CAMPAIGN_CHANNEL_FILTERS.map((item) => {
                                            const isActive = selectedCampaignChannel === item.id;
                                            return (
                                                <button
                                                    key={item.label}
                                                    type="button"
                                                    onClick={() => setSelectedCampaignChannel(item.id)}
                                                    className={`flex h-[38px] items-center rounded-lg border px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${isActive ? "border-violet-700 bg-violet-700 text-white" : "border-violet-100 bg-violet-50 text-violet-800 hover:bg-violet-100"}`}
                                                >
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : null}
                            {!isLandingView ? (
                                <>
                                    <label className="mb-2 mt-4 block text-sm font-semibold text-gray-700">Select Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {STATUS_FILTERS.map((item) => {
                                            const isActive = selectedStatus === item.id;
                                            return (
                                                <button
                                                    key={item.label}
                                                    type="button"
                                                    onClick={() => setSelectedStatus(item.id)}
                                                    className={`flex h-[38px] items-center rounded-lg border px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${isActive ? "border-gray-800 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
                                                >
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {!isLandingView ? (
                            <div className="flex flex-col items-end gap-4">
                                <div>
                                    <DateRangePicker
                                        startDate={filterDateRange.startDate}
                                        endDate={filterDateRange.endDate}
                                        onChange={(start, end) => setFilterDateRange({ startDate: start, endDate: end })}
                                    />
                                </div>
                                <div className="flex flex-nowrap items-end gap-4 overflow-x-auto pb-1">
                                    <CitySelector value={selectedCity} onChange={handleCityChange} />
                                    <CentreSelector city={selectedCity} value={selectedCentre} onChange={setSelectedCentre} />
                                    <button
                                        type="button"
                                        onClick={handleApplyFilters}
                                        className="btn-secondary flex h-[42px] items-center justify-center whitespace-nowrap !py-0 px-6"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                {isLandingView ? (
                    <LandingLeadsReport title="Landing page leads" embedded basePath="/crm-admin/" />
                ) : (
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
                            <RemindersWidget key={refreshKey} source={apiSource} city={selectedCity} centreId={selectedCentre} />

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
                                    <ConversionFunnel data={stats.statusBreakdown} />
                                </Suspense>
                            ) : null}
                        </div>

                        <LeadsTable
                            key={`${refreshKey}-${apiSource}-${selectedStatus}-${selectedCity}-${selectedCentre}`}
                            dateRange={dateRange}
                            city={selectedCity}
                            centreId={selectedCentre}
                            source={apiSource}
                            status={selectedStatus}
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
                    </>
                )}
            </div>
        </div>
    );
}

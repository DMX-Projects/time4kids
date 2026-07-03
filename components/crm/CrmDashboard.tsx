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
import CentreSelector from "@/components/crm/admin/CentreSelector";
import RemindersWidget from "@/components/crm/admin/RemindersWidget";

const LeadSourceChart = lazy(() => import("@/components/crm/admin/LeadSourceChart"));
const ConversionFunnel = lazy(() => import("@/components/crm/admin/ConversionFunnel"));

export default function CrmDashboard() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: null,
        endDate: null,
    });
    const [selectedCentre, setSelectedCentre] = useState<string>("");
    const [filterDateRange, setFilterDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: null,
        endDate: null,
    });
    const [filterCentre, setFilterCentre] = useState<string>("");
    const [selectedSource, setSelectedSource] = useState<string>("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);

    const isCrmUser = normalizeRole(user?.role) === "crm";

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/crm-admin/login?next=/crm-admin");
        }
    }, [authLoading, router, user]);

    useEffect(() => {
        if (!isCrmUser) return;
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
        if (selectedCentre) params.append("centreId", selectedCentre);
        if (selectedSource) params.append("source", selectedSource);
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
    }, [isCrmUser, dateRange, selectedCentre, selectedSource]);

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
        if (selectedCentre) params.append("centreId", selectedCentre);
        if (selectedSource) params.append("source", selectedSource);
        crmApi
            .get(`/leads/dashboard?${params.toString()}`)
            .then((res) => setStats(res.data))
            .catch((err) => console.error("Failed to load dashboard:", err))
            .finally(() => setStatsLoading(false));
    };

    const handleApplyFilters = () => {
        setDateRange(filterDateRange);
        setSelectedCentre(filterCentre);
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
            if (selectedCentre) params.append("centreId", selectedCentre);
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
                    <div className="flex flex-col items-end justify-between gap-6 lg:flex-row">
                        <div className="flex flex-col">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Select Source</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedSource(selectedSource === "website" ? "" : "website")}
                                    className={`flex h-[42px] items-center gap-2 rounded-lg border px-8 font-semibold transition-colors ${selectedSource === "website" ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"}`}
                                >
                                    Webpage
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedSource(selectedSource === "facebook" ? "" : "facebook")}
                                    className={`flex h-[42px] items-center gap-2 rounded-lg border px-8 font-semibold transition-colors ${selectedSource === "facebook" ? "border-indigo-600 bg-indigo-600 text-white" : "border-indigo-50 text-indigo-700 hover:bg-indigo-100"}`}
                                >
                                    Facebook
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedSource(selectedSource === "instagram" ? "" : "instagram")}
                                    className={`flex h-[42px] items-center gap-2 rounded-lg border px-8 font-semibold transition-colors ${selectedSource === "instagram" ? "border-pink-600 bg-pink-600 text-white" : "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100"}`}
                                >
                                    Instagram
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <DateRangePicker
                                startDate={filterDateRange.startDate}
                                endDate={filterDateRange.endDate}
                                onChange={(start, end) => setFilterDateRange({ startDate: start, endDate: end })}
                            />
                            <CentreSelector value={filterCentre} onChange={setFilterCentre} />
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={handleApplyFilters}
                                    className="btn-secondary flex h-[42px] items-center justify-center whitespace-nowrap !py-0 px-6"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

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
                    <RemindersWidget key={refreshKey} source={selectedSource} centreId={selectedCentre} />

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
                    key={refreshKey}
                    dateRange={dateRange}
                    centreId={selectedCentre}
                    source={selectedSource}
                />
            </div>
        </div>
    );
}

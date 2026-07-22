"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import api from "@/lib/crmApi";
import { ArrowDownUp, ChevronLeft, ChevronRight, Search } from "lucide-react";

interface ReportsViewProps {
    dateRange: { startDate: Date | null; endDate: Date | null };
    city: string[];
    state: string[];
    source?: string;
    userId?: string;
    centreId?: string;
}

type SortKey = "city" | "total";
type SortDir = "asc" | "desc";

const NON_FRANCHISE_COLUMNS = [
    { label: "Untouched", keys: ["untouched", "new"] },
    { label: "Not Answering", keys: ["not_answering", "called", "contacted"] },
    { label: "Follow Up", keys: ["follow_up", "interested"] },
    { label: "Visited School", keys: ["visited_school", "meeting_scheduled"] },
    { label: "Converted to Admission", keys: ["converted_admission", "converted"] },
    { label: "Joined Competition", keys: ["joined_competition"] },
    { label: "Not Interested", keys: ["not_interested", "dropped"] },
    { label: "Wrong Enquiry", keys: ["wrong_enquiry"] },
];

const FRANCHISE_COLUMNS = [
    { label: "Untouched", keys: ["untouched"] },
    { label: "Hot", keys: ["hot"] },
    { label: "Warm", keys: ["warm"] },
    { label: "Follow Up", keys: ["follow_up"] },
    { label: "Cold", keys: ["cold"] },
    { label: "MOU Signed", keys: ["converted_mou_signed"] },
    { label: "Agreement Signed", keys: ["converted_agreement_signed"] },
    { label: "Join Later", keys: ["join_later"] },
    { label: "Not Interested", keys: ["not_interested"] },
    { label: "Not Answering Calls", keys: ["not_answering_calls"] },
];

const FRANCHISE_CAMPAIGN_SOURCES = new Set([
    "website",
    "facebook",
    "instagram",
    "web",
    "fb",
    "insta",
    "july_lp",
    "july_meta",
    "lp_wb",
]);

const getCategoryColumns = (categoryId: string, source?: string) => {
    if (categoryId === "franchise" || categoryId === "campaign") {
        return FRANCHISE_COLUMNS;
    }
    if (source && FRANCHISE_CAMPAIGN_SOURCES.has(source)) {
        return FRANCHISE_COLUMNS;
    }
    return NON_FRANCHISE_COLUMNS;
};

const CATEGORIES = [
    { id: "admission", label: "Website", bg: "bg-blue-50 text-blue-800", subkey: "adm" },
    { id: "landing", label: "Landing", bg: "bg-teal-50 text-teal-800", subkey: "lnd" },
    { id: "contact", label: "Centerpage", bg: "bg-sky-50 text-sky-800", subkey: "cen" },
    { id: "campaign", label: "Campaign", bg: "bg-violet-50 text-violet-800", subkey: "cam" },
    { id: "franchise", label: "Franchise", bg: "bg-orange-50 text-orange-800", subkey: "fra" },
];

const CAMPAIGN_CHANNEL_CATEGORIES = [
    { id: "website", label: "Website", bg: "bg-violet-50 text-violet-800", subkey: "web" },
    { id: "facebook", label: "Facebook", bg: "bg-blue-50 text-blue-800", subkey: "fb" },
    { id: "instagram", label: "Instagram", bg: "bg-pink-50 text-pink-800", subkey: "ig" },
    { id: "july_lp", label: "Landingpage July", bg: "bg-amber-50 text-amber-800", subkey: "lp" },
    { id: "july_meta", label: "Meta July", bg: "bg-fuchsia-50 text-fuchsia-800", subkey: "meta" },
    { id: "lp_wb", label: "Landingpage-WB", bg: "bg-lime-50 text-lime-800", subkey: "lpwb" },
];

const CHANNEL_LABELS: Record<string, string> = {
    website: "Website",
    facebook: "Facebook",
    instagram: "Instagram",
    july_lp: "Landingpage July",
    july_meta: "Meta July",
    lp_wb: "Landingpage-WB",
};

function cityRowTotal(
    cityName: string,
    reportData: Record<string, any>,
    activeCategories: typeof CATEGORIES,
    source?: string,
): number {
    return activeCategories.reduce((sum, cat) => {
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

export default function ReportsView({ dateRange, city, state, source, userId, centreId }: ReportsViewProps) {
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

    const getSourceLabel = () => {
        if (source === "admission_all") return "Admission";
        if (source === "franchise_all") return "Franchise";
        if (source === "admission") return "Website";
        if (source === "contact") return "CenterPage";
        if (source && CHANNEL_LABELS[source]) return CHANNEL_LABELS[source];
        if (source === "campaign") return "Campaign";
        if (source === "franchise") return "Franchise";
        if (source === "landing") return "Landing";
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
        if (!source || source === "all") return CATEGORIES;
        if (source === "admission_all") {
            // Admission All = Website + Landing + Centerpage
            return CATEGORIES.filter(
                (c) => c.id === "admission" || c.id === "landing" || c.id === "contact",
            );
        }
        if (source === "franchise_all") {
            // Franchise All = Franchise Form + Campaign
            return CATEGORIES.filter((c) => c.id === "franchise" || c.id === "campaign");
        }
        if (source === "admission") {
            return CATEGORIES.filter((c) => c.id === "admission");
        }
        if (source === "campaign") return CAMPAIGN_CHANNEL_CATEGORIES;
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
    }, [source]);

    useEffect(() => {
        loadReportData();
    }, [dateRange, city, state, source, userId, centreId]);

    useEffect(() => {
        setPage(1);
    }, [city, pageSize, citySearch, sortKey, sortDir, hideEmptyCities, centreId]);

    const loadReportData = async () => {
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
            if (state && state.length > 0) params.append("state", state.join(","));
            if (city.length > 0) params.append("city", city.join(","));
            if (source && source !== "all") params.append("source", source);
            if (userId) params.append("userId", userId);
            if (centreId) params.append("centreId", centreId);

            const response = await api.get(`/leads/reports?${params.toString()}`);
            const data = response.data?.cities || {};
            const normalizedData: any = {};
            Object.keys(data).forEach((k) => {
                normalizedData[k.toLowerCase()] = data[k];
            });
            setReportData(normalizedData);
            // Empty city = All → use cities returned by the API
            if (city.length > 0) {
                setCities(city.map((name) => ({ name })));
            } else {
                const fromApi = Object.keys(data)
                    .map((name) => name.trim())
                    .filter(Boolean)
                    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
                    .map((name) => ({ name }));
                setCities(fromApi);
            }
        } catch (error) {
            console.error("Failed to load reports data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSortedCities = useMemo(() => {
        const search = citySearch.trim().toLowerCase();
        let rows = cities.map((c) => ({
            name: c.name,
            total: cityRowTotal(c.name, reportData, activeCategories, source),
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

    return (
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
    );
}

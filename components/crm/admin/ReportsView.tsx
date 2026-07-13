"use client";

import { useEffect, useState } from "react";
import api from "@/lib/crmApi";
import { Building2 } from "lucide-react";

interface ReportsViewProps {
    dateRange: { startDate: Date | null; endDate: Date | null };
    city: string[];
    state: string[];
    source?: string;
}

const STATUS_COLUMNS = [
    { label: "Untouched", keys: ["untouched", "new"] },
    { label: "Not Answering", keys: ["not_answering", "not_answering_calls", "called", "contacted"] },
    { label: "Follow Up", keys: ["follow_up", "hot", "warm", "cold", "interested"] },
    { label: "Visited School", keys: ["visited_school", "meeting_scheduled"] },
    { label: "Converted to Admission", keys: ["converted_admission", "converted", "converted_mou_signed", "converted_agreement_signed"] },
    { label: "Joined Competition", keys: ["joined_competition"] },
    { label: "Not Interested", keys: ["not_interested", "dropped", "join_later"] },
    { label: "Wrong Enquiry", keys: ["wrong_enquiry"] },
];

const CATEGORIES = [
    { id: "admission", label: "Admission Leads", bg: "bg-blue-50 text-blue-800", subkey: "adm" },
    { id: "contact", label: "CenterPage Leads", bg: "bg-sky-50 text-sky-800", subkey: "cen" },
    { id: "campaign", label: "Campaign Leads", bg: "bg-violet-50 text-violet-800", subkey: "cam" },
    { id: "franchise", label: "Franchise Leads", bg: "bg-orange-50 text-orange-800", subkey: "fra" },
];

export default function ReportsView({ dateRange, city, state, source }: ReportsViewProps) {
    const [cities, setCities] = useState<{ name: string }[]>([]);
    const [reportData, setReportData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const paginatedCities = cities.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => {
        setPage(1);
    }, [city, pageSize]);

    const activeCategories = source
        ? CATEGORIES.filter((c) => c.id === source)
        : CATEGORIES;

    useEffect(() => {
        loadReportData();
    }, [dateRange, city, state, source]);

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
            if (source) params.append("source", source);

            const response = await api.get(`/leads/reports?${params.toString()}`);
            const data = response.data?.cities || {};
            const normalizedData: any = {};
            Object.keys(data).forEach((k) => {
                normalizedData[k.toLowerCase()] = data[k];
            });
            setReportData(normalizedData);
            
            // Always display the requested cities, regardless of whether they have data
            setCities(city.map(name => ({ name })).sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error("Failed to load reports data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                        <tr>
                            <th rowSpan={2} className="border border-gray-200 p-4 bg-gray-50 font-bold text-gray-800 align-bottom w-48 sticky left-0 z-20">
                                City
                            </th>
                            {activeCategories.map((cat) => (
                                <th key={cat.id} colSpan={STATUS_COLUMNS.length} className={`border border-gray-200 p-3 ${cat.bg} text-center font-bold text-lg`}>
                                    {cat.label}
                                </th>
                            ))}
                            <th rowSpan={2} className="border border-gray-200 p-4 bg-gray-100 text-gray-900 text-center font-bold text-lg align-bottom whitespace-nowrap">
                                Overall Total
                            </th>
                        </tr>
                        <tr>
                            {activeCategories.map((cat) =>
                                STATUS_COLUMNS.map((col) => (
                                    <th key={`${cat.subkey}-${col.label}`} className="border border-gray-200 p-3 bg-gray-50 text-sm font-semibold text-gray-600 text-center whitespace-nowrap">
                                        {col.label}
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={STATUS_COLUMNS.length * activeCategories.length + 2} className="border border-gray-200 p-8 text-center">
                                    <div className="flex justify-center">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                    </div>
                                </td>
                            </tr>
                        ) : cities.length === 0 ? (
                            <tr>
                                <td colSpan={STATUS_COLUMNS.length * activeCategories.length + 2} className="border border-gray-200 p-8 text-center text-gray-500">
                                    No cities found.
                                </td>
                            </tr>
                        ) : (
                            paginatedCities.map((city, idx) => {
                                const rowOverallTotal = STATUS_COLUMNS.reduce(
                                    (s, col) =>
                                        s +
                                        col.keys.reduce(
                                            (acc, k) =>
                                                acc +
                                                activeCategories.reduce(
                                                    (sum, cat) => sum + (reportData[city.name.toLowerCase()]?.[cat.id]?.[k] || 0),
                                                    0
                                                ),
                                            0
                                        ),
                                    0
                                );
                                return (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="border border-gray-200 p-3 font-semibold text-gray-800 sticky left-0 bg-white z-10">
                                            {city.name}
                                        </td>
                                        {activeCategories.map((cat) =>
                                            STATUS_COLUMNS.map((col) => {
                                                const sum = col.keys.reduce((acc, k) => acc + (reportData[city.name.toLowerCase()]?.[cat.id]?.[k] || 0), 0);
                                                return (
                                                    <td key={`${cat.subkey}-${city.name}-${col.label}`} className="border border-gray-200 p-3 text-center text-gray-700 font-medium">
                                                        {sum || "-"}
                                                    </td>
                                                );
                                            })
                                        )}
                                        <td className="border border-gray-200 p-3 text-center text-gray-900 font-bold bg-gray-100/50 text-lg">
                                            {rowOverallTotal || "-"}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        {!loading && cities.length > 0 && (
                            <tr className="bg-gray-100 font-bold sticky bottom-0 z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
                                <td className="border border-gray-200 p-3 text-gray-900 sticky left-0 bg-gray-100 z-10 uppercase tracking-wider text-sm">
                                    Total
                                </td>
                                {activeCategories.map((cat) =>
                                    STATUS_COLUMNS.map((col) => {
                                        const colTotal = cities.reduce((sum, city) => sum + col.keys.reduce((acc, k) => acc + (reportData[city.name.toLowerCase()]?.[cat.id]?.[k] || 0), 0), 0);
                                        return <td key={`total-${cat.subkey}-${col.label}`} className={`border border-gray-200 p-3 text-center ${cat.bg}`}>{colTotal || "-"}</td>;
                                    })
                                )}
                                <td className="border border-gray-200 p-3 text-center text-gray-900 font-bold bg-gray-300/50 text-lg">
                                    {cities.reduce((sum, city) => sum + STATUS_COLUMNS.reduce((s, col) => s + col.keys.reduce((acc, k) => acc + activeCategories.reduce((cSum, cat) => cSum + (reportData[city.name.toLowerCase()]?.[cat.id]?.[k] || 0), 0), 0), 0), 0) || "-"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination Controls */}
            {!loading && cities.length > 0 && (() => {
                const totalPages = Math.ceil(cities.length / pageSize);
                
                const getPageNumbers = () => {
                    const items: (number | string)[] = [];
                    if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++) items.push(i);
                    } else {
                        if (page <= 4) {
                            items.push(1, 2, 3, 4, 5, "...", totalPages);
                        } else if (page >= totalPages - 3) {
                            items.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                        } else {
                            items.push(1, "...", page - 1, page, page + 1, "...", totalPages);
                        }
                    }
                    return items;
                };

                return (
                    <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50/50 text-sm text-gray-500 gap-4">
                        <div className="flex items-center gap-4">
                            <span>
                                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, cities.length)} of {cities.length} cities
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

                            {getPageNumbers().map((item, idx) => (
                                item === "..." ? (
                                    <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400">...</span>
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
                                )
                            ))}

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

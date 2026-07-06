"use client";

import { useEffect, useState } from "react";
import api from "@/lib/crmApi";
import { Building2 } from "lucide-react";

interface ReportsViewProps {
    dateRange: { startDate: Date | null; endDate: Date | null };
    city: string[];
}

const STATUS_COLUMNS = [
    { label: "Pending", keys: ["new"] },
    { label: "Called/Contacted", keys: ["contacted", "called"] },
    { label: "Follow Up", keys: ["follow_up"] },
    { label: "Interested", keys: ["interested"] },
    { label: "Meeting Scheduled", keys: ["meeting_scheduled"] },
    { label: "Dropped/Not Interested", keys: ["dropped", "not_interested"] },
    { label: "Converted", keys: ["converted"] },
];

export default function ReportsView({ dateRange, city }: ReportsViewProps) {
    const [cities, setCities] = useState<{ name: string }[]>([]);
    const [reportData, setReportData] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReportData();
    }, [dateRange, city]);

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
            if (city.length > 0) params.append("city", city.join(","));

            const response = await api.get(`/leads/reports?${params.toString()}`);
            const data = response.data?.cities || {};
            setReportData(data);
            
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
                            <th colSpan={STATUS_COLUMNS.length} className="border border-gray-200 p-3 bg-blue-50 text-blue-800 text-center font-bold text-lg">
                                Admission Leads
                            </th>
                            <th colSpan={STATUS_COLUMNS.length} className="border border-gray-200 p-3 bg-sky-50 text-sky-800 text-center font-bold text-lg">
                                CenterPage Leads
                            </th>
                            <th colSpan={STATUS_COLUMNS.length} className="border border-gray-200 p-3 bg-violet-50 text-violet-800 text-center font-bold text-lg">
                                Campaign Leads
                            </th>
                            <th colSpan={STATUS_COLUMNS.length} className="border border-gray-200 p-3 bg-orange-50 text-orange-800 text-center font-bold text-lg">
                                Franchise Leads
                            </th>
                            <th rowSpan={2} className="border border-gray-200 p-4 bg-gray-100 text-gray-900 text-center font-bold text-lg align-bottom whitespace-nowrap">
                                Overall Total
                            </th>
                        </tr>
                        <tr>
                            {/* Admission Sub-headers */}
                            {STATUS_COLUMNS.map((col) => (
                                <th key={`adm-${col.label}`} className="border border-gray-200 p-3 bg-gray-50 text-sm font-semibold text-gray-600 text-center whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                            {/* Center Sub-headers */}
                            {STATUS_COLUMNS.map((col) => (
                                <th key={`cen-${col.label}`} className="border border-gray-200 p-3 bg-gray-50 text-sm font-semibold text-gray-600 text-center whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                            {/* Campaign Sub-headers */}
                            {STATUS_COLUMNS.map((col) => (
                                <th key={`cam-${col.label}`} className="border border-gray-200 p-3 bg-gray-50 text-sm font-semibold text-gray-600 text-center whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                            {/* Franchise Sub-headers */}
                            {STATUS_COLUMNS.map((col) => (
                                <th key={`fra-${col.label}`} className="border border-gray-200 p-3 bg-gray-50 text-sm font-semibold text-gray-600 text-center whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={STATUS_COLUMNS.length * 4 + 2} className="border border-gray-200 p-8 text-center">
                                    <div className="flex justify-center">
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                    </div>
                                </td>
                            </tr>
                        ) : cities.length === 0 ? (
                            <tr>
                                <td colSpan={STATUS_COLUMNS.length * 4 + 2} className="border border-gray-200 p-8 text-center text-gray-500">
                                    No cities found.
                                </td>
                            </tr>
                        ) : (
                            cities.map((city, idx) => {
                                const rowOverallTotal = STATUS_COLUMNS.reduce((s, col) => s + col.keys.reduce((acc, k) => acc + (reportData[city.name]?.admission?.[k] || 0) + (reportData[city.name]?.contact?.[k] || 0) + (reportData[city.name]?.campaign?.[k] || 0) + (reportData[city.name]?.franchise?.[k] || 0), 0), 0);
                                return (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="border border-gray-200 p-3 font-semibold text-gray-800 sticky left-0 bg-white z-10">
                                            {city.name}
                                        </td>
                                        {/* Admission Cells */}
                                        {STATUS_COLUMNS.map((col) => {
                                            const sum = col.keys.reduce((acc, k) => acc + (reportData[city.name]?.admission?.[k] || 0), 0);
                                            return (
                                                <td key={`adm-${city.name}-${col.label}`} className="border border-gray-200 p-3 text-center text-gray-700 font-medium">
                                                    {sum || "-"}
                                                </td>
                                            );
                                        })}
                                        {/* Center Cells */}
                                        {STATUS_COLUMNS.map((col) => {
                                            const sum = col.keys.reduce((acc, k) => acc + (reportData[city.name]?.contact?.[k] || 0), 0);
                                            return (
                                                <td key={`cen-${city.name}-${col.label}`} className="border border-gray-200 p-3 text-center text-gray-700 font-medium">
                                                    {sum || "-"}
                                                </td>
                                            );
                                        })}
                                        {/* Campaign Cells */}
                                        {STATUS_COLUMNS.map((col) => {
                                            const sum = col.keys.reduce((acc, k) => acc + (reportData[city.name]?.campaign?.[k] || 0), 0);
                                            return (
                                                <td key={`cam-${city.name}-${col.label}`} className="border border-gray-200 p-3 text-center text-gray-700 font-medium">
                                                    {sum || "-"}
                                                </td>
                                            );
                                        })}
                                        {/* Franchise Cells */}
                                        {STATUS_COLUMNS.map((col) => {
                                            const sum = col.keys.reduce((acc, k) => acc + (reportData[city.name]?.franchise?.[k] || 0), 0);
                                            return (
                                                <td key={`fra-${city.name}-${col.label}`} className="border border-gray-200 p-3 text-center text-gray-700 font-medium">
                                                    {sum || "-"}
                                                </td>
                                            );
                                        })}
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
                                {STATUS_COLUMNS.map((col) => {
                                    const colTotal = cities.reduce((sum, city) => sum + col.keys.reduce((acc, k) => acc + (reportData[city.name]?.admission?.[k] || 0), 0), 0);
                                    return <td key={`total-adm-${col.label}`} className="border border-gray-200 p-3 text-center text-blue-900">{colTotal || "-"}</td>;
                                })}
                                {STATUS_COLUMNS.map((col) => {
                                    const colTotal = cities.reduce((sum, city) => sum + col.keys.reduce((acc, k) => acc + (reportData[city.name]?.contact?.[k] || 0), 0), 0);
                                    return <td key={`total-cen-${col.label}`} className="border border-gray-200 p-3 text-center text-sky-900">{colTotal || "-"}</td>;
                                })}
                                {STATUS_COLUMNS.map((col) => {
                                    const colTotal = cities.reduce((sum, city) => sum + col.keys.reduce((acc, k) => acc + (reportData[city.name]?.campaign?.[k] || 0), 0), 0);
                                    return <td key={`total-cam-${col.label}`} className="border border-gray-200 p-3 text-center text-violet-900">{colTotal || "-"}</td>;
                                })}
                                {STATUS_COLUMNS.map((col) => {
                                    const colTotal = cities.reduce((sum, city) => sum + col.keys.reduce((acc, k) => acc + (reportData[city.name]?.franchise?.[k] || 0), 0), 0);
                                    return <td key={`total-fra-${col.label}`} className="border border-gray-200 p-3 text-center text-orange-900">{colTotal || "-"}</td>;
                                })}
                                <td className="border border-gray-200 p-3 text-center text-gray-900 font-bold bg-gray-300/50 text-lg">
                                    {cities.reduce((sum, city) => sum + STATUS_COLUMNS.reduce((s, col) => s + col.keys.reduce((acc, k) => acc + ((reportData[city.name]?.admission?.[k] || 0) + (reportData[city.name]?.contact?.[k] || 0) + (reportData[city.name]?.campaign?.[k] || 0) + (reportData[city.name]?.franchise?.[k] || 0)), 0), 0), 0) || "-"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

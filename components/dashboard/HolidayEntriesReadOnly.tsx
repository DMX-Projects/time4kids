"use client";

import { formatHolidayDate, type HolidayEntry } from "@/config/holiday-entries";

export function HolidayEntriesReadOnly({
    rows,
    title,
    emptyMessage = "No holidays added yet.",
}: {
    rows: HolidayEntry[];
    title: string;
    emptyMessage?: string;
}) {
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs font-semibold text-slate-700">{title}</p>
                <p className="mt-1 text-[11px] text-slate-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2">
            <p className="px-1 text-xs font-semibold text-slate-700 mb-1">{title}</p>
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                    <thead>
                        <tr className="text-left text-slate-500">
                            <th className="px-2 py-1 font-semibold">Date</th>
                            <th className="px-2 py-1 font-semibold">Holiday</th>
                            <th className="px-2 py-1 font-semibold">City</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={`${row.date}-${index}`} className="text-slate-800">
                                <td className="px-2 py-1 whitespace-nowrap">{formatHolidayDate(row.date)}</td>
                                <td className="px-2 py-1">{row.name}</td>
                                <td className="px-2 py-1">{row.city || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default HolidayEntriesReadOnly;

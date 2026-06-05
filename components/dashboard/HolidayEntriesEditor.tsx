"use client";

import { Plus, Trash2 } from "lucide-react";
import type { HolidayEntry } from "@/config/holiday-entries";
import { emptyHolidayEntry } from "@/config/holiday-entries";

type Props = {
    rows: HolidayEntry[];
    onChange: (rows: HolidayEntry[]) => void;
    compact?: boolean;
};

export function HolidayEntriesEditor({ rows, onChange, compact = false }: Props) {
    const updateRow = (index: number, patch: Partial<HolidayEntry>) => {
        onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    const removeRow = (index: number) => {
        onChange(rows.filter((_, i) => i !== index));
    };

    const addRow = () => {
        onChange([...rows, emptyHolidayEntry()]);
    };

    const displayRows = rows.length > 0 ? rows : [emptyHolidayEntry()];

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-700">Your centre — add or update</p>
                <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add row
                </button>
            </div>
            <p className="text-[11px] text-slate-500">Add city, holiday name, and date for each holiday.</p>
            <div className={`overflow-x-auto rounded-xl border border-slate-200 ${compact ? "" : "bg-slate-50 p-2"}`}>
                <table className="min-w-full text-xs">
                    <thead>
                        <tr className="text-left text-slate-500">
                            <th className="px-2 py-1.5 font-semibold">Date</th>
                            <th className="px-2 py-1.5 font-semibold">Holiday</th>
                            <th className="px-2 py-1.5 font-semibold">City</th>
                            <th className="px-2 py-1.5 w-8" />
                        </tr>
                    </thead>
                    <tbody>
                        {displayRows.map((row, index) => (
                            <tr key={index} className="align-top">
                                <td className="px-2 py-1">
                                    <input
                                        type="date"
                                        value={row.date}
                                        onChange={(e) => updateRow(index, { date: e.target.value })}
                                        className="w-full min-w-[8.5rem] rounded-lg border border-slate-200 px-2 py-1.5 text-sm bg-white"
                                    />
                                </td>
                                <td className="px-2 py-1">
                                    <input
                                        type="text"
                                        value={row.name}
                                        onChange={(e) => updateRow(index, { name: e.target.value })}
                                        placeholder="e.g. Diwali"
                                        className="w-full min-w-[8rem] rounded-lg border border-slate-200 px-2 py-1.5 text-sm bg-white"
                                    />
                                </td>
                                <td className="px-2 py-1">
                                    <input
                                        type="text"
                                        value={row.city}
                                        onChange={(e) => updateRow(index, { city: e.target.value })}
                                        placeholder="e.g. Hyderabad"
                                        className="w-full min-w-[8rem] rounded-lg border border-slate-200 px-2 py-1.5 text-sm bg-white"
                                    />
                                </td>
                                <td className="px-2 py-1">
                                    {displayRows.length > 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            className="rounded p-1 text-red-600 hover:bg-red-50"
                                            aria-label="Remove row"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default HolidayEntriesEditor;

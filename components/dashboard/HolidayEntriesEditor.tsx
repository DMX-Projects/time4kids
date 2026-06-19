"use client";

import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { cityLabelsFromUnknown } from "@/lib/cms-publish-target";
import type { HolidayEntry } from "@/config/holiday-entries";
import { emptyHolidayEntry } from "@/config/holiday-entries";

type Props = {
    rows: HolidayEntry[];
    onChange: (rows: HolidayEntry[]) => void;
    compact?: boolean;
    /** When set, city is chosen from a dropdown (admin CMS). */
    cityOptions?: string[];
    /** Prefill city on new rows (centre uploads). */
    defaultCity?: string;
    /** Lock city to defaultCity for every row (centre uploads). */
    lockCity?: boolean;
};

const selectClass =
    "w-full min-w-[8rem] rounded-lg border border-slate-200 px-2 py-1.5 text-sm bg-white";

export function HolidayEntriesEditor({
    rows = [],
    onChange,
    compact = false,
    cityOptions,
    defaultCity = "",
    lockCity = false,
}: Props) {
    const prefilledCity = defaultCity.trim();

    const effectiveCityOptions = useMemo(() => {
        if (cityOptions === undefined) return [];
        const seen = new Set<string>();
        const out: string[] = [];
        const add = (raw: unknown) => {
            for (const city of cityLabelsFromUnknown(raw)) {
                const key = city.toLowerCase();
                if (seen.has(key)) continue;
                seen.add(key);
                out.push(city);
            }
        };
        if (Array.isArray(cityOptions)) {
            for (const city of cityOptions) add(city);
        }
        for (const row of rows) add(row.city);
        if (lockCity) add(prefilledCity);
        return out.sort((a, b) => a.localeCompare(b));
    }, [cityOptions, rows, lockCity, prefilledCity]);

    const citySelectOptions = useMemo(
        () => effectiveCityOptions.map((city) => ({ value: city, label: city })),
        [effectiveCityOptions],
    );

    const useCityDropdown = cityOptions !== undefined || (lockCity && Boolean(prefilledCity));

    const updateRow = (index: number, patch: Partial<HolidayEntry>) => {
        const merged =
            lockCity && prefilledCity ? { ...patch, city: prefilledCity } : patch;
        onChange(rows.map((row, i) => (i === index ? { ...row, ...merged } : row)));
    };

    const removeRow = (index: number) => {
        onChange(rows.filter((_, i) => i !== index));
    };

    const addRow = () => {
        onChange([...rows, emptyHolidayEntry(lockCity ? prefilledCity : "")]);
    };

    const displayRows =
        rows.length > 0 ? rows : [emptyHolidayEntry(lockCity ? prefilledCity : "")];

    const renderCityField = (row: HolidayEntry, index: number) => {
        if (lockCity && prefilledCity) {
            return (
                <input
                    type="text"
                    value={prefilledCity}
                    readOnly
                    className={`${selectClass} bg-slate-50 text-slate-600`}
                    title="City is set from your centre profile"
                />
            );
        }

        if (useCityDropdown) {
            return (
                <SearchableSelect
                    value={row.city}
                    onChange={(city) => updateRow(index, { city })}
                    options={citySelectOptions}
                    placeholder="Select city"
                    searchPlaceholder="Search city…"
                    emptyMessage="No city matches your search."
                    menuPortal
                    className="min-w-[8rem] [&_button]:mt-0 [&_button]:rounded-lg [&_button]:py-1.5"
                />
            );
        }

        return (
            <input
                type="text"
                value={row.city}
                onChange={(e) => updateRow(index, { city: e.target.value })}
                placeholder="e.g. Hyderabad"
                className={selectClass}
            />
        );
    };

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
            <p className="text-[11px] text-slate-500">
                {lockCity && prefilledCity
                    ? `City is set to ${prefilledCity} from your centre profile. Add holiday name and date for each row.`
                    : useCityDropdown
                      ? "Search or select city, holiday name, and date for each holiday."
                      : "Add city, holiday name, and date for each holiday."}
            </p>
            {useCityDropdown && !lockCity && effectiveCityOptions.length === 0 ? (
                <p className="text-[11px] text-amber-800">
                    No cities found on centres — add a city on each centre under Franchise centres first.
                </p>
            ) : null}
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
                                <td className="px-2 py-1">{renderCityField(row, index)}</td>
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

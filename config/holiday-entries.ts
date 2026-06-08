export type HolidayEntry = {
    city: string;
    name: string;
    date: string;
};

export const emptyHolidayEntry = (): HolidayEntry => ({ city: "", name: "", date: "" });

export function parseHolidayEntries(raw: unknown): HolidayEntry[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((row) => {
            if (!row || typeof row !== "object") return emptyHolidayEntry();
            const obj = row as Record<string, unknown>;
            return {
                city: String(obj.city || "").trim(),
                name: String(obj.name || obj.holiday || "").trim(),
                date: String(obj.date || "").trim().slice(0, 10),
            };
        })
        .filter((row) => row.city || row.name || row.date);
}

export function validateHolidayEntries(rows: HolidayEntry[]): string | null {
    const filled = rows.filter((row) => row.city || row.name || row.date);
    if (filled.length === 0) return null;
    for (let i = 0; i < filled.length; i += 1) {
        const row = filled[i];
        if (!row.name.trim()) return `Row ${i + 1}: holiday name is required.`;
        if (!row.date.trim()) return `Row ${i + 1}: date is required.`;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) return `Row ${i + 1}: use YYYY-MM-DD for date.`;
    }
    return null;
}

export function requireHolidayEntries(rows: HolidayEntry[]): string | null {
    const err = validateHolidayEntries(rows);
    if (err) return err;
    if (serializeHolidayEntries(rows).length === 0) {
        return "Add at least one holiday with a date.";
    }
    return null;
}

export function serializeHolidayEntries(rows: HolidayEntry[]): HolidayEntry[] {
    return rows
        .map((row) => ({
            city: row.city.trim(),
            name: row.name.trim(),
            date: row.date.trim().slice(0, 10),
        }))
        .filter((row) => row.name && row.date)
        .sort((a, b) => a.date.localeCompare(b.date));
}

/** Head office base + centre additions/overrides (same date replaces HO row). */
export function mergeHolidayEntries(globalRows: HolidayEntry[], centreRows: HolidayEntry[]): HolidayEntry[] {
    const byDate = new Map<string, HolidayEntry>();
    for (const row of globalRows) {
        if (row.date) byDate.set(row.date, { ...row });
    }
    for (const row of centreRows) {
        if (row.date) byDate.set(row.date, { ...row });
    }
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function formatHolidayDate(value: string): string {
    if (!value) return "";
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const MONTH_LABELS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export function holidayEntryYears(rows: HolidayEntry[]): string[] {
    const years = new Set<string>();
    for (const row of rows) {
        const y = (row.date || "").slice(0, 4);
        if (/^\d{4}$/.test(y)) years.add(y);
    }
    return Array.from(years).sort();
}

/** Filter by month (01–12 or "" = all) and year (YYYY or "" = all). */
export function filterHolidayEntriesByMonthYear(
    rows: HolidayEntry[],
    month: string,
    year: string,
): HolidayEntry[] {
    return rows.filter((row) => {
        const date = row.date || "";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
        if (year && !date.startsWith(`${year}-`)) return false;
        if (month && date.slice(5, 7) !== month) return false;
        return true;
    });
}

/** Exact date (YYYY-MM-DD) wins; otherwise month + year. */
export function filterHolidayEntries(
    rows: HolidayEntry[],
    opts: { month: string; year: string; date: string },
): HolidayEntry[] {
    const exact = (opts.date || "").trim().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(exact)) {
        return rows.filter((row) => row.date === exact);
    }
    return filterHolidayEntriesByMonthYear(rows, opts.month, opts.year);
}

export function monthSelectOptions(): { value: string; label: string }[] {
    return [
        { value: "", label: "All months" },
        ...MONTH_LABELS.map((label, index) => ({
            value: String(index + 1).padStart(2, "0"),
            label,
        })),
    ];
}

export function formatMonthYearFilter(month: string, year: string): string {
    if (!month && !year) return "All dates";
    const monthLabel = month ? MONTH_LABELS[Number(month) - 1] || month : "All months";
    if (year && month) return `${monthLabel} ${year}`;
    if (year) return year;
    return monthLabel;
}

export function formatHolidayDateFilter(month: string, year: string, date: string): string {
    const exact = (date || "").trim().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(exact)) return formatHolidayDate(exact);
    return formatMonthYearFilter(month, year);
}

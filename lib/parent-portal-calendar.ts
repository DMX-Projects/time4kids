export type PortalCalendarItemType = "event" | "homework" | "announcement" | "newsletter";

export type PortalCalendarItem = {
    id: string;
    type: PortalCalendarItemType;
    title: string;
    /** Primary date (YYYY-MM-DD). */
    date: string;
    endDate?: string;
    detail?: string;
};

export const PORTAL_CALENDAR_TYPE_LABELS: Record<PortalCalendarItemType, string> = {
    event: "Event",
    homework: "Homework",
    announcement: "Announcement",
    newsletter: "Newsletter",
};

export const PORTAL_CALENDAR_TYPE_COLORS: Record<PortalCalendarItemType, string> = {
    event: "bg-violet-500",
    homework: "bg-sky-500",
    announcement: "bg-orange-500",
    newsletter: "bg-emerald-500",
};

export function sliceDate(value: unknown): string {
    return String(value || "").slice(0, 10);
}

export function toLocalMonth(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

export function monthStartEnd(month: string): { from: string; to: string } {
    const [y, m] = month.split("-").map(Number);
    const last = new Date(y, m, 0).getDate();
    return {
        from: `${month}-01`,
        to: `${month}-${String(last).padStart(2, "0")}`,
    };
}

export function eachDateInRange(start: string, end: string): string[] {
    const s = sliceDate(start);
    const e = sliceDate(end || start);
    if (!s) return [];
    if (!e || e < s) return [s];

    const out: string[] = [];
    const cursor = new Date(`${s}T12:00:00`);
    const endDate = new Date(`${e}T12:00:00`);
    while (cursor <= endDate) {
        const y = cursor.getFullYear();
        const mo = String(cursor.getMonth() + 1).padStart(2, "0");
        const da = String(cursor.getDate()).padStart(2, "0");
        out.push(`${y}-${mo}-${da}`);
        cursor.setDate(cursor.getDate() + 1);
    }
    return out;
}

export function itemsForDate(items: PortalCalendarItem[], date: string): PortalCalendarItem[] {
    const d = sliceDate(date);
    return items.filter((item) => {
        const start = sliceDate(item.date);
        const end = sliceDate(item.endDate || item.date);
        if (!start) return false;
        return d >= start && d <= end;
    });
}

export function itemTypesOnDate(items: PortalCalendarItem[], date: string): PortalCalendarItemType[] {
    const types = new Set<PortalCalendarItemType>();
    for (const item of itemsForDate(items, date)) types.add(item.type);
    return Array.from(types);
}

/** Build a 6-row month grid (Mon–Sun) with YYYY-MM-DD or null for padding. */
export function buildMonthGrid(month: string): (string | null)[][] {
    const [year, mon] = month.split("-").map(Number);
    const firstDow = new Date(year, mon - 1, 1).getDay();
    const mondayStart = (firstDow + 6) % 7;
    const daysInMonth = new Date(year, mon, 0).getDate();

    const cells: (string | null)[] = [];
    for (let i = 0; i < mondayStart; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push(`${month}-${String(day).padStart(2, "0")}`);
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (string | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }
    while (weeks.length < 6) weeks.push(Array(7).fill(null));
    return weeks;
}

export function formatMonthLabel(month: string): string {
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
}

export function shiftMonth(month: string, delta: number): string {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return toLocalMonth(d);
}

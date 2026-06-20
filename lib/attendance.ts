export type AttendanceResolvedStatus = "PRESENT" | "ABSENT" | "UNMARKED" | "HOLIDAY";

export type AttendanceSummary = {
    month?: string;
    total_days: number;
    present: number;
    absent: number;
    unmarked: number;
    holiday: number;
    marked_days: number;
    working_days: number;
    attendance_percentage: number | null;
};

export type HolidayDateRow = {
    date: string;
    label: string;
};

export type FranchiseAttendanceDayInfo = {
    date: string;
    is_holiday: boolean;
    holiday_label: string;
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceResolvedStatus, string> = {
    PRESENT: "Present",
    ABSENT: "Absent",
    UNMARKED: "Unmarked",
    HOLIDAY: "Holiday",
};

/** Statuses the centre can save (Unmarked = omit from save). */
export const ATTENDANCE_SAVE_STATUSES = ["PRESENT", "ABSENT", "HOLIDAY"] as const;
export type AttendanceSaveStatus = (typeof ATTENDANCE_SAVE_STATUSES)[number];

/** All four options shown in the centre dropdown. */
export const ATTENDANCE_DROPDOWN_STATUSES: AttendanceResolvedStatus[] = [
    "UNMARKED",
    "PRESENT",
    "ABSENT",
    "HOLIDAY",
];

/** @deprecated Use ATTENDANCE_SAVE_STATUSES */
export const ATTENDANCE_MARKABLE_STATUSES = ATTENDANCE_SAVE_STATUSES;

export function isAttendanceSaveStatus(value: string): value is AttendanceSaveStatus {
    return (ATTENDANCE_SAVE_STATUSES as readonly string[]).includes(value);
}

export function attendanceStatusLabel(status: string): string {
    const normalized = (status || "").trim().toUpperCase();
    if (!normalized || normalized === "UNMARKED") return ATTENDANCE_STATUS_LABELS.UNMARKED;
    if (normalized in ATTENDANCE_STATUS_LABELS) {
        return ATTENDANCE_STATUS_LABELS[normalized as AttendanceResolvedStatus];
    }
    return status;
}

export function attendanceStatusRowClass(status: string): string {
    const s = (status || "UNMARKED").toUpperCase();
    if (s === "PRESENT") return "border-green-100 bg-green-50/40";
    if (s === "ABSENT") return "border-red-100 bg-red-50/50";
    if (s === "HOLIDAY") return "border-violet-100 bg-violet-50/50";
    return "border-gray-200 bg-gray-50/60";
}

export function attendanceStatusClass(status: string): string {
    const s = status.toUpperCase();
    if (s === "PRESENT") return "text-green-700";
    if (s === "ABSENT") return "text-red-700";
    if (s === "HOLIDAY") return "text-violet-700";
    if (s === "UNMARKED") return "text-gray-600";
    if (s === "LATE") return "text-amber-700";
    return "text-orange-900";
}

export function formatAttendancePercentage(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    return `${value}%`;
}

export function extractAttendanceList(data: unknown): unknown[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj.attendance)) return obj.attendance;
        if (Array.isArray(obj.results)) return obj.results;
    }
    return [];
}

export function extractAttendanceSummary(data: unknown, month?: string): AttendanceSummary | null {
    if (!data || typeof data !== "object") return null;
    const obj = data as Record<string, unknown>;
    if (obj.attendance_summary && typeof obj.attendance_summary === "object") {
        return obj.attendance_summary as AttendanceSummary;
    }
    const byMonth = obj.attendance_summary_by_month;
    if (byMonth && typeof byMonth === "object" && month) {
        const row = (byMonth as Record<string, unknown>)[month];
        if (row && typeof row === "object") return row as AttendanceSummary;
    }
    return null;
}

export function extractFranchiseDayInfo(data: unknown): FranchiseAttendanceDayInfo | null {
    if (!data || typeof data !== "object") return null;
    const info = (data as Record<string, unknown>).day_info;
    if (!info || typeof info !== "object") return null;
    const row = info as Record<string, unknown>;
    return {
        date: String(row.date || ""),
        is_holiday: Boolean(row.is_holiday),
        holiday_label: String(row.holiday_label || ""),
    };
}

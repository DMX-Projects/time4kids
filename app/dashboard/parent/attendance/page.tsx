"use client";



import { useEffect, useMemo, useState } from "react";

import dynamic from "next/dynamic";

import { CalendarCheck, ChevronDown, ChevronRight } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";

import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";

import {
    attendanceStatusClass,
    attendanceStatusLabel,
    extractAttendanceList,
    extractAttendanceSummary,
    formatAttendancePercentage,
    type AttendanceSummary,
} from "@/lib/attendance";

import { localDateString } from "@/lib/parent-portal-calendar";

import { withParentScopedQuery } from "@/lib/parent-student-query";



const ParentPortalCalendarPanel = dynamic(

    () => import("@/components/dashboard/shared/ParentPortalCalendarPanel").then((m) => m.ParentPortalCalendarPanel),

    { ssr: false },

);



const MONTH_PREVIEW_ROWS = 6;



type Row = {

    id: number;

    date: string;

    status: string;

    note?: string;

    student?: number;

    student_id?: number;

    student_name?: string;

    class_name?: string;

};

type CombinedPayload = {

    attendance?: unknown;

    attendance_for_date?: Row | null;

    attendance_summary?: AttendanceSummary | null;

    attendance_summary_by_month?: Record<string, AttendanceSummary>;

    resolved_attendance?: Row | null;

    selected_date?: string | null;

};



function formatMonthLabel(monthKey: string): string {

    if (!monthKey || monthKey === "—") return "Unknown month";

    const [year, month] = monthKey.split("-");

    const d = new Date(Number(year), Number(month) - 1, 1);

    if (Number.isNaN(d.getTime())) return monthKey;

    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

}



function formatDayLabel(dateStr: string): string {

    if (!dateStr) return "Selected date";

    return new Date(`${dateStr.slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, {

        weekday: "long",

        day: "numeric",

        month: "long",

        year: "numeric",

    });

}



function statusClass(status: string): string {
    return attendanceStatusClass(status);
}



export default function AttendancePage() {

    const { authFetch } = useAuth();

    const { selectedStudent, hasMultipleChildren, studentScopeReady } = useParentData();

    const [selectedDate, setSelectedDate] = useState(() => localDateString());

    const [rows, setRows] = useState<Row[]>([]);

    const [dayAttendance, setDayAttendance] = useState<Row | null>(null);

    const [loading, setLoading] = useState(true);

    const [dayLoading, setDayLoading] = useState(true);

    const [openMonths, setOpenMonths] = useState<Set<string>>(() => new Set());

    const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => new Set());

    const [monthSummary, setMonthSummary] = useState<AttendanceSummary | null>(null);

    const [summariesByMonth, setSummariesByMonth] = useState<Record<string, AttendanceSummary>>({});



    useEffect(() => {

        if (!studentScopeReady || !selectedStudent?.id) return;

        let c = false;

        setRows([]);

        setLoading(true);

        (async () => {

            try {

                const payload = await authFetch<CombinedPayload>(

                    withParentScopedQuery("/students/parent/calendar-attendance/", selectedStudent.id),

                );

                const attendanceList = extractAttendanceList(payload) as Row[];

                if (!c) {
                    setRows(attendanceList);
                    setSummariesByMonth(payload?.attendance_summary_by_month || {});
                    setMonthSummary(
                        extractAttendanceSummary(payload, selectedDate.slice(0, 7)) ||
                            payload?.attendance_summary ||
                            null,
                    );
                }

            } catch {

                if (!c) {
                    setRows([]);
                    setMonthSummary(null);
                    setSummariesByMonth({});
                }

            } finally {

                if (!c) setLoading(false);

            }

        })();

        return () => {

            c = true;

        };

    }, [authFetch, studentScopeReady, selectedStudent?.id]);



    useEffect(() => {

        if (!studentScopeReady || !selectedStudent?.id || !selectedDate) return;

        let c = false;

        setDayLoading(true);

        (async () => {

            try {

                const payload = await authFetch<CombinedPayload>(

                    withParentScopedQuery(

                        "/students/parent/calendar-attendance/",

                        selectedStudent.id,

                        selectedDate,

                    ),

                );

                if (c) return;

                const list = extractAttendanceList(payload) as Row[];
                const resolved = payload?.resolved_attendance || list[0] || null;
                setDayAttendance(resolved);
                setMonthSummary(
                    extractAttendanceSummary(payload, selectedDate.slice(0, 7)) ||
                        payload?.attendance_summary ||
                        null,
                );
                if (payload?.attendance_summary_by_month) {
                    setSummariesByMonth(payload.attendance_summary_by_month);
                }

            } catch {

                if (!c) setDayAttendance(null);

            } finally {

                if (!c) setDayLoading(false);

            }

        })();

        return () => {

            c = true;

        };

    }, [authFetch, selectedDate, selectedStudent?.id, studentScopeReady]);



    const visibleRows = useMemo(() => rows, [rows]);



    const byMonth = useMemo(() => {

        const m = new Map<string, Row[]>();

        for (const r of visibleRows) {

            const key = r.date ? r.date.slice(0, 7) : "—";

            m.set(key, [...(m.get(key) || []), r]);

        }

        return Array.from(m.entries())

            .sort(([a], [b]) => (a > b ? -1 : 1))

            .map(([month, items]) => [month, items.sort((a, b) => (a.date > b.date ? -1 : 1))] as const);

    }, [visibleRows]);



    useEffect(() => {

        if (byMonth.length === 0) return;

        setOpenMonths((prev) => {

            if (prev.size > 0) return prev;

            return new Set([byMonth[0][0]]);

        });

    }, [byMonth]);



    const toggleMonth = (month: string) => {

        setOpenMonths((prev) => {

            const next = new Set(prev);

            if (next.has(month)) next.delete(month);

            else next.add(month);

            return next;

        });

    };



    const toggleMonthExpanded = (month: string) => {

        setExpandedMonths((prev) => {

            const next = new Set(prev);

            if (next.has(month)) next.delete(month);

            else next.add(month);

            return next;

        });

    };



    return (

        <div className="space-y-6">

            <ParentPortalCalendarPanel

                mode="parent"

                parentStudentId={selectedStudent?.id ?? undefined}

                parentStudentClassName={selectedStudent?.grade ?? undefined}

                linkedDate={selectedDate}

                onLinkedDateChange={setSelectedDate}

            />



            <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm space-y-3">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">

                        <CalendarCheck className="h-5 w-5" />

                    </div>

                    <div>

                        <h1 className="text-lg font-semibold text-orange-900">Attendance</h1>

                        <p className="text-sm text-orange-700">

                            Tap a date on the calendar above — attendance below updates for that day.

                            {hasMultipleChildren && selectedStudent ? ` Showing ${selectedStudent.name}.` : ""}

                        </p>

                    </div>

                </div>



                {monthSummary ? (
                    <div className="rounded-xl border border-orange-100 bg-white p-4 space-y-3">
                        <div className="flex flex-wrap items-end justify-between gap-2">
                            <div>
                                <h2 className="text-sm font-semibold text-orange-900">
                                    {formatMonthLabel(selectedDate.slice(0, 7))} summary
                                </h2>
                                <p className="text-xs text-orange-700">
                                    Percentage uses marked days only (present ÷ present + absent). Holidays and unmarked days are excluded.
                                </p>
                            </div>
                            <p className="text-2xl font-bold text-orange-900">
                                {formatAttendancePercentage(monthSummary.attendance_percentage)}
                            </p>
                        </div>
                        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                            <div className="rounded-lg bg-green-50 px-3 py-2">
                                <dt className="text-green-700">Present</dt>
                                <dd className="text-lg font-semibold text-green-900">{monthSummary.present}</dd>
                            </div>
                            <div className="rounded-lg bg-red-50 px-3 py-2">
                                <dt className="text-red-700">Absent</dt>
                                <dd className="text-lg font-semibold text-red-900">{monthSummary.absent}</dd>
                            </div>
                            <div className="rounded-lg bg-gray-50 px-3 py-2">
                                <dt className="text-gray-600">Unmarked</dt>
                                <dd className="text-lg font-semibold text-gray-900">{monthSummary.unmarked}</dd>
                            </div>
                            <div className="rounded-lg bg-violet-50 px-3 py-2">
                                <dt className="text-violet-700">Holiday</dt>
                                <dd className="text-lg font-semibold text-violet-900">{monthSummary.holiday}</dd>
                            </div>
                        </dl>
                    </div>
                ) : null}



                <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">

                    <h2 className="text-sm font-semibold text-orange-900">{formatDayLabel(selectedDate)}</h2>

                    {dayLoading ? (

                        <p className="mt-2 text-sm text-orange-700">Loading attendance for this date…</p>

                    ) : dayAttendance?.status === "HOLIDAY" ? (

                        <p className="mt-2 text-sm text-orange-800">
                            This date is a holiday — no attendance is marked.
                        </p>

                    ) : dayAttendance?.status === "UNMARKED" ? (

                        <p className="mt-2 text-sm text-orange-800">
                            No attendance marked for this working day yet.
                        </p>

                    ) : dayAttendance ? (

                        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">

                            <div>

                                <dt className="text-orange-600">Status</dt>

                                <dd className={`font-semibold ${statusClass(dayAttendance.status)}`}>

                                    {attendanceStatusLabel(dayAttendance.status)}

                                </dd>

                            </div>

                            <div>

                                <dt className="text-orange-600">Child</dt>

                                <dd className="font-medium text-orange-900">{dayAttendance.student_name || "—"}</dd>

                            </div>

                            <div>

                                <dt className="text-orange-600">Note</dt>

                                <dd className="text-orange-800">{dayAttendance.note?.trim() || "—"}</dd>

                            </div>

                        </dl>

                    ) : (

                        <p className="mt-2 text-sm text-orange-800">
                            No attendance marked for this date yet.
                        </p>

                    )}

                </div>

            </section>



            {loading && <p className="text-sm text-orange-700">Loading attendance history…</p>}

            {!loading && visibleRows.length === 0 && (

                <p className="rounded-xl border border-dashed border-orange-200 bg-orange-50/50 p-6 text-sm text-orange-800">

                    No attendance records yet. Your centre will mark attendance here after each school day.

                </p>

            )}



            <div className="space-y-3">

                {byMonth.map(([month, items]) => {

                    const isOpen = openMonths.has(month);

                    const showAll = expandedMonths.has(month) || items.length <= MONTH_PREVIEW_ROWS;

                    const visibleItems = showAll ? items : items.slice(0, MONTH_PREVIEW_ROWS);

                    const hiddenCount = items.length - visibleItems.length;



                    return (

                        <section key={month} className="overflow-hidden rounded-xl border border-orange-100 bg-white shadow-sm">

                            <button

                                type="button"

                                onClick={() => toggleMonth(month)}

                                className="flex w-full items-center justify-between gap-3 bg-orange-50/80 px-4 py-3 text-left"

                            >

                                <span className="flex items-center gap-2 text-sm font-bold text-orange-900">

                                    {isOpen ? (

                                        <ChevronDown className="h-4 w-4 shrink-0" />

                                    ) : (

                                        <ChevronRight className="h-4 w-4 shrink-0" />

                                    )}

                                    {formatMonthLabel(month)}

                                    <span className="font-normal text-orange-700">
                                        ({items.length} records
                                        {summariesByMonth[month]
                                            ? ` · ${formatAttendancePercentage(summariesByMonth[month].attendance_percentage)}`
                                            : ""}
                                        )
                                    </span>

                                </span>

                            </button>



                            {isOpen ? (

                                <div className="overflow-x-auto">

                                    <table className="w-full text-left text-sm">

                                        <thead className="bg-orange-50 text-orange-900">

                                            <tr>

                                                <th className="p-2">Date</th>

                                                <th className="p-2">Child</th>

                                                <th className="p-2">Status</th>

                                                <th className="p-2">Note</th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {visibleItems.map((r) => (

                                                <tr

                                                    key={r.id}

                                                    className={`border-t border-orange-100 ${

                                                        r.date.slice(0, 10) === selectedDate.slice(0, 10)

                                                            ? "bg-orange-50/80"

                                                            : ""

                                                    }`}

                                                >

                                                    <td className="p-2 text-orange-800">{r.date}</td>

                                                    <td className="p-2 text-orange-800">{r.student_name || "—"}</td>

                                                    <td className={`p-2 font-medium ${statusClass(r.status)}`}>{attendanceStatusLabel(r.status)}</td>

                                                    <td className="p-2 text-orange-700">{r.note || "—"}</td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                    {hiddenCount > 0 ? (

                                        <button

                                            type="button"

                                            onClick={() => toggleMonthExpanded(month)}

                                            className="w-full border-t border-orange-100 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-50"

                                        >

                                            Show {hiddenCount} more

                                        </button>

                                    ) : null}

                                    {showAll && items.length > MONTH_PREVIEW_ROWS ? (

                                        <button

                                            type="button"

                                            onClick={() => toggleMonthExpanded(month)}

                                            className="w-full border-t border-orange-100 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-50"

                                        >

                                            Show less

                                        </button>

                                    ) : null}

                                </div>

                            ) : null}

                        </section>

                    );

                })}

            </div>

        </div>

    );

}



"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CalendarCheck, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const ParentPortalCalendarPanel = dynamic(
    () => import("@/components/dashboard/shared/ParentPortalCalendarPanel").then((m) => m.ParentPortalCalendarPanel),
    { ssr: false },
);

const MONTH_PREVIEW_ROWS = 6;

type Row = { id: number; date: string; status: string; note?: string; student_name?: string };
type CombinedPayload = {
    attendance?: unknown;
};

function formatMonthLabel(monthKey: string): string {
    if (!monthKey || monthKey === "—") return "Unknown month";
    const [year, month] = monthKey.split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    if (Number.isNaN(d.getTime())) return monthKey;
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function statusClass(status: string): string {
    const s = status.toUpperCase();
    if (s === "PRESENT") return "text-green-700";
    if (s === "ABSENT") return "text-red-700";
    if (s === "LATE") return "text-amber-700";
    return "text-orange-900";
}

export default function AttendancePage() {
    const { authFetch } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMonths, setOpenMonths] = useState<Set<string>>(() => new Set());
    const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => new Set());

    useEffect(() => {
        let c = false;
        (async () => {
            try {
                const payload = await authFetch<CombinedPayload>("/students/parent/calendar-attendance/");
                const attendanceRaw = payload?.attendance;

                const attendanceList = Array.isArray(attendanceRaw)
                    ? attendanceRaw
                    : attendanceRaw && typeof attendanceRaw === "object" && Array.isArray((attendanceRaw as { results?: unknown[] }).results)
                      ? (attendanceRaw as { results: unknown[] }).results
                      : [];

                if (!c) setRows(attendanceList as Row[]);
            } catch {
                if (!c) setRows([]);
            } finally {
                if (!c) setLoading(false);
            }
        })();
        return () => {
            c = true;
        };
    }, [authFetch]);

    const byMonth = useMemo(() => {
        const m = new Map<string, Row[]>();
        for (const r of rows) {
            const key = r.date ? r.date.slice(0, 7) : "—";
            m.set(key, [...(m.get(key) || []), r]);
        }
        return Array.from(m.entries())
            .sort(([a], [b]) => (a > b ? -1 : 1))
            .map(([month, items]) => [month, items.sort((a, b) => (a.date > b.date ? -1 : 1))] as const);
    }, [rows]);

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
            <ParentPortalCalendarPanel mode="parent" />

            <section className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm space-y-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                        <CalendarCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Attendance</h1>
                        <p className="text-sm text-orange-700">Daily attendance records from your centre. Tap a month to expand.</p>
                    </div>
                </div>
            </section>

            {loading && <p className="text-sm text-orange-700">Loading attendance…</p>}
            {!loading && rows.length === 0 && (
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
                                    <span className="font-normal text-orange-700">({items.length} records)</span>
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
                                                <tr key={r.id} className="border-t border-orange-100">
                                                    <td className="p-2 text-orange-800">{r.date}</td>
                                                    <td className="p-2 text-orange-800">{r.student_name || "—"}</td>
                                                    <td className={`p-2 font-medium ${statusClass(r.status)}`}>{r.status}</td>
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

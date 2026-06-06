"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CalendarCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const ParentPortalCalendarPanel = dynamic(
    () => import("@/components/dashboard/shared/ParentPortalCalendarPanel").then((m) => m.ParentPortalCalendarPanel),
    { ssr: false },
);

type Row = { id: number; date: string; status: string; note?: string; student_name?: string };
type CombinedPayload = {
    attendance?: unknown;
};

export default function AttendancePage() {
    const { authFetch } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);

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
        return Array.from(m.entries()).sort(([a], [b]) => (a > b ? -1 : 1));
    }, [rows]);

    return (
        <div className="space-y-6">
            <ParentPortalCalendarPanel mode="parent" />

            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Attendance</h1>
                        <p className="text-sm text-orange-700">Event dates and daily attendance records from your centre.</p>
                    </div>
                </div>
            </section>

            {loading && <p className="text-sm text-orange-700">Loading attendance…</p>}
            {!loading && rows.length === 0 && <p className="text-sm text-orange-700">No attendance records yet.</p>}

            <div className="space-y-6">
                {byMonth.map(([month, items]) => (
                    <div key={month}>
                        <h2 className="text-sm font-bold text-orange-900 mb-2">{month}</h2>
                        <div className="overflow-x-auto rounded-xl border border-orange-100">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-orange-50 text-orange-900">
                                    <tr>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Child</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items
                                        .sort((a, b) => (a.date > b.date ? -1 : 1))
                                        .map((r) => (
                                            <tr key={r.id} className="border-t border-orange-100">
                                                <td className="p-2 text-orange-800">{r.date}</td>
                                                <td className="p-2 text-orange-800">{r.student_name || "—"}</td>
                                                <td className="p-2 font-medium text-orange-900">{r.status}</td>
                                                <td className="p-2 text-orange-700">{r.note || "—"}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

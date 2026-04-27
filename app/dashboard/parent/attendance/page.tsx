"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

type Row = { id: number; date: string; status: string; note?: string; student_name?: string };

export default function AttendancePage() {
    const { authFetch } = useAuth();
    const { events } = useSchoolData();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let c = false;
        (async () => {
            try {
                const data = await authFetch<Row[]>("/students/parent/attendance/");
                if (!c) setRows(Array.isArray(data) ? data : []);
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
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Calendar & Attendance</h1>
                        <p className="text-sm text-orange-700">Event dates and daily attendance records from your centre.</p>
                    </div>
                </div>
            </section>

            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-4 space-y-3">
                <h2 className="text-sm font-semibold text-orange-900">School calendar</h2>
                {events.length === 0 && <p className="text-sm text-orange-700">No events shared yet.</p>}
                <div className="space-y-2">
                    {events.map((ev) => (
                        <div key={ev.id} className="rounded-lg border border-orange-100 px-3 py-2 text-sm flex items-center justify-between gap-2">
                            <div>
                                <p className="font-semibold text-orange-900">{ev.title}</p>
                                <p className="text-xs text-orange-700">{ev.venue || "Venue TBD"}</p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700">
                                {ev.date || "TBD"}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {loading && <p className="text-sm text-orange-700">Loading…</p>}
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

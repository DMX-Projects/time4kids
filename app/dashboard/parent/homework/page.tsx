"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

type HwRow = {
    id: number;
    assigned_date: string;
    title: string;
    description?: string;
    student_name?: string | null;
    class_name?: string;
};

export default function HomeworkPage() {
    const { authFetch } = useAuth();
    const [rows, setRows] = useState<HwRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let c = false;
        (async () => {
            try {
                const data = await authFetch<HwRow[]>("/students/parent/homework/");
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

    const byDate = useMemo(() => {
        const m = new Map<string, HwRow[]>();
        for (const r of rows) {
            const d = r.assigned_date || "—";
            m.set(d, [...(m.get(d) || []), r]);
        }
        return Array.from(m.entries()).sort(([a], [b]) => (a > b ? -1 : a < b ? 1 : 0));
    }, [rows]);

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Homework</h1>
                        <p className="text-sm text-orange-700">Date-wise updates from your centre for your child or class.</p>
                    </div>
                </div>
            </section>

            {loading && <p className="text-sm text-orange-700">Loading…</p>}

            {!loading && rows.length === 0 && <p className="text-sm text-orange-700">No homework posted yet.</p>}

            <div className="space-y-6">
                {byDate.map(([date, items]) => (
                    <div key={date} className="space-y-2">
                        <h2 className="text-sm font-bold text-orange-900 uppercase tracking-wide border-b border-orange-100 pb-1">{date}</h2>
                        <ul className="space-y-2">
                            {items.map((h) => (
                                <li key={h.id} className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                                    <p className="font-semibold text-orange-900">{h.title}</p>
                                    {(h.student_name || h.class_name) && (
                                        <p className="text-xs text-orange-600 mt-1">
                                            {h.student_name ? `For: ${h.student_name}` : h.class_name ? `Class: ${h.class_name}` : ""}
                                        </p>
                                    )}
                                    {h.description && <p className="text-sm text-orange-800 mt-2 whitespace-pre-wrap">{h.description}</p>}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

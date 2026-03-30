"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

type Row = { id: number; title: string; body?: string; published_at?: string };

export default function NotificationsPage() {
    const { authFetch } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let c = false;
        (async () => {
            try {
                const data = await authFetch<Row[]>("/students/parent/announcements/");
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

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Notifications</h1>
                        <p className="text-sm text-orange-700">Important announcements from your centre, newest first.</p>
                    </div>
                </div>
            </section>

            {loading && <p className="text-sm text-orange-700">Loading…</p>}
            {!loading && rows.length === 0 && <p className="text-sm text-orange-700">No announcements yet.</p>}

            <ul className="space-y-3">
                {rows.map((r) => (
                    <li key={r.id} className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="font-semibold text-orange-900">{r.title}</h2>
                            <span className="text-xs text-orange-600 font-medium">
                                {r.published_at ? new Date(r.published_at).toLocaleString() : "—"}
                            </span>
                        </div>
                        {r.body && <p className="text-sm text-orange-800 mt-2 whitespace-pre-wrap">{r.body}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

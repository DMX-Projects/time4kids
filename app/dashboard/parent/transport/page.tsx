"use client";

import { useEffect, useState } from "react";
import { Bus, ExternalLink } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

type Row = { id: number; route_name: string; description?: string; map_url?: string; tracking_note?: string };

export default function TransportPage() {
    const { authFetch } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let c = false;
        (async () => {
            try {
                const data = await authFetch<Row[]>("/students/parent/transport/");
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
                        <Bus className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Transport</h1>
                        <p className="text-sm text-orange-700">
                            Bus routes and maps from your centre. Live GPS tracking is optional — see each route note.
                        </p>
                    </div>
                </div>
            </section>

            {loading && <p className="text-sm text-orange-700">Loading…</p>}
            {!loading && rows.length === 0 && (
                <p className="text-sm text-orange-700">No transport info published yet. Contact your centre for route details.</p>
            )}

            <ul className="space-y-4">
                {rows.map((r) => (
                    <li key={r.id} className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm space-y-2">
                        <h2 className="font-semibold text-orange-900">{r.route_name}</h2>
                        {r.description && <p className="text-sm text-orange-800 whitespace-pre-wrap">{r.description}</p>}
                        {r.tracking_note && <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-2">{r.tracking_note}</p>}
                        {r.map_url && (
                            <a
                                href={r.map_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline"
                            >
                                Open map <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

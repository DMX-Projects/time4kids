"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

type Row = {
    id: number;
    title: string;
    amount: string | number;
    due_date: string;
    paid_on?: string | null;
    status: string;
    notes?: string;
    student_name?: string;
};

export default function FeesPage() {
    const { authFetch } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let c = false;
        (async () => {
            try {
                const data = await authFetch<Row[]>("/students/parent/fees/");
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
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Fees</h1>
                        <p className="text-sm text-orange-700">Pending dues and paid history shared by your centre.</p>
                    </div>
                </div>
            </section>

            {loading && <p className="text-sm text-orange-700">Loading…</p>}
            {!loading && rows.length === 0 && <p className="text-sm text-orange-700">No fee entries yet.</p>}

            <ul className="space-y-3">
                {rows.map((r) => (
                    <li key={r.id} className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm flex flex-wrap justify-between gap-3">
                        <div>
                            <p className="font-semibold text-orange-900">{r.title}</p>
                            <p className="text-xs text-orange-600">{r.student_name}</p>
                            <p className="text-xs text-orange-700 mt-1">Due: {r.due_date}</p>
                            {r.paid_on && <p className="text-xs text-green-700 mt-1">Paid on: {r.paid_on}</p>}
                            {r.notes && <p className="text-sm text-orange-800 mt-2">{r.notes}</p>}
                        </div>
                        <div className="text-right">
                            <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold border border-orange-100 bg-orange-50 text-orange-900">
                                ₹{typeof r.amount === "number" ? r.amount.toFixed(2) : r.amount}
                            </span>
                            <p className="text-xs font-semibold text-orange-700 mt-2">{r.status}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

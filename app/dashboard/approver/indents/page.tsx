"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";

type IndentRequest = {
    id: number;
    region: string;
    academic_year?: string;
    notes?: string;
    status: "pending" | "approved" | "rejected" | string;
    requested_at: string;
    franchise_name?: string;
};

export default function ApproverIndentsPage() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();
    const [rows, setRows] = useState<IndentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const data = await authFetch<any>("/documents/admin/indents/");
            const list = Array.isArray(data) ? data : data?.results || [];
            setRows(list);
        } catch {
            showToast("Could not load indents.", "error");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const review = async (id: number, status: "approved" | "rejected") => {
        setBusyId(id);
        try {
            await authFetch(`/documents/admin/indents/${id}/`, {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify({ status }),
            });
            showToast(status === "approved" ? "Indent approved." : "Indent rejected.", "success");
            await load();
        } catch {
            showToast("Could not update indent.", "error");
        } finally {
            setBusyId(null);
        }
    };

    const statusIcon = (s: IndentRequest["status"]) => {
        if (s === "approved") return <CheckCircle2 className="w-4 h-4 text-green-600" />;
        if (s === "rejected") return <XCircle className="w-4 h-4 text-red-600" />;
        return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
    };

    const statusLabel = (s: IndentRequest["status"]) => {
        if (s === "approved") return "Approved";
        if (s === "rejected") return "Rejected";
        return "Pending";
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Indent approvals</h1>
                <p className="text-sm text-slate-600">Review requests raised by franchises.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                ) : rows.length === 0 ? (
                    <p className="text-sm text-slate-600 py-6">No indent requests yet.</p>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {rows.map((r) => (
                            <li key={r.id} className="py-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5 text-amber-700" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{r.franchise_name || `Franchise #${r.id}`}</p>
                                        <p className="text-xs text-slate-500">
                                            {r.region} · {r.academic_year || "—"} · {new Date(r.requested_at).toLocaleString()}
                                        </p>
                                        {r.notes && <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{r.notes}</p>}
                                        <div className="inline-flex items-center gap-2 mt-2 px-2 py-1 rounded-full border border-slate-200 text-xs font-medium">
                                            {statusIcon(r.status)}
                                            {statusLabel(r.status)}
                                        </div>
                                    </div>
                                </div>
                                {r.status === "pending" && (
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            type="button"
                                            disabled={busyId === r.id}
                                            onClick={() => review(r.id, "approved")}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            disabled={busyId === r.id}
                                            onClick={() => review(r.id, "rejected")}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

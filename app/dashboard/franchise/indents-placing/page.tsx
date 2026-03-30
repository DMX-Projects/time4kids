
'use client';

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Loader2, Plus, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";

type IndentRequest = {
    id: number;
    region: string;
    academic_year?: string;
    notes?: string;
    status: "pending" | "approved" | "rejected" | string;
    requested_at: string;
    franchise_name?: string;
};

export default function IndentsPlacingPage() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();

    const [requests, setRequests] = useState<IndentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [region, setRegion] = useState<"INSIDE_AP" | "OUTSIDE_AP">("INSIDE_AP");
    const [academicYear, setAcademicYear] = useState("");
    const [notes, setNotes] = useState("");

    const fetchRequests = async () => {
        try {
            const data = await authFetch<any>("/documents/franchise/indents/");
            const list = Array.isArray(data) ? data : data?.results || [];
            setRequests(list);
        } catch {
            showToast("Could not load indent requests. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!academicYear.trim()) {
            showToast("Academic year is required.", "error");
            return;
        }

        setSubmitting(true);
        try {
            await authFetch("/documents/franchise/indents/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    region,
                    academic_year: academicYear,
                    notes,
                }),
            });

            showToast("Indent placed successfully.", "success");
            setAcademicYear("");
            setNotes("");
            setRegion("INSIDE_AP");
            await fetchRequests();
        } catch {
            showToast("Could not place indent. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const statusIcon = (s: IndentRequest["status"]) => {
        if (s === "approved") return <CheckCircle2 className="w-4 h-4 text-green-600" />;
        if (s === "rejected") return <XCircle className="w-4 h-4 text-red-600" />;
        return <Loader2 className="w-4 h-4 text-[#FF922B] animate-spin" />;
    };

    const statusLabel = (s: IndentRequest["status"]) => {
        if (s === "approved") return "Approved";
        if (s === "rejected") return "Rejected";
        return "Pending";
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-[#111827]">Indents Placing</h1>
                <p className="text-sm text-[#374151]">Raise an indent and track the approval status.</p>
            </div>

            {/* Place indent form */}
            <form onSubmit={onSubmit} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#111827]">Place New Indent</p>
                        <p className="text-xs text-[#6B7280]">Your request will show as `Pending` until admin updates it.</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-md bg-[#FF922B]/10 text-[#FF922B] text-xs font-semibold inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Place
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <label className="space-y-2">
                        <span className="block text-sm font-semibold text-gray-700">Region</span>
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value as any)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                        >
                            <option value="INSIDE_AP">Inside AP</option>
                            <option value="OUTSIDE_AP">Outside AP</option>
                        </select>
                    </label>

                    <label className="space-y-2">
                        <span className="block text-sm font-semibold text-gray-700">Academic Year</span>
                        <input
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            placeholder="e.g., AY 2025-26"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                        />
                    </label>
                </div>

                <label className="space-y-2">
                    <span className="block text-sm font-semibold text-gray-700">Notes (optional)</span>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Add brief details about the indent request..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none"
                    />
                </label>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 disabled:opacity-60"
                    >
                        {submitting ? "Placing..." : "Place Indent"}
                        <FileText className="w-4 h-4" />
                    </button>
                </div>
            </form>

            {/* Requests list */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : requests.length === 0 ? (
                <div className="bg-[#fffaf0] border border-[#E5E7EB] rounded-2xl p-5 text-sm text-[#374151]">
                    No indent requests found for your centre yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map((r) => (
                        <div key={r.id} className="flex items-start justify-between gap-4 border border-[#E5E7EB] rounded-2xl p-4 bg-white">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-[#111827]">
                                    {r.region === "INSIDE_AP" ? "Inside AP" : "Outside AP"} • {r.academic_year || "Academic Year not set"}
                                </p>
                                {r.notes ? <p className="text-xs text-[#6B7280]">{r.notes}</p> : null}
                                <p className="text-xs text-[#6B7280]">
                                    Requested on{" "}
                                    {r.requested_at ? new Date(r.requested_at).toLocaleDateString("en-GB") : "-"}
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#E5E7EB]">
                                    {statusIcon(r.status)}
                                    <span className="text-xs font-semibold text-[#111827]">{statusLabel(r.status)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


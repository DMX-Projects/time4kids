"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LifeBuoy, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import { jsonHeaders } from "@/lib/api-client";
import { ticketStatusBadgeClass, ticketStatusLabel } from "@/lib/support-ticket-status";

type TicketRow = {
    id: number;
    franchise?: number;
    franchise_name?: string;
    parent_name?: string;
    subject: string;
    body: string;
    status: string;
    status_label?: string;
    is_unresolved?: boolean;
    days_open?: number;
    franchise_reply?: string;
    ho_reminder_message?: string;
    ho_reminded_at?: string | null;
    created_at?: string;
    updated_at?: string;
};

const TICKETS_PREVIEW_COUNT = 4;

export default function AdminParentSupportTicketsPage() {
    const { authFetch } = useAuth();
    const { franchises } = useAdminData();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<TicketRow[]>([]);
    const [centreFilter, setCentreFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [unresolvedOnly, setUnresolvedOnly] = useState(true);
    const [remindingId, setRemindingId] = useState<number | null>(null);
    const [reminderNotes, setReminderNotes] = useState<Record<number, string>>({});
    const [listExpanded, setListExpanded] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (centreFilter) params.set("franchise", centreFilter);
            if (statusFilter) params.set("status", statusFilter);
            if (unresolvedOnly) params.set("unresolved", "1");
            const q = params.toString() ? `?${params.toString()}` : "";
            const data = await authFetch<TicketRow[]>(`/students/admin/tickets/${q}`);
            setRows(Array.isArray(data) ? data : []);
        } catch {
            showToast("Unable to load support tickets", "error");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, centreFilter, statusFilter, unresolvedOnly, showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        setListExpanded(false);
    }, [centreFilter, statusFilter, unresolvedOnly]);

    const visibleRows = listExpanded ? rows : rows.slice(0, TICKETS_PREVIEW_COUNT);
    const hiddenRowsCount = Math.max(0, rows.length - visibleRows.length);

    const unresolvedCount = useMemo(() => rows.filter((r) => r.is_unresolved !== false).length, [rows]);

    const remindCentre = async (ticket: TicketRow) => {
        setRemindingId(ticket.id);
        try {
            const res = await authFetch<{ detail?: string; centre_emailed?: boolean }>(
                `/students/admin/tickets/${ticket.id}/remind-centre/`,
                {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        message: (reminderNotes[ticket.id] || "").trim() || undefined,
                    }),
                },
            );
            showToast(res?.detail || "Centre notified.", res?.centre_emailed ? "success" : "error");
            await load();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Could not notify centre", "error");
        } finally {
            setRemindingId(null);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Parent support tickets</h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Centres handle tickets under <strong>Parent Support</strong>. You see every ticket and its status
                        here. If a centre has not replied or resolved, use <strong>Notify centre</strong> — they get a
                        message in <strong>Centre inbox</strong> and an email when SendGrid is configured.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <label className="text-xs font-semibold text-slate-600">
                    Centre
                    <select
                        value={centreFilter}
                        onChange={(e) => setCentreFilter(e.target.value)}
                        className="mt-1 block rounded-lg border px-2 py-1.5 text-sm min-w-[160px]"
                    >
                        <option value="">All centres</option>
                        {franchises.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-semibold text-slate-600">
                    Status
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="mt-1 block rounded-lg border px-2 py-1.5 text-sm"
                    >
                        <option value="">Any</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 mt-5">
                    <input
                        type="checkbox"
                        checked={unresolvedOnly}
                        onChange={(e) => setUnresolvedOnly(e.target.checked)}
                    />
                    Unresolved only
                </label>
                {!loading && (
                    <p className="text-xs text-slate-500 mt-5 ml-auto">
                        {rows.length} ticket{rows.length === 1 ? "" : "s"}
                        {unresolvedOnly ? ` (${unresolvedCount} need action)` : ""}
                    </p>
                )}
            </div>

            {loading && <p className="text-sm text-slate-500">Loading tickets…</p>}
            {!loading && rows.length === 0 && (
                <p className="text-sm text-slate-500">No tickets match these filters.</p>
            )}

            <ul className="space-y-4">
                {visibleRows.map((t) => {
                    const unresolved = t.status !== "RESOLVED" && t.status !== "CLOSED";
                    return (
                        <li key={t.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
                            <div className="flex flex-wrap justify-between gap-2 items-start">
                                <div>
                                    <p className="font-semibold text-slate-900">{t.subject}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {t.franchise_name || `Centre #${t.franchise}`} · {t.parent_name || "Parent"}
                                        {typeof t.days_open === "number" ? ` · ${t.days_open} day(s) open` : ""}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ticketStatusBadgeClass(t.status)}`}
                                >
                                    {t.status_label || ticketStatusLabel(t.status)}
                                </span>
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{t.body}</p>
                            {t.franchise_reply ? (
                                <p className="text-sm bg-orange-50 border border-orange-100 rounded-lg p-3 text-orange-900">
                                    <span className="text-xs font-bold uppercase text-orange-600">Centre reply</span>
                                    <span className="block mt-1 whitespace-pre-wrap">{t.franchise_reply}</span>
                                </p>
                            ) : null}
                            {t.ho_reminded_at ? (
                                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                    Reminded centre {new Date(t.ho_reminded_at).toLocaleString()}
                                    {t.ho_reminder_message ? ` — ${t.ho_reminder_message}` : ""}
                                </p>
                            ) : null}
                            {unresolved ? (
                                <div className="pt-2 border-t border-slate-100 space-y-2">
                                    <label className="block text-xs font-semibold text-slate-600">
                                        Message to centre (optional)
                                        <textarea
                                            rows={2}
                                            placeholder="Please resolve this ticket and reply to the parent."
                                            value={reminderNotes[t.id] ?? ""}
                                            onChange={(e) =>
                                                setReminderNotes((p) => ({ ...p, [t.id]: e.target.value }))
                                            }
                                            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                                        />
                                    </label>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="bg-orange-500"
                                        disabled={remindingId === t.id}
                                        onClick={() => void remindCentre(t)}
                                    >
                                        <Send className="w-4 h-4 mr-1.5" />
                                        {remindingId === t.id ? "Sending…" : "Notify centre"}
                                    </Button>
                                </div>
                            ) : null}
                        </li>
                    );
                })}
            </ul>

            {!loading && rows.length > TICKETS_PREVIEW_COUNT && (
                <div className="flex justify-center pt-1">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-orange-300 bg-orange-50 text-orange-700 font-semibold hover:bg-orange-100 hover:border-orange-400 hover:text-orange-800"
                        onClick={() => setListExpanded((prev) => !prev)}
                    >
                        {listExpanded ? "Show less" : `Show more (${hiddenRowsCount})`}
                    </Button>
                </div>
            )}
        </div>
    );
}

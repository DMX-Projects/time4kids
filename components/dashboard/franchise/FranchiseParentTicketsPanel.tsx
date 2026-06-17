"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/ui/Button";
import { ticketStatusBadgeClass, ticketStatusLabel, TICKET_STATUSES } from "@/lib/support-ticket-status";
import { jsonHeaders } from "@/lib/api-client";

type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
type ShowToastFn = (message: string, variant?: "success" | "error") => void;

type TicketRow = {
    id: number;
    subject: string;
    body: string;
    status: string;
    parent_name?: string;
    student_name?: string | null;
    student_class_name?: string | null;
    franchise_reply?: string;
    ho_reminder_message?: string;
    ho_reminded_at?: string | null;
    created_at?: string;
    updated_at?: string;
};

/** Franchise staff: reply to support tickets raised by parents (not shown on parent-login UI). */
export function FranchiseParentTicketsPanel({ authFetch, showToast }: { authFetch: AuthFetchFn; showToast: ShowToastFn }) {
    const [rows, setRows] = useState<TicketRow[]>([]);
    const [editing, setEditing] = useState<Record<number, { reply: string; status: string }>>({});
    const [showResolvedHistory, setShowResolvedHistory] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await authFetch<TicketRow[]>("/students/franchise/tickets/");
            setRows(Array.isArray(data) ? data : []);
        } catch {
            setRows([]);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    const save = async (id: number) => {
        const e = editing[id];
        if (!e) return;
        try {
            await authFetch(`/students/franchise/tickets/${id}/`, {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify({ franchise_reply: e.reply, status: e.status }),
            });
            showToast("Reply saved", "success");
            setEditing((prev) => {
                const n = { ...prev };
                delete n[id];
                return n;
            });
            await load();
        } catch {
            showToast("Update failed", "error");
        }
    };

    const isResolvedStatus = (status: string) => status === "RESOLVED" || status === "CLOSED";
    const toTime = (row: TicketRow) =>
        new Date(row.updated_at ?? row.created_at ?? 0).getTime() || 0;
    const sortLatestFirst = (a: TicketRow, b: TicketRow) => toTime(b) - toTime(a);

    const activeRows = rows.filter((r) => !isResolvedStatus(r.status)).sort(sortLatestFirst);
    const resolvedRows = rows.filter((r) => isResolvedStatus(r.status)).sort(sortLatestFirst);

    const renderTicket = (t: TicketRow, { readOnly = false }: { readOnly?: boolean } = {}) => (
        <li
            key={t.id}
            className={`rounded-2xl border bg-white p-4 space-y-2 ${
                readOnly ? "border-[#E5E7EB] bg-slate-50/60" : "border-[#E5E7EB]"
            }`}
        >
            {!readOnly && t.ho_reminder_message ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    <p className="text-xs font-bold uppercase text-amber-700">Head office reminder</p>
                    <p className="mt-1 whitespace-pre-wrap">{t.ho_reminder_message}</p>
                    {t.ho_reminded_at ? (
                        <p className="text-[11px] text-amber-600 mt-1">
                            {new Date(t.ho_reminded_at).toLocaleString()}
                        </p>
                    ) : null}
                </div>
            ) : null}
            <div className="flex justify-between gap-2 text-sm flex-wrap items-start">
                <span className="font-semibold">{t.subject}</span>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[#6B7280]">{t.parent_name}</span>
                    <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ticketStatusBadgeClass(t.status)}`}
                    >
                        {ticketStatusLabel(t.status)}
                    </span>
                </div>
            </div>
                    {t.student_name || t.student_class_name ? (
                        <p className="text-xs font-medium text-[#374151]">
                            Child: {[t.student_name, t.student_class_name].filter(Boolean).join(" · ")}
                        </p>
                    ) : null}
            <p className="text-sm text-[#374151] whitespace-pre-wrap">{t.body}</p>
            {t.franchise_reply ? (
                <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-sm text-orange-900">
                    <span className="text-xs font-bold uppercase text-orange-600">Centre reply</span>
                    <p className="mt-1 whitespace-pre-wrap">{t.franchise_reply}</p>
                </div>
            ) : readOnly ? (
                <p className="text-xs text-[#6B7280] italic">Resolved without a written reply.</p>
            ) : null}
            {t.updated_at ? (
                <p className="text-[11px] text-[#9CA3AF]">
                    {readOnly ? "Resolved" : "Updated"} {new Date(t.updated_at).toLocaleString()}
                </p>
            ) : null}
            {!readOnly ? (
                <div className="flex flex-col gap-2 pt-2 border-t">
                    <select
                        value={editing[t.id]?.status ?? (t.status === "CLOSED" ? "RESOLVED" : t.status)}
                        onChange={(e) =>
                            setEditing((p) => ({
                                ...p,
                                [t.id]: { reply: p[t.id]?.reply ?? t.franchise_reply ?? "", status: e.target.value },
                            }))
                        }
                        className="rounded-lg border px-2 py-1 text-sm w-fit"
                    >
                        {TICKET_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {ticketStatusLabel(s)}
                            </option>
                        ))}
                    </select>
                    <textarea
                        placeholder="Reply to parent (optional if you only update status)"
                        value={editing[t.id]?.reply ?? t.franchise_reply ?? ""}
                        onChange={(e) =>
                            setEditing((p) => ({
                                ...p,
                                [t.id]: {
                                    status: p[t.id]?.status ?? (t.status === "CLOSED" ? "RESOLVED" : t.status),
                                    reply: e.target.value,
                                },
                            }))
                        }
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        rows={2}
                    />
                    <Button type="button" size="sm" className="w-fit bg-[#FF922B] text-white" onClick={() => void save(t.id)}>
                        Save reply / status
                    </Button>
                </div>
            ) : null}
        </li>
    );

    return (
        <div className="space-y-4">
            <ul className="space-y-4">
                {activeRows.map((t) => renderTicket(t))}
            </ul>
            {activeRows.length === 0 && <p className="text-sm text-[#6B7280]">No pending tickets.</p>}

            {resolvedRows.length > 0 ? (
                <section className="pt-2 border-t border-[#E5E7EB]">
                    <button
                        type="button"
                        onClick={() => setShowResolvedHistory((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF922B] hover:underline"
                    >
                        {showResolvedHistory ? (
                            <>
                                <ChevronUp className="h-4 w-4 shrink-0" aria-hidden />
                                Hide resolved history ({resolvedRows.length})
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                                Show resolved history ({resolvedRows.length})
                            </>
                        )}
                    </button>
                    {showResolvedHistory ? (
                        <ul className="mt-3 space-y-4">{resolvedRows.map((t) => renderTicket(t, { readOnly: true }))}</ul>
                    ) : null}
                </section>
            ) : null}
        </div>
    );
}

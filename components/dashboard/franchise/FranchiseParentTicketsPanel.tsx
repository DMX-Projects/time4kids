"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { ticketStatusLabel, TICKET_STATUSES } from "@/lib/support-ticket-status";
import { jsonHeaders } from "@/lib/api-client";

type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
type ShowToastFn = (message: string, variant?: "success" | "error") => void;

type TicketRow = {
    id: number;
    subject: string;
    body: string;
    status: string;
    parent_name?: string;
    franchise_reply?: string;
    ho_reminder_message?: string;
    ho_reminded_at?: string | null;
};

/** Franchise staff: reply to support tickets raised by parents (not shown on parent-login UI). */
export function FranchiseParentTicketsPanel({ authFetch, showToast }: { authFetch: AuthFetchFn; showToast: ShowToastFn }) {
    const [rows, setRows] = useState<TicketRow[]>([]);
    const [editing, setEditing] = useState<Record<number, { reply: string; status: string }>>({});

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

    return (
        <ul className="space-y-4">
            {rows.map((t) => (
                <li key={t.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-2">
                    {t.ho_reminder_message && t.status !== "RESOLVED" && t.status !== "CLOSED" ? (
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
                    <div className="flex justify-between gap-2 text-sm">
                        <span className="font-semibold">{t.subject}</span>
                        <span className="text-[#6B7280]">{t.parent_name}</span>
                    </div>
                    <p className="text-sm text-[#374151] whitespace-pre-wrap">{t.body}</p>
                    <p className="text-xs text-[#6B7280]">Status: {ticketStatusLabel(t.status)}</p>
                    {t.franchise_reply && <p className="text-sm bg-orange-50 rounded-lg p-2">Reply: {t.franchise_reply}</p>}
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
                            placeholder="Reply to parent"
                            value={editing[t.id]?.reply ?? ""}
                            onChange={(e) =>
                                setEditing((p) => ({
                                    ...p,
                                    [t.id]: { status: p[t.id]?.status ?? t.status, reply: e.target.value },
                                }))
                            }
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                            rows={2}
                        />
                        <Button type="button" size="sm" className="w-fit bg-[#FF922B] text-white" onClick={() => void save(t.id)}>
                            Save reply / status
                        </Button>
                    </div>
                </li>
            ))}
            {rows.length === 0 && <p className="text-sm text-[#6B7280]">No open tickets.</p>}
        </ul>
    );
}

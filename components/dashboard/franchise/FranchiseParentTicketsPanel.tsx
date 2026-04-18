"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
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
                    <div className="flex justify-between gap-2 text-sm">
                        <span className="font-semibold">{t.subject}</span>
                        <span className="text-[#6B7280]">{t.parent_name}</span>
                    </div>
                    <p className="text-sm text-[#374151] whitespace-pre-wrap">{t.body}</p>
                    <p className="text-xs text-[#6B7280]">Status: {t.status}</p>
                    {t.franchise_reply && <p className="text-sm bg-orange-50 rounded-lg p-2">Reply: {t.franchise_reply}</p>}
                    <div className="flex flex-col gap-2 pt-2 border-t">
                        <select
                            value={editing[t.id]?.status ?? t.status}
                            onChange={(e) =>
                                setEditing((p) => ({
                                    ...p,
                                    [t.id]: { reply: p[t.id]?.reply ?? t.franchise_reply ?? "", status: e.target.value },
                                }))
                            }
                            className="rounded-lg border px-2 py-1 text-sm w-fit"
                        >
                            {["OPEN", "IN_PROGRESS", "CLOSED"].map((s) => (
                                <option key={s} value={s}>
                                    {s}
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

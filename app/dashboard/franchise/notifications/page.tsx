"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import Button from "@/components/ui/Button";

type FranchiseNotificationRow = {
    id: number;
    source: string;
    source_id?: number | null;
    title: string;
    body?: string;
    action_path?: string;
    read?: boolean;
    read_at?: string | null;
    created_at?: string;
};

const sourceLabel: Record<string, string> = {
    head_office: "Head office",
    support_ticket: "Parent support",
    driver_activity: "Driver Activity",
};

export default function FranchiseNotificationsPage() {
    const { authFetch } = useAuth();
    const [rows, setRows] = useState<FranchiseNotificationRow[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authFetch<{ notifications?: FranchiseNotificationRow[]; unread_count?: number }>(
                "/students/franchise/notifications/",
            );
            setRows(Array.isArray(data?.notifications) ? data.notifications : []);
            setUnreadCount(typeof data?.unread_count === "number" ? data.unread_count : 0);
        } catch {
            setRows([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    const markRead = async (row: FranchiseNotificationRow) => {
        try {
            const res = await authFetch<{ unread_count?: number }>("/students/franchise/notifications/read/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ notification_id: row.id, source: row.source || "head_office" }),
            });
            if (typeof res?.unread_count === "number") {
                setUnreadCount(res.unread_count);
            }
            setRows((prev) =>
                prev.map((r) =>
                    r.source === row.source && r.id === row.id
                        ? { ...r, read: true, read_at: new Date().toISOString() }
                        : r,
                ),
            );
        } catch {
            /* ignore */
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF4CC] text-[#1F2937] flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-[#111827]">Notifications</h1>
                    <p className="text-sm text-[#6B7280]">
                        Head-office messages and support-ticket reminders for your centre. Parent notifications you send
                        from Parent Portal are tracked separately under Parent Portal → Notifications.
                        {unreadCount > 0 ? (
                            <span className="ml-1 font-medium text-orange-700">{unreadCount} unread</span>
                        ) : null}
                    </p>
                </div>
            </div>

            {loading && <p className="text-sm text-[#6B7280]">Loading…</p>}
            {!loading && rows.length === 0 && (
                <p className="text-sm text-[#6B7280] rounded-2xl border border-[#E5E7EB] bg-white p-6">
                    No messages yet. Head-office announcements and support-ticket reminders will appear here.
                </p>
            )}

            <ul className="space-y-3">
                {rows.map((row) => {
                    const action = row.action_path?.trim() || "/dashboard/franchise/notifications/";
                    const viewLabel = row.action_path?.includes("parent-portal")
                        ? "View in Parent Portal"
                        : row.action_path?.includes("parent-tickets")
                          ? "Open Parent Support"
                          : "View";
                    return (
                        <li
                            key={`${row.source}-${row.id}`}
                            className={`rounded-2xl border bg-white p-4 shadow-sm ${
                                row.read ? "border-[#E5E7EB]" : "border-orange-200 bg-orange-50/30"
                            }`}
                        >
                            <div className="flex flex-wrap justify-between gap-2 items-start">
                                <div className="min-w-0 space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                                        {sourceLabel[row.source] || row.source}
                                    </p>
                                    <p className="font-semibold text-[#111827]">{row.title}</p>
                                    {row.body ? (
                                        <p className="text-sm text-[#374151] whitespace-pre-wrap">{row.body}</p>
                                    ) : null}
                                    {row.created_at ? (
                                        <p className="text-[11px] text-[#9CA3AF]">
                                            {new Date(row.created_at).toLocaleString()}
                                        </p>
                                    ) : null}
                                </div>
                                {!row.read ? (
                                    <span className="text-[10px] font-semibold uppercase text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                                        New
                                    </span>
                                ) : null}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#E5E7EB]/80">
                                <Link href={action}>
                                    <Button type="button" size="sm" className="bg-[#FF922B] text-white">
                                        {viewLabel}
                                    </Button>
                                </Link>
                                {!row.read ? (
                                    <Button type="button" size="sm" variant="outline" onClick={() => void markRead(row)}>
                                        Mark read
                                    </Button>
                                ) : null}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

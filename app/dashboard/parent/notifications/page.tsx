"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

type AnnouncementRow = { id: number; title: string; body?: string; published_at?: string };
type HomeworkRow = { id: number; title: string; description?: string; assigned_date?: string; student_name?: string | null; class_name?: string };
type FeeRow = { id: number; title: string; amount?: string | number; due_date?: string; status?: string; student_name?: string };
type TransportRow = { id: number; route_name: string; description?: string; tracking_note?: string; created_at?: string; updated_at?: string };
type EventRow = { id: number; title: string; description?: string; start_date?: string; end_date?: string; location?: string };
type AchievementRow = { id: number; title: string; notes?: string; achieved_date?: string; student_name?: string };
type AttendanceRow = { id: number; date: string; status: string; note?: string; student_name?: string };

type NotificationRow = {
    id: string;
    title: string;
    body?: string;
    publishedAt?: string;
    source: "announcement" | "homework" | "fees" | "transport" | "event" | "achievement" | "attendance";
    read?: boolean;
};

type ApiNotificationRow = {
    id: string;
    source: NotificationRow["source"];
    title?: string;
    body?: string;
    published_at?: string;
    read?: boolean;
    read_at?: string;
};

type ParentNotificationsPayload = {
    announcements?: unknown;
    homework?: unknown;
    fees?: unknown;
    transport?: unknown;
    events?: unknown;
    achievements?: unknown;
    attendance?: unknown;
    notifications?: unknown;
    unread_count?: number;
};

const normalizeList = <T,>(data: unknown): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object") {
        const obj = data as { results?: unknown; data?: unknown; announcements?: unknown; homework?: unknown; fees?: unknown; transport?: unknown };
        if (Array.isArray(obj.results)) return obj.results as T[];
        if (Array.isArray(obj.data)) return obj.data as T[];
        if (Array.isArray(obj.announcements)) return obj.announcements as T[];
        if (Array.isArray(obj.homework)) return obj.homework as T[];
        if (Array.isArray(obj.fees)) return obj.fees as T[];
        if (Array.isArray(obj.transport)) return obj.transport as T[];
    }
    return [];
};

const sourceLabel: Record<NotificationRow["source"], string> = {
    announcement: "Announcement",
    homework: "Homework",
    fees: "Fees",
    transport: "Transport",
    event: "Event",
    achievement: "Achievement",
    attendance: "Attendance",
};

export default function NotificationsPage() {
    const { authFetch } = useAuth();
    const [rows, setRows] = useState<NotificationRow[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let c = false;
        (async () => {
            try {
                const payload = await authFetch<ParentNotificationsPayload>("/students/parent/notifications/");
                const annRaw = payload?.announcements ?? [];
                const hwRaw = payload?.homework ?? [];
                const feeRaw = payload?.fees ?? [];
                const transportRaw = payload?.transport ?? [];
                const eventRaw = payload?.events ?? [];
                const achievementRaw = payload?.achievements ?? [];
                const attendanceRaw = payload?.attendance ?? [];
                const aggregatedRaw = payload?.notifications ?? [];

                const aggregatedRows: NotificationRow[] = normalizeList<ApiNotificationRow>(aggregatedRaw).map((r) => ({
                    id: r.id,
                    title: r.title || "Notification",
                    body: r.body,
                    publishedAt: r.published_at,
                    source: r.source,
                    read: Boolean(r.read),
                }));

                if (aggregatedRows.length > 0) {
                    if (!c) {
                        setRows(aggregatedRows);
                        setUnreadCount(typeof payload?.unread_count === "number" ? payload.unread_count : aggregatedRows.filter((r) => !r.read).length);
                    }
                    return;
                }

                const announcementRows: NotificationRow[] = normalizeList<AnnouncementRow>(annRaw).map((r) => ({
                    id: `announcement-${r.id}`,
                    title: r.title || "Announcement",
                    body: r.body,
                    publishedAt: r.published_at,
                    source: "announcement",
                }));

                const homeworkRows: NotificationRow[] = normalizeList<HomeworkRow>(hwRaw).map((r) => ({
                    id: `homework-${r.id}`,
                    title: r.title || "Homework posted",
                    body:
                        [r.student_name ? `For: ${r.student_name}` : "", r.class_name ? `Class: ${r.class_name}` : "", r.description || ""]
                            .filter(Boolean)
                            .join(" • ") || undefined,
                    publishedAt: r.assigned_date,
                    source: "homework",
                }));

                const feeRows: NotificationRow[] = normalizeList<FeeRow>(feeRaw).map((r) => ({
                    id: `fees-${r.id}`,
                    title: r.title || "Fee update",
                    body:
                        [r.student_name ? `Student: ${r.student_name}` : "", r.amount != null ? `Amount: ₹${r.amount}` : "", r.status ? `Status: ${r.status}` : ""]
                            .filter(Boolean)
                            .join(" • ") || undefined,
                    publishedAt: r.due_date,
                    source: "fees",
                }));

                const transportRows: NotificationRow[] = normalizeList<TransportRow>(transportRaw).map((r) => ({
                    id: `transport-${r.id}`,
                    title: r.route_name || "Transport update",
                    body: [r.description || "", r.tracking_note || ""].filter(Boolean).join(" • ") || undefined,
                    publishedAt: r.updated_at || r.created_at,
                    source: "transport",
                }));

                const eventRows: NotificationRow[] = normalizeList<EventRow>(eventRaw).map((r) => ({
                    id: `event-${r.id}`,
                    title: r.title || "New event",
                    body: [r.location ? `Venue: ${r.location}` : "", r.description || ""].filter(Boolean).join(" • ") || undefined,
                    publishedAt: r.start_date || r.end_date,
                    source: "event",
                }));

                const achievementRows: NotificationRow[] = normalizeList<AchievementRow>(achievementRaw).map((r) => ({
                    id: `achievement-${r.id}`,
                    title: r.title || "Achievement update",
                    body: [r.student_name ? `Student: ${r.student_name}` : "", r.notes || ""].filter(Boolean).join(" • ") || undefined,
                    publishedAt: r.achieved_date,
                    source: "achievement",
                }));

                const attendanceRows: NotificationRow[] = normalizeList<AttendanceRow>(attendanceRaw).map((r) => ({
                    id: `attendance-${r.id}`,
                    title: `Attendance: ${r.status || "Updated"}`,
                    body: [r.student_name ? `Student: ${r.student_name}` : "", r.note || ""].filter(Boolean).join(" • ") || undefined,
                    publishedAt: r.date,
                    source: "attendance",
                }));

                const merged = [
                    ...announcementRows,
                    ...homeworkRows,
                    ...feeRows,
                    ...transportRows,
                    ...eventRows,
                    ...achievementRows,
                    ...attendanceRows,
                ].sort((a, b) => {
                    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
                    return tb - ta;
                });

                if (!c) {
                    setRows(merged);
                    setUnreadCount(merged.length);
                }
            } catch {
                if (!c) {
                    setRows([]);
                    setUnreadCount(0);
                }
            } finally {
                if (!c) setLoading(false);
            }
        })();
        return () => {
            c = true;
        };
    }, [authFetch]);

    const markAsRead = async (row: NotificationRow) => {
        try {
            const res = await authFetch<{ unread_count?: number }>("/students/parent/notifications/read/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ notification_id: row.id }),
            });
            setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, read: true } : r)));
            if (typeof res?.unread_count === "number") {
                setUnreadCount(res.unread_count);
            } else if (!row.read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch {
            // keep item if request fails
        }
    };

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Notifications</h1>
                        <p className="text-sm text-orange-700">All updates from your centre (announcements, homework, events, fees, transport, achievements, attendance), newest first.</p>
                        <p className="text-xs text-orange-600 mt-1">Unread: {unreadCount}</p>
                    </div>
                </div>
            </section>

            {loading && <p className="text-sm text-orange-700">Loading…</p>}
            {!loading && rows.length === 0 && <p className="text-sm text-orange-700">No notifications yet.</p>}

            <ul className="space-y-3">
                {rows.map((r) => (
                    <li
                        key={r.id}
                        onClick={() => void markAsRead(r)}
                        className={`rounded-xl border bg-white p-4 shadow-sm cursor-pointer hover:border-orange-200 ${r.read ? "border-slate-200 opacity-70" : "border-orange-100"}`}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="font-semibold text-orange-900">{r.title}</h2>
                                <span className="text-[11px] uppercase tracking-wide rounded-full bg-orange-50 border border-orange-100 px-2 py-0.5 text-orange-700">
                                    {sourceLabel[r.source]}
                                </span>
                                <span className={`text-[11px] uppercase tracking-wide rounded-full px-2 py-0.5 border ${r.read ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                                    {r.read ? "Read" : "Unread"}
                                </span>
                            </div>
                            <span className="text-xs text-orange-600 font-medium">
                                {r.publishedAt ? new Date(r.publishedAt).toLocaleString() : "—"}
                            </span>
                        </div>
                        {r.body && <p className="text-sm text-orange-800 mt-2 whitespace-pre-wrap">{r.body}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

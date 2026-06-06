"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { MonthCalendar } from "@/components/dashboard/shared/MonthCalendar";
import { filterCalendarEvents } from "@/lib/showcase-events";
import { fetchAllApiList, normalizeApiList } from "@/lib/parent-school-api";
import {
    itemsForDate,
    monthStartEnd,
    PortalCalendarItem,
    PORTAL_CALENDAR_TYPE_LABELS,
    sliceDate,
    toLocalMonth,
} from "@/lib/parent-portal-calendar";
import { PARENT_NEWSLETTER_CATEGORY } from "@/config/parent-newsletter";

type ParentPortalCalendarPanelProps = {
    mode: "franchise" | "parent";
    /** When set, calendar highlights this date (e.g. attendance date picker). */
    linkedDate?: string;
    onLinkedDateChange?: (date: string) => void;
};

const normalizeList = (data: unknown): Record<string, unknown>[] => {
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj.results)) return obj.results as Record<string, unknown>[];
        if (Array.isArray(obj.announcements)) return obj.announcements as Record<string, unknown>[];
        if (Array.isArray(obj.notifications)) return obj.notifications as Record<string, unknown>[];
    }
    return [];
};

export function ParentPortalCalendarPanel({
    mode,
    linkedDate,
    onLinkedDateChange,
}: ParentPortalCalendarPanelProps) {
    const { authFetch } = useAuth();
    const [month, setMonth] = useState(() => toLocalMonth(new Date()));
    const [selectedDate, setSelectedDate] = useState(() => sliceDate(linkedDate || new Date().toISOString()));
    const [items, setItems] = useState<PortalCalendarItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (linkedDate) setSelectedDate(sliceDate(linkedDate));
    }, [linkedDate]);

    const handleSelectDate = (date: string) => {
        setSelectedDate(date);
        onLinkedDateChange?.(date);
    };

    const load = useCallback(async () => {
        setLoading(true);
        const { from, to } = monthStartEnd(month);
        try {
            if (mode === "franchise") {
                const [eventsRaw, homeworkRows, announcementRows, newsletterRaw] = await Promise.all([
                    authFetch<unknown>("/events/franchise/"),
                    fetchAllApiList(authFetch, "/students/franchise/homework/"),
                    fetchAllApiList(authFetch, "/students/franchise/announcements/"),
                    authFetch<unknown>(
                        `/documents/franchise/parent-documents/?manage=newsletter&from=${from}&to=${to}`,
                    ),
                ]);

                const calendarItems: PortalCalendarItem[] = [];

                const franchiseEventRows = normalizeApiList(eventsRaw) as Array<{
                    id?: unknown;
                    title?: unknown;
                    start_date?: unknown;
                    end_date?: unknown;
                    date?: unknown;
                    location?: string;
                    venue?: string;
                    notes?: string;
                }>;
                for (const ev of filterCalendarEvents(franchiseEventRows)) {
                    const start = sliceDate(ev.start_date ?? ev.date);
                    const end = sliceDate(ev.end_date ?? ev.start_date ?? ev.date);
                    if (!start) continue;
                    calendarItems.push({
                        id: `event-${ev.id}`,
                        type: "event",
                        title: String(ev.title || "Event"),
                        date: start,
                        endDate: end || start,
                        detail: String(ev.location ?? ev.venue ?? ""),
                    });
                }

                for (const row of homeworkRows as Record<string, unknown>[]) {
                    const date = sliceDate(row.assigned_date);
                    if (!date) continue;
                    calendarItems.push({
                        id: `homework-${row.id}`,
                        type: "homework",
                        title: String(row.title || "Homework"),
                        date,
                        detail: String(row.class_name || row.student_name || ""),
                    });
                }

                for (const row of announcementRows as Record<string, unknown>[]) {
                    const date = sliceDate(row.published_at);
                    if (!date) continue;
                    calendarItems.push({
                        id: `announcement-${row.id}`,
                        type: "announcement",
                        title: String(row.title || "Announcement"),
                        date,
                        detail: String(row.audience_label || row.body || ""),
                    });
                }

                for (const row of normalizeList(newsletterRaw)) {
                    const start = sliceDate(row.period_start ?? row.created_at);
                    const end = sliceDate(row.period_end ?? row.period_start ?? row.created_at);
                    if (!start) continue;
                    calendarItems.push({
                        id: `newsletter-${row.id}`,
                        type: "newsletter",
                        title: String(row.display_title ?? row.title ?? "Newsletter"),
                        date: start,
                        endDate: end || start,
                    });
                }

                setItems(calendarItems);
            } else {
                const [eventsRaw, homeworkRaw, notificationsRaw, newsletterRaw] = await Promise.all([
                    authFetch<unknown>("/events/parent/"),
                    authFetch<unknown>("/students/parent/homework/"),
                    authFetch<unknown>("/students/parent/notifications/"),
                    authFetch<unknown>(`/documents/parent/documents/category/${PARENT_NEWSLETTER_CATEGORY}/`),
                ]);

                const calendarItems: PortalCalendarItem[] = [];

                const parentEventRows = normalizeApiList(eventsRaw) as Array<{
                    id?: unknown;
                    title?: unknown;
                    start_date?: unknown;
                    end_date?: unknown;
                    date?: unknown;
                    location?: string;
                    venue?: string;
                    notes?: string;
                }>;
                for (const ev of filterCalendarEvents(parentEventRows)) {
                    const start = sliceDate(ev.start_date ?? ev.date);
                    const end = sliceDate(ev.end_date ?? ev.start_date ?? ev.date);
                    if (!start) continue;
                    calendarItems.push({
                        id: `event-${ev.id}`,
                        type: "event",
                        title: String(ev.title || "Event"),
                        date: start,
                        endDate: end || start,
                        detail: String(ev.location ?? ""),
                    });
                }

                for (const row of normalizeList(homeworkRaw)) {
                    const date = sliceDate(row.assigned_date);
                    if (!date) continue;
                    calendarItems.push({
                        id: `homework-${row.id}`,
                        type: "homework",
                        title: String(row.title || "Homework"),
                        date,
                        detail: String(row.class_name || row.student_name || ""),
                    });
                }

                const notifPayload = notificationsRaw as Record<string, unknown>;
                const announcementRows = normalizeList(notifPayload?.announcements);
                if (announcementRows.length === 0) {
                    const annOnly = await authFetch<unknown>("/students/parent/announcements/");
                    announcementRows.push(...normalizeList(annOnly));
                }
                for (const row of announcementRows) {
                    const date = sliceDate(row.published_at);
                    if (!date) continue;
                    calendarItems.push({
                        id: `announcement-${row.id}`,
                        type: "announcement",
                        title: String(row.title || "Announcement"),
                        date,
                        detail: String(row.audience_label || row.body || ""),
                    });
                }

                for (const row of normalizeList(newsletterRaw)) {
                    const start = sliceDate(row.period_start ?? row.created_at);
                    const end = sliceDate(row.period_end ?? row.period_start ?? row.created_at);
                    if (!start) continue;
                    calendarItems.push({
                        id: `newsletter-${row.id}`,
                        type: "newsletter",
                        title: String(row.display_title ?? row.title ?? "Newsletter"),
                        date: start,
                        endDate: end || start,
                    });
                }

                setItems(calendarItems);
            }
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, mode, month]);

    useEffect(() => {
        void load();
    }, [load]);

    const dayItems = useMemo(() => itemsForDate(items, selectedDate), [items, selectedDate]);

    return (
        <section className="space-y-4 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Centre calendar</h2>
                    <p className="text-sm text-gray-500">
                        Events, homework, announcements, and newsletters parents see in the app — all on one calendar.
                    </p>
                </div>
            </div>

            <MonthCalendar
                month={month}
                onMonthChange={setMonth}
                items={items}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                loading={loading}
            />

            <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4">
                <h3 className="text-sm font-semibold text-gray-900">
                    {selectedDate
                        ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                          })
                        : "Select a date"}
                </h3>
                {dayItems.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-600">Nothing scheduled for this date.</p>
                ) : (
                    <ul className="mt-3 space-y-2">
                        {dayItems.map((item) => (
                            <li
                                key={item.id}
                                className="rounded-lg border border-white bg-white px-3 py-2 text-sm shadow-sm"
                            >
                                <p className="font-semibold text-gray-900">
                                    <span className="text-xs font-medium text-gray-500">
                                        {PORTAL_CALENDAR_TYPE_LABELS[item.type]}
                                    </span>
                                    <span className="mx-1.5 text-gray-300">·</span>
                                    {item.title}
                                </p>
                                {item.detail ? <p className="mt-0.5 text-xs text-gray-600">{item.detail}</p> : null}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { MonthCalendar } from "@/components/dashboard/shared/MonthCalendar";
import { filterCalendarEvents } from "@/lib/showcase-events";
import { fetchAllApiList, normalizeApiList } from "@/lib/parent-school-api";
import {
    dateMonthKey,
    itemsForDate,
    localDateString,
    monthStartEnd,
    PortalCalendarItem,
    PORTAL_CALENDAR_TYPE_LABELS,
    sliceDate,
    toLocalMonth,
} from "@/lib/parent-portal-calendar";
import { PARENT_NEWSLETTER_CATEGORY } from "@/config/parent-newsletter";
import { withParentScopedQuery, withParentStudentQuery } from "@/lib/parent-student-query";

type ParentPortalCalendarPanelProps = {
    mode: "franchise" | "parent";
    /** When set, calendar highlights this date (e.g. attendance date picker). */
    linkedDate?: string;
    onLinkedDateChange?: (date: string) => void;
    /** Filter homework and notifications to the selected child (parent app). */
    parentStudentId?: string;
    /** @deprecated Backend scopes via ?student=; kept for call-site compatibility. */
    parentStudentClassName?: string;
};

const DAY_ITEMS_PREVIEW = 5;

const normalizeList = (data: unknown): Record<string, unknown>[] => {
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj.results)) return obj.results as Record<string, unknown>[];
        if (Array.isArray(obj.homework)) return obj.homework as Record<string, unknown>[];
        if (Array.isArray(obj.announcements)) return obj.announcements as Record<string, unknown>[];
        if (Array.isArray(obj.notifications)) return obj.notifications as Record<string, unknown>[];
    }
    return [];
};

const rowClassName = (row: Record<string, unknown>): string => {
    const direct = String(row.class_name || "").trim();
    if (direct && direct.toLowerCase() !== "all classes" && direct.toLowerCase() !== "all") return direct;
    const audience = String(row.audience_label || "").trim();
    if (audience && audience.toLowerCase() !== "all classes" && audience.toLowerCase() !== "all") return audience;
    const studentName = String(row.student_name || "");
    const match = studentName.match(/All students \((.+)\)/i);
    return match?.[1]?.trim() || direct || audience || "";
};

const portalHomeworkDetail = (row: Record<string, unknown>): string => {
    const cls = rowClassName(row);
    if (cls) return cls;
    const studentName = String(row.student_name || "").trim();
    if (studentName && !/^all students/i.test(studentName)) return studentName;
    return "All classes";
};

const portalAnnouncementDetail = (row: Record<string, unknown>): string => {
    const cls = rowClassName(row);
    if (cls) return cls;
    return String(row.audience_label || row.body || "").trim();
};

const CALENDAR_ITEM_TYPES = new Set(["event", "homework", "announcement", "newsletter"]);

const mapApiCalendarItem = (row: Record<string, unknown>): PortalCalendarItem | null => {
    const type = String(row.type || "").trim().toLowerCase();
    if (!CALENDAR_ITEM_TYPES.has(type)) return null;
    const date = sliceDate(row.date);
    if (!date) return null;
    const endRaw = row.end_date ?? row.endDate;
    const endDate = endRaw ? sliceDate(endRaw) : undefined;
    return {
        id: String(row.id || `${type}-${row.source_id ?? row.id ?? date}`),
        type: type as PortalCalendarItem["type"],
        title: String(row.title || "").trim() || type,
        date,
        endDate: endDate && endDate !== date ? endDate : undefined,
        detail: String(row.detail || "").trim(),
    };
};

const buildCalendarItemsFromCombinedPayload = (payload: Record<string, unknown>): PortalCalendarItem[] => {
    const fromItems = normalizeList(payload.calendar_items)
        .map(mapApiCalendarItem)
        .filter((row): row is PortalCalendarItem => row !== null);
    if (fromItems.length > 0) return fromItems;

    const built: PortalCalendarItem[] = [];
    for (const ev of normalizeList(payload.calendar_events)) {
        const mapped = mapApiCalendarItem({
            id: `event-${ev.id}`,
            type: "event",
            title: ev.title,
            date: ev.start_date ?? ev.date,
            end_date: ev.end_date,
            detail: ev.audience_label ?? ev.class_name ?? ev.location,
            source_id: ev.id,
        });
        if (mapped) built.push(mapped);
    }
    for (const row of normalizeList(payload.homework)) {
        const mapped = mapApiCalendarItem({
            id: `homework-${row.id}`,
            type: "homework",
            title: row.title,
            date: row.assigned_date,
            detail: portalHomeworkDetail(row),
            source_id: row.id,
        });
        if (mapped) built.push(mapped);
    }
    for (const row of normalizeList(payload.announcements)) {
        const mapped = mapApiCalendarItem({
            id: `announcement-${row.id}`,
            type: "announcement",
            title: row.title,
            date: row.published_at,
            detail: portalAnnouncementDetail(row),
            source_id: row.id,
        });
        if (mapped) built.push(mapped);
    }
    return built;
};

export function ParentPortalCalendarPanel({
    mode,
    linkedDate,
    onLinkedDateChange,
    parentStudentId,
    parentStudentClassName: _parentStudentClassName,
}: ParentPortalCalendarPanelProps) {
    const { authFetch } = useAuth();
    const [month, setMonth] = useState(() => toLocalMonth(new Date()));
    const [selectedDate, setSelectedDate] = useState(() =>
        sliceDate(linkedDate || localDateString()),
    );
    const [items, setItems] = useState<PortalCalendarItem[]>([]);
    const [dayItems, setDayItems] = useState<PortalCalendarItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [dayLoading, setDayLoading] = useState(false);
    const [dayItemsExpanded, setDayItemsExpanded] = useState(false);

    useEffect(() => {
        if (!linkedDate) return;
        const d = sliceDate(linkedDate);
        setSelectedDate(d);
        const linkedMonth = dateMonthKey(d);
        if (linkedMonth) setMonth(linkedMonth);
    }, [linkedDate]);

    useEffect(() => {
        setDayItemsExpanded(false);
    }, [selectedDate]);

    const handleSelectDate = useCallback(
        (date: string) => {
            const d = sliceDate(date);
            setSelectedDate(d);
            const pickedMonth = dateMonthKey(d);
            setMonth((prev) => (pickedMonth && pickedMonth !== prev ? pickedMonth : prev));
            onLinkedDateChange?.(d);
        },
        [onLinkedDateChange],
    );

    const load = useCallback(async () => {
        if (mode === "parent" && !parentStudentId) {
            setItems([]);
            setLoading(false);
            return;
        }
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
                const calPath = withParentStudentQuery("/students/parent/calendar-attendance/", parentStudentId);
                const newsletterPath = withParentStudentQuery(
                    `/documents/parent/documents/category/${PARENT_NEWSLETTER_CATEGORY}/`,
                    parentStudentId,
                );

                const [calResult, newsletterResult] = await Promise.allSettled([
                    authFetch<unknown>(calPath),
                    authFetch<unknown>(newsletterPath),
                ]);

                const calendarItems: PortalCalendarItem[] = [];
                if (calResult.status === "fulfilled" && calResult.value && typeof calResult.value === "object") {
                    calendarItems.push(
                        ...buildCalendarItemsFromCombinedPayload(calResult.value as Record<string, unknown>),
                    );
                }

                if (newsletterResult.status === "fulfilled") {
                    for (const row of normalizeList(newsletterResult.value)) {
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
                }

                setItems(calendarItems);
            }
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, mode, month, parentStudentId]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (mode !== "parent" || !parentStudentId || !selectedDate) {
            setDayItems([]);
            setDayLoading(false);
            return;
        }
        let cancelled = false;
        setDayLoading(true);
        (async () => {
            try {
                const path = withParentScopedQuery(
                    "/students/parent/calendar-attendance/",
                    parentStudentId,
                    selectedDate,
                );
                const payload = await authFetch<unknown>(path);
                if (cancelled) return;
                setDayItems(
                    buildCalendarItemsFromCombinedPayload(
                        payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {},
                    ),
                );
            } catch {
                if (!cancelled) setDayItems([]);
            } finally {
                if (!cancelled) setDayLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [authFetch, mode, parentStudentId, selectedDate]);

    const dayItemsForPanel = useMemo(() => {
        if (mode === "parent") return dayItems;
        return itemsForDate(items, selectedDate);
    }, [mode, dayItems, items, selectedDate]);

    const visibleDayItems =
        dayItemsExpanded || dayItemsForPanel.length <= DAY_ITEMS_PREVIEW
            ? dayItemsForPanel
            : dayItemsForPanel.slice(0, DAY_ITEMS_PREVIEW);
    const hiddenDayItemCount = dayItemsForPanel.length - visibleDayItems.length;

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
                {dayLoading ? (
                    <p className="mt-2 text-sm text-gray-600">Loading this date…</p>
                ) : dayItemsForPanel.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-600">Nothing scheduled for this date.</p>
                ) : (
                    <>
                        <ul className="mt-3 space-y-2">
                            {visibleDayItems.map((item) => (
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
                                    {item.detail ? (
                                        <p className="mt-0.5 text-xs text-gray-600">{item.detail}</p>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                        {hiddenDayItemCount > 0 ? (
                            <button
                                type="button"
                                onClick={() => setDayItemsExpanded(true)}
                                className="mt-2 w-full rounded-lg border border-dashed border-orange-200 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
                            >
                                Show {hiddenDayItemCount} more
                            </button>
                        ) : null}
                        {dayItemsExpanded && dayItemsForPanel.length > DAY_ITEMS_PREVIEW ? (
                            <button
                                type="button"
                                onClick={() => setDayItemsExpanded(false)}
                                className="mt-2 w-full rounded-lg border border-dashed border-orange-200 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
                            >
                                Show less
                            </button>
                        ) : null}
                    </>
                )}
            </div>
        </section>
    );
}

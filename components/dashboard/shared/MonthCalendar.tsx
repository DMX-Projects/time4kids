"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    buildMonthGrid,
    formatMonthLabel,
    itemTypesOnDate,
    PORTAL_CALENDAR_TYPE_COLORS,
    PORTAL_CALENDAR_TYPE_LABELS,
    PortalCalendarItem,
    PortalCalendarItemType,
    shiftMonth,
    sliceDate,
} from "@/lib/parent-portal-calendar";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type MonthCalendarProps = {
    month: string;
    onMonthChange: (month: string) => void;
    items: PortalCalendarItem[];
    selectedDate: string;
    onSelectDate: (date: string) => void;
    loading?: boolean;
};

export function MonthCalendar({
    month,
    onMonthChange,
    items,
    selectedDate,
    onSelectDate,
    loading = false,
}: MonthCalendarProps) {
    const weeks = buildMonthGrid(month);
    const today = sliceDate(new Date().toISOString());
    const allTypes: PortalCalendarItemType[] = ["event", "homework", "announcement", "newsletter"];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onMonthChange(shiftMonth(month, -1))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h2 className="min-w-[10rem] text-center text-base font-semibold text-gray-900">
                        {formatMonthLabel(month)}
                    </h2>
                    <button
                        type="button"
                        onClick={() => onMonthChange(shiftMonth(month, 1))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        aria-label="Next month"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                    {allTypes.map((type) => (
                        <span key={type} className="inline-flex items-center gap-1.5">
                            <span className={`h-2.5 w-2.5 rounded-full ${PORTAL_CALENDAR_TYPE_COLORS[type]}`} />
                            {PORTAL_CALENDAR_TYPE_LABELS[type]}
                        </span>
                    ))}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-orange-100 bg-white">
                <div className="grid grid-cols-7 border-b border-orange-100 bg-orange-50 text-center text-xs font-semibold text-orange-900">
                    {WEEKDAYS.map((d) => (
                        <div key={d} className="px-1 py-2">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="divide-y divide-orange-50">
                    {weeks.map((week, wi) => (
                        <div key={wi} className="grid grid-cols-7">
                            {week.map((date, di) => {
                                if (!date) {
                                    return <div key={`${wi}-${di}`} className="min-h-[4.5rem] bg-gray-50/40" />;
                                }
                                const types = itemTypesOnDate(items, date);
                                const isSelected = selectedDate === date;
                                const isToday = date === today;
                                return (
                                    <button
                                        key={date}
                                        type="button"
                                        onClick={() => onSelectDate(date)}
                                        className={`min-h-[4.5rem] border-r border-orange-50 p-1.5 text-left transition-colors last:border-r-0 ${
                                            isSelected
                                                ? "bg-orange-100 ring-2 ring-inset ring-orange-400"
                                                : "hover:bg-orange-50/60"
                                        }`}
                                    >
                                        <span
                                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                                                isToday ? "bg-orange-600 text-white" : "text-gray-800"
                                            }`}
                                        >
                                            {Number(date.slice(8, 10))}
                                        </span>
                                        <div className="mt-1 flex flex-wrap gap-0.5">
                                            {types.map((type) => (
                                                <span
                                                    key={type}
                                                    className={`h-1.5 w-1.5 rounded-full ${PORTAL_CALENDAR_TYPE_COLORS[type]}`}
                                                    title={PORTAL_CALENDAR_TYPE_LABELS[type]}
                                                />
                                            ))}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {loading ? <p className="text-sm text-gray-500">Loading calendar items…</p> : null}
        </div>
    );
}

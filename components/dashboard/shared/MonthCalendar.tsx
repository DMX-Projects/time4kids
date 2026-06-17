"use client";

import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    buildMonthGrid,
    formatMonthLabel,
    itemTypesOnDate,
    localDateString,
    PORTAL_CALENDAR_TYPE_COLORS,
    PORTAL_CALENDAR_TYPE_LABELS,
    PortalCalendarItem,
    PortalCalendarItemType,
    shiftMonth,
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
    const today = localDateString();
    const allTypes: PortalCalendarItemType[] = ["event", "homework", "announcement", "newsletter"];

    const activateDate = useCallback(
        (date: string) => {
            onSelectDate(date);
        },
        [onSelectDate],
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onMonthChange(shiftMonth(month, -1))}
                        className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="h-5 w-5 pointer-events-none" />
                    </button>
                    <h2 className="min-w-[10rem] text-center text-base font-semibold text-gray-900">
                        {formatMonthLabel(month)}
                    </h2>
                    <button
                        type="button"
                        onClick={() => onMonthChange(shiftMonth(month, 1))}
                        className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                        aria-label="Next month"
                    >
                        <ChevronRight className="h-5 w-5 pointer-events-none" />
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

            <div className="rounded-xl border border-orange-100 bg-white">
                <div className="grid grid-cols-7 border-b border-orange-100 bg-orange-50 text-center text-xs font-semibold text-orange-900">
                    {WEEKDAYS.map((d) => (
                        <div key={d} className="px-1 py-2">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="divide-y divide-orange-50" role="grid" aria-label="Calendar">
                    {weeks.map((week, wi) => (
                        <div key={wi} className="grid grid-cols-7">
                            {week.map((date, di) => {
                                if (!date) {
                                    return <div key={`${wi}-${di}`} className="min-h-[3.25rem] bg-gray-50/40 sm:min-h-[4.5rem]" />;
                                }
                                const types = itemTypesOnDate(items, date);
                                const isSelected = selectedDate === date;
                                const isToday = date === today;
                                return (
                                    <button
                                        key={date}
                                        type="button"
                                        role="gridcell"
                                        aria-label={date}
                                        aria-selected={isSelected}
                                        onPointerUp={(e) => {
                                            if (e.pointerType === "mouse" && e.button !== 0) return;
                                            activateDate(date);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                activateDate(date);
                                            }
                                        }}
                                        className={`relative z-[1] flex min-h-[3.25rem] w-full cursor-pointer touch-manipulation select-none flex-col border-r border-orange-50 p-2 text-left transition-colors last:border-r-0 active:bg-orange-100 sm:min-h-[4.5rem] ${
                                            isSelected
                                                ? "bg-orange-100 outline outline-2 outline-orange-400 -outline-offset-2"
                                                : "hover:bg-orange-50/60"
                                        }`}
                                        style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
                                    >
                                        <span
                                            className={`pointer-events-none inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold sm:h-7 sm:w-7 ${
                                                isToday ? "bg-orange-600 text-white" : "text-gray-800"
                                            }`}
                                        >
                                            {Number(date.slice(8, 10))}
                                        </span>
                                        <div className="pointer-events-none mt-1 flex min-h-[0.375rem] flex-wrap gap-0.5">
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

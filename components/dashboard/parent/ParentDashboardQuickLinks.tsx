"use client";

import Link from "next/link";
import { CalendarDays, ClipboardList, ScrollText, Sparkles, ThumbsUp } from "lucide-react";
import { PARENT_DASHBOARD_QUICK_LINKS } from "@/config/parent-dashboard-quick-links";

const handwritten = "font-[family-name:var(--font-schoolbell)] tracking-wide";

function useNativeAnchor(href: string) {
    const t = href.trim();
    return /^https?:\/\//i.test(t) || /^about:/i.test(t) || /^mailto:/i.test(t) || /^tel:/i.test(t);
}

function opensNewTab(href: string) {
    const t = href.trim().toLowerCase();
    if (t === "about:blank") return true;
    return /^https?:\/\//i.test(href.trim());
}

function QuickLinkShell({
    href,
    ariaLabel,
    children,
}: {
    href: string;
    ariaLabel: string;
    children: React.ReactNode;
}) {
    const className =
        "group block w-full select-none transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700";

    if (useNativeAnchor(href)) {
        const blank = opensNewTab(href);
        return (
            <a
                href={href}
                {...(blank ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={ariaLabel}
                className={className}
            >
                {children}
            </a>
        );
    }

    return (
        <Link href={href} aria-label={ariaLabel} className={className}>
            {children}
        </Link>
    );
}

export function ParentDashboardQuickLinks({
    upcomingEventsCount = 0,
    gradesCount = 0,
    gradesLoading = false,
}: {
    upcomingEventsCount?: number;
    gradesCount?: number;
    gradesLoading?: boolean;
}) {
    return (
        <div className="space-y-3">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500 lg:text-left">
                Quick links
            </p>

            <QuickLinkShell
                href={PARENT_DASHBOARD_QUICK_LINKS.studentReferral}
                ariaLabel={
                    opensNewTab(PARENT_DASHBOARD_QUICK_LINKS.studentReferral)
                        ? "Student referral (opens in a new tab)"
                        : "Student referral"
                }
            >
                <div className="flex overflow-hidden rounded-2xl shadow-md ring-1 ring-black/10">
                    <div
                        className="flex w-[3.25rem] shrink-0 flex-col items-center justify-center gap-0.5 bg-[#5C3D2E] py-3 text-white"
                        aria-hidden
                    >
                        <Sparkles className="h-3.5 w-3.5 opacity-95" strokeWidth={2.2} />
                        <ThumbsUp className="h-7 w-7" strokeWidth={2.25} />
                    </div>
                    <div
                        className={`flex min-h-[3.25rem] flex-1 items-center justify-center bg-[#FF922B] px-3 py-3 text-center text-lg leading-tight text-[#3d2914] sm:text-xl ${handwritten}`}
                    >
                        Student Referral
                    </div>
                </div>
            </QuickLinkShell>

            <QuickLinkShell
                href={PARENT_DASHBOARD_QUICK_LINKS.viewFeeDetails}
                ariaLabel={
                    opensNewTab(PARENT_DASHBOARD_QUICK_LINKS.viewFeeDetails)
                        ? "View fee details (opens in a new tab)"
                        : "View fee details"
                }
            >
                <div className="flex overflow-hidden rounded-[1.35rem] border-2 border-amber-800/15 bg-[#FFE066] shadow-md ring-1 ring-amber-900/10">
                    <div
                        className="flex w-[3.25rem] shrink-0 flex-col items-center justify-center bg-white py-3 text-[#1e293b]"
                        aria-hidden
                    >
                        <div className="relative">
                            <ScrollText className="h-8 w-8" strokeWidth={2} />
                            <span className="absolute -bottom-0.5 -right-1 text-xs font-bold leading-none text-[#1e293b]">
                                ₹
                            </span>
                        </div>
                    </div>
                    <div
                        className={`flex min-h-[3.25rem] flex-1 items-center justify-center px-3 py-3 text-center text-lg leading-tight text-[#3d3319] sm:text-xl ${handwritten}`}
                    >
                        View Fee Details
                    </div>
                </div>
            </QuickLinkShell>

            <Link
                href="/dashboard/parent/marks-grades"
                aria-label="Open marks and grades"
                className="relative block overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#A5D8FF]" aria-hidden />
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#A5D8FF] text-[#1F2937] shadow-sm">
                        <ClipboardList className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#1F2937]">
                            Marks / Grades
                            <span className="rounded-full bg-[#FFF4CC] px-2 py-1 text-[11px] uppercase tracking-wide text-[#1F2937]">
                                Keep tracking
                            </span>
                        </p>
                        <p className="text-2xl font-bold text-[#1F2937]">{gradesLoading ? "…" : gradesCount}</p>
                        <p className="text-xs text-[#4B5563]">
                            {gradesLoading
                                ? "Loading…"
                                : gradesCount === 0
                                  ? "No marks posted yet"
                                  : `${gradesCount} record${gradesCount === 1 ? "" : "s"} from your centre`}
                        </p>
                    </div>
                </div>
            </Link>

            <Link
                href="/dashboard/parent/events"
                aria-label="Open upcoming events"
                className="relative block overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF922B]" aria-hidden />
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FF922B] text-[#1F2937] shadow-sm">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#1F2937]">
                            Upcoming Events
                            <span className="rounded-full bg-[#FFF4CC] px-2 py-1 text-[11px] uppercase tracking-wide text-[#1F2937]">
                                Don&apos;t miss
                            </span>
                        </p>
                        <p className="text-2xl font-bold text-[#1F2937]">{upcomingEventsCount}</p>
                        <p className="text-xs text-[#4B5563]">
                            {upcomingEventsCount === 0
                                ? "No upcoming events from your centre"
                                : `${upcomingEventsCount} from today onward`}
                        </p>
                    </div>
                </div>
            </Link>

            <Link
                href="/dashboard/parent/activities"
                aria-label="Open Today's Activities"
                className="relative block overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-pink-500" aria-hidden />
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-500 text-white shadow-sm">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#1F2937]">
                            Today's Activities
                            <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-pink-700 font-bold">
                                Daily Brief
                            </span>
                        </p>
                        <p className="text-xs text-[#4B5563] mt-1">
                            Check drawings, dance, and stories conducted today.
                        </p>
                    </div>
                </div>
            </Link>
        </div>
    );
}

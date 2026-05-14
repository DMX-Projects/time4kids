"use client";

import Link from "next/link";
import { ScrollText, Sparkles, ThumbsUp } from "lucide-react";
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

export function ParentDashboardQuickLinks() {
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
        </div>
    );
}

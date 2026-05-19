"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** Where home-page shortcut carousel lives (KeyNavigation). */
export const HOME_SHORTCUTS_HASH = "home-shortcuts";

export function shouldShowPublicBack(pathname: string): boolean {
    const path = pathname.replace(/\/+$/, "") || "/";
    if (path === "/") return false;
    if (path.startsWith("/dashboard")) return false;
    if (path.startsWith("/login")) return false;
    if (path.startsWith("/driver")) return false;
    if (path.startsWith("/leads")) return false;
    return true;
}

export default function PublicPageBackLink({ className = "" }: { className?: string }) {
    const pathname = usePathname() ?? "";
    if (!shouldShowPublicBack(pathname)) return null;

    return (
        <Link
            href={`/#${HOME_SHORTCUTS_HASH}`}
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-200/80 bg-white px-2 py-1 text-[11px] font-semibold text-[#003366] shadow-sm transition hover:border-orange-300 hover:bg-orange-50 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs lg:hidden ${className}`}
            aria-label="Back to home page shortcuts"
        >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
            <span>Back</span>
        </Link>
    );
}

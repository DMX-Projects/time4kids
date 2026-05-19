"use client";

import Link from "next/link";
import {
    CalendarDays,
    CalendarRange,
    ClipboardList,
    FileText,
    LayoutGrid,
    MessageSquare,
    UserCircle,
} from "lucide-react";
import { useFranchiseData } from "@/components/dashboard/franchise/FranchiseDataProvider";
import { FranchiseCenterPageAccordion } from "@/components/dashboard/franchise/FranchiseCenterPageAccordion";
import {
    FRANCHISE_CENTER_PAGE_BLOCK_A,
    FRANCHISE_CENTER_PAGE_BLOCK_B,
} from "@/config/franchise-center-page-nav";
import { FRANCHISE_DASHBOARD_RIGHT_ACTION_URLS } from "@/config/franchise-dashboard-side-actions";

function SideActionButton({ href, label }: { href: string; label: string }) {
    const ready = href.trim().length > 0;
    const className =
        "inline-flex items-center justify-center rounded-lg border-2 border-primary-500 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";

    if (ready) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={`${className} bg-white`}>
                {label}
            </a>
        );
    }

    return (
        <button
            type="button"
            disabled
            title="Link not set yet — add URL in franchise-dashboard-side-actions.ts"
            className={`${className} cursor-not-allowed opacity-55`}
        >
            {label}
        </button>
    );
}

const quickLinks = [
    { href: "/dashboard/franchise/parents/", label: "Parent records", icon: ClipboardList },
    { href: "/dashboard/franchise/students/", label: "Students", icon: UserCircle },
    { href: "/dashboard/franchise/attendance/", label: "Attendance", icon: CalendarDays },
    { href: "/dashboard/franchise/parent-portal/", label: "Parent portal", icon: LayoutGrid },
    { href: "/dashboard/franchise/parent-documents/", label: "Parent documents", icon: FileText },
    { href: "/dashboard/franchise/enquiries/", label: "Enquiries", icon: MessageSquare },
    { href: "/dashboard/franchise/events/", label: "Events", icon: CalendarRange },
];

export default function FranchiseDashboardPage() {
    const { profile } = useFranchiseData();
    const { indentsPlacing } = FRANCHISE_DASHBOARD_RIGHT_ACTION_URLS;
    const centreName = profile.name?.trim() || profile.centre?.trim() || "your centre";

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Welcome to <span className="font-semibold text-slate-800">{centreName}</span>. Use the menu on
                        the left for day-to-day tasks.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end shrink-0">
                    <SideActionButton href={indentsPlacing} label="Indents Placing" />
                </div>
            </div>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {quickLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm transition hover:border-orange-300 hover:shadow-md"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <Icon className="h-5 w-5" />
                        </span>
                        <span className="text-sm font-semibold text-slate-800">{label}</span>
                    </Link>
                ))}
            </section>

            <FranchiseCenterPageAccordion
                sections={[FRANCHISE_CENTER_PAGE_BLOCK_A, FRANCHISE_CENTER_PAGE_BLOCK_B]}
                mode="franchise"
            />
        </div>
    );
}

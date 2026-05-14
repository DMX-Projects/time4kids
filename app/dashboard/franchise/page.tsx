"use client";

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
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${className} bg-white`}
            >
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

export default function FranchiseDashboardPage() {
    const { indentsPlacing } = FRANCHISE_DASHBOARD_RIGHT_ACTION_URLS;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Centre resource hub — same structure and order as the head-office Center Page checklist.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end shrink-0">
                    <SideActionButton href={indentsPlacing} label="Indents Placing" />
                </div>
            </div>

            <FranchiseCenterPageAccordion
                mode="franchise"
                sections={[FRANCHISE_CENTER_PAGE_BLOCK_A, FRANCHISE_CENTER_PAGE_BLOCK_B]}
            />
        </div>
    );
}

"use client";

import { useMemo } from "react";
import { FranchiseCenterPageAccordion } from "@/components/dashboard/franchise/FranchiseCenterPageAccordion";
import {
    FRANCHISE_CENTER_PAGE_BLOCK_A,
    FRANCHISE_CENTER_PAGE_BLOCK_B,
} from "@/config/franchise-center-page-nav";
import { FRANCHISE_DASHBOARD_RIGHT_ACTION_URLS } from "@/config/franchise-dashboard-side-actions";
import { useCentrePageNavCustom } from "@/hooks/useCentrePageNavCustom";
import { mergeCentrePageBlocks } from "@/lib/centre-page-nav-custom";

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

export default function FranchiseDashboardPage() {
    const { customNav } = useCentrePageNavCustom();
    const { indentsPlacing } = FRANCHISE_DASHBOARD_RIGHT_ACTION_URLS;
    const centrePageSections = useMemo(
        () => mergeCentrePageBlocks(FRANCHISE_CENTER_PAGE_BLOCK_A, FRANCHISE_CENTER_PAGE_BLOCK_B, customNav),
        [customNav],
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Your centre name and city are shown in the sidebar. Use the menu for day-to-day tasks.
                        Head-office documents (SOP, academic files, formats, and more) are below.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end shrink-0">
                    <SideActionButton href={indentsPlacing} label="Indents Placing" />
                </div>
            </div>

            <section id="center-page" className="scroll-mt-6">
                <FranchiseCenterPageAccordion
                    sections={centrePageSections}
                    mode="franchise"
                />
            </section>
        </div>
    );
}

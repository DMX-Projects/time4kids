"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { FranchiseCenterPageAccordion } from "@/components/dashboard/franchise/FranchiseCenterPageAccordion";
import { FranchiseHubOrphanDocs } from "@/components/dashboard/franchise/FranchiseHubOrphanDocs";
import { FRANCHISE_ACADEMIC_HUB_SECTION } from "@/config/franchise-center-page-nav";
import {
    collectLinksFromTopItem,
    groupFranchiseHubDocsByCategory,
    groupFranchiseHubDocsBySourcePath,
    groupOrphanHubDocsForTopItem,
} from "@/lib/franchise-center-page-links";
import type { FranchiseHubDoc } from "@/components/dashboard/franchise/FranchiseResourceFileRow";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";

export default function AcademicDocumentsPage() {
    const { authFetch } = useAuth();
    const [hubDocs, setHubDocs] = useState<FranchiseHubDoc[]>([]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const data = await authFetch<FranchiseHubDoc[]>("/documents/franchise/documents/");
                if (!cancelled) setHubDocs(Array.isArray(data) ? data : []);
            } catch {
                if (!cancelled) setHubDocs([]);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, [authFetch]);

    const hubDocsByCategory = useMemo(() => groupFranchiseHubDocsByCategory(hubDocs), [hubDocs]);
    const hubDocsBySourcePath = useMemo(() => groupFranchiseHubDocsBySourcePath(hubDocs), [hubDocs]);

    const orphanGroups = useMemo(
        () =>
            groupOrphanHubDocsForTopItem(
                FRANCHISE_ACADEMIC_HUB_SECTION,
                hubDocsByCategory,
                hubDocsBySourcePath,
            ),
        [hubDocsByCategory, hubDocsBySourcePath],
    );

    const checklistLinkCount = useMemo(
        () => collectLinksFromTopItem(FRANCHISE_ACADEMIC_HUB_SECTION).length,
        [],
    );

    return (
        <div className="space-y-5">
            <div className="space-y-3">
                <Link
                    href="/dashboard/franchise/#center-page"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-700 hover:text-orange-800"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Back to Center Page
                </Link>
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-[#111827]">
                        Academic Documents (AY 2026–27)
                    </h1>
                    <p className="max-w-2xl text-sm text-[#374151]">
                        Study material, holiday lists, welcome letters, and related files — grouped
                        by topic. Open a grey heading to see download links underneath.
                    </p>
                </div>
            </div>

            <FranchiseCenterPageAccordion
                sections={[[FRANCHISE_ACADEMIC_HUB_SECTION]]}
                mode="franchise"
                hub={{
                    title: "Academic Documents",
                    description: "Same order as the Center Page checklist.",
                    initialOpenTopIds: ["academic-ay"],
                    expandAllSections: true,
                    flattenTopLevel: true,
                }}
            />

            <FranchiseHubOrphanDocs groups={orphanGroups} />

            <p className="text-xs text-[#6B7280]">
                {checklistLinkCount} checklist items · shared by head office for your centre.
            </p>
        </div>
    );
}

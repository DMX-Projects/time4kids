import type { ParentAppNavCustomData } from "@/lib/parent-app-nav-custom";
import { buildParentDashboardSectionsFromNav } from "@/lib/parent-dashboard-doc-sections";

/** Parent home dashboard — document sections (built-in checklist + admin overrides). */
export type ParentDashboardDocumentSection = {
    id: string;
    kind: "documents";
    category: string;
    title: string;
    subtitle: string;
};

export type ParentDashboardLinkSection = {
    id: string;
    kind: "link";
    title: string;
    href: string;
    subtitle: string;
};

export type ParentDashboardSection = ParentDashboardDocumentSection | ParentDashboardLinkSection;

export function mergeParentDashboardSections(
    custom: ParentAppNavCustomData | null | undefined,
): ParentDashboardSection[] {
    return buildParentDashboardSectionsFromNav(custom);
}

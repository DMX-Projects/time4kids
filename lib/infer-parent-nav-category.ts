import type { CenterPageLink, CenterPageTopItem } from "@/config/franchise-center-page-nav";
import { PARENT_APP_DOCUMENT_CHECKLIST } from "@/config/parent-app-document-checklist";
import {
    DEFAULT_CUSTOM_PARENT_DOCUMENT_CATEGORY,
} from "@/config/parent-document-categories";
import type { CentrePageLinkAnchor } from "@/lib/centre-page-nav-custom";

function firstCategory(links?: CenterPageLink[]): string | undefined {
    if (!links?.length) return undefined;
    for (const link of links) {
        const cat = link.adminCategory?.trim();
        if (cat) return cat;
    }
    return undefined;
}

export function isBuiltInParentChecklistTop(topId: string): boolean {
    return PARENT_APP_DOCUMENT_CHECKLIST.some((s) => s.id === topId);
}

/**
 * Custom admin sections used to default to PRESCHOOL_POLICIES (PDF-only).
 * Map legacy/custom rows to mixed-media category for upload + parent display.
 */
export function effectiveParentUploadCategory(category: string, topId: string): string {
    const cat = (category || "").trim();
    if (isBuiltInParentChecklistTop(topId)) return cat || DEFAULT_CUSTOM_PARENT_DOCUMENT_CATEGORY;
    if (!cat || cat === "PRESCHOOL_POLICIES") return DEFAULT_CUSTOM_PARENT_DOCUMENT_CATEGORY;
    return cat;
}

/** Pick parent document category for a new custom link from sibling rows. */
export function inferParentCategoryForAnchor(
    anchor: CentrePageLinkAnchor,
    sections: CenterPageTopItem[][],
): string {
    const builtIn = PARENT_APP_DOCUMENT_CHECKLIST.find((s) => s.id === anchor.topId);
    if (builtIn) return builtIn.category;

    const top = sections.flat().find((item) => item.id === anchor.topId);
    if (!top) return DEFAULT_CUSTOM_PARENT_DOCUMENT_CATEGORY;

    if (anchor.groupTitle) {
        const group = top.groups.find((g) => g.title === anchor.groupTitle);
        if (group) {
            if (anchor.nestedTitle && group.nested?.length) {
                const nested = group.nested.find((n) => n.title === anchor.nestedTitle);
                const fromNested = firstCategory(nested?.links);
                if (fromNested) return effectiveParentUploadCategory(fromNested, anchor.topId);
            }
            const fromGroup = firstCategory(group.links);
            if (fromGroup) return effectiveParentUploadCategory(fromGroup, anchor.topId);
        }
    }

    const fromDirect = firstCategory(top.directLinks);
    if (fromDirect) return effectiveParentUploadCategory(fromDirect, anchor.topId);

    return DEFAULT_CUSTOM_PARENT_DOCUMENT_CATEGORY;
}

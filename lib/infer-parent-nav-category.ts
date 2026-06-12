import type { CenterPageLink, CenterPageTopItem } from "@/config/franchise-center-page-nav";
import { PARENT_APP_DOCUMENT_CHECKLIST } from "@/config/parent-app-document-checklist";
import type { CentrePageLinkAnchor } from "@/lib/centre-page-nav-custom";

function firstCategory(links?: CenterPageLink[]): string | undefined {
    if (!links?.length) return undefined;
    for (const link of links) {
        const cat = link.adminCategory?.trim();
        if (cat) return cat;
    }
    return undefined;
}

/** Pick parent document category for a new custom link from sibling rows. */
export function inferParentCategoryForAnchor(
    anchor: CentrePageLinkAnchor,
    sections: CenterPageTopItem[][],
): string {
    const builtIn = PARENT_APP_DOCUMENT_CHECKLIST.find((s) => s.id === anchor.topId);
    if (builtIn) return builtIn.category;

    const top = sections.flat().find((item) => item.id === anchor.topId);
    if (!top) return "PRESCHOOL_POLICIES";

    if (anchor.groupTitle) {
        const group = top.groups.find((g) => g.title === anchor.groupTitle);
        if (group) {
            if (anchor.nestedTitle && group.nested?.length) {
                const nested = group.nested.find((n) => n.title === anchor.nestedTitle);
                const fromNested = firstCategory(nested?.links);
                if (fromNested) return fromNested;
            }
            const fromGroup = firstCategory(group.links);
            if (fromGroup) return fromGroup;
        }
    }

    const fromDirect = firstCategory(top.directLinks);
    if (fromDirect) return fromDirect;

    return "PRESCHOOL_POLICIES";
}

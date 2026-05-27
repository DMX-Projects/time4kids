import type { CenterPageLink, CenterPageTopItem } from "@/config/franchise-center-page-nav";
import type { CentrePageLinkAnchor } from "@/lib/centre-page-nav-custom";

function firstCategory(links?: CenterPageLink[]): string | undefined {
    if (!links?.length) return undefined;
    for (const link of links) {
        const cat = link.adminCategory?.trim();
        if (cat) return cat;
    }
    return undefined;
}

/** Pick storage category for a new custom link from sibling rows in the same section. */
export function inferCategoryForAnchor(
    anchor: CentrePageLinkAnchor,
    sections: CenterPageTopItem[][],
): string {
    const top = sections.flat().find((item) => item.id === anchor.topId);
    if (!top) return "ACADEMIC_DOCUMENTS";

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

    return "ACADEMIC_DOCUMENTS";
}

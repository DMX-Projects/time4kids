import type {
    CenterPageLink,
    CenterPageNestedBlock,
    CenterPageSubsection,
    CenterPageTopItem,
} from "@/config/franchise-center-page-nav";
import {
    applyResolvedLinkLookup,
    type ResolvedLinkMeta,
} from "@/lib/franchise-center-page-links";

/** True when the link has a head-office upload in the database. */
export function isCentrePageLinkUploaded(
    link: CenterPageLink,
    lookup?: Map<string, ResolvedLinkMeta>,
): boolean {
    const resolved = lookup ? applyResolvedLinkLookup(link, lookup) : link;
    return typeof resolved.franchiseHubDocId === "number";
}

function filterUploadedLinks(
    links: CenterPageLink[] | undefined,
    lookup?: Map<string, ResolvedLinkMeta>,
): CenterPageLink[] | undefined {
    if (!links?.length) return links;
    const next = links.filter((link) => isCentrePageLinkUploaded(link, lookup));
    return next.length ? next : undefined;
}

function topHasAdminCustomStructure(item: CenterPageTopItem): boolean {
    if (item.adminCustom) return true;
    return item.groups.some((group) => group.adminCustom);
}

/** Franchise dashboard: uploaded files + head-office custom sections/subsections (even before upload). */
export function filterCentrePageTopToUploadedOnly(
    item: CenterPageTopItem,
    lookup?: Map<string, ResolvedLinkMeta>,
): CenterPageTopItem | null {
    const directLinks = filterUploadedLinks(item.directLinks, lookup);
    const groups = item.groups
        .map((group) => filterCentrePageGroupToUploadedOnly(group, lookup))
        .filter((group): group is CenterPageSubsection => group != null);

    const hasDirect = directLinks && directLinks.length > 0;
    const hasGroups = groups.length > 0;
    if (!hasDirect && !hasGroups && !topHasAdminCustomStructure(item)) return null;

    return { ...item, directLinks, groups };
}

function filterCentrePageGroupToUploadedOnly(
    group: CenterPageSubsection,
    lookup?: Map<string, ResolvedLinkMeta>,
): CenterPageSubsection | null {
    const links = filterUploadedLinks(group.links, lookup);
    const nested = group.nested
        ?.map((block) => filterCentrePageNestedToUploadedOnly(block, lookup))
        .filter((block): block is CenterPageNestedBlock => block != null);

    const hasNested = nested && nested.length > 0;
    const hasLinks = links && links.length > 0;

    if (group.adminCustom && !hasNested && !hasLinks) {
        return { ...group, links: undefined, nested: undefined };
    }

    if (!hasNested && !hasLinks) return null;

    return { ...group, links, nested: hasNested ? nested : undefined };
}

function filterCentrePageNestedToUploadedOnly(
    block: CenterPageNestedBlock,
    lookup?: Map<string, ResolvedLinkMeta>,
): CenterPageNestedBlock | null {
    const links = filterUploadedLinks(block.links, lookup);
    if (!links?.length) return null;
    return { ...block, links };
}

export function filterCentrePageBlocksToUploadedOnly(
    blocks: CenterPageTopItem[],
    linkLookupsByTopId?: Map<string, Map<string, ResolvedLinkMeta>>,
): CenterPageTopItem[] {
    return blocks
        .map((item) =>
            filterCentrePageTopToUploadedOnly(item, linkLookupsByTopId?.get(item.id)),
        )
        .filter((item): item is CenterPageTopItem => item != null);
}

/** Franchise LinkRows: keep only checklist rows with a database upload. */
export function filterCentrePageLinksForDashboard(
    links: CenterPageLink[],
    lookup?: Map<string, ResolvedLinkMeta>,
): CenterPageLink[] {
    return links.filter((link) => isCentrePageLinkUploaded(link, lookup));
}

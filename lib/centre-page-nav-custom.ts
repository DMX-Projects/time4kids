import type {
    CenterPageLink,
    CenterPageNestedBlock,
    CenterPageSubsection,
    CenterPageTopItem,
} from "@/config/franchise-center-page-nav";

export const CENTRE_PAGE_NAV_CUSTOM_SLUG = "centre-page-nav-custom";

export type CentrePageCustomLink = {
    id: string;
    label: string;
    adminCategory: string;
    /** Relative path under pc/ or centre-nav/ */
    sourcePath?: string;
    href?: string;
    rowKey?: string;
};

export type CentrePageCustomNested = {
    id: string;
    title: string;
    links: CentrePageCustomLink[];
};

export type CentrePageCustomGroup = {
    id: string;
    title: string;
    links?: CentrePageCustomLink[];
    nested?: CentrePageCustomNested[];
};

export type CentrePageCustomTop = {
    id: string;
    title: string;
    groups: CentrePageCustomGroup[];
    directLinks?: CentrePageCustomLink[];
};

export type CentrePageStaticExtension = {
    staticTopId: string;
    groups: CentrePageCustomGroup[];
    directLinks?: CentrePageCustomLink[];
};

export type CentrePageNavCustomData = {
    customTopSections: CentrePageCustomTop[];
    staticExtensions: CentrePageStaticExtension[];
};

export type CentrePageLinkAnchor = {
    topId: string;
    topTitle: string;
    groupTitle?: string;
    nestedTitle?: string;
};

export function emptyCentrePageNavCustom(): CentrePageNavCustomData {
    return { customTopSections: [], staticExtensions: [] };
}

export function newCustomId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugSegment(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
}

export function buildCustomLinkSourcePath(anchor: CentrePageLinkAnchor, label: string): string {
    const parts = ["centre-nav", slugSegment(anchor.topId)];
    if (anchor.groupTitle) parts.push(slugSegment(anchor.groupTitle));
    if (anchor.nestedTitle) parts.push(slugSegment(anchor.nestedTitle));
    parts.push(slugSegment(label) || "file");
    return parts.join("/");
}

function customLinkToCenterLink(link: CentrePageCustomLink): CenterPageLink {
    const path = link.sourcePath?.trim();
    const href =
        link.href?.trim() ||
        (path ? `http://legacy.local/uploads/pc/${path.replace(/^\/+/, "")}` : "#");
    return {
        label: link.label,
        href,
        adminCategory: link.adminCategory,
        rowKey: link.rowKey ?? `custom-${link.id}`,
    };
}

function customNestedToBlock(nested: CentrePageCustomNested): CenterPageNestedBlock {
    return {
        title: nested.title,
        links: nested.links.map(customLinkToCenterLink),
    };
}

function customGroupToSubsection(group: CentrePageCustomGroup): CenterPageSubsection {
    return {
        title: group.title,
        links: group.links?.length ? group.links.map(customLinkToCenterLink) : undefined,
        nested: group.nested?.length ? group.nested.map(customNestedToBlock) : undefined,
    };
}

function customTopToItem(top: CentrePageCustomTop): CenterPageTopItem {
    return {
        id: top.id,
        title: top.title,
        groups: top.groups.map(customGroupToSubsection),
        directLinks: top.directLinks?.length
            ? top.directLinks.map(customLinkToCenterLink)
            : undefined,
    };
}

function mergeTopWithExtension(
    item: CenterPageTopItem,
    custom: CentrePageNavCustomData,
): CenterPageTopItem {
    const ext = custom.staticExtensions.find((e) => e.staticTopId === item.id);
    if (!ext) return item;
    const extraGroups = ext.groups.map(customGroupToSubsection);
    const extraDirect = ext.directLinks?.map(customLinkToCenterLink) ?? [];
    return {
        ...item,
        groups: [...item.groups, ...extraGroups],
        directLinks: [...(item.directLinks ?? []), ...extraDirect],
    };
}

/** Merge static checklist with admin-added sections (for franchise + admin UI). */
export function mergeCentrePageBlocks(
    blockA: CenterPageTopItem[],
    blockB: CenterPageTopItem[],
    custom: CentrePageNavCustomData | null | undefined,
): CenterPageTopItem[][] {
    const data = custom ?? emptyCentrePageNavCustom();
    const mergedA = blockA.map((item) => mergeTopWithExtension(item, data));
    const mergedB = blockB.map((item) => mergeTopWithExtension(item, data));
    const customTops = data.customTopSections.map(customTopToItem);
    return [mergedA, [...mergedB, ...customTops]];
}

export function isCustomTopSection(
    custom: CentrePageNavCustomData,
    topId: string,
): boolean {
    return custom.customTopSections.some((t) => t.id === topId);
}

export function addCustomTopSection(
    data: CentrePageNavCustomData,
    title: string,
): CentrePageNavCustomData {
    const top: CentrePageCustomTop = {
        id: newCustomId("top"),
        title: title.trim(),
        groups: [],
    };
    return {
        ...data,
        customTopSections: [...data.customTopSections, top],
    };
}

export function addCustomGroup(
    data: CentrePageNavCustomData,
    anchor: CentrePageLinkAnchor,
    title: string,
): CentrePageNavCustomData {
    const group: CentrePageCustomGroup = {
        id: newCustomId("grp"),
        title: title.trim(),
        links: [],
    };
    if (isCustomTopSection(data, anchor.topId)) {
        return {
            ...data,
            customTopSections: data.customTopSections.map((t) =>
                t.id === anchor.topId ? { ...t, groups: [...t.groups, group] } : t,
            ),
        };
    }
    const extIdx = data.staticExtensions.findIndex((e) => e.staticTopId === anchor.topId);
    if (extIdx >= 0) {
        const next = [...data.staticExtensions];
        const ext = { ...next[extIdx] };
        ext.groups = [...ext.groups, group];
        next[extIdx] = ext;
        return { ...data, staticExtensions: next };
    }
    return {
        ...data,
        staticExtensions: [
            ...data.staticExtensions,
            { staticTopId: anchor.topId, groups: [group] },
        ],
    };
}

export function addCustomNested(
    data: CentrePageNavCustomData,
    anchor: CentrePageLinkAnchor & { groupTitle: string },
    title: string,
): CentrePageNavCustomData {
    const nested: CentrePageCustomNested = {
        id: newCustomId("nest"),
        title: title.trim(),
        links: [],
    };
    const patchGroup = (g: CentrePageCustomGroup): CentrePageCustomGroup => {
        if (g.title !== anchor.groupTitle) return g;
        return { ...g, nested: [...(g.nested ?? []), nested] };
    };
    if (isCustomTopSection(data, anchor.topId)) {
        return {
            ...data,
            customTopSections: data.customTopSections.map((t) =>
                t.id === anchor.topId
                    ? { ...t, groups: t.groups.map(patchGroup) }
                    : t,
            ),
        };
    }
    const extIdx = data.staticExtensions.findIndex((e) => e.staticTopId === anchor.topId);
    if (extIdx >= 0) {
        const next = [...data.staticExtensions];
        const ext = { ...next[extIdx] };
        ext.groups = ext.groups.map(patchGroup);
        next[extIdx] = ext;
        return { ...data, staticExtensions: next };
    }
    const group: CentrePageCustomGroup = {
        id: newCustomId("grp"),
        title: anchor.groupTitle,
        nested: [nested],
    };
    return {
        ...data,
        staticExtensions: [
            ...data.staticExtensions,
            { staticTopId: anchor.topId, groups: [group] },
        ],
    };
}

export function addCustomLink(
    data: CentrePageNavCustomData,
    anchor: CentrePageLinkAnchor,
    label: string,
    adminCategory: string,
): { data: CentrePageNavCustomData; link: CentrePageCustomLink } {
    const link: CentrePageCustomLink = {
        id: newCustomId("lnk"),
        label: label.trim(),
        adminCategory,
        sourcePath: buildCustomLinkSourcePath(anchor, label),
        rowKey: `custom-${newCustomId("row")}`,
    };

    const appendToGroup = (g: CentrePageCustomGroup): CentrePageCustomGroup => {
        if (anchor.groupTitle && g.title !== anchor.groupTitle) return g;
        if (anchor.nestedTitle) {
            return {
                ...g,
                nested: (g.nested ?? []).map((n) =>
                    n.title === anchor.nestedTitle
                        ? { ...n, links: [...n.links, link] }
                        : n,
                ),
            };
        }
        return { ...g, links: [...(g.links ?? []), link] };
    };

    if (isCustomTopSection(data, anchor.topId)) {
        const customTopSections = data.customTopSections.map((t) => {
            if (t.id !== anchor.topId) return t;
            if (!anchor.groupTitle) {
                return { ...t, directLinks: [...(t.directLinks ?? []), link] };
            }
            return { ...t, groups: t.groups.map(appendToGroup) };
        });
        return { data: { ...data, customTopSections }, link };
    }

    const extIdx = data.staticExtensions.findIndex((e) => e.staticTopId === anchor.topId);
    if (extIdx >= 0) {
        const next = [...data.staticExtensions];
        const ext = { ...next[extIdx] };
        if (!anchor.groupTitle) {
            ext.directLinks = [...(ext.directLinks ?? []), link];
        } else {
            ext.groups = ext.groups.map(appendToGroup);
        }
        next[extIdx] = ext;
        return { data: { ...data, staticExtensions: next }, link };
    }

    if (!anchor.groupTitle) {
        return {
            data: {
                ...data,
                staticExtensions: [
                    ...data.staticExtensions,
                    { staticTopId: anchor.topId, groups: [], directLinks: [link] },
                ],
            },
            link,
        };
    }

    const group: CentrePageCustomGroup = {
        id: newCustomId("grp"),
        title: anchor.groupTitle,
        nested: anchor.nestedTitle
            ? [{ id: newCustomId("nest"), title: anchor.nestedTitle, links: [link] }]
            : undefined,
        links: anchor.nestedTitle ? undefined : [link],
    };
    return {
        data: {
            ...data,
            staticExtensions: [
                ...data.staticExtensions,
                { staticTopId: anchor.topId, groups: [group] },
            ],
        },
        link,
    };
}

export function removeCustomTopSection(
    data: CentrePageNavCustomData,
    topId: string,
): CentrePageNavCustomData {
    return {
        ...data,
        customTopSections: data.customTopSections.filter((t) => t.id !== topId),
    };
}

export function isCustomLinkRow(rowKey?: string): boolean {
    return Boolean(rowKey?.startsWith("custom-"));
}

export function linkIdFromCustomRowKey(rowKey?: string): string | null {
    if (!rowKey?.startsWith("custom-")) return null;
    const id = rowKey.slice("custom-".length);
    return id.startsWith("lnk-") ? id : null;
}

export function isCustomGroup(
    data: CentrePageNavCustomData,
    anchor: CentrePageLinkAnchor & { groupTitle: string },
): boolean {
    if (isCustomTopSection(data, anchor.topId)) {
        const top = data.customTopSections.find((t) => t.id === anchor.topId);
        return top?.groups.some((g) => g.title === anchor.groupTitle) ?? false;
    }
    const ext = data.staticExtensions.find((e) => e.staticTopId === anchor.topId);
    return ext?.groups.some((g) => g.title === anchor.groupTitle) ?? false;
}

export function isCustomNested(
    data: CentrePageNavCustomData,
    anchor: CentrePageLinkAnchor & { groupTitle: string; nestedTitle: string },
): boolean {
    const groupIn = (g: CentrePageCustomGroup) =>
        g.title === anchor.groupTitle &&
        (g.nested?.some((n) => n.title === anchor.nestedTitle) ?? false);

    if (isCustomTopSection(data, anchor.topId)) {
        const top = data.customTopSections.find((t) => t.id === anchor.topId);
        return top?.groups.some(groupIn) ?? false;
    }
    const ext = data.staticExtensions.find((e) => e.staticTopId === anchor.topId);
    return ext?.groups.some(groupIn) ?? false;
}

function stripLinkById(links: CentrePageCustomLink[], linkId: string): CentrePageCustomLink[] {
    return links.filter((l) => l.id !== linkId);
}

export function removeCustomLink(
    data: CentrePageNavCustomData,
    anchor: CentrePageLinkAnchor,
    rowKey: string,
): CentrePageNavCustomData {
    const linkId = linkIdFromCustomRowKey(rowKey);
    if (!linkId) return data;

    const patchGroup = (g: CentrePageCustomGroup): CentrePageCustomGroup => {
        if (anchor.groupTitle && g.title !== anchor.groupTitle) return g;
        if (anchor.nestedTitle) {
            return {
                ...g,
                nested: (g.nested ?? []).map((n) =>
                    n.title === anchor.nestedTitle
                        ? { ...n, links: stripLinkById(n.links, linkId) }
                        : n,
                ),
            };
        }
        return { ...g, links: stripLinkById(g.links ?? [], linkId) };
    };

    if (isCustomTopSection(data, anchor.topId)) {
        return {
            ...data,
            customTopSections: data.customTopSections.map((t) => {
                if (t.id !== anchor.topId) return t;
                if (!anchor.groupTitle) {
                    return { ...t, directLinks: stripLinkById(t.directLinks ?? [], linkId) };
                }
                return { ...t, groups: t.groups.map(patchGroup) };
            }),
        };
    }

    return {
        ...data,
        staticExtensions: data.staticExtensions.map((ext) => {
            if (ext.staticTopId !== anchor.topId) return ext;
            if (!anchor.groupTitle) {
                return { ...ext, directLinks: stripLinkById(ext.directLinks ?? [], linkId) };
            }
            return { ...ext, groups: ext.groups.map(patchGroup) };
        }),
    };
}

export function removeCustomNested(
    data: CentrePageNavCustomData,
    anchor: CentrePageLinkAnchor & { groupTitle: string; nestedTitle: string },
): CentrePageNavCustomData {
    const patchGroup = (g: CentrePageCustomGroup): CentrePageCustomGroup => {
        if (g.title !== anchor.groupTitle) return g;
        return {
            ...g,
            nested: (g.nested ?? []).filter((n) => n.title !== anchor.nestedTitle),
        };
    };

    if (isCustomTopSection(data, anchor.topId)) {
        return {
            ...data,
            customTopSections: data.customTopSections.map((t) =>
                t.id === anchor.topId ? { ...t, groups: t.groups.map(patchGroup) } : t,
            ),
        };
    }

    return {
        ...data,
        staticExtensions: data.staticExtensions.map((ext) =>
            ext.staticTopId === anchor.topId ? { ...ext, groups: ext.groups.map(patchGroup) } : ext,
        ),
    };
}

export function removeCustomGroup(
    data: CentrePageNavCustomData,
    anchor: CentrePageLinkAnchor & { groupTitle: string },
): CentrePageNavCustomData {
    if (isCustomTopSection(data, anchor.topId)) {
        return {
            ...data,
            customTopSections: data.customTopSections.map((t) =>
                t.id === anchor.topId
                    ? { ...t, groups: t.groups.filter((g) => g.title !== anchor.groupTitle) }
                    : t,
            ),
        };
    }

    return {
        ...data,
        staticExtensions: data.staticExtensions.map((ext) =>
            ext.staticTopId === anchor.topId
                ? { ...ext, groups: ext.groups.filter((g) => g.title !== anchor.groupTitle) }
                : ext,
        ),
    };
}

export function rowKeyForUploadedDoc(docId: number): string {
    return `doc:${docId}`;
}

export function rowKeyForChecklistLink(link: CenterPageLink): string {
    return link.rowKey ?? `link:${link.label}:${link.href}`;
}

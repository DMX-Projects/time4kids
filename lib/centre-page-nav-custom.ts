import type {
    CenterPageLink,
    CenterPageNestedBlock,
    CenterPageSubsection,
    CenterPageTopItem,
} from "@/config/franchise-center-page-nav";
import { extractLegacyPcRelativePath } from "@/lib/franchise-center-page-links";

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
    /** Admin-added subsection (shows Remove). Link-only buckets omit this. */
    removable?: boolean;
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

export type CentrePageLinkAnchor = {
    topId: string;
    topTitle: string;
    groupTitle?: string;
    nestedTitle?: string;
};

export type CentrePageStaticGroupLinkAppend = {
    staticTopId: string;
    groupTitle: string;
    links: CentrePageCustomLink[];
};

export type CentrePageNavCustomData = {
    customTopSections: CentrePageCustomTop[];
    staticExtensions: CentrePageStaticExtension[];
    /** Extra links added under an existing static subsection (same name, one merged block). */
    staticGroupLinkAppends?: CentrePageStaticGroupLinkAppend[];
    /** Display-name overrides for static nav items (keys from labelKey helpers). */
    labelOverrides?: Record<string, string>;
    /** Built-in centre-page top sections removed in admin CMS. */
    hiddenStaticTopIds?: string[];
    /** Built-in subsections removed in admin CMS (`topId::groupTitle`). */
    hiddenStaticGroupKeys?: string[];
    /** Built-in nested blocks removed in admin CMS (`topId::groupTitle::nestedTitle`). */
    hiddenStaticNestedKeys?: string[];
    /** Checklist link rowKeys removed in admin CMS (static or custom). */
    hiddenLinkRowKeys?: string[];
};

export type CentrePageRenameTarget =
    | { kind: "top"; topId: string; currentTitle: string }
    | { kind: "group"; topId: string; groupTitle: string; currentTitle: string }
    | { kind: "nested"; topId: string; groupTitle: string; nestedTitle: string; currentTitle: string }
    | {
          kind: "link";
          anchor: CentrePageLinkAnchor;
          rowKey: string;
          linkId?: string | null;
          currentTitle: string;
      };

export function topLabelKey(topId: string): string {
    return `top:${topId}`;
}

export function groupLabelKey(topId: string, groupTitle: string): string {
    return `group:${topId}::${groupTitle}`;
}

export function nestedLabelKey(topId: string, groupTitle: string, nestedTitle: string): string {
    return `nested:${topId}::${groupTitle}::${nestedTitle}`;
}

export function linkLabelKey(rowKey: string): string {
    return `link:${rowKey}`;
}

export function emptyCentrePageNavCustom(): CentrePageNavCustomData {
    return {
        customTopSections: [],
        staticExtensions: [],
        staticGroupLinkAppends: [],
        labelOverrides: {},
        hiddenStaticTopIds: [],
        hiddenStaticGroupKeys: [],
        hiddenStaticNestedKeys: [],
        hiddenLinkRowKeys: [],
    };
}

export function staticGroupHideKey(topId: string, groupTitle: string): string {
    return `${topId}::${groupTitle}`;
}

export function staticNestedHideKey(topId: string, groupTitle: string, nestedTitle: string): string {
    return `${topId}::${groupTitle}::${nestedTitle}`;
}

/** Parse page-content JSON from the CMS API (admin + franchise dashboard). */
export function parseCentrePageNavCustom(raw: unknown): CentrePageNavCustomData {
    if (!raw || typeof raw !== "object") return emptyCentrePageNavCustom();
    const o = raw as Record<string, unknown>;
    return {
        customTopSections: Array.isArray(o.customTopSections)
            ? (o.customTopSections as CentrePageNavCustomData["customTopSections"])
            : [],
        staticExtensions: Array.isArray(o.staticExtensions)
            ? (o.staticExtensions as CentrePageNavCustomData["staticExtensions"])
            : [],
        labelOverrides:
            o.labelOverrides && typeof o.labelOverrides === "object"
                ? (o.labelOverrides as Record<string, string>)
                : {},
        staticGroupLinkAppends: Array.isArray(o.staticGroupLinkAppends)
            ? (o.staticGroupLinkAppends as CentrePageNavCustomData["staticGroupLinkAppends"])
            : [],
        hiddenStaticTopIds: Array.isArray(o.hiddenStaticTopIds)
            ? (o.hiddenStaticTopIds as string[]).filter((id) => typeof id === "string")
            : [],
        hiddenStaticGroupKeys: Array.isArray(o.hiddenStaticGroupKeys)
            ? (o.hiddenStaticGroupKeys as string[]).filter((id) => typeof id === "string")
            : [],
        hiddenStaticNestedKeys: Array.isArray(o.hiddenStaticNestedKeys)
            ? (o.hiddenStaticNestedKeys as string[]).filter((id) => typeof id === "string")
            : [],
        hiddenLinkRowKeys: Array.isArray(o.hiddenLinkRowKeys)
            ? (o.hiddenLinkRowKeys as string[]).filter((id) => typeof id === "string")
            : [],
    };
}

function hiddenStaticTopSet(data: CentrePageNavCustomData): Set<string> {
    return new Set(data.hiddenStaticTopIds ?? []);
}

function hiddenLinkRowSet(data: CentrePageNavCustomData): Set<string> {
    return new Set(data.hiddenLinkRowKeys ?? []);
}

function hiddenStaticGroupSet(data: CentrePageNavCustomData): Set<string> {
    return new Set(data.hiddenStaticGroupKeys ?? []);
}

function hiddenStaticNestedSet(data: CentrePageNavCustomData): Set<string> {
    return new Set(data.hiddenStaticNestedKeys ?? []);
}

function filterLinksByHidden(
    links: CenterPageLink[] | undefined,
    hidden: Set<string>,
): CenterPageLink[] | undefined {
    if (!links?.length) return links;
    const next = links.filter((link) => !hidden.has((link.rowKey ?? rowKeyForChecklistLink(link)).trim()));
    return next.length ? next : undefined;
}

/** Remove individually deleted link rows; keep all sections/subsections (even when empty). */
export function applyCentrePageHiddenLinks(item: CenterPageTopItem, hidden: Set<string>): CenterPageTopItem {
    if (!hidden.size) return item;

    const directLinks = filterLinksByHidden(item.directLinks, hidden);
    const groups = item.groups.map((group) => ({
        ...group,
        links: filterLinksByHidden(group.links, hidden),
        nested: group.nested?.map((block) => ({
            ...block,
            links: filterLinksByHidden(block.links, hidden) ?? [],
        })),
    }));

    return { ...item, directLinks, groups };
}

/** Remove only subsections/nested blocks explicitly deleted in admin — never drop empty rows. */
export function applyCentrePageHiddenGroupsAndNested(
    item: CenterPageTopItem,
    hiddenGroups: Set<string>,
    hiddenNested: Set<string>,
): CenterPageTopItem {
    if (!hiddenGroups.size && !hiddenNested.size) return item;

    const groups: CenterPageSubsection[] = [];
    for (const group of item.groups) {
        if (hiddenGroups.has(staticGroupHideKey(item.id, group.title))) continue;

        const nested = group.nested?.filter(
            (block) => !hiddenNested.has(staticNestedHideKey(item.id, group.title, block.title)),
        );

        groups.push({
            ...group,
            nested: nested?.length ? nested : undefined,
        });
    }

    return { ...item, groups };
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
        sourcePath: link.sourcePath,
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
        adminCustom: true,
    };
}

function customTopToItem(top: CentrePageCustomTop): CenterPageTopItem {
    return {
        id: top.id,
        title: top.title,
        adminCustom: true,
        groups: top.groups.map(customGroupToSubsection),
        directLinks: top.directLinks?.length
            ? top.directLinks.map(customLinkToCenterLink)
            : undefined,
    };
}

function applyLinkLabelOverride(link: CenterPageLink, overrides: Record<string, string>): CenterPageLink {
    const rowKey = link.rowKey ?? rowKeyForChecklistLink(link);
    const key = linkLabelKey(rowKey);
    const label = overrides[key]?.trim() || link.label;
    return label === link.label ? link : { ...link, label };
}

function applyLabelOverridesToTop(
    item: CenterPageTopItem,
    overrides: Record<string, string>,
): CenterPageTopItem {
    if (!Object.keys(overrides).length) return item;

    const title = overrides[topLabelKey(item.id)]?.trim() || item.title;

    const groups = item.groups.map((group) => {
        const origGroupTitle = group.title;
        const groupTitle = overrides[groupLabelKey(item.id, origGroupTitle)]?.trim() || origGroupTitle;
        return {
            ...group,
            title: groupTitle,
            nested: group.nested?.map((nested) => {
                const origNestedTitle = nested.title;
                const nestedTitle =
                    overrides[nestedLabelKey(item.id, origGroupTitle, origNestedTitle)]?.trim() ||
                    origNestedTitle;
                return {
                    ...nested,
                    title: nestedTitle,
                    links: nested.links.map((link) => applyLinkLabelOverride(link, overrides)),
                };
            }),
            links: group.links?.map((link) => applyLinkLabelOverride(link, overrides)),
        };
    });

    return {
        ...item,
        title,
        groups,
        directLinks: item.directLinks?.map((link) => applyLinkLabelOverride(link, overrides)),
    };
}

function coalesceGroupsByTitle(groups: CenterPageSubsection[]): CenterPageSubsection[] {
    const out: CenterPageSubsection[] = [];
    for (const group of groups) {
        const idx = out.findIndex((g) => g.title === group.title);
        if (idx < 0) {
            out.push({ ...group });
            continue;
        }
        const prev = out[idx];
        out[idx] = {
            ...prev,
            links: [...(prev.links ?? []), ...(group.links ?? [])],
            nested: [...(prev.nested ?? []), ...(group.nested ?? [])],
            adminCustom: prev.adminCustom || group.adminCustom,
        };
    }
    return out;
}

export function mergeTopWithExtension(
    item: CenterPageTopItem,
    custom: CentrePageNavCustomData,
): CenterPageTopItem {
    const ext = custom.staticExtensions.find((e) => e.staticTopId === item.id);
    let groups = item.groups;
    let directLinks = item.directLinks;

    if (ext) {
        const extraGroups = ext.groups.map(customGroupToSubsection);
        const extraDirect = ext.directLinks?.map(customLinkToCenterLink) ?? [];
        groups = coalesceGroupsByTitle([...item.groups, ...extraGroups]);
        directLinks = [...(item.directLinks ?? []), ...extraDirect];
    }

    const appends =
        custom.staticGroupLinkAppends?.filter((a) => a.staticTopId === item.id) ?? [];
    if (appends.length) {
        groups = groups.map((group) => {
            const append = appends.find((a) => a.groupTitle === group.title);
            if (!append?.links.length) return group;
            return {
                ...group,
                links: [
                    ...(group.links ?? []),
                    ...append.links.map(customLinkToCenterLink),
                ],
            };
        });
    }

    if (!ext && !appends.length) return item;
    return { ...item, groups, directLinks };
}

function slugForRowKey(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
}

function autoRowKey(
    topId: string,
    groupTitle: string | undefined,
    nestedTitle: string | undefined,
    link: CenterPageLink,
    index: number,
): string {
    if (link.rowKey?.trim()) return link.rowKey.trim();
    const legacy = extractLegacyPcRelativePath(link.href);
    const hrefPart = legacy
        ? slugForRowKey(legacy.split("/").filter(Boolean).pop() || legacy)
        : slugForRowKey(link.href || link.label);
    const parts = [topId];
    if (groupTitle) parts.push(slugForRowKey(groupTitle));
    if (nestedTitle) parts.push(slugForRowKey(nestedTitle));
    parts.push(String(index), hrefPart || "link");
    return parts.filter(Boolean).join("--");
}

function withStableRowKey(
    link: CenterPageLink,
    topId: string,
    groupTitle: string | undefined,
    nestedTitle: string | undefined,
    index: number,
): CenterPageLink {
    if (link.rowKey?.trim()) return link;
    return { ...link, rowKey: autoRowKey(topId, groupTitle, nestedTitle, link, index) };
}

/** Ensure every checklist link has a unique stable rowKey (for uploads + matching). */
export function assignStableRowKeysToTopItem(item: CenterPageTopItem): CenterPageTopItem {
    let directIdx = 0;
    const directLinks = item.directLinks?.map((link) =>
        withStableRowKey(link, item.id, undefined, undefined, directIdx++),
    );
    const groups = item.groups.map((group) => {
        let linkIdx = 0;
        const links = group.links?.map((link) =>
            withStableRowKey(link, item.id, group.title, undefined, linkIdx++),
        );
        const nested = group.nested?.map((block) => {
            let nestedIdx = 0;
            const blockLinks = block.links.map((link) =>
                withStableRowKey(link, item.id, group.title, block.title, nestedIdx++),
            );
            return { ...block, links: blockLinks };
        });
        return { ...group, links, nested };
    });
    return { ...item, directLinks, groups };
}

/** Merge static checklist with admin-added sections (for franchise + admin UI). */
export function mergeCentrePageBlocks(
    blockA: CenterPageTopItem[],
    blockB: CenterPageTopItem[],
    custom: CentrePageNavCustomData | null | undefined,
): CenterPageTopItem[][] {
    const data = custom ?? emptyCentrePageNavCustom();
    const overrides = data.labelOverrides ?? {};

    const finalizeTop = (item: CenterPageTopItem) =>
        applyLabelOverridesToTop(assignStableRowKeysToTopItem(mergeTopWithExtension(item, data)), overrides);

    const hiddenTops = hiddenStaticTopSet(data);
    const hiddenLinks = hiddenLinkRowSet(data);
    const hiddenGroups = hiddenStaticGroupSet(data);
    const hiddenNested = hiddenStaticNestedSet(data);

    const visibleTop = (item: CenterPageTopItem) => {
        if (hiddenTops.has(item.id)) return null;
        const withoutDeletedLinks = applyCentrePageHiddenLinks(item, hiddenLinks);
        return applyCentrePageHiddenGroupsAndNested(withoutDeletedLinks, hiddenGroups, hiddenNested);
    };

    const mergedA = blockA.map(finalizeTop).map(visibleTop).filter((item): item is CenterPageTopItem => item != null);
    const mergedB = blockB
        .map(finalizeTop)
        .map(visibleTop)
        .filter((item): item is CenterPageTopItem => item != null);
    const customTops = data.customTopSections
        .map(customTopToItem)
        .map(finalizeTop)
        .map(visibleTop)
        .filter((item): item is CenterPageTopItem => item != null);
    return [[...customTops, ...mergedA, ...mergedB]];
}

export function hideCentrePageStaticTop(
    data: CentrePageNavCustomData,
    topId: string,
): CentrePageNavCustomData {
    const ids = new Set(data.hiddenStaticTopIds ?? []);
    ids.add(topId);
    return { ...data, hiddenStaticTopIds: Array.from(ids) };
}

export function hideCentrePageLinkRow(
    data: CentrePageNavCustomData,
    rowKey: string,
): CentrePageNavCustomData {
    const key = rowKey.trim();
    if (!key) return data;
    const ids = new Set(data.hiddenLinkRowKeys ?? []);
    ids.add(key);
    return { ...data, hiddenLinkRowKeys: Array.from(ids) };
}

export function hideCentrePageStaticGroup(
    data: CentrePageNavCustomData,
    topId: string,
    groupTitle: string,
): CentrePageNavCustomData {
    const key = staticGroupHideKey(topId, groupTitle);
    const ids = new Set(data.hiddenStaticGroupKeys ?? []);
    ids.add(key);
    return { ...data, hiddenStaticGroupKeys: Array.from(ids) };
}

export function hideCentrePageStaticNested(
    data: CentrePageNavCustomData,
    topId: string,
    groupTitle: string,
    nestedTitle: string,
): CentrePageNavCustomData {
    const key = staticNestedHideKey(topId, groupTitle, nestedTitle);
    const ids = new Set(data.hiddenStaticNestedKeys ?? []);
    ids.add(key);
    return { ...data, hiddenStaticNestedKeys: Array.from(ids) };
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
        customTopSections: [top, ...data.customTopSections],
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
        removable: true,
    };
    if (isCustomTopSection(data, anchor.topId)) {
        return {
            ...data,
            customTopSections: data.customTopSections.map((t) =>
                t.id === anchor.topId ? { ...t, groups: [group, ...t.groups] } : t,
            ),
        };
    }
    const extIdx = data.staticExtensions.findIndex((e) => e.staticTopId === anchor.topId);
    if (extIdx >= 0) {
        const next = [...data.staticExtensions];
        const ext = { ...next[extIdx] };
        ext.groups = [group, ...ext.groups];
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
        return { ...g, nested: [nested, ...(g.nested ?? [])] };
    };
    if (isCustomTopSection(data, anchor.topId)) {
        return {
            ...data,
            customTopSections: data.customTopSections.map((t) => {
                if (t.id !== anchor.topId) return t;
                const hasGroup = t.groups.some((g) => g.title === anchor.groupTitle);
                if (!hasGroup) {
                    return {
                        ...t,
                        groups: [
                            {
                                id: newCustomId("grp"),
                                title: anchor.groupTitle,
                                nested: [nested],
                                removable: true,
                            },
                            ...t.groups,
                        ],
                    };
                }
                return { ...t, groups: t.groups.map(patchGroup) };
            }),
        };
    }
    const extIdx = data.staticExtensions.findIndex((e) => e.staticTopId === anchor.topId);
    if (extIdx >= 0) {
        const next = [...data.staticExtensions];
        const ext = { ...next[extIdx] };
        const hasGroup = ext.groups.some((g) => g.title === anchor.groupTitle);
        ext.groups = hasGroup
            ? ext.groups.map(patchGroup)
            : [
                  {
                      id: newCustomId("grp"),
                      title: anchor.groupTitle,
                      nested: [nested],
                      removable: true,
                  },
                  ...ext.groups,
              ];
        next[extIdx] = ext;
        return { ...data, staticExtensions: next };
    }
    const group: CentrePageCustomGroup = {
        id: newCustomId("grp"),
        title: anchor.groupTitle,
        nested: [nested],
        removable: true,
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

    const prependLinkToStaticSubsection = (): CentrePageNavCustomData => {
        const appends = [...(data.staticGroupLinkAppends ?? [])];
        const idx = appends.findIndex(
            (a) => a.staticTopId === anchor.topId && a.groupTitle === anchor.groupTitle,
        );
        if (idx >= 0) {
            appends[idx] = { ...appends[idx], links: [link, ...appends[idx].links] };
        } else {
            appends.push({
                staticTopId: anchor.topId,
                groupTitle: anchor.groupTitle!,
                links: [link],
            });
        }
        return { ...data, staticGroupLinkAppends: appends };
    };

    const prependLinkToGroup = (g: CentrePageCustomGroup): CentrePageCustomGroup => {
        if (anchor.groupTitle && g.title !== anchor.groupTitle) return g;
        if (anchor.nestedTitle) {
            return {
                ...g,
                nested: (g.nested ?? []).map((n) =>
                    n.title === anchor.nestedTitle
                        ? { ...n, links: [link, ...n.links] }
                        : n,
                ),
            };
        }
        return { ...g, links: [link, ...(g.links ?? [])] };
    };

    const prependToExtensionGroups = (ext: CentrePageStaticExtension): boolean => {
        if (!anchor.groupTitle || anchor.nestedTitle) return false;
        const hasGroup = ext.groups.some((g) => g.title === anchor.groupTitle);
        if (!hasGroup) return false;
        return true;
    };

    if (isCustomTopSection(data, anchor.topId)) {
        const customTopSections = data.customTopSections.map((t) => {
            if (t.id !== anchor.topId) return t;
            if (!anchor.groupTitle) {
                return { ...t, directLinks: [link, ...(t.directLinks ?? [])] };
            }
            return { ...t, groups: t.groups.map(prependLinkToGroup) };
        });
        return { data: { ...data, customTopSections }, link };
    }

    const extIdx = data.staticExtensions.findIndex((e) => e.staticTopId === anchor.topId);
    if (extIdx >= 0) {
        const ext = data.staticExtensions[extIdx];
        if (anchor.groupTitle && !anchor.nestedTitle && prependToExtensionGroups(ext)) {
            const next = [...data.staticExtensions];
            next[extIdx] = { ...ext, groups: ext.groups.map(prependLinkToGroup) };
            return { data: { ...data, staticExtensions: next }, link };
        }
        if (anchor.groupTitle && !anchor.nestedTitle) {
            return { data: prependLinkToStaticSubsection(), link };
        }
        const next = [...data.staticExtensions];
        const patched = { ...ext };
        if (!anchor.groupTitle) {
            patched.directLinks = [link, ...(patched.directLinks ?? [])];
        } else {
            patched.groups = patched.groups.map(prependLinkToGroup);
        }
        next[extIdx] = patched;
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

    if (anchor.nestedTitle) {
        const group: CentrePageCustomGroup = {
            id: newCustomId("grp"),
            title: anchor.groupTitle,
            nested: [{ id: newCustomId("nest"), title: anchor.nestedTitle, links: [link] }],
            removable: true,
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

    return { data: prependLinkToStaticSubsection(), link };
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
    return ext?.groups.some((g) => g.title === anchor.groupTitle && g.removable) ?? false;
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

    let nextData: CentrePageNavCustomData = {
        ...data,
        staticExtensions: data.staticExtensions.map((ext) => {
            if (ext.staticTopId !== anchor.topId) return ext;
            if (!anchor.groupTitle) {
                return { ...ext, directLinks: stripLinkById(ext.directLinks ?? [], linkId) };
            }
            return { ...ext, groups: ext.groups.map(patchGroup) };
        }),
    };

    if (anchor.groupTitle) {
        const appends = (nextData.staticGroupLinkAppends ?? [])
            .map((a) => {
                if (a.staticTopId !== anchor.topId || a.groupTitle !== anchor.groupTitle) return a;
                return { ...a, links: stripLinkById(a.links, linkId) };
            })
            .filter((a) => a.links.length > 0);
        nextData = { ...nextData, staticGroupLinkAppends: appends };
    }

    return nextData;
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
    if (link.rowKey) return link.rowKey;
    const href = link.href?.trim() || "";
    return href ? `href:${href}` : `link:${link.label}`;
}

/** Unique storage path for a checklist row (used as FranchiseDocument.source_path). */
export function checklistSourcePathForLink(link: CenterPageLink): string {
    const rowKey = (link.rowKey?.trim() || rowKeyForChecklistLink(link)).replace(/:/g, "/");
    return `checklist-row/${rowKey}`;
}

/** Path stored on uploaded documents — custom links keep centre-nav/…; checklist rows use checklist-row/…. */
export function uploadSourcePathForLink(link: CenterPageLink): string {
    const explicit = link.sourcePath?.trim();
    if (explicit) return explicit;
    return checklistSourcePathForLink(link);
}

function patchCustomLinkLabel(
    data: CentrePageNavCustomData,
    linkId: string,
    newLabel: string,
): CentrePageNavCustomData {
    const label = newLabel.trim();
    const patchLinks = (links: CentrePageCustomLink[]) =>
        links.map((l) => (l.id === linkId ? { ...l, label } : l));

    const patchGroup = (g: CentrePageCustomGroup): CentrePageCustomGroup => ({
        ...g,
        links: g.links ? patchLinks(g.links) : g.links,
        nested: g.nested?.map((n) => ({ ...n, links: patchLinks(n.links) })),
    });

    return {
        ...data,
        customTopSections: data.customTopSections.map((t) => ({
            ...t,
            directLinks: t.directLinks ? patchLinks(t.directLinks) : t.directLinks,
            groups: t.groups.map(patchGroup),
        })),
        staticExtensions: data.staticExtensions.map((ext) => ({
            ...ext,
            directLinks: ext.directLinks ? patchLinks(ext.directLinks) : ext.directLinks,
            groups: ext.groups.map(patchGroup),
        })),
    };
}

/** Rename a section, subsection, nested block, or link label (custom nav or static override). */
export function renameNavLabel(
    data: CentrePageNavCustomData,
    target: CentrePageRenameTarget,
    newTitle: string,
): CentrePageNavCustomData {
    const title = newTitle.trim();
    if (!title) return data;

    const overrides = { ...(data.labelOverrides ?? {}) };

    if (target.kind === "top") {
        if (isCustomTopSection(data, target.topId)) {
            return {
                ...data,
                customTopSections: data.customTopSections.map((t) =>
                    t.id === target.topId ? { ...t, title } : t,
                ),
            };
        }
        overrides[topLabelKey(target.topId)] = title;
        return { ...data, labelOverrides: overrides };
    }

    if (target.kind === "group") {
        if (
            isCustomGroup(data, {
                topId: target.topId,
                topTitle: "",
                groupTitle: target.groupTitle,
            })
        ) {
            const patch = (g: CentrePageCustomGroup) =>
                g.title === target.groupTitle ? { ...g, title } : g;
            if (isCustomTopSection(data, target.topId)) {
                return {
                    ...data,
                    customTopSections: data.customTopSections.map((t) =>
                        t.id === target.topId ? { ...t, groups: t.groups.map(patch) } : t,
                    ),
                };
            }
            return {
                ...data,
                staticExtensions: data.staticExtensions.map((ext) =>
                    ext.staticTopId === target.topId ? { ...ext, groups: ext.groups.map(patch) } : ext,
                ),
            };
        }
        overrides[groupLabelKey(target.topId, target.groupTitle)] = title;
        return { ...data, labelOverrides: overrides };
    }

    if (target.kind === "nested") {
        if (
            isCustomNested(data, {
                topId: target.topId,
                topTitle: "",
                groupTitle: target.groupTitle,
                nestedTitle: target.nestedTitle,
            })
        ) {
            const patchGroup = (g: CentrePageCustomGroup): CentrePageCustomGroup => {
                if (g.title !== target.groupTitle) return g;
                return {
                    ...g,
                    nested: (g.nested ?? []).map((n) =>
                        n.title === target.nestedTitle ? { ...n, title } : n,
                    ),
                };
            };
            if (isCustomTopSection(data, target.topId)) {
                return {
                    ...data,
                    customTopSections: data.customTopSections.map((t) =>
                        t.id === target.topId ? { ...t, groups: t.groups.map(patchGroup) } : t,
                    ),
                };
            }
            return {
                ...data,
                staticExtensions: data.staticExtensions.map((ext) =>
                    ext.staticTopId === target.topId ? { ...ext, groups: ext.groups.map(patchGroup) } : ext,
                ),
            };
        }
        overrides[nestedLabelKey(target.topId, target.groupTitle, target.nestedTitle)] = title;
        return { ...data, labelOverrides: overrides };
    }

    if (target.linkId) {
        return patchCustomLinkLabel(data, target.linkId, title);
    }

    overrides[linkLabelKey(target.rowKey)] = title;
    return { ...data, labelOverrides: overrides };
}

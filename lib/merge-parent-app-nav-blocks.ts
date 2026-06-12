import type { CenterPageLink, CenterPageTopItem } from "@/config/franchise-center-page-nav";
import {
    applyCentrePageHiddenGroupsAndNested,
    applyCentrePageHiddenLinks,
    assignStableRowKeysToTopItem,
    mergeTopWithExtension,
    type CentrePageNavCustomData,
} from "@/lib/centre-page-nav-custom";
import {
    emptyParentAppNavCustom,
    mergeParentAppChecklist,
    type ParentAppNavCustomData,
} from "@/lib/parent-app-nav-custom";

function slotToLink(slot: { id: string; breadcrumbLabel: string }, category: string): CenterPageLink {
    const label = slot.breadcrumbLabel.split(" › ").pop() || slot.breadcrumbLabel;
    return {
        label,
        href: "#",
        adminCategory: category,
        rowKey: slot.id,
    };
}

function applyParentLabelOverrides(
    item: CenterPageTopItem,
    overrides: Record<string, string>,
    sectionTitles: Record<string, string>,
): CenterPageTopItem {
    const title =
        sectionTitles[item.id]?.trim() || overrides[`top:${item.id}`]?.trim() || item.title;
    return title === item.title ? item : { ...item, title };
}

function parentSectionToTopItem(
    section: { id: string; title: string; category: string; slots: { id: string; breadcrumbLabel: string }[] },
    tree: CentrePageNavCustomData,
): CenterPageTopItem {
    const base: CenterPageTopItem = {
        id: section.id,
        title: section.title,
        groups: [],
        directLinks: section.slots.map((slot) => slotToLink(slot, section.category)),
    };
    const merged = mergeTopWithExtension(base, tree);
    return assignStableRowKeysToTopItem(merged);
}

/** Merge built-in parent sections + admin tree into centre-page checklist shape. */
export function mergeParentAppNavBlocks(
    custom: ParentAppNavCustomData | null | undefined,
): CenterPageTopItem[][] {
    const tree = custom ?? emptyParentAppNavCustom();
    const flatSections = mergeParentAppChecklist(custom);
    const overrides = tree.labelOverrides ?? {};
    const sectionTitles = tree.sectionTitles ?? {};
    const hiddenTops = new Set(tree.hiddenStaticTopIds ?? []);
    const hiddenLinks = new Set(tree.hiddenLinkRowKeys ?? []);
    const hiddenGroups = new Set(tree.hiddenStaticGroupKeys ?? []);
    const hiddenNested = new Set(tree.hiddenStaticNestedKeys ?? []);

    const finalize = (item: CenterPageTopItem): CenterPageTopItem | null => {
        if (hiddenTops.has(item.id)) return null;
        const withOverrides = applyParentLabelOverrides(item, overrides, sectionTitles);
        const withoutDeletedLinks = applyCentrePageHiddenLinks(withOverrides, hiddenLinks);
        return applyCentrePageHiddenGroupsAndNested(withoutDeletedLinks, hiddenGroups, hiddenNested);
    };

    const slotLabels = tree.slotLabels ?? {};
    const builtIn = flatSections
        .map((section) => {
            const item = parentSectionToTopItem(section, tree);
            if (!Object.keys(slotLabels).length) return item;
            const directLinks = item.directLinks?.map((link) => {
                const override = slotLabels[link.rowKey || ""]?.trim();
                return override ? { ...link, label: override } : link;
            });
            return directLinks ? { ...item, directLinks } : item;
        })
        .map(finalize)
        .filter((item): item is CenterPageTopItem => item != null);

    const customTops = (tree.customTopSections ?? [])
        .map((top) => {
            const item: CenterPageTopItem = {
                id: top.id,
                title: top.title,
                adminCustom: true,
                groups: top.groups.map((g) => ({
                    title: g.title,
                    adminCustom: true,
                    links: g.links?.map((l) => ({
                        label: l.label,
                        href: l.href || "#",
                        adminCategory: l.adminCategory,
                        rowKey: l.rowKey ?? `custom-${l.id}`,
                    })),
                    nested: g.nested?.map((n) => ({
                        title: n.title,
                        links: n.links.map((l) => ({
                            label: l.label,
                            href: l.href || "#",
                            adminCategory: l.adminCategory,
                            rowKey: l.rowKey ?? `custom-${l.id}`,
                        })),
                    })),
                })),
                directLinks: top.directLinks?.map((l) => ({
                    label: l.label,
                    href: l.href || "#",
                    adminCategory: l.adminCategory,
                    rowKey: l.rowKey ?? `custom-${l.id}`,
                })),
            };
            return assignStableRowKeysToTopItem(item);
        })
        .map(finalize)
        .filter((item): item is CenterPageTopItem => item != null);

    return [builtIn, customTops];
}

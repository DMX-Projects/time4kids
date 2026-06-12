import {
    PARENT_APP_DOCUMENT_CHECKLIST,
    type ParentAppDocumentSection,
    type ParentAppDocumentSlot,
} from "@/config/parent-app-document-checklist";
import type { CentrePageNavCustomData } from "@/lib/centre-page-nav-custom";

export const PARENT_APP_NAV_CUSTOM_SLUG = "parent-app-nav-custom";

/** Parent app nav JSON: flat checklist overrides + centre-style nested tree. */
export type ParentAppNavCustomData = CentrePageNavCustomData & {
    sectionTitles?: Record<string, string>;
    slotLabels?: Record<string, string>;
    hiddenSectionIds?: string[];
    hiddenSlotIds?: string[];
};

export type ParentAppRenameTarget =
    | { kind: "section"; sectionId: string; currentTitle: string }
    | { kind: "slot"; slotId: string; currentTitle: string };

export function emptyParentAppNavCustom(): ParentAppNavCustomData {
    return {
        customTopSections: [],
        staticExtensions: [],
        staticGroupLinkAppends: [],
        labelOverrides: {},
        hiddenStaticTopIds: [],
        hiddenStaticGroupKeys: [],
        hiddenStaticNestedKeys: [],
        hiddenLinkRowKeys: [],
        sectionTitles: {},
        slotLabels: {},
        hiddenSectionIds: [],
        hiddenSlotIds: [],
    };
}

export function parseParentAppNavCustom(raw: unknown): ParentAppNavCustomData {
    if (!raw || typeof raw !== "object") return emptyParentAppNavCustom();
    const o = raw as Record<string, unknown>;
    const base = emptyParentAppNavCustom();
    return {
        ...base,
        customTopSections: Array.isArray(o.customTopSections)
            ? (o.customTopSections as ParentAppNavCustomData["customTopSections"])
            : [],
        staticExtensions: Array.isArray(o.staticExtensions)
            ? (o.staticExtensions as ParentAppNavCustomData["staticExtensions"])
            : [],
        staticGroupLinkAppends: Array.isArray(o.staticGroupLinkAppends)
            ? (o.staticGroupLinkAppends as ParentAppNavCustomData["staticGroupLinkAppends"])
            : [],
        labelOverrides:
            o.labelOverrides && typeof o.labelOverrides === "object"
                ? (o.labelOverrides as Record<string, string>)
                : {},
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
        sectionTitles:
            o.sectionTitles && typeof o.sectionTitles === "object"
                ? (o.sectionTitles as Record<string, string>)
                : {},
        slotLabels:
            o.slotLabels && typeof o.slotLabels === "object"
                ? (o.slotLabels as Record<string, string>)
                : {},
        hiddenSectionIds: Array.isArray(o.hiddenSectionIds)
            ? (o.hiddenSectionIds as string[]).filter((id) => typeof id === "string")
            : [],
        hiddenSlotIds: Array.isArray(o.hiddenSlotIds)
            ? (o.hiddenSlotIds as string[]).filter((id) => typeof id === "string")
            : [],
    };
}

function hiddenSectionSet(data: ParentAppNavCustomData): Set<string> {
    return new Set([...(data.hiddenSectionIds ?? []), ...(data.hiddenStaticTopIds ?? [])]);
}

function hiddenSlotSet(data: ParentAppNavCustomData): Set<string> {
    return new Set(data.hiddenSlotIds ?? []);
}

export function mergeParentAppChecklist(
    custom: ParentAppNavCustomData | null | undefined,
): ParentAppDocumentSection[] {
    const data = custom ?? emptyParentAppNavCustom();
    const sectionTitles = data.sectionTitles ?? {};
    const slotLabels = data.slotLabels ?? {};

    const hiddenSections = hiddenSectionSet(data);
    const hiddenSlots = hiddenSlotSet(data);

    return PARENT_APP_DOCUMENT_CHECKLIST.filter((section) => !hiddenSections.has(section.id)).map(
        (section) => {
            const title = sectionTitles[section.id]?.trim() || section.title;
            const slots: ParentAppDocumentSlot[] = section.slots
                .filter((slot) => !hiddenSlots.has(slot.id))
                .map((slot) => {
                    const override = slotLabels[slot.id]?.trim();
                    if (!override) return slot;
                    const parts = slot.breadcrumbLabel.split(" › ");
                    parts[parts.length - 1] = override;
                    return {
                        ...slot,
                        breadcrumbLabel: parts.join(" › "),
                    };
                });
            return { ...section, title, slots };
        },
    );
}

export function hideParentAppSection(
    data: ParentAppNavCustomData,
    sectionId: string,
): ParentAppNavCustomData {
    const ids = new Set(data.hiddenSectionIds ?? []);
    ids.add(sectionId);
    const topIds = new Set(data.hiddenStaticTopIds ?? []);
    topIds.add(sectionId);
    return { ...data, hiddenSectionIds: Array.from(ids), hiddenStaticTopIds: Array.from(topIds) };
}

export function hideParentAppSlot(data: ParentAppNavCustomData, slotId: string): ParentAppNavCustomData {
    const ids = new Set(data.hiddenSlotIds ?? []);
    ids.add(slotId);
    const linkKeys = new Set(data.hiddenLinkRowKeys ?? []);
    linkKeys.add(slotId);
    return {
        ...data,
        hiddenSlotIds: Array.from(ids),
        hiddenLinkRowKeys: Array.from(linkKeys),
    };
}

export function renameParentAppLabel(
    data: ParentAppNavCustomData,
    target: ParentAppRenameTarget,
    newTitle: string,
): ParentAppNavCustomData {
    const title = newTitle.trim();
    if (!title) return data;

    if (target.kind === "section") {
        return {
            ...data,
            sectionTitles: { ...(data.sectionTitles ?? {}), [target.sectionId]: title },
        };
    }

    return {
        ...data,
        slotLabels: { ...(data.slotLabels ?? {}), [target.slotId]: title },
    };
}

export function slotDisplayLabel(slot: ParentAppDocumentSlot): string {
    const parts = slot.breadcrumbLabel.split(" › ");
    return parts[parts.length - 1] ?? slot.breadcrumbLabel;
}

import {
    PARENT_APP_DOCUMENT_CHECKLIST,
    type ParentAppDocumentSection,
    type ParentAppDocumentSlot,
} from "@/config/parent-app-document-checklist";

export const PARENT_APP_NAV_CUSTOM_SLUG = "parent-app-nav-custom";

export type ParentAppNavCustomData = {
    /** Section header titles keyed by section id (e.g. holiday-lists). */
    sectionTitles?: Record<string, string>;
    /** Row labels keyed by slot id (e.g. holiday-KA). */
    slotLabels?: Record<string, string>;
};

export type ParentAppRenameTarget =
    | { kind: "section"; sectionId: string; currentTitle: string }
    | { kind: "slot"; slotId: string; currentTitle: string };

export function emptyParentAppNavCustom(): ParentAppNavCustomData {
    return { sectionTitles: {}, slotLabels: {} };
}

export function parseParentAppNavCustom(raw: unknown): ParentAppNavCustomData {
    if (!raw || typeof raw !== "object") return emptyParentAppNavCustom();
    const o = raw as Record<string, unknown>;
    return {
        sectionTitles:
            o.sectionTitles && typeof o.sectionTitles === "object"
                ? (o.sectionTitles as Record<string, string>)
                : {},
        slotLabels:
            o.slotLabels && typeof o.slotLabels === "object"
                ? (o.slotLabels as Record<string, string>)
                : {},
    };
}

export function mergeParentAppChecklist(
    custom: ParentAppNavCustomData | null | undefined,
): ParentAppDocumentSection[] {
    const data = custom ?? emptyParentAppNavCustom();
    const sectionTitles = data.sectionTitles ?? {};
    const slotLabels = data.slotLabels ?? {};

    return PARENT_APP_DOCUMENT_CHECKLIST.map((section) => {
        const title = sectionTitles[section.id]?.trim() || section.title;
        const slots: ParentAppDocumentSlot[] = section.slots.map((slot) => {
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
    });
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

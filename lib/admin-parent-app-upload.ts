import {
    PARENT_APP_DOCUMENT_CHECKLIST,
    type ParentAppDocumentSlot,
    type ParentAppDocumentSection,
} from "@/config/parent-app-document-checklist";

import { fileMatchesParentDocumentCategory } from "@/lib/parent-document-file-kind";

export type ParentDocumentForMatch = {
    id: number;
    category: string;
    title: string;
    display_title?: string;
    file?: string;
    franchise?: number | null;
    state?: string | null;
    order?: number;
};

function docMatchesCategory(doc: ParentDocumentForMatch): boolean {
    return fileMatchesParentDocumentCategory(doc.file || "", doc.category);
}

function parentDashboardDocVisible(doc: ParentDocumentForMatch): boolean {
    return Boolean((doc.file || "").trim());
}

export type AdminParentAppUploadContext = ParentAppDocumentSlot & {
    matchedDocId?: number;
};

function normState(s: string | null | undefined): string {
    return (s || "").trim().toUpperCase();
}

function normTitle(s: string | null | undefined): string {
    return (s || "")
        .trim()
        .toLowerCase()
        .replace(/\.(pdf|mp3|mp4|wav|m4a|ogg|aac|flac|wma)$/i, "")
        .replace(/\s*-\s*(video|audio)$/i, "")
        .replace(/\s*-\s*\d+$/i, "");
}

/** Loose title key so filename uploads match checklist slots. */
function slotTitleKey(category: string, title: string): string {
    let t = normTitle(title);
    if (category === "AUDIO_RHYMES") {
        t = t
            .replace(/^audio rhymes for\s+/i, "")
            .replace(/\s+audio rhymes$/i, "")
            .replace(/&/g, "and")
            .replace(/block[\s-]+(\d+)/gi, "block$1")
            .replace(/\bpp\s*1\b/g, "pp1")
            .replace(/\bpp\s*2\b/g, "pp2")
            .replace(/\s+/g, " ")
            .trim();
    }
    return t;
}

function docTitle(doc: ParentDocumentForMatch): string {
    return (doc.display_title || doc.title || "").trim();
}

/** Match a checklist slot to an uploaded parent document (global vs centre, state for holidays). */
export function matchParentDocToSlot(
    slot: ParentAppDocumentSlot,
    docs: ParentDocumentForMatch[],
): ParentDocumentForMatch | undefined {
    const inCategory = docs.filter((d) => d.category === slot.category && docMatchesCategory(d));
    if (!inCategory.length) return undefined;

    if (slot.category === "HOLIDAY_LISTS" && slot.state) {
        const want = normState(slot.state);
        const byState = inCategory.filter((d) => normState(d.state) === want);
        const global = byState.find((d) => d.franchise == null);
        if (global) return global;
        return byState[0];
    }

    if (slot.suggestedTitle) {
        const want = slotTitleKey(slot.category, slot.suggestedTitle);
        const byTitle = inCategory.filter((d) => slotTitleKey(slot.category, docTitle(d)) === want);
        if (byTitle.length) {
            if (slot.franchiseId === null) {
                return byTitle.find((d) => d.franchise == null) ?? byTitle[0];
            }
            return byTitle.find((d) => d.franchise === slot.franchiseId) ?? byTitle[0];
        }
        return undefined;
    }

    if (slot.franchiseId === null) {
        return inCategory.find((d) => d.franchise == null) ?? inCategory[0];
    }

    return inCategory.find((d) => d.franchise === slot.franchiseId);
}

/** Parent dashboard: every uploaded file for a section (no frontend type filtering). */
export function buildParentDashboardSectionItems(
    category: string,
    docs: ParentDocumentForMatch[],
): ParentDocumentForMatch[] {
    const inCategory = docs.filter(
        (d) => d.category === category && parentDashboardDocVisible(d),
    );
    const section = PARENT_APP_DOCUMENT_CHECKLIST.find((s) => s.category === category);
    const fixedSlots = (section?.slots ?? []).filter((s) => s.suggestedTitle);

    if (fixedSlots.length <= 1) {
        return [...inCategory].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id,
        );
    }

    const ordered: ParentDocumentForMatch[] = [];
    const used = new Set<number>();
    for (const slot of fixedSlots) {
        const matched = matchParentDocToSlot(slot, inCategory);
        if (matched && !used.has(matched.id)) {
            ordered.push(matched);
            used.add(matched.id);
        }
    }
    const extras = inCategory
        .filter((d) => !used.has(d.id))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);
    return [...ordered, ...extras];
}

export function buildParentAppUploadContexts(
    sections: ParentAppDocumentSection[],
    docs: ParentDocumentForMatch[],
): AdminParentAppUploadContext[] {
    const usedIds = new Set<number>();

    const fromSlots: AdminParentAppUploadContext[] = [];
    for (const section of sections) {
        for (const slot of section.slots) {
            const matched = matchParentDocToSlot(slot, docs);
            if (matched) usedIds.add(matched.id);
            fromSlots.push({
                ...slot,
                matchedDocId: matched?.id,
            });
        }
    }

    const extras: AdminParentAppUploadContext[] = [];
    for (const doc of docs) {
        if (usedIds.has(doc.id)) continue;
        if (!docMatchesCategory(doc)) continue;
        const sectionTitle =
            sections.find((s) => s.category === doc.category)?.title ?? doc.category;
        const centre = doc.franchise != null ? `Centre #${doc.franchise}` : "All centres";
        const statePart =
            doc.category === "HOLIDAY_LISTS" && doc.state
                ? ` › ${doc.state}`
                : "";
        extras.push({
            id: `extra-${doc.id}`,
            category: doc.category,
            breadcrumbLabel: `${sectionTitle}${statePart} › ${doc.display_title || doc.title} (${centre})`,
            state: doc.state ?? undefined,
            matchedDocId: doc.id,
        });
    }

    return [...fromSlots, ...extras];
}

import type { ParentAppDocumentSlot, ParentAppDocumentSection } from "@/config/parent-app-document-checklist";

import { fileMatchesParentDocumentCategory } from "@/lib/parent-document-file-kind";

export type ParentDocumentForMatch = {
    id: number;
    category: string;
    title: string;
    display_title?: string;
    file?: string;
    franchise: number | null;
    state?: string | null;
};

function docMatchesCategory(doc: ParentDocumentForMatch): boolean {
    return fileMatchesParentDocumentCategory(doc.file || "", doc.category);
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
        .replace(/\.pdf$/i, "")
        .replace(/\s*-\s*(video|audio)$/i, "");
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
        const want = normTitle(slot.suggestedTitle);
        const byTitle = inCategory.filter((d) => normTitle(docTitle(d)) === want);
        if (byTitle.length) {
            if (slot.franchiseId === null) {
                return byTitle.find((d) => d.franchise == null) ?? byTitle[0];
            }
            return byTitle.find((d) => d.franchise === slot.franchiseId) ?? byTitle[0];
        }
    }

    if (slot.franchiseId === null) {
        return inCategory.find((d) => d.franchise == null) ?? inCategory[0];
    }

    return inCategory.find((d) => d.franchise === slot.franchiseId);
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

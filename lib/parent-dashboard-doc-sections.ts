import type { CenterPageTopItem } from "@/config/franchise-center-page-nav";
import { PARENT_APP_DOCUMENT_CHECKLIST } from "@/config/parent-app-document-checklist";
import type { ParentDashboardDocumentSection } from "@/config/parent-dashboard-sections";
import {
    buildParentDashboardSectionItems,
    type ParentDocumentForMatch,
} from "@/lib/admin-parent-app-upload";
import { collectLinksFromTopItem, linkResolutionKey } from "@/lib/franchise-center-page-links";
import { mergeParentAppNavBlocks } from "@/lib/merge-parent-app-nav-blocks";
import type { ParentAppNavCustomData } from "@/lib/parent-app-nav-custom";
import { buildParentAppResolvedLinkLookup } from "@/lib/parent-app-tree-links";
import { parentDocumentRowVisible } from "@/lib/parent-document-file-kind";

const SECTION_SUBTITLES: Record<string, string> = {
    "preschool-policies": "PDF files only",
    "holiday-lists": "Holiday PDFs for your state",
    "audio-rhymes": "MP3, WAV, MP4, and other audio/video files",
    videos: "Videos, audio, PDFs, and learning files",
    "students-kit": "Tap to view or download",
    "contact-us": "PDF files only",
    "general-rhymes": "PDF files only",
    "student-transfer-policy": "PDF files only",
    "parenting-tips": "PDF files only",
};

const SKIP_TOP_IDS = new Set(["newsletters"]);

function hiddenTopIds(custom: ParentAppNavCustomData | null | undefined): Set<string> {
    const hidden = new Set(custom?.hiddenSectionIds ?? []);
    for (const id of custom?.hiddenStaticTopIds ?? []) hidden.add(id);
    for (const id of Array.from(SKIP_TOP_IDS)) hidden.add(id);
    return hidden;
}

export function primaryCategoryForTopItem(item: CenterPageTopItem): string | undefined {
    const builtIn = PARENT_APP_DOCUMENT_CHECKLIST.find((s) => s.id === item.id);
    if (builtIn) return builtIn.category;

    for (const link of collectLinksFromTopItem(item)) {
        const cat = link.adminCategory?.trim();
        if (cat) return cat;
    }
    // Custom admin sections (new top-level blocks) use links' category once added.
    if (item.adminCustom) return "PRESCHOOL_POLICIES";
    return undefined;
}

/** Same top-level sections as Admin → Parent documents (built-in + custom). */
export function buildParentDashboardSectionsFromNav(
    custom: ParentAppNavCustomData | null | undefined,
): ParentDashboardDocumentSection[] {
    const hidden = hiddenTopIds(custom);
    const sectionTitles = custom?.sectionTitles ?? {};
    const blocks = mergeParentAppNavBlocks(custom);
    const sections: ParentDashboardDocumentSection[] = [];

    for (const block of blocks) {
        for (const item of block) {
            if (hidden.has(item.id)) continue;
            const category = primaryCategoryForTopItem(item);
            if (!category) continue;
            const title = sectionTitles[item.id]?.trim() || item.title;
            sections.push({
                id: item.id,
                kind: "documents",
                category,
                title,
                subtitle: SECTION_SUBTITLES[item.id] || "Tap to view or download",
            });
        }
    }
    return sections;
}

/** Docs tied to checklist rows in this section, plus any extra uploads in the same category. */
export function collectParentSectionDocs(
    item: CenterPageTopItem,
    docs: ParentDocumentForMatch[],
): ParentDocumentForMatch[] {
    const lookup = buildParentAppResolvedLinkLookup(item, docs);
    const links = collectLinksFromTopItem(item);
    const ordered: ParentDocumentForMatch[] = [];
    const used = new Set<number>();

    for (const link of links) {
        const meta = lookup.get(linkResolutionKey(link));
        const docId = meta?.franchiseHubDocId;
        if (docId == null || used.has(docId)) continue;
        const doc = docs.find((d) => d.id === docId);
        if (!doc || !parentDocumentRowVisible(doc, doc.category)) continue;
        ordered.push(doc);
        used.add(docId);
    }

    const category = primaryCategoryForTopItem(item);
    if (category) {
        for (const doc of buildParentDashboardSectionItems(category, docs)) {
            if (used.has(doc.id)) continue;
            ordered.push(doc);
            used.add(doc.id);
        }
    }

    return ordered;
}

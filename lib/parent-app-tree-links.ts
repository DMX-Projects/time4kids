import type { CenterPageLink, CenterPageTopItem } from "@/config/franchise-center-page-nav";
import { PARENT_APP_DOCUMENT_CHECKLIST } from "@/config/parent-app-document-checklist";
import type { FranchiseHubDoc } from "@/components/dashboard/franchise/FranchiseResourceFileRow";
import {
    collectLinksFromTopItem,
    groupFranchiseHubDocsByCategory,
    groupFranchiseHubDocsBySourcePath,
    linkResolutionKey,
    type ResolvedLinkMeta,
} from "@/lib/franchise-center-page-links";
import { matchParentDocToSlot, type ParentDocumentForMatch } from "@/lib/admin-parent-app-upload";
import { checklistSourcePathForLink } from "@/lib/centre-page-nav-custom";

export type ParentDocHubRow = ParentDocumentForMatch & {
    source_path?: string | null;
    video_embed_url?: string;
    description?: string;
};

function normalizeSourcePathKey(path: string): string {
    return path.replace(/\\/g, "/").trim().replace(/^\/+/, "").toLowerCase();
}

function parentDocReady(doc: ParentDocHubRow | undefined, used?: Set<number>): ParentDocHubRow | undefined {
    if (!doc?.id) return undefined;
    const hasFile = Boolean((doc.file || "").trim());
    const hasEmbed = Boolean((doc.video_embed_url || "").trim());
    if (!hasFile && !hasEmbed) return undefined;
    if (used?.has(doc.id)) return undefined;
    return doc;
}

function slotForRowKey(rowKey: string) {
    for (const section of PARENT_APP_DOCUMENT_CHECKLIST) {
        const slot = section.slots.find((s) => s.id === rowKey);
        if (slot) return { slot, category: section.category };
    }
    return undefined;
}

export function parentDocsAsHubDocs(docs: ParentDocHubRow[]): FranchiseHubDoc[] {
    return docs.map((d) => ({
        id: d.id,
        category: d.category,
        title: d.title,
        description: d.description ?? "",
        source_path: d.source_path ?? undefined,
        file: d.file || "",
        embed_url: d.video_embed_url ?? null,
        franchise: d.franchise ?? null,
        academic_year: "",
        is_active: true,
        order: d.order ?? 0,
    }));
}

export function groupParentDocsBySourcePath(docs: ParentDocHubRow[]): Map<string, ParentDocHubRow> {
    const map = new Map<string, ParentDocHubRow>();
    for (const doc of docs) {
        if (!doc.source_path) continue;
        map.set(normalizeSourcePathKey(doc.source_path), doc);
    }
    return map;
}

function resolveParentLinkMeta(
    link: CenterPageLink,
    docs: ParentDocHubRow[],
    docsBySourcePath: Map<string, ParentDocHubRow>,
    usedDocIds?: Set<number>,
): ResolvedLinkMeta {
    const checklistPath = normalizeSourcePathKey(checklistSourcePathForLink(link));
    const byChecklist = parentDocReady(docsBySourcePath.get(checklistPath), usedDocIds);
    if (byChecklist) {
        return { href: `#parent-doc-${byChecklist.id}`, franchiseHubDocId: byChecklist.id };
    }

    const rowKey = link.rowKey?.trim();
    if (rowKey) {
        const found = slotForRowKey(rowKey);
        if (found) {
            const matched = matchParentDocToSlot(found.slot, docs);
            const ready = parentDocReady(matched, usedDocIds);
            if (ready) {
                return { href: `#parent-doc-${ready.id}`, franchiseHubDocId: ready.id };
            }
        }
    }

    return { href: link.href };
}

export function buildParentAppResolvedLinkLookup(
    item: CenterPageTopItem,
    docs: ParentDocHubRow[],
): Map<string, ResolvedLinkMeta> {
    const docsBySourcePath = groupParentDocsBySourcePath(docs);
    const links = collectLinksFromTopItem(item);
    const usedDocIds = new Set<number>();
    const lookup = new Map<string, ResolvedLinkMeta>();
    for (const link of links) {
        const key = linkResolutionKey(link);
        const meta = resolveParentLinkMeta(link, docs, docsBySourcePath, usedDocIds);
        if (meta.franchiseHubDocId != null) usedDocIds.add(meta.franchiseHubDocId);
        lookup.set(key, meta);
    }
    return lookup;
}

export function buildParentLinkLookupForItem(
    item: CenterPageTopItem,
    hubDocs: FranchiseHubDoc[],
    _byCategory: Map<string, FranchiseHubDoc[]>,
    _bySourcePath: Map<string, FranchiseHubDoc>,
    parentDocs: ParentDocHubRow[],
): Map<string, ResolvedLinkMeta> {
    void hubDocs;
    return buildParentAppResolvedLinkLookup(item, parentDocs);
}

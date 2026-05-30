import type { CenterPageLink, CenterPageTopItem } from "@/config/franchise-center-page-nav";
import { isStudentsKitPublicPath } from "@/config/students-kit-public-pages";
import { mediaUrl } from "@/lib/api-client";
import type { FranchiseHubDoc } from "@/components/dashboard/franchise/FranchiseResourceFileRow";

/** Dashboard list pages keyed by `FranchiseDocumentCategory`. */
export const FRANCHISE_CATEGORY_HUB_PATH: Record<string, string> = {
    SOP: "/dashboard/franchise/sop",
    INFRASTRUCTURE_MANUAL: "/dashboard/franchise/infrastructure-manual",
    FORMATS: "/dashboard/franchise/formats",
    LEASE_AGREEMENT_DOCUMENTS: "/dashboard/franchise/lease-agreement-documents",
    INDENT_DOCUMENTS: "/dashboard/franchise/indent-documents",
    ORDERING_DOCUMENTS: "/dashboard/franchise/ordering-documents",
    STUDENT_TRANSFER_POLICY: "/dashboard/franchise/student-transfer-policy",
    ACADEMIC_DOCUMENTS: "/dashboard/franchise/academic-documents",
    REFRESHER_COURSE: "/dashboard/franchise/refresher-course",
    AKSHARABHYASAM_SUPPORT_SHEETS: "/dashboard/franchise/aksharabhyasam-support-sheets",
    STUDENTS_KIT: "/dashboard/franchise/students-kit",
    FRANCHISE_REFERRAL_INCENTIVES: "/dashboard/franchise/franchise-referral-incentives",
    ROYALTY_PAYMENTS: "/dashboard/franchise/royalty-payments",
    HOLIDAY_LISTS: "/dashboard/franchise/academic-documents",
    WELCOME_LETTERS: "/dashboard/franchise/academic-documents",
    SUMMER_CAMP: "/dashboard/franchise/refresher-course",
    SOCIAL_MEDIA_SUPPORT: "/dashboard/franchise/#center-page",
    WATCH_HEAR_LEARN: "/dashboard/franchise/parent-portal/",
    ADMISSION_COUNSELLING: "/dashboard/franchise/enquiries",
    ARTWORKS_MARKETING: "/dashboard/franchise/parent-portal/?tab=showcase",
    CONCEPT_ROOM_DISPLAYS: "/dashboard/franchise/parent-portal/?tab=showcase",
    REPORT_CARD_COMMENTS: "/dashboard/franchise/add-grades/",
    PARENT_ORIENTATION: "/dashboard/franchise/parent-portal/",
    COUNSELLING_TOOLS: "/dashboard/franchise/enquiries",
    PARENTING_TIPS: "/dashboard/franchise/parent-portal/",
};

const LEGACY_UPLOAD_HOSTS = ["103.65.21.245", "www.timekidspreschools.in", "timekidspreschools.in"];

const FILE_EXT =
    /\.(pdf|zip|rar|7z|docx?|pptx?|xlsx?|png|jpe?g|gif|webp|bmp|svg|htm|html?|mp4|mov)(\?|#|$)/i;

/** Open in a new tab — never route PDFs/images through Next.js client navigation. */
export function shouldOpenFranchiseLinkInNewTab(href: string): boolean {
    const h = href.trim();
    if (!h) return false;
    if (/^https?:\/\//i.test(h)) return true;
    if (h.startsWith("/media/")) return true;
    if (h.startsWith("/franchise-artworks/") || h.startsWith("/franchise-gallery/")) return true;
    if (FILE_EXT.test(h)) return true;
    return false;
}

/** Path under `pc/` folder, e.g. `holidayslist-2026-27/AP Holiday List 2026-2027.pdf` */
export function extractLegacyPcRelativePath(href: string): string | null {
    const trimmed = href.trim();
    if (!trimmed) return null;
    try {
        const pathname = /^https?:\/\//i.test(trimmed)
            ? new URL(trimmed).pathname
            : trimmed.startsWith("/")
              ? trimmed
              : null;
        if (!pathname) return null;
        const match = pathname.match(/\/uploads\/pc\/(.+)/i) ?? pathname.match(/^\/media\/pc\/(.+)/i);
        if (!match?.[1]) return null;
        return decodeURIComponent(match[1].replace(/\\/g, "/"));
    } catch {
        return null;
    }
}

/** Map old `http://…/uploads/pc/...` links to Django `/media/pc/...` (PC_DOCUMENTS_ROOT). */
export function legacyPcHrefToMediaUrl(href: string): string | null {
    const relative = extractLegacyPcRelativePath(href);
    if (!relative) return null;
    const encoded = relative
        .split("/")
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join("/");
    return mediaUrl(`pc/${encoded}`);
}

export function isLegacyFranchiseUploadUrl(href: string): boolean {
    const trimmed = href.trim();
    if (!/^https?:\/\//i.test(trimmed)) return false;
    try {
        const host = new URL(trimmed).hostname.toLowerCase();
        return LEGACY_UPLOAD_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
    } catch {
        return false;
    }
}

function stableRowKeyForLink(link: CenterPageLink): string {
    if (link.rowKey) return link.rowKey;
    const href = link.href?.trim();
    return href ? `href:${href}` : `link:${link.label}`;
}

function checklistRowSourcePath(link: CenterPageLink): string {
    if (link.rowKey?.trim()) {
        return `checklist-row/${link.rowKey.trim().replace(/:/g, "/")}`;
    }
    return `checklist-row/${stableRowKeyForLink(link).replace(/:/g, "/")}`;
}

function normalizeSourcePathKey(path: string): string {
    return path.replace(/\\/g, "/").trim().replace(/^\/+/, "").toLowerCase();
}

function hubDocReady(doc: FranchiseHubDoc | undefined, usedDocIds?: Set<number>): FranchiseHubDoc | undefined {
    if (!doc?.id || !(doc.file || doc.embed_url)) return undefined;
    if (usedDocIds?.has(doc.id)) return undefined;
    return doc;
}

/** e.g. `/franchise-artworks/.../file.png` → `franchise-artworks/.../file.png` (matches DB source_path). */
function extractPublicFranchiseRelativePath(href: string): string | null {
    const trimmed = href.trim();
    if (!trimmed.startsWith("/")) return null;
    const path = trimmed.split("?")[0]?.split("#")[0] ?? trimmed;
    if (path.startsWith("/franchise-artworks/") || path.startsWith("/franchise-gallery/")) {
        return path.replace(/^\/+/, "");
    }
    return null;
}

export function groupFranchiseHubDocsByCategory(
    docs: FranchiseHubDoc[],
): Map<string, FranchiseHubDoc[]> {
    const map = new Map<string, FranchiseHubDoc[]>();
    for (const doc of docs) {
        const category = doc.category;
        if (!category) continue;
        const list = map.get(category) ?? [];
        list.push(doc);
        map.set(category, list);
    }
    return map;
}

export function groupFranchiseHubDocsBySourcePath(
    docs: FranchiseHubDoc[],
): Map<string, FranchiseHubDoc> {
    const map = new Map<string, FranchiseHubDoc>();
    for (const doc of docs) {
        if (!doc.source_path) continue;
        map.set(normalizeSourcePathKey(doc.source_path), doc);
    }
    return map;
}

type ResolvedHubLink = { href: string; franchiseHubDocId?: number };

function withFranchiseHubDownload(docId: number): ResolvedHubLink {
    return { href: `#franchise-hub-doc-${docId}`, franchiseHubDocId: docId };
}

export type ResolvedLinkMeta = { href: string; franchiseHubDocId?: number };

export function linkResolutionKey(link: CenterPageLink): string {
    return link.rowKey?.trim() || stableRowKeyForLink(link);
}

/** Resolve all links under one top section once — each DB document maps to at most one row. */
export function buildResolvedLinkLookup(
    item: CenterPageTopItem,
    docsByCategory: Map<string, FranchiseHubDoc[]>,
    docsBySourcePath?: Map<string, FranchiseHubDoc>,
): Map<string, ResolvedLinkMeta> {
    const links = collectLinksFromTopItem(item);
    const usedDocIds = new Set<number>();
    const lookup = new Map<string, ResolvedLinkMeta>();
    for (const link of links) {
        const key = linkResolutionKey(link);
        const meta = resolveCenterPageLinkMeta(link, docsByCategory, docsBySourcePath, usedDocIds);
        if (meta.franchiseHubDocId != null) usedDocIds.add(meta.franchiseHubDocId);
        lookup.set(key, meta);
    }
    return lookup;
}

export function applyResolvedLinkLookup(
    link: CenterPageLink,
    lookup?: Map<string, ResolvedLinkMeta>,
): CenterPageLink {
    if (!lookup) return link;
    const meta = lookup.get(linkResolutionKey(link));
    if (!meta) return link;
    return { ...link, href: meta.href, franchiseHubDocId: meta.franchiseHubDocId };
}

/**
 * Resolve centre-page links for live franchise dashboard.
 * PostgreSQL `FranchiseDocument` rows win first; pc folder / static files are fallbacks only.
 */
export function resolveCenterPageLinkMeta(
    link: CenterPageLink,
    docsByCategory: Map<string, FranchiseHubDoc[]>,
    docsBySourcePath?: Map<string, FranchiseHubDoc>,
    usedDocIds?: Set<number>,
): ResolvedHubLink {
    void docsByCategory;

    if (docsBySourcePath) {
        const byChecklist = hubDocReady(
            docsBySourcePath.get(normalizeSourcePathKey(checklistRowSourcePath(link))),
            usedDocIds,
        );
        if (byChecklist) return withFranchiseHubDownload(byChecklist.id);
    }

    const publicRel = extractPublicFranchiseRelativePath(link.href);
    if (publicRel && docsBySourcePath) {
        const byPublic = hubDocReady(
            docsBySourcePath.get(normalizeSourcePathKey(publicRel)),
            usedDocIds,
        );
        if (byPublic) return withFranchiseHubDownload(byPublic.id);
    }

    const legacyRel = extractLegacyPcRelativePath(link.href);
    if (legacyRel && docsBySourcePath) {
        const byPath = hubDocReady(
            docsBySourcePath.get(normalizeSourcePathKey(legacyRel)),
            usedDocIds,
        );
        if (byPath) return withFranchiseHubDownload(byPath.id);
    }

    const fromPcFolder = legacyPcHrefToMediaUrl(link.href);
    if (fromPcFolder) return { href: fromPcFolder };

    if (isLegacyFranchiseUploadUrl(link.href)) {
        return { href: link.href };
    }

    const trimmed = link.href.trim();
    if (isStudentsKitPublicPath(trimmed)) {
        return { href: trimmed.replace(/\/$/, "") || trimmed };
    }
    if (trimmed.startsWith("/media/")) {
        return { href: mediaUrl(trimmed.replace(/^\/media\/?/, "")) };
    }

    return { href: link.href };
}

export function resolveCenterPageLinks(
    links: CenterPageLink[],
    docsByCategory: Map<string, FranchiseHubDoc[]>,
    docsBySourcePath?: Map<string, FranchiseHubDoc>,
): CenterPageLink[] {
    const usedDocIds = new Set<number>();
    return links.map((link) => {
        const meta = resolveCenterPageLinkMeta(link, docsByCategory, docsBySourcePath, usedDocIds);
        if (meta.franchiseHubDocId != null) usedDocIds.add(meta.franchiseHubDocId);
        return {
            ...link,
            href: meta.href,
            franchiseHubDocId: meta.franchiseHubDocId,
        };
    });
}

/** Every checklist link under a top-level Center Page / hub section. */
export function collectLinksFromTopItem(item: CenterPageTopItem): CenterPageLink[] {
    const out: CenterPageLink[] = [];
    if (item.directLinks?.length) out.push(...item.directLinks);
    for (const group of item.groups) {
        if (group.links?.length) out.push(...group.links);
        if (group.nested) {
            for (const block of group.nested) out.push(...block.links);
        }
    }
    return out;
}

function folderLabelFromSourcePath(sourcePath: string | null | undefined): string {
    const parts = (sourcePath || "").replace(/\\/g, "/").split("/").filter(Boolean);
    if (parts.length > 1) return parts.slice(0, -1).join(" / ");
    return "Other uploads";
}

/**
 * Uploaded hub files in the section’s categories that are not tied to a checklist link
 * (shown at the bottom of category hub pages).
 */
export function groupOrphanHubDocsForTopItem(
    item: CenterPageTopItem,
    docsByCategory: Map<string, FranchiseHubDoc[]>,
    docsBySourcePath?: Map<string, FranchiseHubDoc>,
): Map<string, FranchiseHubDoc[]> {
    const links = collectLinksFromTopItem(item);
    const resolved = resolveCenterPageLinks(links, docsByCategory, docsBySourcePath);
    const usedIds = new Set(
        resolved
            .map((l) => l.franchiseHubDocId)
            .filter((id): id is number => typeof id === "number"),
    );

    const categories = new Set<string>();
    for (const link of links) {
        if (link.adminCategory) categories.add(link.adminCategory);
    }

    const orphans: FranchiseHubDoc[] = [];
    for (const category of Array.from(categories)) {
        for (const doc of docsByCategory.get(category) ?? []) {
            if (doc.id != null && !usedIds.has(doc.id)) orphans.push(doc);
        }
    }

    const groups = new Map<string, FranchiseHubDoc[]>();
    for (const doc of orphans) {
        const key = folderLabelFromSourcePath(doc.source_path);
        const list = groups.get(key) ?? [];
        list.push(doc);
        groups.set(key, list);
    }
    return groups;
}

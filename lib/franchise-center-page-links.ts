import type { CenterPageLink } from "@/config/franchise-center-page-nav";
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
    SOCIAL_MEDIA_SUPPORT: "/dashboard/franchise/updates",
    WATCH_HEAR_LEARN: "/dashboard/franchise/parent-documents",
    ADMISSION_COUNSELLING: "/dashboard/franchise/enquiries",
    ARTWORKS_MARKETING: "/dashboard/franchise/gallery",
    CONCEPT_ROOM_DISPLAYS: "/dashboard/franchise/gallery",
    REPORT_CARD_COMMENTS: "/dashboard/franchise/add-grades",
    PARENT_ORIENTATION: "/dashboard/franchise/parent-documents",
    COUNSELLING_TOOLS: "/dashboard/franchise/enquiries",
    PARENTING_TIPS: "/dashboard/franchise/parent-documents",
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

function normalizeMatchKey(value: string): string {
    return value
        .toLowerCase()
        .replace(/\.[a-z0-9]{2,5}$/i, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function docTitle(doc: FranchiseHubDoc): string {
    return (doc.display_title || doc.title || "").trim();
}

function findDocForLink(label: string, docs: FranchiseHubDoc[]): FranchiseHubDoc | undefined {
    if (!docs.length) return undefined;
    const labelKey = normalizeMatchKey(label);
    if (!labelKey) return undefined;

    const exact = docs.find((d) => normalizeMatchKey(docTitle(d)) === labelKey);
    if (exact) return exact;

    const contains = docs.find((d) => {
        const key = normalizeMatchKey(docTitle(d));
        return key.includes(labelKey) || labelKey.includes(key);
    });
    return contains;
}

function normalizeSourcePathKey(path: string): string {
    return path.replace(/\\/g, "/").trim().replace(/^\/+/, "").toLowerCase();
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

/**
 * Resolve centre-page links for live franchise dashboard.
 * PostgreSQL `FranchiseDocument` rows win first; pc folder / static files are fallbacks only.
 */
export function resolveCenterPageLinkHref(
    link: CenterPageLink,
    docsByCategory: Map<string, FranchiseHubDoc[]>,
    docsBySourcePath?: Map<string, FranchiseHubDoc>,
): string {
    const publicRel = extractPublicFranchiseRelativePath(link.href);
    if (publicRel && docsBySourcePath) {
        const byPublic = docsBySourcePath.get(normalizeSourcePathKey(publicRel));
        if (byPublic?.file) return mediaUrl(byPublic.file);
    }

    const legacyRel = extractLegacyPcRelativePath(link.href);
    if (legacyRel && docsBySourcePath) {
        const byPath = docsBySourcePath.get(normalizeSourcePathKey(legacyRel));
        if (byPath?.file) return mediaUrl(byPath.file);
    }

    if (link.adminCategory) {
        const docs = docsByCategory.get(link.adminCategory) ?? [];
        const match = findDocForLink(link.label, docs);
        if (match?.file) return mediaUrl(match.file);
    }

    const fromPcFolder = legacyPcHrefToMediaUrl(link.href);
    if (fromPcFolder) return fromPcFolder;

    if (isLegacyFranchiseUploadUrl(link.href)) {
        return link.href;
    }

    const trimmed = link.href.trim();
    if (trimmed.startsWith("/media/")) {
        return mediaUrl(trimmed.replace(/^\/media\/?/, ""));
    }

    return link.href;
}

export function resolveCenterPageLinks(
    links: CenterPageLink[],
    docsByCategory: Map<string, FranchiseHubDoc[]>,
    docsBySourcePath?: Map<string, FranchiseHubDoc>,
): CenterPageLink[] {
    return links.map((link) => ({
        ...link,
        href: resolveCenterPageLinkHref(link, docsByCategory, docsBySourcePath),
    }));
}

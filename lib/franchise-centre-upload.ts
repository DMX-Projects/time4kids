/**
 * Franchise uploads from local files / folders → parent app and/or centre resource hub.
 */

import { jsonHeaders } from "@/lib/api-client";

export type ParentUploadKind = "document" | "image" | "video" | "skip";

const IMAGE_EXT = new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".bmp",
    ".svg",
    ".heic",
    ".heif",
    ".tif",
    ".tiff",
    ".avif",
    ".jfif",
    ".pjpeg",
    ".ico",
]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv", ".mpeg", ".mpg", ".3gp"]);

/** File picker `accept` — all common image types from any local folder. */
export const IMAGE_FILE_ACCEPT =
    "image/*,.png,.jpg,.jpeg,.gif,.webp,.bmp,.tif,.tiff,.avif,.jfif,.pjpeg,.heic,.heif,.ico,.svg";

export const VIDEO_FILE_ACCEPT = "video/*,.mp4,.webm,.mov,.m4v,.avi,.mkv,.mpeg,.mpg,.3gp";
const DOC_EXT = new Set([
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
    ".txt",
    ".zip",
    ".rar",
    ".7z",
    ".mp3",
    ".wav",
    ".m4a",
    ".htm",
    ".html",
]);

const SKIP_NAMES = new Set([".ds_store", "thumbs.db", "desktop.ini"]);

export function extensionOf(file: File): string {
    const name = file.name.toLowerCase();
    const dot = name.lastIndexOf(".");
    return dot >= 0 ? name.slice(dot) : "";
}

export function titleFromFileName(file: File): string {
    const base = file.name.replace(/\\/g, "/").split("/").pop() || file.name;
    const dot = base.lastIndexOf(".");
    const stem = dot > 0 ? base.slice(0, dot) : base;
    return stem.replace(/[_-]+/g, " ").trim() || "Upload";
}

export function relativePathLabel(file: File): string {
    const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
    return rel?.trim() ? rel.replace(/\\/g, "/") : file.name;
}

/** True when the file is a photo, including folder picks with empty MIME (common on Windows). */
export function isImageUploadFile(file: File): boolean {
    const ext = extensionOf(file);
    if (IMAGE_EXT.has(ext)) return true;
    const mime = (file.type || "").toLowerCase();
    if (mime.startsWith("image/")) return true;
    if (!mime || mime === "application/octet-stream") return IMAGE_EXT.has(ext);
    return false;
}

export function isVideoUploadFile(file: File): boolean {
    const ext = extensionOf(file);
    if (VIDEO_EXT.has(ext)) return true;
    const mime = (file.type || "").toLowerCase();
    if (mime.startsWith("video/")) return true;
    if (!mime || mime === "application/octet-stream") return VIDEO_EXT.has(ext);
    return false;
}

export function classifyParentUploadFile(file: File): ParentUploadKind {
    if (isImageUploadFile(file)) return "image";
    if (isVideoUploadFile(file)) return "video";
    const ext = extensionOf(file);
    if (DOC_EXT.has(ext) || file.type.startsWith("audio/")) return "document";
    if (file.type === "application/pdf" || file.type.includes("document") || file.type.includes("sheet")) {
        return "document";
    }
    return "skip";
}

/** Hub accepts any file type the centre might store locally. */
export function classifyHubUploadFile(file: File): ParentUploadKind {
    const k = classifyParentUploadFile(file);
    return k === "skip" ? "document" : k;
}

export function collectLocalUploadFiles(list: FileList | null): File[] {
    if (!list?.length) return [];
    return Array.from(list).filter((f) => {
        const base = (f.name.replace(/\\/g, "/").split("/").pop() || f.name).toLowerCase();
        if (!base || base.startsWith(".")) return false;
        if (SKIP_NAMES.has(base)) return false;
        return true;
    });
}

export function isPdfFile(file: File): boolean {
    return file.type === "application/pdf" || extensionOf(file) === ".pdf";
}

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
/** Event Gallery / showcase photos (franchise → parent app & public centre page). */
export const MAX_EVENT_GALLERY_IMAGE_BYTES = 1 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_DOC_BYTES = 25 * 1024 * 1024;
export const MAX_HUB_FILE_BYTES = 50 * 1024 * 1024;

export function validateEventGalleryImageSize(file: File): string | null {
    if (file.size > MAX_EVENT_GALLERY_IMAGE_BYTES) {
        const mb = (file.size / (1024 * 1024)).toFixed(2);
        return `${file.name}: image too large (${mb} MB). Max 1 MB per photo.`;
    }
    return null;
}

export function validateFileSize(file: File, kind: ParentUploadKind): string | null {
    if (kind === "image" && file.size > MAX_IMAGE_BYTES) {
        return `${file.name}: image too large (max 15 MB).`;
    }
    if (kind === "video" && file.size > MAX_VIDEO_BYTES) {
        return `${file.name}: video too large (max 50 MB).`;
    }
    if (kind === "document" && file.size > MAX_DOC_BYTES) {
        return `${file.name}: file too large (max 25 MB).`;
    }
    return null;
}

export function validateHubFileSize(file: File): string | null {
    if (file.size > MAX_HUB_FILE_BYTES) {
        return `${file.name}: file too large (max 50 MB).`;
    }
    return null;
}

/** Admin centre-page / resource hub checklist uploads (new file picks only). */
export function validateAdminHubDocumentUpload(file: File): string | null {
    return validateHubFileSize(file);
}

/** Admin parent-app document checklist uploads (new file picks only). */
export function validateAdminParentDocumentUpload(file: File): string | null {
    const kind = classifyParentUploadFile(file);
    if (kind === "skip") {
        return `${file.name}: file type not supported for parent app uploads.`;
    }
    if (validateFileSize(file, kind)) {
        return `${file.name}: file is too large. Choose a smaller file.`;
    }
    return null;
}

export type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;

export async function ensureShowcaseEventId(authFetch: AuthFetchFn): Promise<string> {
    const today = new Date().toISOString().slice(0, 10);
    const created = await authFetch<{ id: number }>("/events/franchise/", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({
            title: `Showcase ${today}`,
            description: "Photos and videos for parents (folder upload)",
            start_date: today,
            end_date: today,
            location: "Showcase",
        }),
    });
    return String(created.id);
}

/** Head office only — parent mobile app documents (global or per-centre). */
export async function uploadAdminParentDocument(
    authFetch: AuthFetchFn,
    file: File,
    opts: {
        category: string;
        title?: string;
        academicYear?: string;
        state?: string;
        franchiseId?: number | null;
    },
): Promise<void> {
    const fd = new FormData();
    fd.append("category", opts.category);
    fd.append("title", opts.title?.trim() || titleFromFileName(file));
    fd.append("description", relativePathLabel(file));
    fd.append("file", file);
    if (opts.academicYear?.trim()) fd.append("academic_year", opts.academicYear.trim());
    if (opts.state?.trim()) fd.append("state", opts.state.trim());
    if (opts.franchiseId != null) fd.append("franchise", String(opts.franchiseId));
    await authFetch("/documents/admin/parent-documents/", { method: "POST", body: fd });
}

export async function uploadFranchiseHubDocument(
    authFetch: AuthFetchFn,
    file: File,
    opts: { category: string; title?: string },
): Promise<void> {
    const fd = new FormData();
    fd.append("category", opts.category);
    fd.append("title", opts.title?.trim() || titleFromFileName(file));
    fd.append("description", relativePathLabel(file));
    fd.append("file", file);
    await authFetch("/documents/franchise/centre-documents/", { method: "POST", body: fd });
}

/** Head-office bulk upload to centre resource hub (admin dashboard only). */
export async function uploadAdminFranchiseHubDocument(
    authFetch: AuthFetchFn,
    file: File,
    opts: { category: string; title?: string },
): Promise<void> {
    const fd = new FormData();
    fd.append("category", opts.category);
    fd.append("title", opts.title?.trim() || titleFromFileName(file));
    fd.append("description", relativePathLabel(file));
    fd.append("file", file);
    await authFetch("/documents/admin/franchise-documents/", { method: "POST", body: fd });
}

export async function uploadEventMediaFile(
    authFetch: AuthFetchFn,
    eventId: string,
    file: File,
    kind: "image" | "video",
): Promise<void> {
    if (kind === "image") {
        const err = validateEventGalleryImageSize(file);
        if (err) throw new Error(err);
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("media_type", kind === "video" ? "VIDEO" : "IMAGE");
    fd.append("caption", relativePathLabel(file));
    await authFetch(`/events/franchise/${eventId}/media/`, { method: "POST", body: fd });
}

export type BulkUploadResult = { ok: number; failed: number; skipped: number; errors: string[] };

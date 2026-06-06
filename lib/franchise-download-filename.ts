/**
 * Human-readable download filenames for franchise hub files (not storage UUIDs).
 */

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VIEW_INLINE_EXTS = new Set([
    "pdf",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "svg",
    "bmp",
    "htm",
    "html",
    "mp4",
    "webm",
    "mov",
    "m4v",
    "mp3",
    "wav",
    "m4a",
    "aac",
    "ogg",
]);

export function extensionFromPath(file: string | null | undefined): string {
    const raw = (file || "").trim();
    if (!raw) return "";
    const noQuery = raw.split("?")[0] ?? raw;
    const base = noQuery.split("/").pop() ?? noQuery;
    const dot = base.lastIndexOf(".");
    if (dot <= 0 || dot === base.length - 1) return "";
    return base.slice(dot).toLowerCase();
}

function sanitizeFilename(name: string): string {
    return (
        name
            .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "_")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/^\.+|\.+$/g, "") || "document"
    );
}

function humanizeSegment(segment: string): string {
    return segment.replace(/_/g, " ").replace(/-/g, " ").trim();
}

function looksLikeUuid(value: string): boolean {
    const base = value.split("/").pop() || value;
    const stem = base.includes(".") ? base.slice(0, base.lastIndexOf(".")) : base;
    return UUID_RE.test(stem);
}

function appendExtension(safe: string, ext: string): string {
    if (!ext) return safe;
    return safe.toLowerCase().endsWith(ext.toLowerCase()) ? safe : `${safe}${ext}`;
}

/** Use the exact dashboard link text as the saved filename. */
export function downloadFilenameFromLinkLabel(label: string, extHint?: string): string {
    const title = sanitizeFilename((label || "").trim() || "document");
    const ext = extHint && extHint.startsWith(".") ? extHint : extHint ? `.${extHint}` : ".pdf";
    return appendExtension(title, ext);
}

/** Only append short class/block-style folder names — not long category folder paths. */
function shouldAppendParentFolder(parentHumanized: string): boolean {
    const p = parentHumanized.toLowerCase();
    if (!p || p.length > 36) return false;
    if (p.includes("uploads and support") || p.includes("social media uploads")) return false;
    if (p.includes("academic documents") || p.includes("welcome letters")) return false;
    if (/^block[- ]?\d+/i.test(p)) return true;
    if (/^(nursery|pp\s?1|pp\s?2|pg|play group)\b/i.test(p)) return true;
    if (p.includes("holiday") || p.includes("study material") || p.includes("refresher")) return true;
    if (p.includes("summer camp") || p.includes("summercamp")) return true;
    return false;
}

export type HubDocFilenameInput = {
    title?: string;
    display_title?: string;
    file?: string;
    source_path?: string | null;
};

/** Build download filename from hub document metadata (matches Django download_names.py). */
export function downloadFilenameForHubDoc(doc: HubDocFilenameInput, linkLabel?: string): string {
    const sourcePath = (doc.source_path || "").replace(/\\/g, "/").trim();
    const storedPath = (doc.file || "").trim();

    let ext = extensionFromPath(sourcePath) || extensionFromPath(storedPath);
    const preferLabel = (linkLabel || "").trim();
    if (preferLabel && !looksLikeUuid(preferLabel)) {
        if (!ext) ext = ".pdf";
        return downloadFilenameFromLinkLabel(preferLabel, ext);
    }

    let title = (doc.display_title || doc.title || "").trim();

    if (sourcePath) {
        const sourceFile = sourcePath.split("/").filter(Boolean).pop() || "";
        const sourceStem = sourceFile.includes(".")
            ? sourceFile.slice(0, sourceFile.lastIndexOf("."))
            : sourceFile;

        if (!title || looksLikeUuid(title) || looksLikeUuid(sourceStem)) {
            title = humanizeSegment(sourceStem);
        } else if (looksLikeUuid(title.split("/").pop() || title)) {
            title = humanizeSegment(sourceStem);
        }

        const parts = sourcePath.split("/").filter(Boolean);
        if (parts.length >= 2) {
            const parent = humanizeSegment(parts[parts.length - 2] ?? "");
            const skip = new Set(["pc", "uploads", "media", "franchise_documents"]);
            if (
                parent &&
                !skip.has(parent.toLowerCase()) &&
                !title.toLowerCase().includes(parent.toLowerCase()) &&
                shouldAppendParentFolder(parent)
            ) {
                title = `${title} (${parent})`;
            }
        }
    }

    if (!title) {
        const storedBase = storedPath.split("/").pop() || "";
        const storedStem = storedBase.includes(".")
            ? storedBase.slice(0, storedBase.lastIndexOf("."))
            : storedBase;
        title = humanizeSegment(storedStem) || "document";
    }

    if (!ext) ext = ".pdf";

    return appendExtension(sanitizeFilename(title), ext);
}

/** Centre-page link label + href → saved filename (always prefers visible link text). */
export function downloadFilenameFromLink(
    label: string,
    href: string,
    extOverride?: string,
): string {
    const ext = extOverride || extensionFromPath(href) || ".pdf";
    const preferLabel = (label || "").trim();
    if (preferLabel && !looksLikeUuid(preferLabel)) {
        return downloadFilenameFromLinkLabel(preferLabel, ext);
    }

    const sourcePath = href.trim();
    let title = "";

    try {
        const pathname = /^https?:\/\//i.test(sourcePath)
            ? new URL(sourcePath).pathname
            : sourcePath.startsWith("/")
              ? sourcePath
              : "";
        if (pathname) {
            const decoded = decodeURIComponent(pathname);
            const relMatch =
                decoded.match(/\/uploads\/pc\/(.+)/i) ?? decoded.match(/\/media\/pc\/(.+)/i);
            const fileName = (relMatch?.[1] ?? "").split("/").filter(Boolean).pop() ?? "";
            const stem = fileName.includes(".")
                ? fileName.slice(0, fileName.lastIndexOf("."))
                : fileName;
            title = humanizeSegment(stem);
        }
    } catch {
        /* ignore */
    }

    return downloadFilenameFromLinkLabel(title || "document", ext);
}

export function shouldViewFileInline(fileName: string): boolean {
    const ext = extensionFromPath(fileName).replace(/^\./, "");
    return VIEW_INLINE_EXTS.has(ext);
}

export function parseFilenameFromContentDisposition(header: string | null): string | undefined {
    if (!header) return undefined;
    const star = /filename\*=UTF-8''([^;\n]+)/i.exec(header);
    if (star?.[1]) {
        try {
            return decodeURIComponent(star[1].trim());
        } catch {
            return star[1].trim();
        }
    }
    const quoted = /filename="([^"]+)"/i.exec(header);
    if (quoted?.[1]) return quoted[1].trim();
    const plain = /filename=([^;\n]+)/i.exec(header);
    if (plain?.[1]) return plain[1].trim().replace(/^["']|["']$/g, "");
    return undefined;
}

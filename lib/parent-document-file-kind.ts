/** Match parent-app document rows to the file type expected for each category. */

const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv", ".mpeg", ".mpg", ".3gp", ".flv", ".wmv"]);
const AUDIO_EXT = new Set([".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac", ".wma"]);
const PDF_ONLY_CATEGORIES = new Set([
    "PRESCHOOL_POLICIES",
    "HOLIDAY_LISTS",
    "STUDENT_TRANSFER_POLICY",
    "CONTACT_US",
    "GENERAL_RHYMES",
    "PARENTING_TIPS",
]);
const AUDIO_ONLY_CATEGORIES = new Set(["AUDIO_RHYMES"]);
/** Watch • Hear • Learn — mixed videos, audio, PDFs, and other learning files. */
const MIXED_MEDIA_CATEGORIES = new Set(["VIDEOS"]);

export type ParentDocumentFileKind = "pdf" | "video" | "audio" | "document" | "unknown";

function extensionOf(path: string): string {
    const clean = (path || "").split("?")[0].trim().toLowerCase();
    const dot = clean.lastIndexOf(".");
    return dot >= 0 ? clean.slice(dot) : "";
}

function isVideoUrl(path: string): boolean {
    const lower = path.toLowerCase();
    return (
        lower.includes("youtube.com") ||
        lower.includes("youtu.be") ||
        lower.includes("mediadelivery.net") ||
        lower.includes("vimeo.com") ||
        lower.includes("/embed/") ||
        lower.includes("/shorts/")
    );
}

export function parentDocumentFileKind(filePath: string): ParentDocumentFileKind {
    const path = (filePath || "").trim();
    if (!path) return "unknown";
    if (isVideoUrl(path)) return "video";
    const ext = extensionOf(path);
    if (ext === ".pdf") return "pdf";
    if (VIDEO_EXT.has(ext)) return "video";
    if (AUDIO_EXT.has(ext)) return "audio";
    if (ext) return "document";
    return "unknown";
}

/** True when a stored file belongs in this parent-app category (display + upload rules). */
export function fileMatchesParentDocumentCategory(filePath: string, category: string): boolean {
    const cat = (category || "").trim().toUpperCase();
    if (MIXED_MEDIA_CATEGORIES.has(cat)) return true;
    const kind = parentDocumentFileKind(filePath);
    if (PDF_ONLY_CATEGORIES.has(cat)) return kind === "pdf";
    if (AUDIO_ONLY_CATEGORIES.has(cat)) {
        if (!filePath.trim()) return false;
        return kind === "audio" || kind === "video" || kind === "document" || kind === "unknown";
    }
    if (!filePath.trim()) return true;
    return kind !== "video" && kind !== "audio";
}

export function validateParentDocumentFileForCategory(file: File, category: string): string | null {
    const cat = (category || "").trim().toUpperCase();
    const name = file.name || "File";
    const ext = extensionOf(name);
    const mime = (file.type || "").toLowerCase();

    if (PDF_ONLY_CATEGORIES.has(cat)) {
        if (mime === "application/pdf" || ext === ".pdf") return null;
        return `${name}: this section accepts PDF files only.`;
    }
    if (MIXED_MEDIA_CATEGORIES.has(cat)) {
        return null;
    }
    if (AUDIO_ONLY_CATEGORIES.has(cat)) {
        if (mime.startsWith("audio/") || AUDIO_EXT.has(ext)) return null;
        if (ext === ".mp4" || mime === "video/mp4") return null;
        return `${name}: this section accepts MP3, WAV, MP4, or other audio/video files.`;
    }
    return null;
}

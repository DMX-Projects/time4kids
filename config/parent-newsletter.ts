/** Parent app Newsletter (stored as CLASS_TIMETABLE in the API). */

export const PARENT_NEWSLETTER_CATEGORY = "CLASS_TIMETABLE" as const;

export const PARENT_NEWSLETTER_LABEL = "Newsletter";

export const PARENT_NEWSLETTER_DESCRIPTION =
    "Published for each academic block (20 school days). Each issue covers activities planned and completed during that block — typically a 3–4 page report across all classes, from Play Group to PP2.";

export const PARENT_NEWSLETTER_FILE_ACCEPT =
    ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const PARENT_NEWSLETTER_FILE_HINT = "PDF or Word document";

export const PARENT_NEWSLETTER_UPLOAD_LABEL = "Newsletter Upload – PDF or Word document";

export const PARENT_NEWSLETTER_VIDEO_EMBED_LABEL = "Video link (iframe)";

export const PARENT_NEWSLETTER_VIDEO_EMBED_HINT =
    "For video only (YouTube, Bunny). Do not put MP3/WAV/audio here — use Audio upload below.";

export const PARENT_NEWSLETTER_AUDIO_UPLOAD_LABEL = "Audio upload";

export const PARENT_NEWSLETTER_AUDIO_EXTENSIONS = [
    ".mp3",
    ".wav",
    ".m4a",
    ".ogg",
    ".aac",
    ".flac",
    ".wma",
    ".mp4",
    ".amr",
    ".opus",
    ".caf",
    ".aiff",
    ".aif",
    ".mpeg",
    ".mpg",
    ".3gp",
    ".weba",
    ".webm",
] as const;

export const PARENT_NEWSLETTER_AUDIO_FILE_ACCEPT =
    `${PARENT_NEWSLETTER_AUDIO_EXTENSIONS.join(",")},audio/*,video/mp4`;

export const PARENT_NEWSLETTER_AUDIO_FILE_HINT =
    "MP3, M4A, MP4 (audio recording), WAV, AMR, and other common phone/media audio formats";

export const PARENT_NEWSLETTER_AUDIO_EMBED_LABEL = "Audio link";

export const PARENT_NEWSLETTER_AUDIO_EMBED_HINT =
    "Direct link to an audio file (MP3, M4A, WAV, etc.) — use this or Audio upload, not both at once.";

export const PARENT_NEWSLETTER_EMPTY_MESSAGE =
    "No newsletter uploaded for your centre yet. Your school publishes one per academic block (20 school days).";

export function isNewsletterUploadFile(file: File): boolean {
    const name = file.name.toLowerCase();
    const type = (file.type || "").toLowerCase();
    if (
        name.endsWith(".pdf") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx") ||
        type === "application/pdf" ||
        type === "application/msword" ||
        type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        return true;
    }
    // Allow extensionless / octet-stream picks — backend validates PDF/Word magic bytes.
    if ((type === "application/octet-stream" || type === "") && !name.includes(".")) {
        return true;
    }
    return false;
}

export function validateNewsletterUpload(file: File): string | null {
    if (!isNewsletterUploadFile(file)) {
        return "Newsletter must be a PDF or Word document.";
    }
    return null;
}

export function isNewsletterAudioUploadFile(file: File): boolean {
    const name = file.name.toLowerCase();
    const type = (file.type || "").toLowerCase();
    if (PARENT_NEWSLETTER_AUDIO_EXTENSIONS.some((ext) => name.endsWith(ext))) {
        return true;
    }
    if (type.startsWith("audio/")) {
        return true;
    }
    // Phone voice notes often report as video/mp4 even when audio-only.
    if (type === "video/mp4" && (name.endsWith(".mp4") || name.endsWith(".m4a") || !name.includes("."))) {
        return true;
    }
    if ((type === "application/octet-stream" || type === "") && name.match(/\.(mp3|m4a|mp4|wav|amr|aac|ogg)$/)) {
        return true;
    }
    return false;
}

export function validateNewsletterAudioUpload(file: File): string | null {
    if (!isNewsletterAudioUploadFile(file)) {
        return "Audio must be MP3, M4A, MP4 (audio), WAV, AMR, or another common media audio format.";
    }
    return null;
}

const AUDIO_URL_RE = /\.(mp3|wav|m4a|mp4|ogg|aac|flac|wma|amr|opus|caf|aiff|aif|mpeg|mpg|3gp|weba)(\?|#|$)/i;

/** True when a pasted link is an audio file/URL, not a video embed. */
export function isNewsletterAudioMediaUrl(raw: string): boolean {
    const url = raw.trim().toLowerCase();
    if (!url) return false;
    if (AUDIO_URL_RE.test(url)) return true;
    return url.includes("/audio/") || url.includes("content-type=audio");
}

export function validateNewsletterVideoEmbedUrl(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (isNewsletterAudioMediaUrl(trimmed)) {
        return "That link looks like audio. Use Audio link — not Video link.";
    }
    return null;
}

export function validateNewsletterAudioEmbedUrl(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (!isNewsletterAudioMediaUrl(trimmed)) {
        return "Paste a direct audio file link (MP3, M4A, WAV, etc.) — not a video embed.";
    }
    return null;
}

export type NewsletterRowKind = "document" | "video" | "audio";

/** Reset link fields when the admin switches newsletter media type. */
export function newsletterKindChangePatch(kind: NewsletterRowKind) {
    if (kind === "document") {
        return { newsletter_kind: kind, video_embed_url: "", audio_embed_url: "" };
    }
    if (kind === "video") {
        return { newsletter_kind: kind, audio_embed_url: "" };
    }
    return { newsletter_kind: kind, video_embed_url: "" };
}

/** One media type per newsletter row (legacy combined rows may list multiple). */
export function newsletterRowKind(row: {
    file?: string;
    video_embed_url?: string;
    audio_file?: string;
    audio_embed_url?: string;
}): NewsletterRowKind | "" {
    const hasFile = Boolean((row.file || "").trim());
    const hasVideo = Boolean((row.video_embed_url || "").trim());
    const hasAudio = Boolean((row.audio_file || "").trim() || (row.audio_embed_url || "").trim());
    if (hasFile && !hasVideo && !hasAudio) return "document";
    if (hasVideo && !hasFile && !hasAudio) return "video";
    if (hasAudio && !hasFile && !hasVideo) return "audio";
    if (hasFile) return "document";
    if (hasVideo) return "video";
    if (hasAudio) return "audio";
    return "";
}

export function newsletterKindLabel(kind: NewsletterRowKind | ""): string {
    if (kind === "document") return "PDF / Word";
    if (kind === "video") return "Video";
    if (kind === "audio") return "Audio";
    return "Newsletter";
}

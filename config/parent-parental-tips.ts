/** Parent app — Parental Tips (API category PARENTING_TIPS). */

import type { NewsletterRowKind } from "@/config/parent-newsletter";

export const PARENT_PARENTAL_TIPS_CATEGORY = "PARENTING_TIPS" as const;

export const PARENT_PARENTAL_TIPS_LABEL = "Parental Tips";

export const PARENT_PARENTAL_TIPS_DESCRIPTION =
    "Articles, audio, and videos for parents — published by head office or your centre.";

export const PARENT_PARENTAL_TIPS_EMPTY_MESSAGE =
    "No parental tips yet. Your centre or head office will add articles, audio, and videos here.";

export type ParentalTipsRowKind = NewsletterRowKind;

export {
    PARENT_NEWSLETTER_FILE_ACCEPT as PARENT_PARENTAL_TIPS_FILE_ACCEPT,
    PARENT_NEWSLETTER_FILE_HINT as PARENT_PARENTAL_TIPS_FILE_HINT,
    PARENT_NEWSLETTER_AUDIO_FILE_ACCEPT as PARENT_PARENTAL_TIPS_AUDIO_FILE_ACCEPT,
    PARENT_NEWSLETTER_AUDIO_FILE_HINT as PARENT_PARENTAL_TIPS_AUDIO_FILE_HINT,
    PARENT_NEWSLETTER_VIDEO_EMBED_HINT as PARENT_PARENTAL_TIPS_VIDEO_EMBED_HINT,
    PARENT_NEWSLETTER_AUDIO_EMBED_HINT as PARENT_PARENTAL_TIPS_AUDIO_EMBED_HINT,
    isNewsletterUploadFile as isParentalTipsUploadFile,
    validateNewsletterUpload as validateParentalTipsUpload,
    validateNewsletterAudioUpload as validateParentalTipsAudioUpload,
    validateNewsletterVideoEmbedUrl as validateParentalTipsVideoEmbedUrl,
    validateNewsletterAudioEmbedUrl as validateParentalTipsAudioEmbedUrl,
    newsletterKindLabel as parentalTipsKindLabel,
} from "@/config/parent-newsletter";

export const PARENT_PARENTAL_TIPS_VIDEO_FILE_ACCEPT =
    ".mp4,.webm,.mov,.m4v,.avi,.mkv,.mpeg,.mpg,.3gp,video/*";

export const PARENT_PARENTAL_TIPS_VIDEO_FILE_HINT = "MP4, WebM, MOV, and other common video formats";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv", ".mpeg", ".mpg", ".3gp"];

export function isParentalTipsVideoUploadFile(file: File): boolean {
    const name = file.name.toLowerCase();
    const type = (file.type || "").toLowerCase();
    if (VIDEO_EXTENSIONS.some((ext) => name.endsWith(ext))) return true;
    return type.startsWith("video/");
}

export function validateParentalTipsVideoUpload(file: File): string | null {
    if (!isParentalTipsVideoUploadFile(file)) {
        return "Video must be MP4, WebM, MOV, or another common video format.";
    }
    return null;
}

function filePathLooksLikeVideo(path: string): boolean {
    const clean = (path || "").split("?")[0].toLowerCase();
    return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

/** Reset link fields when switching parental tip media type. */
export function parentalTipsKindChangePatch(kind: ParentalTipsRowKind) {
    if (kind === "document") {
        return { parental_tips_kind: kind, video_embed_url: "", audio_embed_url: "" };
    }
    if (kind === "video") {
        return { parental_tips_kind: kind, audio_embed_url: "" };
    }
    return { parental_tips_kind: kind, video_embed_url: "" };
}

/** One media type per row (legacy combined rows may list multiple). */
export function parentalTipsRowKind(row: {
    file?: string;
    video_embed_url?: string;
    audio_file?: string;
    audio_embed_url?: string;
}): ParentalTipsRowKind | "" {
    const hasFile = Boolean((row.file || "").trim());
    const hasVideoEmbed = Boolean((row.video_embed_url || "").trim());
    const hasAudio = Boolean((row.audio_file || "").trim() || (row.audio_embed_url || "").trim());

    if (hasFile && filePathLooksLikeVideo(row.file || "") && !hasVideoEmbed && !hasAudio) {
        return "video";
    }
    if (hasFile && !hasVideoEmbed && !hasAudio) return "document";
    if (hasVideoEmbed && !hasFile && !hasAudio) return "video";
    if (hasAudio && !hasFile && !hasVideoEmbed) return "audio";
    if (hasFile) return filePathLooksLikeVideo(row.file || "") ? "video" : "document";
    if (hasVideoEmbed) return "video";
    if (hasAudio) return "audio";
    return "";
}

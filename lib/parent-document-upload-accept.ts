import {
    PARENT_NEWSLETTER_CATEGORY,
    PARENT_NEWSLETTER_FILE_ACCEPT,
    PARENT_NEWSLETTER_FILE_HINT,
} from "@/config/parent-newsletter";
import { validateParentDocumentFileForCategory } from "@/lib/parent-document-file-kind";

/** File input `accept` string per parent app document category. */
export function acceptForParentDocumentCategory(category: string): string | undefined {
    switch (category) {
        case PARENT_NEWSLETTER_CATEGORY:
            return PARENT_NEWSLETTER_FILE_ACCEPT;
        case "PRESCHOOL_POLICIES":
            return ".pdf,application/pdf";
        case "AUDIO_RHYMES":
            return ".mp3,.wav,.m4a,.ogg,.mp4,audio/*,video/mp4";
        case "VIDEOS":
            return ".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.mp3,.wav,.m4a,.mp4,.webm,.mov,video/*,audio/*";
        case "HOLIDAY_LISTS":
            return ".pdf,application/pdf";
        default:
            return ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp3,.mp4,.zip";
    }
}

export function uploadHintForParentDocumentCategory(category: string): string {
    switch (category) {
        case "AUDIO_RHYMES":
            return "MP3, WAV, MP4, or other audio/video files";
        case "VIDEOS":
            return "Videos, audio, PDFs, images, and documents";
        case PARENT_NEWSLETTER_CATEGORY:
            return PARENT_NEWSLETTER_FILE_HINT;
        case "PRESCHOOL_POLICIES":
        case "HOLIDAY_LISTS":
            return "PDF files";
        default:
            return "PDF, documents, images, audio, or video";
    }
}

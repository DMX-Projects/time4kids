/** File input `accept` string per parent app document category. */
export function acceptForParentDocumentCategory(category: string): string | undefined {
    switch (category) {
        case "CLASS_TIMETABLE":
        case "PRESCHOOL_POLICIES":
            return ".pdf,application/pdf";
        case "AUDIO_RHYMES":
            return ".mp3,.wav,.m4a,.ogg,audio/*";
        case "VIDEOS":
            return ".mp4,.webm,.mov,video/*";
        case "HOLIDAY_LISTS":
            return ".pdf,application/pdf";
        default:
            return ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp3,.mp4,.zip";
    }
}

export function uploadHintForParentDocumentCategory(category: string): string {
    const limits = "Images max 15 MB · videos 50 MB · other files 25 MB";
    switch (category) {
        case "AUDIO_RHYMES":
            return `MP3, WAV, or other audio files (${limits})`;
        case "VIDEOS":
            return `MP4 or other video files (max 50 MB)`;
        case "CLASS_TIMETABLE":
        case "PRESCHOOL_POLICIES":
        case "HOLIDAY_LISTS":
            return "PDF files (max 25 MB)";
        default:
            return `PDF, documents, images, audio, or video (${limits})`;
    }
}

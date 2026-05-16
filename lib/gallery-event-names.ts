/** Strip trailing ` - 1` or ` 1` from media upload titles before grouping albums. */
export function extractGalleryEventKey(title: string): string {
    const trimmed = title.trim();
    const dashSuffix = trimmed.match(/^(.+?)\s*-\s*\d+$/);
    if (dashSuffix) return dashSuffix[1].trim();
    const spaceSuffix = trimmed.match(/^(.+?)\s+\d+$/);
    if (spaceSuffix) return spaceSuffix[1].trim();
    return trimmed;
}

/** Display name for media-library albums on `/gallery` (groups items by upload title prefix). */
export function formatGalleryEventName(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return trimmed;

    const key = trimmed.toLowerCase().replace(/\s+/g, " ");
    if (
        key === "home franchise video poster" ||
        key.startsWith("home franchise video poster ") ||
        key === "franchise videos and posters" ||
        key.startsWith("franchise videos and posters ")
    ) {
        return "Franchise Videos and Posters";
    }

    if (
        key === "homepage program: play group" ||
        key.startsWith("homepage program: play group ") ||
        key === "admission videos and posters" ||
        key.startsWith("admission videos and posters ")
    ) {
        return "Admission Videos and Posters";
    }

    return trimmed
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

/** Title sent when uploading franchise video thumbnails to the media library. */
export function franchiseVideoPosterUploadTitle(index: number): string {
    return `Franchise Videos and Posters ${index + 1}`;
}

/** Media library title for homepage program preview uploads (Play Group → admission album). */
export function programsPreviewUploadTitle(programName: string): string {
    if (programName.trim().toLowerCase() === "play group") {
        return "Admission Videos and Posters";
    }
    return `Homepage program: ${programName}`;
}

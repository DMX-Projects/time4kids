import {
    mediaUrl,
    normalizeUploadedMediaPath,
    schoolGalleryMediaUrl,
    toPublicCmsMediaPath,
} from "@/lib/api-client";

/** Ordered URLs for public gallery thumbnails (same paths as lightbox, plus fallbacks). */
export function galleryMediaCandidates(path?: string | null): string[] {
    const raw = (path || "").trim();
    if (!raw) return [];

    const out: string[] = [];
    const push = (url: string) => {
        const t = url.trim();
        if (t && !out.includes(t)) out.push(t);
    };

    if (/^https?:\/\//i.test(raw)) {
        push(raw);
        try {
            const pathname = new URL(raw).pathname;
            push(schoolGalleryMediaUrl(pathname));
            push(toPublicCmsMediaPath(pathname));
            push(pathname);
        } catch {
            /* keep absolute only */
        }
        return out;
    }

    push(schoolGalleryMediaUrl(raw));
    push(mediaUrl(raw));
    const pathname = normalizeUploadedMediaPath(raw);
    push(toPublicCmsMediaPath(pathname));
    if (pathname.startsWith("/media/")) push(pathname);
    if (raw.startsWith("/") && !raw.startsWith("/media/") && !raw.startsWith("/cms-media/")) {
        push(raw);
    }
    return out;
}

/** Primary URL for gallery lightbox (first candidate). */
export function galleryMediaUrl(path?: string | null): string {
    return galleryMediaCandidates(path)[0] || mediaUrl(path) || "";
}

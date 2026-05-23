/**
 * Event gallery media: signed-style URLs via API so `<img>` / `<video>` work when
 * public `/media/…` on the Next host does not serve Django uploads.
 */

import { apiUrl, publicStaticFallbackForMediaPath, schoolGalleryMediaUrl } from "@/lib/api-client";
import { downloadFilenameFromLinkLabel, extensionFromPath } from "@/lib/franchise-download-filename";

/** Ordered playback URLs: stream API → `/public` marketing file → `/cms-media` proxy. */
export function resolveEventMediaPlaybackSources(options: {
    filePath: string;
    mediaId?: number;
    centreSlug?: string;
    accessToken?: string | null;
    caption?: string;
}): string[] {
    const filePath = (options.filePath || "").trim();
    const mediaId = options.mediaId;
    const slug = (options.centreSlug || "").trim();
    const token = (options.accessToken || "").trim();
    const out: string[] = [];
    const push = (url: string) => {
        const u = url.trim();
        if (u && !out.includes(u)) out.push(u);
    };

    if (token && mediaId != null && Number.isFinite(mediaId)) {
        const signed = buildEventMediaFileViewUrl(token, mediaId, {
            caption: options.caption || "",
            filePath,
        });
        if (signed) push(signed);
    }
    if (slug && mediaId != null && Number.isFinite(mediaId)) {
        push(buildPublicEventMediaFileUrl(slug, mediaId));
    }
    const publicFb = publicStaticFallbackForMediaPath(filePath);
    if (publicFb) push(publicFb);
    const cms = schoolGalleryMediaUrl(filePath);
    if (cms) push(cms);

    return out;
}

/** Public centre page — streams via Django (no JWT). */
export function buildPublicEventMediaFileUrl(centreSlug: string, mediaId: number): string {
    const slug = centreSlug.trim();
    return apiUrl(`/events/public/${encodeURIComponent(slug)}/media/${mediaId}/file/`);
}

export function buildEventMediaFileViewUrl(
    accessToken: string,
    mediaId: number,
    options: { caption?: string; filePath: string },
): string | null {
    const token = accessToken.trim();
    if (!token) return null;
    const label = (options.caption || `media-${mediaId}`).trim() || "media";
    const ext = extensionFromPath(options.filePath);
    const name = downloadFilenameFromLinkLabel(label, ext || undefined);
    const params = new URLSearchParams();
    params.set("access", token);
    params.set("name", name);
    return `${apiUrl(`/events/media/${mediaId}/file/`)}?${params}`;
}

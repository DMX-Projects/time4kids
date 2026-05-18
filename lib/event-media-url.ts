/**
 * Event gallery media: signed-style URLs via API so `<img>` / `<video>` work when
 * public `/media/…` on the Next host does not serve Django uploads.
 */

import { apiUrl } from "@/lib/api-client";
import { downloadFilenameFromLinkLabel, extensionFromPath } from "@/lib/franchise-download-filename";

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

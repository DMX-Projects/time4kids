/**
 * Persist Event Gallery video embed links inside the existing event `description` field
 * (no events API schema change). Hidden HTML comment — stripped from user-facing notes.
 */

export type EventVideoLink = {
    id: string;
    url: string;
    title?: string;
    description?: string;
};

const MARKER_RE = /<!--TK_EVENT_VIDEO_LINKS:([\s\S]*?)-->/;

export const EVENT_VIDEO_LINK_ID_PREFIX = "evl-";

export function isEventVideoLinkMediaId(id: string): boolean {
    return id.startsWith(EVENT_VIDEO_LINK_ID_PREFIX);
}

export function parseEventVideoLinks(description: string | null | undefined): EventVideoLink[] {
    const raw = (description || "").trim();
    const m = raw.match(MARKER_RE);
    if (!m?.[1]) return [];
    try {
        const parsed = JSON.parse(m[1]) as unknown;
        if (!Array.isArray(parsed)) return [];
        const out: EventVideoLink[] = [];
        for (const row of parsed) {
            if (!row || typeof row !== "object") continue;
            const r = row as Record<string, unknown>;
            const url = String(r.url || "").trim();
            if (!url) continue;
            const rawId = String(r.id || "").trim() || `${EVENT_VIDEO_LINK_ID_PREFIX}${Date.now()}`;
            const link: EventVideoLink = {
                id: rawId.startsWith(EVENT_VIDEO_LINK_ID_PREFIX) ? rawId : `${EVENT_VIDEO_LINK_ID_PREFIX}${rawId}`,
                url,
            };
            if (r.title) link.title = String(r.title);
            if (r.description) link.description = String(r.description);
            out.push(link);
        }
        return out;
    } catch {
        return [];
    }
}

export function stripEventVideoLinks(description: string | null | undefined): string {
    return (description || "").replace(MARKER_RE, "").trim();
}

export function embedEventVideoLinks(
    visibleNotes: string | null | undefined,
    links: EventVideoLink[],
): string {
    const notes = (visibleNotes || "").trim();
    const clean = stripEventVideoLinks(notes);
    const valid = links.filter((l) => l.url?.trim());
    if (valid.length === 0) return clean;
    const payload = JSON.stringify(
        valid.map((l) => ({
            id: l.id,
            url: l.url.trim(),
            ...(l.title?.trim() ? { title: l.title.trim() } : {}),
            ...(l.description?.trim() ? { description: l.description.trim() } : {}),
        })),
    );
    const marker = `<!--TK_EVENT_VIDEO_LINKS:${payload}-->`;
    return clean ? `${clean}\n${marker}` : marker;
}

/** Stable negative id for public gallery rows (API media ids are positive). */
export function eventVideoLinkGalleryId(linkId: string): number {
    let h = 0;
    for (let i = 0; i < linkId.length; i++) {
        h = (Math.imul(31, h) + linkId.charCodeAt(i)) | 0;
    }
    const n = Math.abs(h) || 1;
    return -n;
}

export type EventWithDescriptionAndMedia = {
    id: number;
    description?: string;
    media: { id: number; file: string; media_type: "IMAGE" | "VIDEO" | "URL"; caption: string }[];
};

/** Merge embed/link videos from event description into `media` for centre-page gallery. */
export function mergeEventGalleryVideoLinks<T extends EventWithDescriptionAndMedia>(events: T[]): T[] {
    return events.map((ev) => {
        const links = parseEventVideoLinks(ev.description);
        if (links.length === 0) return ev;
        const extra = links.map((link) => ({
            id: eventVideoLinkGalleryId(link.id),
            file: link.url.trim(),
            media_type: "URL" as const,
            caption: link.description?.trim() || link.title?.trim() || "Video",
        }));
        return { ...ev, media: [...ev.media, ...extra] };
    });
}

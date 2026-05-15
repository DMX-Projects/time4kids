import { VIRTUAL_TOUR_MAPS_URL } from "@/config/home-page-defaults";

export function isGoogleMapsEmbedUrl(href: string): boolean {
    return /google\.com\/maps\/embed/i.test(href.trim());
}

/** Pull `src="..."` when admin pastes a full `<iframe>` tag from the server. */
export function extractIframeSrc(value: string): string {
    const trimmed = value.trim();
    const match = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (match?.[1]) return match[1].trim();
    return trimmed;
}

/** Any https embed URL suitable for VirtualTourModal (not PDFs or internal routes). */
export function isEmbeddableTourUrl(href: string): boolean {
    const u = extractIframeSrc(href);
    if (!/^https?:\/\//i.test(u)) return false;
    if (/\.pdf(\?|#|$)/i.test(u)) return false;
    if (isGoogleMapsEmbedUrl(u)) return true;
    if (/iframe\.mediadelivery\.net\/embed\//i.test(u)) return true;
    if (/youtube\.com\/embed\//i.test(u) || /youtu\.be\//i.test(u)) return true;
    if (/player\.vimeo\.com\//i.test(u)) return true;
    if (/\/embed\//i.test(u)) return true;
    return false;
}

export function isVirtualTourNavItem(item: {
    href: string;
    label?: string;
    alt?: string;
    icon?: string;
}): boolean {
    const lab = (item.label || "").replace(/\s+/g, " ").trim().toLowerCase();
    const alt = (item.alt || "").trim().toLowerCase();
    const icon = (item.icon || "").trim().toLowerCase();
    if (icon.endsWith("icon-tour.png")) return true;
    if (/^virtual\s*tour$/i.test(lab) || alt.includes("virtual tour")) return true;
    return isGoogleMapsEmbedUrl(item.href);
}

/** CMS key-nav href, marketing-asset link, or default Street View embed. */
export function resolveVirtualTourEmbedUrl(href?: string | null): string {
    const extracted = extractIframeSrc((href || "").trim());
    if (extracted && isEmbeddableTourUrl(extracted)) return extracted;
    return VIRTUAL_TOUR_MAPS_URL;
}

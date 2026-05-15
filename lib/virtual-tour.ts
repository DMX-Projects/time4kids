import { VIRTUAL_TOUR_MAPS_URL } from "@/config/home-page-defaults";

export function isGoogleMapsEmbedUrl(href: string): boolean {
    return /google\.com\/maps\/embed/i.test(href.trim());
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

export function resolveVirtualTourEmbedUrl(href?: string | null): string {
    const trimmed = (href || "").trim();
    if (trimmed && isGoogleMapsEmbedUrl(trimmed)) return trimmed;
    return VIRTUAL_TOUR_MAPS_URL;
}

import { toCanonicalPublicHref } from "@/config/site-public";
import { mediaUrl } from "@/lib/api-client";

export type MarketingAssetRecord = {
    slug: string;
    title?: string;
    file?: string | null;
    link?: string | null;
    is_active?: boolean;
};

/** Public URL for a marketing asset file or external link (opens in browser). */
export function marketingAssetHref(asset?: MarketingAssetRecord | null, fallback?: string): string {
    if (!asset) return resolveMarketingHref(fallback);
    const file = (asset.file || "").trim();
    if (file) return mediaUrl(file);
    const link = (asset.link || "").trim();
    if (link) return resolveMarketingHref(link);
    return resolveMarketingHref(fallback);
}

function resolveMarketingHref(href?: string | null): string {
    const value = (href || "").trim();
    if (!value) return "#";
    if (/^https?:\/\//i.test(value)) return toCanonicalPublicHref(value) || "#";
    if (value.startsWith("/media/") || value.startsWith("media/")) return mediaUrl(value);
    return value;
}

export function findMarketingAsset(assets: MarketingAssetRecord[], slug: string) {
    return assets.find((a) => a.slug === slug);
}

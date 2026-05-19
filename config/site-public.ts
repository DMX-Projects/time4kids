/**
 * Public marketing site (production). Staging hosts (e.g. timekids1.t4e.in) are rewritten here.
 * Set NEXT_PUBLIC_CANONICAL_SITE_URL in production builds.
 */
export const CANONICAL_SITE_ORIGIN = (
    process.env.NEXT_PUBLIC_CANONICAL_SITE_URL || "https://www.timekidspreschools.in"
).replace(/\/$/, "");

/** Public PDFs served via Django `/api/cms-files/…` on live. */
export const ADMISSION_BROCHURE_PDF_URL = `${CANONICAL_SITE_ORIGIN}/api/cms-files/pc/admission-brochure/admission-brochure.pdf`;
export const FRANCHISE_BROCHURE_PDF_URL = `${CANONICAL_SITE_ORIGIN}/api/cms-files/pc/franchise-brochure/franchise-brochure.pdf`;

/** Hostnames that should never appear in user-facing links. */
const STAGING_HOST_PATTERNS = [/^timekids1\.t4e\.in$/i, /\.t4e\.in$/i];

export function isStagingPublicHost(hostname: string): boolean {
    const host = (hostname || "").toLowerCase();
    return STAGING_HOST_PATTERNS.some((re) => re.test(host));
}

/** Rewrite staging / alternate API hosts to the main public site. */
export function toCanonicalPublicHref(href?: string | null): string {
    const value = (href || "").trim();
    if (!value) return "";
    if (!/^https?:\/\//i.test(value)) return value;
    try {
        const u = new URL(value);
        if (isStagingPublicHost(u.hostname)) {
            return `${CANONICAL_SITE_ORIGIN}${u.pathname}${u.search}${u.hash}`;
        }
    } catch {
        /* keep original */
    }
    return value;
}

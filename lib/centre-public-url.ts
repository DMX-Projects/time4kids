/** Build the public centre page path used by `/locations/[city]/[school]/`. */
export function centrePublicPagePath(city: string, franchiseSlug: string): string {
    const citySeg = encodeURIComponent((city || "").trim() || "centre");
    const schoolSeg = encodeURIComponent((franchiseSlug || "").trim());
    return `/locations/${citySeg}/${schoolSeg}/`;
}

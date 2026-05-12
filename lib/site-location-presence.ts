/**
 * Home "Our Presence" ladder: max Hyderabad / Secunderabad preschool tiles.
 */
export const OUR_PRESENCE_HYDERABAD_CENTRE_LIMIT = 15;

/**
 * /locations index and legacy caps: Telangana, Bengaluru, Andhra Pradesh cities.
 */
export const PRESENCE_SECTION_CITY_LIMIT = 15;

/** Karnataka: only Bengaluru metro (not all KA cities). */
export function matchesBangaloreMetroCity(cityName: string): boolean {
    const n = cityName.toLowerCase().trim();
    return n.includes("bangalore") || n.includes("bengaluru");
}

export function matchesHyderabadMetroCity(cityName: string): boolean {
    const n = cityName.toLowerCase().trim();
    return n.includes("hyderabad") || n.includes("secunderabad");
}

/**
 * True if this row should appear in Our Presence / locations index.
 * - All active cities in Andhra Pradesh (AP) and Telangana (TG)
 * - Bengaluru / Bangalore only in Karnataka (KA)
 */
export function matchesPresenceSectionLocation(stateCode: string, cityName: string): boolean {
    const s = (stateCode || "").toUpperCase().trim();
    const city = (cityName || "").trim();
    if (!city) return false;
    if (s === "AP" || s === "TG") return true;
    if (s === "KA") return matchesBangaloreMetroCity(city);
    return false;
}

/** Lower rank sorts first (featured cities). */
export function presenceSectionSortRank(cityName: string): number {
    const n = cityName.toLowerCase().trim();
    if (n.includes("hyderabad")) return 0;
    if (n.includes("secunderabad")) return 1;
    if (matchesBangaloreMetroCity(n)) return 2;
    return 10;
}

export function comparePresenceCities(aName: string, bName: string): number {
    const ra = presenceSectionSortRank(aName);
    const rb = presenceSectionSortRank(bName);
    if (ra !== rb) return ra - rb;
    return aName.localeCompare(bName, undefined, { sensitivity: "base" });
}

/** When user filters locate-centre by these regions, cap how many centres we list. */
export function shouldCapLocateCentreResults(stateCode: string, cityName: string): boolean {
    const s = (stateCode || "").toUpperCase().trim();
    const c = cityName || "";
    if (s === "AP" || s === "TG") return true;
    if (s === "KA" && matchesBangaloreMetroCity(c)) return true;
    return matchesHyderabadMetroCity(c) || matchesBangaloreMetroCity(c);
}

/**
 * Cities shown on the home page “Our Presence” strip (legacy timekids PHP footer style).
 * `hrefCity` is passed to `/locations/[city]/` and the API as `?city=` — it must match
 * `Franchise.city` in your database (filter is case-insensitive exact match).
 */
export type PresenceCityTile = {
    /** Shown on the pill */
    label: string;
    /** Query segment + API city filter */
    hrefCity: string;
};

const RAW: PresenceCityTile[] = [
    { label: "Alleppey", hrefCity: "Alleppey" },
    { label: "Arcot", hrefCity: "Arcot" },
    { label: "Barasat", hrefCity: "Barasat" },
    { label: "Belgaum", hrefCity: "Belgaum" },
    { label: "Bengaluru (Bangalore)", hrefCity: "Bengaluru" },
    { label: "Bhadohi", hrefCity: "Bhadohi" },
    { label: "Bhadrak", hrefCity: "Bhadrak" },
    { label: "Bhubaneswar", hrefCity: "Bhubaneswar" },
    { label: "Chengalpattu", hrefCity: "Chengalpattu" },
    { label: "Chennai", hrefCity: "Chennai" },
    { label: "Coimbatore", hrefCity: "Coimbatore" },
    { label: "Ernakulam", hrefCity: "Ernakulam" },
    { label: "Guntakal", hrefCity: "Guntakal" },
    { label: "Guntur", hrefCity: "Guntur" },
    { label: "Hooghly", hrefCity: "Hooghly" },
    { label: "Hosur", hrefCity: "Hosur" },
    { label: "Howrah", hrefCity: "Howrah" },
    { label: "Hyderabad", hrefCity: "Hyderabad" },
    { label: "Idukki", hrefCity: "Idukki" },
    { label: "Jamnagar", hrefCity: "Jamnagar" },
    { label: "Kanchipuram", hrefCity: "Kanchipuram" },
    { label: "Kasargod", hrefCity: "Kasargod" },
    { label: "Keeranur", hrefCity: "Keeranur" },
    { label: "Kolkata", hrefCity: "Kolkata" },
    { label: "Kollam", hrefCity: "Kollam" },
    { label: "Kottayam", hrefCity: "Kottayam" },
    { label: "Kozhikode", hrefCity: "Kozhikode" },
    { label: "Lucknow", hrefCity: "Lucknow" },
    { label: "Malappuram", hrefCity: "Malappuram" },
    { label: "Mysore", hrefCity: "Mysore" },
    { label: "Namakkal", hrefCity: "Namakkal" },
    { label: "Nizamabad", hrefCity: "Nizamabad" },
    { label: "Palakkad", hrefCity: "Palakkad" },
    { label: "Paramakudi", hrefCity: "Paramakudi" },
    { label: "Pathanamthitta", hrefCity: "Pathanamthitta" },
    { label: "Patna", hrefCity: "Patna" },
    { label: "Pudukkottai", hrefCity: "Pudukkottai" },
    { label: "Pune", hrefCity: "Pune" },
    { label: "Rajapalayam", hrefCity: "Rajapalayam" },
    { label: "Ramanathapuram", hrefCity: "Ramanathapuram" },
    { label: "Rangareddy District", hrefCity: "Rangareddy District" },
    { label: "Ranipet District", hrefCity: "Ranipet District" },
    { label: "Ratlam", hrefCity: "Ratlam" },
    { label: "Salem", hrefCity: "Salem" },
    { label: "Secunderabad", hrefCity: "Secunderabad" },
    { label: "Sethumadai", hrefCity: "Sethumadai" },
    { label: "Sivagangai", hrefCity: "Sivagangai" },
    { label: "Thiruninravur", hrefCity: "Thiruninravur" },
    { label: "Thiruthangal", hrefCity: "Thiruthangal" },
    { label: "Thrissur", hrefCity: "Thrissur" },
    { label: "Trichy", hrefCity: "Trichy" },
    { label: "Trivandrum", hrefCity: "Trivandrum" },
    { label: "Vallioor", hrefCity: "Vallioor" },
    { label: "Vellore", hrefCity: "Vellore" },
    { label: "Visakhapatnam", hrefCity: "Visakhapatnam" },
    { label: "Walajabad", hrefCity: "Walajabad" },
    { label: "Wanaparthy", hrefCity: "Wanaparthy" },
    { label: "Zirakpur", hrefCity: "Zirakpur" },
];

/** Dedupe by hrefCity, then sort by label for stable layout */
const byCity = new Map<string, PresenceCityTile>();
for (const row of RAW) {
    const key = row.hrefCity.trim().toLowerCase();
    if (!key) continue;
    if (!byCity.has(key)) byCity.set(key, row);
}

export const OUR_PRESENCE_CITY_TILES: PresenceCityTile[] = Array.from(byCity.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
);

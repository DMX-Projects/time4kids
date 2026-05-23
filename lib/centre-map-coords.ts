/** Resolve lat/lng for Locate a Centre map pins (DB coords → Google link → city centroid). */

/** Leaflet bounds — mainland India + nearby islands (Locate a Centre map). */
export const INDIA_MAP_SW: [number, number] = [6.0, 68.05];
export const INDIA_MAP_NE: [number, number] = [37.15, 97.45];
export const INDIA_MAP_CENTER: [number, number] = [20.5937, 78.9629];
export const INDIA_MAP_DEFAULT_ZOOM = 5;
export const INDIA_MAP_MIN_ZOOM = 5;

export function isCoordInIndia(lat: number, lng: number): boolean {
    return (
        lat >= INDIA_MAP_SW[0] &&
        lat <= INDIA_MAP_NE[0] &&
        lng >= INDIA_MAP_SW[1] &&
        lng <= INDIA_MAP_NE[1]
    );
}

export type CentreMapPin = {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    googleMapLink?: string | null;
    latitude?: number | null;
    longitude?: number | null;
};

export type ResolvedCentrePosition = {
    lat: number;
    lng: number;
    precision: "exact" | "link" | "city";
};

/** Parse coordinates embedded in Google Maps URLs. */
export function parseGoogleMapLinkCoords(link?: string | null): { lat: number; lng: number } | null {
    const raw = (link || "").trim();
    if (!raw) return null;

    const atMatch = raw.match(/@(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (atMatch) {
        const lat = parseFloat(atMatch[1]);
        const lng = parseFloat(atMatch[2]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }

    const qMatch = raw.match(/[?&]q=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (qMatch) {
        const lat = parseFloat(qMatch[1]);
        const lng = parseFloat(qMatch[2]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }

    const dMatch = raw.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (dMatch) {
        const lat = parseFloat(dMatch[1]);
        const lng = parseFloat(dMatch[2]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }

    return null;
}

function normalizeCityKey(city: string): string {
    return city
        .toLowerCase()
        .trim()
        .replace(/\s+district$/i, "")
        .replace(/\s+/g, " ")
        .replace(/[^a-z0-9\s]/g, "");
}

/** Approximate city centres (India) — used when franchise lat/lng are unset. */
const CITY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
    hyderabad: { lat: 17.385, lng: 78.4867 },
    secunderabad: { lat: 17.4399, lng: 78.4983 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    bengaluru: { lat: 12.9716, lng: 77.5946 },
    bangalore: { lat: 12.9716, lng: 77.5946 },
    coimbatore: { lat: 11.0168, lng: 76.9558 },
    ernakulam: { lat: 9.9312, lng: 76.2673 },
    kochi: { lat: 9.9312, lng: 76.2673 },
    palakkad: { lat: 10.7867, lng: 76.6548 },
    trivandrum: { lat: 8.5241, lng: 76.9366 },
    thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
    pune: { lat: 18.5204, lng: 73.8567 },
    kottayam: { lat: 9.5916, lng: 76.5222 },
    kolkata: { lat: 22.5726, lng: 88.3639 },
    thrissur: { lat: 10.5276, lng: 76.2144 },
    pudukkottai: { lat: 10.3797, lng: 78.8208 },
    kollam: { lat: 8.8932, lng: 76.6141 },
    patna: { lat: 25.5941, lng: 85.1376 },
    trichy: { lat: 10.7905, lng: 78.7047 },
    tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
    madurai: { lat: 9.9252, lng: 78.1198 },
    salem: { lat: 11.6643, lng: 78.146 },
    visakhapatnam: { lat: 17.6868, lng: 83.2185 },
    vijayawada: { lat: 16.5062, lng: 80.648 },
    mumbai: { lat: 19.076, lng: 72.8777 },
    delhi: { lat: 28.6139, lng: 77.209 },
    newdelhi: { lat: 28.6139, lng: 77.209 },
    ahmedabad: { lat: 23.0225, lng: 72.5714 },
    jaipur: { lat: 26.9124, lng: 75.7873 },
    lucknow: { lat: 26.8467, lng: 80.9462 },
    nagpur: { lat: 21.1458, lng: 79.0882 },
    indore: { lat: 22.7196, lng: 75.8577 },
    bhopal: { lat: 23.2599, lng: 77.4126 },
    surat: { lat: 21.1702, lng: 72.8311 },
    rajahmundry: { lat: 17.0005, lng: 81.804 },
    warangal: { lat: 17.9689, lng: 79.5941 },
    guntur: { lat: 16.3067, lng: 80.4365 },
    nellore: { lat: 14.4426, lng: 79.9865 },
    mangalore: { lat: 12.9141, lng: 74.856 },
    mysuru: { lat: 12.2958, lng: 76.6394 },
    mysore: { lat: 12.2958, lng: 76.6394 },
    hubli: { lat: 15.3647, lng: 75.124 },
    belagavi: { lat: 15.8497, lng: 74.4977 },
    belgaum: { lat: 15.8497, lng: 74.4977 },
    calicut: { lat: 11.2588, lng: 75.7804 },
    kozhikode: { lat: 11.2588, lng: 75.7804 },
    kannur: { lat: 11.8745, lng: 75.3704 },
    alappuzha: { lat: 9.4981, lng: 76.3388 },
    alleppey: { lat: 9.4981, lng: 76.3388 },
    arcot: { lat: 12.906, lng: 79.108 },
    barasat: { lat: 22.721, lng: 88.481 },
    bhadohi: { lat: 25.387, lng: 82.568 },
    bhadrak: { lat: 21.057, lng: 86.515 },
    bhubaneswar: { lat: 20.296, lng: 85.824 },
    chengalpattu: { lat: 12.692, lng: 79.976 },
    guntakal: { lat: 15.167, lng: 77.378 },
    hooghly: { lat: 22.908, lng: 88.396 },
    hosur: { lat: 12.741, lng: 77.825 },
    howrah: { lat: 22.595, lng: 88.263 },
    idukki: { lat: 9.918, lng: 76.944 },
    jamnagar: { lat: 22.47, lng: 70.057 },
    kanchipuram: { lat: 12.834, lng: 79.704 },
    kasargod: { lat: 12.499, lng: 74.986 },
    keeranur: { lat: 10.573, lng: 78.792 },
    malappuram: { lat: 11.051, lng: 76.071 },
    namakkal: { lat: 11.219, lng: 78.167 },
    nizamabad: { lat: 18.672, lng: 78.094 },
    paramakudi: { lat: 9.548, lng: 78.59 },
    pathanamthitta: { lat: 9.265, lng: 76.787 },
    rajapalayam: { lat: 9.452, lng: 77.553 },
    ramanathapuram: { lat: 9.363, lng: 78.835 },
    rangareddy: { lat: 17.385, lng: 78.4867 },
    ranipet: { lat: 12.927, lng: 79.332 },
    ratlam: { lat: 23.331, lng: 75.037 },
    sethumadai: { lat: 10.85, lng: 76.95 },
    sivagangai: { lat: 9.843, lng: 78.481 },
    thiruninravur: { lat: 13.118, lng: 80.026 },
    thiruthangal: { lat: 9.483, lng: 77.833 },
    vallioor: { lat: 8.382, lng: 77.611 },
    vellore: { lat: 12.916, lng: 79.132 },
    walajabad: { lat: 12.8, lng: 79.82 },
    wanaparthy: { lat: 16.361, lng: 78.068 },
    zirakpur: { lat: 30.642, lng: 76.817 },
};

const CITY_ALIASES: Record<string, string> = {
    "new delhi": "newdelhi",
    "bengaluru urban": "bengaluru",
    "bangalore urban": "bangalore",
    alleppey: "alleppey",
    "rangareddy district": "rangareddy",
    "ranipet district": "ranipet",
};

function cityCentroid(city: string, state: string): { lat: number; lng: number } | null {
    const key = normalizeCityKey(city).replace(/\s/g, "");
    const alias = CITY_ALIASES[normalizeCityKey(city)] || key;
    if (CITY_CENTROIDS[alias]) return CITY_CENTROIDS[alias];
    if (CITY_CENTROIDS[key]) return CITY_CENTROIDS[key];

    const stateKey = normalizeCityKey(state).replace(/\s/g, "");
    if (stateKey === "telangana" || stateKey === "tg") return CITY_CENTROIDS.hyderabad;
    if (stateKey === "tamilnadu" || stateKey === "tn") return CITY_CENTROIDS.chennai;
    if (stateKey === "karnataka" || stateKey === "ka") return CITY_CENTROIDS.bengaluru;
    if (stateKey === "kerala" || stateKey === "kl") return CITY_CENTROIDS.ernakulam;
    if (stateKey === "maharashtra" || stateKey === "mh") return CITY_CENTROIDS.pune;
    if (stateKey === "westbengal" || stateKey === "wb") return CITY_CENTROIDS.kolkata;

    return null;
}

/** Spread pins in the same city so they do not stack on one dot. */
export function jitterForCentreId(lat: number, lng: number, id: number): { lat: number; lng: number } {
    const angle = ((id * 137.508) % 360) * (Math.PI / 180);
    const radius = 0.012 + (id % 7) * 0.002;
    return {
        lat: lat + radius * Math.cos(angle),
        lng: lng + radius * Math.sin(angle),
    };
}

export function resolveCentreMapPosition(centre: CentreMapPin): ResolvedCentrePosition | null {
    const lat = centre.latitude != null ? Number(centre.latitude) : NaN;
    const lng = centre.longitude != null ? Number(centre.longitude) : NaN;
    if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) {
        return { lat, lng, precision: "exact" };
    }

    const fromLink = parseGoogleMapLinkCoords(centre.googleMapLink);
    if (fromLink) {
        return { ...fromLink, precision: "link" };
    }

    const city = cityCentroid(centre.city, centre.state);
    if (city) {
        const jittered = jitterForCentreId(city.lat, city.lng, centre.id);
        return { ...jittered, precision: "city" };
    }

    return null;
}

export function resolveCentreMapPositions(centres: CentreMapPin[]) {
    return centres
        .map((centre) => {
            const position = resolveCentreMapPosition(centre);
            if (!position) return null;
            return { centre, position };
        })
        .filter((row): row is { centre: CentreMapPin; position: ResolvedCentrePosition } => row !== null);
}

import { OUR_PRESENCE_CITY_TILES } from '@/config/our-presence-cities';
import { comparePresenceCities } from '@/lib/site-location-presence';

export type CityTile = { label: string; hrefCity: string };

export type FranchiseCityFetchResult = {
    tiles: CityTile[];
    fromDatabase: boolean;
};

type LocationRow = { city_name?: string; city?: string };

export function locationRowsToCityTiles(rows: LocationRow[]): CityTile[] {
    return rows
        .map((loc) => {
            const name = (loc.city_name || loc.city || '').trim();
            return name ? { label: name, hrefCity: name } : null;
        })
        .filter((t): t is CityTile => t !== null)
        .sort((a, b) => comparePresenceCities(a.hrefCity, b.hrefCity));
}

function djangoApiOrigins(): string[] {
    const candidates = [
        process.env.INTERNAL_API_URL,
        process.env.DJANGO_DEV_BACKEND_URL,
        process.env.NEXT_PUBLIC_API_URL,
        (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api\/?$/i, ''),
    ];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of candidates) {
        const base = (raw || '').trim().replace(/\/$/, '');
        if (!base || seen.has(base)) continue;
        seen.add(base);
        out.push(base);
    }
    if (!out.length) out.push('http://127.0.0.1:8000');
    return out;
}

/** Next dev/production: hit same host `/api` rewrite → Django. */
function nextProxyOrigins(): string[] {
    const port = (process.env.PORT || '3000').trim();
    const candidates = [
        process.env.NEXT_PUBLIC_SERVER_URL,
        `http://127.0.0.1:${port}`,
        `http://localhost:${port}`,
        `http://127.0.0.1:3000`,
        `http://localhost:3000`,
        `http://127.0.0.1:3001`,
        `http://localhost:3001`,
    ];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of candidates) {
        const base = (raw || '').trim().replace(/\/$/, '');
        if (!base || seen.has(base)) continue;
        seen.add(base);
        out.push(base);
    }
    return out;
}

async function fetchTilesFromUrl(url: string): Promise<CityTile[] | null> {
    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        const rows = Array.isArray(data) ? data : [];
        const tiles = locationRowsToCityTiles(rows);
        return tiles.length > 0 ? tiles : null;
    } catch {
        return null;
    }
}

/**
 * Load cities for “Our Presence” from franchise.city (via Django API).
 * Tries Django directly, then Next `/api` proxy. Falls back to static list only if both fail.
 */
export async function fetchPublicFranchiseCityTiles(): Promise<FranchiseCityFetchResult> {
    for (const origin of djangoApiOrigins()) {
        const url = `${origin.replace(/\/$/, '')}/api/franchises/public/locations/`;
        const tiles = await fetchTilesFromUrl(url);
        if (tiles) return { tiles, fromDatabase: true };
    }

    for (const origin of nextProxyOrigins()) {
        const url = `${origin.replace(/\/$/, '')}/api/franchises/public/locations/`;
        const tiles = await fetchTilesFromUrl(url);
        if (tiles) return { tiles, fromDatabase: true };
    }

    if (typeof window === 'undefined') {
        console.warn(
            '[Our Presence] Could not reach Django API — using static city list. Run: cd time4kidsbe && python manage.py runserver',
        );
    }

    return { tiles: [...OUR_PRESENCE_CITY_TILES], fromDatabase: false };
}

/** Browser refresh (optional). */
export function publicLocationsApiUrl(): string {
    if (typeof window !== 'undefined') {
        return `${window.location.origin.replace(/\/$/, '')}/api/franchises/public/locations/`;
    }
    const base = djangoApiOrigins()[0];
    return `${base.replace(/\/$/, '')}/api/franchises/public/locations/`;
}

import { apiUrl, toApiError } from "@/lib/api-client";

export type CityOption = { name: string };

export type CentreOption = {
    id: number;
    name: string;
    slug: string;
};

type CitiesResponse = {
    count: number;
    results: CityOption[];
};

type CentersResponse = {
    count: number;
    city: string;
    results: CentreOption[];
};

export async function fetchCities(): Promise<CityOption[]> {
    const res = await fetch(apiUrl("/cities/"), {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
    });
    if (!res.ok) throw await toApiError(res);
    const data = (await res.json()) as CitiesResponse;
    return Array.isArray(data.results) ? data.results : [];
}

export async function fetchCentersByCity(city: string): Promise<CentreOption[]> {
    const trimmed = city.trim();
    if (!trimmed) return [];
    const res = await fetch(apiUrl(`/centers/?city=${encodeURIComponent(trimmed)}`), {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
    });
    if (!res.ok) throw await toApiError(res);
    const data = (await res.json()) as CentersResponse;
    return Array.isArray(data.results) ? data.results : [];
}

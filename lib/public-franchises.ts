import { apiUrl } from "@/lib/api-client";

/** Load every page from the public franchise list API (locate-centre / city pages need full lists). */
export async function fetchAllPublicFranchises(
    initialUrl: string,
): Promise<Record<string, unknown>[]> {
    const all: Record<string, unknown>[] = [];
    let nextUrl: string | null = initialUrl;

    while (nextUrl) {
        const response: Response = await fetch(nextUrl, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch franchises");

        const json: { results?: Record<string, unknown>[]; next?: string | null } | Record<string, unknown>[] =
            await response.json();
        if (Array.isArray(json)) {
            all.push(...(json as Record<string, unknown>[]));
        } else {
            all.push(...((json.results as Record<string, unknown>[]) || []));
        }

        const next = !Array.isArray(json) ? json.next : null;
        if (!next) break;
        if (next.startsWith("http")) {
            nextUrl = next;
        } else {
            const rel = next.startsWith("/") ? next : `/${next}`;
            const path = rel.startsWith("/api/") ? rel.slice(4) : rel;
            nextUrl = apiUrl(path);
        }
    }

    return all;
}

import { apiUrl } from "@/lib/api-client";

/** Load every page from the public franchise list API (locate-centre / city pages need full lists). */
export async function fetchAllPublicFranchises(
    initialUrl: string,
): Promise<Record<string, unknown>[]> {
    const all: Record<string, unknown>[] = [];
    let nextUrl: string | null = initialUrl;

    while (nextUrl) {
        const response = await fetch(nextUrl);
        if (!response.ok) throw new Error("Failed to fetch franchises");

        const json = await response.json();
        if (Array.isArray(json)) {
            all.push(...(json as Record<string, unknown>[]));
        } else {
            all.push(...((json.results as Record<string, unknown>[]) || []));
        }

        const next = !Array.isArray(json) ? (json.next as string | null | undefined) : null;
        if (!next) break;
        nextUrl = next.startsWith("http") ? next : apiUrl(next.startsWith("/") ? next : `/${next}`);
    }

    return all;
}

/**
 * Open a JWT-protected hub/parent document in a new tab with the correct download name.
 * Uses the same signed URL pattern as event gallery media (proven on live):
 * `/api/documents/.../file/?name=...&access=<fresh token>`
 *
 * Token is refreshed before open so idle sessions still work.
 */

import { apiUrl } from "@/lib/api-client";

const ALLOWED_API_PREFIXES = [
    "documents/franchise/documents/",
    "documents/parent/documents/",
];

export type GetAccessToken = () => Promise<string | null | undefined>;

export function isProtectedDocumentApiPath(apiPath: string): boolean {
    const trimmed = (apiPath || "").trim().replace(/^\/+/, "");
    const pathname = trimmed.split("?")[0].split("#")[0];
    return ALLOWED_API_PREFIXES.some(
        (prefix) => pathname.startsWith(prefix) && pathname.endsWith("/file/"),
    );
}

/** Normalize `/api/documents/...` or `/documents/...` to a proxy-safe API path. */
export function normalizeProtectedDocumentApiPath(path: string): string | null {
    let trimmed = (path || "").trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) {
        try {
            trimmed = new URL(trimmed).pathname + new URL(trimmed).search;
        } catch {
            return null;
        }
    }
    if (trimmed.startsWith("/api/")) trimmed = trimmed.slice(4);
    if (!trimmed.startsWith("/documents/")) return null;
    return isProtectedDocumentApiPath(trimmed) ? trimmed : null;
}

function splitDocumentApiPath(apiPath: string): { pathname: string; name?: string } {
    const qIdx = apiPath.indexOf("?");
    if (qIdx === -1) {
        return { pathname: apiPath };
    }
    const pathname = apiPath.slice(0, qIdx);
    const params = new URLSearchParams(apiPath.slice(qIdx + 1));
    const name = params.get("name")?.trim();
    return name ? { pathname, name } : { pathname };
}

export function buildProtectedDocumentViewUrl(apiPath: string, accessToken: string): string | null {
    const normalized = normalizeProtectedDocumentApiPath(apiPath);
    const token = accessToken.trim();
    if (!normalized || !token) return null;

    const { pathname, name } = splitDocumentApiPath(normalized);
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    params.set("access", token);
    const query = params.toString();
    return `${apiUrl(pathname)}?${query}`;
}

export function openProtectedDocumentView(
    getAccessToken: GetAccessToken,
    apiPath: string,
): void {
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;

    void (async () => {
        const token = (await getAccessToken())?.trim();
        const url = token ? buildProtectedDocumentViewUrl(apiPath, token) : null;
        if (!url) {
            if (tab && !tab.closed) tab.close();
            return;
        }
        if (tab && !tab.closed) {
            tab.location.href = url;
            return;
        }
        window.open(url, "_blank", "noopener,noreferrer");
    })();
}

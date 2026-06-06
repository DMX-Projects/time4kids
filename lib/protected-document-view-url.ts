/**
 * Open a JWT-protected Django document in a new tab so the browser PDF viewer
 * receives Content-Disposition (Chrome toolbar Download uses the real filename).
 * Auth is passed via a short-lived cookie — not in the address bar.
 */

const DOC_VIEW_COOKIE = "tk_dva";
const DOC_VIEW_PATH = "/api/doc-view";

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

export async function openProtectedDocumentView(
    getAccessToken: GetAccessToken,
    apiPath: string,
): Promise<void> {
    const normalized = normalizeProtectedDocumentApiPath(apiPath);
    if (!normalized) return;

    const token = (await getAccessToken())?.trim();
    if (!token) return;

    const secure =
        typeof window !== "undefined" && window.location.protocol === "https:";
    document.cookie = `${DOC_VIEW_COOKIE}=${encodeURIComponent(token)}; path=${DOC_VIEW_PATH}; max-age=120; SameSite=Lax${secure ? "; Secure" : ""}`;

    const pathForQuery = normalized.startsWith("/") ? normalized.slice(1) : normalized;
    const viewUrl = `${DOC_VIEW_PATH}?p=${encodeURIComponent(pathForQuery)}`;
    const tab = window.open(viewUrl, "_blank");
    if (tab) tab.opener = null;
}

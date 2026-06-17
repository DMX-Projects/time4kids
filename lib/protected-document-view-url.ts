/**
 * Open a JWT-protected hub/parent document in a new tab with the correct download name.
 *
 * Uses POST /document-open/ so the full JWT is sent in the request body (not the URL).
 * Long ?access= tokens are often truncated by proxies and cause 401 after idle.
 */

const DOCUMENT_OPEN_PATH = "/document-open/";

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

function splitDocumentApiPath(apiPath: string): {
    pathname: string;
    name?: string;
    student?: string;
    student_id?: string;
} {
    const qIdx = apiPath.indexOf("?");
    if (qIdx === -1) {
        return { pathname: apiPath };
    }
    const pathname = apiPath.slice(0, qIdx);
    const params = new URLSearchParams(apiPath.slice(qIdx + 1));
    const name = params.get("name")?.trim();
    const student = params.get("student")?.trim();
    const student_id = params.get("student_id")?.trim();
    return {
        pathname,
        ...(name ? { name } : {}),
        ...(student ? { student } : {}),
        ...(student_id ? { student_id } : {}),
    };
}

function submitDocumentOpenForm(fields: Record<string, string>): void {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = DOCUMENT_OPEN_PATH;
    form.target = "_blank";
    form.acceptCharset = "UTF-8";
    form.style.display = "none";

    for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    form.remove();
}

export function openProtectedDocumentView(
    getAccessToken: GetAccessToken,
    apiPath: string,
): void {
    void (async () => {
        const normalized = normalizeProtectedDocumentApiPath(apiPath);
        if (!normalized) return;

        const token = (await getAccessToken())?.trim();
        if (!token) return;

        const { pathname, name, student, student_id } = splitDocumentApiPath(normalized);
        const pathForForm = pathname.startsWith("/") ? pathname.slice(1) : pathname;

        const fields: Record<string, string> = {
            p: pathForForm,
            token,
        };
        if (name) fields.name = name;
        if (student) fields.student = student;
        if (student_id) fields.student_id = student_id;

        submitDocumentOpenForm(fields);
    })();
}

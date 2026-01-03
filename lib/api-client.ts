const normalizeBase = (value: string | undefined, fallback: string) => {
    const base = (value && value.trim()) || fallback;
    return base.endsWith('/') ? base.slice(0, -1) : base;
};

export const API_BASE_URL = normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL, "http://localhost:8000/api");
export const MEDIA_BASE_URL = normalizeBase(process.env.NEXT_PUBLIC_MEDIA_BASE_URL, "http://localhost:8000/media");
export const SERVER_URL = normalizeBase(process.env.NEXT_PUBLIC_SERVER_URL, "http://localhost:8000");
export const apiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const mediaUrl = (path?: string | null) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith('/media')) return `${SERVER_URL}${path}`;
    return `${MEDIA_BASE_URL}/${path.replace(/^\/+/, "")}`;
};

export type ApiError = Error & { status?: number; details?: unknown };

export async function toApiError(res: Response): Promise<ApiError> {
    let message = `Request failed with status ${res.status}`;
    let details: unknown = undefined;
    try {
        const data = await res.json();
        if (typeof data === "string") {
            message = data;
        } else if (data?.detail) {
            message = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } else if (data?.message) {
            message = data.message;
        }
        details = data;
    } catch {
        try {
            const text = await res.text();
            if (text) message = text;
        } catch {
            // ignore
        }
    }
    const err = new Error(message) as ApiError;
    err.status = res.status;
    err.details = details;
    return err;
}

export const jsonHeaders = (extra?: HeadersInit): HeadersInit => ({
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(extra || {}),
});

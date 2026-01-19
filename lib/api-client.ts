const normalizeBase = (value: string | undefined, fallback: string) => {
    const base = (value && value.trim()) || fallback;
    return base.endsWith('/') ? base.slice(0, -1) : base;
};

// Dynamic API URL detection
const getBaseUrl = () => {
    // If explicitly set in environment, use that (highest priority)
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // For server-side rendering, use localhost
    if (typeof window === 'undefined') {
        const port = process.env.NEXT_PUBLIC_BACKEND_PORT || '8000';
        return `http://localhost:${port}`;
    }

    // For client-side, detect the current host
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    // If accessing via localhost, use localhost with backend port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        const port = process.env.NEXT_PUBLIC_BACKEND_PORT || '8000';
        return `http://localhost:${port}`;
    }

    // If accessing via dev tunnel or remote URL
    // Use the backend dev tunnel URL if provided, otherwise use same host
    if (process.env.NEXT_PUBLIC_BACKEND_DEV_TUNNEL) {
        return process.env.NEXT_PUBLIC_BACKEND_DEV_TUNNEL;
    }

    // Fallback: use the same host (for cases where frontend and backend share same domain)
    return `${protocol}//${hostname}`;
};

const BASE_URL = getBaseUrl();

export const API_BASE_URL = normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL, `${BASE_URL}/api`);
export const MEDIA_BASE_URL = normalizeBase(process.env.NEXT_PUBLIC_MEDIA_BASE_URL, `${BASE_URL}/media`);
export const SERVER_URL = normalizeBase(process.env.NEXT_PUBLIC_SERVER_URL, BASE_URL);
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
        } else if (typeof data === "object" && data !== null) {
            // Handle DRF field errors e.g. { "email": ["Error msg"] }
            const values = Object.values(data);
            if (values.length > 0) {
                const first = values[0];
                if (Array.isArray(first) && first.length > 0 && typeof first[0] === "string") {
                    message = first[0];
                } else if (typeof first === "string") {
                    message = first;
                }
            }
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

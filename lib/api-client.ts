import { toCanonicalPublicHref } from "@/config/site-public";

const normalizeBase = (value: string | undefined, fallback: string) => {
    const base = (value && value.trim()) || fallback;
    return base.endsWith("/") ? base.slice(0, -1) : base;
};

// Dynamic API URL detection
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    const configuredPort = process.env.NEXT_PUBLIC_BACKEND_PORT?.trim();
    const port = configuredPort || "8000";

    if (typeof window === "undefined") {
        if (process.env.INTERNAL_API_URL) {
            return process.env.INTERNAL_API_URL;
        }
        return `http://127.0.0.1:${port}`;
    }

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
        return `http://127.0.0.1:${port}`;
    }

    if (process.env.NEXT_PUBLIC_BACKEND_DEV_TUNNEL) {
        return process.env.NEXT_PUBLIC_BACKEND_DEV_TUNNEL;
    }

    if (!configuredPort) {
        return `${protocol}//${window.location.host}`;
    }

    return `${protocol}//${hostname}:${port}`;
};

const BASE_URL = getBaseUrl();

/** SSR / RSC / Node: call Django directly (never loop through Next `/api` proxy). */
function djangoOriginForServer(): string {
    const fromEnv = (process.env.DJANGO_DEV_BACKEND_URL || process.env.INTERNAL_API_URL || "").replace(/\/$/, "");
    if (fromEnv) return fromEnv;
    return normalizeBase(undefined, BASE_URL);
}

/**
 * Browser on `127.0.0.1` but `.env` says `localhost` → cross-origin and almost everything fails.
 * When configured URL is loopback and matches this tab's port, rewrite to `window.location.origin`.
 */
function alignLoopbackDevOrigin(configured: string | undefined, fallback: string): string {
    const resolved = normalizeBase(configured, fallback);
    if (typeof window === "undefined") return resolved;
    try {
        const u = new URL(resolved);
        /** `window.location.hostname` for IPv6 loopback is `::1` (no brackets). */
        const loopback = (h: string) => {
            const x = (h || "").toLowerCase();
            return x === "localhost" || x === "127.0.0.1" || x === "::1";
        };
        const urlPort = u.port || (u.protocol === "https:" ? "443" : "80");
        const pagePort = window.location.port || (window.location.protocol === "https:" ? "443" : "80");
        if (!loopback(u.hostname) || !loopback(window.location.hostname)) return resolved;
        if (urlPort !== pagePort) return resolved;
        const suffix = u.pathname === "/" ? "" : u.pathname;
        return normalizeBase(`${window.location.origin}${suffix}`, `${window.location.origin}${suffix}`);
    } catch {
        return resolved;
    }
}

function resolvedApiBase(): string {
    if (typeof window !== "undefined") {
        const fallback = `${window.location.origin.replace(/\/$/, "")}/api`;
        return alignLoopbackDevOrigin(process.env.NEXT_PUBLIC_API_BASE_URL, fallback);
    }
    return `${djangoOriginForServer()}/api`;
}

/**
 * When MEDIA_BASE is omitted, uploads still live on the API host (`…/media/`).
 * Using only `window.location.origin/media` breaks live sites where Next and Django differ.
 */
function derivedMediaBaseFromApiBase(): string {
    let b = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
    if (!b) {
        const fromApiUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/$/, "");
        if (fromApiUrl) b = fromApiUrl;
    }
    if (!b) return "";
    if (/\/api$/i.test(b)) b = b.replace(/\/api$/i, "");
    return `${b.replace(/\/$/, "")}/media`;
}

function resolvedMediaBase(): string {
    const pageOriginMedia = `${typeof window !== "undefined" ? window.location.origin.replace(/\/$/, "") : getServerUrl()}/media`;
    const envMedia = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "").trim();
    const derived = derivedMediaBaseFromApiBase();

    if (typeof window !== "undefined") {
        if (envMedia) return alignLoopbackDevOrigin(envMedia, pageOriginMedia);
        if (derived) return alignLoopbackDevOrigin(derived, pageOriginMedia);
        return pageOriginMedia;
    }
    const envMediaServer = envMedia.replace(/\/$/, "");
    if (envMediaServer) return envMediaServer;
    if (derived) return derived.replace(/\/$/, "");
    return `${djangoOriginForServer()}/media`;
}

/** Absolute site URL (mostly logging / legacy). Prefer `window.location.origin` on the client. */
export function getServerUrl(): string {
    if (typeof window !== "undefined") {
        return alignLoopbackDevOrigin(process.env.NEXT_PUBLIC_SERVER_URL, window.location.origin.replace(/\/$/, ""));
    }
    return normalizeBase(process.env.NEXT_PUBLIC_SERVER_URL, djangoOriginForServer());
}

/** Public static file on the Next site (`public/`), e.g. `/franchise-artworks/...png`. */
export function publicAssetUrl(path: string): string {
    const raw = path.trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    const pathname = raw.startsWith("/") ? raw : `/${raw}`;
    return `${getServerUrl()}${pathname}`;
}

/** Django-style paths with trailing slash before `?` (fewer redirect/proxy mismatches). */
export function normalizeApiPath(path: string): string {
    const trimmed = path.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const raw = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    const q = raw.indexOf("?");
    const hashIdx = raw.indexOf("#");
    let end = raw.length;
    if (q !== -1) end = Math.min(end, q);
    if (hashIdx !== -1) end = Math.min(end, hashIdx);
    const pathname = raw.slice(0, end);
    const suffix = raw.slice(end);
    if (pathname === "" || pathname === "/") return raw;
    const lastSeg = pathname.split("/").filter(Boolean).pop() || "";
    if (lastSeg.includes(".") && !lastSeg.endsWith(".")) return raw;
    if (pathname.endsWith("/")) return pathname + suffix;
    return `${pathname}/${suffix}`;
}

// Server-side initialization log
if (typeof window === "undefined") {
    console.log("--- API Client Configuration (Server) ---");
    console.log("NEXT_PUBLIC_SERVER_URL:", process.env.NEXT_PUBLIC_SERVER_URL || "Not Set");
    console.log("BASE_URL (Computed):", BASE_URL);
    console.log("SSR API base (direct Django):", resolvedApiBase());
    console.log("NEXT_PUBLIC_MEDIA_BASE_URL:", process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "Not Set (derived from API if possible)");
    console.log("Resolved MEDIA base (SSR):", resolvedMediaBase());
    console.log("-----------------------------------------");
}

export const apiUrl = (path: string) => `${resolvedApiBase()}${normalizeApiPath(path)}`;

export const mediaUrl = (path?: string | null) => {
    const mediaBase = resolvedMediaBase();
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) {
        const canonical = toCanonicalPublicHref(path);
        try {
            const u = new URL(canonical);
            if (u.pathname.startsWith("/media/")) {
                return `${mediaBase}${u.pathname.replace(/^\/media/, "")}`;
            }
        } catch {
            /* ignore */
        }
        return canonical;
    }
    if (path.startsWith(mediaBase)) return path;
    if (path.startsWith("/media")) return `${mediaBase}${path.replace(/^\/media/, "")}`;
    if (path.startsWith("/")) {
        if (typeof window !== "undefined") {
            return `${window.location.origin.replace(/\/$/, "")}${path}`;
        }
        const site = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || process.env.NEXT_PUBLIC_SERVER_URL || "")
            .replace(/\/media\/?$/, "")
            .replace(/\/$/, "");
        if (site) return `${site}${path}`;
        const derivedOrigin = derivedMediaBaseFromApiBase().replace(/\/media\/?$/, "");
        if (derivedOrigin) return `${derivedOrigin.replace(/\/$/, "")}${path}`;
        return path;
    }
    return `${mediaBase}/${path.replace(/^\/+/g, "")}`;
};

/** CMS uploads (`/media/...`) and static blobs (`/franchise-gallery/...`) — always absolute for <img>. */
export function resolveHomeMediaAssetUrl(path?: string | null): string {
    let t = (path || "").trim();
    if (!t) return "";
    if (/^media\//i.test(t)) t = `/${t}`;
    if (t.startsWith("/media") || /^https?:\/\//i.test(t)) {
        return mediaUrl(t) || t;
    }
    if (t.startsWith("/")) {
        return publicAssetUrl(t) || mediaUrl(t) || t;
    }
    return mediaUrl(t) || publicAssetUrl(t) || t;
}

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

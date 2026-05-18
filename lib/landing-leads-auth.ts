const STORAGE_KEY = "tk-landing-leads-key";

export function getStoredReportKey(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return sessionStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

export function persistReportKey(key: string | null) {
    if (typeof window === "undefined" || !key?.trim()) return;
    try {
        sessionStorage.setItem(STORAGE_KEY, key.trim());
    } catch {
        /* ignore */
    }
}

export function withReportKey(path: string, key: string | null): string {
    if (!key?.trim()) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}key=${encodeURIComponent(key.trim())}`;
}

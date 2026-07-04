"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, jsonHeaders, mediaUrl, normalizeApiPath, toApiError } from "@/lib/api-client";
import { parseFilenameFromContentDisposition } from "@/lib/franchise-download-filename";
import { AccessLoading } from "@/components/auth/AccessLoading";

type Role = "admin" | "crm" | "franchise" | "parent" | "driver";

type User = {
    id: string;
    email: string;
    role: Role;
    /** True only for head-office super admins (not the content-only admin). */
    isSuperuser?: boolean;
    fullName?: string;
    /** Child name from login / me (parent accounts). */
    childName?: string;
    /** Use for greetings in the parent app — child name, not parent full_name. */
    displayName?: string;
    /** Child gender code from login / me (`M` | `F`). */
    gender?: "M" | "F" | "";
    /** Human-readable label (`Male` | `Female`). */
    genderLabel?: string;
};

type Tokens = { access: string; refresh: string };

type LoginOptions = {
    /** Default: `/auth/login/`. Use `/auth/parent/login/` on the parent-only sign-in page. */
    authPath?: string;
    /** Used on role-specific login pages when the API omits top-level ``user`` (driver login). */
    forceRole?: Role;
};

export type AuthLoginResponse = {
    refresh: string;
    access: string;
    user?: {
        id: number;
        email: string;
        full_name?: string;
        role: string;
        [key: string]: unknown;
    };
    driver_profile?: {
        id: number;
        user: {
            id: number;
            email: string;
            full_name: string;
            username?: string;
            role?: string;
            is_active?: boolean;
        };
        phone: string;
        service_number?: string;
        license_number?: string;
        license_document?: string | null;
        vehicle_rc?: string | null;
        vehicle_insurance?: string | null;
        is_active?: boolean;
        created_at?: string;
    };
};

export type LoginResult = {
    user: User;
    response: AuthLoginResponse;
};

type AuthContextValue = {
    user: User | null;
    tokens: Tokens | null;
    loading: boolean;
    login: (email: string, password: string, options?: LoginOptions) => Promise<LoginResult>;
    logout: () => void;
    refreshTokens: () => Promise<Tokens | false>;
    /** Re-fetch `/auth/me/` and update stored session (e.g. after parent updates display name). */
    refreshUser: () => Promise<void>;
    authFetch: <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
    /** PDFs and uploads — skips JSON parsing; use for `/file/` endpoints. */
    authFetchBlob: (path: string, init?: RequestInit) => Promise<Blob>;
    /** Blob + filename from Content-Disposition (for hub document downloads). */
    authFetchBlobResponse: (
        path: string,
        init?: RequestInit,
    ) => Promise<{ blob: Blob; filename?: string }>;
    /** Fetch a file blob from an API path or full media/legacy URL. */
    authFetchBlobFromHref: (
        href: string,
        init?: RequestInit,
    ) => Promise<{ blob: Blob; filename?: string }>;
    /** Fresh JWT for opening protected documents in a new tab (no token in the URL). */
    getAccessTokenForDocumentView: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** @deprecated single-session key; migrated to per-role keys */
const LEGACY_STORAGE_KEY = "tk-auth-session";
const LAST_ROLE_KEY = "tk-auth-last-role";

const storageKeyForRole = (role: Role) => `tk-auth-${role}`;
const ALL_ROLE_KEYS: string[] = ["admin", "crm", "franchise", "parent", "driver"].map((r) => storageKeyForRole(r as Role));

export const normalizeRole = (role?: string | null): Role => {
    const mapped = String(role ?? "")
        .trim()
        .toLowerCase();
    if (mapped === "admin") return "admin";
    if (mapped === "crm") return "crm";
    if (mapped === "franchise") return "franchise";
    if (mapped === "driver") return "driver";
    return "parent";
};

function mapApiUserToSession(data: Record<string, unknown>, fallbackEmail = ""): User {
    const students = Array.isArray(data.students) ? (data.students as Record<string, unknown>[]) : [];
    const primaryStudent = students[0];
    const primaryName =
        primaryStudent?.full_name != null ? String(primaryStudent.full_name).trim() : "";
    const childName =
        data.child_name != null
            ? String(data.child_name)
            : primaryName || undefined;
    const displayName =
        data.display_name != null
            ? String(data.display_name)
            : childName;
    const genderRaw = data.gender ?? primaryStudent?.gender;
    const genderLabelRaw = data.gender_label ?? primaryStudent?.gender_label;

    return {
        id: String(data.id ?? ""),
        email: String(data.email ?? fallbackEmail),
        isSuperuser: Boolean(data.is_superuser),
        fullName: data.full_name != null ? String(data.full_name) : undefined,
        childName,
        displayName,
        gender: normalizeParentGender(genderRaw),
        genderLabel:
            genderLabelRaw != null
                ? String(genderLabelRaw)
                : genderLabelFromCode(genderRaw),
        role: normalizeRole(data.role as string | undefined),
    };
}

function normalizeParentGender(raw: unknown): "M" | "F" | "" | undefined {
    const v = String(raw ?? "")
        .trim()
        .toUpperCase();
    if (v === "M" || v === "MALE") return "M";
    if (v === "F" || v === "FEMALE") return "F";
    return v ? "" : undefined;
}

function genderLabelFromCode(raw: unknown): string | undefined {
    const g = normalizeParentGender(raw);
    if (g === "M") return "Male";
    if (g === "F") return "Female";
    return undefined;
}

/** Role implied by URL, e.g. /dashboard/franchise/... → franchise */
function pathnameDashboardRole(): Role | null {
    if (typeof window === "undefined") return null;
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts[0] === "dashboard") {
        const r = parts[1];
        if (r === "parent" || r === "franchise" || r === "admin" || r === "driver") return r as Role;
    }
    if (parts[0] === "driver") return "driver";
    if (parts[0] === "crm-admin") return "crm";
    if (parts[0] === "leads") return "admin";
    return null;
}

type StoredAuth = {
    user: User;
    tokens: Tokens;
};

function getStorage(): Storage | null {
    if (typeof window === "undefined") return null;
    // Prefer localStorage, but some browser/privacy modes disable it.
    try {
        const k = "__tk_test__";
        window.localStorage.setItem(k, "1");
        window.localStorage.removeItem(k);
        return window.localStorage;
    } catch {
        try {
            const k = "__tk_test__";
            window.sessionStorage.setItem(k, "1");
            window.sessionStorage.removeItem(k);
            return window.sessionStorage;
        } catch {
            return null;
        }
    }
}

function migrateLegacyIfNeeded(): void {
    if (typeof window === "undefined") return;
    const storage = getStorage();
    if (!storage) return;
    const raw = storage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw) as StoredAuth;
        const role = normalizeRole(parsed.user.role);
        const key = storageKeyForRole(role);
        if (!storage.getItem(key)) {
            storage.setItem(key, raw);
        }
        storage.removeItem(LEGACY_STORAGE_KEY);
        storage.setItem(LAST_ROLE_KEY, role);
    } catch {
        storage.removeItem(LEGACY_STORAGE_KEY);
    }
}

/** Pick which saved session to restore so franchise refresh does not load parent tokens from the same browser. */
function readStoredSessionRaw(): string | null {
    if (typeof window === "undefined") return null;
    const storage = getStorage();
    if (!storage) return null;
    migrateLegacyIfNeeded();

    const pathRole = pathnameDashboardRole();

    if (pathRole) {
        const key = storageKeyForRole(pathRole);
        const direct = storage.getItem(key);
        if (direct) return direct;
        return null;
    }

    const last = storage.getItem(LAST_ROLE_KEY) as Role | null;
    if (last === "parent" || last === "franchise" || last === "admin" || last === "crm" || last === "driver") {
        const fromLast = storage.getItem(storageKeyForRole(last));
        if (fromLast) return fromLast;
    }

    for (const r of ["admin", "crm", "franchise", "parent", "driver"] as const) {
        const raw = storage.getItem(storageKeyForRole(r));
        if (raw) return raw;
    }
    return null;
}

function persistSession(next: StoredAuth | null, previousUser: User | null) {
    if (typeof window === "undefined") return;
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(LEGACY_STORAGE_KEY);
    if (!next) {
        if (previousUser) {
            storage.removeItem(storageKeyForRole(previousUser.role));
        }
        return;
    }
    const role = normalizeRole(next.user.role);
    storage.setItem(storageKeyForRole(role), JSON.stringify(next));
    storage.setItem(LAST_ROLE_KEY, role);
}

/** Refresh access token this long before it expires (silent background + pre-open). */
const ACCESS_TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
const ACCESS_TOKEN_REFRESH_CHECK_MS = 60 * 1000;

/** JWT `exp` in ms — used to refresh before document downloads after idle time. */
function jwtAccessExpiresAtMs(token: string): number | null {
    try {
        const segment = token.split(".")[1];
        if (!segment) return null;
        const json = atob(segment.replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(json) as { exp?: number };
        return typeof payload.exp === "number" ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<Tokens | null>(null);
    const [loading, setLoading] = useState(true);
    /** Always-current tokens for `authFetch` (avoids stale closure vs. memoized context). */
    const tokensRef = useRef<Tokens | null>(null);
    tokensRef.current = tokens;
    const userRef = useRef<User | null>(null);
    userRef.current = user;
    /** Serialize refresh so parallel 401s do not race and invalidate the session. */
    const refreshInFlightRef = useRef<Promise<Tokens | false> | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const saved = readStoredSessionRaw();
                if (saved) {
                    const parsed = JSON.parse(saved) as StoredAuth;
                    const restored: User = {
                        ...parsed.user,
                        id: String(parsed.user.id),
                        role: normalizeRole(parsed.user.role as string),
                    };
                    setTokens(parsed.tokens);
                    setUser(restored);
                    await hydrateUser(parsed.tokens, restored);
                } else {
                    setUser(null);
                    setTokens(null);
                }
            } catch {
                setUser(null);
                setTokens(null);
            } finally {
                setLoading(false);
            }
        };
        load();
        // Session hydration intentionally runs once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const hydrateUser = async (existingTokens: Tokens | null, existingUser?: User | null) => {
        if (!existingTokens?.access) return;
        try {
            const res = await fetch(apiUrl("/auth/me/"), {
                headers: {
                    Authorization: `Bearer ${existingTokens.access}`,
                    Accept: "application/json",
                },
                cache: "no-store",
            });
            if (res.status === 401) {
                const userForRefresh = existingUser ?? null;
                const refreshed = await refreshTokensInner(existingTokens, userForRefresh);
                if (refreshed) return hydrateUser(refreshed, userForRefresh);
                return;
            }
            if (!res.ok) return;
            const data = await res.json();
            const nextUser = mapApiUserToSession(data as Record<string, unknown>);
            setUser(nextUser);
            setTokens(existingTokens);
            persistSession({ user: nextUser, tokens: existingTokens }, null);
        } catch {
            // fail silently; will require login
        }
    };

    const login = async (email: string, password: string, options?: LoginOptions): Promise<LoginResult> => {
        const path = options?.authPath ?? "/auth/login/";
        const res = await fetch(apiUrl(path), {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw await toApiError(res);
        const data = (await res.json()) as AuthLoginResponse;
        const nextTokens: Tokens = { access: data.access, refresh: data.refresh };
        const u = data.user ?? data.driver_profile?.user;
        const resolvedRole = u?.role ?? data.driver_profile?.user?.role ?? options?.forceRole;
        const nextUser: User = {
            ...mapApiUserToSession((u ?? {}) as Record<string, unknown>, email),
            role: normalizeRole(resolvedRole),
        };
        setTokens(nextTokens);
        setUser(nextUser);
        persistSession({ tokens: nextTokens, user: nextUser }, user);
        return { user: nextUser, response: data };
    };

    const logout = () => {
        const prev = user;
        setUser(null);
        setTokens(null);
        persistSession(null, prev);
        if (typeof window !== "undefined") {
            const storage = getStorage();
            if (storage) {
                storage.removeItem(LAST_ROLE_KEY);
                storage.removeItem(LEGACY_STORAGE_KEY);
                // Ensure full sign-out on shared devices and avoid role re-hydration loops.
                for (const key of ALL_ROLE_KEYS) storage.removeItem(key);
            }
        }
    };

    const refreshTokensInner = async (current: Tokens | null, userForPersist: User | null): Promise<Tokens | false> => {
        if (refreshInFlightRef.current) {
            return refreshInFlightRef.current;
        }
        const run = (async (): Promise<Tokens | false> => {
            try {
                if (!current?.refresh) return false;
                const res = await fetch(apiUrl("/auth/refresh/"), {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify({ refresh: current.refresh }),
                });
                if (!res.ok) {
                    // Only logout when the refresh token is invalid — not on 5xx / network quirks.
                    if (res.status === 401 || res.status === 403) {
                        logout();
                    }
                    return false;
                }
                const data = await res.json();
                const next: Tokens = { access: data.access, refresh: current.refresh };
                setTokens(next);
                if (userForPersist) persistSession({ user: userForPersist, tokens: next }, null);
                return next;
            } finally {
                refreshInFlightRef.current = null;
            }
        })();
        refreshInFlightRef.current = run;
        return run;
    };

    const refreshTokens = async (current: Tokens | null = tokens): Promise<Tokens | false> => {
        return refreshTokensInner(current, user);
    };

    /** Refresh access JWT before file fetch when user has been idle (no token in browser URL). */
    const ensureAccessTokenFresh = async (): Promise<boolean> => {
        const current = tokensRef.current;
        const access = current?.access;
        if (!access) return false;
        const exp = jwtAccessExpiresAtMs(access);
        const needsRefresh = exp == null || exp <= Date.now() + ACCESS_TOKEN_REFRESH_BUFFER_MS;
        if (!needsRefresh) return true;
        const refreshed = await refreshTokensInner(current, userRef.current);
        return refreshed !== false && Boolean(refreshed.access);
    };

    const getAccessTokenForDocumentView = async (): Promise<string | null> => {
        if (!(await ensureAccessTokenFresh())) return null;
        return tokensRef.current?.access ?? null;
    };

    /** Keep session alive silently while the dashboard tab stays open (no UI). */
    useEffect(() => {
        if (!tokens?.access || !tokens?.refresh) return;

        const refreshIfNeeded = async () => {
            const current = tokensRef.current;
            if (!current?.access || !current?.refresh) return;
            const exp = jwtAccessExpiresAtMs(current.access);
            const needsRefresh = exp == null || exp <= Date.now() + ACCESS_TOKEN_REFRESH_BUFFER_MS;
            if (!needsRefresh) return;
            await refreshTokensInner(current, userRef.current);
        };

        const interval = window.setInterval(() => {
            void refreshIfNeeded();
        }, ACCESS_TOKEN_REFRESH_CHECK_MS);

        const onVisible = () => {
            if (document.visibilityState === "visible") void refreshIfNeeded();
        };
        const onFocus = () => {
            void refreshIfNeeded();
        };

        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("focus", onFocus);
        void refreshIfNeeded();

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", onVisible);
            window.removeEventListener("focus", onFocus);
        };
        // Re-schedule when access token changes after a silent refresh.
    }, [tokens?.access, tokens?.refresh]);

    const refreshUser = async () => {
        if (!tokens?.access) return;
        try {
            const res = await fetch(apiUrl("/auth/me/"), {
                headers: {
                    Authorization: `Bearer ${tokens.access}`,
                    Accept: "application/json",
                },
                cache: "no-store",
            });
            if (res.status === 401) {
                const refreshed = await refreshTokensInner(tokens, user);
                if (refreshed) {
                    const retry = await fetch(apiUrl("/auth/me/"), {
                        headers: {
                            Authorization: `Bearer ${refreshed.access}`,
                            Accept: "application/json",
                        },
                        cache: "no-store",
                    });
                    if (!retry.ok) return;
                    const data = await retry.json();
                    const nextUser = mapApiUserToSession(data as Record<string, unknown>);
                    setUser(nextUser);
                    persistSession({ user: nextUser, tokens: refreshed }, null);
                }
                return;
            }
            if (!res.ok) return;
            const data = await res.json();
            const nextUser = mapApiUserToSession(data as Record<string, unknown>);
            setUser(nextUser);
            persistSession({ user: nextUser, tokens }, null);
        } catch {
            /* ignore */
        }
    };

    /** All protected API calls must go through this — blocked until `access` JWT exists (login or restored session). */
    const authFetch = async <T = unknown>(path: string, init?: RequestInit, retry = true): Promise<T> => {
        const access = tokensRef.current?.access;
        if (!access) {
            const err = new Error("Authentication required. Please sign in.");
            (err as Error & { code?: string }).code = "AUTH_REQUIRED";
            throw err;
        }
        const headers = new Headers(init?.headers || {});
        headers.set("Authorization", `Bearer ${access}`);
        const response = await fetch(apiUrl(path), { ...init, headers });
        if (response.status === 401 && retry) {
            const refreshed = await refreshTokens();
            if (refreshed) {
                const retryHeaders = new Headers(init?.headers || {});
                retryHeaders.set("Authorization", `Bearer ${refreshed.access}`);
                const retried = await fetch(apiUrl(path), { ...init, headers: retryHeaders });
                if (retried.ok) {
                    return (await retried.json().catch(() => null)) as T;
                }
                throw await toApiError(retried);
            }
            logout();
            throw new Error("Session expired. Please login again.");
        }
        if (!response.ok) throw await toApiError(response);
        return (await response.json().catch(() => null)) as T;
    };

    const authFetchBlob = async (path: string, init?: RequestInit, retry = true): Promise<Blob> => {
        if (!(await ensureAccessTokenFresh())) {
            const err = new Error("Authentication required. Please sign in.");
            (err as Error & { code?: string }).code = "AUTH_REQUIRED";
            throw err;
        }
        const access = tokensRef.current?.access;
        if (!access) {
            const err = new Error("Authentication required. Please sign in.");
            (err as Error & { code?: string }).code = "AUTH_REQUIRED";
            throw err;
        }
        const headers = new Headers(init?.headers || {});
        headers.set("Authorization", `Bearer ${access}`);
        const response = await fetch(apiUrl(path), { ...init, headers });
        if (response.status === 401 && retry) {
            const refreshed = await refreshTokens();
            if (refreshed) {
                const retryHeaders = new Headers(init?.headers || {});
                retryHeaders.set("Authorization", `Bearer ${refreshed.access}`);
                const retried = await fetch(apiUrl(path), { ...init, headers: retryHeaders });
                if (retried.ok) return retried.blob();
                throw await toApiError(retried);
            }
            logout();
            throw new Error("Session expired. Please login again.");
        }
        if (!response.ok) throw await toApiError(response);
        return response.blob();
    };

    const authFetchBlobResponse = async (
        path: string,
        init?: RequestInit,
        retry = true,
    ): Promise<{ blob: Blob; filename?: string }> => {
        if (!(await ensureAccessTokenFresh())) {
            const err = new Error("Authentication required. Please sign in.");
            (err as Error & { code?: string }).code = "AUTH_REQUIRED";
            throw err;
        }
        const access = tokensRef.current?.access;
        if (!access) {
            const err = new Error("Authentication required. Please sign in.");
            (err as Error & { code?: string }).code = "AUTH_REQUIRED";
            throw err;
        }
        const headers = new Headers(init?.headers || {});
        headers.set("Authorization", `Bearer ${access}`);
        const response = await fetch(apiUrl(path), { ...init, headers });
        if (response.status === 401 && retry) {
            const refreshed = await refreshTokens();
            if (refreshed) {
                const retryHeaders = new Headers(init?.headers || {});
                retryHeaders.set("Authorization", `Bearer ${refreshed.access}`);
                const retried = await fetch(apiUrl(path), { ...init, headers: retryHeaders });
                if (retried.ok) {
                    return {
                        blob: await retried.blob(),
                        filename: parseFilenameFromContentDisposition(
                            retried.headers.get("Content-Disposition"),
                        ),
                    };
                }
                throw await toApiError(retried);
            }
            logout();
            throw new Error("Session expired. Please login again.");
        }
        if (!response.ok) throw await toApiError(response);
        return {
            blob: await response.blob(),
            filename: parseFilenameFromContentDisposition(response.headers.get("Content-Disposition")),
        };
    };

    const authFetchBlobFromHref = async (
        href: string,
        init?: RequestInit,
        retry = true,
    ): Promise<{ blob: Blob; filename?: string }> => {
        const trimmed = href.trim();
        if (!trimmed) {
            throw new Error("Missing file URL.");
        }
        if (trimmed.startsWith("/documents/")) {
            return authFetchBlobResponse(normalizeApiPath(trimmed), init, retry);
        }
        if (trimmed.startsWith("/") && !trimmed.startsWith("/media/")) {
            return authFetchBlobResponse(normalizeApiPath(trimmed), init, retry);
        }

        if (!(await ensureAccessTokenFresh())) {
            throw new Error("Authentication required. Please sign in.");
        }
        const access = tokensRef.current?.access;
        const headers = new Headers(init?.headers || {});
        if (access) headers.set("Authorization", `Bearer ${access}`);

        const fetchUrl = /^https?:\/\//i.test(trimmed)
            ? trimmed
            : trimmed.startsWith("/media/")
              ? mediaUrl(trimmed.replace(/^\/media\/?/i, ""))
              : apiUrl(trimmed);

        const response = await fetch(fetchUrl, { ...init, headers });
        if (response.status === 401 && retry && access) {
            const refreshed = await refreshTokens();
            if (refreshed) {
                const retryHeaders = new Headers(init?.headers || {});
                retryHeaders.set("Authorization", `Bearer ${refreshed.access}`);
                const retried = await fetch(fetchUrl, { ...init, headers: retryHeaders });
                if (retried.ok) {
                    return {
                        blob: await retried.blob(),
                        filename: parseFilenameFromContentDisposition(
                            retried.headers.get("Content-Disposition"),
                        ),
                    };
                }
                throw await toApiError(retried);
            }
            logout();
            throw new Error("Session expired. Please login again.");
        }
        if (!response.ok) throw await toApiError(response);
        return {
            blob: await response.blob(),
            filename: parseFilenameFromContentDisposition(response.headers.get("Content-Disposition")),
        };
    };

    const value: AuthContextValue = {
        user,
        tokens,
        loading,
        login,
        logout,
        refreshTokens,
        refreshUser,
        authFetch,
        authFetchBlob,
        authFetchBlobResponse,
        authFetchBlobFromHref,
        getAccessTokenForDocumentView,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

export function postLoginPathForRole(role: Role, next?: string | null): string {
    const trimmed = next?.trim();
    if (trimmed) return trimmed;
    if (role === "crm") return "/crm-admin";
    if (role === "driver") return "/driver/trip";
    return `/dashboard/${role}`;
}

function dashboardPathForRole(role: Role): string {
    return postLoginPathForRole(role);
}

export const RoleGuard = ({ allowedRole, children }: { allowedRole: Role; children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            const loginNext = encodeURIComponent(postLoginPathForRole(allowedRole));
            router.replace(`/login?next=${loginNext}`);
            return;
        }

        const actual = normalizeRole(user.role);
        if (actual !== allowedRole) {
            router.replace(dashboardPathForRole(actual));
        }
    }, [allowedRole, loading, router, user]);

    if (loading) {
        return <AccessLoading />;
    }

    if (!user) {
        return <AccessLoading />;
    }

    if (normalizeRole(user.role) !== allowedRole) {
        return <AccessLoading />;
    }

    return <>{children}</>;
};

export type { Role, User, LoginOptions };

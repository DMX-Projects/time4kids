"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, jsonHeaders, toApiError } from "@/lib/api-client";
import { AccessLoading } from "@/components/auth/AccessLoading";

type Role = "admin" | "franchise" | "parent";

type User = {
    id: string;
    email: string;
    role: Role;
    fullName?: string;
};

type Tokens = { access: string; refresh: string };

type LoginOptions = {
    /** Default: `/auth/login/`. Use `/auth/parent/login/` on the parent-only sign-in page. */
    authPath?: string;
};

type AuthContextValue = {
    user: User | null;
    tokens: Tokens | null;
    loading: boolean;
    login: (email: string, password: string, options?: LoginOptions) => Promise<User>;
    logout: () => void;
    refreshTokens: () => Promise<Tokens | false>;
    /** Re-fetch `/auth/me/` and update stored session (e.g. after parent updates display name). */
    refreshUser: () => Promise<void>;
    authFetch: <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** @deprecated single-session key; migrated to per-role keys */
const LEGACY_STORAGE_KEY = "tk-auth-session";
const LAST_ROLE_KEY = "tk-auth-last-role";

const storageKeyForRole = (role: Role) => `tk-auth-${role}`;
const ALL_ROLE_KEYS: string[] = ["admin", "franchise", "parent"].map((r) => storageKeyForRole(r as Role));

export const normalizeRole = (role?: string | null): Role => {
    const mapped = String(role ?? "")
        .trim()
        .toLowerCase();
    if (mapped === "admin") return "admin";
    if (mapped === "franchise") return "franchise";
    return "parent";
};

/** Role implied by URL, e.g. /dashboard/franchise/... → franchise */
function pathnameDashboardRole(): Role | null {
    if (typeof window === "undefined") return null;
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts[0] !== "dashboard") return null;
    const r = parts[1];
    if (r === "parent" || r === "franchise" || r === "admin") return r;
    return null;
}

type StoredAuth = {
    user: User;
    tokens: Tokens;
};

function migrateLegacyIfNeeded(): void {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw) as StoredAuth;
        const role = normalizeRole(parsed.user.role);
        const key = storageKeyForRole(role);
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, raw);
        }
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        localStorage.setItem(LAST_ROLE_KEY, role);
    } catch {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
}

/** Pick which saved session to restore so franchise refresh does not load parent tokens from the same browser. */
function readStoredSessionRaw(): string | null {
    if (typeof window === "undefined") return null;
    migrateLegacyIfNeeded();

    const pathRole = pathnameDashboardRole();

    if (pathRole) {
        const key = storageKeyForRole(pathRole);
        const direct = localStorage.getItem(key);
        if (direct) return direct;
        return null;
    }

    const last = localStorage.getItem(LAST_ROLE_KEY) as Role | null;
    if (last === "parent" || last === "franchise" || last === "admin") {
        const fromLast = localStorage.getItem(storageKeyForRole(last));
        if (fromLast) return fromLast;
    }

    for (const r of ["admin", "franchise", "parent"] as const) {
        const raw = localStorage.getItem(storageKeyForRole(r));
        if (raw) return raw;
    }
    return null;
}

function persistSession(next: StoredAuth | null, previousUser: User | null) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    if (!next) {
        if (previousUser) {
            localStorage.removeItem(storageKeyForRole(previousUser.role));
        }
        return;
    }
    const role = normalizeRole(next.user.role);
    localStorage.setItem(storageKeyForRole(role), JSON.stringify(next));
    localStorage.setItem(LAST_ROLE_KEY, role);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<Tokens | null>(null);
    const [loading, setLoading] = useState(true);
    /** Always-current tokens for `authFetch` (avoids stale closure vs. memoized context). */
    const tokensRef = useRef<Tokens | null>(null);
    tokensRef.current = tokens;
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
            const nextUser: User = {
                id: String(data.id),
                email: data.email,
                fullName: data.full_name,
                role: normalizeRole(data.role),
            };
            setUser(nextUser);
            setTokens(existingTokens);
            persistSession({ user: nextUser, tokens: existingTokens }, null);
        } catch {
            // fail silently; will require login
        }
    };

    const login = async (email: string, password: string, options?: LoginOptions) => {
        const path = options?.authPath ?? "/auth/login/";
        const res = await fetch(apiUrl(path), {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw await toApiError(res);
        const data = await res.json();
        const nextTokens: Tokens = { access: data.access, refresh: data.refresh };
        const nextUser: User = {
            id: String(data.user?.id ?? ""),
            email: data.user?.email ?? email,
            fullName: data.user?.full_name ?? undefined,
            role: normalizeRole(data.user?.role),
        };
        setTokens(nextTokens);
        setUser(nextUser);
        persistSession({ tokens: nextTokens, user: nextUser }, user);
        return nextUser;
    };

    const logout = () => {
        const prev = user;
        setUser(null);
        setTokens(null);
        persistSession(null, prev);
        if (typeof window !== "undefined") {
            localStorage.removeItem(LAST_ROLE_KEY);
            localStorage.removeItem(LEGACY_STORAGE_KEY);
            // Ensure full sign-out on shared devices and avoid role re-hydration loops.
            for (const key of ALL_ROLE_KEYS) localStorage.removeItem(key);
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
                    const nextUser: User = {
                        id: String(data.id),
                        email: data.email,
                        fullName: data.full_name,
                        role: normalizeRole(data.role),
                    };
                    setUser(nextUser);
                    persistSession({ user: nextUser, tokens: refreshed }, null);
                }
                return;
            }
            if (!res.ok) return;
            const data = await res.json();
            const nextUser: User = {
                id: String(data.id),
                email: data.email,
                fullName: data.full_name,
                role: normalizeRole(data.role),
            };
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

    const value: AuthContextValue = { user, tokens, loading, login, logout, refreshTokens, refreshUser, authFetch };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

export const RoleGuard = ({ allowedRole, children }: { allowedRole: Role; children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace("/login/");
            return;
        }

        const actual = normalizeRole(user.role);
        if (actual !== allowedRole) {
            router.replace(`/dashboard/${actual}`);
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

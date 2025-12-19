"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiUrl, jsonHeaders, toApiError } from "@/lib/api-client";

type Role = "admin" | "franchise" | "parent";

type User = {
    id: string;
    email: string;
    role: Role;
    fullName?: string;
};

type Tokens = { access: string; refresh: string };

type AuthContextValue = {
    user: User | null;
    tokens: Tokens | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
    refreshTokens: () => Promise<Tokens | false>;
    authFetch: <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "tk-auth-session";

const normalizeRole = (role?: string | null): Role => {
    const mapped = (role || "").toLowerCase();
    if (mapped === "admin") return "admin";
    if (mapped === "franchise") return "franchise";
    return "parent";
};

type StoredAuth = {
    user: User;
    tokens: Tokens;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<Tokens | null>(null);
    const [loading, setLoading] = useState(true);

    const persist = (next: StoredAuth | null) => {
        if (typeof window === "undefined") return;
        if (!next) {
            localStorage.removeItem(STORAGE_KEY);
            return;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    useEffect(() => {
        const load = async () => {
            try {
                const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
                if (saved) {
                    const parsed = JSON.parse(saved) as StoredAuth;
                    setUser(parsed.user);
                    setTokens(parsed.tokens);
                    await hydrateUser(parsed.tokens, parsed.user);
                }
            } catch {
                // ignore corrupt storage
                persist(null);
            } finally {
                setLoading(false);
            }
        };
        load();
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
                const refreshed = await refreshTokens(existingTokens);
                if (refreshed) return hydrateUser(refreshed, existingUser);
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
            persist({ user: nextUser, tokens: existingTokens });
        } catch {
            // fail silently; will require login
        }
    };

    const login = async (email: string, password: string) => {
        const res = await fetch(apiUrl("/auth/login/"), {
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
        persist({ tokens: nextTokens, user: nextUser });
        return nextUser;
    };

    const logout = () => {
        setUser(null);
        setTokens(null);
        persist(null);
    };

    const refreshTokens = async (current: Tokens | null = tokens): Promise<Tokens | false> => {
        if (!current?.refresh) return false;
        const res = await fetch(apiUrl("/auth/refresh/"), {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify({ refresh: current.refresh }),
        });
        if (!res.ok) {
            logout();
            return false;
        }
        const data = await res.json();
        const next: Tokens = { access: data.access, refresh: current.refresh };
        setTokens(next);
        if (user) persist({ user, tokens: next });
        return next;
    };

    const authFetch = async <T = unknown>(path: string, init?: RequestInit, retry = true): Promise<T> => {
        const headers = new Headers(init?.headers || {});
        if (tokens?.access) headers.set("Authorization", `Bearer ${tokens.access}`);
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

    const value = useMemo(() => ({ user, tokens, loading, login, logout, refreshTokens, authFetch }), [user, tokens, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

export const RoleGuard = ({ allowed, children }: { allowed: Role[]; children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (loading || hasRedirected.current) return;
        if (!user) {
            hasRedirected.current = true;
            router.replace("/login/");
            return;
        }
        if (!allowed.includes(user.role)) {
            hasRedirected.current = true;
            router.replace(`/dashboard/${user.role}`);
        }
    }, [allowed, loading, pathname, router, user]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
                Checking access...
            </div>
        );
    }

    if (!user || !allowed.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
};

export type { Role, User };

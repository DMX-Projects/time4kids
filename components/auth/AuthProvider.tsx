"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Role = "admin" | "franchise" | "parent";

type User = {
    id: string;
    email: string;
    role: Role;
};

type AuthContextValue = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SAMPLE_USERS: Record<string, { password: string; role: Role; id: string }> = {
    "admin@test.com": { password: "Admin@123", role: "admin", id: "admin-1" },
    "franchise@test.com": { password: "Franchise@123", role: "franchise", id: "franchise-1" },
    "parent@test.com": { password: "Parent@123", role: "parent", id: "parent-1" },
};

const STORAGE_KEY = "tk-auth-user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as User;
                if (!parsed.id && SAMPLE_USERS[parsed.email]) {
                    parsed.id = SAMPLE_USERS[parsed.email].id;
                }
                setUser(parsed);
            }
        } catch {
            // ignore corrupt storage
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const normalized = email.trim().toLowerCase();
        const match = SAMPLE_USERS[normalized];
        if (!match || match.password !== password) {
            throw new Error("Invalid email or password");
        }
        const nextUser: User = { id: match.id, email: normalized, role: match.role };
        setUser(nextUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        return nextUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

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

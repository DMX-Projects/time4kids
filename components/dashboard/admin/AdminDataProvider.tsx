"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";

export type AdminFranchise = {
    id: string;
    name: string;
    owner: string;
    region: string;
    email: string;
    phone: string;
    status: string;
    city?: string;
    about?: string;
    programs?: string;
    facilities?: string;
};

export type AdminCareer = {
    id: string;
    title: string;
    dept: string;
    location: string;
    type: string;
};

export type AdminEvent = {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    year?: number | null;
    franchiseId: string;
    franchiseName?: string;
    franchiseCity?: string;
};

export type AdminProfile = {
    name: string;
    email: string;
    phone: string;
    role: string;
    location: string;
    bio: string;
    photo: string;
};

export type AdminStats = {
    activeUsers: number;
    franchises: number;
    enquiries: number;
    parents: number;
};

export type AdminDataContextValue = {
    franchises: AdminFranchise[];
    addFranchise: (payload: Omit<AdminFranchise, "id">) => Promise<void>;
    updateFranchise: (id: string, payload: Partial<AdminFranchise>) => Promise<void>;
    deleteFranchise: (id: string) => Promise<void>;
    getFranchiseDetail: (id: string) => Promise<AdminFranchise>;

    careers: AdminCareer[];
    addCareer: (payload: Omit<AdminCareer, "id">) => Promise<void>;
    updateCareer: (id: string, payload: Partial<AdminCareer>) => Promise<void>;
    deleteCareer: (id: string) => Promise<void>;

    events: AdminEvent[];
    addEvent: (payload: Omit<AdminEvent, "id" | "year" | "franchiseName" | "franchiseCity">) => Promise<void>;
    updateEvent: (id: string, payload: Partial<Omit<AdminEvent, "id" | "year">>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;

    profile: AdminProfile;
    updateProfile: (payload: Partial<AdminProfile>) => void;

    stats: AdminStats;
    refreshStats: () => Promise<void>;
};

const AdminDataContext = createContext<AdminDataContextValue | undefined>(undefined);

type ApiFranchise = {
    id: number;
    name: string;
    slug: string;
    city?: string;
    state?: string;
    country?: string;
    contact_email?: string;
    contact_phone?: string;
    is_active?: boolean;
    user?: { full_name?: string; email: string };
    about?: string;
    programs?: string;
    facilities?: string;
};

type ApiCareer = {
    id: number;
    title: string;
    department?: string;
    type?: string;
    description?: string;
    location?: string;
    apply_email?: string;
    is_active?: boolean;
};

type ApiEvent = {
    id: number;
    franchise: number;
    franchise_name?: string;
    franchise_city?: string;
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
    year?: number | null;
};

const mapFranchise = (fr: ApiFranchise): AdminFranchise => ({
    id: String(fr.id),
    name: fr.name,
    owner: fr.user?.full_name || fr.user?.email || "",
    region: fr.city || fr.state || fr.country || "",
    city: fr.city,
    email: fr.contact_email || fr.user?.email || "",
    phone: fr.contact_phone || "",
    status: fr.is_active === false ? "Inactive" : "Active",
    about: fr.about || "",
    programs: fr.programs || "",
    facilities: fr.facilities || "",
});

const mapCareer = (career: ApiCareer): AdminCareer => ({
    id: String(career.id),
    title: career.title,
    dept: career.department || "",
    location: career.location || "",
    type: career.type || "Full-time",
});

const mapEvent = (event: ApiEvent): AdminEvent => ({
    id: String(event.id),
    title: event.title,
    description: event.description || "",
    location: event.location || "",
    startDate: event.start_date || "",
    endDate: event.end_date || "",
    year: event.year ?? (event.start_date ? new Date(event.start_date).getFullYear() : null),
    franchiseId: String(event.franchise),
    franchiseName: event.franchise_name,
    franchiseCity: event.franchise_city,
});

const unwrapList = <T,>(data: any): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (data && Array.isArray(data.results)) return data.results as T[];
    return [];
};

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
    const { user, authFetch } = useAuth();

    const [franchises, setFranchises] = useState<AdminFranchise[]>([]);
    const [careers, setCareers] = useState<AdminCareer[]>([]);
    const [events, setEvents] = useState<AdminEvent[]>([]);

    const [profile, setProfile] = useState<AdminProfile>({
        name: "",
        email: "",
        phone: "",
        role: "Administrator",
        location: "",
        bio: "",
        photo: "",
    });

    const [stats, setStats] = useState<AdminStats>({ activeUsers: 0, franchises: 0, enquiries: 0, parents: 0 });

    useEffect(() => {
        const role = user?.role?.toLowerCase();
        if (role !== "admin") return;
        loadFranchises();
        loadCareers();
        loadEvents();
        loadStats();
        if (user) {
            setProfile((prev) => ({
                ...prev,
                name: user.fullName || prev.name || user.email,
                email: user.email,
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.role]);

    const loadFranchises = async () => {
        try {
            const data = await authFetch<ApiFranchise[] | { results: ApiFranchise[] }>("/franchises/admin/franchises/");
            const items = unwrapList<ApiFranchise>(data);
            setFranchises(items.map(mapFranchise));
        } catch {
            setFranchises([]);
        }
    };

    const loadCareers = async () => {
        try {
            const data = await authFetch<ApiCareer[] | { results: ApiCareer[] }>("/careers/admin/");
            const items = unwrapList<ApiCareer>(data);
            setCareers(items.map(mapCareer));
        } catch {
            setCareers([]);
        }
    };

    const loadEvents = async () => {
        try {
            const data = await authFetch<ApiEvent[] | { results: ApiEvent[] }>("/events/admin/");
            const items = unwrapList<ApiEvent>(data);
            setEvents(items.map(mapEvent));
        } catch {
            setEvents([]);
        }
    };

    const loadStats = async () => {
        try {
            const data = await authFetch<{ active_users: number; franchises: number; enquiries: number; parents: number }>("/accounts/admin/stats/");
            setStats({
                activeUsers: data.active_users,
                franchises: data.franchises,
                enquiries: data.enquiries,
                parents: data.parents,
            });
        } catch {
            setStats({ activeUsers: 0, franchises: 0, enquiries: 0, parents: 0 });
        }
    };

    const addFranchise = async (payload: Omit<AdminFranchise, "id">) => {
        const body = {
            name: payload.name,
            city: payload.region,
            contact_email: payload.email,
            contact_phone: payload.phone,
            franchise_email: payload.email,
            franchise_password: payload.email,
            franchise_full_name: payload.owner || payload.name,
            is_active: payload.status ? payload.status.toLowerCase() === "active" : undefined,
        };
        const created = await authFetch<ApiFranchise>("/franchises/admin/franchises/", {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        setFranchises((prev) => [mapFranchise(created), ...prev]);
    };

    const updateFranchise = async (id: string, payload: Partial<AdminFranchise>) => {
        const body = {
            name: payload.name,
            city: payload.region,
            contact_email: payload.email,
            contact_phone: payload.phone,
            is_active: payload.status ? payload.status.toLowerCase() === "active" : undefined,
        };
        const updated = await authFetch<ApiFranchise>(`/franchises/admin/franchises/${id}/`, {
            method: "PATCH",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        setFranchises((prev) => prev.map((f) => (f.id === id ? mapFranchise(updated) : f)));
    };

    const deleteFranchise = async (id: string) => {
        await authFetch(`/franchises/admin/franchises/${id}/`, { method: "DELETE" });
        setFranchises((prev) => prev.filter((f) => f.id !== id));
    };

    const addCareer = async (payload: Omit<AdminCareer, "id">) => {
        const body = {
            title: payload.title,
            department: payload.dept,
            type: payload.type,
            description: payload.dept, // Keep as fallback description for now or could be separate input
            location: payload.location,
            apply_email: user?.email,
            is_active: true,
        };
        const created = await authFetch<ApiCareer>("/careers/admin/", {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        setCareers((prev) => [mapCareer(created), ...prev]);
    };

    const updateCareer = async (id: string, payload: Partial<AdminCareer>) => {
        const body = {
            title: payload.title,
            department: payload.dept,
            type: payload.type,
            location: payload.location,
            is_active: true,
        };
        const updated = await authFetch<ApiCareer>(`/careers/admin/${id}/`, {
            method: "PATCH",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        setCareers((prev) => prev.map((c) => (c.id === id ? mapCareer(updated) : c)));
    };

    const deleteCareer = async (id: string) => {
        await authFetch(`/careers/admin/${id}/`, { method: "DELETE" });
        setCareers((prev) => prev.filter((c) => c.id !== id));
    };

    const addEvent = async (payload: Omit<AdminEvent, "id" | "year" | "franchiseName" | "franchiseCity">) => {
        const body = {
            title: payload.title,
            description: payload.description,
            location: payload.location,
            start_date: payload.startDate || null,
            end_date: payload.endDate || null,
            franchise: payload.franchiseId,
        };
        const created = await authFetch<ApiEvent>("/events/admin/", {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        setEvents((prev) => [mapEvent(created), ...prev]);
    };

    const updateEvent = async (id: string, payload: Partial<Omit<AdminEvent, "id" | "year">>) => {
        const body = {
            title: payload.title,
            description: payload.description,
            location: payload.location,
            start_date: payload.startDate || null,
            end_date: payload.endDate || null,
            franchise: payload.franchiseId,
        };
        const updated = await authFetch<ApiEvent>(`/events/admin/${id}/`, {
            method: "PATCH",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        setEvents((prev) => prev.map((evt) => (evt.id === id ? mapEvent(updated) : evt)));
    };

    const deleteEvent = async (id: string) => {
        await authFetch(`/events/admin/${id}/`, { method: "DELETE" });
        setEvents((prev) => prev.filter((evt) => evt.id !== id));
    };

    const updateProfile = (payload: Partial<AdminProfile>) => {
        setProfile((prev) => ({ ...prev, ...payload }));
    };

    const getFranchiseDetail = async (id: string) => {
        const data = await authFetch<ApiFranchise>(`/franchises/admin/franchises/${id}/`);
        return mapFranchise(data);
    };

    const value = useMemo(
        () => ({
            franchises,
            addFranchise,
            updateFranchise,
            deleteFranchise,
            getFranchiseDetail,
            careers,
            addCareer,
            updateCareer,
            deleteCareer,
            events,
            addEvent,
            updateEvent,
            deleteEvent,
            profile,
            updateProfile,
            stats,
            refreshStats: loadStats,
        }),
        [franchises, careers, events, profile, stats],
    );

    return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export const useAdminData = () => {
    const ctx = useContext(AdminDataContext);
    if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
    return ctx;
};

"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders, mediaUrl } from "@/lib/api-client";

export type FranchiseParent = { id: string; name: string; student: string; email: string; phone: string };
export type FranchiseEvent = { id: string; title: string; date: string; venue: string; notes: string };
export type FranchiseProfile = { name: string; email: string; phone: string; centre: string; city: string; bio: string; photo: string };

export type FranchiseDataContextValue = {
    parents: FranchiseParent[];
    addParent: (payload: Omit<FranchiseParent, "id">) => Promise<void>;
    updateParent: (id: string, payload: Partial<FranchiseParent>) => Promise<void>;
    deleteParent: (id: string) => Promise<void>;

    events: FranchiseEvent[];
    addEvent: (payload: Omit<FranchiseEvent, "id">) => Promise<void>;
    updateEvent: (id: string, payload: Partial<FranchiseEvent>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;

    profile: FranchiseProfile;
    updateProfile: (payload: Partial<FranchiseProfile>) => Promise<void>;
};

const FranchiseDataContext = createContext<FranchiseDataContextValue | undefined>(undefined);

type ApiParent = {
    id: number;
    user?: { full_name?: string; email: string };
    child_name?: string;
    notes?: string;
};

type ApiEvent = {
    id: number;
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
};

type ApiProfile = {
    id: number;
    name: string;
    about?: string;
    city?: string;
    contact_email?: string;
    contact_phone?: string;
    hero_image?: string;
};

const mapParent = (parent: ApiParent): FranchiseParent => ({
    id: String(parent.id),
    name: parent.user?.full_name || parent.user?.email || "",
    student: parent.child_name || "",
    email: parent.user?.email || "",
    phone: "",
});

const mapEvent = (event: ApiEvent): FranchiseEvent => ({
    id: String(event.id),
    title: event.title,
    date: event.start_date || event.end_date || "",
    venue: event.location || "",
    notes: event.description || "",
});

const mapProfile = (profile: ApiProfile): FranchiseProfile => ({
    name: profile.name,
    email: profile.contact_email || "",
    phone: profile.contact_phone || "",
    centre: profile.name,
    city: profile.city || "",
    bio: profile.about || "",
    photo: mediaUrl(profile.hero_image),
});

export function FranchiseDataProvider({ children }: { children: React.ReactNode }) {
    const { user, authFetch } = useAuth();

    const [parents, setParents] = useState<FranchiseParent[]>([]);
    const [events, setEvents] = useState<FranchiseEvent[]>([]);
    const [profile, setProfile] = useState<FranchiseProfile>({ name: "", email: "", phone: "", centre: "", city: "", bio: "", photo: "" });

    useEffect(() => {
        if (user?.role !== "franchise") return;
        loadProfile();
        loadParents();
        loadEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.role]);

    const loadParents = async () => {
        try {
            const data = await authFetch<ApiParent[]>("/franchises/franchise/parents/");
            setParents(data.map(mapParent));
        } catch {
            setParents([]);
        }
    };

    const loadEvents = async () => {
        try {
            const data = await authFetch<ApiEvent[]>("/events/franchise/");
            setEvents(data.map(mapEvent));
        } catch {
            setEvents([]);
        }
    };

    const loadProfile = async () => {
        try {
            const data = await authFetch<ApiProfile>("/franchises/franchise/profile/");
            setProfile(mapProfile(data));
        } catch {
            // ignore
        }
    };

    const addParent = async (payload: Omit<FranchiseParent, "id">) => {
        const body = {
            email: payload.email,
            password: crypto.randomUUID().slice(0, 12),
            full_name: payload.name,
            child_name: payload.student,
            notes: payload.phone,
        };
        const created = await authFetch<ApiParent>("/franchises/franchise/parents/", {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        setParents((prev) => [mapParent(created), ...prev]);
    };

    const updateParent = async (id: string, payload: Partial<FranchiseParent>) => {
        const body = {
            child_name: payload.student,
            notes: payload.phone,
        };
        const updated = await authFetch<ApiParent>(`/franchises/franchise/parents/${id}/`, {
            method: "PATCH",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        setParents((prev) => prev.map((p) => (p.id === id ? mapParent(updated) : p)));
    };

    const deleteParent = async (id: string) => {
        await authFetch(`/franchises/franchise/parents/${id}/`, { method: "DELETE" });
        setParents((prev) => prev.filter((p) => p.id !== id));
    };

    const addEvent = async (payload: Omit<FranchiseEvent, "id">) => {
        const body = {
            title: payload.title,
            description: payload.notes,
            start_date: payload.date,
            end_date: payload.date,
            location: payload.venue,
        };
        const created = await authFetch<ApiEvent>("/events/franchise/", {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        setEvents((prev) => [mapEvent(created), ...prev]);
    };

    const updateEvent = async (id: string, payload: Partial<FranchiseEvent>) => {
        const body = {
            title: payload.title,
            description: payload.notes,
            start_date: payload.date,
            end_date: payload.date,
            location: payload.venue,
        };
        const updated = await authFetch<ApiEvent>(`/events/franchise/${id}/`, {
            method: "PATCH",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        setEvents((prev) => prev.map((ev) => (ev.id === id ? mapEvent(updated) : ev)));
    };

    const deleteEvent = async (id: string) => {
        await authFetch(`/events/franchise/${id}/`, { method: "DELETE" });
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
    };

    const updateProfile = async (payload: Partial<FranchiseProfile>) => {
        const body = {
            name: payload.centre || payload.name,
            contact_email: payload.email,
            contact_phone: payload.phone,
            city: payload.city,
            about: payload.bio,
        };
        const updated = await authFetch<ApiProfile>("/franchises/franchise/profile/", {
            method: "PATCH",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        setProfile(mapProfile(updated));
    };

    const value = useMemo(
        () => ({
            parents,
            addParent,
            updateParent,
            deleteParent,
            events,
            addEvent,
            updateEvent,
            deleteEvent,
            profile,
            updateProfile,
        }),
        [parents, events, profile],
    );

    return <FranchiseDataContext.Provider value={value}>{children}</FranchiseDataContext.Provider>;
}

export const useFranchiseData = () => {
    const ctx = useContext(FranchiseDataContext);
    if (!ctx) throw new Error("useFranchiseData must be used within FranchiseDataProvider");
    return ctx;
};

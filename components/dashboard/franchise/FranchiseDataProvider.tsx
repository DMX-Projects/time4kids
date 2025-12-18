"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type FranchiseParent = { id: string; name: string; student: string; email: string; phone: string };
export type FranchiseEvent = { id: string; title: string; date: string; venue: string; notes: string };
export type FranchiseSchool = { id: string; name: string; city: string; contact: string; phone: string };
export type FranchiseProfile = { name: string; email: string; phone: string; centre: string; city: string; bio: string; photo: string };

export type FranchiseDataContextValue = {
    parents: FranchiseParent[];
    addParent: (payload: Omit<FranchiseParent, "id">) => void;
    updateParent: (id: string, payload: Partial<FranchiseParent>) => void;
    deleteParent: (id: string) => void;

    events: FranchiseEvent[];
    addEvent: (payload: Omit<FranchiseEvent, "id">) => void;
    updateEvent: (id: string, payload: Partial<FranchiseEvent>) => void;
    deleteEvent: (id: string) => void;

    schools: FranchiseSchool[];
    addSchool: (payload: Omit<FranchiseSchool, "id">) => void;
    updateSchool: (id: string, payload: Partial<FranchiseSchool>) => void;
    deleteSchool: (id: string) => void;

    profile: FranchiseProfile;
    updateProfile: (payload: Partial<FranchiseProfile>) => void;
};

const FranchiseDataContext = createContext<FranchiseDataContextValue | undefined>(undefined);

export function FranchiseDataProvider({ children }: { children: React.ReactNode }) {
    const [parents, setParents] = useState<FranchiseParent[]>([
        { id: "p-1", name: "Lakshmi Rao", student: "Aarav Rao", email: "lakshmi@home.com", phone: "+91 98765 12345" },
    ]);

    const [events, setEvents] = useState<FranchiseEvent[]>([
        { id: "e-1", title: "Sports Day", date: "2025-02-12", venue: "Main Ground", notes: "Parents welcome" },
    ]);

    const [schools, setSchools] = useState<FranchiseSchool[]>([
        { id: "s-1", name: "Green Valley", city: "Bangalore", contact: "Nisha", phone: "+91 90000 22222" },
    ]);

    const [profile, setProfile] = useState<FranchiseProfile>({
        name: "Kiran Malhotra",
        email: "franchise@time4kids.com",
        phone: "+91 92222 11111",
        centre: "Time4Kids - Koramangala",
        city: "Bangalore",
        bio: "Runs daily operations and parent success",
        photo: "",
    });

    const addParent = (payload: Omit<FranchiseParent, "id">) => setParents((prev) => [...prev, { id: crypto.randomUUID(), ...payload }]);
    const updateParent = (id: string, payload: Partial<FranchiseParent>) => setParents((prev) => prev.map((p) => (p.id === id ? { ...p, ...payload } : p)));
    const deleteParent = (id: string) => setParents((prev) => prev.filter((p) => p.id !== id));

    const addEvent = (payload: Omit<FranchiseEvent, "id">) => setEvents((prev) => [...prev, { id: crypto.randomUUID(), ...payload }]);
    const updateEvent = (id: string, payload: Partial<FranchiseEvent>) => setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...payload } : ev)));
    const deleteEvent = (id: string) => setEvents((prev) => prev.filter((ev) => ev.id !== id));

    const addSchool = (payload: Omit<FranchiseSchool, "id">) => setSchools((prev) => [...prev, { id: crypto.randomUUID(), ...payload }]);
    const updateSchool = (id: string, payload: Partial<FranchiseSchool>) => setSchools((prev) => prev.map((s) => (s.id === id ? { ...s, ...payload } : s)));
    const deleteSchool = (id: string) => setSchools((prev) => prev.filter((s) => s.id !== id));

    const updateProfile = (payload: Partial<FranchiseProfile>) => setProfile((prev) => ({ ...prev, ...payload }));

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
            schools,
            addSchool,
            updateSchool,
            deleteSchool,
            profile,
            updateProfile,
        }),
        [parents, events, schools, profile],
    );

    return <FranchiseDataContext.Provider value={value}>{children}</FranchiseDataContext.Provider>;
}

export const useFranchiseData = () => {
    const ctx = useContext(FranchiseDataContext);
    if (!ctx) throw new Error("useFranchiseData must be used within FranchiseDataProvider");
    return ctx;
};

"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type AdminFranchise = {
    id: string;
    name: string;
    owner: string;
    region: string;
    email: string;
    phone: string;
    status: string;
};

export type AdminCareer = {
    id: string;
    title: string;
    dept: string;
    location: string;
    type: string;
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

export type AdminDataContextValue = {
    franchises: AdminFranchise[];
    addFranchise: (payload: Omit<AdminFranchise, "id">) => void;
    updateFranchise: (id: string, payload: Partial<AdminFranchise>) => void;
    deleteFranchise: (id: string) => void;

    careers: AdminCareer[];
    addCareer: (payload: Omit<AdminCareer, "id">) => void;
    updateCareer: (id: string, payload: Partial<AdminCareer>) => void;
    deleteCareer: (id: string) => void;

    profile: AdminProfile;
    updateProfile: (payload: Partial<AdminProfile>) => void;
};

const AdminDataContext = createContext<AdminDataContextValue | undefined>(undefined);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
    const [franchises, setFranchises] = useState<AdminFranchise[]>([
        { id: "fr-1", name: "Sunrise Kids", owner: "Meera Shah", region: "Bangalore", email: "meera@sunrise.com", phone: "+91 99888 12345", status: "Active" },
        { id: "fr-2", name: "Bright Minds", owner: "Rahul Verma", region: "Hyderabad", email: "rahul@brightminds.com", phone: "+91 98765 45678", status: "Pending" },
    ]);

    const [careers, setCareers] = useState<AdminCareer[]>([
        { id: "car-1", title: "Centre Manager", dept: "Operations", location: "Bangalore", type: "Full-time" },
        { id: "car-2", title: "Early Years Educator", dept: "Academics", location: "Hyderabad", type: "Part-time" },
    ]);

    const [profile, setProfile] = useState<AdminProfile>({
        name: "Ananya Rao",
        email: "admin@time4kids.com",
        phone: "+91 90000 11111",
        role: "Administrator",
        location: "Bangalore",
        bio: "Oversees all centres and compliance.",
        photo: "",
    });

    const addFranchise = (payload: Omit<AdminFranchise, "id">) => {
        setFranchises((prev) => [...prev, { id: crypto.randomUUID(), ...payload }]);
    };

    const updateFranchise = (id: string, payload: Partial<AdminFranchise>) => {
        setFranchises((prev) => prev.map((f) => (f.id === id ? { ...f, ...payload } : f)));
    };

    const deleteFranchise = (id: string) => {
        setFranchises((prev) => prev.filter((f) => f.id !== id));
    };

    const addCareer = (payload: Omit<AdminCareer, "id">) => {
        setCareers((prev) => [...prev, { id: crypto.randomUUID(), ...payload }]);
    };

    const updateCareer = (id: string, payload: Partial<AdminCareer>) => {
        setCareers((prev) => prev.map((c) => (c.id === id ? { ...c, ...payload } : c)));
    };

    const deleteCareer = (id: string) => {
        setCareers((prev) => prev.filter((c) => c.id !== id));
    };

    const updateProfile = (payload: Partial<AdminProfile>) => {
        setProfile((prev) => ({ ...prev, ...payload }));
    };

    const value = useMemo(
        () => ({
            franchises,
            addFranchise,
            updateFranchise,
            deleteFranchise,
            careers,
            addCareer,
            updateCareer,
            deleteCareer,
            profile,
            updateProfile,
        }),
        [franchises, careers, profile],
    );

    return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export const useAdminData = () => {
    const ctx = useContext(AdminDataContext);
    if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
    return ctx;
};

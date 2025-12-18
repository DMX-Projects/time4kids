"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type StudentProfile = { name: string; grade: string; section: string; blood: string; emergency: string };
export type GradeRow = { id: string; subject: string; grade: string; term: string };
export type EventRow = { id: string; title: string; date: string; venue: string; rsvp?: string };
export type AchievementRow = { id: string; title: string; date: string; notes: string };
export type PhotoRow = { id: string; title: string; url: string };
export type ParentProfile = { name: string; email: string; phone: string; address: string; city: string; photo: string };

export type ParentDataContextValue = {
    studentProfile: StudentProfile;
    updateStudentProfile: (payload: Partial<StudentProfile>) => void;

    grades: GradeRow[];
    addGrade: (payload: Omit<GradeRow, "id">) => void;
    updateGrade: (id: string, payload: Partial<GradeRow>) => void;
    deleteGrade: (id: string) => void;

    events: EventRow[];
    addEvent: (payload: Omit<EventRow, "id">) => void;
    updateEvent: (id: string, payload: Partial<EventRow>) => void;
    deleteEvent: (id: string) => void;

    achievements: AchievementRow[];
    addAchievement: (payload: Omit<AchievementRow, "id">) => void;
    updateAchievement: (id: string, payload: Partial<AchievementRow>) => void;
    deleteAchievement: (id: string) => void;

    photos: PhotoRow[];
    addPhoto: (payload: Omit<PhotoRow, "id">) => void;
    deletePhoto: (id: string) => void;

    parentProfile: ParentProfile;
    updateParentProfile: (payload: Partial<ParentProfile>) => void;
};

const ParentDataContext = createContext<ParentDataContextValue | undefined>(undefined);

export function ParentDataProvider({ children }: { children: React.ReactNode }) {
    const [studentProfile, setStudentProfile] = useState<StudentProfile>({
        name: "Aarav T.",
        grade: "KG-2",
        section: "A",
        blood: "B+",
        emergency: "+91 90000 33333",
    });

    const [grades, setGrades] = useState<GradeRow[]>([{ id: "g-1", subject: "Math", grade: "A", term: "Term 1" }]);

    const [events, setEvents] = useState<EventRow[]>([
        { id: "ev-1", title: "Annual Day", date: "2025-01-20", venue: "Auditorium", rsvp: "Going" },
    ]);

    const [achievements, setAchievements] = useState<AchievementRow[]>([
        { id: "a-1", title: "Star Reader", date: "2024-12-05", notes: "Completed 10 books" },
    ]);

    const [photos, setPhotos] = useState<PhotoRow[]>([
        { id: "ph-1", title: "Sports Day", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60" },
    ]);

    const [parentProfile, setParentProfile] = useState<ParentProfile>({
        name: "Tarun Mehta",
        email: "parent@time4kids.com",
        phone: "+91 98888 44444",
        address: "12, Lake View Road",
        city: "Bangalore",
        photo: "",
    });

    const updateStudentProfile = (payload: Partial<StudentProfile>) => setStudentProfile((prev) => ({ ...prev, ...payload }));

    const addGrade = (payload: Omit<GradeRow, "id">) => setGrades((prev) => [...prev, { id: crypto.randomUUID(), ...payload }]);
    const updateGrade = (id: string, payload: Partial<GradeRow>) => setGrades((prev) => prev.map((g) => (g.id === id ? { ...g, ...payload } : g)));
    const deleteGrade = (id: string) => setGrades((prev) => prev.filter((g) => g.id !== id));

    const addEvent = (payload: Omit<EventRow, "id">) => setEvents((prev) => [...prev, { id: crypto.randomUUID(), ...payload }]);
    const updateEvent = (id: string, payload: Partial<EventRow>) => setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...payload } : ev)));
    const deleteEvent = (id: string) => setEvents((prev) => prev.filter((ev) => ev.id !== id));

    const addAchievement = (payload: Omit<AchievementRow, "id">) => setAchievements((prev) => [...prev, { id: crypto.randomUUID(), ...payload }]);
    const updateAchievement = (id: string, payload: Partial<AchievementRow>) => setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, ...payload } : a)));
    const deleteAchievement = (id: string) => setAchievements((prev) => prev.filter((a) => a.id !== id));

    const addPhoto = (payload: Omit<PhotoRow, "id">) => setPhotos((prev) => [...prev, { id: crypto.randomUUID(), ...payload }]);
    const deletePhoto = (id: string) => setPhotos((prev) => prev.filter((p) => p.id !== id));

    const updateParentProfile = (payload: Partial<ParentProfile>) => setParentProfile((prev) => ({ ...prev, ...payload }));

    const value = useMemo(
        () => ({
            studentProfile,
            updateStudentProfile,
            grades,
            addGrade,
            updateGrade,
            deleteGrade,
            events,
            addEvent,
            updateEvent,
            deleteEvent,
            achievements,
            addAchievement,
            updateAchievement,
            deleteAchievement,
            photos,
            addPhoto,
            deletePhoto,
            parentProfile,
            updateParentProfile,
        }),
        [studentProfile, grades, events, achievements, photos, parentProfile],
    );

    return <ParentDataContext.Provider value={value}>{children}</ParentDataContext.Provider>;
}

export const useParentData = () => {
    const ctx = useContext(ParentDataContext);
    if (!ctx) throw new Error("useParentData must be used within ParentDataProvider");
    return ctx;
};

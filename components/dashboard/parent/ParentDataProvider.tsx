"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { SchoolStudent } from "@/components/dashboard/shared/SchoolDataProvider";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";
import { jsonHeaders } from "@/lib/api-client";
import { safeRandomId } from "@/lib/utils";

export type StudentProfile = { name: string; grade: string; section: string; blood: string; emergency: string };
export type GradeRow = { id: string; subject: string; grade: string; term: string };
export type EventRow = { id: string; title: string; date: string; venue: string; rsvp?: string };
export type AchievementRow = { id: string; title: string; date: string; notes: string; studentName?: string | null; scope?: string };
export type PhotoRow = { id: string; title: string; url: string };

export type ParentProfile = {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    photo: string;
    franchiseName?: string;
    franchisePhone?: string;
    franchiseEmail?: string;
    notifications_muted?: boolean;
};

type ParentProfileApi = {
    full_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    photo_url?: string;
    franchise_name?: string;
    franchise_contact_phone?: string;
    franchise_contact_email?: string;
    notifications_muted?: boolean;
};

type AchievementApi = {
    id: number;
    title: string;
    notes?: string;
    achieved_date?: string | null;
    student_name?: string | null;
    scope?: string;
};

export type ParentDataContextValue = {
    studentProfile: StudentProfile;
    updateStudentProfile: (payload: Partial<StudentProfile>) => void;

    linkedStudents: SchoolStudent[];
    selectedStudentId: string | null;
    setSelectedStudentId: (id: string | null) => void;

    grades: GradeRow[];
    addGrade: (payload: Omit<GradeRow, "id">) => void;
    updateGrade: (id: string, payload: Partial<GradeRow>) => void;
    deleteGrade: (id: string) => void;

    events: EventRow[];
    addEvent: (payload: Omit<EventRow, "id">) => void;
    updateEvent: (id: string, payload: Partial<EventRow>) => void;
    deleteEvent: (id: string) => void;

    achievements: AchievementRow[];
    achievementsLoading: boolean;
    reloadAchievements: () => Promise<void>;

    photos: PhotoRow[];
    addPhoto: (payload: Omit<PhotoRow, "id">) => void;
    deletePhoto: (id: string) => void;

    parentProfile: ParentProfile;
    parentProfileLoading: boolean;
    updateParentProfile: (payload: Partial<ParentProfile>) => Promise<void>;
};

const ParentDataContext = createContext<ParentDataContextValue | undefined>(undefined);

export function ParentDataProvider({ children }: { children: React.ReactNode }) {
    const { user, authFetch, refreshUser } = useAuth();
    const { parentSchoolLoading, students } = useSchoolData();

    const [studentProfile, setStudentProfile] = useState<StudentProfile>({
        name: "",
        grade: "",
        section: "",
        blood: "",
        emergency: "",
    });

    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const [grades, setGrades] = useState<GradeRow[]>([]);
    const [events, setEvents] = useState<EventRow[]>([]);
    const [achievements, setAchievements] = useState<AchievementRow[]>([]);
    const [achievementsLoading, setAchievementsLoading] = useState(false);
    const [photos, setPhotos] = useState<PhotoRow[]>([]);

    const [parentProfile, setParentProfile] = useState<ParentProfile>({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        photo: "",
        notifications_muted: false,
    });
    const [parentProfileLoading, setParentProfileLoading] = useState(true);

    const parentId = user?.id ?? "";
    const linkedStudents = user?.role === "parent" ? students : [];

    useEffect(() => {
        if (user?.role !== "parent" || parentSchoolLoading) return;
        if (linkedStudents.length === 0) {
            setSelectedStudentId(null);
            return;
        }
        setSelectedStudentId((prev) => {
            if (prev && linkedStudents.some((s) => s.id === prev)) return prev;
            return linkedStudents[0].id;
        });
    }, [user?.role, parentSchoolLoading, linkedStudents]);

    useEffect(() => {
        if (user?.role !== "parent" || parentSchoolLoading || !user.id) {
            if (user?.role !== "parent") {
                setStudentProfile({ name: "", grade: "", section: "", blood: "", emergency: "" });
            }
            return;
        }
        if (linkedStudents.length === 0) {
            setStudentProfile({ name: "", grade: "", section: "", blood: "", emergency: "" });
            return;
        }
        const sid = selectedStudentId && linkedStudents.some((s) => s.id === selectedStudentId) ? selectedStudentId : linkedStudents[0].id;
        const s = linkedStudents.find((x) => x.id === sid) ?? linkedStudents[0];
        setStudentProfile({
            name: s.name,
            grade: s.grade,
            section: s.section,
            blood: s.blood || "",
            emergency: s.emergency || "",
        });
    }, [user?.role, user?.id, parentSchoolLoading, linkedStudents, selectedStudentId]);

    useEffect(() => {
        if (user?.role !== "parent") {
            setParentProfileLoading(false);
            return;
        }
        let cancelled = false;
        setParentProfileLoading(true);
        (async () => {
            try {
                const data = await authFetch<ParentProfileApi>("/accounts/parent/profile/");
                if (cancelled) return;
                setParentProfile({
                    name: String(data.full_name ?? user.fullName ?? ""),
                    email: String(data.email ?? user.email ?? ""),
                    phone: String(data.phone ?? ""),
                    address: String(data.address ?? ""),
                    city: String(data.city ?? ""),
                    photo: String(data.photo_url ?? ""),
                    franchiseName: String(data.franchise_name ?? ""),
                    franchisePhone: String(data.franchise_contact_phone ?? ""),
                    franchiseEmail: String(data.franchise_contact_email ?? ""),
                    notifications_muted: Boolean(data.notifications_muted),
                });
            } catch {
                if (!cancelled) {
                    setParentProfile((prev) => ({
                        ...prev,
                        name: user.fullName || prev.name || user.email,
                        email: user.email,
                    }));
                }
            } finally {
                if (!cancelled) setParentProfileLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user?.role, user?.id, user?.email, user?.fullName, authFetch]);

    const mapAchievements = useCallback((list: AchievementApi[]): AchievementRow[] => {
        return list.map((a) => ({
            id: String(a.id),
            title: a.title,
            date: a.achieved_date || "",
            notes: a.notes || "",
            studentName: a.student_name ?? null,
            scope: a.scope,
        }));
    }, []);

    const reloadAchievements = useCallback(async () => {
        if (user?.role !== "parent") return;
        setAchievementsLoading(true);
        try {
            const raw = await authFetch<AchievementApi[] | { results?: AchievementApi[] }>("/students/parent/achievements/");
            const list = Array.isArray(raw) ? raw : raw?.results ?? [];
            setAchievements(mapAchievements(list));
        } catch {
            setAchievements([]);
        } finally {
            setAchievementsLoading(false);
        }
    }, [authFetch, mapAchievements, user?.role]);

    useEffect(() => {
        if (user?.role !== "parent") return;
        void reloadAchievements();
    }, [user?.role, user?.id, reloadAchievements]);

    const updateStudentProfile = (payload: Partial<StudentProfile>) => setStudentProfile((prev) => ({ ...prev, ...payload }));

    const addGrade = (payload: Omit<GradeRow, "id">) =>
        setGrades((prev) => [...prev, { id: safeRandomId(), ...payload }]);
    const updateGrade = (id: string, payload: Partial<GradeRow>) => setGrades((prev) => prev.map((g) => (g.id === id ? { ...g, ...payload } : g)));
    const deleteGrade = (id: string) => setGrades((prev) => prev.filter((g) => g.id !== id));

    const addEvent = (payload: Omit<EventRow, "id">) => setEvents((prev) => [...prev, { id: safeRandomId(), ...payload }]);
    const updateEvent = (id: string, payload: Partial<EventRow>) => setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...payload } : ev)));
    const deleteEvent = (id: string) => setEvents((prev) => prev.filter((ev) => ev.id !== id));

    const addPhoto = (payload: Omit<PhotoRow, "id">) => setPhotos((prev) => [...prev, { id: safeRandomId(), ...payload }]);
    const deletePhoto = (id: string) => setPhotos((prev) => prev.filter((p) => p.id !== id));

    const updateParentProfile = useCallback(
        async (payload: Partial<ParentProfile>) => {
            let merged!: ParentProfile;
            setParentProfile((prev) => {
                merged = { ...prev, ...payload };
                return merged;
            });
            const patchBody: Record<string, unknown> = {
                full_name: merged.name,
                phone: merged.phone,
                address: merged.address,
                city: merged.city,
                photo_url: merged.photo,
            };
            if (merged.notifications_muted !== undefined) {
                patchBody.notifications_muted = merged.notifications_muted;
            }
            await authFetch("/accounts/parent/profile/", {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify(patchBody),
            });
            await refreshUser();
        },
        [authFetch, refreshUser],
    );

    const value: ParentDataContextValue = {
        studentProfile,
        updateStudentProfile,
        linkedStudents,
        selectedStudentId,
        setSelectedStudentId,
        grades,
        addGrade,
        updateGrade,
        deleteGrade,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        achievements,
        achievementsLoading,
        reloadAchievements,
        photos,
        addPhoto,
        deletePhoto,
        parentProfile,
        parentProfileLoading,
        updateParentProfile,
    };

    return <ParentDataContext.Provider value={value}>{children}</ParentDataContext.Provider>;
}

export const useParentData = () => {
    const ctx = useContext(ParentDataContext);
    if (!ctx) throw new Error("useParentData must be used within ParentDataProvider");
    return ctx;
};

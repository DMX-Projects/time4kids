"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiUrl, jsonHeaders, mediaUrl, toApiError } from "@/lib/api-client";

export type SchoolParent = {
    id: string;
    name: string;
    email: string;
    phone: string;
};

export type SchoolStudent = {
    id: string;
    rollNumber: string;
    name: string;
    grade: string;
    section: string;
    parentId: string;
};

export type GradeRecord = {
    id: string;
    studentId: string;
    subject: string;
    term: string;
    grade?: string;
    score?: number;
    remarks?: string;
};

export type EventRecord = {
    id: string;
    title: string;
    date: string;
    venue: string;
    notes?: string;
};

export type EventMedia = {
    id: string;
    type: "image" | "video";
    title: string;
    url: string;
    description?: string;
    eventId?: string;
    studentId?: string;
};

type AddEventMediaPayload = Omit<EventMedia, "id" | "url"> & { url?: string; file?: File };

export type EnquiryType = "admission" | "franchise" | "contact";

export type Enquiry = {
    id: string;
    type: EnquiryType;
    name: string;
    email: string;
    phone?: string;
    message: string;
    createdAt: string;
    status: "new" | "in-progress" | "closed";
    channel: "web" | "dashboard";
};

export type BulkGradeRow = {
    rollNumber: string;
    studentName?: string;
    gradeLevel?: string;
    section?: string;
    subject: string;
    term: string;
    grade?: string;
    score?: number;
};

export type SchoolDataContextValue = {
    parents: SchoolParent[];
    students: SchoolStudent[];
    grades: GradeRecord[];
    events: EventRecord[];
    eventMedia: EventMedia[];
    enquiries: Enquiry[];

    addOrUpdateParent: (payload: SchoolParent) => void;
    addOrUpdateStudent: (payload: Omit<SchoolStudent, "id"> & { id?: string }) => SchoolStudent;
    addGrade: (payload: Omit<GradeRecord, "id">) => void;
    addGradesBulk: (rows: BulkGradeRow[]) => { inserted: number; skipped: number };
    addEvent: (payload: Omit<EventRecord, "id">) => Promise<void>;
    updateEvent: (id: string, payload: Partial<EventRecord>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    addEventMedia: (payload: AddEventMediaPayload) => Promise<void>;
    addEnquiry: (payload: Omit<Enquiry, "id" | "createdAt" | "status" | "channel"> & { status?: Enquiry["status"]; channel?: Enquiry["channel"] }) => Promise<void>;

    getStudentsForParent: (parentId: string) => SchoolStudent[];
    getGradesForParent: (parentId: string) => GradeRecord[];
    getEventMediaForParent: (parentId: string) => EventMedia[];
};

const SchoolDataContext = createContext<SchoolDataContextValue | undefined>(undefined);

const safeUUID = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

type ApiEvent = {
    id: number;
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
    media?: ApiEventMedia[];
};

type ApiEventMedia = {
    id: number;
    file: string;
    media_type?: string;
    caption?: string;
};

type ApiEnquiry = {
    id: number;
    enquiry_type: string;
    name: string;
    email: string;
    phone?: string;
    message?: string;
    city?: string;
    child_age?: string;
    created_at: string;
};

const mapEvent = (ev: ApiEvent): EventRecord => ({
    id: String(ev.id),
    title: ev.title,
    date: ev.start_date || ev.end_date || "",
    venue: ev.location || "",
    notes: ev.description || "",
});

const mapMedia = (media: ApiEventMedia, eventId?: string): EventMedia => ({
    id: String(media.id),
    type: (media.media_type || "image").toLowerCase() === "video" ? "video" : "image",
    title: media.caption || "",
    url: mediaUrl(media.file),
    eventId,
});

const mapEnquiry = (enq: ApiEnquiry): Enquiry => ({
    id: String(enq.id),
    type: (enq.enquiry_type || "contact").toLowerCase() as EnquiryType,
    name: enq.name,
    email: enq.email,
    phone: enq.phone,
    message: enq.message || "",
    createdAt: enq.created_at,
    status: "new",
    channel: "dashboard",
});

export function SchoolDataProvider({ children }: { children: React.ReactNode }) {
    const { user, authFetch } = useAuth();

    const [parents, setParents] = useState<SchoolParent[]>([]);
    const [students, setStudents] = useState<SchoolStudent[]>([]);
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [events, setEvents] = useState<EventRecord[]>([]);
    const [eventMedia, setEventMedia] = useState<EventMedia[]>([]);
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

    useEffect(() => {
        if (!user) {
            setEvents([]);
            setEventMedia([]);
            setEnquiries([]);
            return;
        }

        if (user.role === "parent") {
            loadParentEvents();
        } else if (user.role === "franchise") {
            loadFranchiseEvents();
            loadFranchiseEnquiries();
        } else if (user.role === "admin") {
            loadAdminEnquiries();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.role]);

    const loadParentEvents = async () => {
        try {
            const data = await authFetch<ApiEvent[]>("/events/parent/");
            ingestEvents(data);
        } catch {
            setEvents([]);
        }
    };

    const loadFranchiseEvents = async () => {
        try {
            const data = await authFetch<ApiEvent[]>("/events/franchise/");
            ingestEvents(data);
        } catch {
            setEvents([]);
        }
    };

    const loadAdminEnquiries = async () => {
        try {
            const data = await authFetch<ApiEnquiry[]>("/enquiries/admin/");
            setEnquiries(data.map(mapEnquiry));
        } catch {
            setEnquiries([]);
        }
    };

    const loadFranchiseEnquiries = async () => {
        try {
            const data = await authFetch<ApiEnquiry[]>("/enquiries/franchise/");
            setEnquiries(data.map(mapEnquiry));
        } catch {
            setEnquiries([]);
        }
    };

    const ingestEvents = (items: ApiEvent[]) => {
        const mappedEvents = items.map(mapEvent);
        const flattenedMedia = items.flatMap((ev) => (ev.media || []).map((m) => mapMedia(m, String(ev.id))));
        setEvents(mappedEvents);
        setEventMedia(flattenedMedia);
    };

    const addOrUpdateParent = (payload: SchoolParent) => {
        setParents((prev) => {
            const idx = prev.findIndex((p) => p.id === payload.id);
            if (idx === -1) return [...prev, payload];
            const next = [...prev];
            next[idx] = { ...next[idx], ...payload };
            return next;
        });
    };

    const addOrUpdateStudent = (payload: Omit<SchoolStudent, "id"> & { id?: string }) => {
        const id = payload.id || safeUUID();
        setStudents((prev) => {
            const idx = prev.findIndex((s) => s.id === id || s.rollNumber === payload.rollNumber);
            const nextStudent = { id, ...payload } as SchoolStudent;
            if (idx === -1) return [...prev, nextStudent];
            const next = [...prev];
            next[idx] = { ...next[idx], ...nextStudent };
            return next;
        });
        return { id, ...payload } as SchoolStudent;
    };

    const addGrade = (payload: Omit<GradeRecord, "id">) => setGrades((prev) => [...prev, { id: safeUUID(), ...payload }]);

    const addGradesBulk = (rows: BulkGradeRow[]) => {
        let inserted = 0;
        let skipped = 0;
        rows.forEach((row) => {
            const roll = row.rollNumber.trim();
            if (!roll || !row.subject.trim()) {
                skipped += 1;
                return;
            }
            const existing = students.find((s) => s.rollNumber === roll);
            const student = addOrUpdateStudent({
                rollNumber: roll,
                name: row.studentName || `Student ${roll}`,
                grade: row.gradeLevel || existing?.grade || "",
                section: row.section || existing?.section || "",
                parentId: existing?.parentId || "parent-1",
                id: existing?.id,
            });
            addGrade({
                studentId: student.id,
                subject: row.subject,
                term: row.term || "Term 1",
                grade: row.grade,
                score: row.score,
            });
            inserted += 1;
        });
        return { inserted, skipped };
    };

    const addEvent = async (payload: Omit<EventRecord, "id">) => {
        if (user?.role !== "franchise") throw new Error("Only franchise users can create events");
        const body = {
            title: payload.title,
            description: payload.notes || "",
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

    const updateEvent = async (id: string, payload: Partial<EventRecord>) => {
        if (user?.role !== "franchise") throw new Error("Only franchise users can update events");
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
        if (user?.role !== "franchise") throw new Error("Only franchise users can delete events");
        await authFetch(`/events/franchise/${id}/`, { method: "DELETE" });
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
        setEventMedia((prev) => prev.filter((m) => m.eventId !== id));
    };

    const addEventMedia = async (payload: AddEventMediaPayload) => {
        if (user?.role !== "franchise") throw new Error("Only franchise users can upload media");
        if (!payload.eventId) throw new Error("Select an event before uploading media");
        try {
            const formData = new FormData();
            if (payload.file) {
                formData.append("file", payload.file);
            } else if (payload.url) {
                const response = await fetch(payload.url);
                if (!response.ok) throw new Error("Unable to fetch media from the provided URL");
                const blob = await response.blob();
                const fileName = payload.url.split("/").pop() || `upload-${Date.now()}`;
                formData.append("file", new File([blob], fileName, { type: blob.type || "application/octet-stream" }));
            } else {
                throw new Error("Upload a file or provide a URL");
            }
            formData.append("media_type", payload.type === "video" ? "VIDEO" : "IMAGE");
            if (payload.description) formData.append("caption", payload.description);

            const saved = await authFetch<ApiEventMedia>(`/events/franchise/${payload.eventId}/media/`, {
                method: "POST",
                body: formData,
            });
            setEventMedia((prev) => [mapMedia(saved, payload.eventId), ...prev]);
        } catch (err) {
            if (err instanceof Error) throw err;
            throw new Error("Unable to upload media");
        }
    };

    const addEnquiry = async (
        payload: Omit<Enquiry, "id" | "createdAt" | "status" | "channel"> & { status?: Enquiry["status"]; channel?: Enquiry["channel"] },
    ) => {
        const enquiry_type = payload.type.toUpperCase();
        const res = await fetch(apiUrl("/enquiries/submit/"), {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify({
                enquiry_type,
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                message: payload.message,
                city: (payload as any).city || "",
                child_age: (payload as any).childAge || (payload as any).child_age || "",
                franchise_slug: (payload as any).franchiseSlug || (payload as any).franchise_slug || "",
            }),
        });
        if (!res.ok) throw await toApiError(res);
        const saved = await res.json();
        const mapped = mapEnquiry(saved);
        setEnquiries((prev) => [mapped, ...prev]);
    };

    const getStudentsForParent = (parentId: string) => students.filter((s) => s.parentId === parentId);
    const getGradesForParent = (parentId: string) => {
        const ids = new Set(getStudentsForParent(parentId).map((s) => s.id));
        return grades.filter((g) => ids.has(g.studentId));
    };

    const getEventMediaForParent = (parentId: string) => {
        const ids = new Set(getStudentsForParent(parentId).map((s) => s.id));
        return eventMedia.filter((m) => !m.studentId || ids.has(m.studentId));
    };

    const value = useMemo<SchoolDataContextValue>(
        () => ({
            parents,
            students,
            grades,
            events,
            eventMedia,
            enquiries,
            addOrUpdateParent,
            addOrUpdateStudent,
            addGrade,
            addGradesBulk,
            addEvent,
            updateEvent,
            deleteEvent,
            addEventMedia,
            addEnquiry,
            getStudentsForParent,
            getGradesForParent,
            getEventMediaForParent,
        }),
        [parents, students, grades, events, eventMedia, enquiries],
    );

    return <SchoolDataContext.Provider value={value}>{children}</SchoolDataContext.Provider>;
}

export const useSchoolData = () => {
    const ctx = useContext(SchoolDataContext);
    if (!ctx) throw new Error("useSchoolData must be used within SchoolDataProvider");
    return ctx;
};

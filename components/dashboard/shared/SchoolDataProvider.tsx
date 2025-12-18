"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

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
    addEvent: (payload: Omit<EventRecord, "id">) => void;
    addEventMedia: (payload: Omit<EventMedia, "id">) => void;
    addEnquiry: (payload: Omit<Enquiry, "id" | "createdAt" | "status" | "channel"> & { status?: Enquiry["status"]; channel?: Enquiry["channel"] }) => void;

    getStudentsForParent: (parentId: string) => SchoolStudent[];
    getGradesForParent: (parentId: string) => GradeRecord[];
    getEventMediaForParent: (parentId: string) => EventMedia[];
};

const STORAGE_KEY = "tk-school-data";

const SchoolDataContext = createContext<SchoolDataContextValue | undefined>(undefined);

function safeUUID() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return Math.random().toString(36).slice(2);
}

export function SchoolDataProvider({ children }: { children: React.ReactNode }) {
    const [parents, setParents] = useState<SchoolParent[]>([]);
    const [students, setStudents] = useState<SchoolStudent[]>([]);
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [events, setEvents] = useState<EventRecord[]>([]);
    const [eventMedia, setEventMedia] = useState<EventMedia[]>([]);
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

    // hydrate from localStorage once
    useEffect(() => {
        try {
            const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
            if (raw) {
                const parsed = JSON.parse(raw);
                setParents(parsed.parents || []);
                setStudents(parsed.students || []);
                setGrades(parsed.grades || []);
                setEvents(parsed.events || []);
                setEventMedia(parsed.eventMedia || []);
                setEnquiries(parsed.enquiries || []);
                return;
            }
        } catch {
            // ignore corrupt cache
        }
        // seed defaults when nothing cached
        setParents([
            { id: "parent-1", name: "Tarun Mehta", email: "parent@test.com", phone: "+91 98888 44444" },
            { id: "parent-2", name: "Meera Rao", email: "meera@example.com", phone: "+91 97777 22222" },
        ]);
        setStudents([
            { id: "stu-1", rollNumber: "A101", name: "Aarav T.", grade: "KG-2", section: "A", parentId: "parent-1" },
            { id: "stu-2", rollNumber: "A102", name: "Anaya T.", grade: "KG-1", section: "B", parentId: "parent-1" },
            { id: "stu-3", rollNumber: "B201", name: "Vihaan R.", grade: "KG-2", section: "C", parentId: "parent-2" },
        ]);
        setGrades([
            { id: "g-1", studentId: "stu-1", subject: "Math", term: "Term 1", grade: "A" },
            { id: "g-2", studentId: "stu-2", subject: "English", term: "Term 1", grade: "B+" },
        ]);
        setEvents([
            { id: "ev-1", title: "Sports Day", date: "2025-02-12", venue: "Main Ground", notes: "Parents welcome" },
            { id: "ev-2", title: "Science Fair", date: "2025-03-05", venue: "Auditorium" },
        ]);
        setEventMedia([
            { id: "m-1", type: "image", title: "Sports Day Highlights", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60", eventId: "ev-1" },
            { id: "m-2", type: "video", title: "Annual Day Performance", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", eventId: "ev-2" },
        ]);
        setEnquiries([
            { id: "enq-1", type: "admission", name: "Kavya", email: "kavya@example.com", phone: "+91 90000 12345", message: "Need fee details for KG-1.", createdAt: new Date().toISOString(), status: "new", channel: "web" },
            { id: "enq-2", type: "franchise", name: "Rohan", email: "rohan@example.com", phone: "+91 93333 44444", message: "Interested in Hyderabad franchise.", createdAt: new Date().toISOString(), status: "new", channel: "web" },
        ]);
    }, []);

    // persist on change
    useEffect(() => {
        try {
            const snapshot = { parents, students, grades, events, eventMedia, enquiries };
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
            }
        } catch {
            // ignore write errors
        }
    }, [parents, students, grades, events, eventMedia, enquiries]);

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

    const addGrade = (payload: Omit<GradeRecord, "id">) => {
        setGrades((prev) => [...prev, { id: safeUUID(), ...payload }]);
    };

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

    const addEvent = (payload: Omit<EventRecord, "id">) => {
        setEvents((prev) => [...prev, { id: safeUUID(), ...payload }]);
    };

    const addEventMedia = (payload: Omit<EventMedia, "id">) => {
        setEventMedia((prev) => [...prev, { id: safeUUID(), ...payload }]);
    };

    const addEnquiry = (payload: Omit<Enquiry, "id" | "createdAt" | "status" | "channel"> & { status?: Enquiry["status"]; channel?: Enquiry["channel"] }) => {
        setEnquiries((prev) => [
            {
                id: safeUUID(),
                createdAt: new Date().toISOString(),
                status: payload.status || "new",
                channel: payload.channel || "web",
                ...payload,
            },
            ...prev,
        ]);
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

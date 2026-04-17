"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiUrl, jsonHeaders, mediaUrl, toApiError } from "@/lib/api-client";
import {
    mapApiGrade,
    mapApiStudent,
    normalizeApiList,
    normalizeStudentList,
    parseParentDashboard,
} from "@/lib/parent-school-api";

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
    /** When loaded from parent API */
    blood?: string;
    emergency?: string;
    dateOfBirth?: string;
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
    rsvp?: string;
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
    city?: string;
    childAge?: string;
    message: string;
    createdAt: string;
    status: "new" | "in-progress" | "closed";
    channel: "web" | "dashboard";
    franchiseName?: string;
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

export type AttendanceRecord = {
    id: string;
    studentId: string;
    studentName?: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "HOLIDAY";
    note?: string;
};

export type SchoolDataContextValue = {
    parents: SchoolParent[];
    students: SchoolStudent[];
    grades: GradeRecord[];
    events: EventRecord[];
    eventMedia: EventMedia[];
    enquiries: Enquiry[];
    attendance: AttendanceRecord[];

    refreshAll: () => Promise<void>;
    addParent: (p: Omit<SchoolParent, "id">) => Promise<SchoolParent>;
    addStudent: (s: Omit<SchoolStudent, "id">) => Promise<SchoolStudent>;
    addGradesBulk: (rows: BulkGradeRow[]) => Promise<{ inserted: number; skipped: number }>;
    addEvent: (e: Omit<EventRecord, "id">) => Promise<void>;
    addMedia: (m: AddEventMediaPayload) => Promise<void>;
    resolveEnquiry: (id: string) => Promise<void>;

    // Franchise Specific CRUD
    franchiseLoadParents: () => Promise<void>;
    franchiseAddStudent: (studentData: any) => Promise<void>;
    franchiseUpdateStudent: (id: string, studentData: any) => Promise<void>;
    franchiseDeleteStudent: (id: string) => Promise<void>;
    franchiseAddGrade: (gradeData: any) => Promise<void>;
    franchiseUpdateGrade: (id: string, gradeData: any) => Promise<void>;
    franchiseDeleteGrade: (id: string) => Promise<void>;

    // Attendance Methods
    loadAttendance: (dateOrStudentId?: string) => Promise<void>;
    markAttendance: (records: Omit<AttendanceRecord, "id">[]) => Promise<void>;

    locations: { city_name: string; state: string }[];
    updateEnquiryStatus: (id: string, status: string) => Promise<void>;

    parentSchoolLoading: boolean;
};

const SchoolDataContext = createContext<SchoolDataContextValue | undefined>(undefined);

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
    franchise_name?: string | null;
    status?: string;
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
    city: enq.city,
    childAge: enq.child_age,
    message: enq.message || "",
    createdAt: enq.created_at,
    status: (enq.status as any) || "new",
    channel: "dashboard",
    franchiseName: enq.franchise_name || undefined,
});

const mapAttendance = (raw: any): AttendanceRecord => ({
    id: String(raw.id),
    studentId: String(raw.student),
    studentName: raw.student_name,
    date: raw.date,
    status: raw.status as AttendanceRecord["status"],
    note: raw.note,
});

export function SchoolDataProvider({ children }: { children: React.ReactNode }) {
    const { user, authFetch } = useAuth();

    const [parents, setParents] = useState<SchoolParent[]>([]);
    const [students, setStudents] = useState<SchoolStudent[]>([]);
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [events, setEvents] = useState<EventRecord[]>([]);
    const [eventMedia, setEventMedia] = useState<EventMedia[]>([]);
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [locations, setLocations] = useState<{ city_name: string; state: string }[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [parentSchoolLoading, setParentSchoolLoading] = useState(false);

    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        try {
            const res = await fetch(apiUrl("/franchises/public/locations/"));
            if (res.ok) {
                const data = await res.json();
                setLocations(data);
            }
        } catch (err) {
            console.error("Failed to load public locations", err);
        }
    };

    const refreshAll = async () => {
        if (!user) return;
        if (user.role === "parent") {
            await Promise.all([loadParentEvents(), loadParentStudentsAndGrades()]);
        } else if (user.role === "franchise") {
            await Promise.all([
                loadFranchiseEvents(),
                loadFranchiseEnquiries(),
                loadFranchiseStudentsAndGrades(),
                loadAttendance(),
            ]);
        }
    };

    const loadParentEvents = async () => {
        try {
            const data = await authFetch<ApiEvent[]>("/events/parent/");
            ingestEvents(data);
        } catch {
            setEvents([]);
        }
    };

    const loadParentStudentsAndGrades = async () => {
        if (!user || user.role !== "parent") return;
        setParentSchoolLoading(true);
        try {
            const [sData, gData] = await Promise.all([
                authFetch<any>("/students/parent/students/"),
                authFetch<any>("/students/parent/grades/"),
            ]);
            setStudents(normalizeApiList(sData).map((s) => mapApiStudent(s, user.id)));
            setGrades(normalizeApiList(gData).map((g) => mapApiGrade(g, "")));
        } catch (err) {
            console.error("Failed to load parent data", err);
        } finally {
            setParentSchoolLoading(false);
        }
    };

    const loadFranchiseStudentsAndGrades = async () => {
        try {
            const [sData, gData] = await Promise.all([
                authFetch<any>("/students/franchise/students/"),
                authFetch<any>("/students/franchise/grades/"),
            ]);
            setStudents(normalizeApiList(sData).map((s) => mapApiStudent(s, "")));
            setGrades(normalizeApiList(gData).map((g) => mapApiGrade(g, "")));
        } catch (err) {
            console.error("Failed to load franchise data", err);
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

    const loadFranchiseEnquiries = async () => {
        try {
            const data = await authFetch<any>("/enquiries/franchise/");
            const items = Array.isArray(data) ? data : data.results || [];
            setEnquiries(items.map(mapEnquiry));
        } catch (err) {
            console.error("Failed to load franchise enquiries", err);
        }
    };

    const ingestEvents = (items: ApiEvent[]) => {
        const mappedEvents = items.map(mapEvent);
        const flattenedMedia = items.flatMap((ev) => (ev.media || []).map((m) => mapMedia(m, String(ev.id))));
        setEvents(mappedEvents);
        setEventMedia(flattenedMedia);
    };

    const addParent = async (payload: Omit<SchoolParent, "id">) => {
        // Implementation for adding parents if needed
        return { id: "temp", ...payload };
    };

    const addStudent = async (payload: Omit<SchoolStudent, "id">) => {
        const body = {
            parent: Number(payload.parentId),
            first_name: payload.name.split(" ")[0],
            last_name: payload.name.split(" ").slice(1).join(" "),
            class_name: payload.grade,
            roll_number: payload.rollNumber,
            is_active: true,
        };
        const saved = await authFetch<any>("/students/franchise/students/", {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        const mapped = mapApiStudent(saved, payload.parentId);
        setStudents((prev) => [...prev, mapped]);
        return mapped;
    };

    const addGradesBulk = async (rows: BulkGradeRow[]) => {
        let inserted = 0;
        let skipped = 0;
        for (const row of rows) {
            try {
                const existing = students.find((s) => s.rollNumber === row.rollNumber);
                if (!existing) {
                    skipped++;
                    continue;
                }
                const body = {
                    student: Number(existing.id),
                    subject: row.subject,
                    exam_type: row.term,
                    grade: row.grade,
                    marks_obtained: row.score,
                    total_marks: 100,
                };
                await authFetch("/students/franchise/grades/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify(body),
                });
                inserted++;
            } catch {
                skipped++;
            }
        }
        await loadFranchiseStudentsAndGrades();
        return { inserted, skipped };
    };

    const addEvent = async (payload: Omit<EventRecord, "id">) => {
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

    const addMedia = async (payload: AddEventMediaPayload) => {
        const formData = new FormData();
        if (payload.file) formData.append("file", payload.file);
        formData.append("media_type", payload.type.toUpperCase());
        if (payload.description) formData.append("caption", payload.description);

        const saved = await authFetch<ApiEventMedia>(`/events/franchise/${payload.eventId}/media/`, {
            method: "POST",
            body: formData,
        });
        setEventMedia((prev) => [mapMedia(saved, payload.eventId), ...prev]);
    };

    const resolveEnquiry = async (id: string) => {
        await authFetch(`/enquiries/admin/${id}/`, {
            method: "PATCH",
            headers: jsonHeaders(),
            body: JSON.stringify({ status: "closed" }),
        });
        setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: "closed" } : e)));
    };

    // Attendance
    const loadAttendance = async (dateOrStudentId?: string) => {
        let url = "";
        if (user?.role === "parent") {
            if (!dateOrStudentId) return;
            url = `/students/parent/attendance/?student_id=${dateOrStudentId}`;
        } else {
            url = "/students/franchise/attendance/";
            if (dateOrStudentId) url += `?date=${dateOrStudentId}`;
        }
        try {
            const data = await authFetch<any>(url);
            setAttendance(normalizeApiList(data).map(mapAttendance));
        } catch {
            setAttendance([]);
        }
    };

    const markAttendance = async (records: Omit<AttendanceRecord, "id">[]) => {
        for (const rec of records) {
            const body = {
                student: Number(rec.studentId),
                date: rec.date,
                status: rec.status,
                note: rec.note || "",
            };
            try {
                await authFetch("/students/franchise/attendance/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify(body),
                });
            } catch (err) {
                console.error("Failed to mark attendance", err);
            }
        }
        await loadAttendance();
    };

    // Franchise Specific CRUD Implementations
    const franchiseLoadParents = async () => {
        try {
            const data = await authFetch<any>("/accounts/franchise/parents/");
            setParents(normalizeApiList(data).map((p: any) => ({
                id: String(p.id),
                name: p.user.full_name,
                email: p.user.email,
                phone: p.phone,
            })));
        } catch (err) {
            console.error("Failed to load parents", err);
        }
    };

    const franchiseAddStudent = async (data: any) => {
        await addStudent({
            parentId: data.parent,
            name: `${data.first_name} ${data.last_name}`,
            rollNumber: data.roll_number,
            grade: data.class_name,
            section: "",
        });
    };

    const franchiseUpdateStudent = async (id: string, data: any) => {
        await authFetch(`/students/franchise/students/${id}/`, {
            method: "PATCH",
            headers: jsonHeaders(),
            body: JSON.stringify(data),
        });
        await loadFranchiseStudentsAndGrades();
    };

    const franchiseDeleteStudent = async (id: string) => {
        await authFetch(`/students/franchise/students/${id}/`, { method: "DELETE" });
        await loadFranchiseStudentsAndGrades();
    };

    const franchiseAddGrade = async (data: any) => {
        await authFetch("/students/franchise/grades/", {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify(data),
        });
        await loadFranchiseStudentsAndGrades();
    };

    const franchiseUpdateGrade = async (id: string, data: any) => {
        await authFetch(`/students/franchise/grades/${id}/`, {
            method: "PATCH",
            headers: jsonHeaders(),
            body: JSON.stringify(data),
        });
        await loadFranchiseStudentsAndGrades();
    };

    const franchiseDeleteGrade = async (id: string) => {
        await authFetch(`/students/franchise/grades/${id}/`, { method: "DELETE" });
        await loadFranchiseStudentsAndGrades();
    };

    const updateEnquiryStatus = async (id: string, status: string) => {
        await resolveEnquiry(id);
    };

    const value = useMemo<SchoolDataContextValue>(
        () => ({
            parents,
            students,
            grades,
            events,
            eventMedia,
            enquiries,
            attendance,
            refreshAll,
            addParent,
            addStudent,
            addGradesBulk,
            addEvent,
            addMedia,
            resolveEnquiry,
            franchiseLoadParents,
            franchiseAddStudent,
            franchiseUpdateStudent,
            franchiseDeleteStudent,
            franchiseAddGrade,
            franchiseUpdateGrade,
            franchiseDeleteGrade,
            loadAttendance,
            markAttendance,
            locations,
            updateEnquiryStatus,
            parentSchoolLoading,
        }),
        [parents, students, grades, events, eventMedia, enquiries, attendance, locations, parentSchoolLoading],
    );

    return <SchoolDataContext.Provider value={value}>{children}</SchoolDataContext.Provider>;
}

export const useSchoolData = () => {
    const ctx = useContext(SchoolDataContext);
    if (!ctx) throw new Error("useSchoolData must be used within SchoolDataProvider");
    return ctx;
};

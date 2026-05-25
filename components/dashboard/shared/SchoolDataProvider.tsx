"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiUrl, jsonHeaders, mediaUrl, schoolGalleryMediaUrl, toApiError } from "@/lib/api-client";
import { buildEventMediaFileViewUrl } from "@/lib/event-media-url";
import { validateEventGalleryImageSize } from "@/lib/franchise-centre-upload";
import {
    mapApiGrade,
    mapApiStudent,
    normalizeApiList,
    normalizeStudentList,
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
    /** M = Male, F = Female */
    gender?: "" | "M" | "F";
    parentId: string;
    isActive: boolean;
    dateOfBirth?: string;
    admissionDate?: string;
    /** When loaded from parent API */
    blood?: string;
    emergency?: string;
    idCardNo?: string;
    academicYear?: string;
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
    /** Raw Django path e.g. `events/media/chennai2.mp4` for stream/fallback URLs. */
    filePath: string;
    description?: string;
    eventId?: string;
    studentId?: string;
};

type AddEventMediaPayload = Omit<EventMedia, "id" | "url" | "filePath"> & {
    url?: string;
    file?: File;
    filePath?: string;
};

/** Used by franchise UIs; file upload and optional external URL (local gallery row). */
export type AddEventMediaInput =
    | AddEventMediaPayload
    | {
          title: string;
          url: string;
          type: "image" | "video";
          eventId: string;
          description?: string;
      };

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

/** Public enquiry form submission (no auth); admission/contact → POST /enquiries/submit/, franchise → POST /enquiries/franchise-submit/ */
export type AddEnquiryInput = {
    type: EnquiryType;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    childAge?: string;
    message: string;
    franchiseSlug?: string;
};

/** Django `Enquiry.enquiry_type` uses uppercase enum values (not lowercase). */
const API_ENQUIRY_TYPE: Record<EnquiryType, string> = {
    admission: "ADMISSION",
    franchise: "FRANCHISE",
    contact: "CONTACT",
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
    /** Reload events + gallery media from API (franchise or parent). */
    refreshEvents: () => Promise<void>;
    addParent: (p: Omit<SchoolParent, "id">) => Promise<SchoolParent>;
    addStudent: (s: Omit<SchoolStudent, "id">) => Promise<SchoolStudent>;
    addGradesBulk: (rows: BulkGradeRow[]) => Promise<{ inserted: number; skipped: number }>;
    addEvent: (e: Omit<EventRecord, "id">) => Promise<void>;
    updateEvent: (id: string, e: Omit<EventRecord, "id">) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    addMedia: (m: AddEventMediaPayload) => Promise<void>;
    addEventMedia: (m: AddEventMediaInput) => Promise<void>;
    deleteEventMedia: (eventId: string, mediaId: string) => Promise<void>;
    addEnquiry: (payload: AddEnquiryInput) => Promise<void>;
    addOrUpdateStudent: (data: {
        id?: string;
        name: string;
        rollNumber: string;
        grade: string;
        section: string;
        gender: "" | "M" | "F";
        parentId: string;
        idCardNo?: string;
        academicYear?: string;
    }) => Promise<void>;
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
    markAttendance: (records: Omit<AttendanceRecord, "id">[], date?: string) => Promise<void>;

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
    /** Backend discriminator for merged admin/franchise enquiry lists */
    record_source?: "enquiry" | "franchise_enquiry";
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

/** API may return `2026-04-28` or ISO datetime; `<input type="date">` needs YYYY-MM-DD only. */
const toDateOnly = (raw: string | undefined): string => {
    if (!raw) return "";
    const s = String(raw).trim();
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : "";
};

const mapEvent = (ev: ApiEvent): EventRecord => ({
    id: String(ev.id),
    title: ev.title,
    date: toDateOnly(ev.start_date) || toDateOnly(ev.end_date) || "",
    venue: ev.location || "",
    notes: ev.description || "",
});

const mapMedia = (media: ApiEventMedia, eventId?: string, accessToken?: string | null): EventMedia => {
    const filePath = media.file || "";
    const mediaId = Number(media.id);
    const signed =
        accessToken &&
        Number.isFinite(mediaId) &&
        buildEventMediaFileViewUrl(accessToken, mediaId, {
            caption: media.caption || "",
            filePath,
        });
    const url = signed || schoolGalleryMediaUrl(filePath) || mediaUrl(filePath);
    return {
        id: String(media.id),
        type: (media.media_type || "image").toLowerCase() === "video" ? "video" : "image",
        title: media.caption || "",
        url,
        filePath,
        eventId,
    };
};

const mapEnquiry = (enq: ApiEnquiry): Enquiry => {
    const source =
        enq.record_source ||
        (enq.enquiry_type === "FRANCHISE" ? "franchise_enquiry" : "enquiry");
    const idPrefix = source === "franchise_enquiry" ? "f" : "e";
    return {
        id: `${idPrefix}-${enq.id}`,
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
    };
};

const mapAttendance = (raw: any): AttendanceRecord => ({
    id: String(raw.id),
    studentId: String(raw.student),
    studentName: raw.student_name,
    date: raw.date,
    status: raw.status as AttendanceRecord["status"],
    note: raw.note,
});

export function SchoolDataProvider({ children }: { children: React.ReactNode }) {
    const { user, authFetch, tokens } = useAuth();

    const [parents, setParents] = useState<SchoolParent[]>([]);
    const [students, setStudents] = useState<SchoolStudent[]>([]);
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [events, setEvents] = useState<EventRecord[]>([]);
    const [eventMedia, setEventMedia] = useState<EventMedia[]>([]);
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [locations, setLocations] = useState<{ city_name: string; state: string }[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [parentSchoolLoading, setParentSchoolLoading] = useState(false);
    const pathname = usePathname() ?? "";

    const loadLocations = useCallback(async () => {
        try {
            const res = await fetch(apiUrl("/franchises/public/locations/"));
            if (res.ok) {
                const data = await res.json();
                setLocations(data);
            }
        } catch (err) {
            console.error("Failed to load public locations", err);
        }
    }, []);

    useEffect(() => {
        const needsPublicLocations =
            pathname.startsWith("/admission") ||
            pathname.startsWith("/dashboard/admin/enquiries");
        if (!needsPublicLocations) return;
        void loadLocations();
    }, [pathname, loadLocations]);

    const refreshAll = async () => {
        if (!user) return;
        if (user.role === "parent") {
            setParentSchoolLoading(true);
            try {
                await Promise.all([loadParentEvents(), loadParentStudentsAndGrades()]);
            } finally {
                setParentSchoolLoading(false);
            }
        } else if (user.role === "franchise") {
            // Attendance: loaded on dashboard / attendance pages only (keeps payload obvious + avoids burying the UI behind sidebar-only navigation).
            await Promise.all([
                loadFranchiseEvents(),
                loadFranchiseEnquiries(),
                loadFranchiseStudentsAndGrades(),
            ]);
        } else if (user.role === "admin") {
            await loadAdminEnquiries();
        }
    };

    useEffect(() => {
        if (!user) return;
        void refreshAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.role]);

    /** Refresh gallery when parent opens Event Gallery (picks up new franchise uploads). */
    useEffect(() => {
        if (!user || user.role !== "parent") return;
        if (!/\/dashboard\/parent\/(showcase|event-gallery)\/?$/i.test(pathname)) return;
        void loadParentEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, user?.id, user?.role]);

    const loadParentEvents = async () => {
        try {
            const data = await authFetch<unknown>("/events/parent/");
            const list = normalizeApiList(data) as ApiEvent[];
            ingestEvents(list);
        } catch (error) {
            console.error("Failed to load parent events:", error);
            setEvents([]);
        }
    };

    const loadParentStudentsAndGrades = async () => {
        if (!user || user.role !== "parent") return;
        try {
            const [sData, gData] = await Promise.all([
                authFetch<any>("/students/parent/students/"),
                authFetch<any>("/students/parent/grades/"),
            ]);
            setStudents(normalizeApiList(sData).map((s) => mapApiStudent(s, user.id)));
            setGrades(normalizeApiList(gData).map((g) => mapApiGrade(g, "")));
        } catch (err) {
            console.error("Failed to load parent data", err);
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
            const data = await authFetch<unknown>("/events/franchise/");
            const list = normalizeApiList(data) as ApiEvent[];
            ingestEvents(list);
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

    const loadAdminEnquiries = async () => {
        try {
            const data = await authFetch<any>("/enquiries/admin/all/");
            const items = Array.isArray(data) ? data : data.results || [];
            setEnquiries(items.map(mapEnquiry));
        } catch (err) {
            console.error("Failed to load admin enquiries", err);
            setEnquiries([]);
        }
    };

    const ingestEvents = useCallback(
        (items: ApiEvent[]) => {
            const accessToken = tokens?.access ?? null;
            const mappedEvents = items.map(mapEvent);
            const flattenedMedia = items.flatMap((ev) =>
                (ev.media || []).map((m) => mapMedia(m, String(ev.id), accessToken)),
            );
            setEvents(mappedEvents);
            setEventMedia(flattenedMedia);
        },
        [tokens?.access],
    );

    const refreshEvents = async () => {
        if (!user) return;
        if (user.role === "parent") await loadParentEvents();
        else if (user.role === "franchise") await loadFranchiseEvents();
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
            section: payload.section || "",
            roll_number: payload.rollNumber,
            gender: payload.gender || "",
            id_card_no: payload.idCardNo?.trim() || "",
            academic_year: payload.academicYear?.trim() || "",
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
        const start = toDateOnly(payload.date);
        if (!start) {
            throw new Error("Please choose a valid event date.");
        }
        const body = {
            title: payload.title,
            description: payload.notes || "",
            start_date: start,
            end_date: start,
            location: payload.venue,
        };
        const created = await authFetch<ApiEvent>("/events/franchise/", {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        setEvents((prev) => [mapEvent(created), ...prev]);
    };

    const updateEvent = async (id: string, payload: Omit<EventRecord, "id">) => {
        const start = toDateOnly(payload.date);
        if (!start) {
            throw new Error("Please choose a valid event date.");
        }
        const body = {
            title: payload.title,
            description: payload.notes || "",
            start_date: start,
            end_date: start,
            location: payload.venue,
        };
        const updated = await authFetch<ApiEvent>(`/events/franchise/${id}/`, {
            method: "PATCH",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        setEvents((prev) => prev.map((e) => (e.id === id ? mapEvent(updated) : e)));
    };

    const deleteEvent = async (id: string) => {
        await authFetch(`/events/franchise/${id}/`, { method: "DELETE" });
        setEvents((prev) => prev.filter((e) => e.id !== id));
        setEventMedia((prev) => prev.filter((m) => m.eventId !== id));
    };

    const addMedia = async (payload: AddEventMediaPayload) => {
        if (payload.file && payload.type === "image") {
            const sizeErr = validateEventGalleryImageSize(payload.file);
            if (sizeErr) throw new Error(sizeErr);
        }
        const formData = new FormData();
        if (payload.file) formData.append("file", payload.file);
        formData.append("media_type", payload.type.toUpperCase());
        if (payload.description) formData.append("caption", payload.description);

        await authFetch<ApiEventMedia>(`/events/franchise/${payload.eventId}/media/`, {
            method: "POST",
            body: formData,
        });
        await refreshEvents();
    };

    const addEventMedia = async (payload: AddEventMediaInput) => {
        if ("file" in payload && payload.file) {
            return addMedia(payload);
        }
        const p = payload as {
            title: string;
            url: string;
            type: "image" | "video";
            eventId: string;
            description?: string;
        };
        if (p.url?.trim()) {
            setEventMedia((prev) => [
                {
                    id: `ext-${Date.now()}`,
                    type: p.type,
                    title: p.title || "Link",
                    url: p.url,
                    filePath: p.url,
                    description: p.description,
                    eventId: p.eventId,
                },
                ...prev,
            ]);
            return;
        }
        throw new Error("Upload a file or provide a media URL");
    };

    const deleteEventMedia = async (eventId: string, mediaId: string) => {
        if (mediaId.startsWith("ext-")) {
            setEventMedia((prev) => prev.filter((m) => !(m.eventId === eventId && m.id === mediaId)));
            return;
        }
        await authFetch(`/events/franchise/${eventId}/media/${mediaId}/`, { method: "DELETE" });
        await refreshEvents();
    };

    const addEnquiry = async (payload: AddEnquiryInput) => {
        if (payload.type === "franchise") {
            const body: Record<string, string> = {
                name: payload.name,
                email: payload.email,
                phone: payload.phone ?? "",
                message: payload.message,
            };
            if (payload.city) body.city = payload.city;
            const res = await fetch(apiUrl("/enquiries/franchise-submit/"), {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify(body),
            });
            if (!res.ok) throw await toApiError(res);
            return;
        }

        const body: Record<string, string> = {
            enquiry_type: API_ENQUIRY_TYPE[payload.type],
            name: payload.name,
            email: payload.email,
            phone: payload.phone ?? "",
            message: payload.message,
        };
        if (payload.city) body.city = payload.city;
        if (payload.childAge) body.child_age = payload.childAge;
        if (payload.franchiseSlug) body.franchise_slug = payload.franchiseSlug;

        const res = await fetch(apiUrl("/enquiries/submit/"), {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        if (!res.ok) throw await toApiError(res);
    };

    const patchEnquiryStatusRemote = async (id: string, status: string) => {
        const isFranchiseLead = id.startsWith("f-");
        const numericId = id.startsWith("f-") || id.startsWith("e-") ? id.slice(2) : id;
        let path: string;
        if (isFranchiseLead) {
            path =
                user?.role === "franchise"
                    ? `/enquiries/franchise/lead/${numericId}/`
                    : `/enquiries/admin/franchise/${numericId}/`;
        } else {
            path =
                user?.role === "franchise"
                    ? `/enquiries/franchise/${numericId}/`
                    : `/enquiries/admin/${numericId}/`;
        }
        await authFetch(path, {
            method: "PATCH",
            headers: jsonHeaders(),
            body: JSON.stringify({ status }),
        });
        setEnquiries((prev) =>
            prev.map((e) => (e.id === id ? { ...e, status: status as Enquiry["status"] } : e)),
        );
    };

    const resolveEnquiry = async (id: string) => {
        await patchEnquiryStatusRemote(id, "closed");
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

    const markAttendance = async (records: Omit<AttendanceRecord, "id">[], date?: string) => {
        const failed: string[] = [];
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
                failed.push(rec.studentId);
            }
        }
        if (failed.length > 0) {
            throw new Error(`Failed to save ${failed.length} record(s)`);
        }
        await loadAttendance(date);
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

    const franchiseAddStudent = async (data: Record<string, unknown>) => {
        const first = String(data.first_name ?? "").trim();
        const last = String(data.last_name ?? "").trim();
        await addStudent({
            parentId: String(data.parent ?? ""),
            name: `${first} ${last}`.trim() || first || last,
            rollNumber: String(data.roll_number ?? ""),
            grade: String(data.class_name ?? ""),
            section: String(data.section ?? ""),
            gender: (data.gender as SchoolStudent["gender"]) ?? "",
            idCardNo: String(data.id_card_no ?? ""),
            academicYear: String(data.academic_year ?? ""),
            isActive: data.is_active !== false,
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

    const addOrUpdateStudent = async (data: {
        id?: string;
        name: string;
        rollNumber: string;
        grade: string;
        section: string;
        gender: "" | "M" | "F";
        parentId: string;
        idCardNo?: string;
        academicYear?: string;
    }) => {
        const [firstName, ...rest] = data.name.trim().split(/\s+/);
        const lastName = rest.join(" ") || "-";
        
        const baseBody = {
            first_name: firstName,
            last_name: lastName,
            roll_number: data.rollNumber,
            class_name: data.grade,
            section: data.section,
            gender: data.gender,
            id_card_no: data.idCardNo?.trim() || "",
            academic_year: data.academicYear?.trim() || "",
        };

        if (data.id) {
            const patchBody: Record<string, unknown> = { ...baseBody };
            // Only update parent if the user explicitly selected one
            if (data.parentId) {
                patchBody.parent = Number(data.parentId);
            }
            await franchiseUpdateStudent(data.id, patchBody);
        } else {
            await franchiseAddStudent({
                ...baseBody,
                parent: data.parentId,
            });
        }
    };

    const updateEnquiryStatus = async (id: string, status: string) => {
        await patchEnquiryStatusRemote(id, status);
    };

    const value: SchoolDataContextValue = {
        parents,
        students,
        grades,
        events,
        eventMedia,
        enquiries,
        attendance,
        refreshAll,
        refreshEvents,
        addParent,
        addStudent,
        addGradesBulk,
        addEvent,
        updateEvent,
        deleteEvent,
        addMedia,
        addEventMedia,
        deleteEventMedia,
        addEnquiry,
        addOrUpdateStudent,
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
    };

    return <SchoolDataContext.Provider value={value}>{children}</SchoolDataContext.Provider>;
}

export const useSchoolData = () => {
    const ctx = useContext(SchoolDataContext);
    if (!ctx) throw new Error("useSchoolData must be used within SchoolDataProvider");
    return ctx;
};

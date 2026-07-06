"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { apiUrl, jsonHeaders, mediaUrl, schoolGalleryMediaUrl, toApiError } from "@/lib/api-client";
import { buildEventMediaFileViewUrl } from "@/lib/event-media-url";
import {
    embedEventVideoLinks,
    EVENT_VIDEO_LINK_ID_PREFIX,
    EventVideoLink,
    isEventVideoLinkMediaId,
    parseEventVideoLinks,
    stripEventVideoLinks,
} from "@/lib/event-gallery-video-links";
import { validateEventGalleryImageSize } from "@/lib/franchise-centre-upload";
import { isFranchiseEmbedUrl, parseEmbedInput, resolveFranchiseEmbedSrc } from "@/lib/franchise-embed-url";
import {
    fetchAllApiList,
    mapApiGrade,
    mapApiStudent,
    normalizeApiList,
    normalizeStudentList,
    parseParentGalleryResponse,
} from "@/lib/parent-school-api";

export type EnquiryNote = {
    id: number;
    content: string;
    created_at: string;
    created_by_name?: string;
};

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
    /** Empty = all classes; otherwise limits parent app visibility. */
    className?: string;
    audienceLabel?: string;
    notes?: string;
    rsvp?: string;
    /** YouTube / Bunny links stored in event description (not shown in notes field). */
    videoLinks?: EventVideoLink[];
};

export type EventMedia = {
    id: string;
    type: "image" | "video" | "url";
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
    status: "new" | "in-progress" | "closed" | "contacted" | "called" | "follow_up" | "interested" | "meeting_scheduled" | "dropped" | "not_interested" | "converted";
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
    status: "PRESENT" | "ABSENT" | "UNMARKED" | "HOLIDAY" | "LATE" | "EXCUSED";
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
    /** Parent gallery: reload all centre events (`wrap=gallery`). */
    refreshParentEvents: () => Promise<void>;
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
    fetchFranchiseAttendance: (params: {
        date?: string;
        month?: string;
        from?: string;
        to?: string;
        className?: string;
        academicYear?: string;
    }) => Promise<AttendanceRecord[]>;
    markAttendance: (records: Omit<AttendanceRecord, "id">[], date?: string) => Promise<void>;
    clearAttendanceDate: (date: string) => Promise<number>;

    locations: { city_name: string; state: string }[];
    updateEnquiryStatus: (id: string, status: string) => Promise<void>;
    updateEnquiryMessage: (id: string, message: string) => Promise<void>;
    fetchEnquiryNotes: (leadId: string) => Promise<EnquiryNote[]>;
    addEnquiryNote: (leadId: string, content: string) => Promise<EnquiryNote>;

    parentSchoolLoading: boolean;
    /** True while parent event gallery API is in flight. */
    parentEventsLoading: boolean;
    /** True after the first parent children list fetch finishes (success or error). */
    parentStudentsHydrated: boolean;
};

const SchoolDataContext = createContext<SchoolDataContextValue | undefined>(undefined);

type ApiEventVideoLink = {
    id: string;
    url: string;
    title?: string;
    description?: string;
};

type ApiEvent = {
    id: number;
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
    class_name?: string;
    audience_label?: string;
    media?: ApiEventMedia[];
    video_links?: ApiEventVideoLink[];
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

const mapApiVideoLinks = (ev: ApiEvent): EventVideoLink[] => {
    if (Array.isArray(ev.video_links) && ev.video_links.length > 0) {
        return ev.video_links
            .map((row) => {
                const url = String(row.url || "").trim();
                if (!url) return null;
                const rawId = String(row.id || "").trim() || `${EVENT_VIDEO_LINK_ID_PREFIX}0`;
                const id = rawId.startsWith(EVENT_VIDEO_LINK_ID_PREFIX) ? rawId : `${EVENT_VIDEO_LINK_ID_PREFIX}${rawId}`;
                const link: EventVideoLink = { id, url };
                if (row.title) link.title = String(row.title);
                if (row.description) link.description = String(row.description);
                return link;
            })
            .filter((row): row is EventVideoLink => row !== null);
    }
    return parseEventVideoLinks(ev.description || "");
};

const mapEvent = (ev: ApiEvent): EventRecord => {
    const description = ev.description || "";
    const rawClass = (ev.class_name || "").trim();
    const className =
        !rawClass || /^all(\s+classes)?$/i.test(rawClass) ? "" : rawClass;
    return {
        id: String(ev.id),
        title: ev.title,
        date: toDateOnly(ev.start_date) || toDateOnly(ev.end_date) || "",
        venue: ev.location || "",
        className,
        audienceLabel: (ev.audience_label || "").trim() || (className || "All classes"),
        notes: stripEventVideoLinks(description),
        videoLinks: mapApiVideoLinks(ev),
    };
};

const mapApiMediaType = (mediaType: string | undefined): EventMedia["type"] => {
    const mt = (mediaType || "image").toUpperCase();
    if (mt === "URL") return "url";
    if (mt === "VIDEO") return "video";
    return "image";
};

const mapEventVideoLinkMedia = (link: EventVideoLink, eventId: string): EventMedia => ({
    id: link.id,
    type: "url",
    title: link.title?.trim() || link.description?.trim() || "Video",
    url: link.url,
    filePath: link.url,
    description: link.description,
    eventId,
});

const mapMedia = (media: ApiEventMedia, eventId?: string, accessToken?: string | null): EventMedia => {
    const filePath = media.file || "";
    const mediaId = Number(media.id);
    const isExternalUrl = /^https?:\/\//i.test(filePath);
    const signed =
        !isExternalUrl &&
        mediaId > 0 &&
        accessToken &&
        Number.isFinite(mediaId) &&
        buildEventMediaFileViewUrl(accessToken, mediaId, {
            caption: media.caption || "",
            filePath,
        });
    const url = isExternalUrl ? filePath : signed || schoolGalleryMediaUrl(filePath) || mediaUrl(filePath);
    return {
        id: String(media.id),
        type: mapApiMediaType(media.media_type),
        title: media.caption || "",
        url,
        filePath,
        eventId,
    };
};

const VALID_ENQUIRY_STATUSES = new Set([
    "new", "in-progress", "closed",
    "contacted", "called", "follow_up", "interested",
    "meeting_scheduled", "dropped", "not_interested", "converted",
]);

const normalizeEnquiryStatus = (raw: string | undefined | null): Enquiry["status"] => {
    const value = String(raw || "new")
        .trim()
        .toLowerCase()
        .replace(/ /g, "_");
    if (VALID_ENQUIRY_STATUSES.has(value)) return value as Enquiry["status"];
    return "new";
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
        status: normalizeEnquiryStatus(enq.status),
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
    const { showToast } = useToast();

    const [parents, setParents] = useState<SchoolParent[]>([]);
    const [students, setStudents] = useState<SchoolStudent[]>([]);
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [events, setEvents] = useState<EventRecord[]>([]);
    const [eventMedia, setEventMedia] = useState<EventMedia[]>([]);
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [locations, setLocations] = useState<{ city_name: string; state: string }[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [parentSchoolLoading, setParentSchoolLoading] = useState(false);
    const [parentEventsLoading, setParentEventsLoading] = useState(false);
    const [parentStudentsHydrated, setParentStudentsHydrated] = useState(false);
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

    const ingestEvents = useCallback(
        (items: ApiEvent[]) => {
            const accessToken = tokens?.access ?? null;
            const mappedEvents = items.map(mapEvent);
            const apiMedia = items.flatMap((ev) =>
                (ev.media || []).map((m) => mapMedia(m, String(ev.id), accessToken)),
            );
            const seenVideoUrls = new Set(
                apiMedia
                    .filter((m) => m.type === "video" || m.type === "url")
                    .map((m) => (m.url || m.filePath || "").trim().toLowerCase()),
            );
            const linkMedia = mappedEvents.flatMap((ev) =>
                (ev.videoLinks || [])
                    .filter((link) => !seenVideoUrls.has(link.url.trim().toLowerCase()))
                    .map((link) => mapEventVideoLinkMedia(link, ev.id)),
            );
            setEvents(mappedEvents);
            setEventMedia([...apiMedia, ...linkMedia]);
        },
        [tokens?.access],
    );

    const loadParentEvents = useCallback(async () => {
        setParentEventsLoading(true);
        try {
            let data: unknown;
            try {
                data = await authFetch<unknown>("/events/parent/?wrap=gallery");
            } catch {
                data = await authFetch<unknown>("/events/parent/");
            }
            if (data == null) {
                throw new Error("Empty response from event gallery API.");
            }
            const payload = parseParentGalleryResponse(data);
            ingestEvents(payload.events as ApiEvent[]);
        } catch (error) {
            console.error("Failed to load parent events:", error);
            setEvents([]);
            setEventMedia([]);
        } finally {
            setParentEventsLoading(false);
        }
    }, [authFetch, ingestEvents]);

    const refreshParentEvents = useCallback(async () => {
        await loadParentEvents();
    }, [loadParentEvents]);

    const refreshAll = async () => {
        if (!user) return;
        if (user.role === "parent") {
            setParentSchoolLoading(true);
            setParentStudentsHydrated(false);
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
        if (!user || !tokens?.access) return;
        void refreshAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.role, tokens?.access]);

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
        } finally {
            setParentStudentsHydrated(true);
        }
    };

    const loadFranchiseStudentsAndGrades = async () => {
        try {
            const [studentRows, gradeRows] = await Promise.all([
                fetchAllApiList(authFetch, "/students/franchise/students/"),
                fetchAllApiList(authFetch, "/students/franchise/grades/"),
            ]);
            setStudents(studentRows.map((s) => mapApiStudent(s, "")));
            setGrades(gradeRows.map((g) => mapApiGrade(g, "")));
        } catch (err) {
            console.error("Failed to load franchise data", err);
            setStudents([]);
            setGrades([]);
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
            const data = await authFetch<any>("/enquiries/admin/all/?limit=100&page=1");
            const items = Array.isArray(data) ? data : data?.results || [];
            setEnquiries(items.map(mapEnquiry));
        } catch (err) {
            console.error("Failed to load admin enquiries", err);
            setEnquiries([]);
        }
    };

    const refreshEvents = async () => {
        if (!user) return;
        if (user.role === "parent") await loadParentEvents();
        else if (user.role === "franchise") await loadFranchiseEvents();
    };

    /** Refresh gallery when parent opens Event Gallery (picks up new franchise uploads). */
    useEffect(() => {
        if (!user || user.role !== "parent" || !tokens?.access) return;
        if (!/\/dashboard\/parent\/(showcase|event-gallery)\/?$/i.test(pathname)) return;
        void loadParentEvents();
    }, [pathname, user?.id, user?.role, tokens?.access, loadParentEvents]);

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
            class_name: (payload.className || "").trim(),
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
        const existing = events.find((e) => e.id === id);
        const body = {
            title: payload.title,
            description: embedEventVideoLinks(payload.notes || "", existing?.videoLinks || []),
            start_date: start,
            end_date: start,
            location: payload.venue,
            class_name: (payload.className ?? existing?.className ?? "").trim(),
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

    const persistEventVideoLinks = async (eventId: string, links: EventVideoLink[]) => {
        const event = events.find((e) => e.id === eventId);
        if (!event) throw new Error("Event not found");
        const start = toDateOnly(event.date);
        if (!start) throw new Error("Event date is missing");
        const body = {
            title: event.title,
            description: embedEventVideoLinks(event.notes || "", links),
            start_date: start,
            end_date: start,
            location: event.venue,
            class_name: (event.className || "").trim(),
        };
        const updated = await authFetch<ApiEvent>(`/events/franchise/${eventId}/`, {
            method: "PATCH",
            headers: jsonHeaders(),
            body: JSON.stringify(body),
        });
        const mapped = mapEvent(updated);
        setEvents((prev) => prev.map((e) => (e.id === eventId ? mapped : e)));
        setEventMedia((prev) => {
            const without = prev.filter((m) => m.eventId !== eventId || !isEventVideoLinkMediaId(m.id));
            const nextLinks = (mapped.videoLinks || []).map((link) => mapEventVideoLinkMedia(link, eventId));
            const apiForEvent = prev.filter((m) => m.eventId === eventId && !isEventVideoLinkMediaId(m.id));
            const other = prev.filter((m) => m.eventId !== eventId);
            return [...other, ...apiForEvent, ...nextLinks];
        });
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
        const rawUrl = parseEmbedInput(p.url || "");
        if (!rawUrl) throw new Error("Paste a YouTube, Bunny, or video link");
        const normalized = resolveFranchiseEmbedSrc(rawUrl) || rawUrl;
        if (p.type === "video" && !isFranchiseEmbedUrl(normalized) && !/^https?:\/\//i.test(normalized)) {
            throw new Error("Could not read that link. Paste a YouTube or Bunny embed URL.");
        }
        if (!p.eventId) throw new Error("Select an event before adding a video link");

        const event = events.find((e) => e.id === p.eventId);
        if (!event) throw new Error("Event not found");

        const newLink: EventVideoLink = {
            id: `${EVENT_VIDEO_LINK_ID_PREFIX}${Date.now()}`,
            url: normalized,
            title: p.title?.trim() || undefined,
            description: p.description?.trim() || undefined,
        };
        await persistEventVideoLinks(p.eventId, [...(event.videoLinks || []), newLink]);
    };

    const deleteEventMedia = async (eventId: string, mediaId: string) => {
        if (isEventVideoLinkMediaId(mediaId) || mediaId.startsWith("ext-")) {
            const event = events.find((e) => e.id === eventId);
            if (!event) return;
            const links = (event.videoLinks || []).filter((l) => l.id !== mediaId);
            await persistEventVideoLinks(eventId, links);
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

    const enquiryStatusPaths = (id: string): string[] => {
        const isFranchiseLead = id.startsWith("f-");
        const numericId = id.startsWith("f-") || id.startsWith("e-") ? id.slice(2) : id;
        const isFranchiseUser = user?.role === "franchise";
        if (isFranchiseLead) {
            const primary = isFranchiseUser
                ? `/enquiries/franchise/lead/${numericId}/`
                : `/enquiries/admin/franchise/${numericId}/`;
            const fallback = isFranchiseUser
                ? `/enquiries/franchise/${numericId}/`
                : `/enquiries/admin/${numericId}/`;
            return [primary, fallback];
        }
        const primary = isFranchiseUser
            ? `/enquiries/franchise/${numericId}/`
            : `/enquiries/admin/${numericId}/`;
        const fallback = isFranchiseUser
            ? `/enquiries/franchise/lead/${numericId}/`
            : `/enquiries/admin/franchise/${numericId}/`;
        return [primary, fallback];
    };

    const patchEnquiryStatusRemote = async (id: string, status: string) => {
        const normalizedStatus = normalizeEnquiryStatus(status);
        const previous = enquiries.find((e) => e.id === id)?.status;
        const phone = enquiries.find((e) => e.id === id)?.phone?.trim();

        setEnquiries((prev) =>
            prev.map((e) => {
                if (e.id === id) return { ...e, status: normalizedStatus };
                if (phone && e.phone?.trim() === phone) return { ...e, status: normalizedStatus };
                return e;
            }),
        );

        const body = JSON.stringify({ status: normalizedStatus });
        const headers = jsonHeaders();
        let lastError: unknown = null;

        for (const path of enquiryStatusPaths(id)) {
            try {
                await authFetch(path, { method: "PATCH", headers, body });
                if (user?.role === "admin") await loadAdminEnquiries();
                else if (user?.role === "franchise") await loadFranchiseEnquiries();
                return;
            } catch (err: unknown) {
                lastError = err;
            }
        }
        if (lastError) throw lastError;
    };

    const updateEnquiryMessage = async (id: string, message: string) => {
        setEnquiries((prev) =>
            prev.map((e) => {
                if (e.id === id) return { ...e, message };
                return e;
            }),
        );

        const body = JSON.stringify({ message });
        const headers = jsonHeaders();
        let lastError: unknown = null;

        for (const path of enquiryStatusPaths(id)) {
            try {
                await authFetch(path, { method: "PATCH", headers, body });
                if (user?.role === "admin") await loadAdminEnquiries();
                else if (user?.role === "franchise") await loadFranchiseEnquiries();
                return;
            } catch (err) {
                lastError = err;
            }
        }
        if (lastError) throw lastError;
    };

    const resolveEnquiry = async (id: string) => {
        await patchEnquiryStatusRemote(id, "closed");
    };

    const fetchEnquiryNotes = async (leadId: string): Promise<EnquiryNote[]> => {
        try {
            return await authFetch<EnquiryNote[]>(`/enquiries/notes/${leadId.replace("-", "_")}/`);
        } catch {
            return [];
        }
    };

    const addEnquiryNote = async (leadId: string, content: string): Promise<EnquiryNote> => {
        return await authFetch<EnquiryNote>(`/enquiries/notes/${leadId.replace("-", "_")}/`, {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify({ content }),
        });
    };

    // Attendance
    const fetchFranchiseAttendance = async (params: {
        date?: string;
        month?: string;
        from?: string;
        to?: string;
        className?: string;
        academicYear?: string;
    }): Promise<AttendanceRecord[]> => {
        const qs = new URLSearchParams();
        if (params.date) qs.set("date", params.date);
        if (params.month) qs.set("month", params.month);
        if (params.from) qs.set("from", params.from);
        if (params.to) qs.set("to", params.to);
        if (params.className) qs.set("class_name", params.className);
        if (params.academicYear && params.academicYear !== "all") qs.set("academic_year", params.academicYear);
        const suffix = qs.toString();
        const url = suffix ? `/students/franchise/attendance/?${suffix}` : "/students/franchise/attendance/";
        try {
            const data = await authFetch<any>(url);
            return normalizeApiList(data).map(mapAttendance);
        } catch {
            return [];
        }
    };

    const loadAttendance = async (dateOrStudentId?: string) => {
        if (user?.role === "parent") {
            if (!dateOrStudentId) return;
            try {
                const data = await authFetch<any>(`/students/parent/attendance/?student_id=${dateOrStudentId}`);
                setAttendance(normalizeApiList(data).map(mapAttendance));
            } catch {
                setAttendance([]);
            }
            return;
        }
        try {
            const rows = await fetchFranchiseAttendance(
                dateOrStudentId ? { date: dateOrStudentId } : {},
            );
            setAttendance(rows);
        } catch {
            setAttendance([]);
        }
    };

    const markAttendance = async (records: Omit<AttendanceRecord, "id">[], date?: string) => {
        if (records.length === 0) return;
        await authFetch("/students/franchise/attendance/bulk/", {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify({
                records: records.map((rec) => ({
                    student: Number(rec.studentId),
                    date: rec.date,
                    status: rec.status,
                    note: rec.note || "",
                })),
            }),
        });
        await loadAttendance(date);
    };

    const clearAttendanceDate = async (date: string) => {
        const params = new URLSearchParams({ date });
        const result = await authFetch<{ deleted?: number }>(
            `/students/franchise/attendance/clear/?${params.toString()}`,
            { method: "DELETE" },
        );
        await loadAttendance(date);
        return Number(result?.deleted ?? 0);
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
        refreshParentEvents,
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
        fetchFranchiseAttendance,
        markAttendance,
        clearAttendanceDate,
        locations,
        updateEnquiryStatus,
        updateEnquiryMessage,
        fetchEnquiryNotes,
        addEnquiryNote,
        parentSchoolLoading,
        parentEventsLoading,
        parentStudentsHydrated,
    };

    return <SchoolDataContext.Provider value={value}>{children}</SchoolDataContext.Provider>;
}

export const useSchoolData = () => {
    const ctx = useContext(SchoolDataContext);
    if (!ctx) throw new Error("useSchoolData must be used within SchoolDataProvider");
    return ctx;
};

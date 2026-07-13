"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGrid, ChevronDown, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchAllApiList } from "@/lib/parent-school-api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { jsonHeaders } from "@/lib/api-client";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";
import { CENTRE_PROGRAM_LABELS } from "@/config/centre-program-cards-defaults";
import dynamic from "next/dynamic";
import {
    FranchiseAnnouncementsPanel,
    FranchiseHolidayPanel,
    FranchiseNewsletterPanel,
    FranchiseParentalTipsPanel,
} from "@/components/dashboard/franchise/FranchiseParentCmsPanels";
import { FranchiseDailyActivitiesPanel } from "@/components/dashboard/franchise/FranchiseDailyActivitiesPanel";

const HOMEWORK_CLASS_OPTIONS = [
    { value: "", label: "All classes" },
    ...CENTRE_PROGRAM_LABELS.map((p) => ({ value: p.label, label: p.label })),
];

const HOMEWORK_CARD_PREVIEW = 3;
const HOMEWORK_VISIBLE_CLASSES = 3;

/** Existing franchise pages — embedded here instead of separate sidebar links. */
const FranchiseAttendancePanel = dynamic(
    () => import("@/components/dashboard/franchise/FranchiseAttendancePanel").then((m) => m.FranchiseAttendancePanel),
    { ssr: false },
);
const ParentPortalCalendarPanel = dynamic(
    () => import("@/components/dashboard/shared/ParentPortalCalendarPanel").then((m) => m.ParentPortalCalendarPanel),
    { ssr: false },
);
const FranchiseEventsPanel = dynamic(() => import("../events/page"), { ssr: false });
const FranchiseFeesPanel = dynamic(
    () => import("@/components/dashboard/franchise/FranchiseFeesPanel").then((m) => m.FranchiseFeesPanel),
    { ssr: false },
);
type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
type ShowToastFn = (message: string, variant?: "success" | "error") => void;

type MiniStudent = { id: number; full_name: string; class_name: string };

/** API dates may arrive as YYYY-MM-DD or ISO datetime — compare using first 10 chars. */
const homeworkDate = (value: string | undefined | null) => String(value || "").slice(0, 10);

const formatUploadDate = (value: string | undefined | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return homeworkDate(value);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const todayLocal = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const normalizeList = <T,>(data: unknown): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object") {
        const obj = data as { results?: unknown[]; homework?: unknown[]; data?: unknown[] };
        if (Array.isArray(obj.results)) return obj.results as T[];
        if (Array.isArray(obj.homework)) return obj.homework as T[];
        if (Array.isArray(obj.data)) return obj.data as T[];
    }
    return [];
};

/**
 * Matches parent login sidebar (`config/parent-sidebar-nav.tsx`).
 * Former sidebar items Attendance and Event Gallery are embedded here as tabs.
 * Add Grades is a separate sidebar link (`/dashboard/franchise/add-grades/`).
 */
type Tab =
    | "homework"
    | "notifications"
    | "timetable"
    | "activities"
    | "transport"
    | "calendar"
    | "showcase"
    | "fees"
    | "holidays"
    | "parental_tips";

const TAB_CONFIG: { id: Tab; label: string }[] = [
    { id: "homework", label: "Homework" },
    { id: "notifications", label: "Notifications" },
    { id: "timetable", label: "Newsletter" },
    { id: "activities", label: "Today's Activities" },
    { id: "parental_tips", label: "Parental Tips" },
    { id: "transport", label: "Transport" },
    { id: "calendar", label: "Calendar & Attendance" },
    { id: "showcase", label: "Event Gallery" },
    { id: "fees", label: "Fee" },
    { id: "holidays", label: "Holiday list" },
];

const TAB_IDS = new Set<Tab>(TAB_CONFIG.map((t) => t.id));

function parseTabParam(value: string | null): Tab | null {
    if (!value || !TAB_IDS.has(value as Tab)) return null;
    return value as Tab;
}

export default function ParentPortalAdminPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { authFetch, user } = useAuth();
    const { showToast } = useToast();
    const [tab, setTab] = useState<Tab>("homework");
    const [students, setStudents] = useState<MiniStudent[]>([]);

    useEffect(() => {
        if (searchParams.get("tab") === "grades") {
            router.replace("/dashboard/franchise/add-grades/");
            return;
        }
        if (searchParams.get("tab") === "support") {
            router.replace("/dashboard/franchise/parent-tickets/");
            return;
        }
        const fromUrl = parseTabParam(searchParams.get("tab"));
        if (fromUrl) setTab(fromUrl);
    }, [searchParams, router]);

    const selectTab = (id: Tab) => {
        setTab(id);
        router.replace(`/dashboard/franchise/parent-portal/?tab=${id}`, { scroll: false });
    };

    const loadStudents = useCallback(async () => {
        if (!user || user.role !== "franchise") {
            setStudents([]);
            return;
        }
        try {
            const rows = await fetchAllApiList(authFetch, "/students/franchise/students/mini/");
            setStudents(
                rows
                    .map((row) => {
                        const r = row as Record<string, unknown>;
                        const id = Number(r.id ?? r.pk);
                        if (!Number.isFinite(id)) return null;
                        const fromParts =
                            r.first_name != null || r.last_name != null
                                ? `${String(r.first_name ?? "").trim()} ${String(r.last_name ?? "").trim()}`.trim()
                                : "";
                        return {
                            id,
                            full_name:
                                String(r.full_name ?? "").trim() ||
                                String(r.name ?? "").trim() ||
                                fromParts ||
                                "Student",
                            class_name: String(r.class_name ?? r.grade ?? "").trim(),
                        } satisfies MiniStudent;
                    })
                    .filter((s): s is MiniStudent => s !== null),
            );
        } catch {
            setStudents([]);
        }
    }, [authFetch, user]);

    useEffect(() => {
        void loadStudents();
    }, [loadStudents]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
                    <LayoutGrid className="w-7 h-7 text-orange-500" />
                    Parent App
                </h1>
                <p className="text-sm text-[#374151] mt-1">
                    Centre CMS — manage what goes to the <strong>real parent login app</strong> (web and mobile). Uploads
                    here appear for parents after class/centre rules apply. This screen is not the parent login; lists
                    below show everything sent to your centre (all classes). Head office can also publish to your centre
                    from admin CMS.
                </p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-2">
                {TAB_CONFIG.map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => selectTab(id)}
                        className={`rounded-full px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${tab === id ? "bg-[#FFF4CC] text-[#111827]" : "text-[#6B7280] hover:bg-[#F3F4F6]"}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === "homework" && <HomeworkTab authFetch={authFetch} showToast={showToast} onRefresh={loadStudents} />}
            {tab === "notifications" && (
                <FranchiseAnnouncementsPanel authFetch={authFetch} showToast={showToast} students={students} />
            )}
            {tab === "timetable" && <FranchiseNewsletterPanel authFetch={authFetch} showToast={showToast} />}
            {tab === "activities" && <FranchiseDailyActivitiesPanel authFetch={authFetch} showToast={showToast} />}
            {tab === "parental_tips" && <FranchiseParentalTipsPanel authFetch={authFetch} showToast={showToast} />}
            {tab === "transport" && <TransportTab authFetch={authFetch} showToast={showToast} students={students} />}
            {tab === "calendar" && <CalendarAttendanceTab />}
            {tab === "showcase" && <FranchiseEventsPanel />}
            {tab === "fees" && <FranchiseFeesPanel authFetch={authFetch} showToast={showToast} />}
            {tab === "holidays" && <FranchiseHolidayPanel authFetch={authFetch} showToast={showToast} />}
        </div>
    );
}

function CalendarAttendanceTab() {
    const [attendanceDate, setAttendanceDate] = useState(todayLocal);

    return (
        <div className="space-y-6">
            <ParentPortalCalendarPanel
                mode="franchise"
                linkedDate={attendanceDate}
                onLinkedDateChange={setAttendanceDate}
            />
            <FranchiseAttendancePanel controlledDate={attendanceDate} onControlledDateChange={setAttendanceDate} />
        </div>
    );
}


type HomeworkRow = {
    id: number;
    title: string;
    description?: string;
    class_name?: string;
    assigned_date: string;
    attachment?: string | null;
    attachment_name?: string;
    attachment_kind?: string;
    read_count?: number;
    viewed_by_parents?: any[];
};

function HomeworkTab({
    authFetch,
    showToast,
    onRefresh,
}: {
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
    onRefresh: () => void;
}) {
    const [rows, setRows] = useState<HomeworkRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        class_name: "",
        assigned_date: todayLocal(),
        title: "",
        description: "",
        attachment: null as File | null,
    });
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [editModal, setEditModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [editSaving, setEditSaving] = useState(false);
    const [submissionsModal, setSubmissionsModal] = useState<{
        isOpen: boolean;
        row: HomeworkRow | null;
        loading: boolean;
        list: any[];
    }>({ isOpen: false, row: null, loading: false, list: [] });

    const openSubmissions = async (row: HomeworkRow) => {
        setSubmissionsModal({ isOpen: true, row, loading: true, list: [] });
        try {
            const detail = await authFetch<any>(`/students/franchise/homework/${row.id}/`);
            setSubmissionsModal({
                isOpen: true,
                row,
                loading: false,
                list: detail.submissions || [],
            });
        } catch {
            showToast("Failed to load submissions", "error");
            setSubmissionsModal((prev) => ({ ...prev, isOpen: false, loading: false }));
        }
    };

    const [editForm, setEditForm] = useState({
        class_name: "",
        assigned_date: "",
        title: "",
        description: "",
        attachment: null as File | null,
        existingAttachmentName: "",
    });
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [trackDate, setTrackDate] = useState(todayLocal);
    const [viewAllOpen, setViewAllOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authFetch<unknown>(
                `/students/franchise/homework/?assigned_date=${encodeURIComponent(trackDate)}`,
            );
            setRows(normalizeList<HomeworkRow>(data));
        } catch {
            showToast("Failed to load homework", "error");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, trackDate, showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const normalizedClassName = form.class_name.trim();

            if (form.attachment) {
                const maxSize = 5 * 1024 * 1024;
                if (form.attachment.size > maxSize) {
                    showToast("Attachment too large. Max 5MB.", "error");
                    return;
                }
                const ct = (form.attachment.type || "").toLowerCase();
                const isPdf = ct === "application/pdf" || form.attachment.name.toLowerCase().endsWith(".pdf");
                const isImage = ct.startsWith("image/");
                if (!isPdf && !isImage) {
                    showToast("Only image or PDF attachments allowed.", "error");
                    return;
                }

                const fd = new FormData();
                fd.append("title", form.title.trim());
                fd.append("description", form.description.trim());
                fd.append("assigned_date", form.assigned_date);
                fd.append("class_name", normalizedClassName);
                fd.append("attachment", form.attachment);
                fd.append("attachment_name", form.attachment.name);
                fd.append("attachment_kind", isPdf ? "PDF" : "IMAGE");
                await authFetch("/students/franchise/homework/", { method: "POST", body: fd });
            } else {
                const body: Record<string, unknown> = {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    assigned_date: form.assigned_date,
                    class_name: normalizedClassName,
                };
                body.student = null;
                await authFetch("/students/franchise/homework/", { method: "POST", headers: jsonHeaders(), body: JSON.stringify(body) });
            }

            const uploadedDate = form.assigned_date.trim() || trackDate;
            setForm({ class_name: "", assigned_date: todayLocal(), title: "", description: "", attachment: null });
            setTrackDate(uploadedDate);
            setSelectedClass(null);
            showToast("Homework published", "success");
            onRefresh();
        } catch {
            showToast("Save failed", "error");
        }
    };

    const remove = async (id: number) => {
        try {
            await authFetch(`/students/franchise/homework/${id}/`, { method: "DELETE" });
            showToast("Deleted", "success");
            await load();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    const openEdit = async (row: HomeworkRow) => {
        try {
            const detail = await authFetch<HomeworkRow>(`/students/franchise/homework/${row.id}/`);
            setEditForm({
                class_name: detail.class_name?.trim() || "",
                assigned_date: detail.assigned_date || "",
                title: detail.title || "",
                description: detail.description || "",
                attachment: null,
                existingAttachmentName: detail.attachment_name || "",
            });
            setEditModal({ isOpen: true, id: row.id });
        } catch {
            showToast("Could not load homework", "error");
        }
    };

    const closeEdit = () => {
        setEditModal({ isOpen: false, id: null });
        setEditForm({
            class_name: "",
            assigned_date: "",
            title: "",
            description: "",
            attachment: null,
            existingAttachmentName: "",
        });
    };

    const saveEdit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editModal.id) return;

        try {
            setEditSaving(true);
            const normalizedClassName = editForm.class_name.trim();

            if (editForm.attachment) {
                const maxSize = 5 * 1024 * 1024;
                if (editForm.attachment.size > maxSize) {
                    showToast("Attachment too large. Max 5MB.", "error");
                    return;
                }
                const ct = (editForm.attachment.type || "").toLowerCase();
                const isPdf = ct === "application/pdf" || editForm.attachment.name.toLowerCase().endsWith(".pdf");
                const isImage = ct.startsWith("image/");
                if (!isPdf && !isImage) {
                    showToast("Only image or PDF attachments allowed.", "error");
                    return;
                }

                const fd = new FormData();
                fd.append("title", editForm.title.trim());
                fd.append("description", editForm.description.trim());
                fd.append("assigned_date", editForm.assigned_date);
                fd.append("class_name", normalizedClassName);
                fd.append("attachment", editForm.attachment);
                fd.append("attachment_name", editForm.attachment.name);
                fd.append("attachment_kind", isPdf ? "PDF" : "IMAGE");
                await authFetch(`/students/franchise/homework/${editModal.id}/`, { method: "PATCH", body: fd });
            } else {
                await authFetch(`/students/franchise/homework/${editModal.id}/`, {
                    method: "PATCH",
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        title: editForm.title.trim(),
                        description: editForm.description.trim(),
                        assigned_date: editForm.assigned_date,
                        class_name: normalizedClassName,
                    }),
                });
            }

            closeEdit();
            showToast("Homework updated", "success");
            await load();
            onRefresh();
        } catch {
            showToast("Update failed", "error");
        } finally {
            setEditSaving(false);
        }
    };

    const classLabels = useMemo(() => {
        const fromOptions = HOMEWORK_CLASS_OPTIONS.filter((o) => o.value).map((o) => o.label);
        const fromRows = rows.map((r) => r.class_name?.trim() || "").filter(Boolean);
        return Array.from(new Set([...fromOptions, ...fromRows]));
    }, [rows]);

    const postedClassesForDate = useMemo(() => {
        const posted = new Set<string>();
        const hasAllClasses = rows.some(
            (r) => homeworkDate(r.assigned_date) === trackDate && !(r.class_name || "").trim(),
        );
        if (hasAllClasses) {
            classLabels.forEach((c) => posted.add(c));
        }
        for (const r of rows) {
            if (homeworkDate(r.assigned_date) === trackDate) {
                const name = r.class_name?.trim();
                if (name) posted.add(name);
            }
        }
        return posted;
    }, [rows, trackDate, classLabels]);

    const pendingClasses = useMemo(
        () => classLabels.filter((c) => !postedClassesForDate.has(c)),
        [classLabels, postedClassesForDate],
    );

    const listRows = useMemo(
        () => rows.filter((r) => homeworkDate(r.assigned_date) === trackDate),
        [rows, trackDate],
    );

    const byClass = useMemo(() => {
        const m = new Map<string, typeof rows>();
        for (const r of listRows) {
            const key = r.class_name?.trim() || "All classes";
            m.set(key, [...(m.get(key) || []), r]);
        }
        return Array.from(m.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([className, items]) => [className, [...items].sort((a, b) => b.id - a.id)] as const);
    }, [listRows]);

    const visibleByClass = useMemo(
        () => (selectedClass ? byClass.filter(([name]) => name === selectedClass) : byClass),
        [byClass, selectedClass],
    );

    const totalItemCount = useMemo(
        () => visibleByClass.reduce((count, [, items]) => count + items.length, 0),
        [visibleByClass],
    );

    const previewClasses = useMemo(() => visibleByClass.slice(0, HOMEWORK_VISIBLE_CLASSES), [visibleByClass]);

    const shownItemCount = useMemo(
        () => previewClasses.reduce((count, [, items]) => count + Math.min(items.length, HOMEWORK_CARD_PREVIEW), 0),
        [previewClasses],
    );

    const showViewAll =
        totalItemCount > shownItemCount || visibleByClass.length > HOMEWORK_VISIBLE_CLASSES;

    useEffect(() => {
        if (viewAllOpen && totalItemCount === 0) setViewAllOpen(false);
    }, [viewAllOpen, totalItemCount]);

    const renderHomeworkRow = (r: HomeworkRow) => (
        <li key={r.id} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
            <span className="font-medium text-[#1F2937] min-w-0">{r.title}</span>
            <div className="flex items-center gap-3 shrink-0">
                <button
                    type="button"
                    className="text-[#FF922B] text-xs font-semibold hover:underline"
                    onClick={() => void openSubmissions(r)}
                >
                    Submissions
                </button>
                <button type="button" className="text-[#2563EB] text-xs font-semibold" onClick={() => void openEdit(r)}>
                    Edit
                </button>
                <button
                    type="button"
                    className="text-red-600 text-xs font-semibold"
                    onClick={() => setConfirmDelete({ isOpen: true, id: r.id })}
                >
                    Delete
                </button>
            </div>
        </li>
    );

    return (
        <div className="space-y-4">
            <form onSubmit={submit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 grid md:grid-cols-2 gap-3">
                <div className="md:col-span-2 grid gap-3 grid-cols-1 sm:grid-cols-2 items-end">
                    <label className="text-xs font-semibold text-[#4B5563] min-w-0">
                        Title
                        <input
                            required
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#FF922B] focus:outline-none"
                            placeholder="e.g. Alphabet practice"
                        />
                    </label>
                    <label className="text-xs font-semibold text-[#4B5563] min-w-0">
                        Class name
                        <select
                            value={form.class_name}
                            onChange={(e) => setForm((p) => ({ ...p, class_name: e.target.value }))}
                            className="mt-1 w-full min-w-0 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] bg-white focus:border-[#FF922B] focus:outline-none"
                        >
                            {HOMEWORK_CLASS_OPTIONS.map((opt) => (
                                <option key={opt.value || "all"} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <label className="text-xs font-semibold text-[#4B5563]">
                    Date
                    <input type="date" required value={form.assigned_date} onChange={(e) => setForm((p) => ({ ...p, assigned_date: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                    <span className="mt-1 block text-[11px] font-normal text-[#6B7280]">
                        Parents only see homework on this date (from midnight IST), not before.
                    </span>
                </label>
                <label className="text-xs font-semibold text-[#4B5563] md:col-span-2">
                    Description
                    <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold text-[#4B5563] md:col-span-2">
                    Attachment (optional: image or PDF, max 5MB)
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setForm((p) => ({ ...p, attachment: e.target.files?.[0] || null }))}
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white"
                    />
                </label>
                <Button type="submit" className="md:col-span-2 bg-[#FF922B] text-white w-fit">
                    Add homework
                </Button>
            </form>
            <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-3 lg:sticky lg:top-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-[#111827]">Homework by class</h3>
                            <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-700 border border-orange-100">
                                {trackDate}
                            </span>
                        </div>
                        {selectedClass ? (
                            <button
                                type="button"
                                onClick={() => setSelectedClass(null)}
                                className="text-xs font-semibold text-[#FF922B] hover:underline"
                            >
                                Show all classes
                            </button>
                        ) : null}
                    </div>
                    <p className="text-xs text-[#6B7280]">
                        Linked to the track date on the right. Preview shows a few classes — use View all for the full list.
                    </p>
                    {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : null}
                    {!loading && visibleByClass.length === 0 ? (
                        <p className="text-sm text-[#6B7280] rounded-xl border border-dashed border-[#E5E7EB] px-4 py-8 text-center">
                            {selectedClass
                                ? `No homework posted for ${selectedClass} on ${trackDate}.`
                                : `No homework posted for ${trackDate}. Change the track date on the right.`}
                        </p>
                    ) : (
                        <>
                            <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
                                {previewClasses.map(([className, items]) => {
                                    const previewItems = items.slice(0, HOMEWORK_CARD_PREVIEW);
                                    return (
                                        <div key={className} className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
                                            <div className="flex items-center justify-between gap-2 border-b border-[#F3F4F6] bg-[#FFFBEB] px-4 py-2">
                                                <span className="text-xs font-bold text-orange-800">{className}</span>
                                                <span className="text-[10px] font-semibold text-orange-600">
                                                    {items.length} item{items.length === 1 ? "" : "s"}
                                                </span>
                                            </div>
                                            <ul className="divide-y">{previewItems.map((r) => renderHomeworkRow(r))}</ul>
                                        </div>
                                    );
                                })}
                            </div>
                            {showViewAll ? (
                                <button
                                    type="button"
                                    onClick={() => setViewAllOpen(true)}
                                    className="w-full rounded-xl border border-orange-100 bg-orange-50 px-4 py-2.5 text-xs font-bold text-[#FF922B] transition-colors hover:bg-orange-100"
                                >
                                    View all ({totalItemCount})
                                </button>
                            ) : null}
                        </>
                    )}
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4 lg:sticky lg:top-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-[#111827]">Pending homework tracker</h3>
                        <p className="text-xs text-[#6B7280]">See which classes still need homework posted for a date.</p>
                    </div>
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Track date
                        <input
                            type="date"
                            value={trackDate}
                            onChange={(e) => {
                                setTrackDate(e.target.value);
                                setSelectedClass(null);
                            }}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700">
                            Posted: {postedClassesForDate.size}
                        </span>
                        <span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700">
                            Pending: {pendingClasses.length}
                        </span>
                    </div>
                    <ul className="divide-y border rounded-xl max-h-[420px] overflow-y-auto">
                        {classLabels.map((className) => {
                            const isPosted = postedClassesForDate.has(className);
                            return (
                                <li key={className}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedClass(className)}
                                        className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#F9FAFB] ${
                                            selectedClass === className ? "bg-orange-50" : ""
                                        }`}
                                    >
                                        <span className="font-medium text-[#1F2937] min-w-0 truncate">{className}</span>
                                        <span
                                            className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                                                isPosted
                                                    ? "border border-green-100 bg-green-50 text-green-700"
                                                    : "border border-red-100 bg-red-50 text-red-700"
                                            }`}
                                        >
                                            {isPosted ? "Posted" : "Pending"}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            <Modal
                isOpen={viewAllOpen}
                onClose={() => setViewAllOpen(false)}
                title={`All homework — ${trackDate}`}
                size="md"
                placement="center"
            >
                <p className="mb-3 text-xs text-[#6B7280]">
                    {totalItemCount} homework item{totalItemCount === 1 ? "" : "s"} across {visibleByClass.length} class
                    {visibleByClass.length === 1 ? "" : "es"}.
                </p>
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                    {visibleByClass.map(([className, items]) => (
                        <div key={className} className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                            <div className="flex items-center justify-between gap-2 border-b border-[#F3F4F6] bg-[#FFFBEB] px-4 py-2">
                                <span className="text-xs font-bold text-orange-800">{className}</span>
                                <span className="text-[10px] font-semibold text-orange-600">
                                    {items.length} item{items.length === 1 ? "" : "s"}
                                </span>
                            </div>
                            <ul className="divide-y">{items.map((r) => renderHomeworkRow(r))}</ul>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal isOpen={editModal.isOpen} onClose={closeEdit} title="Edit homework" size="md" placement="center">
                <form onSubmit={saveEdit} className="space-y-3">
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Title
                        <input
                            required
                            value={editForm.title}
                            onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Class name
                        <select
                            value={editForm.class_name}
                            onChange={(e) => setEditForm((p) => ({ ...p, class_name: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-white"
                        >
                            {HOMEWORK_CLASS_OPTIONS.map((opt) => (
                                <option key={opt.value || "all"} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Date
                        <input
                            type="date"
                            required
                            value={editForm.assigned_date}
                            onChange={(e) => setEditForm((p) => ({ ...p, assigned_date: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Description
                        <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                            rows={4}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Attachment (optional: replace with new image or PDF, max 5MB)
                        {editForm.existingAttachmentName ? (
                            <p className="mt-1 text-[11px] font-normal text-[#6B7280]">
                                Current file: {editForm.existingAttachmentName}
                            </p>
                        ) : null}
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setEditForm((p) => ({ ...p, attachment: e.target.files?.[0] || null }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-white"
                        />
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                        <Button type="submit" className="bg-[#FF922B] text-white" disabled={editSaving}>
                            {editSaving ? "Saving…" : "Save changes"}
                        </Button>
                        <Button type="button" onClick={closeEdit} className="bg-gray-100 text-gray-700">
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => confirmDelete.id && remove(confirmDelete.id)}
                title="Delete Homework"
                description="Are you sure you want to delete this homework? This action cannot be undone."
                confirmText="Yes, Delete"
                variant="danger"
            />

            <Modal
                isOpen={submissionsModal.isOpen}
                onClose={() => setSubmissionsModal((prev) => ({ ...prev, isOpen: false }))}
                title={`Submissions — ${submissionsModal.row?.title || ""}`}
                size="md"
                placement="center"
            >
                {submissionsModal.loading ? (
                    <div className="py-12 text-center text-xs text-gray-500 font-bold">
                        Loading submissions...
                    </div>
                ) : submissionsModal.list.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-400 font-semibold border border-dashed border-gray-200 rounded-2xl">
                        No submissions yet. Parents haven&apos;t marked this homework as completed.
                    </div>
                ) : (
                    <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1">
                        <div className="divide-y border border-[#E5E7EB] rounded-2xl bg-white overflow-hidden">
                            {submissionsModal.list.map((sub: any) => (
                                <div key={sub.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                                    <div className="space-y-1">
                                        <p className="font-bold text-[#1F2937]">{sub.student_name}</p>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase">
                                            Completed on {new Date(sub.completed_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {sub.completed_images && sub.completed_images.length > 0 ? (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {sub.completed_images.map((imgUrl: string, idx: number) => (
                                                    <a
                                                        key={idx}
                                                        href={imgUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block hover:opacity-90 relative group"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <img
                                                            src={imgUrl}
                                                            alt={`Submission thumbnail ${idx + 1}`}
                                                            className="w-12 h-12 object-cover rounded-lg border border-orange-100 shadow-xs"
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        ) : sub.completed_image ? (
                                            <a
                                                href={sub.completed_image}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block hover:opacity-90 relative group"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <img
                                                    src={sub.completed_image}
                                                    alt="Submission thumbnail"
                                                    className="w-12 h-12 object-cover rounded-lg border border-orange-100 shadow-xs"
                                                />
                                            </a>
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-400 italic">
                                                No image uploaded
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 font-bold rounded-lg border border-green-100 bg-green-50 text-green-700">
                                            Completed ✓
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

type AnnouncementRow = {
    id: number;
    title: string;
    body?: string;
    published_at?: string;
    student?: number | null;
    student_name?: string;
    class_name?: string;
    audience_label?: string;
    notification_origin?: "centre" | "head_office";
    is_scheduled?: boolean;
};

const originLabel: Record<NonNullable<AnnouncementRow["notification_origin"]>, string> = {
    centre: "Your centre",
    head_office: "Head office",
};

const announcementRowDate = (row: AnnouncementRow) => homeworkDate(row.published_at) || "—";

function AnnouncementsTab({ authFetch }: { authFetch: AuthFetchFn }) {
    const [rows, setRows] = useState<AnnouncementRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [trackDate, setTrackDate] = useState(todayLocal);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ published_date: trackDate });
            const data = await authFetch<unknown>(`/students/franchise/announcements/?${params.toString()}`);
            setRows(normalizeList<AnnouncementRow>(data));
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, trackDate]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <div className="max-w-2xl rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4">
            <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#111827]">Parent notifications</h3>
                <p className="text-xs text-[#6B7280]">
                    Messages that went to parents on the selected date — from your centre or head office. Head-office
                    centre alerts (not sent to parents) appear under Franchise → Notifications.
                </p>
            </div>
            <label className="block text-xs font-semibold text-[#4B5563]">
                Track date
                <input
                    type="date"
                    value={trackDate}
                    onChange={(e) => setTrackDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                />
            </label>
            {!loading ? (
                <span className="w-fit rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 border border-orange-100">
                    Sent: {rows.length}
                </span>
            ) : null}
            {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : null}
            {!loading && rows.length === 0 ? (
                <p className="text-sm text-center text-[#6B7280] rounded-xl border border-dashed border-[#E5E7EB] px-4 py-8">
                    No parent notifications for {trackDate}. Send one from Parent Portal CMS or check another date.
                </p>
            ) : null}
            {!loading && rows.length > 0 ? (
                <ul className="divide-y border rounded-xl max-h-[420px] overflow-y-auto">
                    {rows.map((r) => (
                        <li key={r.id} className="px-4 py-3 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-[#1F2937]">{r.title}</p>
                                {r.notification_origin ? (
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                                            r.notification_origin === "head_office"
                                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                                : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                        }`}
                                    >
                                        {originLabel[r.notification_origin]}
                                    </span>
                                ) : null}
                                <span className="shrink-0 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold text-[#4B5563]">
                                    {r.audience_label || "All parents"}
                                </span>
                                {r.is_scheduled ? (
                                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-100">
                                        Scheduled
                                    </span>
                                ) : null}
                            </div>
                            {r.body ? (
                                <p className="mt-1 text-xs text-[#4B5563] whitespace-pre-wrap">{r.body}</p>
                            ) : null}
                            <p className="text-[11px] text-[#6B7280] mt-0.5">
                                {r.published_at ? new Date(r.published_at).toLocaleString() : announcementRowDate(r)}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}

function TransportTab({
    authFetch,
    showToast,
    students,
}: {
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
    students: MiniStudent[];
}) {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [rows, setRows] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    
    // Left side form state
    const [routeName, setRouteName] = useState("");
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [studentSearchQuery, setStudentSearchQuery] = useState("");
    const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
    const [expandedAssignedRoutes, setExpandedAssignedRoutes] = useState<Record<number, boolean>>({});

    const toggleClass = (className: string) => {
        setExpandedClasses(prev => ({ ...prev, [className]: !prev[className] }));
    };

    // Delete confirmation state
    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean;
        id: number | null;
    }>({
        isOpen: false,
        id: null,
    });

    const load = useCallback(async () => {
        try {
            const [routeData, driverData, assignmentData] = await Promise.all([
                authFetch<unknown>("/students/franchise/transport/"),
                authFetch<unknown>("/students/franchise/drivers/"),
                authFetch<unknown>("/students/franchise/transport-assignments/"),
            ]);
            setRows(normalizeList<any>(routeData));
            setDrivers(normalizeList<any>(driverData));
            setAssignments(normalizeList<any>(assignmentData));
        } catch {
            setRows([]);
            setDrivers([]);
            setAssignments([]);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    // Create Route & Assign Students
    const submitCreateRoute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!routeName.trim()) return;
        
        setIsSubmitting(true);
        try {
            // 1. Create Route
            const routeRes = await authFetch<any>("/students/franchise/transport/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ route_name: routeName.trim() }),
            });
            
            const newRouteId = routeRes.id;
            
            // 2. Assign selected students
            if (selectedStudents.length > 0) {
                await Promise.all(selectedStudents.map(async (studentId) => {
                    await authFetch("/students/franchise/transport-assignments/", {
                        method: "POST",
                        headers: jsonHeaders(),
                        body: JSON.stringify({
                            route: newRouteId,
                            student: studentId,
                            pickup_stop: "",
                            drop_stop: "",
                        }),
                    });
                }));
            }

            showToast("Route created and students assigned", "success");
            setRouteName("");
            setSelectedStudents([]);
            await load();
        } catch (err) {
            showToast("Failed to create route or assign students", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Quick assign driver to existing route
    const assignDriver = async (routeId: number, driverProfileId: string) => {
        try {
            await authFetch(`/students/franchise/transport/${routeId}/`, {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    driver_profile: driverProfileId ? Number(driverProfileId) : null,
                }),
            });
            showToast("Driver assigned", "success");
            await load();
        } catch {
            showToast("Failed to assign driver", "error");
        }
    };

    const deleteRoute = async (id: number) => {
        try {
            await authFetch(`/students/franchise/transport/${id}/`, { method: "DELETE" });
            showToast("Route deleted", "success");
            await load();
        } catch {
            showToast("Could not delete route", "error");
        }
    };

    const deleteAssignment = async (id: number) => {
        try {
            await authFetch(`/students/franchise/transport-assignments/${id}/`, { method: "DELETE" });
            showToast("Student removed from route", "success");
            await load();
        } catch {
            showToast("Failed to remove student", "error");
        }
    };

    const unassignedStudents = students
        .filter(s => !assignments.some(a => a.student === s.id))
        .filter(s => s.full_name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
                     (s.class_name && s.class_name.toLowerCase().includes(studentSearchQuery.toLowerCase())));



    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* LEFT SIDE: Creation Flow */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-[#111827]">Create New Route</h3>
                    <p className="text-sm text-[#6B7280]">Select students and add a new route for them.</p>
                </div>
                
                <form onSubmit={submitCreateRoute} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#374151]">1. Select Unassigned Students</label>
                        <input
                            type="text"
                            placeholder="Search students by name or class..."
                            value={studentSearchQuery}
                            onChange={(e) => setStudentSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        />
                        <div className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] h-64 overflow-y-auto p-2 space-y-2">
                            {unassignedStudents.length === 0 ? (
                                <p className="text-xs text-[#6B7280] text-center p-4">All students are assigned to routes.</p>
                            ) : (
                                unassignedStudents.map((s) => (
                                    <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(s.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedStudents([...selectedStudents, s.id]);
                                                else setSelectedStudents(selectedStudents.filter(id => id !== s.id));
                                            }}
                                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-4 h-4"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-[#111827]">{s.full_name}</p>
                                            <p className="text-[10px] text-[#6B7280]">{s.class_name || "No class"}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#374151]">2. Name the Route</label>
                        <input
                            required
                            placeholder="e.g. Morning Pickup Route 1"
                            value={routeName}
                            onChange={(e) => setRouteName(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isSubmitting || !routeName.trim()}
                        className="bg-[#FF922B] hover:bg-[#F97316] text-white w-full py-3 rounded-xl font-semibold shadow-sm transition-colors"
                    >
                        {isSubmitting ? "Creating..." : `Create Route & Assign ${selectedStudents.length} Students`}
                    </Button>
                </form>
            </div>

            {/* RIGHT SIDE: Management & History */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                    <div>
                        <h3 className="text-lg font-bold text-[#111827]">Route History & Management</h3>
                        <p className="text-sm text-[#6B7280]">Assign drivers and manage your routes.</p>
                    </div>
                    <button type="button" onClick={() => void load()} className="p-2 text-gray-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>

                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-1">
                    {rows.length === 0 && (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-500">No routes created yet.</p>
                        </div>
                    )}
                    
                    {rows.map((r) => (
                        <div key={r.id} className="rounded-xl border border-[#E5E7EB] overflow-hidden bg-[#F9FAFB]">
                            {/* Route Header */}
                            <div className="p-4 bg-white border-b flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h4 className="font-bold text-[#111827] text-base">{r.route_name}</h4>
                                    
                                    {/* Quick Driver Assign */}
                                    <div className="mt-3">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Assigned Driver</label>
                                        {r.driver_profile ? (
                                            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3">
                                                <span className="text-sm font-semibold text-[#111827]">
                                                    {drivers.find(d => d.id === (r.driver_profile?.id || r.driver_profile))?.user?.full_name || "Assigned"}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => assignDriver(r.id, "")}
                                                    className="text-xs text-red-500 font-semibold hover:underline"
                                                >
                                                    Unassign
                                                </button>
                                            </div>
                                        ) : (
                                            <select
                                                value=""
                                                onChange={(e) => assignDriver(r.id, e.target.value)}
                                                className="w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 px-2 bg-gray-50 hover:bg-white transition-colors"
                                            >
                                                <option value="">-- Select driver to assign --</option>
                                                {drivers.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.user?.full_name || d.user?.email}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete({ isOpen: true, id: r.id })}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                    title="Delete route"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>

                            {/* Assigned Students */}
                            <div className="p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assigned Students</p>
                                <ul className="space-y-1">
                                    {(() => {
                                        const routeAssignments = assignments.filter(a => a.route === r.id);
                                        const isExpanded = expandedAssignedRoutes[r.id];
                                        const visibleAssignments = isExpanded ? routeAssignments : routeAssignments.slice(0, 10);
                                        
                                        return (
                                            <>
                                                {routeAssignments.length === 0 && (
                                                    <li className="text-xs text-gray-500 italic">No students assigned.</li>
                                                )}
                                                {visibleAssignments.map((a) => (
                                                    <li key={a.id} className="flex items-center justify-between group py-1 border-b border-transparent hover:border-gray-200">
                                                        <span className="text-sm font-medium text-gray-700">{a.student_name}</span>
                                                        <button
                                                            onClick={() => deleteAssignment(a.id)}
                                                            className="text-xs text-red-500 opacity-0 group-hover:opacity-100 font-semibold hover:underline transition-opacity px-2"
                                                        >
                                                            Remove
                                                        </button>
                                                    </li>
                                                ))}
                                                {routeAssignments.length > 10 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedAssignedRoutes(prev => ({...prev, [r.id]: !isExpanded}))}
                                                        className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-800 py-2 mt-1 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        {isExpanded ? "Show less" : `Show all ${routeAssignments.length} students`}
                                                    </button>
                                                )}
                                            </>
                                        );
                                    })()}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => {
                    if (confirmDelete.id) void deleteRoute(confirmDelete.id);
                }}
                title="Delete route"
                description="Are you sure you want to delete this route and all its assignments?"
                confirmText="Yes, delete"
                variant="danger"
            />
        </div>
    );
}


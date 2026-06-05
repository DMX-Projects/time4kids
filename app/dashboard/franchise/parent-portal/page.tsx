"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LayoutGrid, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchAllApiList } from "@/lib/parent-school-api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { jsonHeaders } from "@/lib/api-client";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";
import { openParentDocumentFile } from "@/lib/parent-document-file-open";
import { acceptForParentDocumentCategory, uploadHintForParentDocumentCategory } from "@/lib/parent-document-upload-accept";
import {
    PARENT_NEWSLETTER_CATEGORY,
    PARENT_NEWSLETTER_DESCRIPTION,
    PARENT_NEWSLETTER_LABEL,
    PARENT_NEWSLETTER_UPLOAD_LABEL,
    validateNewsletterUpload,
} from "@/config/parent-newsletter";
import { DEFAULT_HOLIDAY_ACADEMIC_YEAR } from "@/config/parent-document-categories";
import {
    emptyHolidayEntry,
    formatHolidayDate,
    parseHolidayEntries,
    mergeHolidayEntries,
    serializeHolidayEntries,
    validateHolidayEntries,
    type HolidayEntry,
} from "@/config/holiday-entries";
import HolidayEntriesEditor from "@/components/dashboard/HolidayEntriesEditor";
import HolidayEntriesReadOnly from "@/components/dashboard/HolidayEntriesReadOnly";
import { validateAdminParentDocumentUpload } from "@/lib/franchise-centre-upload";
import { CENTRE_PROGRAM_LABELS } from "@/config/centre-program-cards-defaults";
import dynamic from "next/dynamic";

const HOMEWORK_CLASS_OPTIONS = [
    { value: "", label: "All classes" },
    ...CENTRE_PROGRAM_LABELS.map((p) => ({ value: p.label, label: p.label })),
];

const HOMEWORK_CARD_PREVIEW = 3;
const HOMEWORK_VISIBLE_CLASSES = 3;

/** Existing franchise pages — embedded here instead of separate sidebar links. */
const FranchiseAttendancePanel = dynamic(() => import("../attendance/page"), { ssr: false });
const FranchiseEventsPanel = dynamic(() => import("../events/page"), { ssr: false });
type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
type ShowToastFn = (message: string, variant?: "success" | "error") => void;

type MiniStudent = { id: number; full_name: string; class_name: string };

/** API dates may arrive as YYYY-MM-DD or ISO datetime — compare using first 10 chars. */
const homeworkDate = (value: string | undefined | null) => String(value || "").slice(0, 10);

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
    | "transport"
    | "calendar"
    | "showcase"
    | "fees"
    | "holidays";

const TAB_CONFIG: { id: Tab; label: string }[] = [
    { id: "homework", label: "Homework" },
    { id: "notifications", label: "Notifications" },
    { id: "timetable", label: "Newsletter" },
    { id: "transport", label: "Transport" },
    { id: "calendar", label: "Attendance" },
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
    const { authFetch } = useAuth();
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
        try {
            const rows = await fetchAllApiList(authFetch, "/students/franchise/students/mini/");
            setStudents(rows as MiniStudent[]);
        } catch {
            setStudents([]);
        }
    }, [authFetch]);

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
                    Everything parents see in the parent app is managed here (same order as the parent login menu). Upload Newsletter from this portal; Holiday lists are added by head office and can be updated for your centre.
                    Parents change <strong className="text-[#111827]">Settings</strong> and use <strong className="text-[#111827]">Support</strong> on their own after parent login.
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
            {tab === "notifications" && <AnnouncementsTab authFetch={authFetch} showToast={showToast} students={students} />}
            {tab === "timetable" && <NewsLetterTab authFetch={authFetch} showToast={showToast} />}
            {tab === "transport" && <TransportTab authFetch={authFetch} showToast={showToast} />}
            {tab === "calendar" && <FranchiseAttendancePanel />}
            {tab === "showcase" && <FranchiseEventsPanel />}
            {tab === "fees" && <FeesTab authFetch={authFetch} showToast={showToast} students={students} />}
            {tab === "holidays" && <HolidayListTab authFetch={authFetch} showToast={showToast} />}
        </div>
    );
}

type NewsLetterRow = {
    id: number;
    title: string;
    display_title?: string;
    file: string;
    period_start?: string | null;
    period_end?: string | null;
    created_at?: string;
};

const newsletterRowDate = (row: NewsLetterRow) =>
    homeworkDate(row.period_start) || homeworkDate(row.period_end) || homeworkDate(row.created_at) || "—";

function NewsLetterTab({ authFetch, showToast }: { authFetch: AuthFetchFn; showToast: ShowToastFn }) {
    const { tokens, authFetchBlobResponse } = useAuth();
    const [rows, setRows] = useState<NewsLetterRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState("");
    const [assignedDate, setAssignedDate] = useState(todayLocal);
    const [file, setFile] = useState<File | null>(null);
    const [trackDate, setTrackDate] = useState(todayLocal);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [editModal, setEditModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [editSaving, setEditSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        title: "",
        assigned_date: "",
        file: null as File | null,
        existingFileName: "",
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ manage: "newsletter", date: trackDate });
            const data = await authFetch<unknown>(`/documents/franchise/parent-documents/?${params.toString()}`);
            setRows(normalizeList<NewsLetterRow>(data));
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, trackDate]);

    useEffect(() => {
        void load();
    }, [load]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) {
            showToast("Choose a PDF or Word document to upload.", "error");
            return;
        }
        if (!assignedDate) {
            showToast("Select a date.", "error");
            return;
        }
        const sizeErr = validateNewsletterUpload(file);
        if (sizeErr) {
            showToast(sizeErr, "error");
            return;
        }
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("title", title.trim() || file.name.replace(/\.[^.]+$/i, ""));
            fd.append("period_start", assignedDate);
            fd.append("period_end", assignedDate);
            fd.append("file", file);
            await authFetch("/documents/franchise/parent-documents/", { method: "POST", body: fd });
            setTitle("");
            setAssignedDate(todayLocal());
            setFile(null);
            setTrackDate(assignedDate);
            showToast("Newsletter uploaded for parents.", "success");
            await load();
        } catch {
            showToast("Upload failed. Use a PDF or Word file.", "error");
        } finally {
            setUploading(false);
        }
    };

    const openEdit = async (row: NewsLetterRow) => {
        try {
            const detail = await authFetch<NewsLetterRow>(`/documents/franchise/parent-documents/${row.id}/`);
            setEditForm({
                title: detail.title || "",
                assigned_date:
                    homeworkDate(detail.period_start) ||
                    homeworkDate(detail.period_end) ||
                    homeworkDate(detail.created_at) ||
                    "",
                file: null,
                existingFileName: detail.display_title || detail.title || "Current file",
            });
            setEditModal({ isOpen: true, id: row.id });
        } catch {
            showToast("Could not load newsletter.", "error");
        }
    };

    const closeEdit = () => {
        setEditModal({ isOpen: false, id: null });
        setEditForm({ title: "", assigned_date: "", file: null, existingFileName: "" });
    };

    const saveEdit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editModal.id) return;
        if (!editForm.assigned_date) {
            showToast("Select a date.", "error");
            return;
        }
        if (editForm.file) {
            const sizeErr = validateNewsletterUpload(editForm.file);
            if (sizeErr) {
                showToast(sizeErr, "error");
                return;
            }
        }
        setEditSaving(true);
        try {
            if (editForm.file) {
                const fd = new FormData();
                fd.append("title", editForm.title.trim());
                fd.append("period_start", editForm.assigned_date);
                fd.append("period_end", editForm.assigned_date);
                fd.append("file", editForm.file);
                await authFetch(`/documents/franchise/parent-documents/${editModal.id}/`, { method: "PATCH", body: fd });
            } else {
                await authFetch(`/documents/franchise/parent-documents/${editModal.id}/`, {
                    method: "PATCH",
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        title: editForm.title.trim(),
                        period_start: editForm.assigned_date,
                        period_end: editForm.assigned_date,
                    }),
                });
            }
            closeEdit();
            showToast("Newsletter updated.", "success");
            await load();
        } catch {
            showToast("Update failed.", "error");
        } finally {
            setEditSaving(false);
        }
    };

    const remove = async (id: number) => {
        try {
            await authFetch(`/documents/franchise/parent-documents/${id}/`, { method: "DELETE" });
            await load();
            showToast("Newsletter removed.", "success");
        } catch {
            showToast("Delete failed.", "error");
        }
    };

    return (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start max-w-5xl">
            <form onSubmit={submit} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-3">
                <div>
                    <h3 className="text-sm font-semibold text-[#111827]">Upload {PARENT_NEWSLETTER_LABEL}</h3>
                    <p className="text-xs text-[#6B7280] mt-1">{PARENT_NEWSLETTER_DESCRIPTION}</p>
                </div>
                <label className="block text-xs font-semibold text-[#4B5563]">
                    Title
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Block 3 — AY 2026-27"
                        className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                    />
                </label>
                <label className="block text-xs font-semibold text-[#4B5563]">
                    Date
                    <input
                        type="date"
                        required
                        value={assignedDate}
                        onChange={(e) => setAssignedDate(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                    />
                </label>
                <label className="block text-xs font-semibold text-[#4B5563]">
                    {PARENT_NEWSLETTER_UPLOAD_LABEL}
                    <input
                        type="file"
                        required
                        accept={acceptForParentDocumentCategory(PARENT_NEWSLETTER_CATEGORY)}
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-white"
                    />
                    <span className="mt-1 block text-[11px] font-normal text-[#6B7280]">
                        {uploadHintForParentDocumentCategory(PARENT_NEWSLETTER_CATEGORY)}
                    </span>
                </label>
                <Button type="submit" disabled={uploading} className="bg-[#FF922B] text-white">
                    {uploading ? "Uploading…" : `Upload ${PARENT_NEWSLETTER_LABEL}`}
                </Button>
            </form>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4 lg:sticky lg:top-4 flex flex-col">
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[#111827]">Your centre newsletters</h3>
                    <p className="text-xs text-[#6B7280]">See which newsletters cover the selected date.</p>
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
                {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : null}
                {!loading && rows.length === 0 ? (
                    <p className="text-sm text-center text-[#6B7280] rounded-xl border border-dashed border-[#E5E7EB] px-4 py-8">
                        No newsletter for {trackDate}. Change the track date or upload one.
                    </p>
                ) : null}
                {!loading && rows.length > 0 ? (
                    <ul className="divide-y border rounded-xl max-h-[420px] overflow-y-auto">
                        {rows.map((row) => (
                            <li key={row.id} className="flex flex-nowrap items-center justify-between gap-3 px-4 py-3 text-sm">
                                <div className="min-w-0 flex-1">
                                    <button
                                        type="button"
                                        onClick={() => openParentDocumentFile(tokens?.access, authFetchBlobResponse, row)}
                                        className="block w-full truncate text-left font-medium text-[#1F2937] hover:text-[#FF922B] hover:underline"
                                    >
                                        {row.display_title || row.title}
                                    </button>
                                    <p className="text-[11px] text-[#6B7280] mt-0.5">{newsletterRowDate(row)}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(row)}
                                        className="whitespace-nowrap text-xs font-semibold text-[#2563EB] hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDelete({ isOpen: true, id: row.id })}
                                        className="whitespace-nowrap text-xs font-semibold text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>

            <Modal isOpen={editModal.isOpen} onClose={closeEdit} title="Edit newsletter">
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
                        Replace file (optional)
                        <input
                            type="file"
                            accept={acceptForParentDocumentCategory(PARENT_NEWSLETTER_CATEGORY)}
                            onChange={(e) => setEditForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-white"
                        />
                        <span className="mt-1 block text-[11px] font-normal text-[#6B7280]">
                            Current: {editForm.existingFileName}
                        </span>
                    </label>
                    <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={editSaving} className="bg-[#FF922B] text-white">
                            {editSaving ? "Saving…" : "Save changes"}
                        </Button>
                        <Button type="button" variant="secondary" onClick={closeEdit}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => confirmDelete.id && remove(confirmDelete.id)}
                title="Delete Newsletter"
                description="Remove this newsletter from the parent app? Parents will no longer see it."
                confirmText="Yes, Delete"
                variant="danger"
            />
        </div>
    );
}

type HolidayRow = {
    id: number;
    title: string;
    display_title?: string;
    file: string;
    state?: string | null;
    state_display?: string | null;
    academic_year?: string;
    franchise?: number | null;
    holiday_entries?: HolidayEntry[] | unknown;
};

type HolidayStateGroup = {
    state: string;
    stateDisplay: string;
    academicYear: string;
    global: HolidayRow | null;
    centre: HolidayRow | null;
};

function HolidayListTab({ authFetch, showToast }: { authFetch: AuthFetchFn; showToast: ShowToastFn }) {
    const [rows, setRows] = useState<HolidayRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        centreId: number | null;
        state: string;
        stateDisplay: string;
        academicYear: string;
    }>({ isOpen: false, centreId: null, state: "", stateDisplay: "", academicYear: DEFAULT_HOLIDAY_ACADEMIC_YEAR });
    const [editHolidayEntries, setEditHolidayEntries] = useState<HolidayEntry[]>([emptyHolidayEntry()]);
    const [editGlobalEntries, setEditGlobalEntries] = useState<HolidayEntry[]>([]);
    const [editSaving, setEditSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ manage: "holidays" });
            const data = await authFetch<unknown>(`/documents/franchise/parent-documents/?${params.toString()}`);
            setRows(normalizeList<HolidayRow>(data));
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    const stateGroups = useMemo((): HolidayStateGroup[] => {
        const globalRows = rows.filter((r) => !r.franchise);
        const centreRows = rows.filter((r) => r.franchise);
        const centreByState = new Map<string, HolidayRow>();
        for (const row of centreRows) {
            if (row.state) centreByState.set(row.state, row);
        }
        const states = new Set<string>();
        for (const row of globalRows) {
            if (row.state) states.add(row.state);
        }
        for (const row of centreRows) {
            if (row.state) states.add(row.state);
        }
        return Array.from(states)
            .sort((a, b) => {
                const labelA = globalRows.find((g) => g.state === a)?.state_display || centreByState.get(a)?.state_display || a;
                const labelB = globalRows.find((g) => g.state === b)?.state_display || centreByState.get(b)?.state_display || b;
                return labelA.localeCompare(labelB);
            })
            .map((state) => {
                const global = globalRows.find((g) => g.state === state) ?? null;
                const centre = centreByState.get(state) ?? null;
                return {
                    state,
                    stateDisplay: global?.state_display || centre?.state_display || state,
                    academicYear: centre?.academic_year || global?.academic_year || DEFAULT_HOLIDAY_ACADEMIC_YEAR,
                    global,
                    centre,
                };
            });
    }, [rows]);

    const openCentreEdit = async (group: HolidayStateGroup) => {
        setEditModal({
            isOpen: true,
            centreId: group.centre?.id ?? null,
            state: group.state,
            stateDisplay: group.stateDisplay,
            academicYear: group.academicYear,
        });
        setEditGlobalEntries(parseHolidayEntries(group.global?.holiday_entries));
        if (group.centre?.id) {
            try {
                const detail = await authFetch<HolidayRow>(`/documents/franchise/parent-documents/${group.centre.id}/`);
                const parsed = parseHolidayEntries(detail.holiday_entries);
                setEditHolidayEntries(parsed.length > 0 ? parsed : [emptyHolidayEntry()]);
            } catch {
                const parsed = parseHolidayEntries(group.centre.holiday_entries);
                setEditHolidayEntries(parsed.length > 0 ? parsed : [emptyHolidayEntry()]);
            }
        } else {
            setEditHolidayEntries([emptyHolidayEntry()]);
        }
    };

    const closeCentreEdit = () => {
        setEditModal({ isOpen: false, centreId: null, state: "", stateDisplay: "", academicYear: DEFAULT_HOLIDAY_ACADEMIC_YEAR });
        setEditHolidayEntries([emptyHolidayEntry()]);
        setEditGlobalEntries([]);
    };

    const saveCentreHoliday = async (e: FormEvent) => {
        e.preventDefault();
        const holidayErr = validateHolidayEntries(editHolidayEntries);
        if (holidayErr) {
            showToast(holidayErr, "error");
            return;
        }
        const serialized = serializeHolidayEntries(editHolidayEntries);
        setEditSaving(true);
        try {
            if (serialized.length === 0 && editModal.centreId) {
                await authFetch(`/documents/franchise/parent-documents/${editModal.centreId}/`, { method: "DELETE" });
                closeCentreEdit();
                showToast("Centre changes removed. Parents will see the head office list.", "success");
                await load();
                return;
            }
            if (serialized.length === 0) {
                showToast("Add at least one holiday for your centre, or change a date from head office.", "error");
                return;
            }
            const body = {
                category: "HOLIDAY_LISTS",
                state: editModal.state,
                academic_year: editModal.academicYear,
                title: `${editModal.stateDisplay} Holiday List`,
                holiday_entries: serialized,
            };
            if (editModal.centreId) {
                await authFetch(`/documents/franchise/parent-documents/${editModal.centreId}/`, {
                    method: "PATCH",
                    headers: jsonHeaders(),
                    body: JSON.stringify(body),
                });
            } else {
                await authFetch("/documents/franchise/parent-documents/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify(body),
                });
            }
            closeCentreEdit();
            showToast("Holiday list saved for your centre.", "success");
            await load();
        } catch {
            showToast("Save failed. Check holiday rows.", "error");
        } finally {
            setEditSaving(false);
        }
    };

    const removeCentreHoliday = async (id: number) => {
        try {
            await authFetch(`/documents/franchise/parent-documents/${id}/`, { method: "DELETE" });
            await load();
            showToast("Centre holiday list removed. Parents will see the head office version.", "success");
        } catch {
            showToast("Delete failed.", "error");
        }
    };

    return (
        <div className="max-w-3xl rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4">
            <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#111827]">Holiday list</h3>
                <p className="text-xs text-[#6B7280]">
                    Head office adds state holidays in Admin CMS. Your centre can add extra holidays or update a date — parents see
                    head office + your changes together.
                </p>
            </div>

            {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : null}

            {!loading && stateGroups.length > 0 ? (
                <ul className="divide-y border rounded-xl max-h-[520px] overflow-y-auto">
                    {stateGroups.map((group) => (
                        <li key={group.state} className="px-4 py-3 text-sm space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-[#111827]">{group.stateDisplay}</p>
                                    <p className="text-[11px] text-[#6B7280]">{group.academicYear}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openCentreEdit(group)}
                                        className="text-xs font-semibold text-[#2563EB] hover:underline"
                                    >
                                        {group.centre ? "Edit centre changes" : "Add for centre"}
                                    </button>
                                    {group.centre ? (
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDelete({ isOpen: true, id: group.centre!.id })}
                                            className="text-xs font-semibold text-red-600 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                            {(() => {
                                const globalEntries = parseHolidayEntries(group.global?.holiday_entries);
                                const centreEntries = parseHolidayEntries(group.centre?.holiday_entries);
                                const merged = mergeHolidayEntries(globalEntries, centreEntries);
                                return (
                                    <>
                                        {globalEntries.length > 0 ? (
                                            <p className="text-[11px] text-[#6B7280]">
                                                Head office: {globalEntries.length} holiday{globalEntries.length === 1 ? "" : "s"}
                                                {centreEntries.length > 0
                                                    ? ` · Your centre: ${centreEntries.length} change${centreEntries.length === 1 ? "" : "s"}`
                                                    : ""}
                                                {merged.length > 0 ? ` · Parents see: ${merged.length}` : ""}
                                            </p>
                                        ) : null}
                                        {!group.centre ? (
                                            <p className="text-[11px] text-[#6B7280]">
                                                No centre changes yet — parents see the head office list only.
                                            </p>
                                        ) : null}
                                        {centreEntries.length > 0 ? (
                                            <div className="rounded-lg border border-[#FED7AA] bg-[#FFF7ED]/50 px-3 py-2">
                                                <p className="text-[11px] font-semibold text-[#C2410C] mb-1">Your centre additions / updates</p>
                                                <ul className="space-y-0.5 text-[11px] text-[#374151]">
                                                    {centreEntries.map((row, index) => (
                                                        <li key={`c-${group.state}-${index}`}>
                                                            {formatHolidayDate(row.date)} — {row.name}
                                                            {row.city ? ` (${row.city})` : ""}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : null}
                                    </>
                                );
                            })()}
                        </li>
                    ))}
                </ul>
            ) : null}

            <Modal isOpen={editModal.isOpen} onClose={closeCentreEdit} title={`Holiday list — ${editModal.stateDisplay}`}>
                <form onSubmit={saveCentreHoliday} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    <p className="text-xs text-[#6B7280]">
                        Head office holidays are shown below (read only). Add new rows for your centre, or use the same date to
                        update a head office holiday. Parents see both combined.
                    </p>
                    <HolidayEntriesReadOnly
                        rows={editGlobalEntries}
                        title="Head office holidays"
                        emptyMessage="Head office has not added holidays for this state yet."
                    />
                    <HolidayEntriesEditor rows={editHolidayEntries} onChange={setEditHolidayEntries} compact />
                    <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={editSaving} className="bg-[#FF922B] text-white">
                            {editSaving ? "Saving…" : editModal.centreId ? "Save changes" : "Save for centre"}
                        </Button>
                        <Button type="button" variant="secondary" onClick={closeCentreEdit}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => confirmDelete.id && removeCentreHoliday(confirmDelete.id)}
                title="Remove centre holiday list"
                description="Parents at your centre will see the head office holiday list again for this state."
                confirmText="Yes, remove"
                variant="danger"
            />
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
        </div>
    );
}

type NotificationAudience = "all" | "class" | "student";

type AnnouncementRow = {
    id: number;
    title: string;
    body?: string;
    published_at?: string;
    student?: number | null;
    student_name?: string;
    class_name?: string;
    audience_label?: string;
};

const NOTIFICATION_CLASS_OPTIONS = HOMEWORK_CLASS_OPTIONS.filter((o) => o.value);

const NOTIFICATION_AUDIENCE_OPTIONS: { value: NotificationAudience; label: string }[] = [
    { value: "all", label: "All parents" },
    { value: "class", label: "Classes" },
    { value: "student", label: "Students" },
];

const audienceFromRow = (row: Pick<AnnouncementRow, "student" | "class_name">): NotificationAudience => {
    if (row.student) return "student";
    if ((row.class_name || "").trim()) return "class";
    return "all";
};

const announcementPayload = (input: {
    title: string;
    body: string;
    audience: NotificationAudience;
    class_name: string;
    student: string;
}) => {
    const base = { title: input.title.trim(), body: input.body.trim(), is_active: true };
    if (input.audience === "student") {
        return { ...base, student: Number(input.student), class_name: "" };
    }
    if (input.audience === "class") {
        return { ...base, student: null, class_name: input.class_name.trim() };
    }
    return { ...base, student: null, class_name: "" };
};

const STUDENT_PICKER_LIMIT = 40;

function StudentSearchPicker({
    students,
    value,
    onChange,
}: {
    students: MiniStudent[];
    value: string;
    onChange: (studentId: string) => void;
}) {
    const rootRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const sortedStudents = useMemo(
        () => [...students].sort((a, b) => a.full_name.localeCompare(b.full_name)),
        [students],
    );

    const selected = useMemo(
        () => sortedStudents.find((s) => String(s.id) === value) ?? null,
        [sortedStudents, value],
    );

    const dropdownStudents = useMemo(() => {
        const q = query.trim().toLowerCase();
        const pool = q
            ? sortedStudents.filter((s) => {
                  const name = (s.full_name || "").toLowerCase();
                  const cls = (s.class_name || "").toLowerCase();
                  return name.includes(q) || cls.includes(q);
              })
            : sortedStudents;
        return pool.slice(0, STUDENT_PICKER_LIMIT);
    }, [sortedStudents, query]);

    const hasMoreResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        const pool = q
            ? sortedStudents.filter((s) => {
                  const name = (s.full_name || "").toLowerCase();
                  const cls = (s.class_name || "").toLowerCase();
                  return name.includes(q) || cls.includes(q);
              })
            : sortedStudents;
        return pool.length > STUDENT_PICKER_LIMIT;
    }, [sortedStudents, query]);

    useEffect(() => {
        const onPointerDown = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, []);

    useEffect(() => {
        if (open) {
            searchRef.current?.focus();
        } else {
            setQuery("");
        }
    }, [open]);

    const toggleOpen = () => setOpen((prev) => !prev);

    const pickStudent = (studentId: string) => {
        onChange(studentId);
        setQuery("");
        setOpen(false);
    };

    const triggerLabel = selected
        ? `${selected.full_name}${selected.class_name ? ` (${selected.class_name})` : ""}`
        : "Select student";

    return (
        <div ref={rootRef} className="relative mt-1">
            <button
                type="button"
                onClick={toggleOpen}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-left text-sm focus:border-[#FF922B] focus:outline-none"
            >
                <span className={`min-w-0 truncate ${selected ? "text-[#1F2937]" : "text-[#6B7280]"}`}>
                    {triggerLabel}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[#6B7280] transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open ? (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
                    <div className="border-b border-[#E5E7EB] p-2">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                            <input
                                ref={searchRef}
                                type="search"
                                value={query}
                                placeholder="Search student name or class"
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full rounded-lg border border-[#E5E7EB] py-1.5 pl-8 pr-2 text-sm bg-white focus:border-[#FF922B] focus:outline-none"
                            />
                        </div>
                    </div>
                    <ul className="max-h-52 overflow-y-auto">
                        <li>
                            <button
                                type="button"
                                onClick={() => pickStudent("")}
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-[#FFF4CC] ${!value ? "bg-[#FFF4CC] font-medium text-[#1F2937]" : "text-[#6B7280]"}`}
                            >
                                Select student
                            </button>
                        </li>
                        {dropdownStudents.length === 0 ? (
                            <li className="px-3 py-2.5 text-xs text-[#6B7280]">No students match your search.</li>
                        ) : (
                            dropdownStudents.map((s) => {
                                const isSelected = String(s.id) === value;
                                return (
                                    <li key={s.id}>
                                        <button
                                            type="button"
                                            onClick={() => pickStudent(String(s.id))}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-[#FFF4CC] ${isSelected ? "bg-[#FFF4CC] font-medium text-[#1F2937]" : "text-[#1F2937]"}`}
                                        >
                                            {s.full_name}
                                            {s.class_name ? (
                                                <span className="text-[#6B7280]"> ({s.class_name})</span>
                                            ) : null}
                                        </button>
                                    </li>
                                );
                            })
                        )}
                        {hasMoreResults ? (
                            <li className="border-t border-[#E5E7EB] px-3 py-2 text-xs text-[#6B7280]">
                                Showing first {STUDENT_PICKER_LIMIT} — type to narrow search ({students.length} total).
                            </li>
                        ) : null}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}

const sendSuccessMessage = (audience: NotificationAudience, className: string, studentId: string, students: MiniStudent[]) => {
    if (audience === "student") {
        const name = students.find((s) => String(s.id) === studentId)?.full_name || "selected parent";
        return `Notification sent to ${name}.`;
    }
    if (audience === "class") {
        return `Notification sent to ${className || "selected class"} parents.`;
    }
    return "Notification sent to all parents.";
};

const announcementRowDate = (row: AnnouncementRow) => homeworkDate(row.published_at) || "—";

function AnnouncementsTab({
    authFetch,
    showToast,
    students,
}: {
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
    students: MiniStudent[];
}) {
    const [rows, setRows] = useState<AnnouncementRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [trackDate, setTrackDate] = useState(todayLocal);
    const [form, setForm] = useState({
        title: "",
        body: "",
        audience: "all" as NotificationAudience,
        class_name: NOTIFICATION_CLASS_OPTIONS[0]?.value || "",
        student: "",
    });
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [editModal, setEditModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [editSaving, setEditSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        title: "",
        body: "",
        audience: "all" as NotificationAudience,
        class_name: NOTIFICATION_CLASS_OPTIONS[0]?.value || "",
        student: "",
    });

    const load = useCallback(
        async (dateOverride?: string) => {
            const date = dateOverride ?? trackDate;
            setLoading(true);
            try {
                const params = new URLSearchParams({ published_date: date });
                const data = await authFetch<unknown>(`/students/franchise/announcements/?${params.toString()}`);
                setRows(normalizeList<AnnouncementRow>(data));
            } catch {
                setRows([]);
            } finally {
                setLoading(false);
            }
        },
        [authFetch, trackDate],
    );

    useEffect(() => {
        void load();
    }, [load]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            showToast("Title is required.", "error");
            return;
        }
        if (form.audience === "class" && !form.class_name.trim()) {
            showToast("Choose a class.", "error");
            return;
        }
        if (form.audience === "student" && !form.student) {
            showToast("Choose a student.", "error");
            return;
        }
        try {
            await authFetch("/students/franchise/announcements/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify(announcementPayload(form)),
            });
            setForm({
                title: "",
                body: "",
                audience: "all",
                class_name: NOTIFICATION_CLASS_OPTIONS[0]?.value || "",
                student: "",
            });
            const sentDate = todayLocal();
            setTrackDate(sentDate);
            showToast(sendSuccessMessage(form.audience, form.class_name, form.student, students), "success");
            await load(sentDate);
        } catch {
            showToast("Save failed", "error");
        }
    };

    const openEdit = async (row: AnnouncementRow) => {
        try {
            const detail = await authFetch<AnnouncementRow>(`/students/franchise/announcements/${row.id}/`);
            const audience = audienceFromRow(detail);
            setEditForm({
                title: detail.title || "",
                body: detail.body || "",
                audience,
                class_name: (detail.class_name || "").trim() || NOTIFICATION_CLASS_OPTIONS[0]?.value || "",
                student: detail.student ? String(detail.student) : "",
            });
            setEditModal({ isOpen: true, id: row.id });
        } catch {
            showToast("Could not load notification.", "error");
        }
    };

    const closeEdit = () => {
        setEditModal({ isOpen: false, id: null });
        setEditForm({
            title: "",
            body: "",
            audience: "all",
            class_name: NOTIFICATION_CLASS_OPTIONS[0]?.value || "",
            student: "",
        });
    };

    const saveEdit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editModal.id || !editForm.title.trim()) {
            showToast("Title is required.", "error");
            return;
        }
        if (editForm.audience === "class" && !editForm.class_name.trim()) {
            showToast("Choose a class.", "error");
            return;
        }
        if (editForm.audience === "student" && !editForm.student) {
            showToast("Choose a student.", "error");
            return;
        }
        setEditSaving(true);
        try {
            await authFetch(`/students/franchise/announcements/${editModal.id}/`, {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify(announcementPayload(editForm)),
            });
            closeEdit();
            showToast("Notification updated.", "success");
            await load();
        } catch {
            showToast("Update failed.", "error");
        } finally {
            setEditSaving(false);
        }
    };

    const remove = async (id: number) => {
        try {
            await authFetch(`/students/franchise/announcements/${id}/`, { method: "DELETE" });
            await load();
            showToast("Deleted successfully", "success");
        } catch {
            showToast("Delete failed", "error");
        }
    };

    return (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start max-w-5xl">
            <form onSubmit={submit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
                <div>
                    <h3 className="text-sm font-semibold text-[#111827]">Send manual notification</h3>
                    <p className="text-xs text-[#6B7280] mt-1">
                        Send a message to all parents, a class (e.g. Nursery), or one student&apos;s family. It appears in their Notifications tab and parents may receive email if enabled.
                    </p>
                </div>
                <label className="block text-xs font-semibold text-[#4B5563]">
                    Send to
                    <select
                        value={form.audience}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, audience: e.target.value as NotificationAudience }))
                        }
                        className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-white"
                    >
                        {NOTIFICATION_AUDIENCE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </label>
                {form.audience === "class" ? (
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Select class
                        <select
                            value={form.class_name}
                            onChange={(e) => setForm((p) => ({ ...p, class_name: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-white"
                        >
                            {NOTIFICATION_CLASS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </label>
                ) : null}
                {form.audience === "student" ? (
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Select student
                        <StudentSearchPicker
                            students={students}
                            value={form.student}
                            onChange={(studentId) => setForm((p) => ({ ...p, student: studentId }))}
                        />
                    </label>
                ) : null}
                <input
                    required
                    placeholder="Title — e.g. PTM reminder"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                />
                <textarea
                    placeholder="Message — your update for parents"
                    value={form.body}
                    onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                    rows={4}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                />
                <Button type="submit" className="bg-[#FF922B] text-white">
                    Send to parents
                </Button>
            </form>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4 lg:sticky lg:top-4 flex flex-col">
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[#111827]">Sent notifications</h3>
                    <p className="text-xs text-[#6B7280]">See which manual notifications were sent on the selected date.</p>
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
                        No notifications sent on {trackDate}. Change the track date or send one.
                    </p>
                ) : null}
                {!loading && rows.length > 0 ? (
                    <ul className="divide-y border rounded-xl max-h-[420px] overflow-y-auto">
                        {rows.map((r) => (
                            <li key={r.id} className="flex flex-nowrap items-center justify-between gap-3 px-4 py-3 text-sm">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium text-[#1F2937] truncate">{r.title}</p>
                                        <span className="shrink-0 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold text-[#4B5563]">
                                            {r.audience_label || "All parents"}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                                        {r.published_at ? new Date(r.published_at).toLocaleString() : announcementRowDate(r)}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(r)}
                                        className="whitespace-nowrap text-xs font-semibold text-[#2563EB] hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDelete({ isOpen: true, id: r.id })}
                                        className="whitespace-nowrap text-xs font-semibold text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>

            <Modal isOpen={editModal.isOpen} onClose={closeEdit} title="Edit notification">
                <form onSubmit={saveEdit} className="space-y-3">
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Send to
                        <select
                            value={editForm.audience}
                            onChange={(e) =>
                                setEditForm((p) => ({ ...p, audience: e.target.value as NotificationAudience }))
                            }
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-white"
                        >
                            {NOTIFICATION_AUDIENCE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    {editForm.audience === "class" ? (
                        <label className="block text-xs font-semibold text-[#4B5563]">
                            Select class
                            <select
                                value={editForm.class_name}
                                onChange={(e) => setEditForm((p) => ({ ...p, class_name: e.target.value }))}
                                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-white"
                            >
                                {NOTIFICATION_CLASS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ) : null}
                    {editForm.audience === "student" ? (
                        <label className="block text-xs font-semibold text-[#4B5563]">
                            Select student
                            <StudentSearchPicker
                                students={students}
                                value={editForm.student}
                                onChange={(studentId) => setEditForm((p) => ({ ...p, student: studentId }))}
                            />
                        </label>
                    ) : null}
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
                        Message
                        <textarea
                            value={editForm.body}
                            onChange={(e) => setEditForm((p) => ({ ...p, body: e.target.value }))}
                            rows={4}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={editSaving} className="bg-[#FF922B] text-white">
                            {editSaving ? "Saving…" : "Save changes"}
                        </Button>
                        <Button type="button" variant="secondary" onClick={closeEdit}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => confirmDelete.id && remove(confirmDelete.id)}
                title="Delete notification"
                description="Remove this message from all parent apps?"
                confirmText="Yes, Delete"
                variant="danger"
            />
        </div>
    );
}

function FeesTab({ authFetch, showToast, students }: { authFetch: AuthFetchFn; showToast: ShowToastFn; students: MiniStudent[] }) {
    const [form, setForm] = useState({
        student: "",
        fee_structure_name: "",
        id_card_no: "",
        course: "",
        title: "",
        amount: "",
        discount: "0",
        amount_paid: "0",
        due_date: "",
        status: "PENDING",
        paid_on: "",
        notes: "",
    });
    const [rows, setRows] = useState<
        { id: number; student_name?: string; title: string; amount: string | number; due_date: string; status: string; paid_on?: string | null }[]
    >([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const raw = await authFetch<unknown>("/students/franchise/fees/");
            const list = normalizeList<{
                id: number;
                student_name?: string;
                title: string;
                amount: string | number;
                due_date: string;
                status: string;
                paid_on?: string | null;
            }>(raw);
            setRows(list);
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.student) return;
        try {
            await authFetch("/students/franchise/fees/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    student: Number(form.student),
                    fee_structure_name: form.fee_structure_name.trim(),
                    id_card_no: form.id_card_no.trim(),
                    course: form.course.trim(),
                    title: form.title.trim(),
                    amount: form.amount,
                    discount: form.discount || "0",
                    amount_paid: form.amount_paid || "0",
                    due_date: form.due_date,
                    status: form.status,
                    paid_on: form.paid_on || null,
                    notes: form.notes,
                }),
            });
            showToast("Fee entry saved", "success");
            setForm({
                student: "",
                fee_structure_name: "",
                id_card_no: "",
                course: "",
                title: "",
                amount: "",
                discount: "0",
                amount_paid: "0",
                due_date: "",
                status: "PENDING",
                paid_on: "",
                notes: "",
            });
            await load();
        } catch {
            showToast("Save failed", "error");
        }
    };

    return (
        <div className="space-y-4 max-w-3xl">
            <form onSubmit={submit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 grid md:grid-cols-2 gap-3">
                <label className="text-xs font-semibold md:col-span-2">
                    Student
                    <select required value={form.student} onChange={(e) => setForm((p) => ({ ...p, student: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
                        <option value="">—</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.full_name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-semibold">
                    Fee structure name
                    <input value={form.fee_structure_name} onChange={(e) => setForm((p) => ({ ...p, fee_structure_name: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    ID card no
                    <input value={form.id_card_no} onChange={(e) => setForm((p) => ({ ...p, id_card_no: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold md:col-span-2">
                    Course
                    <input value={form.course} onChange={(e) => setForm((p) => ({ ...p, course: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    Title
                    <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    Amount
                    <input required type="number" step="0.01" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    Discount
                    <input type="number" step="0.01" value={form.discount} onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    Amount paid till date
                    <input type="number" step="0.01" value={form.amount_paid} onChange={(e) => setForm((p) => ({ ...p, amount_paid: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    Due date
                    <input type="date" required value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    Status
                    <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
                        {["PENDING", "PAID", "OVERDUE"].map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-semibold">
                    Paid on (optional)
                    <input type="date" value={form.paid_on} onChange={(e) => setForm((p) => ({ ...p, paid_on: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold md:col-span-2">
                    Notes
                    <input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <Button type="submit" className="bg-[#FF922B] text-white w-fit">
                    Save fee
                </Button>
            </form>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
                <p className="text-sm font-semibold text-[#111827] mb-3">Saved fee entries</p>
                {loading && <p className="text-sm text-[#6B7280]">Loading…</p>}
                {!loading && rows.length === 0 && <p className="text-sm text-[#6B7280]">No fee entries yet.</p>}
                <ul className="space-y-2">
                    {rows.map((r) => (
                        <li key={r.id} className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm">
                            <p className="font-medium text-[#111827]">{r.title}</p>
                            <p className="text-[#4B5563] text-xs">
                                {r.student_name || "Student"} • ₹{r.amount} • Due {r.due_date} • {r.status}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function TransportTab({
    authFetch,
    showToast,
}: {
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
}) {
    const emptyRouteForm = {
        route_name: "",
        driver_profile: "",
    };

    const [form, setForm] = useState(emptyRouteForm);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [rows, setRows] = useState<
        Array<{
            id: number;
            route_name: string;
            vehicle_number?: string;
            driver_name?: string;
            driver_token?: string;
            driver_info?: {
                full_name: string;
                email: string;
            };
            tracking_note?: string;
        }>
    >([]);
    const [editingRouteId, setEditingRouteId] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean;
        id: number | null;
    }>({
        isOpen: false,
        id: null,
    });

    const load = useCallback(async () => {
        try {
            const [routeData, driverData] = await Promise.all([
                authFetch<unknown>("/students/franchise/transport/"),
                authFetch<unknown>("/students/franchise/drivers/"),
            ]);
            setRows(normalizeList<any>(routeData));
            setDrivers(normalizeList<any>(driverData));
        } catch {
            setRows([]);
            setDrivers([]);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                route_name: form.route_name.trim(),
                driver_profile: form.driver_profile ? Number(form.driver_profile) : null,
            };

            if (editingRouteId) {
                await authFetch(`/students/franchise/transport/${editingRouteId}/`, {
                    method: "PATCH",
                    headers: jsonHeaders(),
                    body: JSON.stringify(payload),
                });
                showToast("Route updated successfully", "success");
            } else {
                await authFetch("/students/franchise/transport/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify(payload),
                });
                showToast("Route added successfully", "success");
            }

            setForm(emptyRouteForm);
            setEditingRouteId(null);
            await load();
        } catch {
            showToast("Save failed", "error");
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

    const startEditing = (route: any) => {
        setEditingRouteId(route.id);
        setForm({
            route_name: route.route_name || "",
            driver_profile: route.driver_profile?.id?.toString() || route.driver_profile?.toString() || "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="space-y-4 max-w-3xl">
            <form onSubmit={submit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3 max-w-md">
                <input
                    required
                    placeholder="Route name"
                    value={form.route_name}
                    onChange={(e) => setForm((p) => ({ ...p, route_name: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                />
                <select
                    value={form.driver_profile}
                    onChange={(e) => setForm((p) => ({ ...p, driver_profile: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
                >
                    <option value="">Assign driver account</option>
                    {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.user?.full_name || d.user?.email}
                        </option>
                    ))}
                </select>
                <div className="flex flex-wrap gap-2 pt-1">
                <Button type="submit" className="bg-[#FF922B] text-white w-fit">
                    {editingRouteId ? "Update route" : "Add route"}
                </Button>
                {editingRouteId && (
                    <Button 
                        type="button" 
                        onClick={() => {
                            setEditingRouteId(null);
                            setForm(emptyRouteForm);
                        }}
                        className="bg-gray-100 text-gray-700 w-fit"
                    >
                        Cancel
                    </Button>
                )}
                </div>
            </form>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#111827]">Driver links</p>
                    <button type="button" onClick={() => void load()} className="text-xs text-[#2563EB] underline">
                        Refresh
                    </button>
                </div>
                {rows.length === 0 && <p className="text-sm text-[#6B7280]">No routes added yet.</p>}
                <ul className="space-y-2">
                    {rows.map((r) => (
                            <li key={r.id} className="rounded-xl border border-[#E5E7EB] p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-[#111827]">{r.route_name}</p>
                                        <p className="text-xs text-[#4B5563]">
                                            {r.driver_info
                                                ? `Driver: ${r.driver_info.full_name} (${r.driver_info.email})`
                                                : "No driver assigned"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => startEditing(r)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit route"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDelete({ isOpen: true, id: r.id })}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete route"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                                {r.driver_token && (
                                    <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                        Route Authorized for Live Tracking
                                    </div>
                                )}
                            </li>
                    ))}
                </ul>
            </div>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => {
                    if (confirmDelete.id) void deleteRoute(confirmDelete.id);
                }}
                title="Delete route"
                description="Are you sure you want to delete this route?"
                confirmText="Yes, delete"
                variant="danger"
            />
        </div>
    );
}

"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { jsonHeaders } from "@/lib/api-client";

type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
type ShowToastFn = (message: string, variant?: "success" | "error") => void;

type MiniStudent = { id: number; full_name: string; class_name: string };
type FranchiseEventOption = { id: number; title: string; media?: FranchiseEventMedia[] };
type FranchiseEventMedia = { id: number; file?: string; media_type?: string; caption?: string };

const normalizeList = <T,>(data: unknown): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && Array.isArray((data as { results?: unknown[] }).results)) {
        return (data as { results: T[] }).results;
    }
    return [];
};

/** Same sections as the parent web app sidebar (franchise staff publish content here). */
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
    { id: "timetable", label: "Timetable" },
    { id: "transport", label: "Transport" },
    { id: "calendar", label: "Calendar" },
    { id: "showcase", label: "Showcase" },
    { id: "fees", label: "Fees" },
    { id: "holidays", label: "Holiday list" },
];

export default function ParentPortalAdminPage() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();
    const [tab, setTab] = useState<Tab>("homework");
    const [students, setStudents] = useState<MiniStudent[]>([]);

    const loadStudents = useCallback(async () => {
        try {
            const data = await authFetch<unknown>("/students/franchise/students/");
            setStudents(normalizeList<MiniStudent>(data));
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
                    Parent portal (content)
                </h1>
                <p className="text-sm text-[#374151] mt-1">
                    Publish content for the parent app (homework through holidays). <strong className="text-[#111827]">Support</strong> and{" "}
                    <strong className="text-[#111827]">Settings</strong> are for parents after they use the parent login — reply to tickets under{" "}
                    <Link href="/dashboard/franchise/parent-tickets" className="text-blue-600 underline font-medium">
                        Parent support tickets
                    </Link>
                    . Upload PDFs under{" "}
                    <Link href="/dashboard/franchise/parent-documents" className="text-blue-600 underline font-medium">
                        Parent documents
                    </Link>
                    .
                </p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-2">
                {TAB_CONFIG.map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setTab(id)}
                        className={`rounded-full px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${tab === id ? "bg-[#FFF4CC] text-[#111827]" : "text-[#6B7280] hover:bg-[#F3F4F6]"}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === "homework" && <HomeworkTab authFetch={authFetch} showToast={showToast} students={students} onRefresh={loadStudents} />}
            {tab === "notifications" && <AnnouncementsTab authFetch={authFetch} showToast={showToast} />}
            {tab === "timetable" && <DocsHintPanel variant="timetable" />}
            {tab === "transport" && <TransportTab authFetch={authFetch} showToast={showToast} />}
            {tab === "calendar" && <FranchiseCalendarTab authFetch={authFetch} />}
            {tab === "showcase" && <ShowcaseTab authFetch={authFetch} showToast={showToast} />}
            {tab === "fees" && <FeesTab authFetch={authFetch} showToast={showToast} students={students} />}
            {tab === "holidays" && <DocsHintPanel variant="holidays" />}
        </div>
    );
}

function DocsHintPanel({ variant }: { variant: "timetable" | "holidays" }) {
    const copy =
        variant === "timetable"
            ? {
                  title: "Timetable",
                  body: "Upload weekly timetable PDFs from Parent documents. They will appear for parents under Timetable.",
                  href: "/dashboard/franchise/parent-documents?category=CLASS_TIMETABLE",
              }
            : {
                  title: "Holiday list",
                  body: "Upload term breaks and public holiday PDFs from Parent documents. They will appear for parents under Holiday list.",
                  href: "/dashboard/franchise/parent-documents?category=HOLIDAY_LISTS",
              };
    return (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-3 max-w-2xl">
            <h3 className="font-semibold text-[#111827]">{copy.title}</h3>
            <p className="text-sm text-[#374151]">{copy.body}</p>
            <Link href={copy.href} className="inline-flex text-[#2563EB] font-medium underline">
                Open uploader
            </Link>
        </div>
    );
}

function ShowcaseTab({ authFetch, showToast }: { authFetch: AuthFetchFn; showToast: ShowToastFn }) {
    const [events, setEvents] = useState<FranchiseEventOption[]>([]);
    const [mediaRows, setMediaRows] = useState<Array<{ id: string; eventTitle: string; mediaType: string; caption: string; file?: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState<{ eventId: string; caption: string; file: File | null; mediaType: "IMAGE" | "VIDEO" }>({
        eventId: "",
        caption: "",
        file: null,
        mediaType: "IMAGE",
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const raw = await authFetch<unknown>("/events/franchise/");
            const list = normalizeList<FranchiseEventOption>(raw);
            setEvents(list);
            const flattened = list.flatMap((ev) =>
                (ev.media || []).map((m) => ({
                    id: `${ev.id}-${m.id}`,
                    eventTitle: ev.title,
                    mediaType: (m.media_type || "IMAGE").toUpperCase(),
                    caption: m.caption || "",
                    file: m.file,
                })),
            );
            setMediaRows(flattened);
        } catch {
            setEvents([]);
            setMediaRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.file) {
            showToast("Select file", "error");
            return;
        }
        setUploading(true);
        try {
            let targetEventId = form.eventId;
            if (!targetEventId) {
                const today = new Date().toISOString().slice(0, 10);
                const inferredTitle =
                    form.caption.trim() || form.file.name.replace(/\.[^/.]+$/, "") || "Showcase Upload";
                const createdEvent = await authFetch<{ id: number; title?: string }>("/events/franchise/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        title: inferredTitle,
                        description: "Auto-created from Showcase upload",
                        start_date: today,
                        end_date: today,
                        location: "Showcase",
                    }),
                });
                targetEventId = String(createdEvent.id);
            }

            const fd = new FormData();
            fd.append("file", form.file);
            fd.append("media_type", form.mediaType);
            if (form.caption.trim()) fd.append("caption", form.caption.trim());
            const saved = await authFetch<FranchiseEventMedia>(`/events/franchise/${targetEventId}/media/`, {
                method: "POST",
                body: fd,
            });
            const eventTitle = events.find((x) => String(x.id) === targetEventId)?.title || `Event #${targetEventId}`;
            setMediaRows((prev) => [
                {
                    id: `${targetEventId}-${saved.id}`,
                    eventTitle,
                    mediaType: (saved.media_type || "IMAGE").toUpperCase(),
                    caption: saved.caption || "",
                    file: saved.file,
                },
                ...prev,
            ]);
            setForm((prev) => ({ ...prev, eventId: targetEventId, caption: "", file: null }));
            showToast("Showcase media uploaded", "success");
            await load();
        } catch {
            showToast("Upload failed", "error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4 max-w-3xl">
            <form onSubmit={submit} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-3">
                <h3 className="font-semibold text-[#111827]">Showcase upload</h3>
                <p className="text-sm text-[#374151]">Upload event media here. Parents will see this in Showcase.</p>
                <label className="text-xs font-semibold text-[#4B5563] block">
                    Event (optional)
                    <select
                        value={form.eventId}
                        onChange={(e) => setForm((p) => ({ ...p, eventId: e.target.value }))}
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    >
                        <option value="">— Auto-create from this upload —</option>
                        {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                                {ev.title}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-semibold text-[#4B5563] block">
                    Upload type
                    <select
                        value={form.mediaType}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                mediaType: e.target.value === "VIDEO" ? "VIDEO" : "IMAGE",
                                file: null,
                            }))
                        }
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    >
                        <option value="IMAGE">Image upload</option>
                        <option value="VIDEO">Video upload</option>
                    </select>
                </label>
                <label className="text-xs font-semibold text-[#4B5563] block">
                    File (image/video)
                    <input
                        required
                        type="file"
                        accept={form.mediaType === "VIDEO" ? "video/*" : "image/*"}
                        onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    />
                </label>
                <label className="text-xs font-semibold text-[#4B5563] block">
                    Caption (optional)
                    <input
                        value={form.caption}
                        onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    />
                </label>
                <Button type="submit" className="bg-[#FF922B] text-white" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload to showcase"}
                </Button>
            </form>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#111827]">Uploaded showcase media</h3>
                    <button type="button" onClick={() => void load()} className="text-xs text-[#2563EB] underline">
                        Refresh
                    </button>
                </div>
                {loading && <p className="text-sm text-[#6B7280]">Loading…</p>}
                {!loading && mediaRows.length === 0 && <p className="text-sm text-[#6B7280]">No media uploaded yet.</p>}
                <ul className="space-y-2">
                    {mediaRows.map((m) => (
                        <li key={m.id} className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm">
                            <p className="font-medium text-[#111827]">{m.eventTitle}</p>
                            <p className="text-xs text-[#4B5563]">
                                {m.mediaType} {m.caption ? `• ${m.caption}` : ""}
                            </p>
                            {m.file ? (
                                <p className="text-[11px] text-[#6B7280] break-all mt-1">{m.file}</p>
                            ) : null}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/dashboard/franchise/gallery" className="text-[#2563EB] font-medium underline">
                    Centre gallery
                </Link>
                <Link href="/dashboard/franchise/hero-slider" className="text-[#2563EB] font-medium underline">
                    Home page photos
                </Link>
            </div>
        </div>
    );
}

function FranchiseCalendarTab({ authFetch }: { authFetch: AuthFetchFn }) {
    const [rows, setRows] = useState<{ id: number; title: string; start_date?: string; location?: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const raw = await authFetch<unknown>("/events/franchise/");
                const list = Array.isArray(raw) ? raw : (raw as { results?: unknown[] }).results ?? [];
                if (!cancelled) setRows(list as typeof rows);
            } catch {
                if (!cancelled) setRows([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [authFetch]);

    if (loading) return <p className="text-sm text-[#6B7280]">Loading events…</p>;

    return (
        <div className="space-y-2 max-w-2xl">
            <ul className="space-y-2">
                {rows.map((ev) => (
                    <li key={ev.id} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm">
                        <span className="font-medium">{ev.title}</span>
                        <span className="text-[#6B7280] ml-2">{ev.start_date || "—"}</span>
                        {ev.location ? <p className="text-xs text-[#6B7280] mt-1">{ev.location}</p> : null}
                    </li>
                ))}
            </ul>
            {rows.length === 0 && <p className="text-sm text-[#6B7280]">No events yet. Add them under Events.</p>}
            <p className="text-xs text-[#6B7280] pt-2">
                <Link href="/dashboard/franchise/events" className="text-[#2563EB] underline font-medium">
                    Manage events
                </Link>
            </p>
        </div>
    );
}

function HomeworkTab({
    authFetch,
    showToast,
    students,
    onRefresh,
}: {
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
    students: MiniStudent[];
    onRefresh: () => void;
}) {
    const [rows, setRows] = useState<{ id: number; title: string; assigned_date: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ studentId: "", class_name: "", assigned_date: "", title: "", description: "" });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authFetch<unknown>("/students/franchise/homework/");
            setRows(normalizeList<{ id: number; title: string; assigned_date: string }>(data));
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
        try {
            const selectedStudent = students.find((s) => String(s.id) === form.studentId);
            const normalizedClassName = form.class_name.trim() || selectedStudent?.class_name?.trim() || "";

            const body: Record<string, unknown> = {
                title: form.title.trim(),
                description: form.description.trim(),
                assigned_date: form.assigned_date,
                class_name: normalizedClassName,
            };
            body.student = form.studentId ? Number(form.studentId) : null;
            await authFetch("/students/franchise/homework/", { method: "POST", headers: jsonHeaders(), body: JSON.stringify(body) });
            setForm({ studentId: "", class_name: "", assigned_date: "", title: "", description: "" });
            showToast("Homework published", "success");
            await load();
            onRefresh();
        } catch {
            showToast("Save failed", "error");
        }
    };

    const remove = async (id: number) => {
        if (!confirm("Delete this homework?")) return;
        try {
            await authFetch(`/students/franchise/homework/${id}/`, { method: "DELETE" });
            showToast("Deleted", "success");
            await load();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={submit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 grid md:grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-[#4B5563] md:col-span-2">
                    Title
                    <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold text-[#4B5563]">
                    Date
                    <input type="date" required value={form.assigned_date} onChange={(e) => setForm((p) => ({ ...p, assigned_date: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold text-[#4B5563]">
                    Student (optional)
                    <select value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
                        <option value="">— All students (centre-wide) —</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.full_name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-semibold text-[#4B5563] md:col-span-2">
                    Class name (optional, exact match e.g. KG-2 Section A)
                    <input value={form.class_name} onChange={(e) => setForm((p) => ({ ...p, class_name: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" placeholder="Leave empty to send for all students in this centre" />
                </label>
                <label className="text-xs font-semibold text-[#4B5563] md:col-span-2">
                    Description
                    <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <Button type="submit" className="md:col-span-2 bg-[#FF922B] text-white w-fit">
                    Add homework
                </Button>
            </form>
            {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : null}
            <ul className="divide-y border rounded-2xl bg-white">
                {rows.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
                        <span>
                            <span className="font-medium">{r.title}</span>{" "}
                            <span className="text-[#6B7280]">({r.assigned_date})</span>
                        </span>
                        <button type="button" className="text-red-600 text-xs font-semibold" onClick={() => void remove(r.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function AnnouncementsTab({ authFetch, showToast }: { authFetch: AuthFetchFn; showToast: ShowToastFn }) {
    const [rows, setRows] = useState<{ id: number; title: string; published_at?: string }[]>([]);
    const [form, setForm] = useState({ title: "", body: "" });

    const load = useCallback(async () => {
        try {
            const data = await authFetch<unknown>("/students/franchise/announcements/");
            setRows(normalizeList<{ id: number; title: string; published_at?: string }>(data));
        } catch {
            setRows([]);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await authFetch("/students/franchise/announcements/", { method: "POST", headers: jsonHeaders(), body: JSON.stringify({ title: form.title.trim(), body: form.body.trim(), is_active: true }) });
            setForm({ title: "", body: "" });
            showToast("Announcement published", "success");
            await load();
        } catch {
            showToast("Save failed", "error");
        }
    };

    const remove = async (id: number) => {
        if (!confirm("Delete announcement?")) return;
        try {
            await authFetch(`/students/franchise/announcements/${id}/`, { method: "DELETE" });
            await load();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={submit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
                <input required placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />
                <textarea placeholder="Message" value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} rows={4} className="w-full rounded-xl border px-3 py-2 text-sm" />
                <Button type="submit" className="bg-[#FF922B] text-white">
                    Publish
                </Button>
            </form>
            <ul className="divide-y border rounded-2xl bg-white">
                {rows.map((r) => (
                    <li key={r.id} className="flex justify-between gap-2 px-4 py-3 text-sm">
                        <span className="font-medium">{r.title}</span>
                        <button type="button" className="text-red-600 text-xs" onClick={() => void remove(r.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
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

function TransportTab({ authFetch, showToast }: { authFetch: AuthFetchFn; showToast: ShowToastFn }) {
    const [form, setForm] = useState({ route_name: "", description: "", map_url: "", tracking_note: "", sort_order: "0" });

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await authFetch("/students/franchise/transport/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    route_name: form.route_name.trim(),
                    description: form.description,
                    map_url: form.map_url,
                    tracking_note: form.tracking_note,
                    sort_order: Number(form.sort_order) || 0,
                }),
            });
            showToast("Route saved", "success");
            setForm({ route_name: "", description: "", map_url: "", tracking_note: "", sort_order: "0" });
        } catch {
            showToast("Save failed", "error");
        }
    };

    return (
        <form onSubmit={submit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3 max-w-xl">
            <input required placeholder="Route name" value={form.route_name} onChange={(e) => setForm((p) => ({ ...p, route_name: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full rounded-xl border px-3 py-2 text-sm" />
            <input placeholder="Map URL (Google Maps)" value={form.map_url} onChange={(e) => setForm((p) => ({ ...p, map_url: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />
            <input placeholder="Tracking note (e.g. call transport desk)" value={form.tracking_note} onChange={(e) => setForm((p) => ({ ...p, tracking_note: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />
            <input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />
            <Button type="submit" className="bg-[#FF922B] text-white">
                Add route
            </Button>
        </form>
    );
}

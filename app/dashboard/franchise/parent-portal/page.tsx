"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { jsonHeaders } from "@/lib/api-client";
import ConfirmModal from "@/components/ui/ConfirmModal";
import dynamic from "next/dynamic";

/** Existing franchise pages — embedded here instead of separate sidebar links. */
const FranchiseAttendancePanel = dynamic(() => import("../attendance/page"), { ssr: false });
const FranchiseEventsPanel = dynamic(() => import("../events/page"), { ssr: false });
type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
type ShowToastFn = (message: string, variant?: "success" | "error") => void;

type MiniStudent = { id: number; full_name: string; class_name: string };
const normalizeList = <T,>(data: unknown): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && Array.isArray((data as { results?: unknown[] }).results)) {
        return (data as { results: T[] }).results;
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
    { id: "timetable", label: "Timetable" },
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
                    Parent App
                </h1>
                <p className="text-sm text-[#374151] mt-1">
                    Everything parents see in the parent app is managed here (same order as the parent login menu). Timetable and holiday PDFs are uploaded by head office.
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
            {tab === "notifications" && <AnnouncementsTab authFetch={authFetch} showToast={showToast} />}
            {tab === "timetable" && <DocsHintPanel variant="timetable" />}
            {tab === "transport" && <TransportTab authFetch={authFetch} showToast={showToast} />}
            {tab === "calendar" && <FranchiseAttendancePanel />}
            {tab === "showcase" && <FranchiseEventsPanel />}
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
                  body: "Weekly timetable PDFs for parents are uploaded and maintained by head office.",
              }
            : {
                  title: "Holiday list",
                  body: "Holiday PDFs for parents are uploaded and maintained by head office.",
              };
    return (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-3 max-w-2xl">
            <h3 className="font-semibold text-[#111827]">{copy.title}</h3>
            <p className="text-sm text-[#374151]">{copy.body}</p>
        </div>
    );
}

function HomeworkTab({
    authFetch,
    showToast,
    onRefresh,
}: {
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
    onRefresh: () => void;
}) {
    const [rows, setRows] = useState<{
        id: number;
        title: string;
        assigned_date: string;
        attachment?: string | null;
        attachment_name?: string;
        attachment_kind?: string;
        read_count?: number;
        viewed_by_parents?: any[];
    }[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        class_name: "",
        assigned_date: "",
        title: "",
        description: "",
        attachment: null as File | null,
    });
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authFetch<unknown>("/students/franchise/homework/");
            setRows(
                normalizeList<{
                    id: number;
                    title: string;
                    assigned_date: string;
                    attachment?: string | null;
                    attachment_name?: string;
                    attachment_kind?: string;
                    read_count?: number;
                    viewed_by_parents?: any[];
                }>(data),
            );
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

            setForm({ class_name: "", assigned_date: "", title: "", description: "", attachment: null });
            showToast("Homework published", "success");
            await load();
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
                <label className="text-xs font-semibold text-[#4B5563] md:col-span-2">
                    Class name (optional, exact match e.g. KG-2 Section A)
                    <input value={form.class_name} onChange={(e) => setForm((p) => ({ ...p, class_name: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" placeholder="Leave empty to send for all students in this centre" />
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
            {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : null}
            <ul className="divide-y border rounded-2xl bg-white">
                {rows.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                            <span>
                                <span className="font-medium">{r.title}</span>{" "}
                                <span className="text-[#6B7280]">({r.assigned_date})</span>
                            </span>
                        </div>
                        <button type="button" className="text-red-600 text-xs font-semibold" onClick={() => setConfirmDelete({ isOpen: true, id: r.id })}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

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

function AnnouncementsTab({ authFetch, showToast }: { authFetch: AuthFetchFn; showToast: ShowToastFn }) {
    const [rows, setRows] = useState<{ id: number; title: string; published_at?: string }[]>([]);
    const [form, setForm] = useState({ title: "", body: "" });
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

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
        try {
            await authFetch(`/students/franchise/announcements/${id}/`, { method: "DELETE" });
            await load();
            showToast("Deleted successfully", "success");
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
                        <button type="button" className="text-red-600 text-xs" onClick={() => setConfirmDelete({ isOpen: true, id: r.id })}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => confirmDelete.id && remove(confirmDelete.id)}
                title="Delete Announcement"
                description="Are you sure you want to delete this announcement? It will be removed from all parent apps."
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

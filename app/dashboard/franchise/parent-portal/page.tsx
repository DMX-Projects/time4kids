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

type Tab = "homework" | "announcements" | "attendance" | "fees" | "transport" | "tickets";

export default function ParentPortalAdminPage() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();
    const [tab, setTab] = useState<Tab>("homework");
    const [students, setStudents] = useState<MiniStudent[]>([]);

    const loadStudents = useCallback(async () => {
        try {
            const data = await authFetch<MiniStudent[]>("/students/franchise/students/");
            setStudents(Array.isArray(data) ? data : []);
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
                    Publish homework, announcements, attendance, fees, transport, and reply to support tickets. Upload policy / timetable / holiday PDFs from{" "}
                    <Link href="/dashboard/franchise/parent-documents" className="text-blue-600 underline font-medium">
                        Parent documents
                    </Link>
                    .
                </p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-2">
                {(
                    [
                        ["homework", "Homework"],
                        ["announcements", "Notifications"],
                        ["attendance", "Attendance"],
                        ["fees", "Fees"],
                        ["transport", "Transport"],
                        ["tickets", "Support tickets"],
                    ] as const
                ).map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setTab(id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === id ? "bg-[#FFF4CC] text-[#111827]" : "text-[#6B7280] hover:bg-[#F3F4F6]"}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === "homework" && <HomeworkTab authFetch={authFetch} showToast={showToast} students={students} onRefresh={loadStudents} />}
            {tab === "announcements" && <AnnouncementsTab authFetch={authFetch} showToast={showToast} />}
            {tab === "attendance" && <AttendanceTab authFetch={authFetch} showToast={showToast} students={students} />}
            {tab === "fees" && <FeesTab authFetch={authFetch} showToast={showToast} students={students} />}
            {tab === "transport" && <TransportTab authFetch={authFetch} showToast={showToast} />}
            {tab === "tickets" && <TicketsTab authFetch={authFetch} showToast={showToast} />}
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
            const data = await authFetch<{ id: number; title: string; assigned_date: string }[]>("/students/franchise/homework/");
            setRows(Array.isArray(data) ? data : []);
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
            const body: Record<string, unknown> = {
                title: form.title.trim(),
                description: form.description.trim(),
                assigned_date: form.assigned_date,
                class_name: form.class_name.trim(),
            };
            if (form.studentId) body.student = Number(form.studentId);
            else body.student = null;
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
                        <option value="">— Whole class / use class name —</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.full_name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-semibold text-[#4B5563] md:col-span-2">
                    Class name (optional, exact match e.g. KG-2 Section A)
                    <input value={form.class_name} onChange={(e) => setForm((p) => ({ ...p, class_name: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" placeholder="Leave empty for whole centre if no student selected" />
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
            const data = await authFetch<{ id: number; title: string; published_at?: string }[]>("/students/franchise/announcements/");
            setRows(Array.isArray(data) ? data : []);
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

function AttendanceTab({ authFetch, showToast, students }: { authFetch: AuthFetchFn; showToast: ShowToastFn; students: MiniStudent[] }) {
    const [form, setForm] = useState({ student: "", date: "", status: "PRESENT", note: "" });

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.student) return;
        try {
            await authFetch("/students/franchise/attendance/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ student: Number(form.student), date: form.date, status: form.status, note: form.note }),
            });
            showToast("Attendance saved", "success");
            setForm((p) => ({ ...p, note: "" }));
        } catch {
            showToast("Save failed (duplicate date / invalid student?)", "error");
        }
    };

    return (
        <form onSubmit={submit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 grid md:grid-cols-2 gap-3 max-w-2xl">
            <label className="text-xs font-semibold">
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
                Date
                <input type="date" required value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
            </label>
            <label className="text-xs font-semibold">
                Status
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
                    {["PRESENT", "ABSENT", "LATE", "EXCUSED", "HOLIDAY"].map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </label>
            <label className="text-xs font-semibold md:col-span-2">
                Note
                <input value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
            </label>
            <Button type="submit" className="bg-[#FF922B] text-white w-fit">
                Save
            </Button>
        </form>
    );
}

function FeesTab({ authFetch, showToast, students }: { authFetch: AuthFetchFn; showToast: ShowToastFn; students: MiniStudent[] }) {
    const [form, setForm] = useState({ student: "", title: "", amount: "", due_date: "", status: "PENDING", paid_on: "", notes: "" });

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.student) return;
        try {
            await authFetch("/students/franchise/fees/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    student: Number(form.student),
                    title: form.title.trim(),
                    amount: form.amount,
                    due_date: form.due_date,
                    status: form.status,
                    paid_on: form.paid_on || null,
                    notes: form.notes,
                }),
            });
            showToast("Fee entry saved", "success");
        } catch {
            showToast("Save failed", "error");
        }
    };

    return (
        <form onSubmit={submit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 grid md:grid-cols-2 gap-3 max-w-2xl">
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
                Title
                <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
            </label>
            <label className="text-xs font-semibold">
                Amount
                <input required type="number" step="0.01" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
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

function TicketsTab({ authFetch, showToast }: { authFetch: AuthFetchFn; showToast: ShowToastFn }) {
    const [rows, setRows] = useState<{ id: number; subject: string; body: string; status: string; parent_name?: string; franchise_reply?: string }[]>([]);
    const [editing, setEditing] = useState<Record<number, { reply: string; status: string }>>({});

    const load = useCallback(async () => {
        try {
            const data = await authFetch<typeof rows>("/students/franchise/tickets/");
            setRows(Array.isArray(data) ? data : []);
        } catch {
            setRows([]);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    const save = async (id: number) => {
        const e = editing[id];
        if (!e) return;
        try {
            await authFetch(`/students/franchise/tickets/${id}/`, {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify({ franchise_reply: e.reply, status: e.status }),
            });
            showToast("Reply saved", "success");
            setEditing((prev) => {
                const n = { ...prev };
                delete n[id];
                return n;
            });
            await load();
        } catch {
            showToast("Update failed", "error");
        }
    };

    return (
        <ul className="space-y-4">
            {rows.map((t) => (
                <li key={t.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-2">
                    <div className="flex justify-between gap-2 text-sm">
                        <span className="font-semibold">{t.subject}</span>
                        <span className="text-[#6B7280]">{t.parent_name}</span>
                    </div>
                    <p className="text-sm text-[#374151] whitespace-pre-wrap">{t.body}</p>
                    <p className="text-xs text-[#6B7280]">Status: {t.status}</p>
                    {t.franchise_reply && <p className="text-sm bg-orange-50 rounded-lg p-2">Reply: {t.franchise_reply}</p>}
                    <div className="flex flex-col gap-2 pt-2 border-t">
                        <select
                            value={editing[t.id]?.status ?? t.status}
                            onChange={(e) => setEditing((p) => ({ ...p, [t.id]: { reply: p[t.id]?.reply ?? t.franchise_reply ?? "", status: e.target.value } }))}
                            className="rounded-lg border px-2 py-1 text-sm w-fit"
                        >
                            {["OPEN", "IN_PROGRESS", "CLOSED"].map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                        <textarea
                            placeholder="Reply to parent"
                            value={editing[t.id]?.reply ?? ""}
                            onChange={(e) => setEditing((p) => ({ ...p, [t.id]: { status: p[t.id]?.status ?? t.status, reply: e.target.value } }))}
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                            rows={2}
                        />
                        <Button type="button" size="sm" className="w-fit bg-[#FF922B] text-white" onClick={() => void save(t.id)}>
                            Save reply / status
                        </Button>
                    </div>
                </li>
            ))}
            {rows.length === 0 && <p className="text-sm text-[#6B7280]">No open tickets.</p>}
        </ul>
    );
}

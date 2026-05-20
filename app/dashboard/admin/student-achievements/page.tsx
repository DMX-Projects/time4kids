"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import { jsonHeaders } from "@/lib/api-client";

type MiniStudent = { id: number; full_name: string; class_name: string; roll_number: string };

type AchievementRow = {
    id: number;
    franchise: number;
    franchise_name?: string;
    student: number | null;
    student_name?: string;
    title: string;
    notes?: string;
    achieved_date?: string | null;
    created_at?: string;
};

const emptyForm = {
    franchiseId: "",
    studentId: "",
    title: "",
    notes: "",
    achieved_date: "",
};

export default function AdminStudentAchievementsPage() {
    const { authFetch } = useAuth();
    const { franchises } = useAdminData();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rows, setRows] = useState<AchievementRow[]>([]);
    const [students, setStudents] = useState<MiniStudent[]>([]);
    const [centreFilter, setCentreFilter] = useState("");
    const [form, setForm] = useState(emptyForm);

    const loadAchievements = useCallback(async () => {
        setLoading(true);
        try {
            const q = centreFilter ? `?franchise=${encodeURIComponent(centreFilter)}` : "";
            const data = await authFetch<AchievementRow[]>(`/students/admin/achievements/${q}`);
            setRows(Array.isArray(data) ? data : []);
        } catch {
            showToast("Unable to load achievements", "error");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, centreFilter, showToast]);

    useEffect(() => {
        void loadAchievements();
    }, [loadAchievements]);

    useEffect(() => {
        const franchiseId = form.franchiseId;
        if (!franchiseId) {
            setStudents([]);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const data = await authFetch<MiniStudent[]>(
                    `/students/admin/students/mini/?franchise=${encodeURIComponent(franchiseId)}`,
                );
                if (!cancelled) setStudents(Array.isArray(data) ? data : []);
            } catch {
                if (!cancelled) setStudents([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [authFetch, form.franchiseId]);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.franchiseId) {
            showToast("Select a centre", "error");
            return;
        }
        if (!form.title.trim()) {
            showToast("Title is required", "error");
            return;
        }
        setSubmitting(true);
        try {
            const body: Record<string, unknown> = {
                franchise: Number(form.franchiseId),
                title: form.title.trim(),
                notes: form.notes.trim(),
                achieved_date: form.achieved_date || null,
                student: form.studentId ? Number(form.studentId) : null,
            };
            await authFetch("/students/admin/achievements/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify(body),
            });
            setForm(emptyForm);
            showToast("Achievement published to parents", "success");
            await loadAchievements();
        } catch {
            showToast("Could not save achievement", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const onDelete = async (id: number) => {
        if (!confirm("Remove this achievement from the Parent App?")) return;
        try {
            await authFetch(`/students/admin/achievements/${id}/`, { method: "DELETE" });
            showToast("Deleted", "success");
            await loadAchievements();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                    <Star className="w-7 h-7 text-amber-500" />
                    Student achievements
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                    Publish milestones to the parent app for a centre. Leave student empty for a centre-wide announcement.
                </p>
            </div>

            <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                    <label className="text-xs font-semibold text-slate-600">
                        Centre
                        <select
                            value={form.franchiseId}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, franchiseId: e.target.value, studentId: "" }))
                            }
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            required
                        >
                            <option value="">Select centre</option>
                            {franchises.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                    {f.city ? ` · ${f.city}` : ""}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-600">
                        Student (optional)
                        <select
                            value={form.studentId}
                            onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            disabled={!form.franchiseId}
                        >
                            <option value="">All families at this centre</option>
                            {students.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.full_name}
                                    {s.class_name ? ` · ${s.class_name}` : ""}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-600">
                        Date (optional)
                        <input
                            type="date"
                            value={form.achieved_date}
                            onChange={(e) => setForm((p) => ({ ...p, achieved_date: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="text-xs font-semibold text-slate-600 md:col-span-2">
                        Title
                        <input
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Star reader of the month"
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            required
                        />
                    </label>
                    <label className="text-xs font-semibold text-slate-600 md:col-span-2">
                        Notes
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                            rows={3}
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        />
                    </label>
                </div>
                <Button type="submit" disabled={submitting || loading}>
                    {submitting ? "Publishing…" : "Publish"}
                </Button>
            </form>

            <div className="flex flex-wrap items-end gap-3">
                <label className="text-xs font-semibold text-slate-600">
                    Filter by centre
                    <select
                        value={centreFilter}
                        onChange={(e) => setCentreFilter(e.target.value)}
                        className="mt-1 block min-w-[220px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    >
                        <option value="">All centres</option>
                        {franchises.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                                {f.city ? ` · ${f.city}` : ""}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 font-semibold text-slate-900">Published</div>
                {loading ? (
                    <p className="p-4 text-sm text-slate-500">Loading…</p>
                ) : rows.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500">No achievements yet.</p>
                ) : (
                    <ul className="divide-y divide-slate-200">
                        {rows.map((r) => (
                            <li key={r.id} className="px-4 py-3 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-medium text-slate-900">{r.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {r.franchise_name || `Centre #${r.franchise}`}
                                        {" · "}
                                        {r.student == null ? "All families" : r.student_name || `Student #${r.student}`}
                                        {r.achieved_date ? ` · ${r.achieved_date}` : ""}
                                    </p>
                                    {r.notes && <p className="text-sm text-slate-600 mt-2">{r.notes}</p>}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onDelete(r.id)}
                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 shrink-0"
                                    aria-label="Delete achievement"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

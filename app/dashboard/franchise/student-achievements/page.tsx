"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { jsonHeaders } from "@/lib/api-client";

type MiniStudent = { id: number; full_name: string; class_name: string; roll_number: string };

type AchievementRow = {
    id: number;
    student: number | null;
    student_name?: string;
    title: string;
    notes?: string;
    achieved_date?: string | null;
    created_at?: string;
};

export default function FranchiseStudentAchievementsPage() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<MiniStudent[]>([]);
    const [rows, setRows] = useState<AchievementRow[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        studentId: "" as string,
        title: "",
        notes: "",
        achieved_date: "",
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [sData, aData] = await Promise.all([
                authFetch<MiniStudent[]>("/students/franchise/students/"),
                authFetch<AchievementRow[]>("/students/franchise/achievements/"),
            ]);
            setStudents(Array.isArray(sData) ? sData : []);
            setRows(Array.isArray(aData) ? aData : []);
        } catch {
            showToast("Unable to load achievements", "error");
            setStudents([]);
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, showToast]);

    useEffect(() => {
        load();
    }, [load]);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            showToast("Title is required", "error");
            return;
        }
        setSubmitting(true);
        try {
            const body: Record<string, unknown> = {
                title: form.title.trim(),
                notes: form.notes.trim(),
                achieved_date: form.achieved_date || null,
            };
            if (form.studentId) {
                body.student = Number(form.studentId);
            } else {
                body.student = null;
            }
            await authFetch("/students/franchise/achievements/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify(body),
            });
            setForm({ studentId: "", title: "", notes: "", achieved_date: "" });
            showToast("Achievement published to parents", "success");
            await load();
        } catch {
            showToast("Could not save achievement", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const onDelete = async (id: number) => {
        if (!confirm("Remove this achievement from the parent portal?")) return;
        try {
            await authFetch(`/students/franchise/achievements/${id}/`, { method: "DELETE" });
            showToast("Deleted", "success");
            await load();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
                    <Star className="w-7 h-7 text-amber-500" />
                    Student achievements
                </h1>
                <p className="text-sm text-[#374151] mt-1">
                    Share milestones with parents. Leave “Student” empty to post a centre-wide celebration visible to every family.
                </p>
            </div>

            <form onSubmit={onSubmit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                    <label className="text-xs font-semibold text-[#4B5563]">
                        Student (optional)
                        <select
                            value={form.studentId}
                            onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
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
                    <label className="text-xs font-semibold text-[#4B5563]">
                        Date (optional)
                        <input
                            type="date"
                            value={form.achieved_date}
                            onChange={(e) => setForm((p) => ({ ...p, achieved_date: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="text-xs font-semibold text-[#4B5563] md:col-span-2">
                        Title
                        <input
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Star reader of the month"
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                            required
                        />
                    </label>
                    <label className="text-xs font-semibold text-[#4B5563] md:col-span-2">
                        Notes
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                            rows={3}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                </div>
                <Button type="submit" disabled={submitting || loading} className="bg-[#FF922B] hover:brightness-105 text-white">
                    {submitting ? "Publishing…" : "Publish"}
                </Button>
            </form>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E5E7EB] font-semibold text-[#111827]">Published</div>
                {loading ? (
                    <p className="p-4 text-sm text-[#6B7280]">Loading…</p>
                ) : rows.length === 0 ? (
                    <p className="p-4 text-sm text-[#6B7280]">No achievements yet.</p>
                ) : (
                    <ul className="divide-y divide-[#E5E7EB]">
                        {rows.map((r) => (
                            <li key={r.id} className="px-4 py-3 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-medium text-[#111827]">{r.title}</p>
                                    <p className="text-xs text-[#6B7280] mt-0.5">
                                        {r.student == null ? "All families" : r.student_name || `Student #${r.student}`}
                                        {r.achieved_date ? ` · ${r.achieved_date}` : ""}
                                    </p>
                                    {r.notes && <p className="text-sm text-[#374151] mt-2">{r.notes}</p>}
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

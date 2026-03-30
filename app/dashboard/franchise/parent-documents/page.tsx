"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { mediaUrl } from "@/lib/api-client";

type ParentDoc = {
    id: number;
    category: string;
    category_display: string;
    title: string;
    display_title?: string;
    file: string;
    state?: string | null;
    academic_year?: string;
    created_at: string;
};

const categories = [
    { value: "PRESCHOOL_POLICIES", label: "Preschool Policies (PDF)" },
    { value: "CLASS_TIMETABLE", label: "Class Timetable (PDF)" },
    { value: "HOLIDAY_LISTS", label: "Holiday Lists" },
    { value: "AUDIO_RHYMES", label: "Audio Rhymes" },
    { value: "VIDEOS", label: "Watch • Hear • Learn" },
    { value: "NEWSLETTERS", label: "Newsletters" },
    { value: "STUDENTS_KIT", label: "Students Kit" },
    { value: "PARENTING_TIPS", label: "Parenting Tips & Articles" },
];

const states = [
    "AP", "AR", "AS", "BR", "CG", "GA", "GJ", "HR", "HP", "JH", "KA", "KL", "MP", "MH", "MN",
    "ML", "MZ", "NL", "OD", "PB", "RJ", "SK", "TN", "TS", "TR", "UP", "UK", "WB",
];

export default function FranchiseParentDocumentsPage() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [docs, setDocs] = useState<ParentDoc[]>([]);
    const [form, setForm] = useState({
        category: "NEWSLETTERS",
        title: "",
        description: "",
        academic_year: "",
        state: "",
    });
    const [file, setFile] = useState<File | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const data = await authFetch<ParentDoc[]>("/documents/franchise/parent-documents/");
            setDocs(Array.isArray(data) ? data : []);
        } catch {
            showToast("Unable to load parent documents", "error");
            setDocs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const grouped = useMemo(() => {
        const map = new Map<string, ParentDoc[]>();
        for (const d of docs) {
            const k = d.category_display || d.category;
            map.set(k, [...(map.get(k) || []), d]);
        }
        return Array.from(map.entries());
    }, [docs]);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) {
            showToast("Select a file to upload", "error");
            return;
        }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("category", form.category);
            fd.append("title", form.title || file.name);
            fd.append("description", form.description);
            fd.append("file", file);
            if (form.academic_year) fd.append("academic_year", form.academic_year);
            if (form.category === "HOLIDAY_LISTS" && form.state) fd.append("state", form.state);
            await authFetch("/documents/franchise/parent-documents/", { method: "POST", body: fd });
            setForm({ category: "NEWSLETTERS", title: "", description: "", academic_year: "", state: "" });
            setFile(null);
            showToast("Document uploaded", "success");
            await load();
        } catch {
            showToast("Upload failed", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const onDelete = async (id: number) => {
        try {
            await authFetch(`/documents/franchise/parent-documents/${id}/`, { method: "DELETE" });
            showToast("Deleted document", "success");
            await load();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-[#111827]">Parent Documents</h1>
                <p className="text-sm text-[#374151]">Upload documents that parents will see in Parent Important Documents.</p>
            </div>

            <form onSubmit={onSubmit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                    <label className="text-xs font-semibold text-[#4B5563]">
                        Category
                        <select
                            value={form.category}
                            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        >
                            {categories.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs font-semibold text-[#4B5563]">
                        Title
                        <input
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            placeholder="Optional (defaults to file name)"
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="text-xs font-semibold text-[#4B5563]">
                        Academic Year
                        <input
                            value={form.academic_year}
                            onChange={(e) => setForm((p) => ({ ...p, academic_year: e.target.value }))}
                            placeholder="AY 2025-26"
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="text-xs font-semibold text-[#4B5563]">
                        State (Holiday lists only)
                        <select
                            value={form.state}
                            onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        >
                            <option value="">Select state</option>
                            {states.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </label>
                </div>
                <label className="text-xs font-semibold text-[#4B5563] block">
                    Description
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        rows={2}
                        className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                    />
                </label>
                <label className="text-xs font-semibold text-[#4B5563] block">
                    File
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        required
                    />
                </label>
                <Button type="submit" className="bg-[#FF922B] hover:brightness-105" disabled={submitting}>
                    <Upload className="w-4 h-4 mr-2" />
                    {submitting ? "Uploading..." : "Upload for Parents"}
                </Button>
            </form>

            <div className="space-y-4">
                {loading && <p className="text-sm text-[#4B5563]">Loading documents...</p>}
                {!loading && grouped.length === 0 && <p className="text-sm text-[#4B5563]">No documents uploaded yet.</p>}
                {grouped.map(([name, items]) => (
                    <section key={name} className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
                        <h2 className="text-sm font-semibold text-[#1F2937] mb-3">{name}</h2>
                        <div className="space-y-2">
                            {items.map((d) => (
                                <div key={d.id} className="flex items-center justify-between gap-3 border border-[#F3F4F6] rounded-xl px-3 py-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-[#1F2937] truncate">{d.display_title || d.title}</p>
                                        <p className="text-xs text-[#6B7280]">{new Date(d.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a href={mediaUrl(d.file)} target="_blank" rel="noreferrer" className="text-[#2563EB] text-xs font-semibold inline-flex items-center gap-1">
                                            <Download className="w-3.5 h-3.5" />
                                            Open
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(d.id)}
                                            className="text-red-600 text-xs font-semibold inline-flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}


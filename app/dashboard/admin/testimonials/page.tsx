"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { MessageSquareQuote, Plus, Pencil, Trash2 } from "lucide-react";

type Row = {
    id: number;
    text: string;
    author: string;
    relation: string;
    location: string;
    rating: number;
    order: number;
    is_active: boolean;
};

const empty: Omit<Row, "id"> = {
    text: "",
    author: "",
    relation: "",
    location: "",
    rating: 5,
    order: 0,
    is_active: true,
};

export default function AdminHomeTestimonialsPage() {
    const { authFetch } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(empty);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await authFetch<Row[]>("/common/home-testimonials/");
            const list = Array.isArray(data) ? data : [];
            setRows(list);
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const startCreate = () => {
        setEditingId(null);
        setForm(empty);
        setModalOpen(true);
        setError(null);
    };

    const startEdit = (r: Row) => {
        setEditingId(r.id);
        setForm({
            text: r.text,
            author: r.author,
            relation: r.relation || "",
            location: r.location || "",
            rating: r.rating,
            order: r.order,
            is_active: r.is_active,
        });
        setModalOpen(true);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.text.trim() || !form.author.trim()) return;
        setError(null);
        setSubmitting(true);
        try {
            const body = {
                text: form.text.trim(),
                author: form.author.trim(),
                relation: form.relation.trim(),
                location: form.location.trim(),
                rating: Math.min(5, Math.max(1, Number(form.rating) || 5)),
                order: Number(form.order) || 0,
                is_active: form.is_active,
            };
            if (editingId != null) {
                await authFetch(`/common/home-testimonials/${editingId}/`, {
                    method: "PATCH",
                    headers: jsonHeaders(),
                    body: JSON.stringify(body),
                });
            } else {
                await authFetch("/common/home-testimonials/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify(body),
                });
            }
            setModalOpen(false);
            await load();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this testimonial?")) return;
        try {
            await authFetch(`/common/home-testimonials/${id}/`, { method: "DELETE" });
            setRows((prev) => prev.filter((r) => r.id !== id));
        } catch {
            alert("Delete failed");
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Public home page</p>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <MessageSquareQuote className="w-7 h-7 text-orange-500" aria-hidden />
                        Quote testimonials
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Text quotes in the purple curved slider on <strong>/</strong>. Inactive rows are hidden on the site.
                    </p>
                </div>
                <Button size="sm" onClick={startCreate} className="inline-flex items-center gap-2 shrink-0">
                    <Plus className="w-4 h-4" />
                    Add testimonial
                </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <p className="p-6 text-sm text-slate-500">Loading…</p>
                ) : rows.length === 0 ? (
                    <p className="p-6 text-sm text-slate-500">No testimonials yet. Add one or the site will use built-in fallback text.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-900 text-xs uppercase tracking-wide">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Order</th>
                                    <th className="px-4 py-3 font-semibold">Author</th>
                                    <th className="px-4 py-3 font-semibold">Quote</th>
                                    <th className="px-4 py-3 font-semibold">Active</th>
                                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                {rows.map((r, idx) => (
                                    <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                                        <td className="px-4 py-3">{r.order}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{r.author}</td>
                                        <td className="px-4 py-3 max-w-md">
                                            <span className="line-clamp-2">{r.text}</span>
                                        </td>
                                        <td className="px-4 py-3">{r.is_active ? "Yes" : "No"}</td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1 text-orange-600 font-semibold text-xs"
                                                onClick={() => startEdit(r)}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1 text-red-600 font-semibold text-xs"
                                                onClick={() => void handleDelete(r.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId != null ? "Edit testimonial" : "New testimonial"}>
                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Quote</label>
                        <textarea
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[100px]"
                            value={form.text}
                            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Author name</label>
                            <input
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={form.author}
                                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Relation (e.g. Parent)</label>
                            <input
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={form.relation}
                                onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                            <input
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={form.location}
                                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Stars (1–5)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={5}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                    value={form.rating}
                                    onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Sort order</label>
                                <input
                                    type="number"
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                    value={form.order}
                                    onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                                />
                            </div>
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                        />
                        Show on website
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Saving…" : "Save"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

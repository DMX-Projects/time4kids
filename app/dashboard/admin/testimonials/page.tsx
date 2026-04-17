"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { MessageSquareQuote, Plus, Pencil, Trash2 } from "lucide-react";

type TestimonialRow = {
    id: number;
    text: string;
    author: string;
    relation: string;
    location: string;
    rating: number;
    order: number;
    is_active: boolean;
};

const emptyForm: Omit<TestimonialRow, "id"> = {
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
    const [rows, setRows] = useState<TestimonialRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await authFetch<TestimonialRow[]>("/common/home-testimonials/");
            const items = Array.isArray(data) ? data : (data as any)?.results || [];
            setRows(items);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const startCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm, order: rows.length });
        setModalOpen(true);
        setError(null);
    };

    const startEdit = (row: TestimonialRow) => {
        setEditingId(row.id);
        setForm({
            text: row.text,
            author: row.author,
            relation: row.relation,
            location: row.location,
            rating: row.rating,
            order: row.order,
            is_active: row.is_active,
        });
        setModalOpen(true);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        const payload = {
            text: form.text.trim(),
            author: form.author.trim(),
            relation: form.relation.trim(),
            location: form.location.trim(),
            rating: Math.min(5, Math.max(1, Number(form.rating) || 5)),
            order: Number(form.order) || 0,
            is_active: form.is_active,
        };
        try {
            if (editingId) {
                await authFetch(`/common/home-testimonials/${editingId}/`, {
                    method: "PATCH",
                    headers: jsonHeaders(),
                    body: JSON.stringify(payload),
                });
            } else {
                await authFetch("/common/home-testimonials/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify(payload),
                });
            }
            await load();
            setModalOpen(false);
        } catch (err: any) {
            setError(err?.message || "Save failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this testimonial from the home page?")) return;
        try {
            await authFetch(`/common/home-testimonials/${id}/`, { method: "DELETE" });
            setRows((r) => r.filter((x) => x.id !== id));
        } catch {
            alert("Could not delete");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <MessageSquareQuote className="w-7 h-7 text-orange-500" />
                        Parent testimonials (home page)
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Edit or remove quotes in the &quot;Parent Testimonials&quot; section on the main site. Inactive items are hidden from the public page.
                    </p>
                </div>
                <Button size="sm" onClick={startCreate} className="inline-flex items-center gap-2 shrink-0">
                    <Plus className="w-4 h-4" />
                    Add testimonial
                </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-900 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Order</th>
                                <th className="px-4 py-3 font-semibold">Author</th>
                                <th className="px-4 py-3 font-semibold">Relation</th>
                                <th className="px-4 py-3 font-semibold">Quote</th>
                                <th className="px-4 py-3 font-semibold">Active</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                                        Loading…
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                                        No testimonials yet. Add one to show on the home page.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row, idx) => (
                                    <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                                        <td className="px-4 py-3 whitespace-nowrap">{row.order}</td>
                                        <td className="px-4 py-3 font-medium">{row.author}</td>
                                        <td className="px-4 py-3 text-slate-600">{row.relation || "—"}</td>
                                        <td className="px-4 py-3 max-w-md truncate">{row.text}</td>
                                        <td className="px-4 py-3">{row.is_active ? "Yes" : "No"}</td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                                                onClick={() => startEdit(row)}
                                            >
                                                <Pencil className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(row.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit testimonial" : "New testimonial"} size="lg">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Author name</label>
                            <input
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                value={form.author}
                                onChange={(e) => setForm({ ...form, author: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Relation (e.g. Mother of Aarav)</label>
                            <input
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                value={form.relation}
                                onChange={(e) => setForm({ ...form, relation: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                            <input
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Rating (1–5)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={5}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    value={form.rating}
                                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Sort order</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    value={form.order}
                                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Quote</label>
                        <textarea
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-[120px]"
                            value={form.text}
                            onChange={(e) => setForm({ ...form, text: e.target.value })}
                            required
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                        />
                        Show on public home page
                    </label>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={submitting}>
                            {submitting ? "Saving…" : "Save"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

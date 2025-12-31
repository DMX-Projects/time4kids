"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { CalendarDays, Plus, Pencil, Trash2 } from "lucide-react";

type UpdateItem = {
    id: number;
    text: string;
    date: string;
};

const emptyUpdate = { text: "", date: "" };

export default function AdminUpdatesPage() {
    const { authFetch } = useAuth();
    const [updates, setUpdates] = useState<UpdateItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyUpdate);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadUpdates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadUpdates = async () => {
        setLoading(true);
        try {
            const data = await authFetch<UpdateItem[]>("/updates/");
            // Handle if data is wrapped in results (pagination)
            const items = Array.isArray(data) ? data : (data as any).results || [];
            setUpdates(items);
        } catch (err) {
            console.error(err);
            // setError("Failed to load updates");
        } finally {
            setLoading(false);
        }
    };

    const startCreate = () => {
        setEditingId(null);
        setForm(emptyUpdate);
        setModalOpen(true);
        setError(null);
    };

    const startEdit = (item: UpdateItem) => {
        setEditingId(item.id);
        setForm({ text: item.text, date: item.date });
        setModalOpen(true);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            if (editingId) {
                await authFetch(`/updates/${editingId}/`, {
                    method: "PATCH",
                    headers: jsonHeaders(),
                    body: JSON.stringify(form),
                });
            } else {
                await authFetch("/updates/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify(form),
                });
            }
            await loadUpdates();
            setModalOpen(false);
        } catch (err: any) {
            setError(err?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this update?")) return;
        try {
            await authFetch(`/updates/${id}/`, { method: "DELETE" });
            setUpdates(updates.filter((u) => u.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete update");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Updates</h1>
                    <p className="text-sm text-slate-600">Manage the updates shown on the home page.</p>
                </div>
                <Button size="sm" onClick={startCreate} className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Update
                </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-2 text-sm text-slate-700 mb-3">
                    <CalendarDays className="w-4 h-4 text-orange-500" />
                    <span>{updates.length} updates</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-900 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Date</th>
                                <th className="px-4 py-3 font-semibold">Text</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {updates.length === 0 && !loading && (
                                <tr>
                                    <td className="px-4 py-6 text-sm text-slate-500" colSpan={3}>
                                        No updates found.
                                    </td>
                                </tr>
                            )}
                            {updates.map((item, idx) => (
                                <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                                    <td className="px-4 py-3 whitespace-nowrap font-medium">{item.date}</td>
                                    <td className="px-4 py-3 max-w-md truncate">{item.text}</td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                                            onClick={() => startEdit(item)}
                                        >
                                            <Pencil className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Update" : "New Update"} size="md">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                        <input
                            type="date"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Text</label>
                        <textarea
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none min-h-[100px]"
                            value={form.text}
                            onChange={(e) => setForm({ ...form, text: e.target.value })}
                            required
                            placeholder="Enter update details..."
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" size="sm" disabled={submitting}>
                            {submitting ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

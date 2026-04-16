"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import type { AdminEvent } from "@/components/dashboard/admin/AdminDataProvider";
import { CalendarRange, MapPin, Plus, Pencil, Trash2 } from "lucide-react";

const empty = {
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    franchiseId: "",
};

export default function AdminEventsPage() {
    const { events, franchises, addEvent, updateEvent, deleteEvent } = useAdminData();
    const [form, setForm] = useState(empty);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const franchiseOptions = useMemo(
        () => [...franchises].sort((a, b) => a.name.localeCompare(b.name)),
        [franchises],
    );

    const startCreate = () => {
        setEditingId(null);
        setForm({
            ...empty,
            franchiseId: franchiseOptions[0]?.id || "",
        });
        setModalOpen(true);
        setError(null);
    };

    const startEdit = (e: AdminEvent) => {
        setEditingId(e.id);
        setForm({
            title: e.title,
            description: e.description || "",
            location: e.location || "",
            startDate: e.startDate ? e.startDate.slice(0, 10) : "",
            endDate: e.endDate ? e.endDate.slice(0, 10) : "",
            franchiseId: e.franchiseId,
        });
        setModalOpen(true);
        setError(null);
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!form.title.trim() || !form.franchiseId) return;
        setError(null);
        setSubmitting(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                location: form.location.trim(),
                startDate: form.startDate || "",
                endDate: form.endDate || "",
                franchiseId: form.franchiseId,
            };
            if (editingId) {
                await updateEvent(editingId, payload);
            } else {
                await addEvent(payload);
            }
            setModalOpen(false);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unable to save event");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this event?")) return;
        setSubmitting(true);
        try {
            await deleteEvent(id);
        } catch {
            alert("Delete failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Franchise events</p>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <CalendarRange className="w-7 h-7 text-orange-500" aria-hidden />
                        Events
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Create and edit events per franchise (shown on centre pages and parent dashboards). For homepage “Life at T.I.M.E. Kids” tiles, use{" "}
                        <strong>Media Files</strong>.
                    </p>
                </div>
                <Button size="sm" onClick={startCreate} className="inline-flex items-center gap-2 shrink-0" disabled={franchiseOptions.length === 0}>
                    <Plus className="w-4 h-4" />
                    New event
                </Button>
            </div>

            {franchiseOptions.length === 0 && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">Add a franchise first, then you can attach events to it.</p>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-900 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Title</th>
                                <th className="px-4 py-3 font-semibold">Franchise</th>
                                <th className="px-4 py-3 font-semibold">Dates</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {events.length === 0 && (
                                <tr>
                                    <td className="px-4 py-8 text-slate-500" colSpan={4}>
                                        No events yet.
                                    </td>
                                </tr>
                            )}
                            {events.map((row, idx) => (
                                <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900">{row.title}</div>
                                        {row.location && (
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-3 h-3" />
                                                {row.location}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {row.franchiseName || "—"}
                                        {row.franchiseCity ? <span className="text-slate-500"> · {row.franchiseCity}</span> : null}
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        {row.startDate ? row.startDate.slice(0, 10) : "—"}
                                        {row.endDate ? ` → ${row.endDate.slice(0, 10)}` : ""}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button type="button" className="text-orange-600 font-semibold text-xs inline-flex items-center gap-1" onClick={() => startEdit(row)}>
                                            <Pencil className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="text-red-600 font-semibold text-xs inline-flex items-center gap-1"
                                            onClick={() => void handleDelete(row.id)}
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
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit event" : "New event"}>
                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Franchise</label>
                        <select
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            value={form.franchiseId}
                            onChange={(e) => setForm((f) => ({ ...f, franchiseId: e.target.value }))}
                            required
                        >
                            <option value="">Select franchise</option>
                            {franchiseOptions.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                        <input
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                        <textarea
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px]"
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Venue / location</label>
                        <input
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            value={form.location}
                            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Start date</label>
                            <input
                                type="date"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={form.startDate}
                                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">End date</label>
                            <input
                                type="date"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={form.endDate}
                                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                            />
                        </div>
                    </div>
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

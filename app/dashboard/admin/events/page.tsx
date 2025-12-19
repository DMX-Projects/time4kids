"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import { CalendarDays, Clock3, MapPin, Plus, Pencil, Trash2, Building2 } from "lucide-react";

const emptyEvent = { title: "", description: "", location: "", startDate: "", endDate: "", franchiseId: "" };

export default function AdminEventsPage() {
    const { events, addEvent, updateEvent, deleteEvent, franchises } = useAdminData();

    const [form, setForm] = useState(emptyEvent);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const hasFranchises = franchises.length > 0;

    const sortedEvents = useMemo(() => {
        return [...events].sort((a, b) => (b.startDate || "").localeCompare(a.startDate || ""));
    }, [events]);

    const startCreate = () => {
        setEditingId(null);
        setForm(emptyEvent);
        setModalOpen(true);
    };

    const startEdit = (id: string) => {
        const current = events.find((evt) => evt.id === id);
        if (!current) return;
        setEditingId(id);
        setForm({
            title: current.title,
            description: current.description,
            location: current.location,
            startDate: (current.startDate || "").slice(0, 10),
            endDate: (current.endDate || "").slice(0, 10),
            franchiseId: current.franchiseId,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.title.trim() || !form.franchiseId) return;
        setError(null);
        setSubmitting(true);
        try {
            if (editingId) {
                await updateEvent(editingId, form);
            } else {
                await addEvent(form);
            }
            setForm(emptyEvent);
            setEditingId(null);
            setModalOpen(false);
        } catch (err: any) {
            setError(err?.message || "Unable to save event");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setError(null);
        setSubmitting(true);
        try {
            await deleteEvent(id);
        } catch (err: any) {
            setError(err?.message || "Unable to delete event");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Events</p>
                    <h1 className="text-2xl font-semibold text-slate-900">Admin events</h1>
                    <p className="text-sm text-slate-600">List, add, edit, or delete events scoped to your franchises.</p>
                </div>
                <Button size="sm" onClick={startCreate} disabled={!hasFranchises} className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Event
                </Button>
            </div>

            {!hasFranchises && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">Add a franchise first to create events.</p>}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                        <CalendarDays className="w-4 h-4 text-orange-500" />
                        <span>{events.length} events</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={startCreate} disabled={!hasFranchises}>Add Event</Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-900 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Title</th>
                                <th className="px-4 py-3 font-semibold">Franchise</th>
                                <th className="px-4 py-3 font-semibold">Dates</th>
                                <th className="px-4 py-3 font-semibold">Location</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {sortedEvents.length === 0 && (
                                <tr>
                                    <td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>
                                        No events found.
                                    </td>
                                </tr>
                            )}
                            {sortedEvents.map((evt, idx) => (
                                <tr key={evt.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900">{evt.title}</div>
                                        <p className="text-xs text-slate-500 line-clamp-1">{evt.description || "No description"}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Building2 className="w-4 h-4 text-slate-500" />
                                            <span>{evt.franchiseName || "Unassigned"}</span>
                                        </div>
                                        <p className="text-xs text-slate-500">{evt.franchiseCity || ""}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <Clock3 className="w-4 h-4 text-slate-500" />
                                            <span>{evt.startDate ? evt.startDate.slice(0, 10) : "TBD"}</span>
                                            <span className="text-slate-400">→</span>
                                            <span>{evt.endDate ? evt.endDate.slice(0, 10) : "TBD"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-slate-500" />
                                            <span>{evt.location || "—"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                                            onClick={() => startEdit(evt.id)}
                                        >
                                            <Pencil className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(evt.id)}
                                            disabled={submitting}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Event" : "Add Event"} size="md">
                <form className="space-y-3" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-600">Franchise</label>
                            <select
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                value={form.franchiseId}
                                onChange={(e) => setForm({ ...form, franchiseId: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select franchise</option>
                                {franchises.map((fr) => (
                                    <option key={fr.id} value={fr.id}>{fr.name}</option>
                                ))}
                            </select>
                        </div>
                        <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                        <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                        <div className="md:col-span-2">
                            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                                Description
                                <textarea
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none min-h-[96px]"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Brief summary of the event"
                                />
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={submitting || !hasFranchises}>{submitting ? "Saving..." : editingId ? "Save Changes" : "Create Event"}</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </form>
            </Modal>
        </div>
    );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    return (
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            {label}
            <input
                {...props}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
            />
        </label>
    );
}

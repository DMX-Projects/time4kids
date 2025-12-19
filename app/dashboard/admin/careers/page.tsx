"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import { Briefcase, MapPin, Plus, Pencil, Trash2 } from "lucide-react";

const emptyCareer = { title: "", dept: "", location: "", type: "Full-time" };

export default function AdminCareersPage() {
    const { careers, addCareer, updateCareer, deleteCareer } = useAdminData();

    const [form, setForm] = useState(emptyCareer);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const startCreate = () => {
        setEditingId(null);
        setForm(emptyCareer);
        setModalOpen(true);
    };

    const startEdit = (id: string) => {
        const current = careers.find((c) => c.id === id);
        if (!current) return;
        setEditingId(id);
        setForm({ title: current.title, dept: current.dept, location: current.location, type: current.type });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setError(null);
        setSubmitting(true);
        try {
            if (editingId) {
                await updateCareer(editingId, form);
            } else {
                await addCareer(form);
            }
            setForm(emptyCareer);
            setEditingId(null);
            setModalOpen(false);
        } catch (err: any) {
            setError(err?.message || "Unable to save career");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setError(null);
        setSubmitting(true);
        try {
            await deleteCareer(id);
        } catch (err: any) {
            setError(err?.message || "Unable to delete career");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Careers</p>
                    <h1 className="text-2xl font-semibold text-slate-900">Manage job postings</h1>
                    <p className="text-sm text-slate-600">Add, edit, or remove openings in one place.</p>
                </div>
                <Button size="sm" onClick={startCreate} className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Role
                </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Briefcase className="w-4 h-4 text-orange-500" />
                        <span>{careers.length} openings</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={startCreate}>Add Career</Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-900 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Title</th>
                                <th className="px-4 py-3 font-semibold">Department</th>
                                <th className="px-4 py-3 font-semibold">Location</th>
                                <th className="px-4 py-3 font-semibold">Type</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {careers.length === 0 && (
                                <tr>
                                    <td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>
                                        No careers posted yet.
                                    </td>
                                </tr>
                            )}
                            {careers.map((career, idx) => (
                                <tr key={career.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900">{career.title}</div>
                                        <p className="text-xs text-slate-500 line-clamp-1">{career.dept || ""}</p>
                                    </td>
                                    <td className="px-4 py-3">{career.dept || "—"}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-slate-500" />
                                            <span>{career.location || "Remote"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{career.type}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                                            onClick={() => startEdit(career.id)}
                                        >
                                            <Pencil className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(career.id)}
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

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Career" : "Add Career"} size="md">
                <form className="space-y-3" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Job Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                        <Input label="Department" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} />
                        <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-600">Type</label>
                            <select
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                            >
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contract</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={submitting}>{submitting ? "Saving..." : editingId ? "Save Changes" : "Create Role"}</Button>
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

"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Building2, Plus, Settings, Trash2, Pencil } from "lucide-react";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";

type FranchiseFormState = {
    name: string;
    owner: string;
    region: string;
    email: string;
    phone: string;
    status: string;
};

const emptyForm: FranchiseFormState = { name: "", owner: "", region: "", email: "", phone: "", status: "Active" };

export default function ManageFranchisePage() {
    return <ManageFranchiseView />;
}

export function ManageFranchiseView({ initialFranchiseId }: { initialFranchiseId?: string }) {
    const { franchises, addFranchise, updateFranchise, deleteFranchise } = useAdminData();

    const [form, setForm] = useState<FranchiseFormState>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!initialFranchiseId) return;
        const match = franchises.find((f) => f.id === initialFranchiseId);
        if (match) {
            setEditingId(match.id);
            setForm({
                name: match.name,
                owner: match.owner,
                region: match.region,
                email: match.email,
                phone: match.phone,
                status: match.status || "Active",
            });
            setModalOpen(true);
        }
    }, [initialFranchiseId, franchises]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        setError(null);
        setSubmitting(true);
        try {
            if (editingId) {
                await updateFranchise(editingId, form);
            } else {
                await addFranchise(form);
            }
            setForm(emptyForm);
            setEditingId(null);
            setModalOpen(false);
        } catch (err: any) {
            setError(err?.message || "Unable to save franchise");
        } finally {
            setSubmitting(false);
        }
    };

    const startCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const startEdit = (id: string) => {
        const current = franchises.find((f) => f.id === id);
        if (!current) return;
        setEditingId(id);
        setForm({
            name: current.name,
            owner: current.owner,
            region: current.region,
            email: current.email,
            phone: current.phone,
            status: current.status,
        });
        setModalOpen(true);
    };

    const confirmDelete = async (id: string) => {
        setError(null);
        setSubmitting(true);
        try {
            await deleteFranchise(id);
        } catch (err: any) {
            setError(err?.message || "Unable to delete franchise");
        } finally {
            setSubmitting(false);
        }
    };

    const totalActive = useMemo(() => franchises.filter((f) => (f.status || "").toLowerCase() === "active").length, [franchises]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Franchises</p>
                    <h1 className="text-2xl font-semibold text-slate-900">Manage & onboard franchises</h1>
                    <p className="text-sm text-slate-600">Create, edit, or remove franchise records from one place.</p>
                </div>
                <Button size="sm" onClick={startCreate} className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Franchise
                </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Building2 className="w-4 h-4 text-orange-500" />
                        <span>{franchises.length} total</span>
                        <span className="text-slate-400">•</span>
                        <span>{totalActive} active</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={startCreate}>
                        Add Franchise
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-900 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Name</th>
                                <th className="px-4 py-3 font-semibold">Owner</th>
                                <th className="px-4 py-3 font-semibold">Region</th>
                                <th className="px-4 py-3 font-semibold">Email</th>
                                <th className="px-4 py-3 font-semibold">Phone</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {franchises.length === 0 && (
                                <tr>
                                    <td className="px-4 py-6 text-sm text-slate-500" colSpan={7}>
                                        No franchises yet. Use Add Franchise to create one.
                                    </td>
                                </tr>
                            )}
                            {franchises.map((franchise, idx) => (
                                <tr key={franchise.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                                    <td className="px-4 py-3 font-semibold text-slate-900">{franchise.name}</td>
                                    <td className="px-4 py-3">{franchise.owner || "—"}</td>
                                    <td className="px-4 py-3">{franchise.region || franchise.city || "—"}</td>
                                    <td className="px-4 py-3">{franchise.email || "—"}</td>
                                    <td className="px-4 py-3">{franchise.phone || "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            (franchise.status || "").toLowerCase() === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                        }`}>
                                            {franchise.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                                            onClick={() => startEdit(franchise.id)}
                                        >
                                            <Pencil className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={() => confirmDelete(franchise.id)}
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

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Franchise" : "Add Franchise"} size="md">
                <form className="space-y-3" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Franchise Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <Input label="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
                        <Input label="Region / City" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
                        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-600">Status</label>
                            <select
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                            >
                                <option>Active</option>
                                <option>Inactive</option>
                                <option>Pending</option>
                                <option>On Hold</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={submitting}>{submitting ? "Saving..." : editingId ? "Save Changes" : "Create Franchise"}</Button>
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

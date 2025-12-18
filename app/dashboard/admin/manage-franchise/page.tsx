"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Settings } from "lucide-react";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";

export default function ManageFranchisePage() {
    const { franchises, updateFranchise, deleteFranchise } = useAdminData();

    const [editingFranchiseId, setEditingFranchiseId] = useState<string | null>(null);
    const [viewingFranchiseId, setViewingFranchiseId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", owner: "", region: "", email: "", phone: "", status: "Active" });

    const startEdit = (franchise: (typeof franchises)[number]) => {
        setEditingFranchiseId(franchise.id);
        const { id, ...rest } = franchise;
        setForm(rest);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingFranchiseId) return;
        updateFranchise(editingFranchiseId, form);
        setEditingFranchiseId(null);
        setForm({ name: "", owner: "", region: "", email: "", phone: "", status: "Active" });
    };

    return (
        <div className="space-y-6">
            <Section id="update-franchise" title="Update Franchise" icon={<Settings className="w-5 h-5 text-orange-500" />} description="Edit existing franchise details, contacts, and compliance docs.">
                <form className="space-y-3" onSubmit={handleUpdate}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Franchise Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <Input label="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
                        <Input label="Region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
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
                                <option>Pending</option>
                                <option>On Hold</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={!editingFranchiseId}>Save Changes</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => { setEditingFranchiseId(null); setForm({ name: "", owner: "", region: "", email: "", phone: "", status: "Active" }); }}>Reset</Button>
                    </div>
                </form>
            </Section>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {franchises.map((franchise) => (
                    <div key={franchise.id} className="group relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm transition-transform duration-300 transform-gpu hover:-translate-y-2 hover:-rotate-1">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-semibold text-slate-800">{franchise.name}</div>
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">{franchise.status}</span>
                        </div>
                        <p className="text-sm text-slate-600">Owner: {franchise.owner || "—"}</p>
                        <p className="text-sm text-slate-600">Region: {franchise.region || "—"}</p>
                        <p className="text-sm text-slate-600">Email: {franchise.email || "—"}</p>
                        <p className="text-sm text-slate-600">Phone: {franchise.phone || "—"}</p>
                        <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setViewingFranchiseId(franchise.id)}>View</Button>
                            <Button size="sm" variant="outline" onClick={() => startEdit(franchise)}>Edit</Button>
                            <Button size="sm" variant="outline" className="!text-red-600 !border-red-200 hover:!bg-red-50" onClick={() => deleteFranchise(franchise.id)}>Delete</Button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={!!viewingFranchiseId}
                onClose={() => setViewingFranchiseId(null)}
                title="Franchise Details"
                size="sm"
            >
                {(() => {
                    const current = franchises.find((f) => f.id === viewingFranchiseId);
                    if (!current) return <p className="text-sm text-slate-700">Franchise not found.</p>;
                    return (
                        <div className="space-y-2 text-sm text-slate-800">
                            <p><span className="font-semibold">Name:</span> {current.name}</p>
                            <p><span className="font-semibold">Owner:</span> {current.owner || "—"}</p>
                            <p><span className="font-semibold">Region:</span> {current.region || "—"}</p>
                            <p><span className="font-semibold">Email:</span> {current.email || "—"}</p>
                            <p><span className="font-semibold">Phone:</span> {current.phone || "—"}</p>
                            <p><span className="font-semibold">Status:</span> {current.status}</p>
                        </div>
                    );
                })()}
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

function Section({ id, title, description, icon, children }: { id: string; title: string; description: string; icon: React.ReactNode; children?: React.ReactNode }) {
    return (
        <section id={id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
                    <p className="text-sm text-slate-600">{description}</p>
                </div>
            </div>
            {children && <div>{children}</div>}
        </section>
    );
}

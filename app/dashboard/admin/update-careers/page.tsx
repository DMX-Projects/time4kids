"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { FileText } from "lucide-react";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";

export default function UpdateCareersPage() {
    const { careers, updateCareer, deleteCareer } = useAdminData();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ title: "", dept: "", location: "", type: "Full-time" });

    const startEdit = (career: (typeof careers)[number]) => {
        setEditingId(career.id);
        const { id, ...rest } = career;
        setForm(rest);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingId) return;
        updateCareer(editingId, form);
        setEditingId(null);
        setForm({ title: "", dept: "", location: "", type: "Full-time" });
    };

    return (
        <div className="space-y-6">
            <Section id="update-careers" title="Update Careers" icon={<FileText className="w-5 h-5 text-orange-500" />} description="Edit, close, or extend existing job postings.">
                <form className="space-y-3" onSubmit={handleUpdate}>
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
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={!editingId}>Save Changes</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => { setEditingId(null); setForm({ title: "", dept: "", location: "", type: "Full-time" }); }}>Reset</Button>
                    </div>
                </form>
            </Section>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {careers.map((career) => (
                    <div key={career.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="font-semibold text-slate-800">{career.title}</div>
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">{career.type}</span>
                        </div>
                        <p className="text-sm text-slate-600">Dept: {career.dept || "—"}</p>
                        <p className="text-sm text-slate-600">Location: {career.location || "Remote"}</p>
                        <div className="flex gap-2 mt-1">
                            <Button size="sm" variant="outline" onClick={() => startEdit(career)}>Edit</Button>
                            <Button size="sm" variant="outline" className="!text-red-600 !border-red-200 hover:!bg-red-50" onClick={() => deleteCareer(career.id)}>
                                Delete
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
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

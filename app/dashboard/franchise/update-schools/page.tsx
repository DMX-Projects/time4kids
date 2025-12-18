"use client";

import type React from "react";
import { useState } from "react";
import { School, Settings } from "lucide-react";
import Button from "@/components/ui/Button";
import { useFranchiseData } from "@/components/dashboard/franchise/FranchiseDataProvider";

export default function UpdateSchoolsPage() {
    const { schools, updateSchool, deleteSchool } = useFranchiseData();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", city: "", contact: "", phone: "" });

    const startEdit = (school: (typeof schools)[number]) => {
        setEditingId(school.id);
        const { id, ...rest } = school;
        setForm(rest);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingId) return;
        updateSchool(editingId, form);
        setEditingId(null);
        setForm({ name: "", city: "", contact: "", phone: "" });
    };

    return (
        <div className="space-y-6">
            <Section id="update-school" title="Update Schools" description="Edit partner school details or remove inactive ones." icon={<Settings className="w-5 h-5 text-orange-500" />}>
                <form className="space-y-3" onSubmit={handleUpdate}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="School Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                        <Input label="Contact Person" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={!editingId}>Save Changes</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => { setEditingId(null); setForm({ name: "", city: "", contact: "", phone: "" }); }}>Reset</Button>
                    </div>
                </form>
            </Section>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schools.map((school) => (
                    <div key={school.id} className="group bg-white border border-orange-100 rounded-xl p-4 shadow-sm transform-gpu transition duration-300 hover:-translate-y-2 hover:-rotate-1">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-orange-900 text-sm">{school.name}</span>
                            <span className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded-full border border-orange-100">{school.city || "City"}</span>
                        </div>
                        <p className="text-sm text-orange-700">Contact: {school.contact || "—"}</p>
                        <p className="text-sm text-orange-700">Phone: {school.phone || "—"}</p>
                        <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(school)}>Edit</Button>
                            <Button size="sm" variant="outline" className="!text-red-600 !border-red-200 hover:!bg-red-50" onClick={() => deleteSchool(school.id)}>Delete</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    return (
        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
            {label}
            <input {...props} className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
        </label>
    );
}

function Section({ id, title, description, icon, children }: { id: string; title: string; description: string; icon: React.ReactNode; children?: React.ReactNode }) {
    return (
        <section id={id} className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-orange-900">{title}</h2>
                    <p className="text-sm text-orange-700">{description}</p>
                </div>
            </div>
            {children && <div>{children}</div>}
        </section>
    );
}

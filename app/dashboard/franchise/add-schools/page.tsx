"use client";

import type React from "react";
import { useState } from "react";
import { Plus, School } from "lucide-react";
import Button from "@/components/ui/Button";
import { useFranchiseData } from "@/components/dashboard/franchise/FranchiseDataProvider";

export default function AddSchoolsPage() {
    const { addSchool } = useFranchiseData();
    const [form, setForm] = useState({ name: "", city: "", contact: "", phone: "" });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        addSchool(form);
        setForm({ name: "", city: "", contact: "", phone: "" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="space-y-6">
            <Section id="add-school" title="Add Partner School" description="Register a new partner school with contact details." icon={<School className="w-5 h-5 text-orange-500" />}>
                <form className="space-y-3" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="School Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                        <Input label="Contact Person" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm">Save</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setForm({ name: "", city: "", contact: "", phone: "" })}>Reset</Button>
                    </div>
                </form>
            </Section>
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

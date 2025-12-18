"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useFranchiseData } from "@/components/dashboard/franchise/FranchiseDataProvider";

export default function AddParentPage() {
    const { addParent } = useFranchiseData();
    const [parentForm, setParentForm] = useState({ name: "", student: "", email: "", phone: "" });

    const handleParentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!parentForm.name.trim()) return;
        addParent(parentForm);
        setParentForm({ name: "", student: "", email: "", phone: "" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="space-y-6">
            <Section id="add-parent" title="Add Parent" icon={<Plus className="w-5 h-5 text-orange-500" />} description="Enroll a parent and connect them to their student profile.">
                <form className="space-y-3" onSubmit={handleParentSubmit}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Parent Name" value={parentForm.name} onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })} required />
                        <Input label="Student Name" value={parentForm.student} onChange={(e) => setParentForm({ ...parentForm, student: e.target.value })} />
                        <Input label="Email" type="email" value={parentForm.email} onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })} />
                        <Input label="Phone" value={parentForm.phone} onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm">Submit</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setParentForm({ name: "", student: "", email: "", phone: "" })}>Reset</Button>
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
            <input
                {...props}
                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
            />
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

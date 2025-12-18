"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { UserCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";

export default function ParentProfilePage() {
    const { parentProfile, updateParentProfile } = useParentData();
    const [form, setForm] = useState(parentProfile);

    useEffect(() => {
        setForm(parentProfile);
    }, [parentProfile]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateParentProfile(form);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePhoto = (file?: File) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setForm((prev) => ({ ...prev, photo: url }));
    };

    return (
        <div className="space-y-6">
            <Section
                id="profile"
                title="Profile"
                description="Manage your parent account, contacts, and preferences."
                icon={<UserCircle className="w-5 h-5 text-orange-600" />}
            >
                <form className="space-y-3" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                        <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                        <Input label="Photo URL" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-medium text-orange-700">Upload Photo</label>
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden text-orange-600">
                                {form.photo ? <img src={form.photo} alt="Profile" className="w-full h-full object-cover" /> : <UserCircle className="w-7 h-7" />}
                            </div>
                            <input type="file" accept="image/*" onChange={(e) => handlePhoto(e.target.files?.[0])} className="text-sm" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm">Save Profile</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setForm(parentProfile)}>Reset</Button>
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

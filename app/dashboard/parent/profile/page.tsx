"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { UserCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";

export default function ParentProfilePage() {
    const { parentProfile, updateParentProfile, parentProfileLoading } = useParentData();
    const [form, setForm] = useState(parentProfile);
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState<string | null>(null);

    useEffect(() => {
        setForm(parentProfile);
    }, [parentProfile]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setSavedMsg(null);
        try {
            await updateParentProfile(form);
            setSavedMsg("Profile saved.");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
            setSavedMsg("Could not save. Try again or contact your centre.");
        } finally {
            setSaving(false);
        }
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
                description="Update your contact details. Your centre still manages your child’s school record."
                icon={<UserCircle className="w-5 h-5 text-orange-600" />}
            >
                {(parentProfile.franchiseName || parentProfile.franchisePhone || parentProfile.franchiseEmail) && (
                    <div className="rounded-xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm text-orange-900 space-y-1">
                        <p className="font-semibold">Your centre</p>
                        {parentProfile.franchiseName && <p>{parentProfile.franchiseName}</p>}
                        {parentProfile.franchisePhone && (
                            <p>
                                Phone:{" "}
                                <a className="underline font-medium" href={`tel:${parentProfile.franchisePhone}`}>
                                    {parentProfile.franchisePhone}
                                </a>
                            </p>
                        )}
                        {parentProfile.franchiseEmail && (
                            <p>
                                Email:{" "}
                                <a className="underline font-medium" href={`mailto:${parentProfile.franchiseEmail}`}>
                                    {parentProfile.franchiseEmail}
                                </a>
                            </p>
                        )}
                    </div>
                )}

                {savedMsg && (
                    <p className={`text-sm ${savedMsg.startsWith("Could") ? "text-red-600" : "text-green-700"}`} role="status">
                        {savedMsg}
                    </p>
                )}

                <form className="space-y-3" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={parentProfileLoading} />
                        <Input label="Email" type="email" value={form.email} onChange={() => {}} disabled readOnly title="Email is managed by your centre login" />
                        <Input 
                            label="Phone" 
                            type="tel"
                            pattern="\d{10}" 
                            maxLength={10} 
                            title="Please enter exactly 10 digits" 
                            value={form.phone} 
                            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} 
                            disabled={parentProfileLoading} 
                        />
                        <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} disabled={parentProfileLoading} />
                        <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} disabled={parentProfileLoading} className="md:col-span-2" />
                        <Input
                            label="Photo URL"
                            value={form.photo.startsWith("blob:") ? "" : form.photo}
                            onChange={(e) => setForm({ ...form, photo: e.target.value })}
                            disabled={parentProfileLoading}
                            placeholder="https://…"
                        />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-medium text-orange-700">Upload Photo (preview only — set a public URL above to keep it after refresh)</label>
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden text-orange-600">
                                {form.photo ? (
                                    <div className="relative w-full h-full">
                                        <Image src={form.photo} alt="Profile" fill className="object-cover" unoptimized />
                                    </div>
                                ) : (
                                    <UserCircle className="w-7 h-7" />
                                )}
                            </div>
                            <input type="file" accept="image/*" onChange={(e) => handlePhoto(e.target.files?.[0])} className="text-sm" disabled={parentProfileLoading} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={saving || parentProfileLoading}>
                            {saving ? "Saving…" : "Save Profile"}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setForm(parentProfile)} disabled={saving}>
                            Reset
                        </Button>
                    </div>
                </form>
            </Section>
        </div>
    );
}

function Input({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
    return (
        <label className={`flex flex-col gap-1 text-xs font-medium text-orange-700 ${className}`}>
            {label}
            <input {...props} className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none disabled:opacity-60" />
        </label>
    );
}

function Section({ id, title, description, icon, children }: { id: string; title: string; description: string; icon: React.ReactNode; children?: React.ReactNode }) {
    return (
        <section id={id} className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">{icon}</div>
                <div>
                    <h2 className="text-lg font-semibold text-orange-900">{title}</h2>
                    <p className="text-sm text-orange-700">{description}</p>
                </div>
            </div>
            {children && <div>{children}</div>}
        </section>
    );
}

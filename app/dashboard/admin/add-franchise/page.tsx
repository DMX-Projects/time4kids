"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Building2, Plus, Save, X } from "lucide-react";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

type FranchiseFormState = {
    name: string;
    owner: string;
    region: string;
    email: string;
    phone: string;
    status: string;
    password?: string;
    address: string;
    googleMapLink: string;
    about: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    youtube: string;
};

const emptyForm: FranchiseFormState = {
    name: "", owner: "", region: "", email: "", phone: "", status: "Active", password: "",
    address: "", googleMapLink: "", about: "", facebook: "", instagram: "", linkedin: "", twitter: "", youtube: ""
};

export default function AddFranchisePage() {
    const { addFranchise, savedLocations } = useAdminData();
    const { showToast } = useToast();
    const router = useRouter();
    const [form, setForm] = useState<FranchiseFormState>(emptyForm);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim()) {
            showToast("Plase fill in name and email", "error");
            return;
        }
        setSubmitting(true);
        try {
            await addFranchise(form);
            showToast("Franchise added successfully!", "success");
            router.push("/dashboard/admin/manage-franchise");
        } catch (err: any) {
            showToast(err?.message || "Unable to save franchise", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Manage & onboard franchises</h1>
                    <p className="text-sm text-slate-600">Create a new preschool center and assign owner credentials.</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Login Credentials Section - High Priority */}
                    <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100 space-y-4">
                        <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2">
                            🔐 Login Credentials
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Email / Username"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="font-semibold text-slate-900 border-orange-200 focus:border-orange-500 bg-white"
                                labelClassName="text-orange-900 font-bold"
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={form.password || ""}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                placeholder="Create login password"
                                className="font-semibold text-slate-900 border-orange-200 focus:border-orange-500 bg-white"
                                labelClassName="text-orange-900 font-bold"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Input label="Franchise Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <Input label="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Region / City</label>
                            {savedLocations.length > 0 ? (
                                <select
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                    value={form.region}
                                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                                >
                                    <option value="">Select City</option>
                                    {savedLocations.map((loc, idx) => (
                                        <option key={idx} value={loc.city_name}>{loc.city_name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                    value={form.region}
                                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                                    placeholder="Enter City"
                                />
                            )}
                        </div>

                        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Status</label>
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

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            About & Address
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Short Description</label>
                                <textarea
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                    rows={3}
                                    value={form.about}
                                    onChange={(e) => setForm({ ...form, about: e.target.value })}
                                    placeholder="Brief description..."
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">Address</label>
                                <textarea
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                    rows={3}
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="Full address..."
                                />
                            </div>
                        </div>
                        <Input label="Google Map Link" value={form.googleMapLink} onChange={(e) => setForm({ ...form, googleMapLink: e.target.value })} placeholder="https://maps.google.com/..." />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            Social Media
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input label="Facebook URL" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="https://facebook.com/..." />
                            <Input label="Instagram URL" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="https://instagram.com/..." />
                            <Input label="LinkedIn URL" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/..." />
                            <Input label="Twitter URL" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="https://twitter.com/..." />
                            <Input label="YouTube URL" value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} placeholder="https://youtube.com/..." />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-slate-100">
                        <Button type="submit" size="lg" disabled={submitting} className="flex-1">
                            {submitting ? "Saving..." : "Create Franchise"}
                        </Button>
                        <Button type="button" variant="outline" size="lg" onClick={() => router.back()} disabled={submitting}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Input({ label, labelClassName, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string, labelClassName?: string }) {
    return (
        <label className={`flex flex-col gap-1 text-xs font-medium text-slate-600 uppercase tracking-wider ${labelClassName}`}>
            {label}
            <input
                {...props}
                className={`rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-400 focus:outline-none ${props.className}`}
            />
        </label>
    );
}

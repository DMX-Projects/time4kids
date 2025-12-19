"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";

export default function AddFranchisePage() {
    const { addFranchise } = useAdminData();
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [franchiseForm, setFranchiseForm] = useState({
        name: "",
        owner: "",
        region: "",
        email: "",
        phone: "",
        status: "Active",
    });
    const handleFranchiseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!franchiseForm.name.trim()) return;
        setError(null);
        setSubmitting(true);
        try {
            await addFranchise(franchiseForm);
            setFranchiseForm({ name: "", owner: "", region: "", email: "", phone: "", status: "Active" });
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: any) {
            setError(err?.message || "Unable to add franchise");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFranchiseReset = () => {
        setFranchiseForm({ name: "", owner: "", region: "", email: "", phone: "", status: "Active" });
    };

    return (
        <div className="space-y-8">
            <Section id="add-franchise" title="Add Franchise" icon={<Plus className="w-5 h-5 text-orange-500" />} description="Create a new franchise entry and assign regional ownership.">
                {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
                <form className="space-y-3" onSubmit={handleFranchiseSubmit} onReset={handleFranchiseReset}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Franchise Name" value={franchiseForm.name} onChange={(e) => setFranchiseForm({ ...franchiseForm, name: e.target.value })} required />
                        <Input label="Owner" value={franchiseForm.owner} onChange={(e) => setFranchiseForm({ ...franchiseForm, owner: e.target.value })} />
                        <Input label="Region" value={franchiseForm.region} onChange={(e) => setFranchiseForm({ ...franchiseForm, region: e.target.value })} />
                        <Input label="Email" type="email" value={franchiseForm.email} onChange={(e) => setFranchiseForm({ ...franchiseForm, email: e.target.value })} />
                        <Input label="Phone" value={franchiseForm.phone} onChange={(e) => setFranchiseForm({ ...franchiseForm, phone: e.target.value })} />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-600">Status</label>
                            <select
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                value={franchiseForm.status}
                                onChange={(e) => setFranchiseForm({ ...franchiseForm, status: e.target.value })}
                            >
                                <option>Active</option>
                                <option>Pending</option>
                                <option>On Hold</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={submitting}>{submitting ? "Saving..." : "Submit"}</Button>
                        <Button type="reset" variant="outline" size="sm" disabled={submitting}>Reset</Button>
                    </div>
                </form>
            </Section>
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

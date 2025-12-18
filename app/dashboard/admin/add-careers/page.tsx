"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";

export default function AddCareersPage() {
    const { careers, addCareer } = useAdminData();

    const [careerForm, setCareerForm] = useState({
        title: "",
        dept: "",
        location: "",
        type: "Full-time",
    });

    const handleCareerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!careerForm.title.trim()) return;
        addCareer(careerForm);
        setCareerForm({ title: "", dept: "", location: "", type: "Full-time" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="space-y-6">
            <Section id="add-careers" title="Add Careers" icon={<Plus className="w-5 h-5 text-orange-500" />} description="Post new career openings and publish to the website.">
                <form className="space-y-3" onSubmit={handleCareerSubmit}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Job Title" value={careerForm.title} onChange={(e) => setCareerForm({ ...careerForm, title: e.target.value })} required />
                        <Input label="Department" value={careerForm.dept} onChange={(e) => setCareerForm({ ...careerForm, dept: e.target.value })} />
                        <Input label="Location" value={careerForm.location} onChange={(e) => setCareerForm({ ...careerForm, location: e.target.value })} />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-600">Type</label>
                            <select
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                value={careerForm.type}
                                onChange={(e) => setCareerForm({ ...careerForm, type: e.target.value })}
                            >
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contract</option>
                            </select>
                        </div>
                    </div>
                    <Button type="submit" size="sm">Publish Career</Button>
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

"use client";

import Button from "@/components/ui/Button";
import { UserCircle } from "lucide-react";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";

export default function AdminProfilePage() {
    const { profile, updateProfile } = useAdminData();

    const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    const handleProfilePhoto = (file?: File) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        updateProfile({ photo: url });
    };

    return (
        <Section id="profile" title="Profile" icon={<UserCircle className="w-5 h-5 text-orange-500" />} description="Review your admin profile, update password, and manage 2FA.">
            <form className="space-y-3" onSubmit={handleProfileSubmit}>
                <div className="grid md:grid-cols-2 gap-3">
                    <Input label="Full Name" value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} />
                    <Input label="Email" type="email" value={profile.email} onChange={(e) => updateProfile({ email: e.target.value })} />
                    <Input label="Phone" value={profile.phone} onChange={(e) => updateProfile({ phone: e.target.value })} />
                    <Input label="Role" value={profile.role} onChange={(e) => updateProfile({ role: e.target.value })} />
                    <Input label="Location" value={profile.location} onChange={(e) => updateProfile({ location: e.target.value })} />
                    <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-xs font-medium text-slate-600">Bio</label>
                        <textarea
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                            rows={3}
                            value={profile.bio}
                            onChange={(e) => updateProfile({ bio: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-medium text-slate-600">Profile Picture</label>
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 overflow-hidden">
                                {profile.photo ? <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" /> : <UserCircle className="w-7 h-7" />}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleProfilePhoto(e.target.files?.[0])}
                                className="text-sm"
                            />
                        </div>
                    </div>
                </div>
                <Button type="submit" size="sm">Save Profile</Button>
            </form>
        </Section>
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

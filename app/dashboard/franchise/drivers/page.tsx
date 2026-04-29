"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Users, UserPlus, Phone, Mail, Lock, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { jsonHeaders } from "@/lib/api-client";

type DriverProfile = {
    id: number;
    user: {
        id: number;
        email: string;
        full_name: string;
    };
    phone: string;
    license_number?: string;
};

const normalizeList = <T,>(data: unknown): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && Array.isArray((data as { results?: unknown[] }).results)) {
        return (data as { results: T[] }).results;
    }
    return [];
};

export default function DriverManagementPage() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();
    const [drivers, setDrivers] = useState<DriverProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
        full_name: "",
        phone: "",
    });

    const loadDrivers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authFetch<unknown>("/students/franchise/drivers/");
            setDrivers(normalizeList<DriverProfile>(data));
        } catch {
            setDrivers([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        void loadDrivers();
    }, [loadDrivers]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await authFetch("/students/franchise/drivers/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify(form),
            });
            showToast("Driver account created successfully", "success");
            setForm({ email: "", password: "", full_name: "", phone: "" });
            await loadDrivers();
        } catch (err: any) {
            showToast(err?.message || "Failed to create driver account", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this driver account? This will also remove their user login.")) return;
        try {
            await authFetch(`/students/franchise/drivers/${id}/`, { method: "DELETE" });
            showToast("Driver account deleted", "success");
            await loadDrivers();
        } catch {
            showToast("Failed to delete account", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
                    <ShieldCheck className="w-7 h-7 text-blue-600" />
                    Driver Management
                </h1>
                <p className="text-sm text-[#374151] mt-1">
                    Manage driver accounts for transport tracking. Drivers can login using these credentials on the driver app.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Creation Form */}
                <section className="lg:col-span-1 h-fit bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#F3F4F6]">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        <h2 className="font-bold text-[#111827]">Add New Driver</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Full Name</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    required
                                    value={form.full_name}
                                    onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))}
                                    placeholder="John Doe"
                                    className="w-full rounded-xl border border-[#E5E7EB] pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                                    placeholder="driver@example.com"
                                    className="w-full rounded-xl border border-[#E5E7EB] pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    required
                                    value={form.phone}
                                    onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                                    placeholder="+91 9876543210"
                                    className="w-full rounded-xl border border-[#E5E7EB] pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    required
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-[#E5E7EB] pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-md transform active:scale-[0.98] transition-all font-semibold">
                            {submitting ? "Creating..." : "Create Account"}
                        </Button>
                    </form>
                </section>

                {/* Driver List */}
                <section className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">Existing Drivers ({drivers.length})</h2>
                        <button onClick={() => void loadDrivers()} className="text-xs text-blue-600 hover:underline font-medium">Refresh List</button>
                    </div>

                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    )}

                    {!loading && drivers.length === 0 && (
                        <div className="bg-white border border-dashed border-[#E5E7EB] rounded-2xl py-12 text-center">
                            <Users className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
                            <p className="text-[#6B7280]">No driver accounts found.</p>
                        </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                        {drivers.map((d) => (
                            <div key={d.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative">
                                <button 
                                    onClick={() => void handleDelete(d.id)}
                                    className="absolute top-4 right-4 p-2 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-bold text-[#111827] text-lg">{d.user?.full_name}</h3>
                                        <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold uppercase tracking-tight">
                                            <ShieldCheck className="w-3 h-3" />
                                            Active Driver Account
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                                            <Mail className="w-4 h-4 text-[#9CA3AF]" />
                                            <span className="truncate">{d.user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                                            <Phone className="w-4 h-4 text-[#9CA3AF]" />
                                            <span>{d.phone}</span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-[#F3F4F6]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-[#6B7280] uppercase">Authorized for Transport</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

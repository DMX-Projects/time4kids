"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { Shield, Building2, Users } from "lucide-react";

export default function UniversalLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [email, setEmail] = useState("admin@test.com");
    const [password, setPassword] = useState("Admin@123");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const next = searchParams.get("next");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const user = await login(email, password);
            const destination = next || `/dashboard/${user.role}`;
            router.replace(destination);
        } catch (err: any) {
            setError(err?.message || "Unable to login");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                    <div className="relative w-48 h-20">
                        <Image src="/logo.jpg" alt="T.I.M.E. Kids Logo" fill sizes="(max-width: 768px) 192px, 240px" className="object-contain" priority />
                    </div>
                    <h1 className="font-display text-4xl font-bold text-[#003366]">Welcome back</h1>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Use your email and password to access your dashboard. You will be automatically redirected based on your role.
                    </p>

                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="rounded-2xl bg-white shadow p-4 border border-orange-100">
                            <div className="flex items-center gap-2 text-orange-600 font-semibold"><Shield className="w-5 h-5" /> Admin</div>
                            <p className="text-xs text-gray-600 mt-2">admin@test.com / Admin@123</p>
                        </div>
                        <div className="rounded-2xl bg-white shadow p-4 border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-600 font-semibold"><Building2 className="w-5 h-5" /> Franchise</div>
                            <p className="text-xs text-gray-600 mt-2">franchise@test.com / Franchise@123</p>
                        </div>
                        <div className="rounded-2xl bg-white shadow p-4 border border-emerald-100">
                            <div className="flex items-center gap-2 text-emerald-600 font-semibold"><Users className="w-5 h-5" /> Parent</div>
                            <p className="text-xs text-gray-600 mt-2">parent@test.com / Parent@123</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Your password"
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
                        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                            {submitting ? "Signing in..." : "Login"}
                        </Button>
                    </form>
                    <p className="text-xs text-gray-500 mt-4">You will be redirected to your role-based dashboard after login.</p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { Eye, EyeOff, LifeBuoy, Settings } from "lucide-react";

export type LoginPageVariant = "default" | "parent" | "franchise";

const copy: Record<
    LoginPageVariant,
    { title: string; subtitle: string; leftTitle: string; leftBody: string }
> = {
    default: {
        title: "Sign In",
        subtitle: "Enter your credentials to continue",
        leftTitle: "Welcome Back",
        leftBody: "Sign in to access your dashboard and manage your account.",
    },
    parent: {
        title: "Parent sign in",
        subtitle: "Use the email and password from your centre",
        leftTitle: "Parent portal",
        leftBody: "View your child’s progress, marks, and centre updates.",
    },
    franchise: {
        title: "Franchise sign in",
        subtitle: "Centre dashboard access",
        leftTitle: "Centre operations",
        leftBody: "Manage parents, events, grades, and resources for your preschool.",
    },
};

function LoginForm({ variant }: { variant: LoginPageVariant }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const next = searchParams.get("next");
    const c = copy[variant];

    const authPath =
        variant === "parent" ? "/auth/parent/login/" : "/auth/login/";

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSubmitting(true);
        try {
            const user = await login(identifier, password, { authPath });
            setSubmitting(false);
            setSuccess("✅ Login successful!");
            setTimeout(() => {
                const destination = next || `/dashboard/${user.role}`;
                router.replace(destination);
            }, 1500);
        } catch {
            setError("❌ Invalid credentials");
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
                <div className="relative h-full min-h-[400px] md:min-h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-blue-50 flex flex-col justify-center p-12 space-y-6">
                        <div className="relative w-56 h-24 mx-auto flex items-center justify-center">
                            <Image
                                src="/time-kids-logo-new.png"
                                alt="T.I.M.E. Kids Logo"
                                fill
                                sizes="(max-width: 768px) 224px, 280px"
                                className="object-contain"
                                priority
                            />
                        </div>
                        <h1 className="font-display text-5xl font-bold text-[#003366] leading-tight">{c.leftTitle}</h1>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-md">{c.leftBody}</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-blue-500 rounded-2xl shadow-lg mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">{c.title}</h2>
                            <p className="text-gray-500">{c.subtitle}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Email or Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="you@example.com or username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {success && !submitting && (
                                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 animate-pulse">
                                    <span className="font-medium">{success}</span>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                disabled={submitting || !!success}
                            >
                                {success ? (
                                    <span className="flex items-center justify-center gap-2">Success! Redirecting…</span>
                                ) : submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Signing In...
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>

                            <div className="pt-2 text-center space-y-2">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors duration-200"
                                >
                                    Forgot your password?
                                </Link>
                                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-gray-500 pt-2 border-t border-gray-100">
                                    {variant !== "default" && (
                                        <Link href="/login/" className="text-orange-600 hover:underline font-medium">
                                            Universal login
                                        </Link>
                                    )}
                                    {variant !== "parent" && (
                                        <Link href="/login/parents/" className="text-orange-600 hover:underline font-medium">
                                            Parent login
                                        </Link>
                                    )}
                                    {variant !== "franchise" && (
                                        <Link href="/login/franchise/" className="text-orange-600 hover:underline font-medium">
                                            Franchise login
                                        </Link>
                                    )}
                                </div>
                                {variant === "parent" && (
                                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3 text-sm text-gray-600">
                                        <Link
                                            href="/contact"
                                            className="inline-flex items-center gap-1.5 font-medium text-gray-700 hover:text-orange-600 transition-colors"
                                        >
                                            <LifeBuoy className="w-4 h-4 shrink-0" aria-hidden />
                                            Support
                                        </Link>
                                        <Link
                                            href="/faq"
                                            className="inline-flex items-center gap-1.5 font-medium text-gray-700 hover:text-orange-600 transition-colors"
                                            title="Help and account information"
                                        >
                                            <Settings className="w-4 h-4 shrink-0" aria-hidden />
                                            Settings
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </form>

                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                <span>Secure login with encryption</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LoginPageContent({ variant }: { variant: LoginPageVariant }) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-400" />
                </div>
            }
        >
            <LoginForm variant={variant} />
        </Suspense>
    );
}

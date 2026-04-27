"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { apiUrl, jsonHeaders } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;

export default function RegisterPage() {
    const { showToast } = useToast();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [username, setUsername] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [resetUrl, setResetUrl] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const normalizedPhone = phone.replace(/\D/g, "").trim();
        const trimmedUsername = username.trim();

        if (trimmedName.length < 2) {
            setValidationError("Full name must be at least 2 characters.");
            return;
        }
        if (!EMAIL_REGEX.test(trimmedEmail)) {
            setValidationError("Please enter a valid email address.");
            return;
        }
        if (!PHONE_REGEX.test(normalizedPhone)) {
            setValidationError("Phone number must be 10 digits and start with 6, 7, 8, or 9.");
            return;
        }
        if (trimmedUsername && !USERNAME_REGEX.test(trimmedUsername)) {
            setValidationError("Username must be 3-30 characters and can include letters, numbers, dot, underscore, and hyphen.");
            return;
        }

        setValidationError(null);
        setSubmitting(true);
        setResetUrl(null);
        try {
            const res = await fetch(apiUrl("/auth/register/"), {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    full_name: trimmedName,
                    email: trimmedEmail,
                    phone: normalizedPhone,
                    username: trimmedUsername || undefined,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                showToast(data?.detail || "Registration failed. Please try again.", "error");
                return;
            }
            setResetUrl(data?.reset_url || null);
            showToast(data?.detail || "Registration successful.", "success");
        } catch {
            showToast("Registration failed. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Register first, then set your password from the reset link.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            type="text"
                            required
                            placeholder="Your full name"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            type="tel"
                            required
                            placeholder="9876543210"
                            inputMode="numeric"
                            maxLength={10}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Username (optional)</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            placeholder="Choose a username (optional)"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white"
                        />
                    </div>

                    {validationError && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {validationError}
                        </p>
                    )}

                    <Button
                        type="submit"
                        size="lg"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold text-lg py-4 rounded-xl"
                    >
                        {submitting ? "Registering..." : "Register"}
                    </Button>
                </form>

                {resetUrl && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 space-y-3">
                        <p className="font-semibold">
                            Registration completed. Set your password using the reset link below:
                        </p>
                        <a
                            href={resetUrl}
                            className="inline-flex items-center rounded-lg bg-green-600 text-white px-4 py-2 font-semibold hover:bg-green-700"
                        >
                            Open Reset Password Link
                        </a>
                        <p className="text-xs break-all">{resetUrl}</p>
                    </div>
                )}

                <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-100">
                    Already have an account?{" "}
                    <Link href="/login/" className="text-orange-600 font-medium hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}


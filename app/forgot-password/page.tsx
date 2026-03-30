'use client';

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { apiUrl, jsonHeaders } from "@/lib/api-client";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { showToast } = useToast();

    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(apiUrl("/auth/password-reset/"), {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ email }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                showToast(data?.detail || "Could not request reset. Please try again.", "error");
                return;
            }

            showToast(data?.detail || "Reset instructions sent. Please check your email.", "success");
        } catch {
            showToast("Could not request reset. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Forgot Password</h1>
                <p className="text-sm text-gray-600 text-center mb-8">Enter your email and we will send reset instructions.</p>

                <form onSubmit={onSubmit} className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                        />
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 disabled:opacity-60"
                    >
                        {submitting ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <div className="pt-2 text-center text-sm text-gray-600">
                        Remembered your password?{" "}
                        <button type="button" className="text-orange-600 font-medium hover:underline" onClick={() => router.replace("/login/")}>
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


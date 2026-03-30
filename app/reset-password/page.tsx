'use client';

import { Suspense, useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { apiUrl, jsonHeaders } from "@/lib/api-client";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    const [uid, setUid] = useState("");
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setUid(searchParams.get("uid") || "");
        setToken(searchParams.get("token") || "");
    }, [searchParams]);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!uid.trim() || !token.trim()) {
            showToast("Reset link is missing uid/token.", "error");
            return;
        }
        if (newPassword.length < 8) {
            showToast("Password must be at least 8 characters.", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast("Passwords do not match.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(apiUrl("/auth/password-reset-confirm/"), {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    uid,
                    token,
                    new_password: newPassword,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                showToast(data?.detail || "Could not reset password. Try again.", "error");
                return;
            }

            showToast(data?.detail || "Password reset successful.", "success");
            router.replace("/login/");
        } catch {
            showToast("Could not reset password. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Reset Password</h1>
                <p className="text-sm text-gray-600 text-center mb-8">Enter a new password to complete the reset.</p>

                <form onSubmit={onSubmit} className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 disabled:opacity-60"
                    >
                        {submitting ? "Saving..." : "Reset Password"}
                    </Button>

                    {/* Hidden fields summary - kept for clarity in case link params are missing */}
                    <div className="text-xs text-gray-500 break-all pt-2">
                        UID: {uid ? "Provided" : "Missing"} | Token: {token ? "Provided" : "Missing"}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-400" />
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}


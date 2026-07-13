"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, UserCircle, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";

function ProfileRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <dt className="text-xs font-medium text-orange-600 shrink-0">{label}</dt>
            <dd className="text-sm text-orange-900 sm:text-right break-words">{value || "—"}</dd>
        </div>
    );
}

function Input({
    label,
    className = "",
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
    return (
        <label className={`flex flex-col gap-1 text-xs font-medium text-orange-700 ${className}`}>
            {label}
            <input
                {...props}
                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-orange-900 focus:border-orange-400 focus:outline-none disabled:opacity-60"
            />
        </label>
    );
}

export default function ParentSettingsPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const {
        parentProfile,
        updateParentProfile,
        parentProfileLoading,
        parentProfileError,
        reloadParentProfile,
        linkedStudents,
        studentsLoading,
    } = useParentData();
    const muted = Boolean(parentProfile.notifications_muted);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        address: "",
    });
    const [saving, setSaving] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        setForm({
            name: parentProfile.name,
            email: parentProfile.email || user?.email || "",
            phone: parentProfile.phone,
            city: parentProfile.city,
            address: parentProfile.address,
        });
    }, [parentProfile, user]);

    const displayEmail = parentProfile.email || user?.email || "—";

    const toggleMute = async () => {
        try {
            await updateParentProfile({ notifications_muted: !muted });
        } catch {
            /* updateParentProfile reloads profile on failure */
        }
    };

    const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setSaveFeedback(null);
        const phone = form.phone.replace(/\D/g, "");
        if (phone && phone.length !== 10) {
            const message = "Mobile must be exactly 10 digits.";
            setSaveFeedback({ type: "error", message });
            showToast(message, "error");
            setSaving(false);
            return;
        }
        try {
            await updateParentProfile({
                name: form.name.trim(),
                email: form.email.trim(),
                phone,
                city: form.city.trim(),
                address: form.address.trim(),
            });
            const message = "Your changes were saved successfully.";
            setSaveFeedback({ type: "success", message });
            showToast(message, "success");
            requestAnimationFrame(() => {
                document.getElementById("settings-save-feedback")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Could not save. Contact your centre if this continues.";
            setSaveFeedback({ type: "error", message });
            showToast(message, "error");
        } finally {
            setSaving(false);
        }
    };

    const onLogout = () => {
        logout();
        if (typeof window !== "undefined") {
            window.location.replace("/login/");
            return;
        }
        router.replace("/login/");
    };

    return (
        <div className="space-y-6 max-w-lg">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Settings className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Settings</h1>
                        <p className="text-sm text-orange-700">Your login profile, preferences, and logout.</p>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                        <UserCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-orange-900">Your account</h2>
                        <p className="text-xs text-orange-700">Your home contact details. Email and preschool centre info are shown separately below.</p>
                    </div>
                </div>

                {parentProfileError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 space-y-2">
                        <p>Could not load full profile from the server: {parentProfileError}</p>
                        <button
                            type="button"
                            onClick={() => void reloadParentProfile()}
                            className="text-xs font-semibold underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {parentProfileLoading ? (
                    <p className="text-sm text-orange-700">Loading your profile…</p>
                ) : (
                    <form className="space-y-3" onSubmit={handleSaveProfile}>
                        <div className="grid gap-3">
                            <Input
                                label="Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Email / login"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                title="Used to log in and receive notifications"
                            />
                            <Input
                                label="Mobile"
                                type="tel"
                                inputMode="numeric"
                                pattern="\d{10}"
                                maxLength={10}
                                title="Enter exactly 10 digits"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                            />
                            <Input
                                label="Home city"
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                                placeholder="City where you live"
                            />
                            <Input
                                label="Home address"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="House / flat, street, area — not the preschool address"
                            />
                        </div>

                        {(parentProfile.franchiseName || parentProfile.franchisePhone || parentProfile.franchiseEmail) && (
                            <dl className="space-y-2 rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Your preschool centre</p>
                                {parentProfile.franchiseName && <ProfileRow label="Centre" value={parentProfile.franchiseName} />}
                                {parentProfile.franchisePhone && (
                                    <ProfileRow label="Centre phone" value={parentProfile.franchisePhone} />
                                )}
                                {parentProfile.franchiseEmail && (
                                    <ProfileRow label="Centre email" value={parentProfile.franchiseEmail} />
                                )}
                            </dl>
                        )}

                        <div className="flex flex-wrap gap-2">
                            <Button type="submit" size="sm" disabled={saving}>
                                {saving ? "Saving…" : "Save changes"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={saving}
                                onClick={() => {
                                    setSaveFeedback(null);
                                    setForm({
                                        name: parentProfile.name,
                                        email: parentProfile.email || user?.email || "",
                                        phone: parentProfile.phone,
                                        city: parentProfile.city,
                                        address: parentProfile.address,
                                    });
                                }}
                            >
                                Reset
                            </Button>
                        </div>

                        {saveFeedback && (
                            <div
                                id="settings-save-feedback"
                                role="status"
                                aria-live="polite"
                                className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                                    saveFeedback.type === "success"
                                        ? "border-green-200 bg-green-50 text-green-800"
                                        : "border-red-200 bg-red-50 text-red-800"
                                }`}
                            >
                                {saveFeedback.type === "success" ? (
                                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
                                ) : (
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
                                )}
                                <p className="font-medium">{saveFeedback.message}</p>
                            </div>
                        )}
                    </form>
                )}

                {!studentsLoading && linkedStudents.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-orange-100">
                        <p className="text-xs font-medium text-orange-600 pt-3">
                            Linked {linkedStudents.length === 1 ? "child" : "children"}
                        </p>
                        <ul className="space-y-2">
                            {linkedStudents.map((student) => (
                                <li
                                    key={student.id}
                                    className="rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm text-orange-900"
                                >
                                    <span className="font-medium">{student.name || "—"}</span>
                                    {(student.grade || student.section) && (
                                        <span className="text-orange-700">
                                            {" "}
                                            · {[student.grade, student.section && `Section ${student.section}`]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            <div className="rounded-2xl border border-orange-100 bg-white p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="font-medium text-orange-900 text-sm">Mute announcement highlights</p>
                        <p className="text-xs text-orange-700">Stops emphasis on notification-style alerts in the app (content still available).</p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={muted}
                        disabled={parentProfileLoading || saving}
                        onClick={() => void toggleMute()}
                        className={`relative h-8 w-14 rounded-full transition-colors ${muted ? "bg-orange-400" : "bg-gray-200"}`}
                    >
                        <span
                            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${muted ? "left-7" : "left-1"}`}
                        />
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
                <Button
                    type="button"
                    onClick={onLogout}
                    className="w-full bg-[#FF922B] hover:brightness-105 text-white flex items-center justify-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}

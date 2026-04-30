"use client";

import type React from "react";
import { useState } from "react";
import { Pencil, Save, User, Users, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";
import Button from "@/components/ui/Button";

export default function ParentDetailsPage() {
    const { user } = useAuth();
    const { parentProfile, parentProfileLoading, linkedStudents, updateChildInfo } = useParentData();

    return (
        <div className="space-y-6">
            {/* Parent details card (read-only) */}
            <Section
                id="parent-details"
                title="Parent / guardian details"
                description="Your contact information on file with the centre."
                icon={<User className="w-5 h-5 text-orange-600" />}
            >
                <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-5">
                    {parentProfileLoading ? (
                        <p className="text-sm text-orange-700">Loading your details…</p>
                    ) : (
                        <dl className="grid gap-3 text-sm text-orange-900">
                            <Row label="Name" value={parentProfile.name || user?.fullName || "—"} />
                            <Row label="Email" value={parentProfile.email || user?.email || "—"} />
                            <Row label="Mobile" value={parentProfile.phone || "—"} />
                            <Row label="City" value={parentProfile.city || "—"} />
                            <Row label="Address" value={parentProfile.address || "—"} />
                        </dl>
                    )}
                </div>
            </Section>

            {/* Editable kids section */}
            <Section
                id="kids-details"
                title="Children's details"
                description="You can edit your child's first and last name here. Class, roll number, and other records are managed by your centre."
                icon={<Users className="w-5 h-5 text-orange-600" />}
            >
                {linkedStudents.length === 0 ? (
                    <p className="text-sm text-orange-700">
                        No students linked yet — contact your centre to add your child.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {linkedStudents.map((student) => (
                            <ChildEditCard
                                key={student.id}
                                student={student}
                                updateChildInfo={updateChildInfo}
                            />
                        ))}
                    </div>
                )}
            </Section>

            {/* Centre info */}
            {(parentProfile.franchiseName || parentProfile.franchisePhone || parentProfile.franchiseEmail) && (
                <div className="rounded-2xl bg-orange-50/80 border border-orange-100 p-5 space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-orange-700">Your centre</p>
                    {parentProfile.franchiseName && (
                        <p className="text-sm text-orange-900 font-medium">{parentProfile.franchiseName}</p>
                    )}
                    {parentProfile.franchisePhone && (
                        <p className="text-sm text-orange-800">
                            Phone: <a href={`tel:${parentProfile.franchisePhone}`} className="underline">{parentProfile.franchisePhone}</a>
                        </p>
                    )}
                    {parentProfile.franchiseEmail && (
                        <p className="text-sm text-orange-800">
                            Email: <a href={`mailto:${parentProfile.franchiseEmail}`} className="underline">{parentProfile.franchiseEmail}</a>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

/* ── Child edit card ─────────────────────────────────────────── */
function ChildEditCard({
    student,
    updateChildInfo,
}: {
    student: { id: string; name: string; grade: string; section: string; rollNumber: string };
    updateChildInfo: (studentId: string, firstName: string, lastName: string) => Promise<void>;
}) {
    const nameParts = (student.name || "").trim().split(/\s+/);
    const [editing, setEditing] = useState(false);
    const [firstName, setFirstName] = useState(nameParts[0] || "");
    const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const validate = () => {
        if (!firstName.trim()) return "First name is required.";
        if (!/^[A-Za-z\s'.,-]+$/.test(firstName)) return "First name must contain letters only.";
        if (lastName && !/^[A-Za-z\s'.,-]+$/.test(lastName)) return "Last name must contain letters only.";
        return null;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMsg(null);
        const err = validate();
        if (err) { setError(err); return; }
        setSaving(true);
        try {
            await updateChildInfo(student.id, firstName, lastName);
            setMsg("Saved successfully.");
            setEditing(false);
        } catch {
            setError("Could not save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        const parts = (student.name || "").trim().split(/\s+/);
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
        setError(null);
        setMsg(null);
        setEditing(false);
    };

    return (
        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-700 font-bold text-base">
                        {(firstName?.[0] || "?").toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-orange-900">{student.name || "—"}</p>
                        <p className="text-xs text-orange-600">
                            {[
                                student.grade,
                                student.section && `Section ${student.section}`,
                                student.rollNumber && `Roll: ${student.rollNumber}`,
                            ]
                                .filter(Boolean)
                                .join(" · ") || "Details managed by centre"}
                        </p>
                    </div>
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" /> Edit name
                    </button>
                )}
            </div>

            {editing && (
                <form onSubmit={handleSave} className="space-y-3 pt-1 border-t border-orange-50">
                    {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                    {msg && <p className="text-xs text-green-700 font-medium">{msg}</p>}
                    <div className="grid sm:grid-cols-2 gap-3">
                        <FieldInput
                            label="First name"
                            value={firstName}
                            onChange={(v) => setFirstName(v)}
                            placeholder="First name"
                            disabled={saving}
                        />
                        <FieldInput
                            label="Last name"
                            value={lastName}
                            onChange={(v) => setLastName(v)}
                            placeholder="Last name"
                            disabled={saving}
                        />
                    </div>
                    <p className="text-xs text-orange-600/70">
                        ℹ Class, roll number, and attendance records are managed by your centre and cannot be edited here.
                    </p>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={saving}>
                            {saving ? "Saving…" : <><Save className="w-3.5 h-3.5 inline mr-1" />Save</>}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
                            <X className="w-3.5 h-3.5 inline mr-1" />Cancel
                        </Button>
                    </div>
                </form>
            )}
            {msg && !editing && (
                <p className="text-xs text-green-700 font-medium border-t border-orange-50 pt-2">{msg}</p>
            )}
        </div>
    );
}

/* ── Helper components ────────────────────────────────────────── */
function FieldInput({
    label,
    value,
    onChange,
    placeholder,
    disabled,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
}) {
    return (
        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
            {label}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value.replace(/[^A-Za-z\s'.,-]/g, ""))}
                placeholder={placeholder}
                disabled={disabled}
                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-orange-900 focus:border-orange-400 focus:outline-none disabled:opacity-60"
            />
        </label>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-wrap gap-2 border-b border-orange-50 pb-2 last:border-0 last:pb-0">
            <dt className="font-semibold text-orange-700 min-w-[8rem]">{label}</dt>
            <dd className="text-orange-900">{value}</dd>
        </div>
    );
}

function Section({
    id,
    title,
    description,
    icon,
    children,
}: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    children?: React.ReactNode;
}) {
    return (
        <section id={id} className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">{icon}</div>
                <div>
                    <h2 className="text-lg font-semibold text-orange-900">{title}</h2>
                    <p className="text-sm text-orange-700">{description}</p>
                </div>
            </div>
            {children && <div>{children}</div>}
        </section>
    );
}

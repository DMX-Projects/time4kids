"use client";

import type React from "react";
import { User, Users } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";
import { formatStudentGenderLabel, studentRelationLabel } from "@/lib/student-gender";

export default function ParentDetailsPage() {
    const { user } = useAuth();
    const { parentProfile, parentProfileLoading, linkedStudents, studentsLoading } = useParentData();

    return (
        <div className="space-y-6">
            <Section
                id="parent-details"
                title="Parent / guardian details"
                description="Filled automatically from your TiKES / centre record. To update your contact details, use Settings."
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
                            <Row label="Home city" value={parentProfile.city || "—"} />
                            <Row label="Home address" value={parentProfile.address || "—"} />
                        </dl>
                    )}
                </div>
            </Section>

            <Section
                id="kids-details"
                title="Children's details"
                description="Shown from your centre / TiKES record. Names, class, and roll number are managed by your preschool."
                icon={<Users className="w-5 h-5 text-orange-600" />}
            >
                {studentsLoading ? (
                    <p className="text-sm text-orange-700">Loading children&apos;s details…</p>
                ) : linkedStudents.length === 0 ? (
                    <p className="text-sm text-orange-700">
                        No students linked yet — contact your centre to add your child. If you just paid fees in TiKES,
                        ask the centre to confirm your login is activated.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {linkedStudents.map((student) => (
                            <ChildReadOnlyCard key={student.id} student={student} />
                        ))}
                    </div>
                )}
            </Section>

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

function ChildReadOnlyCard({
    student,
}: {
    student: {
        name: string;
        grade: string;
        section: string;
        rollNumber: string;
        gender?: "" | "M" | "F";
    };
}) {
    const initial = (student.name || "?").trim()[0]?.toUpperCase() || "?";

    return (
        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-700 font-bold text-base">
                    {initial}
                </div>
                <div>
                    <p className="text-sm font-semibold text-orange-900">{student.name || "—"}</p>
                    <p className="text-xs text-orange-600">
                        {[
                            studentRelationLabel(student.gender),
                            formatStudentGenderLabel(student.gender) !== "—"
                                ? formatStudentGenderLabel(student.gender)
                                : null,
                            student.grade,
                            student.section && `Section ${student.section}`,
                            student.rollNumber && `Roll: ${student.rollNumber}`,
                        ]
                            .filter(Boolean)
                            .join(" · ") || "Details managed by centre"}
                    </p>
                </div>
            </div>
        </div>
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

"use client";

import type React from "react";
import { User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

export default function StudentProfilePage() {
    const { user } = useAuth();
    const { getStudentsForParent } = useSchoolData();
    const { studentProfile } = useParentData();
    const linkedStudents = getStudentsForParent(user?.id || "parent-1");
    const fallbackStudent = linkedStudents.length === 0 ? [studentProfile] : linkedStudents;

    return (
        <div className="space-y-6">
            <Section
                id="student-profile"
                title="Student Profile"
                description="View your child's personal details and class info. Franchise-managed and read-only."
                icon={<User className="w-5 h-5 text-orange-600" />}
            >
                <p className="text-sm text-orange-700">For updates, please reach out to your franchise. Parent edits are limited to the parent profile page.</p>
            </Section>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {fallbackStudent.map((stu, idx) => (
                    <div key={"id" in stu ? stu.id : `fallback-${idx}`} className="bg-white border border-orange-100 rounded-xl p-4 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-orange-900 text-sm">{"name" in stu ? stu.name : studentProfile.name}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">{"grade" in stu ? stu.grade : studentProfile.grade}</span>
                        </div>
                        <p className="text-xs text-orange-700">Section: {"section" in stu ? stu.section || "-" : studentProfile.section}</p>
                        <p className="text-xs text-orange-700">Roll: {"rollNumber" in stu ? stu.rollNumber || "-" : "-"}</p>
                        <p className="text-xs text-orange-700">Emergency: {"parentId" in stu ? "Refer franchise records" : studentProfile.emergency}</p>
                        <p className="text-xs text-orange-700">Blood Group: {"blood" in stu ? stu.blood || "-" : studentProfile.blood}</p>
                    </div>
                ))}
                {fallbackStudent.length === 0 && <p className="text-sm text-orange-700">No student records found for this account.</p>}
            </div>
        </div>
    );
}

function Section({ id, title, description, icon, children }: { id: string; title: string; description: string; icon: React.ReactNode; children?: React.ReactNode }) {
    return (
        <section id={id} className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-orange-900">{title}</h2>
                    <p className="text-sm text-orange-700">{description}</p>
                </div>
            </div>
            {children && <div>{children}</div>}
        </section>
    );
}

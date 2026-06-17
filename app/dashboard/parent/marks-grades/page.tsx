"use client";

import type React from "react";
import { ClipboardList } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";
import type { GradeRecord } from "@/components/dashboard/shared/SchoolDataProvider";
import { mapApiGrade, normalizeApiList } from "@/lib/parent-school-api";
import { formatStudentClassCaption } from "@/lib/parent-dashboard-utils";

export default function MarksGradesPage() {
    const { user, authFetch } = useAuth();
    const { selectedStudent, hasMultipleChildren, linkedStudents, studentScopeReady, scopedApiPath } = useParentData();
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentScopeReady || !selectedStudent) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const data = await authFetch<unknown>(scopedApiPath("/students/parent/grades/"));
                const mapped = normalizeApiList(data).map((g) =>
                    mapApiGrade(g, selectedStudent.id),
                );
                if (!cancelled) setGrades(mapped);
            } catch {
                if (!cancelled) setGrades([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [authFetch, scopedApiPath, selectedStudent, studentScopeReady]);

    const displayStudents = useMemo(() => {
        if (selectedStudent && hasMultipleChildren) return [selectedStudent];
        if (linkedStudents.length > 0) return linkedStudents;
        return [];
    }, [selectedStudent, hasMultipleChildren, linkedStudents]);

    const gradesByStudent = displayStudents.map((stu) => ({
        student: stu,
        grades: grades.filter((g) => g.studentId === stu.id),
    }));

    return (
        <div className="space-y-6">
            <Section
                id="marks-grades"
                title="Marks / Grades"
                description={
                    hasMultipleChildren && selectedStudent
                        ? `Marks shared by your centre for ${selectedStudent.name}. Switch child from the header.`
                        : "Viewing marks shared by your centre."
                }
                icon={<ClipboardList className="w-5 h-5 text-orange-600" />}
            />

            {loading && <p className="text-sm text-orange-700">Loading grades…</p>}

            {gradesByStudent.map(({ student, grades: studentGrades }) => (
                <div key={student.id} className="bg-white border border-orange-100 rounded-2xl shadow-sm p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-orange-900">{student.name}</p>
                            <p className="text-xs text-orange-700">
                                Roll: {student.rollNumber || "—"} · {formatStudentClassCaption(student)}
                            </p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                            {studentGrades.length} subjects
                        </span>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {studentGrades.map((row) => (
                            <div key={row.id} className="border border-orange-100 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-orange-900 text-sm">{row.subject}</p>
                                    <p className="text-xs text-orange-700">{row.term}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-sm border border-orange-100">
                                        {row.grade || "Pending"}
                                    </span>
                                    {row.score !== undefined && (
                                        <span className="text-[11px] text-orange-700">Score: {row.score}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {!loading && studentGrades.length === 0 && (
                            <p className="text-sm text-orange-700">No grades shared yet.</p>
                        )}
                    </div>
                </div>
            ))}

            {!loading && gradesByStudent.length === 0 && (
                <p className="text-sm text-orange-700">
                    No students are linked to {user?.email || "your account"} yet. Please contact your centre.
                </p>
            )}
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
    description?: string;
    icon: React.ReactNode;
    children?: React.ReactNode;
}) {
    return (
        <section id={id} className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-orange-900">{title}</h2>
                    {description && <p className="text-sm text-orange-700">{description}</p>}
                </div>
            </div>
            {children && <div>{children}</div>}
        </section>
    );
}

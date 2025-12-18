"use client";

import { ClipboardList } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

export default function MarksGradesPage() {
    const { user } = useAuth();
    const { getStudentsForParent, getGradesForParent, students } = useSchoolData();
    const parentId = user?.id || "parent-1";
    const myStudents = getStudentsForParent(parentId);
    const myGrades = getGradesForParent(parentId);

    const gradesByStudent = myStudents.map((stu) => ({
        student: stu,
        grades: myGrades.filter((g) => g.studentId === stu.id),
    }));

    const hasMultiple = myStudents.length > 1;

    return (
        <div className="space-y-6">
            <Section
                id="marks-grades"
                title="Marks / Grades"
                description={hasMultiple ? "Viewing all students linked to your account." : "Viewing marks shared by your centre."}
                icon={<ClipboardList className="w-5 h-5 text-orange-600" />}
            />

            {gradesByStudent.map(({ student, grades }) => (
                <div key={student.id} className="bg-white border border-orange-100 rounded-2xl shadow-sm p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-orange-900">{student.name}</p>
                            <p className="text-xs text-orange-700">Roll: {student.rollNumber} · {student.grade} · Section {student.section || "-"}</p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">{grades.length} subjects</span>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {grades.map((row) => (
                            <div key={row.id} className="border border-orange-100 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-orange-900 text-sm">{row.subject}</p>
                                    <p className="text-xs text-orange-700">{row.term}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-sm border border-orange-100">{row.grade || "Pending"}</span>
                                    {row.score !== undefined && <span className="text-[11px] text-orange-700">Score: {row.score}</span>}
                                </div>
                            </div>
                        ))}
                        {grades.length === 0 && <p className="text-sm text-orange-700">No grades shared yet.</p>}
                    </div>
                </div>
            ))}

            {gradesByStudent.length === 0 && (
                <p className="text-sm text-orange-700">No students are linked to your account yet. Please contact your centre.</p>
            )}
        </div>
    );
}

function Section({ id, title, description, icon, children }: { id: string; title: string; description?: string; icon: React.ReactNode; children?: React.ReactNode }) {
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

import type { SchoolStudent } from "@/components/dashboard/shared/SchoolDataProvider";
import { studentGradeMatchesClassFilter } from "@/lib/student-class-match";

export function homeworkVisibleForStudent(
    row: { student?: number | null; class_name?: string | null },
    student: SchoolStudent,
): boolean {
    if (row.student != null) {
        return String(row.student) === student.id;
    }
    const className = (row.class_name || "").trim();
    if (className) {
        return studentGradeMatchesClassFilter(student.grade, className);
    }
    return true;
}

export function attendanceVisibleForStudent(
    row: { student?: number | null; student_name?: string | null },
    student: SchoolStudent,
): boolean {
    if (row.student != null) {
        return String(row.student) === student.id;
    }
    const name = (row.student_name || "").trim().toLowerCase();
    if (name) {
        return name === student.name.trim().toLowerCase();
    }
    return true;
}

export function achievementVisibleForStudent(
    row: { scope?: string; studentName?: string | null },
    student: SchoolStudent,
): boolean {
    const scope = (row.scope || "").trim().toLowerCase();
    if (!scope || scope === "centre") return true;
    if (scope === "student") {
        const target = (row.studentName || "").trim().toLowerCase();
        return !target || target === student.name.trim().toLowerCase();
    }
    return true;
}

export function gradeVisibleForStudent(row: { studentId?: string }, student: SchoolStudent): boolean {
    return row.studentId === student.id;
}

export function transportStudentVisible(studentId: number, selected: SchoolStudent): boolean {
    return String(studentId) === selected.id;
}

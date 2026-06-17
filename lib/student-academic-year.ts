import { studentGradeMatchesClassFilter } from "@/lib/student-class-match";

/** Default academic year for centre attendance marking. */
export const DEFAULT_ATTENDANCE_ACADEMIC_YEAR = "AY 2026-27";

export const ATTENDANCE_ACADEMIC_YEAR_OPTIONS = [
    DEFAULT_ATTENDANCE_ACADEMIC_YEAR,
    "AY 2025-26",
    "AY 2024-25",
    "AY 2023-24",
    "AY 2022-23",
    "AY 2021-22",
    "all",
] as const;

export type AttendanceAcademicYearFilter = (typeof ATTENDANCE_ACADEMIC_YEAR_OPTIONS)[number];

/** ``AY 2026-27`` → ``26-27`` (class_name suffix in legacy imports). */
export function academicYearClassSuffix(academicYear: string): string {
    const raw = (academicYear || "").trim();
    const match = raw.match(/(\d{2})-(\d{2})\s*$/);
    return match ? `${match[1]}-${match[2]}` : "";
}

function normalizeYearToken(value: string): string {
    return value.toLowerCase().replace(/\s+/g, "").replace(/^ay/, "");
}

/** Year tokens that belong to one academic year label (strict — no cross-year bleed). */
export function academicYearMatchTokens(academicYear: string): string[] {
    const filter = (academicYear || "").trim();
    if (!filter || filter === "all") return [];
    const suffix = academicYearClassSuffix(filter);
    const tokens = new Set<string>([normalizeYearToken(filter)]);
    if (suffix) {
        tokens.add(normalizeYearToken(suffix));
        const [y1, y2] = suffix.split("-").map((part) => parseInt(part, 10));
        if (!Number.isNaN(y1) && !Number.isNaN(y2)) {
            tokens.add(normalizeYearToken(`${2000 + y1}-${2000 + y2}`));
            tokens.add(normalizeYearToken(`${y1}-${y2}`));
        }
    }
    return Array.from(tokens).filter(Boolean);
}

/** True when a student row belongs to the selected academic year (or all years). */
export function studentMatchesAcademicYear(
    student: { grade: string; academicYear?: string },
    filterYear: string,
): boolean {
    const filter = (filterYear || "").trim();
    if (!filter || filter === "all") return true;

    const suffix = academicYearClassSuffix(filter);
    const grade = (student.grade || "").trim();
    if (suffix && grade.includes(suffix)) return true;

    const studentYear = (student.academicYear || "").trim();
    if (!studentYear) return false;

    const studentNorm = normalizeYearToken(studentYear);
    return academicYearMatchTokens(filter).some(
        (token) => token.length > 0 && (studentNorm === token || studentNorm.includes(token)),
    );
}

/** Strict roster filter for attendance — class + academic year (excludes other batches/classes). */
export function studentInAttendanceRoster(
    student: { grade: string; academicYear?: string; isActive?: boolean },
    classFilter: string,
    academicYearFilter: string,
): boolean {
    if (student.isActive === false) return false;
    const className = (classFilter || "").trim();
    if (!className) return false;
    if (!studentGradeMatchesClassFilter(student.grade, className)) return false;
    return studentMatchesAcademicYear(student, academicYearFilter);
}

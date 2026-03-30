import type { GradeRecord, SchoolStudent } from "@/components/dashboard/shared/SchoolDataProvider";

const safeId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `g-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** DRF list or array */
export function normalizeApiList(data: unknown): unknown[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
        const o = data as Record<string, unknown>;
        if (Array.isArray(o.results)) return o.results;
    }
    return [];
}

export function normalizeStudentList(data: unknown): unknown[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
        const o = data as Record<string, unknown>;
        if (Array.isArray(o.results)) return o.results;
        if (Array.isArray(o.students)) return o.students;
        if (Array.isArray(o.children)) return o.children;
        if (o.student && typeof o.student === "object") return [o.student];
    }
    return [];
}

export function mapApiStudent(raw: unknown, parentId: string): SchoolStudent {
    const r = raw as Record<string, unknown>;
    const id = String(r.id ?? r.pk ?? "");
    const fromParts =
        r.first_name != null || r.last_name != null
            ? `${String(r.first_name ?? "").trim()} ${String(r.last_name ?? "").trim()}`.trim()
            : "";
    const name =
        String(r.name ?? "").trim() ||
        String(r.full_name ?? "").trim() ||
        fromParts ||
        String(r.student_name ?? "").trim() ||
        String(r.child_name ?? "").trim() ||
        "Student";
    const rollNumber = String(r.roll_number ?? r.roll ?? r.roll_no ?? "");
    const grade = String(r.grade ?? r.class_name ?? r.grade_level ?? "");
    const section = String(r.section ?? r.section_name ?? "");
    const blood =
        r.blood_group != null
            ? String(r.blood_group)
            : r.blood != null
              ? String(r.blood)
              : undefined;
    const emergency =
        r.emergency_contact != null
            ? String(r.emergency_contact)
            : r.emergency != null
              ? String(r.emergency)
              : undefined;
    const dateOfBirth = r.date_of_birth != null ? String(r.date_of_birth) : undefined;
    return { id, name, rollNumber, grade, section, parentId, blood, emergency, dateOfBirth };
}

export function mapApiGrade(raw: unknown, fallbackStudentId: string): GradeRecord {
    const r = raw as Record<string, unknown>;
    const id = String(r.id ?? safeId());
    const studentId = String(r.student ?? r.student_id ?? fallbackStudentId);
    const subject = String(r.subject ?? r.subject_name ?? "");
    const term = String(r.term ?? r.term_name ?? r.exam_type ?? "");
    const grade = r.grade != null ? String(r.grade) : undefined;
    const score =
        typeof r.score === "number"
            ? r.score
            : r.score != null
              ? Number(r.score)
              : r.marks_obtained != null
                ? Number(r.marks_obtained)
                : undefined;
    const remarks = r.remarks != null ? String(r.remarks) : r.notes != null ? String(r.notes) : undefined;
    return { id, studentId, subject, term, grade, score, remarks };
}

/** Try to parse combined dashboard payload (shape varies by backend). */
export function parseParentDashboard(
    data: unknown,
    parentId: string,
): { students: SchoolStudent[]; grades: GradeRecord[] } | null {
    if (!data || typeof data !== "object") return null;
    const o = data as Record<string, unknown>;

    let studentsRaw = normalizeStudentList(o.students ?? o.student_list ?? o.children);
    if (studentsRaw.length === 0 && o.student && typeof o.student === "object") {
        studentsRaw = [o.student];
    }
    if (studentsRaw.length === 0) return null;

    const students = studentsRaw.map((s) => mapApiStudent(s, parentId));

    let gradesRaw: unknown[] = [];
    if (Array.isArray(o.grades)) gradesRaw = o.grades;
    else if (Array.isArray(o.grade_records)) gradesRaw = o.grade_records;
    else if (Array.isArray(o.marks)) gradesRaw = o.marks;

    const grades = gradesRaw
        .map((g) => {
            const r = g as Record<string, unknown>;
            const sid = String(r.student ?? r.student_id ?? students[0]?.id ?? "");
            return mapApiGrade(g, sid);
        })
        .filter((g) => g.studentId);

    return { students, grades };
}

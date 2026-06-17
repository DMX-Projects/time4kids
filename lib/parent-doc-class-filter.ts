import { normalizeStoredClassFilter, studentGradeMatchesClassFilter } from "@/lib/student-class-match";

export type ParentDocClassRow = {
    target_class_names?: string[];
    class_name?: string;
    category?: string;
    title?: string;
};

/** Normalized class targets stored on a parent document row. */
export function parentDocClassTargets(doc: ParentDocClassRow): string[] {
    const targets = (doc.target_class_names || [])
        .map((t) => normalizeStoredClassFilter(t))
        .filter(Boolean);
    const className = normalizeStoredClassFilter(doc.class_name || "");
    if (className && !targets.includes(className)) targets.push(className);
    return targets;
}

/** Client-side check — mirrors backend class matching for fallback list paths. */
export function parentDocVisibleForStudentGrade(
    doc: ParentDocClassRow,
    studentGrade: string | null | undefined,
): boolean {
    const grade = (studentGrade || "").trim();
    const targets = parentDocClassTargets(doc);
    if (!targets.length) return true;
    if (!grade) return false;
    return targets.some((t) => studentGradeMatchesClassFilter(grade, t));
}

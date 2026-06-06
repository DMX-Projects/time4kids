import { CENTRE_PROGRAM_LABELS } from "@/config/centre-program-cards-defaults";

const LEGACY_CLASS_YEAR_SUFFIX = /\s+\d{2}-\d{2}$/;

export const CENTRE_CLASS_LABELS = CENTRE_PROGRAM_LABELS.map((p) => p.label);

function stripLegacyClassYear(className: string): string {
    return className.replace(LEGACY_CLASS_YEAR_SUFFIX, "").trim();
}

/** Map legacy/import class strings (e.g. ``PP1 25-26``) to centre program labels. */
export function canonicalClassLabel(className: string): string | null {
    const raw = (className || "").trim();
    if (!raw) return null;
    if (CENTRE_CLASS_LABELS.includes(raw)) return raw;

    const core = stripLegacyClassYear(raw);
    const norm = core.toLowerCase().replace(/_/g, " ").replace(/-/g, " ").trim();
    const compact = norm.replace(/[^a-z0-9]/g, "");

    if (norm.startsWith("play group") || compact.startsWith("playgroup")) return "Play Group";
    if (norm.startsWith("nursery") || norm.startsWith("refresher course nur")) return "Nursery";
    if (/pp\s*1/.test(norm) || compact.startsWith("pp1")) return "PP-1 / Junior KG / LKG";
    if (/pp\s*2/.test(norm) || compact.startsWith("pp2")) return "PP-2 / Senior KG / UKG";
    if (norm.startsWith("summer camp") || norm.startsWith("summer program") || norm.includes("day care")) {
        return "Summer Programs / Day Care";
    }

    const coreLower = core.toLowerCase();
    for (const label of CENTRE_CLASS_LABELS) {
        const labelLower = label.toLowerCase();
        if (labelLower.includes(coreLower) || coreLower.includes(labelLower)) return label;
    }
    return null;
}

/** True when a student's class should appear under the selected class filter. */
export function studentGradeMatchesClassFilter(studentGrade: string, filter: string): boolean {
    if (!filter) return true;
    const grade = (studentGrade || "").trim();
    if (!grade) return false;
    if (grade === filter) return true;

    const gradeCanon = canonicalClassLabel(grade);
    const filterCanon = canonicalClassLabel(filter);
    if (gradeCanon && filterCanon) return gradeCanon === filterCanon;
    if (gradeCanon === filter || filterCanon === grade) return true;

    const gl = grade.toLowerCase();
    const fl = filter.toLowerCase();
    return gl === fl || gl.includes(fl) || fl.includes(gl);
}

/** Centre program labels plus any distinct grades already on student rows. */
export function mergeClassOptions(studentGrades: string[]): string[] {
    const set = new Set<string>(CENTRE_CLASS_LABELS);
    for (const grade of studentGrades) {
        const g = (grade || "").trim();
        if (g) set.add(g);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** Student gender codes stored in API (`gender` field on StudentProfile). */
export type StudentGender = "M" | "F" | "";

export function normalizeStudentGender(raw: unknown): StudentGender {
    const v = String(raw ?? "")
        .trim()
        .toUpperCase();
    if (v === "M" || v === "MALE") return "M";
    if (v === "F" || v === "FEMALE") return "F";
    return "";
}

export function formatStudentGenderLabel(gender: StudentGender | string | undefined): string {
    const g = normalizeStudentGender(gender);
    if (g === "M") return "Male";
    if (g === "F") return "Female";
    return "—";
}

/** Parent-facing relation label (parent app / profile). */
export function studentRelationLabel(gender: StudentGender | string | undefined): string {
    const g = normalizeStudentGender(gender);
    if (g === "M") return "Son";
    if (g === "F") return "Daughter";
    return "Child";
}

export function studentSaveSuccessMessage(
    name: string,
    gender: StudentGender,
    editing: boolean,
): string {
    const first = (name || "Student").trim().split(/\s+/)[0] || "Student";
    const relation = studentRelationLabel(gender);
    if (editing) {
        return gender ? `${first} (${relation}) updated successfully.` : `${name} updated successfully.`;
    }
    return gender
        ? `${first} added successfully — ${relation} is now on your student list.`
        : `${name} added successfully.`;
}

/** Append ?student= whenever a selected child id is known. */
export function withParentStudentQuery(
    path: string,
    studentId: string | null | undefined,
    /** @deprecated Ignored — student id alone controls scoping. */
    _hasMultipleChildren?: boolean,
): string {
    if (!studentId) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}student=${encodeURIComponent(studentId)}`;
}

/** Append ?class_name= for parent event gallery class filter (mobile dropdown). */
export function withParentEventClassQuery(path: string, className: string | null | undefined): string {
    const trimmed = (className || "").trim();
    if (!trimmed) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}class_name=${encodeURIComponent(trimmed)}`;
}

/** Append ?date=YYYY-MM-DD for calendar-attendance day scope. */
export function withParentDateQuery(path: string, date: string | null | undefined): string {
    const day = (date || "").trim().slice(0, 10);
    if (!day) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}date=${encodeURIComponent(day)}`;
}

export function withParentScopedQuery(
    path: string,
    studentId: string | null | undefined,
    date?: string | null,
): string {
    return withParentDateQuery(withParentStudentQuery(path, studentId), date);
}

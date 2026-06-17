const STORAGE_PREFIX = "time4kids.parent.selectedStudent";

export function parentSelectedStudentStorageKey(userId: string | number): string {
    return `${STORAGE_PREFIX}.${userId}`;
}

export function readStoredSelectedStudentId(userId: string | number): string | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(parentSelectedStudentStorageKey(userId));
        return raw && raw.trim() ? raw.trim() : null;
    } catch {
        return null;
    }
}

export function writeStoredSelectedStudentId(userId: string | number, studentId: string | null): void {
    if (typeof window === "undefined") return;
    try {
        const key = parentSelectedStudentStorageKey(userId);
        if (!studentId) {
            window.localStorage.removeItem(key);
            return;
        }
        window.localStorage.setItem(key, studentId);
    } catch {
        /* ignore quota / private mode */
    }
}

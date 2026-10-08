"use client";

import { useAuth } from "@/components/auth/AuthProvider";

type ClassOption = { value: string; label: string };

/** Class a teacher login is locked to; `null` for centre (franchise) logins. */
export function useTeacherClass(): string | null {
    const { user } = useAuth();
    if (user?.role !== "teacher") return null;
    return user.teacherClass?.trim() || null;
}

/** Teachers only get their own class in class pickers (no "All classes"). */
export function lockClassOptions<T extends ClassOption>(options: T[], lockedClass: string | null): ClassOption[] {
    if (!lockedClass) return options;
    return [{ value: lockedClass, label: lockedClass }];
}

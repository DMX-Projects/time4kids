import type { EventRecord, SchoolStudent } from "@/components/dashboard/shared/SchoolDataProvider";

/** One line for class/section: API often sends combined `class_name` in `grade` with empty `section`. */
export function formatStudentClassCaption(stu: SchoolStudent): string {
    const grade = (stu.grade || "").trim();
    const section = (stu.section || "").trim();
    if (section) {
        return grade ? `${grade} · Section ${section}` : `Section ${section}`;
    }
    if (grade) return grade;
    return "—";
}

/** Events on or after local midnight today (matches backend parent dashboard idea). */
export function countUpcomingEvents(events: EventRecord[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let n = 0;
    for (const ev of events) {
        if (!ev.date) continue;
        const d = new Date(ev.date);
        if (Number.isNaN(d.getTime())) continue;
        d.setHours(0, 0, 0, 0);
        if (d >= today) n += 1;
    }
    return n;
}

export type SendToStudent = { id: number; full_name: string; class_name: string };

export type SendToMode = "all" | "class" | "student";

export type SendToForm = {
    mode: SendToMode;
    class_name: string;
    student: string;
};

export function emptySendToForm(): SendToForm {
    return { mode: "all", class_name: "", student: "" };
}

export function sendToFormToPayload(form: SendToForm): { class_name: string; student: number | null } {
    if (form.mode === "student" && form.student) {
        const id = Number(form.student);
        return { class_name: "", student: Number.isFinite(id) ? id : null };
    }
    if (form.mode === "class" && form.class_name.trim()) {
        return { class_name: form.class_name.trim(), student: null };
    }
    return { class_name: "", student: null };
}

export function sendToFormFromRow(class_name?: string, student?: number | null): SendToForm {
    if (student) {
        return { mode: "student", class_name: "", student: String(student) };
    }
    if ((class_name || "").trim()) {
        return { mode: "class", class_name: class_name!.trim(), student: "" };
    }
    return emptySendToForm();
}

export function validateSendToForm(form: SendToForm): string | null {
    if (form.mode === "class" && !form.class_name.trim()) return "Select a class.";
    if (form.mode === "student" && !form.student) return "Select a student.";
    return null;
}

/** @deprecated Use SendToForm — kept for any encoded string callers */
export function parseSendTo(value: string): { class_name: string; student: number | null } {
    if (value.startsWith("class:")) {
        return { class_name: value.slice(6), student: null };
    }
    if (value.startsWith("student:")) {
        const id = Number(value.slice(8));
        return { class_name: "", student: Number.isFinite(id) ? id : null };
    }
    return { class_name: "", student: null };
}

/** @deprecated Use sendToFormFromRow */
export function sendToFromAudience(class_name?: string, student?: number | null): string {
    if (student) return `student:${student}`;
    if ((class_name || "").trim()) return `class:${class_name!.trim()}`;
    return "all";
}

import { CENTRE_PROGRAM_LABELS } from "@/config/centre-program-cards-defaults";

/** Class targets for homework, notifications, and event gallery. */
export const PORTAL_CLASS_OPTIONS = [
    { value: "", label: "All classes" },
    ...CENTRE_PROGRAM_LABELS.map((p) => ({ value: p.label, label: p.label })),
];

export function portalClassLabel(className: string | undefined | null): string {
    const trimmed = (className || "").trim();
    return trimmed || "All classes";
}

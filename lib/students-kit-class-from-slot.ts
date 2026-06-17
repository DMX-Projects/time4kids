import { CENTRE_PROGRAM_LABELS } from "@/config/centre-program-cards-defaults";

/** Map Students Kit checklist row keys / slot ids to parent-app class labels. */
export function classLabelFromStudentsKitKey(key: string): string | null {
    const k = (key || "").toLowerCase();
    if (!k) return null;
    if (k.includes("nursery")) return "Nursery";
    if (k.includes("play-group") || k.includes("playgroup") || k.includes("play_group")) return "Play Group";
    if (k.includes("pp1") || k.includes("pp-1") || k.includes("junior")) return "PP-1 / Junior KG / LKG";
    if (k.includes("pp2") || k.includes("pp-2") || k.includes("senior")) return "PP-2 / Senior KG / UKG";
    return null;
}

/** Infer class from a Students Kit document title when target_class_names was not stored. */
export function classLabelFromStudentsKitTitle(title: string): string | null {
    const t = (title || "").toLowerCase();
    if (!t.includes("students kit")) return null;
    for (const { label } of CENTRE_PROGRAM_LABELS) {
        const probe = label.toLowerCase();
        if (probe.includes("pp-1") && (t.includes("pp1") || t.includes("pp-1") || t.includes("junior"))) {
            return label;
        }
        if (probe.includes("pp-2") && (t.includes("pp2") || t.includes("pp-2") || t.includes("senior"))) {
            return label;
        }
        if (probe === "nursery" && t.includes("nursery")) return label;
        if (probe === "play group" && (t.includes("play group") || t.includes("play-group"))) return label;
    }
    return null;
}

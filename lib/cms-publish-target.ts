import type { AdminFranchise } from "@/components/dashboard/admin/AdminDataProvider";
import { normalizeStoredClassFilter } from "@/lib/student-class-match";

export type CmsPublishScope =
    | "pan_india"
    | "state"
    | "city"
    | "franchises"
    | "one_centre";

export type CmsPublishTargetForm = {
    scope: CmsPublishScope;
    franchiseId: string;
    franchiseIds: string[];
    targetStates: string[];
    targetCities: string[];
    className: string;
};

export const CMS_PUBLISH_SCOPE_OPTIONS: { value: CmsPublishScope; label: string }[] = [
    { value: "pan_india", label: "Pan-India (all centres)" },
    { value: "state", label: "State-wise centres" },
    { value: "city", label: "City-wise centres" },
    { value: "franchises", label: "Multiple selected centres" },
    { value: "one_centre", label: "One centre" },
];

export function emptyCmsPublishTarget(): CmsPublishTargetForm {
    return {
        scope: "pan_india",
        franchiseId: "",
        franchiseIds: [],
        targetStates: [],
        targetCities: [],
        className: "",
    };
}

export function validateCmsPublishTarget(target: CmsPublishTargetForm): string | null {
    if (target.scope === "one_centre" && !target.franchiseId) return "Select a centre.";
    if (target.scope === "franchises" && target.franchiseIds.length === 0) return "Select at least one centre.";
    if (target.scope === "state" && target.targetStates.length === 0) return "Select at least one state.";
    if (target.scope === "city" && target.targetCities.length === 0) return "Select at least one city.";
    return null;
}

export function publishTargetFromDoc(doc: {
    franchise?: number | null;
    publish_scope?: string;
    target_states?: string[];
    target_cities?: string[];
    target_franchise_ids?: number[];
    target_class_names?: string[];
    class_name?: string;
} | null | undefined): CmsPublishTargetForm {
    if (!doc) return emptyCmsPublishTarget();
    const scope =
        (doc.publish_scope as CmsPublishScope) ||
        (doc.franchise != null ? "one_centre" : "pan_india");
    const storedClass = (doc.target_class_names || [])[0] || doc.class_name || "";
    return {
        scope,
        franchiseId: doc.franchise != null ? String(doc.franchise) : "",
        franchiseIds: (doc.target_franchise_ids || []).map(String),
        targetStates: doc.target_states || [],
        targetCities: doc.target_cities || [],
        className: normalizeStoredClassFilter(storedClass),
    };
}

export function uniqueCitiesFromFranchises(franchises: AdminFranchise[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const f of franchises) {
        const city = (f.city || "").trim();
        if (!city) continue;
        const key = city.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(city);
    }
    return out.sort((a, b) => a.localeCompare(b));
}

export function announcementTargetPayload(
    target: CmsPublishTargetForm,
    extra: {
        title: string;
        body: string;
        schedule_date: string;
        audience?: "all" | "class" | "student";
        student?: string;
        visible_to_parents?: boolean;
        visible_to_centres?: boolean;
    },
) {
    const class_name =
        extra.audience === "class" || target.className.trim() ? target.className.trim() : "";
    const student =
        extra.audience === "student" && target.scope === "one_centre" && extra.student
            ? Number(extra.student)
            : null;

    return {
        title: extra.title.trim(),
        body: extra.body.trim(),
        is_active: true,
        schedule_date: extra.schedule_date,
        visible_to_parents: extra.visible_to_parents !== false,
        visible_to_centres: extra.visible_to_centres !== false,
        target_scope: target.scope,
        target_states: target.scope === "state" ? target.targetStates : [],
        target_cities: target.scope === "city" ? target.targetCities : [],
        franchise_ids:
            target.scope === "franchises"
                ? target.franchiseIds.map(Number).filter(Boolean)
                : target.scope === "one_centre" && target.franchiseId
                  ? [Number(target.franchiseId)]
                  : [],
        franchise:
            target.scope === "one_centre" && target.franchiseId ? Number(target.franchiseId) : undefined,
        class_name,
        student,
    };
}

export function parentDocumentTargetPayload(target: CmsPublishTargetForm) {
    const useFranchiseFk = target.scope === "one_centre" && target.franchiseId;
    const className = normalizeStoredClassFilter(target.className);
    return {
        publish_scope: target.scope,
        target_states: target.scope === "state" ? target.targetStates : [],
        target_cities: target.scope === "city" ? target.targetCities : [],
        target_franchise_ids:
            target.scope === "franchises"
                ? target.franchiseIds.map(Number).filter(Boolean)
                : target.scope === "one_centre" && target.franchiseId
                  ? [Number(target.franchiseId)]
                  : [],
        target_class_names: className ? [className] : [],
        class_name: className,
        franchise: useFranchiseFk ? Number(target.franchiseId) : null,
    };
}

/** Centre uploads: class filter only (scope is always this centre). */
export function franchiseDocumentClassPayload(className: string) {
    const trimmed = normalizeStoredClassFilter(className);
    return {
        target_class_names: trimmed ? [trimmed] : [],
        class_name: trimmed,
    };
}

export function publishTargetSummary(
    target: CmsPublishTargetForm,
    franchises: AdminFranchise[],
): string {
    let scope = "—";
    if (target.scope === "pan_india") scope = "Pan-India (all centres)";
    else if (target.scope === "one_centre") {
        const f = franchises.find((x) => String(x.id) === target.franchiseId);
        scope = f ? f.name : "One centre";
    } else if (target.scope === "franchises") {
        scope = `${target.franchiseIds.length} selected centre(s)`;
    } else if (target.scope === "state") {
        scope = `States: ${target.targetStates.join(", ") || "—"}`;
    } else if (target.scope === "city") {
        scope = `Cities: ${target.targetCities.join(", ") || "—"}`;
    }
    const classLabel = (target.className || "").trim();
    if (classLabel) return `${scope} · Class: ${classLabel}`;
    return scope;
}

export function publishTargetFromAnnouncement(row: {
    franchise?: number | null;
    publish_scope?: string;
    target_states?: string[];
    target_cities?: string[];
    target_franchise_ids?: number[];
    class_name?: string;
}): CmsPublishTargetForm {
    if (row.franchise) {
        return {
            ...emptyCmsPublishTarget(),
            scope: "one_centre",
            franchiseId: String(row.franchise),
            className: row.class_name || "",
        };
    }
    const scope = (row.publish_scope || "pan_india") as CmsPublishScope;
    const franchiseIds = (row.target_franchise_ids || []).map(String);
    return {
        scope,
        franchiseId: scope === "one_centre" && franchiseIds[0] ? franchiseIds[0] : "",
        franchiseIds: scope === "franchises" ? franchiseIds : [],
        targetStates: row.target_states || [],
        targetCities: row.target_cities || [],
        className: row.class_name || "",
    };
}

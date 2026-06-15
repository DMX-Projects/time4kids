import type { AdminFranchise } from "@/components/dashboard/admin/AdminDataProvider";

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
        target_class_names: target.className.trim() ? [target.className.trim()] : [],
        franchise: useFranchiseFk ? Number(target.franchiseId) : null,
    };
}

export function publishTargetSummary(
    target: CmsPublishTargetForm,
    franchises: AdminFranchise[],
): string {
    if (target.scope === "pan_india") return "Pan-India (all centres)";
    if (target.scope === "one_centre") {
        const f = franchises.find((x) => String(x.id) === target.franchiseId);
        return f ? f.name : "One centre";
    }
    if (target.scope === "franchises") {
        return `${target.franchiseIds.length} selected centre(s)`;
    }
    if (target.scope === "state") {
        return `States: ${target.targetStates.join(", ") || "—"}`;
    }
    if (target.scope === "city") {
        return `Cities: ${target.targetCities.join(", ") || "—"}`;
    }
    return "—";
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

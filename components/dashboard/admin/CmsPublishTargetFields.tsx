"use client";

import type { AdminFranchise } from "@/components/dashboard/admin/AdminDataProvider";
import { PARENT_DOCUMENT_STATES } from "@/config/parent-document-categories";
import {
    CMS_PUBLISH_SCOPE_OPTIONS,
    type CmsPublishTargetForm,
    uniqueCitiesFromFranchises,
} from "@/lib/cms-publish-target";

type Props = {
    franchises: AdminFranchise[];
    value: CmsPublishTargetForm;
    onChange: (next: CmsPublishTargetForm) => void;
    showClassTarget?: boolean;
    classOptions?: { value: string; label: string }[];
};

export function CmsPublishTargetFields({
    franchises,
    value,
    onChange,
    showClassTarget = false,
    classOptions = [],
}: Props) {
    const cities = uniqueCitiesFromFranchises(franchises);

    const setScope = (scope: CmsPublishTargetForm["scope"]) => {
        onChange({
            ...value,
            scope,
            franchiseId: "",
            franchiseIds: [],
            targetStates: [],
            targetCities: [],
            className: "",
        });
    };

    return (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold text-slate-800">Publish to</p>
            <label className="block text-xs font-semibold text-slate-600">
                Audience scope
                <select
                    value={value.scope}
                    onChange={(e) => setScope(e.target.value as CmsPublishTargetForm["scope"])}
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white"
                >
                    {CMS_PUBLISH_SCOPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </label>

            {value.scope === "one_centre" ? (
                <label className="block text-xs font-semibold text-slate-600">
                    Centre
                    <select
                        required
                        value={value.franchiseId}
                        onChange={(e) => onChange({ ...value, franchiseId: e.target.value })}
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white"
                    >
                        <option value="">Select centre</option>
                        {franchises.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                                {f.city ? ` · ${f.city}` : ""}
                            </option>
                        ))}
                    </select>
                </label>
            ) : null}

            {value.scope === "franchises" ? (
                <fieldset className="space-y-2">
                    <legend className="text-xs font-semibold text-slate-600">Select centres</legend>
                    <div className="max-h-40 overflow-y-auto rounded-lg border bg-white p-2 space-y-1">
                        {franchises.map((f) => {
                            const checked = value.franchiseIds.includes(f.id);
                            return (
                                <label
                                    key={f.id}
                                    className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                            const next = e.target.checked
                                                ? [...value.franchiseIds, f.id]
                                                : value.franchiseIds.filter((id) => id !== f.id);
                                            onChange({ ...value, franchiseIds: next });
                                        }}
                                    />
                                    <span>
                                        {f.name}
                                        {f.state ? ` (${f.state})` : ""}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </fieldset>
            ) : null}

            {value.scope === "state" ? (
                <fieldset className="space-y-2">
                    <legend className="text-xs font-semibold text-slate-600">States</legend>
                    <div className="max-h-40 overflow-y-auto rounded-lg border bg-white p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {PARENT_DOCUMENT_STATES.map((s) => {
                            const checked = value.targetStates.includes(s.value);
                            return (
                                <label
                                    key={s.value}
                                    className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                            const next = e.target.checked
                                                ? [...value.targetStates, s.value]
                                                : value.targetStates.filter((c) => c !== s.value);
                                            onChange({ ...value, targetStates: next });
                                        }}
                                    />
                                    <span>{s.label}</span>
                                </label>
                            );
                        })}
                    </div>
                </fieldset>
            ) : null}

            {value.scope === "city" ? (
                <fieldset className="space-y-2">
                    <legend className="text-xs font-semibold text-slate-600">Cities</legend>
                    {cities.length === 0 ? (
                        <p className="text-xs text-amber-800">No cities found on your centres — add city on each centre first.</p>
                    ) : (
                        <div className="max-h-40 overflow-y-auto rounded-lg border bg-white p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {cities.map((city) => {
                                const checked = value.targetCities.includes(city);
                                return (
                                    <label
                                        key={city}
                                        className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => {
                                                const next = e.target.checked
                                                    ? [...value.targetCities, city]
                                                    : value.targetCities.filter((c) => c !== city);
                                                onChange({ ...value, targetCities: next });
                                            }}
                                        />
                                        <span>{city}</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </fieldset>
            ) : null}

            {showClassTarget && classOptions.length > 0 ? (
                <label className="block text-xs font-semibold text-slate-600">
                    Class filter (optional — leave blank for all parents in scope)
                    <select
                        value={value.className}
                        onChange={(e) => onChange({ ...value, className: e.target.value })}
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white"
                    >
                        <option value="">All parents in scope</option>
                        {classOptions.map((opt) => (
                            <option key={opt.value || "all"} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </label>
            ) : null}
        </div>
    );
}

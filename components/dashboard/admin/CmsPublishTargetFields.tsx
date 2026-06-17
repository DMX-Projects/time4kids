"use client";

import { useEffect, useMemo } from "react";
import type { AdminFranchise } from "@/components/dashboard/admin/AdminDataProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { PARENT_DOCUMENT_STATES } from "@/config/parent-document-categories";
import {
    CMS_PUBLISH_SCOPE_OPTIONS,
    type CmsPublishTargetForm,
    uniqueCitiesFromFranchises,
} from "@/lib/cms-publish-target";
import {
    CMS_CLASS_SELECT_OPTIONS,
    classLabelFromSelectValue,
    classSelectValueFromLabel,
} from "@/lib/student-class-match";

type Props = {
    franchises?: AdminFranchise[];
    value: CmsPublishTargetForm;
    onChange: (next: CmsPublishTargetForm) => void;
    showClassTarget?: boolean;
    classOptions?: { value: string; label: string }[];
};

function centreLabel(f: AdminFranchise): string {
    const parts = [f.name];
    if (f.city) parts.push(f.city);
    if (f.state) parts.push(f.state);
    return parts.join(" · ");
}

export function CmsPublishTargetFields({
    franchises: franchisesProp = [],
    value,
    onChange,
    showClassTarget = false,
    classOptions = [],
}: Props) {
    const {
        franchises: ctxFranchises,
        franchisesLoading,
        franchisesLoadError,
        reloadFranchises,
    } = useAdminData();

    const franchises = ctxFranchises.length > 0 ? ctxFranchises : franchisesProp;
    const needsCentres = value.scope === "one_centre" || value.scope === "franchises";
    const cities = uniqueCitiesFromFranchises(franchises);

    const centreOptions = useMemo(
        () =>
            franchises.map((f) => ({
                value: f.id,
                label: centreLabel(f),
            })),
        [franchises],
    );

    useEffect(() => {
        if (!needsCentres || franchises.length > 0 || franchisesLoading) return;
        void reloadFranchises();
    }, [needsCentres, franchises.length, franchisesLoading, reloadFranchises]);

    const setScope = (scope: CmsPublishTargetForm["scope"]) => {
        onChange({
            ...value,
            scope,
            franchiseId: "",
            franchiseIds: [],
            targetStates: [],
            targetCities: [],
        });
    };

    const centresEmptyMessage = franchisesLoading
        ? "Loading centres…"
        : franchisesLoadError
          ? "Could not load centres — use Retry below."
          : franchises.length === 0
            ? "No centres found. Add centres under Franchise centres in the sidebar."
            : "No centre matches your search.";

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
                <div className="block text-xs font-semibold text-slate-600">
                    Centre
                    <SearchableSelect
                        value={value.franchiseId}
                        onChange={(franchiseId) => onChange({ ...value, franchiseId })}
                        options={centreOptions}
                        placeholder="Select centre"
                        searchPlaceholder="Search centre name, city, or state…"
                        loading={franchisesLoading && centreOptions.length === 0}
                        emptyMessage={centresEmptyMessage}
                        menuPortal
                    />
                    {franchisesLoadError && !franchisesLoading ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-normal text-red-700">
                            <span>{franchisesLoadError}</span>
                            <button
                                type="button"
                                className="rounded-lg border border-red-200 bg-white px-2 py-1 font-semibold text-red-700 hover:bg-red-50"
                                onClick={() => void reloadFranchises()}
                            >
                                Retry
                            </button>
                        </div>
                    ) : null}
                    {!franchisesLoading && !franchisesLoadError && franchises.length > 0 ? (
                        <p className="mt-1 text-[11px] font-normal text-slate-500">
                            {franchises.length} centre{franchises.length === 1 ? "" : "s"} available — type to search.
                        </p>
                    ) : null}
                </div>
            ) : null}

            {value.scope === "franchises" ? (
                <fieldset className="space-y-2">
                    <legend className="text-xs font-semibold text-slate-600">Select centres</legend>
                    {franchisesLoading && franchises.length === 0 ? (
                        <p className="text-xs text-slate-600">Loading centres…</p>
                    ) : franchises.length === 0 ? (
                        <div className="space-y-2 text-xs text-amber-800">
                            <p>{centresEmptyMessage}</p>
                            {franchisesLoadError ? (
                                <button
                                    type="button"
                                    className="rounded-lg border border-amber-300 bg-white px-2 py-1 font-semibold text-amber-900 hover:bg-amber-50"
                                    onClick={() => void reloadFranchises()}
                                >
                                    Retry
                                </button>
                            ) : null}
                        </div>
                    ) : (
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
                    )}
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
                        <p className="text-xs text-amber-800">
                            No cities found on your centres — add city on each centre first.
                        </p>
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

            {showClassTarget ? (
                <label className="block text-xs font-semibold text-slate-600">
                    Class filter
                    <select
                        value={classSelectValueFromLabel(value.className)}
                        onChange={(e) =>
                            onChange({ ...value, className: classLabelFromSelectValue(e.target.value) })
                        }
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white"
                    >
                        <option value="">All classes in scope</option>
                        {CMS_CLASS_SELECT_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-[11px] font-normal text-slate-500">
                        {value.className.trim()
                            ? `Only ${value.className.trim()} parents will see this in the parent app.`
                            : "Leave as “All classes in scope” to show every class at the selected centre(s)."}
                    </p>
                </label>
            ) : null}
        </div>
    );
}

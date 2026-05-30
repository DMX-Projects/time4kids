"use client";

import Button from "@/components/ui/Button";
import type { FranchisePageData, FranchiseRegionalOffice } from "@/config/franchise-page-defaults";
import { Plus, Trash2 } from "lucide-react";

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";
const labelClass = "block text-xs font-medium text-slate-600 mb-1";

type MainBranch = FranchisePageData["main_branch"];

export function FranchiseContactFields({
    mainBranch,
    onChange,
}: {
    mainBranch: MainBranch;
    onChange: (next: MainBranch) => void;
}) {
    const addressLines = mainBranch.address_lines ?? [];
    const offices = mainBranch.regional_offices ?? [];

    const setLines = (lines: string[]) => {
        onChange({ ...mainBranch, address_lines: lines });
    };

    const setOffices = (rows: FranchiseRegionalOffice[]) => {
        onChange({ ...mainBranch, regional_offices: rows });
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <h4 className="mb-1 text-sm font-semibold text-slate-900">Corporate office (left card)</h4>
                <p className="mb-3 text-xs text-slate-600">One line per row — no HTML needed.</p>
                <div className="space-y-2">
                    {addressLines.map((line, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                className={inputClass}
                                value={line}
                                placeholder={i === 0 ? "Company name" : "Address line"}
                                onChange={(e) => {
                                    const next = [...addressLines];
                                    next[i] = e.target.value;
                                    setLines(next);
                                }}
                            />
                            <button
                                type="button"
                                className="shrink-0 rounded-lg border border-red-200 px-2 text-red-600 hover:bg-red-50"
                                onClick={() => setLines(addressLines.filter((_, j) => j !== i))}
                                aria-label="Remove line"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-3 inline-flex items-center gap-1"
                    onClick={() => setLines([...addressLines, ""])}
                >
                    <Plus className="h-4 w-4" /> Add address line
                </Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <h4 className="mb-1 text-sm font-semibold text-slate-900">Regional offices (right card)</h4>
                <p className="mb-3 text-xs text-slate-600">
                    State, main city, and phone. Use extra cities under a state for places like Kochi / Trivandrum under
                    Kerala.
                </p>
                <div className="space-y-4">
                    {offices.map((office, i) => (
                        <RegionalOfficeEditor
                            key={i}
                            office={office}
                            onChange={(patch) => {
                                const next = [...offices];
                                next[i] = { ...next[i], ...patch };
                                setOffices(next);
                            }}
                            onRemove={() => setOffices(offices.filter((_, j) => j !== i))}
                            onSubChange={(subs) => {
                                const next = [...offices];
                                next[i] = { ...next[i], subCities: subs };
                                setOffices(next);
                            }}
                        />
                    ))}
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-3 inline-flex items-center gap-1"
                    onClick={() =>
                        setOffices([
                            ...offices,
                            { state: "", city: "", phone: "" },
                        ])
                    }
                >
                    <Plus className="h-4 w-4" /> Add regional office
                </Button>
            </div>
        </div>
    );
}

function RegionalOfficeEditor({
    office,
    onChange,
    onRemove,
    onSubChange,
}: {
    office: FranchiseRegionalOffice;
    onChange: (patch: Partial<FranchiseRegionalOffice>) => void;
    onRemove: () => void;
    onSubChange: (subs: NonNullable<FranchiseRegionalOffice["subCities"]>) => void;
}) {
    const subs = office.subCities ?? [];

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
            <div className="flex items-start justify-between gap-2">
                <div className="grid flex-1 gap-2 md:grid-cols-3">
                    <div>
                        <label className={labelClass}>State / region</label>
                        <input
                            className={inputClass}
                            value={office.state}
                            placeholder="e.g. Telangana & Andhra Pradesh"
                            onChange={(e) => onChange({ state: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>City</label>
                        <input
                            className={inputClass}
                            value={office.city}
                            placeholder="e.g. Hyderabad"
                            onChange={(e) => onChange({ city: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Phone</label>
                        <input
                            className={inputClass}
                            value={office.phone}
                            placeholder="e.g. 7989281696 or 9074586895 / 8089001116"
                            onChange={(e) => onChange({ phone: e.target.value })}
                        />
                    </div>
                </div>
                <button
                    type="button"
                    className="mt-6 shrink-0 rounded-lg border border-red-200 px-2 py-2 text-red-600 hover:bg-red-50"
                    onClick={onRemove}
                    aria-label="Remove office"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {subs.length > 0 ? (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                    <p className="text-xs font-medium text-slate-600">Additional cities in this state</p>
                    {subs.map((sub, j) => (
                        <div key={j} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                            <input
                                className={inputClass}
                                value={sub.city}
                                placeholder="City"
                                onChange={(e) => {
                                    const next = [...subs];
                                    next[j] = { ...next[j], city: e.target.value };
                                    onSubChange(next);
                                }}
                            />
                            <input
                                className={inputClass}
                                value={sub.phone}
                                placeholder="Phone"
                                onChange={(e) => {
                                    const next = [...subs];
                                    next[j] = { ...next[j], phone: e.target.value };
                                    onSubChange(next);
                                }}
                            />
                            <button
                                type="button"
                                className="rounded-lg border border-red-200 px-2 text-red-600 hover:bg-red-50"
                                onClick={() => onSubChange(subs.filter((_, k) => k !== j))}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : null}

            <Button
                type="button"
                size="sm"
                variant="outline"
                className="inline-flex items-center gap-1"
                onClick={() => onSubChange([...subs, { city: "", phone: "" }])}
            >
                <Plus className="h-3.5 w-3.5" /> Add city under this state
            </Button>
        </div>
    );
}

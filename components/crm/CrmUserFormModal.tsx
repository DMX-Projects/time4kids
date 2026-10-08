"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import api from "@/lib/crmApi";
import { MultiSearchableSelect, SearchableSelect } from "@/components/crm/SearchableSelect";
import type { CrmTeamUser } from "@/components/crm/CrmUsersList";

export type CrmTeamFormOptions = {
    designations: string[];
    managers: { id: number; name: string; designation: string }[];
    states: string[];
};

type FormState = {
    name: string;
    email: string;
    password: string;
    phone: string;
    designation: string;
    reportsToId: string;
    states: string[];
    cities: string[];
    handlesFranchise: boolean;
    handlesAdmission: boolean;
};

type FieldErrors = Partial<Record<keyof FormState | "pipelines", string>>;

type Props = {
    options: CrmTeamFormOptions;
    /** Omit to add a new user. */
    user?: CrmTeamUser | null;
    onClose: () => void;
    onSaved: () => void;
};

function splitList(raw: string): string[] {
    return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

function initialState(user: CrmTeamUser | null | undefined, stateNames: string[]): FormState {
    if (!user) {
        return {
            name: "",
            email: "",
            password: "",
            phone: "",
            designation: "",
            reportsToId: "",
            states: [],
            cities: [],
            handlesFranchise: true,
            handlesAdmission: false,
        };
    }
    const byLower = new Map(stateNames.map((s) => [s.toLowerCase(), s]));
    return {
        name: user.fullName || user.name,
        email: user.email,
        password: "",
        phone: user.phone || "",
        designation: user.designation || "",
        reportsToId: user.reportsToId ? String(user.reportsToId) : "",
        states: splitList(user.states).map((s) => byLower.get(s.toLowerCase()) ?? s),
        cities: splitList(user.cities),
        handlesFranchise: user.handlesFranchise,
        handlesAdmission: user.handlesAdmission,
    };
}

const SUPER_ADMIN = "Super Admin";

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";
const labelClass = "mb-1.5 block text-sm font-semibold text-gray-700";

export default function CrmUserFormModal({ options, user, onClose, onSaved }: Props) {
    const editing = Boolean(user);
    const teamEditable = !user || !user.sheetConfigured;
    const [form, setForm] = useState<FormState>(() => initialState(user, options.states));
    const [errors, setErrors] = useState<FieldErrors>({});
    const [saving, setSaving] = useState(false);
    const superAdmin = teamEditable && form.designation === SUPER_ADMIN;
    const [cityOptions, setCityOptions] = useState<string[]>([]);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const prevCityOptions = useRef<string[] | null>(null);
    const statesKey = form.states.join(",");

    useEffect(() => {
        if (!statesKey) {
            setCityOptions([]);
            prevCityOptions.current = [];
            setForm((prev) => (prev.cities.length ? { ...prev, cities: [] } : prev));
            return;
        }
        let cancelled = false;
        setCitiesLoading(true);
        api.get(`/team/cities?states=${encodeURIComponent(statesKey)}`)
            .then((res) => {
                if (cancelled) return;
                const next: string[] = Array.isArray(res.data?.cities) ? res.data.cities : [];
                const before = prevCityOptions.current;
                // Drop picked cities that belonged to a state that was removed; keep typed-in ones.
                if (before) {
                    const nextSet = new Set(next);
                    const beforeSet = new Set(before);
                    setForm((prev) => ({ ...prev, cities: prev.cities.filter((c) => nextSet.has(c) || !beforeSet.has(c)) }));
                }
                prevCityOptions.current = next;
                setCityOptions(next);
            })
            .catch(() => {
                if (!cancelled) setCityOptions([]);
            })
            .finally(() => {
                if (!cancelled) setCitiesLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [statesKey]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !saving) onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [saving, onClose]);

    const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => {
            const next = { ...prev, [key]: value };
            if (key === "designation" && value === SUPER_ADMIN) {
                next.reportsToId = "";
                next.handlesFranchise = false;
                next.handlesAdmission = false;
                next.states = [];
                next.cities = [];
            } else if (key === "designation" && prev.designation === SUPER_ADMIN) {
                next.handlesFranchise = true;
            }
            return next;
        });
        setErrors((prev) =>
            key === "designation"
                ? { ...prev, designation: undefined, reportsToId: undefined, pipelines: undefined, states: undefined }
                : { ...prev, [key]: undefined, ...(key.startsWith("handles") ? { pipelines: undefined } : {}) },
        );
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        const body: Record<string, unknown> = {
            name: form.name,
            phone: form.phone,
            states: form.states,
            cities: form.cities,
        };
        if (!editing) body.email = form.email;
        if (form.password) body.password = form.password;
        if (teamEditable) {
            body.designation = form.designation;
            body.reportsToId = form.reportsToId;
            body.handlesFranchise = form.handlesFranchise;
            body.handlesAdmission = form.handlesAdmission;
        }
        try {
            if (editing && user) await api.patch(`/team/${user.id}`, body);
            else await api.post("/team", body);
            toast.success(editing ? `${form.name} updated` : `${form.name} added. They can log in now.`);
            onSaved();
            onClose();
        } catch (err: any) {
            const data = err?.response?.data || {};
            if (data.errors) setErrors(data.errors);
            toast.error(data.message || "Could not save the user.");
        } finally {
            setSaving(false);
        }
    };

    const managerOptions = options.managers.map((m) => ({
        value: String(m.id),
        label: m.designation ? `${m.name} — ${m.designation}` : m.name,
    }));
    const stateOptions = options.states.map((s) => ({ value: s, label: s }));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !saving) onClose();
            }}
        >
            <form onSubmit={submit} className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h3 className="text-lg font-bold text-gray-800">{editing ? `Edit ${user?.name}` : "Add User"}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-60"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className={labelClass}>Name *</label>
                            <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Email (login) *</label>
                            <input
                                className={`${inputClass} ${editing ? "bg-gray-50 text-gray-500" : ""}`}
                                type="email"
                                value={form.email}
                                disabled={editing}
                                onChange={(e) => update("email", e.target.value)}
                                autoComplete="off"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>{editing ? "New password" : "Password *"}</label>
                            <input
                                className={inputClass}
                                type="text"
                                value={form.password}
                                onChange={(e) => update("password", e.target.value)}
                                placeholder={editing ? "Leave blank to keep the current password" : "At least 8 characters"}
                                autoComplete="new-password"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Mobile</label>
                            <input
                                className={inputClass}
                                value={form.phone}
                                inputMode="numeric"
                                onChange={(e) => update("phone", e.target.value.replace(/[^\d+ ]/g, ""))}
                                placeholder="10-digit mobile"
                            />
                            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                        </div>
                    </div>

                    {teamEditable ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>Designation *</label>
                                <SearchableSelect
                                    options={options.designations.map((d) => ({ value: d, label: d }))}
                                    value={form.designation}
                                    onChange={(v) => update("designation", v)}
                                    placeholder="Select designation"
                                />
                                {errors.designation && <p className="mt-1 text-xs text-red-600">{errors.designation}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Reports to {superAdmin ? "" : "*"}</label>
                                <SearchableSelect
                                    options={managerOptions}
                                    value={form.reportsToId}
                                    onChange={(v) => update("reportsToId", v)}
                                    placeholder={superAdmin ? "Not needed for Super Admin" : "Select manager"}
                                    disabled={superAdmin}
                                    searchable
                                />
                                {errors.reportsToId && <p className="mt-1 text-xs text-red-600">{errors.reportsToId}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Handles leads for {superAdmin ? "" : "*"}</label>
                                <div className={`flex gap-6 ${superAdmin ? "opacity-50" : ""}`}>
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={form.handlesFranchise}
                                            disabled={superAdmin}
                                            onChange={(e) => update("handlesFranchise", e.target.checked)}
                                        />
                                        Franchise
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={form.handlesAdmission}
                                            disabled={superAdmin}
                                            onChange={(e) => update("handlesAdmission", e.target.checked)}
                                        />
                                        Admission
                                    </label>
                                </div>
                                {superAdmin && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        Super Admins see all leads across India, can assign leads, add leads and manage users.
                                    </p>
                                )}
                                {errors.pipelines && <p className="mt-1 text-xs text-red-600">{errors.pipelines}</p>}
                            </div>
                        </div>
                    ) : (
                        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                            <strong>{form.designation || "Team member"}</strong> — reporting line and Franchise / Admission work for this
                            person are part of the original team setup and can&apos;t be changed here.
                        </p>
                    )}

                    <div>
                        <label className={labelClass}>States {teamEditable && !superAdmin ? "*" : ""}</label>
                        <MultiSearchableSelect
                            options={stateOptions}
                            value={form.states}
                            onChange={(v) => update("states", v)}
                            placeholder={superAdmin ? "All India" : "Select states they cover"}
                            disabled={superAdmin}
                        />
                        {errors.states && <p className="mt-1 text-xs text-red-600">{errors.states}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Cities / districts</label>
                        <MultiSearchableSelect
                            options={cityOptions.map((c) => ({ value: c, label: c }))}
                            value={form.cities}
                            onChange={(v) => update("cities", v)}
                            disabled={superAdmin || form.states.length === 0}
                            creatable
                            placeholder={
                                superAdmin
                                    ? "All India"
                                    : form.states.length === 0
                                      ? "Select states first"
                                      : citiesLoading
                                        ? "Loading cities..."
                                        : "Optional — leave empty to cover the whole state"
                            }
                            noOptionsText="Type a city name to add it"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {saving ? "Saving..." : editing ? "Save changes" : "Add User"}
                    </button>
                </div>
            </form>
        </div>
    );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { UserPlus } from "lucide-react";
import api from "@/lib/crmApi";
import { normalizeRole, useAuth } from "@/components/auth/AuthProvider";
import { AccessLoading } from "@/components/auth/AccessLoading";
import { SearchableSelect, SearchableSelectOrCreate, type Option } from "@/components/crm/SearchableSelect";
import { canAddCrmLeads } from "@/lib/crmLeadAdd";

type FormState = {
    fullName: string;
    mobile: string;
    email: string;
    state: string;
    city: string;
    location: string;
    leadType: LeadType;
    source: string;
    assignedUserId: string;
};

type LeadType = "franchise" | "admission";

type FieldErrors = Partial<Record<keyof FormState, string>>;

type Assignee = { id: number; name: string; designation?: string };

function assigneeLabel(u: Assignee): string {
    return u.designation ? `${u.name} — ${u.designation}` : u.name;
}

const EMPTY_FORM: FormState = {
    fullName: "",
    mobile: "",
    email: "",
    state: "",
    city: "",
    location: "",
    leadType: "franchise",
    source: "franchise_referral",
    assignedUserId: "",
};

const DEFAULT_LEAD_TYPES: Option[] = [
    { value: "franchise", label: "Franchise Lead" },
    { value: "admission", label: "Admission Lead" },
];

const DEFAULT_SOURCES_BY_LEAD_TYPE: Record<LeadType, Option[]> = {
    franchise: [
        { value: "franchise_website", label: "Website Leads" },
        { value: "campaign_google", label: "Paid Campaign - Google" },
        { value: "campaign_meta", label: "Paid Campaign - META" },
        { value: "youtube", label: "Paid Campaign - YouTube" },
        { value: "whatsapp", label: "WhatsApp" },
        { value: "sms", label: "SMS" },
        { value: "email", label: "Email" },
        { value: "franchise_referral", label: "Referral-Franchise" },
        { value: "franchise_friends_family", label: "Referral - Friends & Family" },
    ],
    admission: [
        { value: "admission_website", label: "Website" },
        { value: "admission_google", label: "Paid Campaign - Google" },
        { value: "admission_meta", label: "Paid Campaign - META" },
        { value: "admission_youtube", label: "Paid Campaign - YouTube" },
        { value: "admission_whatsapp", label: "WhatsApp" },
        { value: "admission_sms", label: "SMS" },
        { value: "admission_email", label: "Email" },
        { value: "referral_parents", label: "Referral – Parents" },
        { value: "referral_family_friends", label: "Referral - Family & Friends" },
    ],
};

const DEFAULT_SOURCE_BY_LEAD_TYPE: Record<LeadType, string> = {
    franchise: "franchise_referral",
    admission: "referral_parents",
};

/** Digits only, max 10; a pasted +91 / 0 prefix is dropped. */
function cleanMobileInput(raw: string): string {
    let digits = raw.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    return digits.slice(0, 10);
}

function mobileError(mobile: string, { complete }: { complete: boolean }): string | undefined {
    if (!mobile) return complete ? "Enter the mobile number." : undefined;
    if (!/^[6-9]/.test(mobile)) return "Mobile number must start with 6, 7, 8 or 9.";
    if (complete && mobile.length !== 10) return "Enter a valid 10-digit mobile number.";
    return undefined;
}

const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export default function AddLeadForm() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [leadTypes, setLeadTypes] = useState<Option[]>(DEFAULT_LEAD_TYPES);
    const [sourcesByLeadType, setSourcesByLeadType] = useState<Record<LeadType, Option[]>>(DEFAULT_SOURCES_BY_LEAD_TYPE);
    const sources = sourcesByLeadType[form.leadType] ?? [];
    const [states, setStates] = useState<Option[]>([]);
    const [cities, setCities] = useState<Option[]>([]);
    const [assignUsers, setAssignUsers] = useState<Option[]>([]);
    const [saving, setSaving] = useState(false);
    const [created, setCreated] = useState<{ id: string; fullName: string; assignedUserLabel?: string | null } | null>(null);

    const isCrmUser = normalizeRole(user?.role) === "crm";
    const allowed = isCrmUser && canAddCrmLeads(user);

    useEffect(() => {
        if (!authLoading && !user) router.replace("/crm-admin/login");
    }, [authLoading, user, router]);

    useEffect(() => {
        if (!form.state) setCities([]);
    }, [form.state]);

    useEffect(() => {
        if (!allowed) return;
        let cancelled = false;
        const qs = new URLSearchParams();
        qs.set("leadType", form.leadType);
        if (form.state) qs.set("state", form.state);
        if (form.city) qs.set("city", form.city);
        api.get(`/leads/add?${qs.toString()}`)
            .then((res) => {
                if (cancelled) return;
                if (Array.isArray(res.data?.leadTypes) && res.data.leadTypes.length) setLeadTypes(res.data.leadTypes);
                const byType = res.data?.sourcesByLeadType;
                if (byType && Array.isArray(byType.franchise) && Array.isArray(byType.admission)) {
                    setSourcesByLeadType({ franchise: byType.franchise, admission: byType.admission });
                }
                if (Array.isArray(res.data?.states)) {
                    setStates(res.data.states.map((name: string) => ({ value: name, label: name })));
                }
                if (form.state && Array.isArray(res.data?.cities)) {
                    setCities(res.data.cities.map((name: string) => ({ value: name, label: name })));
                }
                const list: Assignee[] = Array.isArray(res.data?.assignees) ? res.data.assignees : [];
                setAssignUsers(list.map((u) => ({ value: String(u.id), label: assigneeLabel(u) })));
            })
            .catch(() => !cancelled && setAssignUsers([]));
        return () => {
            cancelled = true;
        };
    }, [allowed, form.leadType, form.state, form.city]);

    const assignOptions = useMemo(() => [{ value: "", label: "Myself" }, ...assignUsers], [assignUsers]);

    useEffect(() => {
        if (form.assignedUserId && !assignOptions.some((o) => o.value === form.assignedUserId)) {
            setForm((f) => ({ ...f, assignedUserId: "" }));
        }
    }, [assignOptions, form.assignedUserId]);

    const update = (key: keyof FormState, value: string) => {
        if (key === "leadType") {
            const leadType: LeadType = value === "admission" ? "admission" : "franchise";
            setForm((f) => ({ ...f, leadType, source: DEFAULT_SOURCE_BY_LEAD_TYPE[leadType], assignedUserId: "" }));
            setErrors((e) => ({ ...e, leadType: undefined, source: undefined, assignedUserId: undefined }));
            return;
        }
        setForm((f) => ({ ...f, [key]: value, ...(key === "state" ? { city: "" } : {}) }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const validate = (): FieldErrors => {
        const next: FieldErrors = {};
        if (form.fullName.trim().length < 2) next.fullName = "Enter the lead's name.";
        const mobileMsg = mobileError(form.mobile, { complete: true });
        if (mobileMsg) next.mobile = mobileMsg;
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
        if (!form.state) next.state = "Select a state.";
        if (!form.city.trim()) next.city = "Enter the city / district.";
        if (!form.source) next.source = "Select a source.";
        return next;
    };

    const submit = async (allowDuplicate = false) => {
        const found = validate();
        setErrors(found);
        if (Object.keys(found).length) return;

        setSaving(true);
        try {
            const res = await api.post("/leads/add", { ...form, allowDuplicate });
            setCreated(res.data);
            setForm({ ...EMPTY_FORM, leadType: form.leadType, source: DEFAULT_SOURCE_BY_LEAD_TYPE[form.leadType] });
            toast.success("Lead added");
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data || {};
            if (status === 409 && data.duplicate) {
                const ok = window.confirm(`${data.message}\n\nAdd this lead anyway as a separate lead?`);
                if (ok) {
                    setSaving(false);
                    await submit(true);
                    return;
                }
            } else {
                if (data.errors) setErrors(data.errors);
                toast.error(data.message || data.detail || "Could not add the lead. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || !user) return <AccessLoading />;

    if (!allowed) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-lg font-bold text-gray-900">Add Lead not available</h1>
                    <p className="mt-2 text-sm text-gray-600">Only Zonal Managers and CRM Super Admins can add leads.</p>
                    <Link href="/crm-admin" className="btn-primary mt-5 inline-block !py-2 !px-4 text-sm">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8">
            <Toaster position="top-center" />
            <div className="mb-6 flex items-center gap-3">
                <UserPlus className="h-6 w-6 text-blue-700" />
                <h1 className="text-xl font-bold text-gray-800 md:text-2xl">Add Lead</h1>
            </div>

            {created && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    <strong>{created.fullName}</strong> was added
                    {created.assignedUserLabel ? <> and assigned to <strong>{created.assignedUserLabel}</strong></> : null}.{" "}
                    <Link href={`/crm-admin/leads/${created.id}`} className="font-semibold underline">
                        Open lead
                    </Link>
                </div>
            )}

            <form
                className="rounded-xl bg-white p-6 shadow-lg"
                onSubmit={(e) => {
                    e.preventDefault();
                    void submit();
                }}
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field label="Name" required error={errors.fullName}>
                        <input className={inputClass} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Lead name" />
                    </Field>
                    <Field label="Mobile Number" required error={errors.mobile}>
                        <input
                            className={inputClass}
                            value={form.mobile}
                            onChange={(e) => {
                                const mobile = cleanMobileInput(e.target.value);
                                update("mobile", mobile);
                                setErrors((prev) => ({ ...prev, mobile: mobileError(mobile, { complete: false }) }));
                            }}
                            onBlur={() => setErrors((prev) => ({ ...prev, mobile: mobileError(form.mobile, { complete: Boolean(form.mobile) }) }))}
                            placeholder="10-digit mobile"
                            inputMode="numeric"
                            autoComplete="tel"
                        />
                    </Field>
                    <Field label="Lead Channel" required error={errors.leadType}>
                        <SearchableSelect options={leadTypes} value={form.leadType} onChange={(v) => update("leadType", v)} placeholder="Select lead channel" />
                    </Field>
                    <Field label="Source" required error={errors.source}>
                        <SearchableSelect options={sources} value={form.source} onChange={(v) => update("source", v)} placeholder="Select source" />
                    </Field>
                    <Field label="Email" error={errors.email}>
                        <input className={inputClass} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Optional" />
                    </Field>
                    <Field label="State" required error={errors.state}>
                        <SearchableSelect options={states} value={form.state} onChange={(v) => update("state", v)} placeholder="Select state" searchable />
                    </Field>
                    <Field label="City / District" required error={errors.city}>
                        <SearchableSelectOrCreate
                            options={cities}
                            value={form.city}
                            onChange={(v) => update("city", v)}
                            placeholder={form.state ? "Type or select city" : "Select state first"}
                            disabled={!form.state}
                        />
                    </Field>
                    <Field label="Location / Area">
                        <input className={inputClass} value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Kundrathur" />
                    </Field>
                    <Field label="Assign To" error={errors.assignedUserId}>
                        <SearchableSelect options={assignOptions} value={form.assignedUserId} onChange={(v) => update("assignedUserId", v)} placeholder="Myself" searchable />
                    </Field>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Link href="/crm-admin" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Add Lead"}
                    </button>
                </div>
            </form>
        </div>
    );
}

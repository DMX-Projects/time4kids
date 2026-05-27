"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
    Users,
    UserPlus,
    Phone,
    Mail,
    Lock,
    ShieldCheck,
    Trash2,
    Hash,
    CreditCard,
    Upload,
    FileText,
    Car,
} from "lucide-react";
import { useAuth, RoleGuard } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { mediaUrl } from "@/lib/api-client";
import ConfirmModal from "@/components/ui/ConfirmModal";

type DriverProfile = {
    id: number;
    user: {
        id: number;
        email: string;
        full_name: string;
    };
    phone: string;
    service_number?: string;
    license_number?: string;
    license_document?: string | null;
    vehicle_rc?: string | null;
    vehicle_insurance?: string | null;
};

type DriverFormState = {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    service_number: string;
    license_number: string;
};

type DriverUploads = {
    license_document: File | null;
    vehicle_rc: File | null;
    vehicle_insurance: File | null;
};

const EMPTY_FORM: DriverFormState = {
    email: "",
    password: "",
    full_name: "",
    phone: "",
    service_number: "",
    license_number: "",
};

const EMPTY_UPLOADS: DriverUploads = {
    license_document: null,
    vehicle_rc: null,
    vehicle_insurance: null,
};

const normalizeList = <T,>(data: unknown): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && Array.isArray((data as { results?: unknown[] }).results)) {
        return (data as { results: T[] }).results;
    }
    return [];
};

function FileUploadField({
    label,
    accept,
    file,
    onChange,
    icon: Icon,
}: {
    label: string;
    accept: string;
    file: File | null;
    onChange: (file: File | null) => void;
    icon: typeof Upload;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">{label}</label>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2.5 text-left text-sm transition-colors hover:border-blue-400 hover:bg-blue-50/50"
            >
                <span className="flex min-w-0 items-center gap-2 text-[#4B5563]">
                    <Icon className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
                    <span className="truncate">{file ? file.name : "Choose file…"}</span>
                </span>
                <Upload className="h-4 w-4 shrink-0 text-blue-600" />
            </button>
        </div>
    );
}

export default function DriverManagementPage() {
    return (
        <RoleGuard allowedRole="franchise">
            <DriverManagementContent />
        </RoleGuard>
    );
}

function DriverManagementContent() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();
    const [drivers, setDrivers] = useState<DriverProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [lastCreatedId, setLastCreatedId] = useState<number | null>(null);

    const [form, setForm] = useState<DriverFormState>(EMPTY_FORM);
    const [uploads, setUploads] = useState<DriverUploads>(EMPTY_UPLOADS);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null,
    });

    const loadDrivers = useCallback(async (options?: { silent?: boolean }) => {
        if (!options?.silent) setLoading(true);
        try {
            const data = await authFetch<unknown>("/students/franchise/drivers/");
            setDrivers(normalizeList<DriverProfile>(data));
        } catch {
            if (!options?.silent) setDrivers([]);
        } finally {
            if (!options?.silent) setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        void loadDrivers();
    }, [loadDrivers]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);

        const phoneDigits = form.phone.replace(/\D/g, "").slice(-10);
        if (phoneDigits.length !== 10) {
            showToast("Phone number must be exactly 10 digits", "error");
            return;
        }
        if (form.password.length < 8) {
            showToast("Password must be at least 8 characters", "error");
            return;
        }

        const driverName = form.full_name.trim();
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("email", form.email.trim());
            fd.append("password", form.password);
            fd.append("full_name", driverName);
            fd.append("phone", phoneDigits);
            fd.append("service_number", form.service_number.trim());
            fd.append("license_number", form.license_number.trim());
            if (uploads.license_document) fd.append("license_document", uploads.license_document);
            if (uploads.vehicle_rc) fd.append("vehicle_rc", uploads.vehicle_rc);
            if (uploads.vehicle_insurance) fd.append("vehicle_insurance", uploads.vehicle_insurance);

            const created = await authFetch<DriverProfile | null>("/students/franchise/drivers/", {
                method: "POST",
                body: fd,
            });

            const message = created?.user?.full_name
                ? `Driver "${created.user.full_name}" was created successfully.`
                : `Driver "${driverName}" was created successfully.`;

            setSuccessMessage(message);
            showToast(message, "success");
            setForm(EMPTY_FORM);
            setUploads(EMPTY_UPLOADS);

            if (created?.id) {
                setLastCreatedId(created.id);
                setDrivers((prev) => [created, ...prev.filter((d) => d.id !== created.id)]);
            }

            void loadDrivers({ silent: true });
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to create driver account";
            showToast(message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await authFetch(`/students/franchise/drivers/${id}/`, { method: "DELETE" });
            showToast("Driver account deleted", "success");
            await loadDrivers();
        } catch {
            showToast("Failed to delete account", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
                    <ShieldCheck className="w-7 h-7 text-blue-600" />
                    Driver Management
                </h1>
                <p className="text-sm text-[#374151] mt-1">
                    Manage driver accounts for transport tracking. Drivers can login using these credentials on the driver app.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <section className="lg:col-span-1 h-fit bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#F3F4F6]">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        <h2 className="font-bold text-[#111827]">Add New Driver</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {successMessage ? (
                            <div
                                role="status"
                                className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                            >
                                <p className="font-semibold">Driver created</p>
                                <p className="mt-0.5">{successMessage}</p>
                            </div>
                        ) : null}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Full Name</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    required
                                    value={form.full_name}
                                    onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                                    placeholder="John Doe"
                                    className="w-full rounded-xl border border-[#E5E7EB] pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                    placeholder="driver@example.com"
                                    className="w-full rounded-xl border border-[#E5E7EB] pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    required
                                    value={form.phone}
                                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                    placeholder="9876543210"
                                    className="w-full rounded-xl border border-[#E5E7EB] pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Service Number</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    value={form.service_number}
                                    onChange={(e) => setForm((p) => ({ ...p, service_number: e.target.value }))}
                                    placeholder="e.g. SVC-1024"
                                    className="w-full rounded-xl border border-[#E5E7EB] pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">License Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    value={form.license_number}
                                    onChange={(e) => setForm((p) => ({ ...p, license_number: e.target.value }))}
                                    placeholder="DL-XX-YYYY-NNNNNN"
                                    className="w-full rounded-xl border border-[#E5E7EB] pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    required
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-[#E5E7EB] pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Vehicle documents</p>
                            <FileUploadField
                                label="Driving license (scan / photo)"
                                accept="image/*,.pdf"
                                file={uploads.license_document}
                                onChange={(file) => setUploads((p) => ({ ...p, license_document: file }))}
                                icon={FileText}
                            />
                            <FileUploadField
                                label="Vehicle RC"
                                accept="image/*,.pdf"
                                file={uploads.vehicle_rc}
                                onChange={(file) => setUploads((p) => ({ ...p, vehicle_rc: file }))}
                                icon={Car}
                            />
                            <FileUploadField
                                label="Vehicle insurance"
                                accept="image/*,.pdf"
                                file={uploads.vehicle_insurance}
                                onChange={(file) => setUploads((p) => ({ ...p, vehicle_insurance: file }))}
                                icon={ShieldCheck}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-md transform active:scale-[0.98] transition-all font-semibold"
                        >
                            {submitting ? "Creating..." : "Create Account"}
                        </Button>
                    </form>
                </section>

                <section className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
                            Existing Drivers ({drivers.length})
                        </h2>
                        <button
                            type="button"
                            onClick={() => void loadDrivers()}
                            className="text-xs text-blue-600 hover:underline font-medium"
                        >
                            Refresh List
                        </button>
                    </div>

                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    )}

                    {!loading && drivers.length === 0 && (
                        <div className="bg-white border border-dashed border-[#E5E7EB] rounded-2xl py-12 text-center">
                            <Users className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
                            <p className="text-[#6B7280]">No driver accounts found.</p>
                        </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                        {drivers.map((d) => (
                            <div
                                key={d.id}
                                className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative ${
                                    lastCreatedId === d.id
                                        ? "border-green-400 ring-2 ring-green-100"
                                        : "border-[#E5E7EB]"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete({ isOpen: true, id: d.id })}
                                    className="absolute top-4 right-4 p-2 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="space-y-3">
                                    <div>
                                        <h3 className="font-bold text-[#111827] text-lg">{d.user?.full_name}</h3>
                                        <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold uppercase tracking-tight">
                                            <ShieldCheck className="w-3 h-3" />
                                            Active Driver Account
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 text-sm text-[#4B5563]">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-[#9CA3AF]" />
                                            <span className="truncate">{d.user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-[#9CA3AF]" />
                                            <span>{d.phone || "—"}</span>
                                        </div>
                                        {d.service_number ? (
                                            <div className="flex items-center gap-2">
                                                <Hash className="w-4 h-4 text-[#9CA3AF]" />
                                                <span>Service: {d.service_number}</span>
                                            </div>
                                        ) : null}
                                        {d.license_number ? (
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-[#9CA3AF]" />
                                                <span>License: {d.license_number}</span>
                                            </div>
                                        ) : null}
                                    </div>

                                    {(d.license_document || d.vehicle_rc || d.vehicle_insurance) && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {d.license_document ? (
                                                <a
                                                    href={mediaUrl(d.license_document) || d.license_document}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-bold uppercase text-blue-600 hover:underline"
                                                >
                                                    License doc
                                                </a>
                                            ) : null}
                                            {d.vehicle_rc ? (
                                                <a
                                                    href={mediaUrl(d.vehicle_rc) || d.vehicle_rc}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-bold uppercase text-blue-600 hover:underline"
                                                >
                                                    Vehicle RC
                                                </a>
                                            ) : null}
                                            {d.vehicle_insurance ? (
                                                <a
                                                    href={mediaUrl(d.vehicle_insurance) || d.vehicle_insurance}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] font-bold uppercase text-blue-600 hover:underline"
                                                >
                                                    Insurance
                                                </a>
                                            ) : null}
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-[#F3F4F6]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-[#6B7280] uppercase">
                                                Authorized for Transport
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
                title="Delete Driver Account"
                description="Are you sure you want to delete this driver account? This will also remove their user login and access to the driver app."
                confirmText="Yes, Delete"
                variant="danger"
            />
        </div>
    );
}

"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
    Users,
    UserPlus,
    User,
    Lock,
    Presentation,
    Trash2,
    Pencil,
    GraduationCap,
    KeyRound,
    Eye,
    EyeOff,
} from "lucide-react";
import { useAuth, RoleGuard } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";
import { CENTRE_PROGRAM_LABELS } from "@/config/centre-program-cards-defaults";

type TeacherProfile = {
    id: number;
    user: {
        id: number;
        email: string;
        username?: string | null;
        full_name: string;
    };
    class_name: string;
    is_active: boolean;
    created_at?: string;
};

type TeacherFormState = {
    full_name: string;
    class_name: string;
    login: string;
    password: string;
};

type EditState = {
    id: number;
    full_name: string;
    class_name: string;
    password: string;
};

const CLASS_OPTIONS = CENTRE_PROGRAM_LABELS.map((c) => c.label);

const EMPTY_FORM: TeacherFormState = {
    full_name: "",
    class_name: "",
    login: "",
    password: "",
};

const inputClass =
    "w-full rounded-xl border border-[#E5E7EB] pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none transition-all bg-white";
const labelClass = "text-xs font-bold text-[#4B5563] uppercase tracking-wider";

const normalizeList = <T,>(data: unknown): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && Array.isArray((data as { results?: unknown[] }).results)) {
        return (data as { results: T[] }).results;
    }
    return [];
};

/** Login ID shown to the centre: the username they typed, never the generated `@teachers.local` email. */
const loginIdFor = (t: TeacherProfile) => (t.user?.username || "").trim() || (t.user?.email || "").trim();

export default function TeacherManagementPage() {
    return (
        <RoleGuard allowedRole="franchise">
            <TeacherManagementContent />
        </RoleGuard>
    );
}

function TeacherManagementContent() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();
    const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [lastCreatedId, setLastCreatedId] = useState<number | null>(null);
    const [form, setForm] = useState<TeacherFormState>(EMPTY_FORM);
    const [edit, setEdit] = useState<EditState | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [classFilter, setClassFilter] = useState("");
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null,
    });

    const loadTeachers = useCallback(
        async (options?: { silent?: boolean }) => {
            if (!options?.silent) setLoading(true);
            try {
                const data = await authFetch<unknown>("/students/franchise/teachers/");
                setTeachers(normalizeList<TeacherProfile>(data));
            } catch {
                if (!options?.silent) setTeachers([]);
            } finally {
                if (!options?.silent) setLoading(false);
            }
        },
        [authFetch],
    );

    useEffect(() => {
        void loadTeachers();
    }, [loadTeachers]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.class_name) {
            showToast("Select the class this teacher handles", "error");
            return;
        }
        if (form.password.length < 8) {
            showToast("Password must be at least 8 characters", "error");
            return;
        }
        if (/\s/.test(form.login.trim())) {
            showToast("Username cannot contain spaces", "error");
            return;
        }

        const teacherName = form.full_name.trim();
        setSubmitting(true);
        try {
            const created = await authFetch<TeacherProfile | null>("/students/franchise/teachers/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: teacherName,
                    class_name: form.class_name,
                    email: form.login.trim(),
                    password: form.password,
                }),
            });

            showToast(
                `Teacher login created for "${created?.user?.full_name || teacherName}". Share the username and password with them.`,
                "success",
            );
            setForm(EMPTY_FORM);
            setShowPassword(false);
            if (created?.id) {
                setLastCreatedId(created.id);
                setTeachers((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
            }
            void loadTeachers({ silent: true });
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Failed to create teacher login", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveEdit = async (e: FormEvent) => {
        e.preventDefault();
        if (!edit) return;
        if (edit.password && edit.password.length < 8) {
            showToast("New password must be at least 8 characters", "error");
            return;
        }
        setSavingEdit(true);
        try {
            const payload: Record<string, string> = {
                full_name: edit.full_name.trim(),
                class_name: edit.class_name,
            };
            if (edit.password) payload.password = edit.password;
            const updated = await authFetch<TeacherProfile>(`/students/franchise/teachers/${edit.id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            showToast(edit.password ? "Teacher updated and password reset" : "Teacher updated", "success");
            setEdit(null);
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Failed to update teacher", "error");
        } finally {
            setSavingEdit(false);
        }
    };

    const handleToggleActive = async (t: TeacherProfile) => {
        setTogglingId(t.id);
        try {
            const updated = await authFetch<TeacherProfile>(`/students/franchise/teachers/${t.id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !t.is_active }),
            });
            setTeachers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
            showToast(updated.is_active ? "Teacher login enabled" : "Teacher login disabled", "success");
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Failed to update status", "error");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await authFetch(`/students/franchise/teachers/${id}/`, { method: "DELETE" });
            showToast("Teacher login deleted", "success");
            setTeachers((prev) => prev.filter((t) => t.id !== id));
        } catch {
            showToast("Failed to delete teacher login", "error");
        }
    };

    const visibleTeachers = classFilter ? teachers.filter((t) => t.class_name === classFilter) : teachers;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
                    <Presentation className="w-7 h-7 text-blue-600" />
                    Teacher Logins
                </h1>
                <p className="text-sm text-[#374151] mt-1">
                    Create a login for each class teacher. Teachers sign in from the main website login with the
                    username and password you set here, and see the students of their assigned class.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <section className="lg:col-span-1 h-fit bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#F3F4F6]">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        <h2 className="font-bold text-[#111827]">Add New Teacher</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className={labelClass}>Teacher Name</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    required
                                    value={form.full_name}
                                    onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                                    placeholder="e.g. Priya Sharma"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className={labelClass}>Class</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <select
                                    required
                                    value={form.class_name}
                                    onChange={(e) => setForm((p) => ({ ...p, class_name: e.target.value }))}
                                    className={inputClass}
                                >
                                    <option value="">Select class</option>
                                    {CLASS_OPTIONS.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className={labelClass}>Username or Email</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    required
                                    autoComplete="off"
                                    value={form.login}
                                    onChange={(e) => setForm((p) => ({ ...p, login: e.target.value }))}
                                    placeholder="e.g. priya.nursery"
                                    className={inputClass}
                                />
                            </div>
                            <p className="text-[11px] text-[#6B7280]">The teacher types this on the login page.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className={labelClass}>Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    required
                                    autoComplete="new-password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                                    placeholder="Minimum 8 characters"
                                    className={`${inputClass} pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-md transform active:scale-[0.98] transition-all font-semibold"
                        >
                            {submitting ? "Creating..." : "Create Teacher Login"}
                        </Button>
                    </form>
                </section>

                <section className="lg:col-span-2 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
                            Existing Teachers ({visibleTeachers.length})
                        </h2>
                        <div className="flex items-center gap-3">
                            <select
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#374151] outline-none focus:border-blue-500"
                            >
                                <option value="">All classes</option>
                                {CLASS_OPTIONS.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => void loadTeachers()}
                                className="text-xs text-blue-600 hover:underline font-medium"
                            >
                                Refresh List
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    )}

                    {!loading && visibleTeachers.length === 0 && (
                        <div className="bg-white border border-dashed border-[#E5E7EB] rounded-2xl py-12 text-center">
                            <Presentation className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
                            <p className="text-[#6B7280]">
                                {teachers.length === 0 ? "No teacher logins yet." : "No teachers for this class."}
                            </p>
                        </div>
                    )}

                    {!loading && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {visibleTeachers.map((t) => (
                                <div
                                    key={t.id}
                                    className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${
                                        lastCreatedId === t.id
                                            ? "border-green-400 ring-2 ring-green-100"
                                            : "border-[#E5E7EB]"
                                    } ${t.is_active ? "" : "opacity-70"}`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-[#111827] text-lg truncate">
                                                {t.user?.full_name || loginIdFor(t)}
                                            </h3>
                                            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                                <GraduationCap className="w-3 h-3" />
                                                {t.class_name}
                                            </span>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <button
                                                type="button"
                                                title="Edit / reset password"
                                                onClick={() =>
                                                    setEdit({
                                                        id: t.id,
                                                        full_name: t.user?.full_name || "",
                                                        class_name: t.class_name,
                                                        password: "",
                                                    })
                                                }
                                                className="p-2 text-[#9CA3AF] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                title="Delete login"
                                                onClick={() => setConfirmDelete({ isOpen: true, id: t.id })}
                                                className="p-2 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2 text-sm text-[#4B5563]">
                                        <User className="w-4 h-4 text-[#9CA3AF]" />
                                        <span className="truncate">
                                            Login: <span className="font-medium text-[#111827]">{loginIdFor(t)}</span>
                                        </span>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${t.is_active ? "bg-green-500" : "bg-gray-400"}`}
                                            />
                                            <span className="text-[10px] font-bold text-[#6B7280] uppercase">
                                                {t.is_active ? "Login enabled" : "Login disabled"}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={togglingId === t.id}
                                            onClick={() => void handleToggleActive(t)}
                                            className={`text-xs font-semibold hover:underline disabled:opacity-50 ${
                                                t.is_active ? "text-red-600" : "text-green-700"
                                            }`}
                                        >
                                            {togglingId === t.id ? "Saving..." : t.is_active ? "Disable" : "Enable"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <Modal isOpen={edit !== null} onClose={() => setEdit(null)} title="Edit Teacher" size="sm">
                {edit && (
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className={labelClass}>Teacher Name</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    required
                                    value={edit.full_name}
                                    onChange={(e) => setEdit((p) => (p ? { ...p, full_name: e.target.value } : p))}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Class</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <select
                                    required
                                    value={edit.class_name}
                                    onChange={(e) => setEdit((p) => (p ? { ...p, class_name: e.target.value } : p))}
                                    className={inputClass}
                                >
                                    {!CLASS_OPTIONS.includes(edit.class_name) && edit.class_name ? (
                                        <option value={edit.class_name}>{edit.class_name}</option>
                                    ) : null}
                                    {CLASS_OPTIONS.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>New Password (optional)</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    type="text"
                                    autoComplete="new-password"
                                    value={edit.password}
                                    onChange={(e) => setEdit((p) => (p ? { ...p, password: e.target.value } : p))}
                                    placeholder="Leave blank to keep current password"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEdit(null)}
                                className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={savingEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {savingEdit ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
                title="Delete Teacher Login"
                description="Are you sure you want to delete this teacher? Their login will be removed and they will no longer be able to sign in."
                confirmText="Yes, Delete"
                variant="danger"
            />
        </div>
    );
}

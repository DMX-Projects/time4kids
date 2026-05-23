"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import { AdminParentAppChecklist } from "@/components/dashboard/admin/AdminParentAppChecklist";
import {
    PARENT_DOCUMENT_CATEGORIES,
    PARENT_DOCUMENT_STATES,
} from "@/config/parent-document-categories";
import type { AdminParentAppUploadContext } from "@/lib/admin-parent-app-upload";

export type ParentDocumentRow = {
    id: number;
    category: string;
    category_display?: string;
    title: string;
    display_title?: string;
    description?: string;
    file: string;
    file_view_path?: string | null;
    franchise: number | null;
    franchise_name?: string | null;
    state?: string | null;
    state_display?: string | null;
    academic_year?: string;
    is_active: boolean;
    order: number;
    created_at?: string;
};

const emptyForm = {
    category: "CLASS_TIMETABLE",
    title: "",
    description: "",
    academic_year: "AY 2026-27",
    state: "",
    order: 0,
    is_active: true,
    franchise_id: "" as string,
};

export default function AdminParentDocumentsPage() {
    const { authFetch } = useAuth();
    const { franchises } = useAdminData();
    const { showToast } = useToast();
    const [items, setItems] = useState<ParentDocumentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ParentDocumentRow | null>(null);
    const [uploadContext, setUploadContext] = useState<AdminParentAppUploadContext | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const isHoliday = form.category === "HOLIDAY_LISTS";
    const isTimetable = form.category === "CLASS_TIMETABLE";

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authFetch<ParentDocumentRow[]>("/documents/admin/parent-documents/");
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            showToast("Could not load parent documents.", "error");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const openCreateManual = () => {
        setEditing(null);
        setUploadContext(null);
        setForm({ ...emptyForm });
        setFile(null);
        setModalOpen(true);
    };

    const openFromChecklist = (ctx: AdminParentAppUploadContext) => {
        setUploadContext(ctx);
        const existing = ctx.matchedDocId
            ? items.find((row) => row.id === ctx.matchedDocId)
            : undefined;

        if (existing) {
            setEditing(existing);
            setForm({
                category: existing.category,
                title: existing.title,
                description: existing.description || "",
                academic_year: existing.academic_year || "AY 2026-27",
                state: existing.state || "",
                order: existing.order ?? 0,
                is_active: existing.is_active,
                franchise_id: existing.franchise != null ? String(existing.franchise) : "",
            });
        } else {
            setEditing(null);
            setForm({
                ...emptyForm,
                category: ctx.category,
                title: ctx.suggestedTitle || "",
                state: ctx.state || "",
            });
        }
        setFile(null);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
        setUploadContext(null);
        setFile(null);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isHoliday && !form.state) {
            showToast("Select a state for holiday lists.", "error");
            return;
        }
        if (isTimetable && file) {
            const name = file.name.toLowerCase();
            if (file.type !== "application/pdf" && !name.endsWith(".pdf")) {
                showToast("Class timetable must be a PDF.", "error");
                return;
            }
        }
        if (!editing && !file) {
            showToast("Choose a file to upload.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const franchise =
                form.franchise_id === "" || form.franchise_id === "__global__"
                    ? null
                    : Number(form.franchise_id);

            if (editing) {
                const metaBody = {
                    category: form.category,
                    title: form.title.trim() || editing.title,
                    description: form.description,
                    academic_year: form.academic_year || "",
                    state: isHoliday ? form.state : null,
                    order: form.order,
                    is_active: form.is_active,
                    franchise,
                };
                await authFetch(`/documents/admin/parent-documents/${editing.id}/`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(metaBody),
                });
                if (file) {
                    const fd = new FormData();
                    fd.append("file", file);
                    await authFetch(`/documents/admin/parent-documents/${editing.id}/`, {
                        method: "PATCH",
                        body: fd,
                    });
                }
                showToast("Document updated.", "success");
            } else {
                const fd = new FormData();
                fd.append("category", form.category);
                fd.append("title", form.title.trim() || file!.name);
                fd.append("description", form.description);
                fd.append("academic_year", form.academic_year);
                fd.append("order", String(form.order));
                fd.append("is_active", form.is_active ? "true" : "false");
                if (isHoliday) fd.append("state", form.state);
                if (franchise != null) fd.append("franchise", String(franchise));
                fd.append("file", file!);
                await authFetch("/documents/admin/parent-documents/", { method: "POST", body: fd });
                showToast("Document uploaded for parents.", "success");
            }
            closeModal();
            await load();
        } catch (err) {
            console.error(err);
            showToast("Save failed. Check file type and required fields.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                    <h1 className="text-2xl font-semibold text-slate-900">Parent app documents</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Each row is where the file appears in the parent app. Click <strong>Upload</strong> on
                        that row — e.g. <span className="text-slate-800">Holiday Lists › Karnataka</span>.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={openCreateManual}
                    className="shrink-0 border-orange-200 text-orange-900 hover:bg-orange-50"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Manual upload
                </Button>
            </div>

            {loading ? (
                <p className="text-sm text-slate-500">Loading checklist…</p>
            ) : (
                <AdminParentAppChecklist docs={items} onManageLink={openFromChecklist} />
            )}

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={
                    editing
                        ? "Edit parent document"
                        : uploadContext
                          ? "Upload for parent app"
                          : "Manual upload"
                }
            >
                <form onSubmit={submit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {uploadContext ? (
                        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900">
                            {uploadContext.breadcrumbLabel}
                        </p>
                    ) : null}

                    <label className="text-xs font-semibold text-slate-600 block">
                        Category
                        <select
                            value={form.category}
                            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                            required
                        >
                            {PARENT_DOCUMENT_CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-600 block">
                        Centre (optional)
                        <select
                            value={form.franchise_id === "" ? "__global__" : form.franchise_id}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    franchise_id: e.target.value === "__global__" ? "" : e.target.value,
                                }))
                            }
                            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        >
                            <option value="__global__">Global — all parents</option>
                            {franchises.map((f) => (
                                <option key={f.id} value={String(f.id)}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    {isHoliday && (
                        <>
                            <label className="text-xs font-semibold text-slate-600 block">
                                State
                                <select
                                    value={form.state}
                                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select state</option>
                                    {PARENT_DOCUMENT_STATES.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="text-xs font-semibold text-slate-600 block">
                                Academic year
                                <input
                                    value={form.academic_year}
                                    onChange={(e) => setForm((p) => ({ ...p, academic_year: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                                />
                            </label>
                        </>
                    )}
                    <label className="text-xs font-semibold text-slate-600 block">
                        Title
                        <input
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            placeholder={editing ? "" : "Defaults to file name"}
                            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="text-xs font-semibold text-slate-600 block">
                        Description
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            rows={2}
                            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="text-xs font-semibold text-slate-600 block">
                        File {editing ? "(leave empty to keep current)" : ""}
                        <input
                            type="file"
                            accept={isTimetable ? ".pdf,application/pdf" : undefined}
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                            required={!editing}
                        />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                        />
                        Visible in parent app
                    </label>
                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={submitting} className="bg-orange-500">
                            <Upload className="w-4 h-4 mr-2" />
                            {submitting ? "Saving…" : editing ? "Save changes" : "Upload"}
                        </Button>
                        <Button type="button" variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

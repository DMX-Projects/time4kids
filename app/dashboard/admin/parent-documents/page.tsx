"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import {
    AdminParentAppChecklist,
    type ParentAppAddRequest,
    type ParentAppRenameRequest,
} from "@/components/dashboard/admin/AdminParentAppChecklist";
import { ChecklistFileUploadField } from "@/components/dashboard/admin/ChecklistFileUploadField";
import {
    PARENT_DOCUMENT_CATEGORIES,
    PARENT_DOCUMENT_STATES,
} from "@/config/parent-document-categories";
import type { AdminParentAppUploadContext } from "@/lib/admin-parent-app-upload";
import {
    acceptForParentDocumentCategory,
    uploadHintForParentDocumentCategory,
} from "@/lib/parent-document-upload-accept";
import { validateAdminParentDocumentUpload } from "@/lib/franchise-centre-upload";
import {
    PARENT_APP_NAV_CUSTOM_SLUG,
    emptyParentAppNavCustom,
    mergeParentAppChecklist,
    renameParentAppLabel,
    type ParentAppNavCustomData,
} from "@/lib/parent-app-nav-custom";

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

function parseParentNavCustom(raw: unknown): ParentAppNavCustomData {
    if (!raw || typeof raw !== "object") return emptyParentAppNavCustom();
    const o = raw as Record<string, unknown>;
    return {
        sectionTitles:
            o.sectionTitles && typeof o.sectionTitles === "object"
                ? (o.sectionTitles as Record<string, string>)
                : {},
        slotLabels:
            o.slotLabels && typeof o.slotLabels === "object"
                ? (o.slotLabels as Record<string, string>)
                : {},
    };
}

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
    const [addForCentreOnly, setAddForCentreOnly] = useState(false);
    const [navCustom, setNavCustom] = useState<ParentAppNavCustomData>(emptyParentAppNavCustom());
    const [renameModal, setRenameModal] = useState<ParentAppRenameRequest | null>(null);
    const [renameTitle, setRenameTitle] = useState("");
    const [renameSaving, setRenameSaving] = useState(false);

    const mergedSections = useMemo(() => mergeParentAppChecklist(navCustom), [navCustom]);

    const saveNavCustom = useCallback(
        async (next: ParentAppNavCustomData) => {
            await authFetch(`/common/page-content/${PARENT_APP_NAV_CUSTOM_SLUG}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(next),
            });
            setNavCustom(next);
        },
        [authFetch],
    );

    const isHoliday = form.category === "HOLIDAY_LISTS";
    const isTimetable = form.category === "CLASS_TIMETABLE";

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [data, navData] = await Promise.all([
                authFetch<ParentDocumentRow[]>("/documents/admin/parent-documents/"),
                authFetch<ParentAppNavCustomData>(`/common/page-content/${PARENT_APP_NAV_CUSTOM_SLUG}/`).catch(
                    () => emptyParentAppNavCustom(),
                ),
            ]);
            setItems(Array.isArray(data) ? data : []);
            setNavCustom(parseParentNavCustom(navData));
        } catch (e) {
            console.error(e);
            showToast("Could not load parent documents.", "error");
            setItems([]);
            setNavCustom(emptyParentAppNavCustom());
        } finally {
            setLoading(false);
        }
    }, [authFetch, showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const deleteDocById = useCallback(
        async (id: number) => {
            await authFetch(`/documents/admin/parent-documents/${id}/`, { method: "DELETE" });
            setItems((prev) => prev.filter((row) => row.id !== id));
        },
        [authFetch],
    );

    const handleDeleteUpload = useCallback(
        async (ctx: AdminParentAppUploadContext) => {
            if (ctx.matchedDocId == null) return;
            if (!window.confirm(`Delete "${ctx.breadcrumbLabel}" permanently? Parents will no longer see it.`)) {
                return;
            }
            try {
                await deleteDocById(ctx.matchedDocId);
                showToast("Upload deleted.", "success");
            } catch {
                showToast("Delete failed.", "error");
            }
        },
        [deleteDocById, showToast],
    );

    const handleAddRequest = (req: ParentAppAddRequest) => {
        setEditing(null);
        setAddForCentreOnly(req.kind === "centreDocument");
        setUploadContext({
            id: `new-${req.section.category}-${req.kind}`,
            category: req.section.category,
            breadcrumbLabel:
                req.kind === "centreDocument"
                    ? `${req.section.title} › New upload (one centre)`
                    : `${req.section.title} › New upload (all centres)`,
            franchiseId: null,
            suggestedTitle: req.section.title,
        });
        setForm({
            ...emptyForm,
            category: req.section.category,
        });
        setFile(null);
        setModalOpen(true);
    };

    const handleRenameRequest = (req: ParentAppRenameRequest) => {
        setRenameModal(req);
        setRenameTitle(req.currentTitle);
    };

    const submitRename = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!renameModal) return;
        const title = renameTitle.trim();
        if (!title) {
            showToast("Name is required.", "error");
            return;
        }
        setRenameSaving(true);
        try {
            const next = renameParentAppLabel(navCustom, renameModal, title);
            await saveNavCustom(next);
            setRenameModal(null);
            setRenameTitle("");
            showToast("Name updated.", "success");
        } catch {
            showToast("Could not rename.", "error");
        } finally {
            setRenameSaving(false);
        }
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
        setAddForCentreOnly(false);
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
        if (!editing && addForCentreOnly && (form.franchise_id === "" || form.franchise_id === "__global__")) {
            showToast("Select a centre for this upload.", "error");
            return;
        }
        if (file) {
            const sizeErr = validateAdminParentDocumentUpload(file);
            if (sizeErr) {
                showToast(sizeErr, "error");
                return;
            }
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
            <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold text-slate-900">Parent app documents</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Each section matches the parent app. Use <strong>Rename</strong> on section or row names.
                    Click <strong>Add</strong> on an existing section to add another file — no new subsection needed.
                    Uploaded file titles can also be changed with <strong>Edit</strong>.
                </p>
            </div>

            {loading ? (
                <p className="text-sm text-slate-500">Loading checklist…</p>
            ) : (
                <AdminParentAppChecklist
                    docs={items}
                    sections={mergedSections}
                    onManageLink={openFromChecklist}
                    onAddRequest={handleAddRequest}
                    onRenameRequest={handleRenameRequest}
                    onDeleteUpload={handleDeleteUpload}
                />
            )}

            <Modal
                isOpen={renameModal != null}
                onClose={() => {
                    setRenameModal(null);
                    setRenameTitle("");
                }}
                title="Rename"
                size="sm"
            >
                <form onSubmit={submitRename} className="space-y-3">
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                        Display name
                        <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={renameTitle}
                            onChange={(e) => setRenameTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </label>
                    <div className="flex gap-2 pt-1">
                        <Button type="submit" size="sm" disabled={renameSaving}>
                            {renameSaving ? "Saving…" : "Save"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setRenameModal(null);
                                setRenameTitle("");
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? "Edit parent document" : "Upload for parent app"}
            >
                <form onSubmit={submit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {uploadContext ? (
                        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900">
                            {uploadContext.breadcrumbLabel}
                        </p>
                    ) : null}

                    {!uploadContext ? (
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
                    ) : null}
                    {addForCentreOnly ? (
                        <label className="text-xs font-semibold text-slate-600 block">
                            Centre (required)
                            <select
                                value={form.franchise_id === "" ? "__global__" : form.franchise_id}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        franchise_id: e.target.value === "__global__" ? "" : e.target.value,
                                    }))
                                }
                                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                                required
                            >
                                <option value="__global__">Select a centre…</option>
                                {franchises.map((f) => (
                                    <option key={f.id} value={String(f.id)}>
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ) : null}
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
                    <ChecklistFileUploadField
                        id="parent-app-file"
                        accept={acceptForParentDocumentCategory(form.category)}
                        hint={uploadHintForParentDocumentCategory(form.category)}
                        required={!editing}
                        currentName={file?.name ?? (editing?.file ? "Current file on server" : null)}
                        onChange={setFile}
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                        />
                        Visible in parent app
                    </label>
                    {editing?.id ? (
                        <div className="pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-red-700 border-red-200 hover:bg-red-50"
                                onClick={() => {
                                    if (!window.confirm("Delete this upload permanently? Parents will no longer see it.")) {
                                        return;
                                    }
                                    void deleteDocById(editing.id)
                                        .then(() => {
                                            showToast("Upload deleted.", "success");
                                            closeModal();
                                        })
                                        .catch(() => showToast("Delete failed.", "error"));
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete upload
                            </Button>
                        </div>
                    ) : null}
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

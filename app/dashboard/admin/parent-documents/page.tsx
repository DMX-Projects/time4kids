"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Pencil, Plus, Trash2, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import {
    PARENT_DOCUMENT_CATEGORIES,
    PARENT_DOCUMENT_STATES,
} from "@/config/parent-document-categories";
import { openParentDocumentFile } from "@/lib/parent-document-file-open";

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
    const { authFetch, tokens, authFetchBlobResponse } = useAuth();
    const { franchises } = useAdminData();
    const { showToast } = useToast();
    const [items, setItems] = useState<ParentDocumentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [franchiseFilter, setFranchiseFilter] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ParentDocumentRow | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteAllOpen, setDeleteAllOpen] = useState(false);
    const [deletingAll, setDeletingAll] = useState(false);

    const isHoliday = form.category === "HOLIDAY_LISTS";
    const isTimetable = form.category === "CLASS_TIMETABLE";

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (categoryFilter) params.set("category", categoryFilter);
            if (franchiseFilter === "global") params.set("franchise", "global");
            else if (franchiseFilter) params.set("franchise", franchiseFilter);
            const q = params.toString() ? `?${params}` : "";
            const data = await authFetch<ParentDocumentRow[]>(`/documents/admin/parent-documents/${q}`);
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            showToast("Could not load parent documents.", "error");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, categoryFilter, franchiseFilter, showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const grouped = useMemo(() => {
        const map = new Map<string, ParentDocumentRow[]>();
        for (const row of items) {
            const key = row.category_display || row.category;
            map.set(key, [...(map.get(key) || []), row]);
        }
        return Array.from(map.entries());
    }, [items]);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyForm, category: categoryFilter || emptyForm.category });
        setFile(null);
        setModalOpen(true);
    };

    const openEdit = (row: ParentDocumentRow) => {
        setEditing(row);
        setForm({
            category: row.category,
            title: row.title,
            description: row.description || "",
            academic_year: row.academic_year || "",
            state: row.state || "",
            order: row.order ?? 0,
            is_active: row.is_active,
            franchise_id: row.franchise != null ? String(row.franchise) : "",
        });
        setFile(null);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
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

    const onDelete = async () => {
        if (deleteId == null) return;
        try {
            await authFetch(`/documents/admin/parent-documents/${deleteId}/`, { method: "DELETE" });
            showToast("Document removed.", "success");
            setDeleteId(null);
            await load();
        } catch {
            showToast("Delete failed.", "error");
        }
    };

    const onDeleteAll = async () => {
        if (items.length === 0) return;
        setDeletingAll(true);
        let ok = 0;
        let failed = 0;
        for (const row of items) {
            try {
                await authFetch(`/documents/admin/parent-documents/${row.id}/`, { method: "DELETE" });
                ok++;
            } catch {
                failed++;
            }
        }
        setDeletingAll(false);
        setDeleteAllOpen(false);
        if (failed === 0) {
            showToast(`Removed ${ok} document(s).`, "success");
        } else {
            showToast(`Removed ${ok}; ${failed} failed.`, ok > 0 ? "success" : "error");
        }
        await load();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Parent app documents</h1>
                    <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                        Upload timetables, holiday lists, policies, and other files for the parent mobile app.
                        Leave centre blank for all parents; pick a centre for centre-only files. Franchises cannot
                        upload these — head office only.
                    </p>
                </div>
                <Button type="button" onClick={openCreate} className="bg-orange-500 hover:brightness-105 shrink-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Add document
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <label className="text-xs font-medium text-slate-600">
                    Category
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                        <option value="">All categories</option>
                        {PARENT_DOCUMENT_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-medium text-slate-600">
                    Centre
                    <select
                        value={franchiseFilter}
                        onChange={(e) => setFranchiseFilter(e.target.value)}
                        className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm min-w-[200px]"
                    >
                        <option value="">All centres</option>
                        <option value="global">Global (all parents)</option>
                        {franchises.map((f) => (
                            <option key={f.id} value={String(f.id)}>
                                {f.name}
                            </option>
                        ))}
                    </select>
                </label>
                {items.length > 0 ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="self-end border-red-200 text-red-700 hover:bg-red-50"
                        disabled={deletingAll}
                        onClick={() => setDeleteAllOpen(true)}
                    >
                        <Trash2 className="w-4 h-4 mr-1 inline" />
                        Delete all ({items.length})
                    </Button>
                ) : null}
            </div>

            {loading && <p className="text-sm text-slate-500">Loading…</p>}
            {!loading && items.length === 0 && (
                <p className="text-sm text-slate-500">No documents yet. Use Add document to upload.</p>
            )}

            {grouped.map(([name, rows]) => (
                <section key={name} className="bg-white border border-slate-200 rounded-2xl p-4">
                    <h2 className="text-sm font-semibold text-slate-800 mb-3">{name}</h2>
                    <div className="space-y-2">
                        {rows.map((d) => (
                            <div
                                key={d.id}
                                className="flex flex-wrap items-center justify-between gap-2 border border-slate-100 rounded-xl px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                        {d.display_title || d.title}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {d.franchise_name ? d.franchise_name : "All centres"}
                                        {d.is_active ? "" : " · inactive"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openParentDocumentFile(tokens?.access, authFetchBlobResponse, d)
                                        }
                                        className="text-blue-600 text-xs font-semibold inline-flex items-center gap-1"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Open
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openEdit(d)}
                                        className="text-slate-600 text-xs font-semibold inline-flex items-center gap-1"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteId(d.id)}
                                        className="text-red-600 text-xs font-semibold inline-flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? "Edit parent document" : "Upload parent document"}>
                <form onSubmit={submit} className="space-y-3">
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
                            value={form.franchise_id}
                            onChange={(e) => setForm((p) => ({ ...p, franchise_id: e.target.value }))}
                            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        >
                            <option value="">Global — all parents</option>
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

            <ConfirmModal
                isOpen={deleteId != null}
                onClose={() => setDeleteId(null)}
                onConfirm={onDelete}
                title="Delete document?"
                description="Parents will no longer see this file."
                confirmText="Delete"
                variant="danger"
            />

            <ConfirmModal
                isOpen={deleteAllOpen}
                onClose={() => !deletingAll && setDeleteAllOpen(false)}
                onConfirm={onDeleteAll}
                title="Delete all parent app documents?"
                description={`This permanently deletes all ${items.length} document(s) currently listed (respects category and centre filters). Parents will no longer see them in the app.`}
                confirmText={deletingAll ? "Deleting…" : "Delete all"}
                variant="danger"
            />
        </div>
    );
}

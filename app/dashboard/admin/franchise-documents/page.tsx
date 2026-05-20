"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import { mediaUrl } from "@/lib/api-client";
import { FRANCHISE_DOCUMENT_CATEGORY_ORDER } from "@/config/franchise-dashboard-resource-order";
import { FranchiseCentreBulkUpload } from "@/components/franchise/FranchiseCentreBulkUpload";
import { getFranchiseResourceFileMetaFromDoc } from "@/lib/franchise-resource-file-meta";
import { resolveFranchiseEmbedSrc } from "@/lib/franchise-embed-url";
import { Plus, Pencil, Trash2, ExternalLink, Info } from "lucide-react";

export type FranchiseResourceDoc = {
    id: number;
    category: string;
    category_display?: string;
    title: string;
    source_path?: string | null;
    description?: string;
    file: string | null;
    embed_url?: string | null;
    franchise: number | null;
    franchise_name?: string | null;
    academic_year: string;
    is_active: boolean;
    order: number;
    created_at?: string;
    updated_at?: string;
};

function sortDocsByCategoryOrder(list: FranchiseResourceDoc[]): FranchiseResourceDoc[] {
    const rank = new Map(FRANCHISE_DOCUMENT_CATEGORY_ORDER.map((c, i) => [c.value, i]));
    return [...list].sort((a, b) => {
        const ra = rank.get(a.category) ?? 999;
        const rb = rank.get(b.category) ?? 999;
        if (ra !== rb) return ra - rb;
        const oa = a.order ?? 0;
        const ob = b.order ?? 0;
        if (oa !== ob) return oa - ob;
        return (a.title || "").localeCompare(b.title || "");
    });
}

const emptyForm = {
    category: "ACADEMIC_DOCUMENTS",
    title: "",
    source_path: "",
    embed_url: "",
    description: "",
    academic_year: "",
    order: 0,
    is_active: true,
    franchise_id: "" as string | number,
};

export default function AdminFranchiseDocumentsPage() {
    const { authFetch } = useAuth();
    const { franchises } = useAdminData();
    const { showToast } = useToast();
    const [items, setItems] = useState<FranchiseResourceDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FranchiseResourceDoc | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteAllOpen, setDeleteAllOpen] = useState(false);
    const [deletingAll, setDeletingAll] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const q = categoryFilter ? `?category=${encodeURIComponent(categoryFilter)}` : "";
            const data = await authFetch<FranchiseResourceDoc[] | { results: FranchiseResourceDoc[] }>(
                `/documents/admin/franchise-documents/${q}`,
            );
            const list = Array.isArray(data) ? data : data?.results ?? [];
            setItems(sortDocsByCategoryOrder(list));
        } catch (e) {
            console.error(e);
            showToast("Could not load documents.", "error");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, categoryFilter, showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setFile(null);
        setModalOpen(true);
    };

    const openEdit = (row: FranchiseResourceDoc) => {
        setEditing(row);
        setForm({
            category: row.category,
            title: row.title,
            source_path: row.source_path ?? "",
            embed_url: row.embed_url ?? "",
            description: row.description ?? "",
            academic_year: row.academic_year ?? "",
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
        if (!form.title.trim()) {
            showToast("Title is required.", "error");
            return;
        }
        const embedRaw = form.embed_url.trim();
        const embedNormalized = embedRaw ? resolveFranchiseEmbedSrc(embedRaw) : null;
        if (embedRaw && !embedNormalized) {
            showToast("Could not read that embed link. Paste a YouTube or MediaDelivery embed URL.", "error");
            return;
        }
        if (file && embedNormalized) {
            showToast("Use either a file upload or an embed link, not both.", "error");
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
                    title: form.title.trim(),
                    source_path: form.source_path.trim() || null,
                    embed_url: embedNormalized || "",
                    description: form.description,
                    academic_year: form.academic_year || "",
                    order: form.order,
                    is_active: form.is_active,
                    franchise,
                };
                await authFetch(`/documents/admin/franchise-documents/${editing.id}/`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(metaBody),
                });
                if (file) {
                    const fd = new FormData();
                    fd.append("file", file);
                    await authFetch(`/documents/admin/franchise-documents/${editing.id}/`, {
                        method: "PATCH",
                        body: fd,
                    });
                }
                showToast("Document updated.", "success");
            } else {
                if (!file && !embedNormalized) {
                    showToast("Upload a file or paste an embed/video link.", "error");
                    setSubmitting(false);
                    return;
                }
                if (embedNormalized) {
                    await authFetch("/documents/admin/franchise-documents/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            category: form.category,
                            title: form.title.trim(),
                            source_path: form.source_path.trim() || null,
                            embed_url: embedNormalized,
                            description: form.description,
                            academic_year: form.academic_year,
                            order: form.order,
                            is_active: form.is_active,
                            franchise,
                        }),
                    });
                } else if (file) {
                    const fd = new FormData();
                    fd.append("category", form.category);
                    fd.append("title", form.title.trim());
                    if (form.source_path.trim()) fd.append("source_path", form.source_path.trim());
                    fd.append("description", form.description);
                    fd.append("academic_year", form.academic_year);
                    fd.append("order", String(form.order));
                    fd.append("is_active", form.is_active ? "true" : "false");
                    if (franchise != null) fd.append("franchise", String(franchise));
                    fd.append("file", file);
                    await authFetch("/documents/admin/franchise-documents/", {
                        method: "POST",
                        body: fd,
                    });
                }
                showToast("Document saved to database.", "success");
            }
            closeModal();
            void load();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Save failed.";
            showToast(msg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (deleteId == null) return;
        try {
            await authFetch(`/documents/admin/franchise-documents/${deleteId}/`, { method: "DELETE" });
            showToast("Deleted.", "success");
            setDeleteId(null);
            void load();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Delete failed.";
            showToast(msg, "error");
        }
    };

    const confirmDeleteAll = async () => {
        if (items.length === 0) return;
        setDeletingAll(true);
        let ok = 0;
        let failed = 0;
        for (const row of items) {
            try {
                await authFetch(`/documents/admin/franchise-documents/${row.id}/`, { method: "DELETE" });
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
        void load();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-orange-900">Centre page documents</h1>
                    <p className="text-sm text-orange-800/90 mt-1 max-w-2xl">
                        Upload, edit, or delete PDFs, images, ZIPs, videos, and iframe embed links for the franchise{" "}
                        <strong>Center Page</strong>. Every upload is saved in the{" "}
                        <strong>PostgreSQL database</strong> (<code className="text-[11px]">FranchiseDocument</code>)
                        and the file is stored under <code className="text-[11px]">media/franchise_documents/</code>.
                        Leave <strong>Centre</strong> empty for all centres.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                    <Button type="button" size="sm" onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-1 inline" />
                        Add document
                    </Button>
                </div>
            </div>

            <FranchiseCentreBulkUpload adminHub compact onComplete={() => void load()} />

            <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-slate-800">
                <div className="flex gap-2">
                    <Info className="w-5 h-5 shrink-0 text-blue-700 mt-0.5" aria-hidden />
                    <div className="space-y-2 min-w-0">
                        <p className="font-semibold text-blue-900">How to upload</p>
                        <ul className="list-disc pl-5 space-y-1 text-slate-700">
                            <li>
                                <strong>Upload from PC</strong> — choose files or a whole folder above, pick a category,
                                then upload (global for all centres).
                            </li>
                            <li>
                                <strong>Add document</strong> — one file or embed link with title, category, and sort
                                order.
                            </li>
                            <li>
                                <strong>Edit / Delete</strong> — use the table below. Turn off <strong>Active</strong> to
                                hide from franchises.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm font-medium text-orange-900">
                    Filter by category
                    <select
                        className="ml-2 rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All categories</option>
                        {FRANCHISE_DOCUMENT_CATEGORY_ORDER.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </label>
                {categoryFilter ? (
                    <button
                        type="button"
                        className="text-sm text-blue-700 hover:underline"
                        onClick={() => setCategoryFilter("")}
                    >
                        Clear filter (show all)
                    </button>
                ) : null}
                {items.length > 0 ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                        disabled={deletingAll}
                        onClick={() => setDeleteAllOpen(true)}
                    >
                        <Trash2 className="w-4 h-4 mr-1 inline" />
                        Delete all ({items.length})
                    </Button>
                ) : null}
            </div>

            <div className="bg-white border border-orange-100 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <p className="p-8 text-sm text-slate-600">Loading…</p>
                ) : items.length === 0 ? (
                    <p className="p-8 text-sm text-slate-600">
                        {categoryFilter
                            ? "No documents in this category. Clear the filter or upload files above."
                            : "No documents yet. Upload from your PC above or use Add document."}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-orange-50 text-left text-orange-900">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Order</th>
                                    <th className="px-4 py-3 font-semibold">Title</th>
                                    <th className="px-4 py-3 font-semibold">Category</th>
                                    <th className="px-4 py-3 font-semibold">Centre</th>
                                    <th className="px-4 py-3 font-semibold">AY</th>
                                    <th className="px-4 py-3 font-semibold">Active</th>
                                    <th className="px-4 py-3 font-semibold">File / Embed</th>
                                    <th className="px-4 py-3 font-semibold w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100">
                                {items.map((row) => {
                                    const fm = getFranchiseResourceFileMetaFromDoc(row);
                                    return (
                                    <tr key={row.id} className="hover:bg-orange-50/40">
                                        <td className="px-4 py-2 text-slate-700">{row.order}</td>
                                        <td className="px-4 py-2 font-medium text-slate-900">{row.title}</td>
                                        <td className="px-4 py-2 text-slate-600 max-w-[200px] truncate" title={row.category_display}>
                                            {row.category_display ?? row.category}
                                        </td>
                                        <td className="px-4 py-2 text-slate-600">{row.franchise_name ?? "— Global —"}</td>
                                        <td className="px-4 py-2 text-slate-600">{row.academic_year || "—"}</td>
                                        <td className="px-4 py-2">{row.is_active ? "Yes" : "No"}</td>
                                        <td className="px-4 py-2">
                                            {row.file || row.embed_url ? (
                                                <div className="flex flex-col gap-1 items-start max-w-[200px]">
                                                    <span className="inline-flex rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                                                        {fm.extLabel}
                                                    </span>
                                                    {row.file ? (
                                                        <a
                                                            href={mediaUrl(row.file)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 inline-flex items-center gap-1 hover:underline text-xs"
                                                        >
                                                            {fm.actionLabel}{" "}
                                                            <ExternalLink className="w-3 h-3 shrink-0" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-600 truncate max-w-full" title={row.embed_url ?? ""}>
                                                            {row.embed_url}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            <button
                                                type="button"
                                                className="p-1.5 text-orange-700 hover:bg-orange-100 rounded"
                                                onClick={() => openEdit(row)}
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded ml-1"
                                                onClick={() => setDeleteId(row.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? "Edit document" : "Add document"}>
                <form onSubmit={submit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                        Category
                        <select
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            required
                        >
                            {FRANCHISE_DOCUMENT_CATEGORY_ORDER.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                        Title
                        <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                        Centre Page path (optional — saved in database)
                        <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-xs"
                            placeholder="e.g. holidayslist-2026-27/AP Holiday List 2026-2027.pdf (auto-filled from filename if empty)"
                            value={form.source_path}
                            onChange={(e) => setForm({ ...form, source_path: e.target.value })}
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                        Description (optional)
                        <textarea
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-[72px]"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                        Academic year (optional)
                        <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            placeholder="e.g. AY 2025-26"
                            value={form.academic_year}
                            onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                        />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                            Sort order
                            <input
                                type="number"
                                min={0}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                value={form.order}
                                onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })}
                            />
                        </label>
                        <label className="flex items-center gap-2 mt-6 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                            />
                            Active
                        </label>
                    </div>
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                        Centre (optional — blank = all centres)
                        <select
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={form.franchise_id === "" ? "__global__" : String(form.franchise_id)}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    franchise_id: e.target.value === "__global__" ? "" : e.target.value,
                                })
                            }
                        >
                            <option value="__global__">Global (all centres)</option>
                            {franchises.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                        <span>
                            File {editing ? "(optional — leave empty to keep current)" : "(optional if embed link below)"}
                        </span>
                        <span className="font-normal text-slate-500">
                            PDF, images (PNG/JPG), ZIP, audio, video, and Office formats are supported.
                        </span>
                        <input
                            type="file"
                            accept=".pdf,.zip,.rar,.7z,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp3,.mp4,.wav,.htm,.html"
                            className="text-sm"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                        <span>Embed / video link (optional — instead of file)</span>
                        <span className="font-normal text-slate-500">
                            YouTube, MediaDelivery, or paste full{" "}
                            <code className="text-[10px] bg-slate-100 px-1 rounded">&lt;iframe src=&quot;…&quot;&gt;</code>
                        </span>
                        <textarea
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono min-h-[72px]"
                            placeholder="https://www.youtube.com/watch?v=… or https://iframe.mediadelivery.net/embed/…"
                            value={form.embed_url}
                            onChange={(e) => setForm({ ...form, embed_url: e.target.value })}
                        />
                    </label>
                    <div className="flex gap-2 pt-2">
                        <Button type="submit" size="sm" disabled={submitting}>
                            {submitting ? "Saving…" : editing ? "Update" : "Create"}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={deleteId != null}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete document?"
                description="This removes the file from the resource hub. Franchises will no longer see it."
                confirmText="Delete"
                variant="danger"
            />

            <ConfirmModal
                isOpen={deleteAllOpen}
                onClose={() => !deletingAll && setDeleteAllOpen(false)}
                onConfirm={confirmDeleteAll}
                title="Delete all listed documents?"
                description={
                    categoryFilter
                        ? `This permanently deletes all ${items.length} row(s) in the current category filter. Franchises will no longer see them.`
                        : `This permanently deletes all ${items.length} centre page document(s) in the table (every category). Franchises will no longer see them.`
                }
                confirmText={deletingAll ? "Deleting…" : "Delete all"}
                variant="danger"
            />
        </div>
    );
}

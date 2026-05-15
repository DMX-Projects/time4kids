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
import {
    FRANCHISE_CENTER_PAGE_BLOCK_A,
    FRANCHISE_CENTER_PAGE_BLOCK_B,
} from "@/config/franchise-center-page-nav";
import { FranchiseCenterPageAccordion } from "@/components/dashboard/franchise/FranchiseCenterPageAccordion";
import { getFranchiseResourceFileMeta } from "@/lib/franchise-resource-file-meta";
import { Plus, Pencil, Trash2, ExternalLink, Download } from "lucide-react";

export type FranchiseDocCategorySummary = {
    category: string;
    category_display: string;
    total: number;
    active: number;
    inactive: number;
    with_file: number;
    missing_file: number;
    global_count: number;
    centre_specific_count: number;
};

function orderSummaryRows(rows: FranchiseDocCategorySummary[]): FranchiseDocCategorySummary[] {
    const byCat = new Map(rows.map((r) => [r.category, r]));
    const out: FranchiseDocCategorySummary[] = [];
    const seen = new Set<string>();
    for (const c of FRANCHISE_DOCUMENT_CATEGORY_ORDER) {
        const r = byCat.get(c.value);
        if (r) {
            out.push({ ...r, category_display: c.label });
        } else {
            out.push({
                category: c.value,
                category_display: c.label,
                total: 0,
                active: 0,
                inactive: 0,
                with_file: 0,
                missing_file: 0,
                global_count: 0,
                centre_specific_count: 0,
            });
        }
        seen.add(c.value);
    }
    for (const r of rows) {
        if (!seen.has(r.category)) out.push(r);
    }
    return out;
}

function csvEscape(value: string | number | boolean | null | undefined): string {
    if (value === null || value === undefined) return "";
    const s = String(value);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

export type FranchiseResourceDoc = {
    id: number;
    category: string;
    category_display?: string;
    title: string;
    source_path?: string | null;
    description?: string;
    file: string | null;
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
    const [summaryRows, setSummaryRows] = useState<FranchiseDocCategorySummary[]>([]);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [exportingCsv, setExportingCsv] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FranchiseResourceDoc | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

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

    const loadSummary = useCallback(async () => {
        setSummaryLoading(true);
        try {
            const data = await authFetch<FranchiseDocCategorySummary[]>(
                `/documents/admin/franchise-documents/summary/`,
            );
            const list = Array.isArray(data) ? data : [];
            setSummaryRows(orderSummaryRows(list));
        } catch (e) {
            console.error(e);
            showToast("Could not load database summary by category.", "error");
            setSummaryRows([]);
        } finally {
            setSummaryLoading(false);
        }
    }, [authFetch, showToast]);

    const exportFullTableCsv = useCallback(async () => {
        setExportingCsv(true);
        try {
            const data = await authFetch<FranchiseResourceDoc[] | { results: FranchiseResourceDoc[] }>(
                `/documents/admin/franchise-documents/`,
            );
            const raw = Array.isArray(data) ? data : data?.results ?? [];
            const list = sortDocsByCategoryOrder(raw);
            const header = [
                "id",
                "category",
                "category_display",
                "title",
                "description",
                "file",
                "franchise_id",
                "franchise_name",
                "academic_year",
                "is_active",
                "order",
                "created_at",
                "updated_at",
            ];
            const lines = [header.join(",")];
            for (const row of list) {
                lines.push(
                    [
                        row.id,
                        csvEscape(row.category),
                        csvEscape(row.category_display ?? ""),
                        csvEscape(row.title),
                        csvEscape(row.description ?? ""),
                        csvEscape(row.file ?? ""),
                        row.franchise ?? "",
                        csvEscape(row.franchise_name ?? ""),
                        csvEscape(row.academic_year ?? ""),
                        row.is_active ? "true" : "false",
                        row.order ?? 0,
                        csvEscape(row.created_at ?? ""),
                        csvEscape(row.updated_at ?? ""),
                    ].join(","),
                );
            }
            const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `franchise-resource-documents-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showToast(`Exported ${list.length} row(s) from the database.`, "success");
        } catch (e) {
            console.error(e);
            showToast("CSV export failed.", "error");
        } finally {
            setExportingCsv(false);
        }
    }, [authFetch, showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        void loadSummary();
    }, [loadSummary]);

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
        setSubmitting(true);
        try {
            if (editing) {
                const metaBody = {
                    category: form.category,
                    title: form.title.trim(),
                    source_path: form.source_path.trim() || null,
                    description: form.description,
                    academic_year: form.academic_year || "",
                    order: form.order,
                    is_active: form.is_active,
                    franchise:
                        form.franchise_id === "" || form.franchise_id === "__global__"
                            ? null
                            : Number(form.franchise_id),
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
                if (!file) {
                    showToast("Choose a file to upload.", "error");
                    setSubmitting(false);
                    return;
                }
                const fd = new FormData();
                fd.append("category", form.category);
                fd.append("title", form.title.trim());
                if (form.source_path.trim()) fd.append("source_path", form.source_path.trim());
                fd.append("description", form.description);
                fd.append("academic_year", form.academic_year);
                fd.append("order", String(form.order));
                fd.append("is_active", form.is_active ? "true" : "false");
                if (form.franchise_id && form.franchise_id !== "__global__") {
                    fd.append("franchise", String(form.franchise_id));
                }
                fd.append("file", file);
                await authFetch(`/documents/admin/franchise-documents/`, {
                    method: "POST",
                    body: fd,
                });
                showToast("Document added.", "success");
            }
            closeModal();
            void load();
            void loadSummary();
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
            void loadSummary();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Delete failed.";
            showToast(msg, "error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-orange-900">Franchise resource documents</h1>
                    <p className="text-sm text-orange-800/90 mt-1 max-w-2xl">
                        Upload PDFs, zip packs, spreadsheets, audio, or video for the franchise resource hub. Leave{" "}
                        <strong>Centre</strong> empty for <strong>global</strong> documents (all centres). The coverage
                        table below reads directly from the database so you can see which categories already have rows
                        and which are still empty.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                    <Button type="button" variant="outline" size="sm" onClick={exportFullTableCsv} disabled={exportingCsv}>
                        <Download className="w-4 h-4 mr-1 inline" />
                        {exportingCsv ? "Exporting…" : "Export CSV (full table)"}
                    </Button>
                    <Button type="button" size="sm" onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-1 inline" />
                        Add document
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl space-y-2">
                <p className="text-xs text-orange-900/85">
                    Same <strong>Center Page</strong> structure as the franchise dashboard. Expand each yellow bar, then
                    each sub-heading; use <strong>Filter →</strong> to set the category filter below for matching uploads.
                </p>
                <FranchiseCenterPageAccordion
                    mode="admin"
                    sections={[FRANCHISE_CENTER_PAGE_BLOCK_A, FRANCHISE_CENTER_PAGE_BLOCK_B]}
                    onAdminPickCategory={(cat) => setCategoryFilter(cat)}
                />
            </div>

            <div className="bg-white border border-orange-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-orange-100 bg-orange-50/70">
                    <h2 className="text-sm font-semibold text-orange-900">Database coverage by category</h2>
                    <p className="text-xs text-orange-800/85 mt-0.5 max-w-3xl">
                        Aggregated from the <code className="text-[11px] bg-white/80 px-1 rounded">FranchiseDocument</code>{" "}
                        table (same source as the list below). Click a row to filter the detail table to that category;
                        click the same row again to clear the filter.
                    </p>
                </div>
                {summaryLoading ? (
                    <p className="p-6 text-sm text-slate-600">Loading summary…</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-orange-50/50 text-left text-orange-900">
                                <tr>
                                    <th className="px-4 py-2 font-semibold">Category</th>
                                    <th className="px-4 py-2 font-semibold text-right">Total</th>
                                    <th className="px-4 py-2 font-semibold text-right">Active</th>
                                    <th className="px-4 py-2 font-semibold text-right">Inactive</th>
                                    <th className="px-4 py-2 font-semibold text-right">With file</th>
                                    <th className="px-4 py-2 font-semibold text-right">Missing file</th>
                                    <th className="px-4 py-2 font-semibold text-right">Global</th>
                                    <th className="px-4 py-2 font-semibold text-right">Centre-only</th>
                                    <th className="px-4 py-2 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100">
                                {summaryRows.map((r) => {
                                    const empty = r.total === 0;
                                    const warnMissing = r.missing_file > 0;
                                    return (
                                        <tr
                                            key={r.category}
                                            className={`cursor-pointer hover:bg-orange-50/50 ${
                                                categoryFilter === r.category ? "bg-orange-100/40" : ""
                                            } ${empty ? "text-slate-500" : ""}`}
                                            onClick={() =>
                                                setCategoryFilter((prev) => (prev === r.category ? "" : r.category))
                                            }
                                        >
                                            <td className="px-4 py-2 font-medium text-slate-900">{r.category_display}</td>
                                            <td className="px-4 py-2 text-right tabular-nums">{r.total}</td>
                                            <td className="px-4 py-2 text-right tabular-nums text-emerald-800">{r.active}</td>
                                            <td className="px-4 py-2 text-right tabular-nums text-slate-600">{r.inactive}</td>
                                            <td className="px-4 py-2 text-right tabular-nums">{r.with_file}</td>
                                            <td className="px-4 py-2 text-right tabular-nums text-amber-800">{r.missing_file}</td>
                                            <td className="px-4 py-2 text-right tabular-nums">{r.global_count}</td>
                                            <td className="px-4 py-2 text-right tabular-nums">{r.centre_specific_count}</td>
                                            <td className="px-4 py-2">
                                                {empty ? (
                                                    <span className="inline-flex rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[11px] font-semibold">
                                                        No rows yet
                                                    </span>
                                                ) : warnMissing ? (
                                                    <span className="inline-flex rounded-full bg-rose-100 text-rose-900 px-2 py-0.5 text-[11px] font-semibold">
                                                        Missing file on some
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-emerald-100 text-emerald-900 px-2 py-0.5 text-[11px] font-semibold">
                                                        OK
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
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
            </div>

            <div className="bg-white border border-orange-100 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <p className="p-8 text-sm text-slate-600">Loading…</p>
                ) : items.length === 0 ? (
                    <p className="p-8 text-sm text-slate-600">
                        {categoryFilter
                            ? "No documents in this category for the current filter. Try clearing the filter or pick another row in the coverage table."
                            : "No documents yet. Add one with the button above."}
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
                                    <th className="px-4 py-3 font-semibold">File</th>
                                    <th className="px-4 py-3 font-semibold w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100">
                                {items.map((row) => {
                                    const fm = getFranchiseResourceFileMeta(row.file);
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
                                            {row.file ? (
                                                <div className="flex flex-col gap-1 items-start max-w-[140px]">
                                                    <span className="inline-flex rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                                                        {fm.extLabel}
                                                    </span>
                                                    <a
                                                        href={mediaUrl(row.file)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 inline-flex items-center gap-1 hover:underline text-xs"
                                                    >
                                                        {fm.actionLabel}{" "}
                                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                                    </a>
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
                        Centre Page path (optional)
                        <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-xs"
                            placeholder="e.g. holidayslist-2026-27/AP Holiday List 2026-2027.pdf"
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
                            File {editing ? "(optional — leave empty to keep current)" : "(required)"}
                        </span>
                        <span className="font-normal text-slate-500">
                            PDF, zip, audio, video, and Office formats are fine; centres see Watch / Listen / Download from the file extension.
                        </span>
                        <input
                            type="file"
                            className="text-sm"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
        </div>
    );
}

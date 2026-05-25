"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import {
    AdminCentrePageChecklist,
    type CentrePageAddRequest,
    type CentrePageRemoveRequest,
} from "@/components/dashboard/admin/AdminCentrePageChecklist";
import {
    FRANCHISE_CENTER_PAGE_BLOCK_A,
    FRANCHISE_CENTER_PAGE_BLOCK_B,
} from "@/config/franchise-center-page-nav";
import { FRANCHISE_DOCUMENT_CATEGORY_ORDER } from "@/config/franchise-dashboard-resource-order";
import { resolveFranchiseEmbedSrc } from "@/lib/franchise-embed-url";
import type { AdminCenterPageUploadContext } from "@/lib/admin-center-page-upload";
import type { FranchiseHubDoc } from "@/components/dashboard/franchise/FranchiseResourceFileRow";
import {
    CENTRE_PAGE_NAV_CUSTOM_SLUG,
    addCustomGroup,
    addCustomLink,
    addCustomNested,
    addCustomTopSection,
    emptyCentrePageNavCustom,
    isCustomTopSection,
    isCustomGroup,
    isCustomNested,
    mergeCentrePageBlocks,
    removeCustomGroup,
    removeCustomLink,
    removeCustomNested,
    removeCustomTopSection,
    type CentrePageNavCustomData,
} from "@/lib/centre-page-nav-custom";
import { Trash2 } from "lucide-react";

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

function parseCustomNav(raw: unknown): CentrePageNavCustomData {
    if (!raw || typeof raw !== "object") return emptyCentrePageNavCustom();
    const o = raw as Record<string, unknown>;
    return {
        customTopSections: Array.isArray(o.customTopSections)
            ? (o.customTopSections as CentrePageNavCustomData["customTopSections"])
            : [],
        staticExtensions: Array.isArray(o.staticExtensions)
            ? (o.staticExtensions as CentrePageNavCustomData["staticExtensions"])
            : [],
    };
}

export default function AdminFranchiseDocumentsPage() {
    const { authFetch } = useAuth();
    const { franchises } = useAdminData();
    const { showToast } = useToast();
    const [items, setItems] = useState<FranchiseResourceDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FranchiseResourceDoc | null>(null);
    const [uploadContext, setUploadContext] = useState<AdminCenterPageUploadContext | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [customNav, setCustomNav] = useState<CentrePageNavCustomData>(emptyCentrePageNavCustom());
    const [addModal, setAddModal] = useState<CentrePageAddRequest | null>(null);
    const [addTitle, setAddTitle] = useState("");
    const [addCategory, setAddCategory] = useState("ACADEMIC_DOCUMENTS");
    const [addSaving, setAddSaving] = useState(false);

    const hubDocs = useMemo(() => items as FranchiseHubDoc[], [items]);
    const mergedSections = useMemo(
        () => mergeCentrePageBlocks(FRANCHISE_CENTER_PAGE_BLOCK_A, FRANCHISE_CENTER_PAGE_BLOCK_B, customNav),
        [customNav],
    );

    const saveCustomNav = useCallback(
        async (next: CentrePageNavCustomData) => {
            await authFetch(`/common/page-content/${CENTRE_PAGE_NAV_CUSTOM_SLUG}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(next),
            });
            setCustomNav(next);
        },
        [authFetch],
    );

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [docData, navData] = await Promise.all([
                authFetch<FranchiseResourceDoc[] | { results: FranchiseResourceDoc[] }>(
                    "/documents/admin/franchise-documents/",
                ),
                authFetch<CentrePageNavCustomData>(`/common/page-content/${CENTRE_PAGE_NAV_CUSTOM_SLUG}/`),
            ]);
            const list = Array.isArray(docData) ? docData : docData?.results ?? [];
            setItems(sortDocsByCategoryOrder(list));
            setCustomNav(parseCustomNav(navData));
        } catch (e) {
            console.error(e);
            showToast("Could not load documents.", "error");
            setItems([]);
            setCustomNav(emptyCentrePageNavCustom());
        } finally {
            setLoading(false);
        }
    }, [authFetch, showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const deleteDocById = useCallback(
        async (id: number) => {
            await authFetch(`/documents/admin/franchise-documents/${id}/`, { method: "DELETE" });
            setItems((prev) => prev.filter((row) => row.id !== id));
        },
        [authFetch],
    );

    const handleAddRequest = (req: CentrePageAddRequest) => {
        setAddModal(req);
        setAddTitle("");
        setAddCategory("ACADEMIC_DOCUMENTS");
    };

    const handleRemoveRequest = async (req: CentrePageRemoveRequest) => {
        const label =
            req.kind === "topSection"
                ? req.anchor.topTitle
                : req.kind === "subsection"
                  ? `${req.anchor.topTitle} › ${req.anchor.groupTitle}`
                  : req.kind === "nested"
                    ? `${req.anchor.topTitle} › ${req.anchor.groupTitle} › ${req.anchor.nestedTitle}`
                    : req.linkLabel || "this link";
        if (!window.confirm(`Remove "${label}" from the centre page checklist?`)) return;
        try {
            let next = customNav;
            if (req.kind === "topSection") {
                next = removeCustomTopSection(customNav, req.anchor.topId);
            } else if (req.kind === "subsection" && req.anchor.groupTitle) {
                next = removeCustomGroup(
                    customNav,
                    req.anchor as typeof req.anchor & { groupTitle: string },
                );
            } else if (req.kind === "nested" && req.anchor.groupTitle && req.anchor.nestedTitle) {
                next = removeCustomNested(
                    customNav,
                    req.anchor as typeof req.anchor & { groupTitle: string; nestedTitle: string },
                );
            } else if (req.kind === "link" && req.rowKey) {
                next = removeCustomLink(customNav, req.anchor, req.rowKey);
            }
            await saveCustomNav(next);
            showToast("Removed from checklist.", "success");
        } catch {
            showToast("Could not remove.", "error");
        }
    };

    const closeAddModal = () => {
        setAddModal(null);
        setAddTitle("");
    };

    const submitAddStructure = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addModal) return;
        const title = addTitle.trim();
        if (!title) {
            showToast("Name is required.", "error");
            return;
        }
        setAddSaving(true);
        try {
            let next = customNav;
            const { kind, anchor } = addModal;

            if (kind === "subsection") {
                next = addCustomGroup(customNav, anchor, title);
            } else if (kind === "nested") {
                if (!anchor.groupTitle) {
                    showToast("Pick a subsection first.", "error");
                    setAddSaving(false);
                    return;
                }
                next = addCustomNested(
                    customNav,
                    { ...anchor, groupTitle: anchor.groupTitle },
                    title,
                );
            } else if (kind === "link") {
                const { data, link } = addCustomLink(customNav, anchor, title, addCategory);
                next = data;
                await saveCustomNav(next);
                closeAddModal();
                showToast(`"${title}" added — upload the file on that row.`, "success");
                const ctx: AdminCenterPageUploadContext = {
                    breadcrumb: [anchor.topTitle, anchor.groupTitle, anchor.nestedTitle, title].filter(
                        (p): p is string => Boolean(p?.trim()),
                    ),
                    breadcrumbLabel: [anchor.topTitle, anchor.groupTitle, anchor.nestedTitle, title]
                        .filter(Boolean)
                        .join(" › "),
                    topTitle: anchor.topTitle,
                    groupTitle: anchor.groupTitle,
                    nestedTitle: anchor.nestedTitle,
                    linkLabel: title,
                    category: addCategory,
                    sourcePath: link.sourcePath ?? "",
                    checklistHref: "",
                    rowKey: link.rowKey,
                };
                openFromChecklist(ctx);
                setAddSaving(false);
                return;
            } else if (kind === "topSection") {
                next = addCustomTopSection(customNav, title);
            }

            await saveCustomNav(next);
            closeAddModal();
            showToast("Saved.", "success");
        } catch {
            showToast("Could not save.", "error");
        } finally {
            setAddSaving(false);
        }
    };

    const openFromChecklist = (ctx: AdminCenterPageUploadContext) => {
        setUploadContext(ctx);
        const existing = ctx.matchedDocId
            ? items.find((row) => row.id === ctx.matchedDocId)
            : undefined;
        if (existing) {
            setEditing(existing);
            setForm({
                category: existing.category,
                title: existing.title,
                source_path: existing.source_path ?? ctx.sourcePath,
                embed_url: existing.embed_url ?? "",
                description: existing.description ?? "",
                academic_year: existing.academic_year ?? "",
                order: existing.order ?? 0,
                is_active: existing.is_active,
                franchise_id: existing.franchise != null ? String(existing.franchise) : "",
            });
        } else {
            setEditing(null);
            setForm({
                ...emptyForm,
                category: ctx.category,
                title: ctx.linkLabel,
                source_path: ctx.sourcePath,
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

    return (
        <div className="space-y-6">
            <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold text-orange-900">Centre page documents</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Use <strong>Add</strong> on headings you created to add subsections and links.{" "}
                    <strong>Remove</strong> only appears on items added via Add (not built-in checklist rows). To
                    delete an uploaded file, open <strong>Edit</strong> on that row → <strong>Delete upload</strong>.
                    Built-in links cannot be removed here — contact dev if one must go.
                </p>
            </div>

            {loading ? (
                <p className="text-sm text-slate-600">Loading checklist…</p>
            ) : (
                <AdminCentrePageChecklist
                    sections={mergedSections}
                    hubDocs={hubDocs}
                    onManageLink={openFromChecklist}
                    onAddRequest={handleAddRequest}
                    onRemoveRequest={handleRemoveRequest}
                    isCustomTop={(id) => isCustomTopSection(customNav, id)}
                    canRemoveGroup={(anchor) => isCustomGroup(customNav, anchor)}
                    canRemoveNested={(anchor) => isCustomNested(customNav, anchor)}
                />
            )}

            <Modal
                isOpen={addModal != null}
                onClose={closeAddModal}
                title={
                    addModal?.kind === "subsection"
                        ? "Add subsection"
                        : addModal?.kind === "nested"
                          ? "Add nested section"
                          : addModal?.kind === "link"
                            ? "Add file / link"
                            : "Add section"
                }
            >
                <form onSubmit={submitAddStructure} className="space-y-3">
                    {addModal ? (
                        <p className="text-sm text-slate-600">
                            Under:{" "}
                            <strong>
                                {[addModal.anchor.topTitle, addModal.anchor.groupTitle, addModal.anchor.nestedTitle]
                                    .filter(Boolean)
                                    .join(" › ")}
                            </strong>
                        </p>
                    ) : null}
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                        {addModal?.kind === "link" ? "Link label (shown to franchises)" : "Section name"}
                        <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={addTitle}
                            onChange={(e) => setAddTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </label>
                    {addModal?.kind === "link" ? (
                        <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                            Category
                            <select
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                value={addCategory}
                                onChange={(e) => setAddCategory(e.target.value)}
                            >
                                {FRANCHISE_DOCUMENT_CATEGORY_ORDER.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ) : null}
                    <div className="flex gap-2 pt-1">
                        <Button type="submit" size="sm" disabled={addSaving}>
                            {addSaving ? "Saving…" : "Save"}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={closeAddModal}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? "Edit document" : "Upload for checklist row"}
            >
                <form onSubmit={submit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {uploadContext ? (
                        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900">
                            {uploadContext.breadcrumbLabel}
                        </p>
                    ) : null}

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
                        Title (shown to franchises)
                        <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                        Centre Page path (matches checklist folder)
                        <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-xs"
                            placeholder="e.g. study-material-26-27/Block-1/PG-Study-Material-for-Block-1.zip"
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
                            placeholder="e.g. AY 2026-27"
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
                            File {editing ? "(optional — leave empty to keep current)" : "(required unless embed)"}
                        </span>
                        <input
                            type="file"
                            accept=".pdf,.zip,.rar,.7z,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp3,.mp4,.wav,.htm,.html"
                            className="text-sm"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        />
                    </label>
                    {editing?.id ? (
                        <div className="pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-red-700 border-red-200 hover:bg-red-50"
                                onClick={() => {
                                    if (!window.confirm("Delete this upload permanently?")) return;
                                    void deleteDocById(editing.id)
                                        .then(() => {
                                            showToast("Upload deleted.", "success");
                                            closeModal();
                                        })
                                        .catch(() => showToast("Delete failed.", "error"));
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-1 inline" />
                                Delete upload
                            </Button>
                        </div>
                    ) : null}
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                        Embed / video link (optional)
                        <textarea
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono min-h-[72px]"
                            placeholder="https://www.youtube.com/watch?v=…"
                            value={form.embed_url}
                            onChange={(e) => setForm({ ...form, embed_url: e.target.value })}
                        />
                    </label>
                    <div className="flex gap-2 pt-2">
                        <Button type="submit" size="sm" disabled={submitting}>
                            {submitting ? "Saving…" : editing ? "Update" : "Upload"}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

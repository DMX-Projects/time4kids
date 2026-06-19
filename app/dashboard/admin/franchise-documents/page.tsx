"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import {
    AdminCentrePageChecklist,
    type CentrePageAddRequest,
    type CentrePageRemoveRequest,
    type CentrePageRenameRequest,
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
    linkIdFromCustomRowKey,
    mergeCentrePageBlocks,
    parseCentrePageNavCustom,
    removeCustomGroup,
    removeCustomLink,
    removeCustomNested,
    hideCentrePageLinkRow,
    hideCentrePageStaticGroup,
    hideCentrePageStaticNested,
    hideCentrePageStaticTop,
    removeCustomTopSection,
    renameNavLabel,
    type CentrePageNavCustomData,
} from "@/lib/centre-page-nav-custom";
import { Trash2 } from "lucide-react";
import { ChecklistFileUploadField } from "@/components/dashboard/admin/ChecklistFileUploadField";
import { inferCategoryForAnchor } from "@/lib/infer-centre-page-category";
import { validateAdminHubDocumentUpload } from "@/lib/franchise-centre-upload";

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

function normalizeSourcePathKey(path: string): string {
    return path.replace(/\\/g, "/").trim().replace(/^\/+/, "").toLowerCase();
}

function findDocBySourcePath(
    list: FranchiseResourceDoc[],
    sourcePath: string,
): FranchiseResourceDoc | undefined {
    const key = normalizeSourcePathKey(sourcePath);
    if (!key) return undefined;
    return list.find((row) => normalizeSourcePathKey(row.source_path || "") === key);
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
    return parseCentrePageNavCustom(raw);
}

export default function AdminFranchiseDocumentsPage() {
    const { authFetch } = useAuth();
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
    const [addFile, setAddFile] = useState<File | null>(null);
    const [addEmbedUrl, setAddEmbedUrl] = useState("");
    const [addSaving, setAddSaving] = useState(false);
    const [renameModal, setRenameModal] = useState<CentrePageRenameRequest | null>(null);
    const [renameTitle, setRenameTitle] = useState("");
    const [renameSaving, setRenameSaving] = useState(false);

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
        setAddFile(null);
        setAddEmbedUrl("");
    };

    const handleRenameRequest = (req: CentrePageRenameRequest) => {
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
            const next = renameNavLabel(customNav, renameModal, title);
            await saveCustomNav(next);
            setRenameModal(null);
            setRenameTitle("");
            showToast("Name updated.", "success");
        } catch {
            showToast("Could not rename.", "error");
        } finally {
            setRenameSaving(false);
        }
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
        if (!window.confirm(`Delete "${label}"?`)) return;
        try {
            let next = customNav;
            if (req.kind === "topSection") {
                next = isCustomTopSection(customNav, req.anchor.topId)
                    ? removeCustomTopSection(customNav, req.anchor.topId)
                    : hideCentrePageStaticTop(customNav, req.anchor.topId);
            } else if (req.kind === "subsection" && req.anchor.groupTitle) {
                const anchor = req.anchor as typeof req.anchor & { groupTitle: string };
                next = isCustomGroup(customNav, anchor)
                    ? removeCustomGroup(customNav, anchor)
                    : hideCentrePageStaticGroup(customNav, anchor.topId, anchor.groupTitle);
            } else if (req.kind === "nested" && req.anchor.groupTitle && req.anchor.nestedTitle) {
                const anchor = req.anchor as typeof req.anchor & {
                    groupTitle: string;
                    nestedTitle: string;
                };
                next = isCustomNested(customNav, anchor)
                    ? removeCustomNested(customNav, anchor)
                    : hideCentrePageStaticNested(
                          customNav,
                          anchor.topId,
                          anchor.groupTitle,
                          anchor.nestedTitle,
                      );
            } else if (req.kind === "link" && req.rowKey) {
                const linkId = linkIdFromCustomRowKey(req.rowKey);
                next = linkId
                    ? removeCustomLink(customNav, req.anchor, req.rowKey)
                    : hideCentrePageLinkRow(customNav, req.rowKey);
            }
            await saveCustomNav(next);
            showToast("Deleted.", "success");
        } catch {
            showToast("Delete failed.", "error");
        }
    };

    const closeAddModal = () => {
        setAddModal(null);
        setAddTitle("");
        setAddFile(null);
        setAddEmbedUrl("");
    };

    const uploadNewDocument = async (args: {
        category: string;
        title: string;
        sourcePath?: string;
        file?: File | null;
        embedUrl?: string;
    }) => {
        const embedRaw = (args.embedUrl || "").trim();
        const embedNormalized = embedRaw ? resolveFranchiseEmbedSrc(embedRaw) : null;
        if (embedRaw && !embedNormalized) {
            throw new Error("Could not read that embed link. Paste a YouTube or MediaDelivery embed URL.");
        }
        if (args.file && embedNormalized) {
            throw new Error("Use either a file upload or an embed link, not both.");
        }
        if (!args.file && !embedNormalized) {
            throw new Error("Choose a file to upload or paste a video/embed link.");
        }

        // Size limits apply only when the admin picks a new file — existing server uploads are untouched.
        if (args.file) {
            const sizeErr = validateAdminHubDocumentUpload(args.file);
            if (sizeErr) throw new Error(sizeErr);
        }

        const sourcePath = args.sourcePath?.trim() || "";
        const existing = sourcePath ? findDocBySourcePath(items, sourcePath) : undefined;

        if (existing) {
            await authFetch(`/documents/admin/franchise-documents/${existing.id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: args.category,
                    title: args.title.trim(),
                    source_path: sourcePath || null,
                    embed_url: embedNormalized || "",
                    description: "",
                    academic_year: "",
                    order: 0,
                    is_active: true,
                    franchise: null,
                }),
            });
            if (args.file) {
                const fd = new FormData();
                fd.append("file", args.file);
                await authFetch(`/documents/admin/franchise-documents/${existing.id}/`, {
                    method: "PATCH",
                    body: fd,
                });
            }
            return;
        }

        if (embedNormalized) {
            await authFetch("/documents/admin/franchise-documents/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: args.category,
                    title: args.title.trim(),
                    source_path: sourcePath || null,
                    embed_url: embedNormalized,
                    description: "",
                    academic_year: "",
                    order: 0,
                    is_active: true,
                    franchise: null,
                }),
            });
            return;
        }

        const fd = new FormData();
        fd.append("category", args.category);
        fd.append("title", args.title.trim());
        if (sourcePath) fd.append("source_path", sourcePath);
        fd.append("description", "");
        fd.append("academic_year", "");
        fd.append("order", "0");
        fd.append("is_active", "true");
        fd.append("file", args.file!);
        await authFetch("/documents/admin/franchise-documents/", { method: "POST", body: fd });
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
                const addCategory = inferCategoryForAnchor(anchor, mergedSections);
                const { data, link } = addCustomLink(customNav, anchor, title, addCategory);
                await saveCustomNav(data);
                const wantsUpload = Boolean(addFile || addEmbedUrl.trim());

                if (wantsUpload) {
                    try {
                        await uploadNewDocument({
                            category: addCategory,
                            title,
                            sourcePath: link.sourcePath ?? "",
                            file: addFile,
                            embedUrl: addEmbedUrl,
                        });
                    } catch (err) {
                        showToast(err instanceof Error ? err.message : "Upload failed.", "error");
                        setAddSaving(false);
                        return;
                    }
                }

                closeAddModal();
                showToast(
                    wantsUpload
                        ? `"${title}" added and uploaded.`
                        : `"${title}" added — click Upload on that row when ready.`,
                    "success",
                );
                await load();
                setAddSaving(false);
                return;
            } else if (kind === "topSection") {
                next = addCustomTopSection(customNav, title);
            }

            await saveCustomNav(next);
            closeAddModal();
            showToast("Saved.", "success");
            await load();
        } catch {
            showToast("Could not save.", "error");
        } finally {
            setAddSaving(false);
        }
    };

    const handleDeleteUpload = useCallback(
        async (ctx: AdminCenterPageUploadContext) => {
            if (ctx.matchedDocId == null) return;
            if (!window.confirm(`Delete "${ctx.breadcrumbLabel}" permanently?`)) return;
            try {
                await deleteDocById(ctx.matchedDocId);
                showToast("Upload deleted.", "success");
            } catch {
                showToast("Delete failed.", "error");
            }
        },
        [deleteDocById, showToast],
    );

    const openFromChecklist = (ctx: AdminCenterPageUploadContext) => {
        setUploadContext(ctx);
        const existingByPath = ctx.sourcePath.trim()
            ? findDocBySourcePath(items, ctx.sourcePath)
            : undefined;
        const existingByMatch =
            ctx.matchedDocId != null
                ? items.find((row) => row.id === ctx.matchedDocId)
                : undefined;
        const existing = existingByPath ?? existingByMatch;
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
        if (file) {
            const sizeErr = validateAdminHubDocumentUpload(file);
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
            const sourcePath =
                form.source_path.trim() || uploadContext?.sourcePath?.trim() || "";
            if (uploadContext && !sourcePath) {
                showToast("Could not identify this checklist row. Close and try Upload again.", "error");
                setSubmitting(false);
                return;
            }

            const existingByPath = sourcePath ? findDocBySourcePath(items, sourcePath) : undefined;
            const targetId = editing?.id ?? existingByPath?.id;

            if (targetId) {
                const metaBody = {
                    category: form.category,
                    title: form.title.trim(),
                    source_path: sourcePath || null,
                    embed_url: embedNormalized || "",
                    description: form.description,
                    academic_year: form.academic_year || "",
                    order: form.order,
                    is_active: form.is_active,
                    franchise,
                };
                await authFetch(`/documents/admin/franchise-documents/${targetId}/`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(metaBody),
                });
                if (file) {
                    const fd = new FormData();
                    fd.append("file", file);
                    await authFetch(`/documents/admin/franchise-documents/${targetId}/`, {
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
                            source_path: sourcePath || null,
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
                    if (sourcePath) fd.append("source_path", sourcePath);
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
            await load();
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
                    Full nesting is supported: <strong>main section</strong> → <strong>subsection</strong> →{" "}
                    <strong>nested subsection</strong> → <strong>file / link</strong>. Use{" "}
                    <strong>Add top-level section</strong> (button above the list) for a new main section. On any section click{" "}
                    <strong>Add</strong> → <strong>Add subsection</strong>; on a subsection <strong>Add</strong> →{" "}
                    <strong>Add nested section</strong>; then <strong>Add file / link</strong> for the upload row.
                    Use the trash icon to delete a section, row, or uploaded file. Upload modal accepts a file or a
                    video/embed link (not both).
                </p>
            </div>

            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        handleAddRequest({
                            kind: "topSection",
                            anchor: { topId: "", topTitle: "New section" },
                        })
                    }
                >
                    Add top-level section
                </Button>
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
                    onRenameRequest={handleRenameRequest}
                    onDeleteUpload={handleDeleteUpload}
                    isCustomTop={(id) => isCustomTopSection(customNav, id)}
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
                        {addModal?.kind === "link" ? "Name for this file / link" : "Section name"}
                        <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={addTitle}
                            onChange={(e) => setAddTitle(e.target.value)}
                            required
                            autoFocus
                            placeholder={addModal?.kind === "link" ? "e.g. Playgroup study material" : undefined}
                        />
                    </label>
                    {addModal?.kind === "link" ? (
                        <>
                            <ChecklistFileUploadField
                                id="add-centre-page-file"
                                accept=".pdf,.zip,.rar,.7z,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp3,.mp4,.wav,.mov,.webm,.htm,.html"
                                hint="PDF, photos, ZIP, documents, audio, or video"
                                required={!addEmbedUrl.trim()}
                                currentName={addFile?.name ?? null}
                                onChange={setAddFile}
                            />
                            <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                                Video / iframe embed link
                                <textarea
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono min-h-[72px]"
                                    placeholder="https://www.youtube.com/watch?v=… or iframe embed URL"
                                    value={addEmbedUrl}
                                    onChange={(e) => setAddEmbedUrl(e.target.value)}
                                />
                                <span className="text-[11px] font-normal text-slate-500">
                                    Upload a file above, or paste a YouTube / video embed link here — not both.
                                </span>
                            </label>
                        </>
                    ) : null}
                    <div className="flex gap-2 pt-1">
                        <Button type="submit" size="sm" disabled={addSaving}>
                            {addSaving
                                ? "Saving…"
                                : addModal?.kind === "link"
                                  ? "Save & upload"
                                  : "Save"}
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

                    {!uploadContext ? (
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
                    ) : null}
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                        Title (shown to franchises)
                        <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </label>
                    <ChecklistFileUploadField
                        id="centre-page-file"
                        accept=".pdf,.zip,.rar,.7z,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp3,.mp4,.wav,.mov,.webm,.htm,.html"
                        hint="PDF, documents, images, audio, video, or ZIP"
                        required={!editing && !form.embed_url.trim()}
                        currentName={file?.name ?? (editing?.file ? "Current file on server" : null)}
                        onChange={setFile}
                    />
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
                        Video / embed link
                        <textarea
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono min-h-[72px]"
                            placeholder="https://www.youtube.com/watch?v=…"
                            value={form.embed_url}
                            onChange={(e) => setForm({ ...form, embed_url: e.target.value })}
                        />
                        <span className="text-[11px] font-normal text-slate-500">
                            Use a file upload above, or paste a video/embed link here — not both.
                        </span>
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

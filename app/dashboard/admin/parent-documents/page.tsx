"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import {
    AdminCentrePageChecklist,
    type CentrePageAddRequest,
    type CentrePageRemoveRequest,
    type CentrePageRenameRequest,
} from "@/components/dashboard/admin/AdminCentrePageChecklist";
import { ChecklistFileUploadField } from "@/components/dashboard/admin/ChecklistFileUploadField";
import {
    ADMIN_PARENT_DOCUMENT_CATEGORIES,
    DEFAULT_HOLIDAY_ACADEMIC_YEAR,
    PARENT_DOCUMENT_STATES,
} from "@/config/parent-document-categories";
import { PARENT_APP_DOCUMENT_CHECKLIST } from "@/config/parent-app-document-checklist";
import { PARENT_NEWSLETTER_CATEGORY } from "@/config/parent-newsletter";
import type { AdminCenterPageUploadContext } from "@/lib/admin-center-page-upload";
import {
    acceptForParentDocumentCategory,
    uploadHintForParentDocumentCategory,
} from "@/lib/parent-document-upload-accept";
import { validateAdminParentDocumentUpload } from "@/lib/franchise-centre-upload";
import { resolveFranchiseEmbedSrc } from "@/lib/franchise-embed-url";
import HolidayEntriesEditor from "@/components/dashboard/HolidayEntriesEditor";
import {
    emptyHolidayEntry,
    parseHolidayEntries,
    requireHolidayEntries,
    serializeHolidayEntries,
    validateHolidayEntries,
    type HolidayEntry,
} from "@/config/holiday-entries";
import {
    addCustomGroup,
    addCustomLink,
    addCustomNested,
    addCustomTopSection,
    hideCentrePageLinkRow,
    hideCentrePageStaticGroup,
    hideCentrePageStaticNested,
    isCustomGroup,
    isCustomNested,
    isCustomTopSection,
    linkIdFromCustomRowKey,
    removeCustomGroup,
    removeCustomLink,
    removeCustomNested,
    removeCustomTopSection,
    renameNavLabel,
} from "@/lib/centre-page-nav-custom";
import { inferParentCategoryForAnchor } from "@/lib/infer-parent-nav-category";
import { mergeParentAppNavBlocks } from "@/lib/merge-parent-app-nav-blocks";
import {
    buildParentLinkLookupForItem,
    parentDocsAsHubDocs,
    type ParentDocHubRow,
} from "@/lib/parent-app-tree-links";
import {
    PARENT_APP_NAV_CUSTOM_SLUG,
    emptyParentAppNavCustom,
    hideParentAppSection,
    hideParentAppSlot,
    parseParentAppNavCustom,
    renameParentAppLabel,
    type ParentAppNavCustomData,
} from "@/lib/parent-app-nav-custom";

export type ParentDocumentRow = ParentDocHubRow & {
    category_display?: string;
    file_view_path?: string | null;
    franchise_name?: string | null;
    state_display?: string | null;
    academic_year?: string;
    is_active: boolean;
    created_at?: string;
    holiday_entries?: HolidayEntry[] | unknown;
};

const emptyForm = {
    category: "PRESCHOOL_POLICIES",
    title: "",
    description: "",
    academic_year: "AY 2026-27",
    state: "",
    order: 0,
    is_active: true,
    franchise_id: "" as string,
    video_embed_url: "",
    source_path: "",
};

const PARENT_EMBED_CATEGORIES = new Set(["VIDEOS", "AUDIO_RHYMES"]);

function parentCategorySupportsEmbed(category: string): boolean {
    return PARENT_EMBED_CATEGORIES.has((category || "").trim().toUpperCase());
}

function normalizeSourcePathKey(path: string): string {
    return path.replace(/\\/g, "/").trim().replace(/^\/+/, "").toLowerCase();
}

function findDocBySourcePath(list: ParentDocumentRow[], sourcePath: string): ParentDocumentRow | undefined {
    const key = normalizeSourcePathKey(sourcePath);
    if (!key) return undefined;
    return list.find((row) => normalizeSourcePathKey(row.source_path || "") === key);
}

function holidayStateFromRowKey(rowKey?: string): string {
    if (!rowKey?.startsWith("holiday-")) return "";
    return rowKey.slice("holiday-".length);
}

function isBuiltInParentSection(topId: string): boolean {
    return PARENT_APP_DOCUMENT_CHECKLIST.some((s) => s.id === topId);
}

function isBuiltInParentSlot(rowKey: string): boolean {
    return PARENT_APP_DOCUMENT_CHECKLIST.some((s) => s.slots.some((slot) => slot.id === rowKey));
}

export default function AdminParentDocumentsPage() {
    const { authFetch } = useAuth();
    const { franchises } = useAdminData();
    const { showToast } = useToast();
    const [items, setItems] = useState<ParentDocumentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ParentDocumentRow | null>(null);
    const [uploadContext, setUploadContext] = useState<AdminCenterPageUploadContext | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [navCustom, setNavCustom] = useState<ParentAppNavCustomData>(emptyParentAppNavCustom());
    const [addModal, setAddModal] = useState<CentrePageAddRequest | null>(null);
    const [addTitle, setAddTitle] = useState("");
    const [addFile, setAddFile] = useState<File | null>(null);
    const [addEmbedUrl, setAddEmbedUrl] = useState("");
    const [addSaving, setAddSaving] = useState(false);
    const [renameModal, setRenameModal] = useState<CentrePageRenameRequest | null>(null);
    const [renameTitle, setRenameTitle] = useState("");
    const [renameSaving, setRenameSaving] = useState(false);
    const [holidayEntries, setHolidayEntries] = useState<HolidayEntry[]>([emptyHolidayEntry()]);

    const mergedSections = useMemo(
        () =>
            mergeParentAppNavBlocks(navCustom).map((block) =>
                block.filter((item) => item.id !== "newsletters"),
            ),
        [navCustom],
    );

    const hubDocs = useMemo(() => parentDocsAsHubDocs(items), [items]);

    const linkLookupBuilder = useCallback(
        (item: import("@/config/franchise-center-page-nav").CenterPageTopItem) =>
            buildParentLinkLookupForItem(
                item,
                hubDocs,
                new Map(),
                new Map(),
                items,
            ),
        [hubDocs, items],
    );

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
    const holidayStateLabel =
        PARENT_DOCUMENT_STATES.find((s) => s.value === form.state)?.label || form.state || "";

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [data, navData] = await Promise.all([
                authFetch<ParentDocumentRow[]>("/documents/admin/parent-documents/"),
                authFetch<ParentAppNavCustomData>(`/common/page-content/${PARENT_APP_NAV_CUSTOM_SLUG}/`).catch(
                    () => emptyParentAppNavCustom(),
                ),
            ]);
            setItems(
                Array.isArray(data)
                    ? data.filter((row) => row.category !== PARENT_NEWSLETTER_CATEGORY)
                    : [],
            );
            setNavCustom(parseParentAppNavCustom(navData));
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
        async (ctx: AdminCenterPageUploadContext) => {
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

    const uploadNewDocument = async (args: {
        category: string;
        title: string;
        sourcePath?: string;
        file?: File | null;
        embedUrl?: string;
        state?: string;
    }) => {
        const embedRaw = (args.embedUrl || "").trim();
        const embedNormalized = embedRaw ? resolveFranchiseEmbedSrc(embedRaw) : null;
        if (embedRaw && !embedNormalized) {
            throw new Error("Could not read that embed link. Paste a YouTube or iframe embed URL.");
        }
        if (args.file && embedNormalized) {
            throw new Error("Use either a file upload or an embed link, not both.");
        }
        if (!args.file && !embedNormalized) {
            throw new Error("Choose a file to upload or paste a video/embed link.");
        }
        if (args.file) {
            const sizeErr = validateAdminParentDocumentUpload(args.file, args.category);
            if (sizeErr) throw new Error(sizeErr);
        }

        const sourcePath = args.sourcePath?.trim() || "";
        const existing = sourcePath ? findDocBySourcePath(items, sourcePath) : undefined;

        if (existing) {
            if (embedNormalized) {
                await authFetch(`/documents/admin/parent-documents/${existing.id}/`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        category: args.category,
                        title: args.title.trim(),
                        source_path: sourcePath || null,
                        video_embed_url: embedNormalized,
                        description: "",
                    }),
                });
            } else if (args.file) {
                await authFetch(`/documents/admin/parent-documents/${existing.id}/`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        category: args.category,
                        title: args.title.trim(),
                        source_path: sourcePath || null,
                        video_embed_url: "",
                    }),
                });
                const fd = new FormData();
                fd.append("file", args.file);
                await authFetch(`/documents/admin/parent-documents/${existing.id}/`, { method: "PATCH", body: fd });
            }
            return;
        }

        if (embedNormalized) {
            await authFetch("/documents/admin/parent-documents/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: args.category,
                    title: args.title.trim(),
                    source_path: sourcePath || "",
                    video_embed_url: embedNormalized,
                    description: "",
                    academic_year: args.category === "HOLIDAY_LISTS" ? DEFAULT_HOLIDAY_ACADEMIC_YEAR : "AY 2026-27",
                    order: 0,
                    is_active: true,
                    state: args.state || null,
                }),
            });
            return;
        }

        const fd = new FormData();
        fd.append("category", args.category);
        fd.append("title", args.title.trim());
        if (sourcePath) fd.append("source_path", sourcePath);
        fd.append("description", "");
        fd.append("academic_year", args.category === "HOLIDAY_LISTS" ? DEFAULT_HOLIDAY_ACADEMIC_YEAR : "AY 2026-27");
        fd.append("order", "0");
        fd.append("is_active", "true");
        if (args.state) fd.append("state", args.state);
        fd.append("file", args.file!);
        await authFetch("/documents/admin/parent-documents/", { method: "POST", body: fd });
    };

    const handleAddRequest = (req: CentrePageAddRequest) => {
        setAddModal(req);
        setAddTitle("");
        setAddFile(null);
        setAddEmbedUrl("");
    };

    const closeAddModal = () => {
        setAddModal(null);
        setAddTitle("");
        setAddFile(null);
        setAddEmbedUrl("");
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
            let next = navCustom;
            const { kind, anchor } = addModal;

            if (kind === "subsection") {
                next = addCustomGroup(navCustom, anchor, title);
            } else if (kind === "nested") {
                if (!anchor.groupTitle) {
                    showToast("Pick a subsection first.", "error");
                    setAddSaving(false);
                    return;
                }
                next = addCustomNested(navCustom, { ...anchor, groupTitle: anchor.groupTitle }, title);
            } else if (kind === "link") {
                const addCategory = inferParentCategoryForAnchor(anchor, mergedSections);
                const { data, link } = addCustomLink(navCustom, anchor, title, addCategory);
                await saveNavCustom(data);
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
                next = addCustomTopSection(navCustom, title);
            }

            await saveNavCustom(next);
            closeAddModal();
            showToast("Saved.", "success");
            await load();
        } catch {
            showToast("Could not save.", "error");
        } finally {
            setAddSaving(false);
        }
    };

    const handleRenameRequest = (req: CentrePageRenameRequest) => {
        setRenameModal(req);
        setRenameTitle(req.currentTitle);
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
            let next = navCustom;
            if (req.kind === "topSection") {
                next = isCustomTopSection(navCustom, req.anchor.topId)
                    ? removeCustomTopSection(navCustom, req.anchor.topId)
                    : hideParentAppSection(navCustom, req.anchor.topId);
            } else if (req.kind === "subsection" && req.anchor.groupTitle) {
                const anchor = req.anchor as typeof req.anchor & { groupTitle: string };
                next = isCustomGroup(navCustom, anchor)
                    ? removeCustomGroup(navCustom, anchor)
                    : hideCentrePageStaticGroup(navCustom, anchor.topId, anchor.groupTitle);
            } else if (req.kind === "nested" && req.anchor.groupTitle && req.anchor.nestedTitle) {
                const anchor = req.anchor as typeof req.anchor & {
                    groupTitle: string;
                    nestedTitle: string;
                };
                next = isCustomNested(navCustom, anchor)
                    ? removeCustomNested(navCustom, anchor)
                    : hideCentrePageStaticNested(
                          navCustom,
                          anchor.topId,
                          anchor.groupTitle,
                          anchor.nestedTitle,
                      );
            } else if (req.kind === "link" && req.rowKey) {
                const linkId = linkIdFromCustomRowKey(req.rowKey);
                next = linkId
                    ? removeCustomLink(navCustom, req.anchor, req.rowKey)
                    : hideParentAppSlot(navCustom, req.rowKey);
            }
            await saveNavCustom(next);
            showToast("Deleted.", "success");
        } catch {
            showToast("Delete failed.", "error");
        }
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
            let next = navCustom;
            if (renameModal.kind === "top" && isBuiltInParentSection(renameModal.topId)) {
                next = renameParentAppLabel(
                    navCustom,
                    { kind: "section", sectionId: renameModal.topId, currentTitle: renameModal.currentTitle },
                    title,
                );
            } else if (renameModal.kind === "link" && isBuiltInParentSlot(renameModal.rowKey)) {
                next = renameParentAppLabel(
                    navCustom,
                    { kind: "slot", slotId: renameModal.rowKey, currentTitle: renameModal.currentTitle },
                    title,
                );
            } else {
                next = renameNavLabel(navCustom, renameModal, title);
            }
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

    const openFromChecklist = (ctx: AdminCenterPageUploadContext) => {
        setUploadContext(ctx);
        const existing = ctx.matchedDocId
            ? items.find((row) => row.id === ctx.matchedDocId)
            : findDocBySourcePath(items, ctx.sourcePath);
        const holidayState = holidayStateFromRowKey(ctx.rowKey);

        if (existing) {
            setEditing(existing);
            setForm({
                category: existing.category,
                title: existing.title,
                description: existing.description || "",
                academic_year: existing.academic_year || "AY 2026-27",
                state: existing.state || holidayState || "",
                order: existing.order ?? 0,
                is_active: existing.is_active,
                franchise_id: existing.franchise != null ? String(existing.franchise) : "",
                video_embed_url: existing.video_embed_url || "",
                source_path: existing.source_path || ctx.sourcePath || "",
            });
        } else {
            setEditing(null);
            setForm({
                ...emptyForm,
                category: ctx.category,
                title: ctx.linkLabel || "",
                state: holidayState,
                source_path: ctx.sourcePath || "",
            });
        }
        setFile(null);
        setHolidayEntries(
            existing?.category === "HOLIDAY_LISTS"
                ? parseHolidayEntries(existing.holiday_entries).length > 0
                    ? parseHolidayEntries(existing.holiday_entries)
                    : [emptyHolidayEntry()]
                : [emptyHolidayEntry()],
        );
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
        setUploadContext(null);
        setFile(null);
        setHolidayEntries([emptyHolidayEntry()]);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isHoliday && !form.state) {
            showToast("Select a state for holiday lists.", "error");
            return;
        }
        if (form.category === PARENT_NEWSLETTER_CATEGORY) {
            showToast("Newsletter is uploaded by franchise centres in Parent App.", "error");
            return;
        }
        const serializedHolidays = isHoliday ? serializeHolidayEntries(holidayEntries) : [];
        const hasHolidayFile = Boolean(file || editing?.file);
        if (isHoliday) {
            if (!hasHolidayFile) {
                const holidayErr = requireHolidayEntries(holidayEntries);
                if (holidayErr) {
                    showToast(holidayErr, "error");
                    return;
                }
            } else if (serializedHolidays.length > 0) {
                const holidayErr = validateHolidayEntries(holidayEntries);
                if (holidayErr) {
                    showToast(holidayErr, "error");
                    return;
                }
            }
        } else if (
            !editing &&
            !file &&
            !(parentCategorySupportsEmbed(form.category) && form.video_embed_url.trim())
        ) {
            showToast(
                parentCategorySupportsEmbed(form.category)
                    ? "Choose a file to upload or paste a video/embed link."
                    : "Choose a file to upload.",
                "error",
            );
            return;
        }
        const embedRaw = parentCategorySupportsEmbed(form.category) ? form.video_embed_url.trim() : "";
        const embedNormalized = embedRaw ? resolveFranchiseEmbedSrc(embedRaw) : null;
        if (embedRaw && !embedNormalized) {
            showToast("Could not read that link. Paste a YouTube URL or iframe embed URL.", "error");
            return;
        }
        if (file && embedNormalized) {
            showToast("Use either a file upload or an embed link, not both.", "error");
            return;
        }
        if (file) {
            const sizeErr = validateAdminParentDocumentUpload(file, form.category);
            if (sizeErr) {
                showToast(sizeErr, "error");
                return;
            }
        }

        const sourcePath = (form.source_path || uploadContext?.sourcePath || "").trim();

        setSubmitting(true);
        try {
            const franchise =
                form.franchise_id === "" || form.franchise_id === "__global__"
                    ? null
                    : Number(form.franchise_id);
            const resolvedTitle = isHoliday
                ? editing?.title || `${holidayStateLabel || "State"} Holiday List`
                : form.title.trim() || uploadContext?.linkLabel || file?.name || "Document";
            const resolvedAcademicYear = isHoliday ? DEFAULT_HOLIDAY_ACADEMIC_YEAR : form.academic_year;

            const baseMeta = {
                category: form.category,
                title: resolvedTitle,
                description: isHoliday ? "" : form.description,
                academic_year: resolvedAcademicYear || "",
                state: isHoliday ? form.state : null,
                order: form.order,
                is_active: form.is_active,
                franchise,
                source_path: sourcePath || "",
            };

            if (editing) {
                if (isHoliday) {
                    await authFetch(`/documents/admin/parent-documents/${editing.id}/`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...baseMeta, holiday_entries: serializedHolidays }),
                    });
                    if (file) {
                        const fd = new FormData();
                        fd.append("file", file);
                        await authFetch(`/documents/admin/parent-documents/${editing.id}/`, {
                            method: "PATCH",
                            body: fd,
                        });
                    }
                } else if (file) {
                    await authFetch(`/documents/admin/parent-documents/${editing.id}/`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...baseMeta, video_embed_url: "" }),
                    });
                    const fd = new FormData();
                    fd.append("file", file);
                    await authFetch(`/documents/admin/parent-documents/${editing.id}/`, { method: "PATCH", body: fd });
                } else {
                    await authFetch(`/documents/admin/parent-documents/${editing.id}/`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...baseMeta,
                            video_embed_url: embedNormalized || "",
                        }),
                    });
                }
                showToast("Document updated.", "success");
            } else if (isHoliday) {
                if (file) {
                    const fd = new FormData();
                    fd.append("category", form.category);
                    fd.append("title", resolvedTitle);
                    fd.append("description", "");
                    fd.append("academic_year", resolvedAcademicYear);
                    fd.append("order", String(form.order));
                    fd.append("is_active", form.is_active ? "true" : "false");
                    fd.append("state", form.state);
                    if (sourcePath) fd.append("source_path", sourcePath);
                    if (franchise != null) fd.append("franchise", String(franchise));
                    fd.append("file", file);
                    if (serializedHolidays.length > 0) {
                        fd.append("holiday_entries", JSON.stringify(serializedHolidays));
                    }
                    await authFetch("/documents/admin/parent-documents/", { method: "POST", body: fd });
                } else {
                    await authFetch("/documents/admin/parent-documents/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...baseMeta,
                            holiday_entries: serializedHolidays,
                        }),
                    });
                }
                showToast("Holiday list saved for parents.", "success");
            } else if (embedNormalized) {
                await authFetch("/documents/admin/parent-documents/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...baseMeta,
                        video_embed_url: embedNormalized,
                    }),
                });
                showToast("Video link saved for parents.", "success");
            } else {
                const fd = new FormData();
                fd.append("category", form.category);
                fd.append("title", resolvedTitle);
                fd.append("description", form.description);
                fd.append("academic_year", resolvedAcademicYear);
                fd.append("order", String(form.order));
                fd.append("is_active", form.is_active ? "true" : "false");
                if (sourcePath) fd.append("source_path", sourcePath);
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
                <h1 className="text-2xl font-semibold text-slate-900">Parent documents</h1>
                <p className="mt-2 text-sm text-slate-600">
                    <strong>Custom section → upload:</strong> (1) <strong>Add top-level section</strong> or use an
                    existing section → <strong>Add</strong> → <strong>Add subsection</strong> /{" "}
                    <strong>Add nested section</strong> as needed. (2) On that subsection click{" "}
                    <strong>Add</strong> → <strong>Add file / link</strong> — enter a name only (creates the row) or
                    add the file in the same step. (3) The row shows <strong>Upload</strong> — click it and the modal
                    opens with the full path (e.g. <em>My Section › Subsection › File name</em>), file field, and
                    video/embed link for Videos / Audio Rhymes. After upload the button becomes <strong>Edit</strong>.
                    <strong className="text-slate-800"> Holiday Lists</strong> — state PDF and/or manual holiday table.
                    <strong className="text-slate-800"> Newsletter</strong> — franchise centres only.
                </p>
            </div>

            {loading ? (
                <p className="text-sm text-slate-500">Loading checklist…</p>
            ) : (
                <AdminCentrePageChecklist
                    sections={mergedSections}
                    hubDocs={hubDocs}
                    onManageLink={openFromChecklist}
                    onAddRequest={handleAddRequest}
                    onRemoveRequest={handleRemoveRequest}
                    onRenameRequest={handleRenameRequest}
                    onDeleteUpload={handleDeleteUpload}
                    isCustomTop={(id) => isCustomTopSection(navCustom, id)}
                    linkLookupBuilder={linkLookupBuilder}
                />
            )}

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
                        />
                    </label>
                    {addModal?.kind === "link" ? (
                        <>
                            <p className="text-xs text-slate-500">
                                Leave file empty and click <strong>Save</strong> to create the row — then use{" "}
                                <strong>Upload</strong> on that row later. Or pick a file / link now and click{" "}
                                <strong>Save &amp; upload</strong>.
                            </p>
                            <ChecklistFileUploadField
                                id="add-parent-app-file"
                                accept={acceptForParentDocumentCategory(
                                    inferParentCategoryForAnchor(addModal.anchor, mergedSections),
                                )}
                                hint={uploadHintForParentDocumentCategory(
                                    inferParentCategoryForAnchor(addModal.anchor, mergedSections),
                                )}
                                required={false}
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
                                  ? addFile || addEmbedUrl.trim()
                                      ? "Save & upload"
                                      : "Save"
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
                title={editing ? "Edit parent document" : "Upload for parent app"}
            >
                <form onSubmit={submit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {uploadContext ? (
                        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900">
                            {uploadContext.breadcrumbLabel}
                        </p>
                    ) : null}

                    {isHoliday ? (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                            <p>
                                <span className="font-semibold text-slate-900">State:</span>{" "}
                                {holidayStateLabel || "Select a state row from the checklist"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <label className="text-xs font-semibold text-slate-600 block">
                                Title
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
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
                        </>
                    )}
                    {!isHoliday ? (
                        <ChecklistFileUploadField
                            id="parent-app-file"
                            accept={acceptForParentDocumentCategory(form.category)}
                            hint={uploadHintForParentDocumentCategory(form.category)}
                            required={
                                !editing &&
                                !(parentCategorySupportsEmbed(form.category) && form.video_embed_url.trim())
                            }
                            currentName={file?.name ?? (editing?.file ? "Current file on server" : null)}
                            onChange={setFile}
                        />
                    ) : (
                        <ChecklistFileUploadField
                            id="parent-app-file"
                            accept={acceptForParentDocumentCategory(form.category)}
                            hint={uploadHintForParentDocumentCategory(form.category)}
                            required={!editing && serializeHolidayEntries(holidayEntries).length === 0}
                            currentName={file?.name ?? (editing?.file ? "Current file on server" : null)}
                            onChange={setFile}
                        />
                    )}
                    {parentCategorySupportsEmbed(form.category) && !isHoliday ? (
                        <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                            Video / iframe embed link
                            <textarea
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono min-h-[72px]"
                                placeholder="https://www.youtube.com/watch?v=… or iframe embed URL"
                                value={form.video_embed_url}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, video_embed_url: e.target.value }))
                                }
                            />
                            <span className="text-[11px] font-normal text-slate-500">
                                Upload a file above, or paste a YouTube / video embed link here — not both.
                            </span>
                        </label>
                    ) : null}
                    {isHoliday ? (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-600">
                                Add holidays manually (parents see PDF and/or this table)
                            </p>
                            <HolidayEntriesEditor rows={holidayEntries} onChange={setHolidayEntries} />
                        </div>
                    ) : null}
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
                                    if (!window.confirm("Delete this upload permanently?")) return;
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

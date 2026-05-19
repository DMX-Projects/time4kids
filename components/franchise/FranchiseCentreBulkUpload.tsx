"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Upload, Trash2, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { FranchiseLocalFolderPicker } from "@/components/franchise/FranchiseLocalFolderPicker";
import { openParentDocumentFile } from "@/lib/parent-document-file-open";
import { openFranchiseHubDocument } from "@/lib/franchise-hub-document-open";
import { FRANCHISE_DOCUMENT_CATEGORY_ORDER } from "@/config/franchise-dashboard-resource-order";
import { normalizeApiList } from "@/lib/parent-school-api";
import {
    classifyParentUploadFile,
    ensureShowcaseEventId,
    uploadEventMediaFile,
    uploadFranchiseHubDocument,
    uploadAdminFranchiseHubDocument,
    validateFileSize,
    validateHubFileSize,
    type BulkUploadResult,
} from "@/lib/franchise-centre-upload";
import type { FranchiseHubDoc } from "@/components/dashboard/franchise/FranchiseResourceFileRow";

type ParentDoc = {
    id: number;
    title: string;
    display_title?: string;
    file: string;
    category_display?: string;
};

type Props = {
    /** Hide title block when embedded in another page */
    compact?: boolean;
    /** Parent documents / showcase only (hide franchise hub option) */
    parentsOnly?: boolean;
    /** Admin dashboard: centre resource hub via HO API (no franchise login) */
    adminHub?: boolean;
    /** After successful upload */
    onComplete?: () => void;
};

export function FranchiseCentreBulkUpload({ compact, parentsOnly, adminHub, onComplete }: Props) {
    const { authFetch, tokens, authFetchBlobResponse, authFetchBlobFromHref } = useAuth();
    const { showToast } = useToast();

    const [publishShowcase, setPublishShowcase] = useState(!adminHub);
    const [publishHub, setPublishHub] = useState(adminHub || !parentsOnly);
    const [hubCategory, setHubCategory] = useState("ACADEMIC_DOCUMENTS");
    const [eventId, setEventId] = useState("");
    const [events, setEvents] = useState<{ id: number; title: string }[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState("");
    const [lastResult, setLastResult] = useState<BulkUploadResult | null>(null);

    const [parentDocs, setParentDocs] = useState<ParentDoc[]>([]);
    const [hubDocs, setHubDocs] = useState<FranchiseHubDoc[]>([]);
    const [loadingLists, setLoadingLists] = useState(true);

    const hubListPath = adminHub ? "/documents/admin/franchise-documents/" : "/documents/franchise/centre-documents/";
    const hubDeletePath = (id: number) =>
        adminHub ? `/documents/admin/franchise-documents/${id}/` : `/documents/franchise/centre-documents/${id}/`;

    const refreshLists = useCallback(async () => {
        setLoadingLists(true);
        try {
            const parentPromise = adminHub
                ? Promise.resolve([] as ParentDoc[])
                : authFetch<ParentDoc[]>("/documents/franchise/parent-documents/");
            const hubPromise = authFetch<FranchiseHubDoc[]>(hubListPath);
            const [p, h] = await Promise.all([parentPromise, hubPromise]);
            setParentDocs(Array.isArray(p) ? p : []);
            setHubDocs(Array.isArray(h) ? h : []);
        } catch {
            setParentDocs([]);
            setHubDocs([]);
        } finally {
            setLoadingLists(false);
        }
    }, [authFetch, adminHub, hubListPath]);

    const loadEvents = useCallback(async () => {
        if (adminHub) {
            setEvents([]);
            return;
        }
        try {
            const data = await authFetch<unknown>("/events/franchise/");
            setEvents(normalizeApiList(data) as { id: number; title: string }[]);
        } catch {
            setEvents([]);
        }
    }, [authFetch, adminHub]);

    useEffect(() => {
        void refreshLists();
        void loadEvents();
    }, [refreshLists, loadEvents]);

    const canSubmit = files.length > 0 && (publishShowcase || publishHub) && !uploading;

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!files.length) {
            showToast("Choose files or a folder from your computer", "error");
            return;
        }
        if (!publishShowcase && !publishHub) {
            showToast("Select at least one destination: Showcase and/or Franchise centre files", "error");
            return;
        }

        setUploading(true);
        setLastResult(null);
        const result: BulkUploadResult = { ok: 0, failed: 0, skipped: 0, errors: [] };
        let showcaseEvent = eventId;

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setProgress(`${i + 1} / ${files.length}: ${file.name}`);
                const kind = classifyParentUploadFile(file);

                if (publishShowcase) {
                    if (kind === "image" || kind === "video") {
                        const sizeErr = validateFileSize(file, kind);
                        if (sizeErr) {
                            result.failed++;
                            result.errors.push(sizeErr);
                        } else {
                            try {
                                if (!showcaseEvent) {
                                    showcaseEvent = await ensureShowcaseEventId(authFetch);
                                    setEventId(showcaseEvent);
                                }
                                await uploadEventMediaFile(authFetch, showcaseEvent, file, kind);
                                result.ok++;
                            } catch {
                                result.failed++;
                                result.errors.push(`${file.name}: showcase photo/video upload failed`);
                            }
                        }
                    } else if (kind === "document") {
                        result.skipped++;
                        result.errors.push(
                            `${file.name}: parent PDFs/docs are uploaded by head office (Admin → Parent app documents)`,
                        );
                    } else if (kind === "skip") {
                        result.skipped++;
                    }
                }

                if (publishHub) {
                    const hubErr = validateHubFileSize(file);
                    if (hubErr) {
                        result.failed++;
                        result.errors.push(hubErr);
                    } else {
                        try {
                            if (adminHub) {
                                await uploadAdminFranchiseHubDocument(authFetch, file, { category: hubCategory });
                            } else {
                                await uploadFranchiseHubDocument(authFetch, file, { category: hubCategory });
                            }
                            result.ok++;
                        } catch {
                            result.failed++;
                            result.errors.push(`${file.name}: centre file upload failed`);
                        }
                    }
                }
            }

            setLastResult(result);
            const msg = `${result.ok} uploaded · ${result.failed} failed · ${result.skipped} skipped`;
            showToast(msg, result.ok > 0 ? "success" : "error");
            if (result.ok > 0) {
                setFiles([]);
                await refreshLists();
                onComplete?.();
            }
        } finally {
            setUploading(false);
            setProgress("");
        }
    };

    const hubDocOpen = (doc: FranchiseHubDoc) => {
        const title = doc.display_title || doc.title;
        openFranchiseHubDocument(
            tokens?.access,
            authFetchBlobResponse,
            authFetchBlobFromHref,
            `/documents/franchise/documents/${doc.id}/file/`,
            title,
            doc.id,
            doc.file || "",
        );
    };

    return (
        <div className={compact ? "space-y-4" : "space-y-6 max-w-3xl"}>
            {!compact && (
                <p className="text-sm text-[#374151]">
                    {adminHub
                        ? "Choose files or a whole folder from your PC. Uploads go to centre resource pages (admin only)."
                        : "Choose files or a folder. Photos/videos can go to parent Showcase; centre resource files go to your hub pages. Parent PDFs (timetable, holidays) are head-office only."}
                </p>
            )}

            <form onSubmit={onSubmit} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-sm">
                {!adminHub && (
                <fieldset className="space-y-2">
                    <legend className="text-xs font-semibold text-[#4B5563] uppercase tracking-wide">
                        Publish to
                    </legend>
                    <label className="flex items-center gap-2 text-sm text-[#1F2937]">
                        <input
                            type="checkbox"
                            checked={publishShowcase}
                            onChange={(e) => setPublishShowcase(e.target.checked)}
                            disabled={uploading}
                            className="rounded border-gray-300"
                        />
                        Parents app — Showcase photos/videos only
                    </label>
                    {!parentsOnly && (
                        <label className="flex items-center gap-2 text-sm text-[#1F2937]">
                            <input
                                type="checkbox"
                                checked={publishHub}
                                onChange={(e) => setPublishHub(e.target.checked)}
                                disabled={uploading}
                                className="rounded border-gray-300"
                            />
                            Franchise centre files (SOP, academic, formats — your centre only)
                        </label>
                    )}
                </fieldset>
                )}

                {!adminHub && publishShowcase && (
                    <div className="grid gap-3 md:grid-cols-2 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] p-3">
                        <label className="text-xs font-semibold text-[#9A3412] block md:col-span-2">
                            Showcase event for photos/videos (optional)
                            <select
                                value={eventId}
                                onChange={(e) => setEventId(e.target.value)}
                                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white"
                                disabled={uploading}
                            >
                                <option value="">Auto-create event for this batch</option>
                                {events.map((ev) => (
                                    <option key={ev.id} value={String(ev.id)}>
                                        {ev.title}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}

                {(adminHub || publishHub) && (
                    <label className="text-xs font-semibold text-[#4B5563] block rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] p-3">
                        {adminHub ? "Centre resource file category" : "Franchise centre file category"}
                        <select
                            value={hubCategory}
                            onChange={(e) => setHubCategory(e.target.value)}
                            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white"
                            disabled={uploading}
                        >
                            {FRANCHISE_DOCUMENT_CATEGORY_ORDER.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                        <span className="block mt-1 text-[11px] text-[#0369A1]">
                            Appears on your centre pages (e.g. Academic documents) right after upload.
                        </span>
                    </label>
                )}

                <FranchiseLocalFolderPicker
                    files={files}
                    onFilesChange={setFiles}
                    disabled={uploading}
                    hint="Use Choose folder to upload everything inside a local directory (any file type for centre files)."
                />

                {progress && <p className="text-xs text-[#6B7280] animate-pulse">Uploading {progress}…</p>}

                {lastResult && (
                    <div
                        className={`flex gap-2 rounded-xl p-3 text-xs ${lastResult.ok > 0 ? "bg-green-50 text-green-900 border border-green-100" : "bg-red-50 text-red-900 border border-red-100"}`}
                    >
                        {lastResult.ok > 0 ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        )}
                        <div>
                            <p className="font-semibold">
                                {lastResult.ok} live · {lastResult.failed} failed · {lastResult.skipped} skipped
                            </p>
                            {lastResult.errors.slice(0, 5).map((err) => (
                                <p key={err} className="mt-0.5 opacity-90">
                                    {err}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                <Button type="submit" className="bg-[#FF922B] hover:brightness-105 w-full sm:w-auto" disabled={!canSubmit}>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading…" : `Upload ${files.length || ""} file(s)`}
                </Button>
            </form>

            {!compact && !adminHub && (
                <>
                    <ManageList
                        title="Parent documents (head office — view only)"
                        loading={loadingLists}
                        empty="Nothing for parents yet."
                        items={parentDocs.slice(0, 25).map((d) => ({
                            id: d.id,
                            label: d.display_title || d.title,
                            sub: d.category_display,
                            onOpen: () => openParentDocumentFile(tokens?.access, authFetchBlobResponse, d),
                        }))}
                    />
                    <ManageList
                        title="Your centre resource files (live)"
                        loading={loadingLists}
                        empty="No centre uploads yet."
                        items={hubDocs.slice(0, 25).map((d) => ({
                            id: d.id,
                            label: d.display_title || d.title,
                            sub: d.category_display,
                            onOpen: () => hubDocOpen(d),
                            onDelete: async () => {
                                await authFetch(hubDeletePath(d.id), { method: "DELETE" });
                                await refreshLists();
                            },
                        }))}
                    />
                </>
            )}
            {!compact && adminHub && (
                <ManageList
                    title="Centre resource files (live)"
                    loading={loadingLists}
                    empty="No uploads yet."
                    items={hubDocs.slice(0, 50).map((d) => ({
                        id: d.id,
                        label: d.display_title || d.title,
                        sub: d.category_display,
                        onOpen: () => hubDocOpen(d),
                        onDelete: async () => {
                            await authFetch(hubDeletePath(d.id), { method: "DELETE" });
                            await refreshLists();
                        },
                    }))}
                />
            )}
        </div>
    );
}

function ManageList({
    title,
    loading,
    empty,
    items,
}: {
    title: string;
    loading: boolean;
    empty: string;
    items: { id: number; label: string; sub?: string; onOpen: () => void; onDelete?: () => Promise<void> }[];
}) {
    const { showToast } = useToast();
    return (
        <section className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-2">
            <h2 className="text-sm font-semibold text-[#1F2937]">{title}</h2>
            {loading && <p className="text-sm text-[#6B7280]">Loading…</p>}
            {!loading && items.length === 0 && <p className="text-sm text-[#6B7280]">{empty}</p>}
            <ul className="space-y-2 max-h-56 overflow-y-auto">
                {items.map((item) => (
                    <li
                        key={item.id}
                        className="flex items-center justify-between gap-2 border border-[#F3F4F6] rounded-lg px-3 py-2 text-sm"
                    >
                        <div className="min-w-0">
                            <p className="font-medium truncate text-[#1F2937]">{item.label}</p>
                            {item.sub && <p className="text-[11px] text-[#6B7280] truncate">{item.sub}</p>}
                        </div>
                        <span className="shrink-0 flex gap-2">
                            <button
                                type="button"
                                className="text-[#2563EB] text-xs font-semibold inline-flex items-center gap-1"
                                onClick={item.onOpen}
                            >
                                <Download className="w-3.5 h-3.5" />
                                Open
                            </button>
                            {item.onDelete && (
                                <button
                                    type="button"
                                    className="text-red-600 text-xs font-semibold inline-flex items-center gap-1"
                                    onClick={() => {
                                        void item.onDelete!().then(
                                            () => showToast("Deleted", "success"),
                                            () => showToast("Delete failed", "error"),
                                        );
                                    }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                </button>
                            )}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

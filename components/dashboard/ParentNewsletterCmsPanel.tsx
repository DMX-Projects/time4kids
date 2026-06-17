"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { ChecklistFileUploadField } from "@/components/dashboard/admin/ChecklistFileUploadField";
import { CmsPublishTargetFields } from "@/components/dashboard/admin/CmsPublishTargetFields";
import { ParentDocumentCmsLayout, type ParentDocumentSentRow } from "@/components/dashboard/ParentDocumentCmsLayout";
import type { AdminFranchise } from "@/components/dashboard/admin/AdminDataProvider";
import {
    CMS_CLASS_SELECT_OPTIONS,
    classLabelFromSelectValue,
    classSelectValueFromLabel,
    normalizeStoredClassFilter,
} from "@/lib/student-class-match";
import {
    PARENT_NEWSLETTER_CATEGORY,
    PARENT_NEWSLETTER_DESCRIPTION,
    PARENT_NEWSLETTER_AUDIO_FILE_ACCEPT,
    PARENT_NEWSLETTER_AUDIO_FILE_HINT,
    PARENT_NEWSLETTER_FILE_ACCEPT,
    PARENT_NEWSLETTER_FILE_HINT,
    newsletterKindChangePatch,
    newsletterKindLabel,
    newsletterRowKind,
    validateNewsletterAudioEmbedUrl,
    validateNewsletterAudioUpload,
    validateNewsletterUpload,
    validateNewsletterVideoEmbedUrl,
    type NewsletterRowKind,
} from "@/config/parent-newsletter";
import {
    emptyCmsPublishTarget,
    franchiseDocumentClassPayload,
    parentDocumentTargetPayload,
    publishTargetFromDoc,
    publishTargetSummary,
    validateCmsPublishTarget,
    type CmsPublishTargetForm,
} from "@/lib/cms-publish-target";
import { resolveFranchiseEmbedSrc } from "@/lib/franchise-embed-url";
import { jsonHeaders } from "@/lib/api-client";

type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
type ShowToastFn = (message: string, type?: "success" | "error" | "info") => void;

type NewsletterDocRow = {
    id: number;
    title: string;
    period_start?: string;
    period_end?: string;
    franchise?: number | null;
    franchise_name?: string | null;
    file?: string;
    video_embed_url?: string;
    audio_file?: string;
    audio_embed_url?: string;
    created_at?: string;
    publish_scope?: string;
    target_states?: string[];
    target_cities?: string[];
    target_franchise_ids?: number[];
    target_class_names?: string[];
    class_name?: string;
};

function normalizeList<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && Array.isArray((data as { results?: unknown[] }).results)) {
        return (data as { results: T[] }).results;
    }
    return [];
}

const todayLocal = () => new Date().toISOString().slice(0, 10);

function rowKindFromDoc(row: NewsletterDocRow): NewsletterRowKind {
    return (
        newsletterRowKind(row) ||
        (row.file ? "document" : row.video_embed_url ? "video" : row.audio_file || row.audio_embed_url ? "audio" : "document")
    );
}

const emptyForm = () => ({
    title: "",
    period_start: todayLocal(),
    newsletter_kind: "document" as NewsletterRowKind,
    video_embed_url: "",
    audio_embed_url: "",
});

type Props = {
    mode: "admin" | "franchise";
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
    franchises?: AdminFranchise[];
};

export function ParentNewsletterCmsPanel({ mode, authFetch, showToast, franchises = [] }: Props) {
    const isAdmin = mode === "admin";
    const listBase = isAdmin ? "/documents/admin/parent-documents/" : "/documents/franchise/parent-documents/";
    const detailBase = listBase;

    const [rows, setRows] = useState<NewsletterDocRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [trackDate, setTrackDate] = useState(todayLocal);
    const [form, setForm] = useState(emptyForm());
    const [file, setFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [publishTarget, setPublishTarget] = useState<CmsPublishTargetForm>(emptyCmsPublishTarget());
    const [classFilter, setClassFilter] = useState("");
    const [editModal, setEditModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [editForm, setEditForm] = useState(emptyForm());
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editAudioFile, setEditAudioFile] = useState<File | null>(null);
    const [editTarget, setEditTarget] = useState<CmsPublishTargetForm>(emptyCmsPublishTarget());
    const [editClassFilter, setEditClassFilter] = useState("");
    const [editSaving, setEditSaving] = useState(false);
    const [editRow, setEditRow] = useState<NewsletterDocRow | null>(null);

    const classOptions = useMemo(
        () => CMS_CLASS_SELECT_OPTIONS.map((p) => ({ value: p.label, label: p.label })),
        [],
    );

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ manage: "newsletter", date: trackDate });
            const data = await authFetch<unknown>(`${listBase}?${params.toString()}`);
            setRows(normalizeList<NewsletterDocRow>(data));
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, listBase, trackDate]);

    useEffect(() => {
        void load();
    }, [load]);

    const sentRows: ParentDocumentSentRow[] = useMemo(
        () =>
            rows.map((row) => {
                const kind = rowKindFromDoc(row);
                const source =
                    row.franchise == null
                        ? isAdmin
                            ? publishTargetSummary(publishTargetFromDoc(row), franchises)
                            : "Head office"
                        : isAdmin
                          ? row.franchise_name || "One centre"
                          : "Your centre";
                return {
                    id: row.id,
                    title: row.title,
                    badge: newsletterKindLabel(kind),
                    meta: `${row.period_start || "—"} · ${source}${(row.target_class_names || [])[0] || row.class_name ? ` · Class: ${(row.target_class_names || [])[0] || row.class_name}` : ""}`,
                    published_at: row.created_at,
                };
            }),
        [rows, isAdmin, franchises],
    );

    const validateNewsletterForm = (
        kind: NewsletterRowKind,
        periodStart: string,
        title: string,
        videoUrl: string,
        audioUrl: string,
        docFile: File | null,
        audio: File | null,
        editing: NewsletterDocRow | null,
        target: CmsPublishTargetForm,
    ): string | null => {
        const videoErr = validateNewsletterVideoEmbedUrl(videoUrl);
        if (videoErr) return videoErr;
        const audioLinkErr = validateNewsletterAudioEmbedUrl(audioUrl);
        if (audioLinkErr) return audioLinkErr;
        if (kind === "audio" && audio) {
            const audioErr = validateNewsletterAudioUpload(audio);
            if (audioErr) return audioErr;
        }
        if (kind === "document" && docFile) {
            const pdfErr = validateNewsletterUpload(docFile);
            if (pdfErr) return pdfErr;
        }
        if (!editing) {
            if (kind === "document" && !docFile) return "Choose a PDF or Word file.";
            if (kind === "video" && !videoUrl.trim()) return "Paste a video link.";
            if (kind === "audio" && !audio && !audioUrl.trim()) return "Upload audio or paste an audio link.";
        }
        if (!periodStart.trim()) return "Choose the newsletter block date.";
        if (isAdmin) {
            const targetErr = validateCmsPublishTarget(target);
            if (targetErr) return targetErr;
        }
        return null;
    };

    const buildCreatePayload = async (
        kind: NewsletterRowKind,
        periodStart: string,
        title: string,
        videoUrl: string,
        audioUrl: string,
        docFile: File | null,
        audio: File | null,
        target: CmsPublishTargetForm,
    ) => {
        const resolvedTitle = title.trim() || docFile?.name.replace(/\.[^.]+$/, "") || "Newsletter";
        const periodEnd = periodStart;
        const embedVideo = kind === "video" ? resolveFranchiseEmbedSrc(videoUrl.trim()) || "" : "";
        const targetPayload = isAdmin ? parentDocumentTargetPayload(target) : null;
        const franchise = isAdmin ? targetPayload?.franchise ?? null : undefined;

        const fd = new FormData();
        fd.append("category", PARENT_NEWSLETTER_CATEGORY);
        fd.append("title", resolvedTitle);
        fd.append("description", "");
        fd.append("academic_year", "AY 2026-27");
        fd.append("order", "0");
        fd.append("is_active", "true");
        fd.append("period_start", periodStart);
        fd.append("period_end", periodEnd);
        if (isAdmin && targetPayload) {
            fd.append("publish_scope", targetPayload.publish_scope);
            fd.append("target_states", JSON.stringify(targetPayload.target_states));
            fd.append("target_cities", JSON.stringify(targetPayload.target_cities));
            fd.append("target_franchise_ids", JSON.stringify(targetPayload.target_franchise_ids));
            fd.append("target_class_names", JSON.stringify(targetPayload.target_class_names));
            if (targetPayload.class_name) fd.append("class_name", targetPayload.class_name);
            if (franchise != null) fd.append("franchise", String(franchise));
        } else if (!isAdmin) {
            const classPayload = franchiseDocumentClassPayload(classFilter);
            fd.append("target_class_names", JSON.stringify(classPayload.target_class_names));
            if (classPayload.class_name) fd.append("class_name", classPayload.class_name);
        }
        if (kind === "document" && docFile) fd.append("file", docFile);
        if (kind === "video" && embedVideo) fd.append("video_embed_url", embedVideo);
        if (kind === "audio") {
            if (audio) fd.append("audio_file", audio);
            if (audioUrl.trim()) fd.append("audio_embed_url", audioUrl.trim());
        }
        await authFetch(listBase, { method: "POST", body: fd });
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        const err = validateNewsletterForm(
            form.newsletter_kind,
            form.period_start,
            form.title,
            form.video_embed_url,
            form.audio_embed_url,
            file,
            audioFile,
            null,
            publishTarget,
        );
        if (err) {
            showToast(err, "error");
            return;
        }
        setSubmitting(true);
        try {
            await buildCreatePayload(
                form.newsletter_kind,
                form.period_start.trim(),
                form.title,
                form.video_embed_url,
                form.audio_embed_url,
                file,
                audioFile,
                publishTarget,
            );
            setForm(emptyForm());
            setFile(null);
            setAudioFile(null);
            setPublishTarget(emptyCmsPublishTarget());
            setClassFilter("");
            showToast("Newsletter saved — visible in the real parent login app.", "success");
            await load();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Upload failed.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const openEdit = async (row: ParentDocumentSentRow) => {
        const full = rows.find((r) => r.id === row.id);
        if (!full) return;
        if (!isAdmin && full.franchise == null) {
            showToast("Head-office newsletters cannot be edited here.", "info");
            return;
        }
        const kind = rowKindFromDoc(full);
        setEditRow(full);
        setEditForm({
            title: full.title,
            period_start: full.period_start || todayLocal(),
            newsletter_kind: kind,
            video_embed_url: full.video_embed_url || "",
            audio_embed_url: full.audio_embed_url || "",
        });
        setEditTarget(isAdmin ? publishTargetFromDoc(full) : emptyCmsPublishTarget());
        setEditClassFilter(normalizeStoredClassFilter((full.target_class_names || [])[0] || full.class_name || ""));
        setEditFile(null);
        setEditAudioFile(null);
        setEditModal({ isOpen: true, id: full.id });
    };

    const closeEdit = () => {
        setEditModal({ isOpen: false, id: null });
        setEditRow(null);
        setEditForm(emptyForm());
        setEditFile(null);
        setEditAudioFile(null);
    };

    const saveEdit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editModal.id) return;
        const err = validateNewsletterForm(
            editForm.newsletter_kind,
            editForm.period_start,
            editForm.title,
            editForm.video_embed_url,
            editForm.audio_embed_url,
            editFile,
            editAudioFile,
            editRow,
            editTarget,
        );
        if (err) {
            showToast(err, "error");
            return;
        }
        setEditSaving(true);
        try {
            const periodStart = editForm.period_start.trim();
            const embedVideo =
                editForm.newsletter_kind === "video"
                    ? resolveFranchiseEmbedSrc(editForm.video_embed_url.trim()) || ""
                    : "";
            const targetPayload = isAdmin ? parentDocumentTargetPayload(editTarget) : null;
            const kind = editForm.newsletter_kind;
            const meta: Record<string, unknown> = {
                category: PARENT_NEWSLETTER_CATEGORY,
                title: editForm.title.trim() || editRow?.title || "Newsletter",
                period_start: periodStart,
                period_end: periodStart,
                video_embed_url: kind === "video" ? embedVideo : "",
                audio_embed_url: kind === "audio" ? editForm.audio_embed_url.trim() : "",
                ...(targetPayload || {}),
                ...(isAdmin ? {} : franchiseDocumentClassPayload(editClassFilter)),
            };
            if (kind !== "document" && editRow?.file) meta.file = null;
            if (kind !== "audio" && (editRow?.audio_file || editRow?.audio_embed_url)) meta.audio_file = null;
            await authFetch(`${detailBase}${editModal.id}/`, {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify(meta),
            });
            if (kind === "document" && editFile) {
                const fd = new FormData();
                fd.append("file", editFile);
                await authFetch(`${detailBase}${editModal.id}/`, { method: "PATCH", body: fd });
            }
            if (kind === "audio" && editAudioFile) {
                const fd = new FormData();
                fd.append("audio_file", editAudioFile);
                await authFetch(`${detailBase}${editModal.id}/`, { method: "PATCH", body: fd });
            }
            closeEdit();
            showToast("Newsletter updated.", "success");
            await load();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Update failed.", "error");
        } finally {
            setEditSaving(false);
        }
    };

    const remove = async (row: ParentDocumentSentRow) => {
        const full = rows.find((r) => r.id === row.id);
        if (!full) return;
        if (!isAdmin && full.franchise == null) {
            showToast("Head-office newsletters cannot be deleted here.", "error");
            return;
        }
        if (!window.confirm("Delete this newsletter?")) return;
        try {
            await authFetch(`${detailBase}${full.id}/`, { method: "DELETE" });
            if (editModal.id === full.id) closeEdit();
            showToast("Deleted.", "success");
            await load();
        } catch {
            showToast("Delete failed.", "error");
        }
    };

    const mediaFields = (
        kind: NewsletterRowKind,
        values: typeof form,
        onChange: (patch: Partial<typeof form>) => void,
        docFile: File | null,
        onDocFile: (f: File | null) => void,
        audio: File | null,
        onAudio: (f: File | null) => void,
        editing: boolean,
        existing?: NewsletterDocRow | null,
    ) => (
        <>
            <label className="block text-xs font-semibold text-[#4B5563]">
                Media type
                <select
                    value={kind}
                    onChange={(e) => {
                        const nextKind = e.target.value as NewsletterRowKind;
                        onChange(newsletterKindChangePatch(nextKind));
                        if (nextKind === "document") onAudio(null);
                        else onDocFile(null);
                        if (nextKind === "video") onAudio(null);
                    }}
                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                >
                    <option value="document">PDF / Word document</option>
                    <option value="video">Video link</option>
                    <option value="audio">Audio</option>
                </select>
            </label>
            {kind === "document" ? (
                <ChecklistFileUploadField
                    id={`newsletter-doc-${editing ? "edit" : "new"}`}
                    accept={PARENT_NEWSLETTER_FILE_ACCEPT}
                    hint={PARENT_NEWSLETTER_FILE_HINT}
                    required={!editing}
                    currentName={docFile?.name ?? (existing?.file ? "Current file on server" : null)}
                    onChange={onDocFile}
                />
            ) : null}
            {kind === "video" ? (
                <label className="flex flex-col gap-1 text-xs font-medium text-[#4B5563]">
                    Video / iframe embed link
                    <textarea
                        className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-mono min-h-[72px]"
                        placeholder="https://www.youtube.com/watch?v=…"
                        value={values.video_embed_url}
                        onChange={(e) => onChange({ video_embed_url: e.target.value })}
                    />
                </label>
            ) : null}
            {kind === "audio" ? (
                <>
                    <ChecklistFileUploadField
                        id={`newsletter-audio-${editing ? "edit" : "new"}`}
                        accept={PARENT_NEWSLETTER_AUDIO_FILE_ACCEPT}
                        hint={PARENT_NEWSLETTER_AUDIO_FILE_HINT}
                        required={!editing && !values.audio_embed_url.trim()}
                        currentName={audio?.name ?? (existing?.audio_file ? "Current audio on server" : null)}
                        onChange={onAudio}
                    />
                    <label className="flex flex-col gap-1 text-xs font-medium text-[#4B5563]">
                        Or audio link
                        <input
                            className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                            placeholder="https://…/file.mp3"
                            value={values.audio_embed_url}
                            onChange={(e) => onChange({ audio_embed_url: e.target.value })}
                        />
                    </label>
                </>
            ) : null}
        </>
    );

    return (
        <>
            <ParentDocumentCmsLayout
                onSubmit={submit}
                uploadTitle="Upload newsletter"
                uploadIntro={
                    isAdmin
                        ? `${PARENT_NEWSLETTER_DESCRIPTION} Saved rows appear in the real parent login app (web + mobile) for parents at targeted centres. Choose publish scope — pan-India, state, city, or specific centre(s). Class filter is optional.`
                        : "Saved rows appear in the real parent login app for your centre's parents. Same fields as head office — PDF, video link, or audio. Parents only see a newsletter when it matches their child's class (if you set a class filter); this CMS list shows everything sent to your centre, including other classes and head-office items."
                }
                uploadFields={
                    <>
                        {isAdmin ? (
                            <CmsPublishTargetFields
                                franchises={franchises}
                                value={publishTarget}
                                onChange={setPublishTarget}
                                showClassTarget
                                classOptions={classOptions}
                            />
                        ) : (
                            <label className="block text-xs font-semibold text-[#4B5563]">
                                Class filter
                                <select
                                    value={classSelectValueFromLabel(classFilter)}
                                    onChange={(e) => setClassFilter(classLabelFromSelectValue(e.target.value))}
                                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-white"
                                >
                                    <option value="">All classes at your centre</option>
                                    {CMS_CLASS_SELECT_OPTIONS.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-[11px] font-normal text-slate-500">
                                    {classFilter.trim()
                                        ? `Only ${classFilter.trim()} parents will see this.`
                                        : "Leave as all classes to show every parent at your centre."}
                                </p>
                            </label>
                        )}
                        <label className="block text-xs font-semibold text-[#4B5563]">
                            Block date
                            <input
                                type="date"
                                required
                                value={form.period_start}
                                onChange={(e) => setForm((p) => ({ ...p, period_start: e.target.value }))}
                                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                            />
                        </label>
                        <label className="block text-xs font-semibold text-[#4B5563]">
                            Title
                            <input
                                value={form.title}
                                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                            />
                        </label>
                        {mediaFields(
                            form.newsletter_kind,
                            form,
                            (patch) => setForm((p) => ({ ...p, ...patch })),
                            file,
                            setFile,
                            audioFile,
                            setAudioFile,
                            false,
                        )}
                    </>
                }
                submitButton={
                    <Button type="submit" disabled={submitting} className="bg-[#FF922B] text-white w-full sm:w-auto">
                        {submitting ? "Saving…" : "Publish newsletter"}
                    </Button>
                }
                sentTitle="Published newsletters"
                sentIntro="Newsletters visible to parents for the selected block date."
                trackDate={trackDate}
                onTrackDateChange={setTrackDate}
                loading={loading}
                rows={sentRows}
                emptySentMessage={`No newsletter for ${trackDate}. Change the track date or publish one.`}
                onEdit={openEdit}
                onDelete={remove}
                canEditRow={(row) => {
                    const full = rows.find((r) => r.id === row.id);
                    return isAdmin || (full?.franchise != null);
                }}
                canDeleteRow={(row) => {
                    const full = rows.find((r) => r.id === row.id);
                    return isAdmin || (full?.franchise != null);
                }}
            />

            <Modal isOpen={editModal.isOpen} onClose={closeEdit} title="Edit newsletter" size="md" placement="center">
                <form onSubmit={saveEdit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    {isAdmin ? (
                        <CmsPublishTargetFields
                            franchises={franchises}
                            value={editTarget}
                            onChange={setEditTarget}
                            showClassTarget
                            classOptions={classOptions}
                        />
                    ) : (
                        <label className="block text-xs font-semibold text-[#4B5563]">
                            Class filter
                            <select
                                value={classSelectValueFromLabel(editClassFilter)}
                                onChange={(e) => setEditClassFilter(classLabelFromSelectValue(e.target.value))}
                                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-white"
                            >
                                <option value="">All classes at your centre</option>
                                {CMS_CLASS_SELECT_OPTIONS.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Block date
                        <input
                            type="date"
                            required
                            value={editForm.period_start}
                            onChange={(e) => setEditForm((p) => ({ ...p, period_start: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Title
                        <input
                            value={editForm.title}
                            onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    {mediaFields(
                        editForm.newsletter_kind,
                        editForm,
                        (patch) => setEditForm((p) => ({ ...p, ...patch })),
                        editFile,
                        setEditFile,
                        editAudioFile,
                        setEditAudioFile,
                        true,
                        editRow,
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                        <Button type="submit" disabled={editSaving} className="bg-[#FF922B] text-white">
                            {editSaving ? "Saving…" : "Save changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={closeEdit}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

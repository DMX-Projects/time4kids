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
    PARENT_PARENTAL_TIPS_CATEGORY,
    PARENT_PARENTAL_TIPS_DESCRIPTION,
    PARENT_PARENTAL_TIPS_AUDIO_FILE_ACCEPT,
    PARENT_PARENTAL_TIPS_AUDIO_FILE_HINT,
    PARENT_PARENTAL_TIPS_FILE_ACCEPT,
    PARENT_PARENTAL_TIPS_FILE_HINT,
    parentalTipsKindChangePatch,
    parentalTipsKindLabel,
    parentalTipsRowKind,
    validateParentalTipsAudioEmbedUrl,
    validateParentalTipsAudioUpload,
    validateParentalTipsUpload,
    PARENT_PARENTAL_TIPS_VIDEO_FILE_ACCEPT,
    PARENT_PARENTAL_TIPS_VIDEO_FILE_HINT,
    PARENT_PARENTAL_TIPS_VIDEO_EMBED_HINT,
    PARENT_PARENTAL_TIPS_AUDIO_EMBED_HINT,
    validateParentalTipsVideoEmbedUrl,
    validateParentalTipsVideoUpload,
    type ParentalTipsRowKind,
} from "@/config/parent-parental-tips";
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
import { localDateString } from "@/lib/parent-portal-calendar";

type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
type ShowToastFn = (message: string, type?: "success" | "error" | "info") => void;

type ParentalTipsDocRow = {
    id: number;
    title: string;
    description?: string;
    updated_at?: string;
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

const todayLocal = () => localDateString();

function rowKindFromDoc(row: ParentalTipsDocRow): ParentalTipsRowKind {
    return (
        parentalTipsRowKind(row) ||
        (row.file ? "document" : row.video_embed_url ? "video" : row.audio_file || row.audio_embed_url ? "audio" : "document")
    );
}

const emptyForm = () => ({
    title: "",
    subtitle: "",
    parental_tips_kind: "document" as ParentalTipsRowKind,
    video_embed_url: "",
    audio_embed_url: "",
});

type Props = {
    mode: "admin" | "franchise";
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
    franchises?: AdminFranchise[];
};

export function ParentParentalTipsCmsPanel({ mode, authFetch, showToast, franchises = [] }: Props) {
    const isAdmin = mode === "admin";
    const listBase = isAdmin ? "/documents/admin/parent-documents/" : "/documents/franchise/parent-documents/";
    const detailBase = listBase;

    const [rows, setRows] = useState<ParentalTipsDocRow[]>([]);
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
    const [editRow, setEditRow] = useState<ParentalTipsDocRow | null>(null);

    const classOptions = useMemo(
        () => CMS_CLASS_SELECT_OPTIONS.map((p) => ({ value: p.label, label: p.label })),
        [],
    );

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ manage: "parental_tips", date: trackDate });
            const data = await authFetch<unknown>(`${listBase}?${params.toString()}`);
            setRows(normalizeList<ParentalTipsDocRow>(data));
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
                    badge: parentalTipsKindLabel(kind),
                    meta: `${(row.description || "").trim() || "—"} · ${source}${(row.target_class_names || [])[0] || row.class_name ? ` · Class: ${(row.target_class_names || [])[0] || row.class_name}` : ""}`,
                    published_at: row.updated_at || row.created_at,
                };
            }),
        [rows, isAdmin, franchises],
    );

    const validateParentalTipsForm = (
        kind: ParentalTipsRowKind,
        title: string,
        subtitle: string,
        videoUrl: string,
        audioUrl: string,
        docFile: File | null,
        audio: File | null,
        editing: ParentalTipsDocRow | null,
        target: CmsPublishTargetForm,
    ): string | null => {
        const videoErr = validateParentalTipsVideoEmbedUrl(videoUrl);
        if (videoErr) return videoErr;
        const audioLinkErr = validateParentalTipsAudioEmbedUrl(audioUrl);
        if (audioLinkErr) return audioLinkErr;
        if (kind === "audio" && audio) {
            const audioErr = validateParentalTipsAudioUpload(audio);
            if (audioErr) return audioErr;
        }
        if (kind === "document" && docFile) {
            const pdfErr = validateParentalTipsUpload(docFile);
            if (pdfErr) return pdfErr;
        }
        if (kind === "video" && docFile) {
            const videoErr = validateParentalTipsVideoUpload(docFile);
            if (videoErr) return videoErr;
        }
        if (!title.trim()) return "Enter a title.";
        if (!editing) {
            if (kind === "document" && !docFile) return "Choose a PDF or Word file.";
            if (kind === "video" && !docFile && !videoUrl.trim()) {
                return "Upload a video file or paste a video link.";
            }
            if (kind === "audio" && !audio && !audioUrl.trim()) return "Upload an audio file or paste an audio link.";
        }
        if (isAdmin) {
            const targetErr = validateCmsPublishTarget(target);
            if (targetErr) return targetErr;
        }
        return null;
    };

    const buildCreatePayload = async (
        kind: ParentalTipsRowKind,
        title: string,
        subtitle: string,
        videoUrl: string,
        audioUrl: string,
        docFile: File | null,
        audio: File | null,
        target: CmsPublishTargetForm,
    ) => {
        const resolvedTitle = title.trim() || "Parental Tips";
        const embedVideo = kind === "video" ? resolveFranchiseEmbedSrc(videoUrl.trim()) || "" : "";
        const targetPayload = isAdmin ? parentDocumentTargetPayload(target) : null;

        const fd = new FormData();
        fd.append("category", PARENT_PARENTAL_TIPS_CATEGORY);
        fd.append("title", resolvedTitle);
        fd.append("description", subtitle.trim());
        fd.append("academic_year", "AY 2026-27");
        fd.append("order", "0");
        fd.append("is_active", "true");
        if (isAdmin && targetPayload) {
            fd.append("publish_scope", targetPayload.publish_scope);
            fd.append("target_states", JSON.stringify(targetPayload.target_states));
            fd.append("target_cities", JSON.stringify(targetPayload.target_cities));
            fd.append("target_franchise_ids", JSON.stringify(targetPayload.target_franchise_ids));
            fd.append("target_class_names", JSON.stringify(targetPayload.target_class_names));
            if (targetPayload.class_name) fd.append("class_name", targetPayload.class_name);
        } else if (!isAdmin) {
            const classPayload = franchiseDocumentClassPayload(classFilter);
            fd.append("target_class_names", JSON.stringify(classPayload.target_class_names));
            if (classPayload.class_name) fd.append("class_name", classPayload.class_name);
        }
        if (kind === "document" && docFile) fd.append("file", docFile);
        if (kind === "video") {
            if (docFile) fd.append("file", docFile);
            else if (embedVideo) fd.append("video_embed_url", embedVideo);
        }
        if (kind === "audio") {
            if (audio) fd.append("audio_file", audio);
            if (audioUrl.trim()) fd.append("audio_embed_url", audioUrl.trim());
        }
        await authFetch(listBase, { method: "POST", body: fd });
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        const err = validateParentalTipsForm(
            form.parental_tips_kind,
            form.title,
            form.subtitle,
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
                form.parental_tips_kind,
                form.title,
                form.subtitle,
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
            setTrackDate(todayLocal());
            showToast("Parental tip saved — visible in the parent app.", "success");
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
            showToast("Head-office parental tips cannot be edited here.", "info");
            return;
        }
        const kind = rowKindFromDoc(full);
        setEditRow(full);
        setEditForm({
            title: full.title,
            subtitle: full.description || "",
            parental_tips_kind: kind,
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
        const err = validateParentalTipsForm(
            editForm.parental_tips_kind,
            editForm.title,
            editForm.subtitle,
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
            const embedVideo =
                editForm.parental_tips_kind === "video"
                    ? resolveFranchiseEmbedSrc(editForm.video_embed_url.trim()) || ""
                    : "";
            const targetPayload = isAdmin ? parentDocumentTargetPayload(editTarget) : null;
            const kind = editForm.parental_tips_kind;
            const meta: Record<string, unknown> = {
                category: PARENT_PARENTAL_TIPS_CATEGORY,
                title: editForm.title.trim() || editRow?.title || "Parental Tips",
                description: editForm.subtitle.trim(),
                video_embed_url: kind === "video" && !editFile ? embedVideo : "",
                audio_embed_url: kind === "audio" ? editForm.audio_embed_url.trim() : "",
                ...(targetPayload || {}),
                ...(isAdmin ? {} : franchiseDocumentClassPayload(editClassFilter)),
            };
            if (kind !== "document" && kind !== "video" && editRow?.file) meta.file = null;
            if (kind !== "audio" && (editRow?.audio_file || editRow?.audio_embed_url)) meta.audio_file = null;
            await authFetch(`${detailBase}${editModal.id}/`, {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify(meta),
            });
            if ((kind === "document" || kind === "video") && editFile) {
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
            showToast("Parental tip updated.", "success");
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
            showToast("Head-office parental tips cannot be deleted here.", "error");
            return;
        }
        if (!window.confirm("Delete this parental tip?")) return;
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
        kind: ParentalTipsRowKind,
        values: typeof form,
        onChange: (patch: Partial<typeof form>) => void,
        docFile: File | null,
        onDocFile: (f: File | null) => void,
        audio: File | null,
        onAudio: (f: File | null) => void,
        editing: boolean,
        existing?: ParentalTipsDocRow | null,
    ) => (
        <>
            <label className="block text-xs font-semibold text-[#4B5563]">
                Media type
                <select
                    value={kind}
                    onChange={(e) => {
                        const nextKind = e.target.value as ParentalTipsRowKind;
                        onChange(parentalTipsKindChangePatch(nextKind));
                        if (nextKind === "document") onAudio(null);
                        else onDocFile(null);
                        if (nextKind === "video") onAudio(null);
                    }}
                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                >
                    <option value="document">PDF / Word document</option>
                    <option value="video">Video (upload file or link)</option>
                    <option value="audio">Audio (upload file or link)</option>
                </select>
            </label>
            {kind === "document" ? (
                <ChecklistFileUploadField
                    id={`parental-tips-doc-${editing ? "edit" : "new"}`}
                    accept={PARENT_PARENTAL_TIPS_FILE_ACCEPT}
                    hint={PARENT_PARENTAL_TIPS_FILE_HINT}
                    required={!editing}
                    currentName={docFile?.name ?? (existing?.file ? "Current file on server" : null)}
                    onChange={onDocFile}
                />
            ) : null}
            {kind === "video" ? (
                <div className="space-y-3">
                    <ChecklistFileUploadField
                        id={`parental-tips-video-${editing ? "edit" : "new"}`}
                        label="Video file"
                        accept={PARENT_PARENTAL_TIPS_VIDEO_FILE_ACCEPT}
                        hint={PARENT_PARENTAL_TIPS_VIDEO_FILE_HINT}
                        required={!editing && !values.video_embed_url.trim()}
                        currentName={docFile?.name ?? (existing?.file ? "Current video on server" : null)}
                        onChange={onDocFile}
                    />
                    <p className="text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">or</p>
                    <label className="flex flex-col gap-1 text-xs font-medium text-[#4B5563]">
                        Video link (YouTube, Bunny, etc.)
                        <textarea
                            className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-mono min-h-[72px]"
                            placeholder="https://www.youtube.com/watch?v=…"
                            value={values.video_embed_url}
                            onChange={(e) => onChange({ video_embed_url: e.target.value })}
                        />
                        <span className="text-[11px] font-normal text-slate-500">{PARENT_PARENTAL_TIPS_VIDEO_EMBED_HINT}</span>
                    </label>
                </div>
            ) : null}
            {kind === "audio" ? (
                <div className="space-y-3">
                    <ChecklistFileUploadField
                        id={`parental-tips-audio-${editing ? "edit" : "new"}`}
                        label="Audio file"
                        accept={PARENT_PARENTAL_TIPS_AUDIO_FILE_ACCEPT}
                        hint={PARENT_PARENTAL_TIPS_AUDIO_FILE_HINT}
                        required={!editing && !values.audio_embed_url.trim()}
                        currentName={audio?.name ?? (existing?.audio_file ? "Current audio on server" : null)}
                        onChange={onAudio}
                    />
                    <p className="text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">or</p>
                    <label className="flex flex-col gap-1 text-xs font-medium text-[#4B5563]">
                        Audio link
                        <input
                            className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"
                            placeholder="https://…/file.mp3"
                            value={values.audio_embed_url}
                            onChange={(e) => onChange({ audio_embed_url: e.target.value })}
                        />
                        <span className="text-[11px] font-normal text-slate-500">{PARENT_PARENTAL_TIPS_AUDIO_EMBED_HINT}</span>
                    </label>
                </div>
            ) : null}
        </>
    );

    return (
        <>
            <ParentDocumentCmsLayout
                onSubmit={submit}
                uploadTitle="Upload parental tip"
                uploadIntro={
                    isAdmin
                        ? `${PARENT_PARENTAL_TIPS_DESCRIPTION} Saved rows appear in the parent app (web + mobile). Choose publish scope — pan-India, state, city, or specific centre(s).`
                        : "Create tips for your centre's parents — title, subtitle, and PDF, Word, video link, or audio."
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
                            Title
                            <input
                                value={form.title}
                                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                required
                                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                            />
                        </label>
                        <label className="block text-xs font-semibold text-[#4B5563]">
                            Subtitle
                            <input
                                value={form.subtitle}
                                onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                                placeholder="Short description for parents"
                                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                            />
                        </label>
                        {mediaFields(
                            form.parental_tips_kind,
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
                        {submitting ? "Saving…" : "Save parental tip"}
                    </Button>
                }
                sentTitle="Saved parental tips"
                sentIntro="Tips visible to parents for the selected upload date."
                trackDate={trackDate}
                onTrackDateChange={setTrackDate}
                loading={loading}
                rows={sentRows}
                emptySentMessage={`No parental tips for ${trackDate}. Change the track date or upload one.`}
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

            <Modal isOpen={editModal.isOpen} onClose={closeEdit} title="Edit parental tip" size="md" placement="center">
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
                        Title
                        <input
                            value={editForm.title}
                            onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                            required
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Subtitle
                        <input
                            value={editForm.subtitle}
                            onChange={(e) => setEditForm((p) => ({ ...p, subtitle: e.target.value }))}
                            placeholder="Short description for parents"
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    {mediaFields(
                        editForm.parental_tips_kind,
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

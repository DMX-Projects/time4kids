"use client";

import React, { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders, normalizeUploadedMediaPath, resolveCmsMediaUrl } from "@/lib/api-client";
import { countWords, NEWS_TICKER_MAX_WORDS, truncateToWordLimit } from "@/lib/text-limit";
import Link from "next/link";
import { LayoutTemplate, Plus, Trash2, ChevronDown, Upload, ImageIcon, Film } from "lucide-react";
import {
    DEFAULT_HOME_PAGE_DATA,
    mergeHomePageData,
    type FranchiseAdvantagePhotoItem,
    type FranchiseAdvantageVideoItem,
    type HomePageData,
    type NewsTickerItem,
} from "@/config/home-page-defaults";
import { franchiseVideoPosterUploadTitle, programsPreviewUploadTitle } from "@/lib/gallery-event-names";
import { FranchiseLocalFolderPicker } from "@/components/franchise/FranchiseLocalFolderPicker";
import { extensionOf, titleFromFileName } from "@/lib/franchise-centre-upload";

function Section({
    title,
    children,
    defaultOpen = true,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    return (
        <details
            open={defaultOpen}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden group"
        >
            <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-900">
                <span>{title}</span>
                <ChevronDown className="w-5 h-5 text-slate-500 transition-transform group-open:rotate-180" />
            </summary>
            <div className="p-4 border-t border-slate-100 space-y-4">{children}</div>
        </details>
    );
}

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";
const labelClass = "block text-xs font-medium text-slate-600 mb-1";

function ImgThumb({ src, alt }: { src: string; alt: string }) {
    const [ok, setOk] = useState(true);
    const trimmed = (src || "").trim();
    if (!trimmed || !ok) return null;
    return (
        <div className="h-10 w-10 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
            {/* Use plain <img> so /media and /public paths both work without Next optimizer issues */}
            <img
                src={trimmed}
                alt={alt}
                className="h-full w-full object-cover"
                onError={() => setOk(false)}
            />
        </div>
    );
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    if (typeof createImageBitmap === "function") {
        const bmp = await createImageBitmap(file);
        const dims = { width: bmp.width, height: bmp.height };
        bmp.close?.();
        return dims;
    }
    const url = URL.createObjectURL(file);
    try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new window.Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error("Could not read image"));
            el.src = url;
        });
        return { width: img.naturalWidth, height: img.naturalHeight };
    } finally {
        URL.revokeObjectURL(url);
    }
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB


function BlobMediaPreview({ src, alt }: { src: string; alt: string }) {
    const [failed, setFailed] = useState(false);
    const url = resolveCmsMediaUrl(src);
    useEffect(() => {
        setFailed(false);
    }, [src, url]);
    if (!url) return null;
    return (
        <div className="mt-2 h-36 w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-orange-200 bg-slate-100 shadow-inner">
            {!failed ? (
                <img
                    src={url}
                    alt={alt}
                    className="h-full w-full object-contain"
                    onError={() => setFailed(true)}
                />
            ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-[10px] text-amber-800">
                    <span>Preview unavailable</span>
                    <a href={url} target="_blank" rel="noreferrer" className="underline">
                        Open file
                    </a>
                </div>
            )}
        </div>
    );
}

function formatMb(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function MiniPreviewPrograms({ programs }: { programs: HomePageData["programs_preview"]["programs"] }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-slate-700 mb-2">Preview</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {programs.slice(0, 6).map((p, i) => (
                    <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 overflow-hidden">
                                <img src={(p.image || "").trim()} alt={p.programName || `Program ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-semibold text-slate-900 truncate">{p.programName || "—"}</div>
                                <div className="text-[11px] text-slate-600 truncate">{p.ageGroup || ""}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminHomeContentPage() {
    const { authFetch } = useAuth();
    const [data, setData] = useState<HomePageData>(DEFAULT_HOME_PAGE_DATA);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [uploadingProgramIndex, setUploadingProgramIndex] = useState<number | null>(null);
    const [uploadingWhyIndex, setUploadingWhyIndex] = useState<number | null>(null);
    const [uploadingSpotlight, setUploadingSpotlight] = useState<number | null>(null);
    const [uploadingFranchisePhoto, setUploadingFranchisePhoto] = useState<number | null>(null);
    const [uploadingFranchiseVideo, setUploadingFranchiseVideo] = useState<number | null>(null);
    const [bulkFolderFiles, setBulkFolderFiles] = useState<File[]>([]);
    const [uploadingBulkFolder, setUploadingBulkFolder] = useState(false);
    const [programUploadInfo, setProgramUploadInfo] = useState<Record<number, string>>({});
    const [whyUploadInfo, setWhyUploadInfo] = useState<Record<number, string>>({});
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const raw = await authFetch<HomePageData>("/common/home-page-content/");
            setData(mergeHomePageData(raw));
        } catch (e: unknown) {
            setData(DEFAULT_HOME_PAGE_DATA);
            setError(e instanceof Error ? e.message : "Load failed");
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        load();
    }, [load]);

    const save = async () => {
        setMessage(null);
        setError(null);
        setSaving(true);
        try {
            await authFetch("/common/home-page-content/", {
                method: "PUT",
                headers: jsonHeaders(),
                body: JSON.stringify(data),
            });
            setMessage("Saved. Refresh the public homepage to see changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const reset = async () => {
        if (!confirm("Reset all sections to the original default text and layout?")) return;
        setSaving(true);
        setError(null);
        setMessage(null);
        try {
            const raw = await authFetch<HomePageData>("/common/home-page-content/reset/", { method: "POST" });
            setData(mergeHomePageData(raw));
            setMessage("Restored defaults.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Reset failed");
        } finally {
            setSaving(false);
        }
    };

    const updateFranchiseVideo = (i: number, patch: Partial<FranchiseAdvantageVideoItem>) => {
        const next = [...data.franchise_advantage_videos];
        next[i] = { ...next[i], ...patch };
        setData({ ...data, franchise_advantage_videos: next });
    };

    const addFranchiseVideo = () => {
        setData({
            ...data,
            franchise_advantage_videos: [...data.franchise_advantage_videos, { poster: "", src: "", alt: "" }],
        });
    };

    const removeFranchiseVideo = (i: number) => {
        setData({
            ...data,
            franchise_advantage_videos: data.franchise_advantage_videos.filter((_, j) => j !== i),
        });
    };

    const updateFranchisePhoto = (i: number, patch: Partial<FranchiseAdvantagePhotoItem>) => {
        const next = [...(data.franchise_advantage_photos ?? [])];
        next[i] = { ...next[i], ...patch };
        setData({ ...data, franchise_advantage_photos: next });
    };

    const addFranchisePhoto = () => {
        const base = data.franchise_advantage_photos ?? [];
        setData({
            ...data,
            franchise_advantage_photos: [...base, { src: "", alt: "" }],
        });
    };

    const removeFranchisePhoto = (i: number) => {
        const base = data.franchise_advantage_photos ?? [];
        setData({
            ...data,
            franchise_advantage_photos: base.filter((_, j) => j !== i),
        });
    };

    const updateNewsTicker = (i: number, patch: Partial<NewsTickerItem>) => {
        const next = [...(data.news_ticker_items ?? [])];
        next[i] = { ...next[i], ...patch };
        setData({ ...data, news_ticker_items: next });
    };

    const addNewsTicker = () => {
        setData({
            ...data,
            news_ticker_items: [...(data.news_ticker_items ?? []), { text: "" }],
        });
    };

    const removeNewsTicker = (i: number) => {
        setData({
            ...data,
            news_ticker_items: (data.news_ticker_items ?? []).filter((_, j) => j !== i),
        });
    };

    const uploadFranchisePhoto = async (index: number, file: File) => {
        setError(null);
        setMessage(null);
        setUploadingFranchisePhoto(index);
        try {
            if (file.size > MAX_UPLOAD_BYTES) {
                throw new Error(`File is too large (${formatMb(file.size)}). Max allowed is ${formatMb(MAX_UPLOAD_BYTES)}.`);
            }
            const formData = new FormData();
            formData.append("title", `Home franchise photo ${index + 1}`);
            formData.append("category", "Banner");
            formData.append("media_type", "image");
            formData.append("file", file);

            const created = (await authFetch("/media/", { method: "POST", body: formData })) as { file?: string };
            const filePath = created?.file;
            if (!filePath || typeof filePath !== "string") {
                throw new Error("Upload succeeded but server did not return a file path.");
            }
            updateFranchisePhoto(index, { src: normalizeUploadedMediaPath(filePath) });
            setMessage("Image uploaded. Don’t forget to Save changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Image upload failed");
        } finally {
            setUploadingFranchisePhoto(null);
        }
    };

    const uploadFranchiseVideoFile = async (index: number, file: File) => {
        setError(null);
        setMessage(null);
        setUploadingFranchiseVideo(index);
        try {
            if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
                throw new Error(`File is too large (${formatMb(file.size)}). Max allowed is ${formatMb(MAX_VIDEO_UPLOAD_BYTES)}.`);
            }
            const formData = new FormData();
            formData.append("title", `Home franchise video ${index + 1}`);
            formData.append("category", "Banner");
            formData.append("media_type", "video");
            formData.append("file", file);

            const created = (await authFetch("/media/", { method: "POST", body: formData })) as { file?: string };
            const filePath = created?.file;
            if (!filePath || typeof filePath !== "string") {
                throw new Error("Upload succeeded but server did not return a file path.");
            }
            updateFranchiseVideo(index, { src: filePath });
            setMessage("Video uploaded. Don’t forget to Save changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Video upload failed");
        } finally {
            setUploadingFranchiseVideo(null);
        }
    };

    const isVideoUpload = (file: File) => {
        const ext = extensionOf(file);
        return file.type.startsWith("video/") || [".mp4", ".webm", ".mov", ".m4v"].includes(ext);
    };

    const isImageUpload = (file: File) => {
        const ext = extensionOf(file);
        return file.type.startsWith("image/") || [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"].includes(ext);
    };

    const uploadMediaFile = async (file: File, title: string, mediaType: "image" | "video") => {
        if (mediaType === "video" && file.size > MAX_VIDEO_UPLOAD_BYTES) {
            throw new Error(`${file.name}: video too large (max ${formatMb(MAX_VIDEO_UPLOAD_BYTES)}).`);
        }
        if (mediaType === "image" && file.size > MAX_UPLOAD_BYTES) {
            throw new Error(`${file.name}: image too large (max ${formatMb(MAX_UPLOAD_BYTES)}).`);
        }
        const formData = new FormData();
        formData.append("title", title);
        formData.append("category", "Banner");
        formData.append("media_type", mediaType);
        formData.append("file", file);
        const created = (await authFetch("/media/", { method: "POST", body: formData })) as { file?: string };
        const filePath = created?.file;
        if (!filePath || typeof filePath !== "string") {
            throw new Error(`${file.name}: server did not return a file path.`);
        }
        return normalizeUploadedMediaPath(filePath);
    };

    const bulkUploadFranchiseFolder = async () => {
        const picked = bulkFolderFiles.length ? [...bulkFolderFiles] : [];
        if (!picked.length) {
            setError("No files selected. Use Choose files or Choose folder, then click Upload to homepage.");
            return;
        }

        setError(null);
        setMessage(null);
        setUploadingBulkFolder(true);
        let ok = 0;
        let skipped = 0;
        let fail = 0;
        const newVideos: FranchiseAdvantageVideoItem[] = [];
        const newPhotos: FranchiseAdvantagePhotoItem[] = [];

        try {
            for (let i = 0; i < picked.length; i++) {
                const file = picked[i]!;
                const label = titleFromFileName(file);
                try {
                    if (isVideoUpload(file)) {
                        const path = await uploadMediaFile(
                            file,
                            `Home franchise video ${data.franchise_advantage_videos.length + newVideos.length + 1}`,
                            "video",
                        );
                        newVideos.push({ poster: "", src: path, alt: label });
                        ok++;
                    } else if (isImageUpload(file)) {
                        const path = await uploadMediaFile(
                            file,
                            franchiseVideoPosterUploadTitle(
                                (data.franchise_advantage_photos ?? []).length + newPhotos.length,
                            ),
                            "image",
                        );
                        newPhotos.push({ src: path, alt: label });
                        ok++;
                    } else {
                        skipped++;
                    }
                } catch (e: unknown) {
                    fail++;
                    console.error(file.name, e);
                }
            }

            if (newVideos.length || newPhotos.length) {
                setData((prev) => ({
                    ...prev,
                    franchise_advantage_videos: [...prev.franchise_advantage_videos, ...newVideos],
                    franchise_advantage_photos: [...(prev.franchise_advantage_photos ?? []), ...newPhotos],
                }));
            }

            setBulkFolderFiles([]);
            const parts = [`${ok} uploaded to homepage`];
            if (skipped) parts.push(`${skipped} skipped (not image/video)`);
            if (fail) parts.push(`${fail} failed`);
            setMessage(`${parts.join(", ")}. Click Save changes at the top.`);
        } finally {
            setUploadingBulkFolder(false);
        }
    };

    const uploadFranchiseVideoPoster = async (index: number, file: File) => {
        setError(null);
        setMessage(null);
        setUploadingSpotlight(index);
        try {
            if (file.size > MAX_UPLOAD_BYTES) {
                throw new Error(`File is too large (${formatMb(file.size)}). Max allowed is ${formatMb(MAX_UPLOAD_BYTES)}.`);
            }
            const formData = new FormData();
            formData.append("title", franchiseVideoPosterUploadTitle(index));
            formData.append("category", "Banner");
            formData.append("media_type", "image");
            formData.append("file", file);

            const created = (await authFetch("/media/", { method: "POST", body: formData })) as { file?: string };
            const filePath = created?.file;
            if (!filePath || typeof filePath !== "string") {
                throw new Error("Upload succeeded but server did not return a file path.");
            }
            updateFranchiseVideo(index, { poster: normalizeUploadedMediaPath(filePath) });
            setMessage("Image uploaded. Don’t forget to Save changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Image upload failed");
        } finally {
            setUploadingSpotlight(null);
        }
    };

    const uploadProgramsPreviewImage = async (programIndex: number, file: File) => {
        setError(null);
        setMessage(null);
        setUploadingProgramIndex(programIndex);
        try {
            if (file.size > MAX_UPLOAD_BYTES) {
                throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max allowed is 5MB.`);
            }
            try {
                const dims0 = await getImageDimensions(file);
                setProgramUploadInfo((prev) => ({
                    ...prev,
                    [programIndex]: `${file.name} • ${dims0.width}×${dims0.height}px • ${formatMb(file.size)}`,
                }));
            } catch {
                setProgramUploadInfo((prev) => ({
                    ...prev,
                    [programIndex]: `${file.name} • ${formatMb(file.size)}`,
                }));
            }

            const programName = data.programs_preview.programs[programIndex]?.programName || `Program ${programIndex + 1}`;
            const formData = new FormData();
            formData.append("title", programsPreviewUploadTitle(programName));
            formData.append("category", "Banner");
            formData.append("media_type", "image");
            formData.append("file", file);

            const created = (await authFetch("/media/", { method: "POST", body: formData })) as any;
            const filePath = created?.file;
            if (!filePath || typeof filePath !== "string") {
                throw new Error("Upload succeeded but server did not return a file path.");
            }

            const next = [...data.programs_preview.programs];
            next[programIndex] = { ...next[programIndex], image: normalizeUploadedMediaPath(filePath) };
            setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
            setMessage("Image uploaded. Don’t forget to Save changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Image upload failed");
        } finally {
            setUploadingProgramIndex(null);
        }
    };

    const uploadWhyChooseUsImage = async (featureIndex: number, file: File) => {
        setError(null);
        setMessage(null);
        setUploadingWhyIndex(featureIndex);
        try {
            if (file.size > MAX_UPLOAD_BYTES) {
                throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max allowed is 5MB.`);
            }
            try {
                const dims0 = await getImageDimensions(file);
                setWhyUploadInfo((prev) => ({
                    ...prev,
                    [featureIndex]: `${file.name} • ${dims0.width}×${dims0.height}px • ${formatMb(file.size)}`,
                }));
            } catch {
                setWhyUploadInfo((prev) => ({
                    ...prev,
                    [featureIndex]: `${file.name} • ${formatMb(file.size)}`,
                }));
            }

            const title = data.why_choose_us.features[featureIndex]?.title || `Card ${featureIndex + 1}`;
            const formData = new FormData();
            formData.append("title", `Homepage why parents love timekids: ${title}`);
            formData.append("category", "Banner");
            formData.append("media_type", "image");
            formData.append("file", file);

            const created = (await authFetch("/media/", { method: "POST", body: formData })) as any;
            const filePath = created?.file;
            if (!filePath || typeof filePath !== "string") {
                throw new Error("Upload succeeded but server did not return a file path.");
            }

            const next = [...data.why_choose_us.features];
            next[featureIndex] = { ...next[featureIndex], image: normalizeUploadedMediaPath(filePath) };
            setData({ ...data, why_choose_us: { ...data.why_choose_us, features: next } });
            setMessage("Image uploaded. Don’t forget to Save changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Image upload failed");
        } finally {
            setUploadingWhyIndex(null);
        }
    };

    return (
        <div className="pb-16">
            <div className="max-w-6xl space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                    <LayoutTemplate className="w-7 h-7 text-orange-500" />
                    Home page content
                </h1>
                <p className="text-sm text-slate-600">
                    Edit the sections below. Use <strong>Save</strong> when finished.
                </p>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading…</p>
            ) : (
                <div className="grid gap-6 max-w-6xl">
                    <div className="space-y-4 min-w-0">
                    <Section title="1. Homepage videos & posters (bulk folder)" defaultOpen>
                        <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-2 text-xs text-slate-700 space-y-1">
                            <p>
                                <strong>Upload many at once:</strong> Choose a folder. <strong>MP4 / WebM</strong> → video slides (section 2).{" "}
                                <strong>JPG / PNG</strong> → photo slides (section 3).
                            </p>
                            <p className="text-amber-900">
                                This is for the <strong>homepage ovals</strong>, not the public Photo/Video Gallery.
                            </p>
                        </div>
                        <FranchiseLocalFolderPicker
                            files={bulkFolderFiles}
                            onFilesChange={setBulkFolderFiles}
                            disabled={uploadingBulkFolder}
                            hint="Choose folder → check list → Upload to homepage → Save changes at top."
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingBulkFolder || bulkFolderFiles.length === 0}
                            onClick={() => void bulkUploadFranchiseFolder()}
                            className="inline-flex items-center gap-2 bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                        >
                            <Upload className="w-4 h-4" />
                            {uploadingBulkFolder ? "Uploading folder…" : `Upload ${bulkFolderFiles.length || ""} file(s) to homepage`}
                        </Button>
                    </Section>
                    <Section title="2. Oval blob — video (top right)" defaultOpen>
                        <div className="rounded-xl border border-orange-200 bg-orange-50/60 px-3 py-2 text-xs text-slate-700">
                            <strong>On the homepage:</strong> Top orange oval — thumbnail before play; video inside blob. Delete slide removes it. Save changes when done.
                        </div>
                        {data.franchise_advantage_videos.map((row, i) => (
                            <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Film className="h-5 w-5 text-orange-500" />
                                        <span className="text-sm font-semibold text-slate-900">Video slide {i + 1}</span>
                                    </div>
                                    <button type="button" onClick={() => removeFranchiseVideo(i)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">
                                        <Trash2 className="h-3.5 w-3.5" /> Delete slide
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <div className="min-w-0 flex-1 space-y-3">
                                        <div>
                                            <label className={labelClass}>Thumbnail (poster)</label>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <input className={inputClass} value={row.poster} onChange={(e) => updateFranchiseVideo(i, { poster: e.target.value })} placeholder="/media/…" />
                                                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                                                    <input type="file" accept="image/*" className="hidden" disabled={uploadingSpotlight === i} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadFranchiseVideoPoster(i, f); }} />
                                                    <Upload className="h-3.5 w-3.5" /> {uploadingSpotlight === i ? "Uploading…" : "Upload"}
                                                </label>
                                                <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" onClick={() => updateFranchiseVideo(i, { poster: "" })}>Clear</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Video URL (MediaDelivery / YouTube / MP4)</label>
                                            <input className={inputClass} placeholder="https://iframe.mediadelivery.net/embed/…" value={row.src} onChange={(e) => updateFranchiseVideo(i, { src: e.target.value })} />
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                                                    <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" disabled={uploadingFranchiseVideo === i} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadFranchiseVideoFile(i, f); }} />
                                                    <Film className="h-3.5 w-3.5" /> {uploadingFranchiseVideo === i ? "Uploading…" : "Upload MP4"}
                                                </label>
                                                <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" onClick={() => updateFranchiseVideo(i, { src: "" })}>Clear video</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Alt text</label>
                                            <input className={inputClass} value={row.alt ?? ""} onChange={(e) => updateFranchiseVideo(i, { alt: e.target.value })} />
                                        </div>
                                    </div>
                                    {(row.poster || "").trim() ? <BlobMediaPreview src={row.poster} alt={row.alt || `Video ${i + 1}`} /> : null}
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addFranchiseVideo} className="inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add video slide</Button>
                    </Section>

                    <Section title="3. Oval blob — promotion photos (below video)" defaultOpen>
                        <div className="rounded-xl border border-orange-200 bg-orange-50/60 px-3 py-2 text-xs text-slate-700">
                            <strong>On the homepage:</strong> Lower oval photo carousel — only slides you keep here are shown (save after delete).
                        </div>
                        {(data.franchise_advantage_photos ?? []).map((row, i) => (
                            <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-orange-500" />
                                        <span className="text-sm font-semibold text-slate-900">Photo slide {i + 1}</span>
                                    </div>
                                    <button type="button" onClick={() => removeFranchisePhoto(i)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">
                                        <Trash2 className="h-3.5 w-3.5" /> Delete slide
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <div className="min-w-0 flex-1 space-y-3">
                                        <div>
                                            <label className={labelClass}>Image URL</label>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <input className={inputClass} value={row.src} onChange={(e) => updateFranchisePhoto(i, { src: e.target.value })} placeholder="/franchise-gallery/…" />
                                                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                                                    <input type="file" accept="image/*" className="hidden" disabled={uploadingFranchisePhoto === i} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadFranchisePhoto(i, f); }} />
                                                    <Upload className="h-3.5 w-3.5" /> {uploadingFranchisePhoto === i ? "Uploading…" : "Upload"}
                                                </label>
                                                <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" onClick={() => updateFranchisePhoto(i, { src: "" })}>Clear</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Alt text</label>
                                            <input className={inputClass} value={row.alt ?? ""} onChange={(e) => updateFranchisePhoto(i, { alt: e.target.value })} />
                                        </div>
                                    </div>
                                    {(row.src || "").trim() ? <BlobMediaPreview src={row.src} alt={row.alt || `Photo ${i + 1}`} /> : null}
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addFranchisePhoto} className="inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add photo slide</Button>
                        <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 space-y-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Latest news ticker (scrolling text)</p>
                                <p className="text-xs text-slate-600 mt-1">
                                    Shown under <strong>Latest News &amp; Updates</strong> on the home page. Each line scrolls continuously in one band (separated by •). Maximum{" "}
                                    <strong>{NEWS_TICKER_MAX_WORDS} words</strong> per line.
                                </p>
                            </div>
                            {(data.news_ticker_items ?? []).map((row, i) => (
                                <div key={i} className="flex flex-wrap items-start gap-2 rounded-lg border border-slate-200 bg-white p-3">
                                    <div className="min-w-0 flex-1">
                                        <label className={labelClass}>Line {i + 1}</label>
                                        <textarea
                                            className={`${inputClass} min-h-[72px]`}
                                            value={row.text}
                                            onChange={(e) =>
                                                updateNewsTicker(i, {
                                                    text: truncateToWordLimit(e.target.value, NEWS_TICKER_MAX_WORDS),
                                                })
                                            }
                                            placeholder="Announcement text…"
                                        />
                                        <p
                                            className={`mt-1 text-[11px] ${
                                                countWords(row.text) >= NEWS_TICKER_MAX_WORDS
                                                    ? "font-semibold text-amber-700"
                                                    : "text-slate-500"
                                            }`}
                                        >
                                            {countWords(row.text)} / {NEWS_TICKER_MAX_WORDS} words
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeNewsTicker(i)}
                                        className="mt-5 inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Remove
                                    </button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addNewsTicker} className="inline-flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add news line
                            </Button>
                            <div className="pt-2 border-t border-orange-100">
                                <label className={labelClass}>Message when no lines are set</label>
                                <input
                                    className={inputClass}
                                    value={data.updates_empty_message ?? ""}
                                    onChange={(e) => setData({ ...data, updates_empty_message: e.target.value })}
                                />
                            </div>
                        </div>
                    </Section>

                    <div id="why" className="scroll-mt-24" />
                    <Section title="4. Why parents love timekids">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            <strong>Where it shows:</strong> Home page → “Why Parents Love” cards section (with photos).
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                            <div>
                                <label className={labelClass}>Heading (first part)</label>
                                <input
                                    className={inputClass}
                                    value={data.why_choose_us.heading_prefix}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            why_choose_us: { ...data.why_choose_us, heading_prefix: e.target.value },
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Heading (orange part)</label>
                                <input
                                    className={inputClass}
                                    value={data.why_choose_us.heading_accent}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            why_choose_us: { ...data.why_choose_us, heading_accent: e.target.value },
                                        })
                                    }
                                />
                            </div>
                        </div>
                        {data.why_choose_us.features.map((f, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 space-y-2 bg-slate-50/80">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Card {i + 1}</span>
                                    <button
                                        type="button"
                                        className="text-red-600 p-1"
                                        onClick={() =>
                                            setData({
                                                ...data,
                                                why_choose_us: {
                                                    ...data.why_choose_us,
                                                    features: data.why_choose_us.features.filter((_, j) => j !== i),
                                                },
                                            })
                                        }
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Image path</label>
                                        <div className="flex gap-2">
                                            <input
                                                className={inputClass}
                                                value={f.image}
                                                onChange={(e) => {
                                                    const next = [...data.why_choose_us.features];
                                                    next[i] = { ...next[i], image: e.target.value };
                                                    setData({ ...data, why_choose_us: { ...data.why_choose_us, features: next } });
                                                }}
                                            />
                                            <label
                                                className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-3 text-sm font-semibold ${
                                                    uploadingWhyIndex === i ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                                }`}
                                                title="Upload and auto-fill image path"
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={uploadingWhyIndex === i}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        e.target.value = "";
                                                        if (!file) return;
                                                        uploadWhyChooseUsImage(i, file);
                                                    }}
                                                />
                                                {uploadingWhyIndex === i ? "Uploading…" : "Upload"}
                                            </label>
                                            <button
                                                type="button"
                                                className="shrink-0 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                onClick={() => {
                                                    const next = [...data.why_choose_us.features];
                                                    next[i] = { ...next[i], image: "" };
                                                    setData({ ...data, why_choose_us: { ...data.why_choose_us, features: next } });
                                                    setMessage("Image removed from this card. Don’t forget to Save changes.");
                                                }}
                                                title="Remove image from this card"
                                            >
                                                Remove
                                            </button>
                                            <ImgThumb src={f.image} alt={f.title || `Why choose us ${i + 1}`} />
                                        </div>
                                        <div className="mt-1 text-[11px] text-slate-500 space-y-1">
                                            <div className="space-y-0.5">
                                                <div>
                                                    <span className="font-semibold text-slate-700">Requirements (recommended):</span> max{" "}
                                                    <strong>5MB</strong>, minimum <strong>800×600</strong>, best <strong>1200×900 (4:3)</strong>.
                                                </div>
                                                <div className="text-slate-500">
                                                    <span className="font-semibold text-slate-600">Enforced:</span> file size ≤5MB only — smaller or non-4:3 images still upload.
                                                </div>
                                            </div>
                                            {whyUploadInfo[i] && <div className="text-slate-600">Selected: {whyUploadInfo[i]}</div>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Title</label>
                                        <input
                                            className={inputClass}
                                            value={f.title}
                                            onChange={(e) => {
                                                const next = [...data.why_choose_us.features];
                                                next[i] = { ...next[i], title: e.target.value };
                                                setData({ ...data, why_choose_us: { ...data.why_choose_us, features: next } });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Short description</label>
                                        <input
                                            className={inputClass}
                                            value={f.desc}
                                            onChange={(e) => {
                                                const next = [...data.why_choose_us.features];
                                                next[i] = { ...next[i], desc: e.target.value };
                                                setData({ ...data, why_choose_us: { ...data.why_choose_us, features: next } });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setData({
                                    ...data,
                                    why_choose_us: {
                                        ...data.why_choose_us,
                                        features: [
                                            ...data.why_choose_us.features,
                                            {
                                                image: "/feature-safe-infrastructure.png",
                                                title: "New card",
                                                desc: "Description",
                                                color: "#FEE2E2",
                                                accent: "#EF4444",
                                            },
                                        ],
                                    },
                                })
                            }
                        >
                            <Plus className="w-4 h-4 inline mr-1" /> Add card
                        </Button>
                    </Section>

                    <div id="programs" className="scroll-mt-24" />
                    <Section title="5. Programs preview (circles on the home page)">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            <strong>Where it shows:</strong> Home page → “Our Programs” circle row.
                        </div>
                        <MiniPreviewPrograms programs={data.programs_preview.programs} />
                        {data.programs_preview.programs.map((prog, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 space-y-2 bg-slate-50/80">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Program {i + 1}</span>
                                    <button
                                        type="button"
                                        className="text-red-600 p-1"
                                        onClick={() =>
                                            setData({
                                                ...data,
                                                programs_preview: {
                                                    ...data.programs_preview,
                                                    programs: data.programs_preview.programs.filter((_, j) => j !== i),
                                                },
                                            })
                                        }
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    <div>
                                        <label className={labelClass}>Program name</label>
                                        <input
                                            className={inputClass}
                                            value={prog.programName}
                                            onChange={(e) => {
                                                const next = [...data.programs_preview.programs];
                                                next[i] = { ...next[i], programName: e.target.value };
                                                setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Age group</label>
                                        <input
                                            className={inputClass}
                                            value={prog.ageGroup}
                                            onChange={(e) => {
                                                const next = [...data.programs_preview.programs];
                                                next[i] = { ...next[i], ageGroup: e.target.value };
                                                setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                            }}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Image path</label>
                                        <div className="flex gap-2">
                                            <input
                                                className={inputClass}
                                                value={prog.image}
                                                onChange={(e) => {
                                                    const next = [...data.programs_preview.programs];
                                                    next[i] = { ...next[i], image: e.target.value };
                                                    setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                                }}
                                            />
                                            <label
                                                className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-3 text-sm font-semibold ${
                                                    uploadingProgramIndex === i ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                                }`}
                                                title="Upload and auto-fill image path"
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={uploadingProgramIndex === i}
                                                    onChange={(e) => {
                                                        const f = e.target.files?.[0];
                                                        e.target.value = "";
                                                        if (!f) return;
                                                        uploadProgramsPreviewImage(i, f);
                                                    }}
                                                />
                                                {uploadingProgramIndex === i ? "Uploading…" : "Upload"}
                                            </label>
                                            <ImgThumb src={prog.image} alt={prog.programName || `Program ${i + 1}`} />
                                        </div>
                                        <div className="mt-1 text-[11px] text-slate-500 space-y-1">
                                            <div className="space-y-0.5">
                                                <div>
                                                    <span className="font-semibold text-slate-700">Requirements (recommended):</span> max{" "}
                                                    <strong>5MB</strong>, square image recommended <strong>512×512</strong>, minimum <strong>256×256</strong>. Use “Image crop” below if the face is not centered.
                                                </div>
                                                <div className="text-slate-500">
                                                    <span className="font-semibold text-slate-600">Enforced:</span> file size ≤5MB only — smaller or non-square images still upload.
                                                </div>
                                            </div>
                                            {programUploadInfo[i] && <div className="text-slate-600">Selected: {programUploadInfo[i]}</div>}
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Description</label>
                                        <textarea
                                            className={`${inputClass} min-h-[60px]`}
                                            value={prog.description}
                                            onChange={(e) => {
                                                const next = [...data.programs_preview.programs];
                                                next[i] = { ...next[i], description: e.target.value };
                                                setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Theme colour (hex)</label>
                                        <input
                                            className={inputClass}
                                            value={prog.color}
                                            onChange={(e) => {
                                                const next = [...data.programs_preview.programs];
                                                next[i] = { ...next[i], color: e.target.value };
                                                setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Vertical offset (e.g. -20px or 40px)</label>
                                        <input
                                            className={inputClass}
                                            value={prog.yOffset}
                                            onChange={(e) => {
                                                const next = [...data.programs_preview.programs];
                                                next[i] = { ...next[i], yOffset: e.target.value };
                                                setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                            }}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Image crop (optional, e.g. center 20%)</label>
                                        <input
                                            className={inputClass}
                                            placeholder="center 20%"
                                            value={prog.imageStyle?.objectPosition ?? ""}
                                            onChange={(e) => {
                                                const next = [...data.programs_preview.programs];
                                                const v = e.target.value.trim();
                                                next[i] = {
                                                    ...next[i],
                                                    imageStyle: v ? { objectPosition: v } : undefined,
                                                };
                                                setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setData({
                                    ...data,
                                    programs_preview: {
                                        ...data.programs_preview,
                                        programs: [
                                            ...data.programs_preview.programs,
                                            {
                                                image: "/day care.png",
                                                programName: "New program",
                                                ageGroup: "0 - 0 years",
                                                description: "",
                                                color: "#ef5f5f",
                                                yOffset: "0px",
                                            },
                                        ],
                                    },
                                })
                            }
                        >
                            <Plus className="w-4 h-4 inline mr-1" /> Add program
                        </Button>
                    </Section>
                    </div>
                </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-700">{message}</p>}

            <div className="max-w-6xl flex flex-wrap gap-3 pt-4 mt-4 border-t border-slate-200">
                <Button size="sm" onClick={save} disabled={saving || loading}>
                    {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button size="sm" variant="outline" onClick={load} disabled={saving || loading}>
                    Reload from server
                </Button>
                <Button size="sm" variant="outline" onClick={reset} disabled={saving || loading} className="text-amber-800 border-amber-200">
                    Reset to defaults
                </Button>
            </div>
        </div>
    );
}

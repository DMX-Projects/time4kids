"use client";

import React, { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders, mediaUrl, publicAssetUrl } from "@/lib/api-client";
import Link from "next/link";
import { LayoutTemplate, Plus, Trash2, ChevronDown, Upload, ImageIcon, Film } from "lucide-react";
import {
    DEFAULT_HOME_PAGE_DATA,
    mergeHomePageData,
    type FranchiseAdvantagePhotoItem,
    type FranchiseAdvantageVideoItem,
    type HomePageData,
    type KeyNavItem,
} from "@/config/home-page-defaults";
import { isVirtualTourNavItem } from "@/lib/virtual-tour";

const NAV_CLASS_OPTIONS = [
    { value: "nav-link1", label: "Orange bubble (Style 1)", swatch: "from-[#ECB248] to-[#DD6705]" },
    { value: "nav-link2", label: "Green bubble (Style 2)", swatch: "from-[#B0CD67] to-[#789F35]" },
    { value: "nav-link3", label: "Red bubble (Style 3)", swatch: "from-[#D36655] to-[#BD2B13]" },
];

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

function previewMediaUrl(path: string): string {
    const t = (path || "").trim();
    if (!t) return "";
    if (/^https?:\/\//i.test(t)) return t;
    return mediaUrl(t) || publicAssetUrl(t) || t;
}

function BlobMediaPreview({ src, alt }: { src: string; alt: string }) {
    const [ok, setOk] = useState(true);
    const url = previewMediaUrl(src);
    if (!url || !ok) return null;
    return (
        <div className="mt-2 h-36 w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-orange-200 bg-slate-100 shadow-inner">
            <img
                src={url}
                alt={alt}
                className="h-full w-full object-contain"
                onError={() => setOk(false)}
            />
        </div>
    );
}

function formatMb(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function MiniPreviewKeyNav({ items }: { items: HomePageData["key_navigation"] }) {
    const list = items ?? [];
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-slate-700 mb-2">Preview</div>
            <div className="grid grid-cols-3 gap-2">
                {list.slice(0, 6).map((item, i) => {
                    const opt = NAV_CLASS_OPTIONS.find((o) => o.value === item.nav_class) ?? NAV_CLASS_OPTIONS[0];
                    return (
                        <div key={`${item.href}-${i}`} className="rounded-xl border border-slate-100 p-2 bg-slate-50">
                            <div className={`h-8 rounded-xl bg-gradient-to-br ${opt.swatch}`} />
                            <div className="mt-1 text-[11px] font-semibold text-slate-800 leading-snug line-clamp-2">
                                {item.label || "—"}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function MiniPreviewWhy({ why }: { why: HomePageData["why_choose_us"] }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-slate-700 mb-2">Preview</div>
            <div className="text-sm font-semibold text-slate-900">
                {why.heading_prefix}
                <span className="text-orange-600">{why.heading_accent}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
                {why.features.slice(0, 4).map((f, i) => (
                    <div key={i} className="rounded-xl border border-slate-100 p-2" style={{ background: f.color || "#F8FAFC" }}>
                        <div className="text-[11px] font-semibold text-slate-900 line-clamp-2">{f.title || "—"}</div>
                        <div className="text-[11px] text-slate-700 line-clamp-2 mt-0.5">{f.desc || "—"}</div>
                        <div className="mt-1 h-1.5 w-10 rounded-full" style={{ background: f.accent || "#111827" }} />
                    </div>
                ))}
            </div>
        </div>
    );
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

    const updateKeyNav = (i: number, patch: Partial<KeyNavItem>) => {
        const next = [...data.key_navigation];
        next[i] = { ...next[i], ...patch };
        setData({ ...data, key_navigation: next });
    };

    const addKeyNav = () => {
        setData({
            ...data,
            key_navigation: [
                ...data.key_navigation,
                {
                    icon: "/icon-tour.png",
                    alt: "",
                    href: "/",
                    label: "New link",
                    nav_class: "nav-link1",
                },
            ],
        });
    };

    const removeKeyNav = (i: number) => {
        setData({
            ...data,
            key_navigation: data.key_navigation.filter((_, j) => j !== i),
        });
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
            updateFranchisePhoto(index, { src: filePath });
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

    const uploadFranchiseVideoPoster = async (index: number, file: File) => {
        setError(null);
        setMessage(null);
        setUploadingSpotlight(index);
        try {
            if (file.size > MAX_UPLOAD_BYTES) {
                throw new Error(`File is too large (${formatMb(file.size)}). Max allowed is ${formatMb(MAX_UPLOAD_BYTES)}.`);
            }
            const formData = new FormData();
            formData.append("title", `Home franchise video poster ${index + 1}`);
            formData.append("category", "Banner");
            formData.append("media_type", "image");
            formData.append("file", file);

            const created = (await authFetch("/media/", { method: "POST", body: formData })) as { file?: string };
            const filePath = created?.file;
            if (!filePath || typeof filePath !== "string") {
                throw new Error("Upload succeeded but server did not return a file path.");
            }
            updateFranchiseVideo(index, { poster: filePath });
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
            formData.append("title", `Homepage program: ${programName}`);
            formData.append("category", "Banner");
            formData.append("media_type", "image");
            formData.append("file", file);

            const created = (await authFetch("/media/", { method: "POST", body: formData })) as any;
            const filePath = created?.file;
            if (!filePath || typeof filePath !== "string") {
                throw new Error("Upload succeeded but server did not return a file path.");
            }

            const next = [...data.programs_preview.programs];
            next[programIndex] = { ...next[programIndex], image: filePath };
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
            formData.append("title", `Homepage Why Choose Us: ${title}`);
            formData.append("category", "Banner");
            formData.append("media_type", "image");
            formData.append("file", file);

            const created = (await authFetch("/media/", { method: "POST", body: formData })) as any;
            const filePath = created?.file;
            if (!filePath || typeof filePath !== "string") {
                throw new Error("Upload succeeded but server did not return a file path.");
            }

            const next = [...data.why_choose_us.features];
            next[featureIndex] = { ...next[featureIndex], image: filePath };
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
                    Edit the sections below. Each section shows a <strong>Preview</strong> first, and the edit fields are below it. Use{" "}
                    <strong>Save</strong> when finished.
                </p>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading…</p>
            ) : (
                <div className="grid gap-6 max-w-6xl">
                    <div className="space-y-4 min-w-0">
                    <div id="key-nav" className="scroll-mt-24" />
                    <Section title="1. Key navigation (icons under the hero)">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            <strong>Where it shows:</strong> Home page → directly under the main hero banner.
                        </div>
                        <MiniPreviewKeyNav items={data.key_navigation} />
                        <p className="text-xs text-slate-500">
                            Icons use the site’s bundled images; edit link URL, text, alt text, and “open in new tab” below.
                        </p>
                        {data.key_navigation.map((row, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 space-y-2 bg-slate-50/80">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-700">Link {i + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeKeyNav(i)}
                                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                                        aria-label="Remove"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid gap-2">
                                    <div>
                                        <label className={labelClass}>Alt text (accessibility)</label>
                                        <input className={inputClass} value={row.alt} onChange={(e) => updateKeyNav(i, { alt: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            {isVirtualTourNavItem(row) ? "Virtual tour iframe URL" : "Link URL"}
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={row.href}
                                            onChange={(e) => updateKeyNav(i, { href: e.target.value })}
                                            placeholder={
                                                isVirtualTourNavItem(row)
                                                    ? "https://iframe.mediadelivery.net/embed/…"
                                                    : undefined
                                            }
                                        />
                                        {isVirtualTourNavItem(row) ? (
                                            <p className="mt-1 text-xs text-amber-900/90">
                                                Paste the <strong>embed URL</strong> from your server (or full{" "}
                                                <code className="rounded bg-amber-50 px-1">&lt;iframe src=&quot;…&quot;&gt;</code>
                                                ). Opens in the Virtual Tour popup on the homepage. Also check Django admin{" "}
                                                <strong>Marketing assets</strong> → slug <code className="rounded bg-amber-50 px-1">virtual-tour</code>{" "}
                                                if you set the link there instead.
                                            </p>
                                        ) : null}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Link text (use Enter for a new line)</label>
                                        <textarea
                                            className={`${inputClass} min-h-[60px]`}
                                            value={row.label}
                                            onChange={(e) => updateKeyNav(i, { label: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-end pb-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!row.external}
                                                onChange={(e) => updateKeyNav(i, { external: e.target.checked })}
                                            />
                                            Open in new tab (for PDFs / external sites)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addKeyNav} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add navigation item
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
                            <strong>On the homepage:</strong> Lower oval carousel (NEP, brochure, promos).
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
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">
                            <label className={labelClass}>News box — when no updates</label>
                            <input className={inputClass} value={data.updates_empty_message ?? ""} onChange={(e) => setData({ ...data, updates_empty_message: e.target.value })} />
                            <p className="text-xs text-slate-500">Live news: <Link href="/dashboard/admin/updates" className="text-orange-600 underline">Admin → Updates</Link></p>
                        </div>
                    </Section>

                    <div id="why" className="scroll-mt-24" />
                    <Section title='4. Why Choose Us (cards with photos)'>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            <strong>Where it shows:</strong> Home page → “Why Choose T.I.M.E. Kids?” cards section.
                        </div>
                        <MiniPreviewWhy why={data.why_choose_us} />
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

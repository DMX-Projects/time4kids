"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { LayoutList, Plus, Trash2, Upload } from "lucide-react";
import { DEFAULT_PROGRAMS_PAGE_DATA, mergeProgramsPageData, type ProgramsPageData, type ProgramsPageProgram } from "@/config/programs-page-defaults";

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";
const labelClass = "block text-xs font-medium text-slate-600 mb-1";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

function formatMb(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
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

function ImgThumb({ src, alt }: { src: string; alt: string }) {
    const [ok, setOk] = useState(true);
    const trimmed = (src || "").trim();
    if (!trimmed || !ok) return null;
    return (
        <div className="h-12 w-12 rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
            <img src={trimmed} alt={alt} className="h-full w-full object-cover" onError={() => setOk(false)} />
        </div>
    );
}

function MiniPreviewProgram({ p }: { p: ProgramsPageProgram }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-slate-700 mb-2">Preview</div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex gap-3 items-start">
                <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-white overflow-hidden shrink-0">
                    <img src={(p.image || "").trim()} alt={p.name || "Program"} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{p.name || "—"}</div>
                    <div className="text-xs text-slate-600">{[p.ageGroup, p.duration].filter(Boolean).join(" • ") || "—"}</div>
                    <div className="text-xs text-slate-700 mt-2 line-clamp-3 whitespace-pre-wrap">{p.description || "—"}</div>
                </div>
            </div>
        </div>
    );
}

export default function AdminProgramsContentPage() {
    const { authFetch } = useAuth();
    const [data, setData] = useState<ProgramsPageData>(DEFAULT_PROGRAMS_PAGE_DATA);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [uploadInfo, setUploadInfo] = useState<Record<number, string>>({});

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const raw = await authFetch<ProgramsPageData>("/common/page-content/programs/");
            setData(mergeProgramsPageData(raw));
        } catch (e: unknown) {
            setData(DEFAULT_PROGRAMS_PAGE_DATA);
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
            await authFetch("/common/page-content/programs/", {
                method: "PUT",
                headers: jsonHeaders(),
                body: JSON.stringify(data),
            });
            setMessage("Saved. Refresh /programs to see changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const programs = useMemo(() => (Array.isArray(data.programs) ? data.programs : []), [data.programs]);

    const updateProgram = (i: number, patch: Partial<ProgramsPageProgram>) => {
        const next = [...programs];
        next[i] = { ...next[i], ...patch };
        setData({ ...data, programs: next });
    };

    const addProgram = () => {
        setData({
            ...data,
            programs: [
                ...programs,
                {
                    image: "/1.png",
                    name: "New Program",
                    ageGroup: "",
                    duration: "",
                    description: "",
                    features: ["Feature 1"],
                },
            ],
        });
    };

    const removeProgram = (i: number) => {
        setData({ ...data, programs: programs.filter((_, j) => j !== i) });
    };

    const uploadProgramImage = async (i: number, file: File) => {
        setError(null);
        setMessage(null);
        setUploadingIndex(i);
        try {
            if (file.size > MAX_UPLOAD_BYTES) {
                throw new Error(`File is too large (${formatMb(file.size)}). Max allowed is 5MB.`);
            }
            try {
                const dims0 = await getImageDimensions(file);
                setUploadInfo((prev) => ({ ...prev, [i]: `${file.name} • ${dims0.width}×${dims0.height}px • ${formatMb(file.size)}` }));
            } catch {
                setUploadInfo((prev) => ({ ...prev, [i]: `${file.name} • ${formatMb(file.size)}` }));
            }

            const title = programs[i]?.name || `Program ${i + 1}`;
            const formData = new FormData();
            formData.append("title", `Programs page: ${title}`);
            formData.append("category", "Banner");
            formData.append("media_type", "image");
            formData.append("file", file);

            const created = (await authFetch("/media/", { method: "POST", body: formData })) as any;
            const filePath = created?.file;
            if (!filePath || typeof filePath !== "string") {
                throw new Error("Upload succeeded but server did not return a file path.");
            }

            updateProgram(i, { image: filePath });
            setMessage("Image uploaded. Don’t forget to Save changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Upload failed");
        } finally {
            setUploadingIndex(null);
        }
    };

    return (
        <div className="pb-16 space-y-4 max-w-6xl">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                    <LayoutList className="w-7 h-7 text-orange-500" />
                    Programs page content
                </h1>
                <p className="text-sm text-slate-600">Edit the cards shown on the public <strong>/programs</strong> page. Use <strong>Save</strong> when finished.</p>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading…</p>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                            <div className="font-semibold text-slate-900">Hero text (top of page)</div>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Badge text</label>
                                    <input className={inputClass} value={data.hero.badge} onChange={(e) => setData({ ...data, hero: { ...data.hero, badge: e.target.value } })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Subtitle</label>
                                    <input className={inputClass} value={data.hero.subtitle} onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Title (first part)</label>
                                    <input className={inputClass} value={data.hero.title_prefix} onChange={(e) => setData({ ...data, hero: { ...data.hero, title_prefix: e.target.value } })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Title (accent word)</label>
                                    <input className={inputClass} value={data.hero.title_accent} onChange={(e) => setData({ ...data, hero: { ...data.hero, title_accent: e.target.value } })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Button label</label>
                                    <input className={inputClass} value={data.hero.cta_label} onChange={(e) => setData({ ...data, hero: { ...data.hero, cta_label: e.target.value } })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Button link</label>
                                    <input className={inputClass} value={data.hero.cta_href} onChange={(e) => setData({ ...data, hero: { ...data.hero, cta_href: e.target.value } })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {programs.map((p, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
                                <div className="font-semibold text-slate-900 truncate">Program card {i + 1}: {p.name || "—"}</div>
                                <button
                                    type="button"
                                    onClick={() => removeProgram(i)}
                                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                                    title="Delete this card"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                    <strong>Where it shows:</strong> Public site → <code className="bg-slate-100 px-1 rounded">/programs</code> page.
                                </div>

                                <MiniPreviewProgram p={p} />

                                <div className="grid md:grid-cols-2 gap-3">
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Image path</label>
                                        <div className="flex items-center gap-2">
                                            <input className={inputClass} value={p.image} onChange={(e) => updateProgram(i, { image: e.target.value })} />
                                            <label
                                                className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${
                                                    uploadingIndex === i ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                                }`}
                                                title="Upload and auto-fill image path"
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={uploadingIndex === i}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        e.target.value = "";
                                                        if (!file) return;
                                                        uploadProgramImage(i, file);
                                                    }}
                                                />
                                                <Upload className="w-4 h-4 mr-2" />
                                                {uploadingIndex === i ? "Uploading…" : "Upload"}
                                            </label>
                                            <ImgThumb src={p.image} alt={p.name || `Program ${i + 1}`} />
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
                                            {uploadInfo[i] ? <div className="text-slate-600">Selected: {uploadInfo[i]}</div> : null}
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Name</label>
                                        <input className={inputClass} value={p.name} onChange={(e) => updateProgram(i, { name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Age group</label>
                                        <input className={inputClass} value={p.ageGroup} onChange={(e) => updateProgram(i, { ageGroup: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Duration</label>
                                        <input className={inputClass} value={p.duration} onChange={(e) => updateProgram(i, { duration: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Description</label>
                                        <textarea className={`${inputClass} min-h-[88px]`} value={p.description} onChange={(e) => updateProgram(i, { description: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Features (one per line)</label>
                                        <textarea
                                            className={`${inputClass} min-h-[88px]`}
                                            value={(p.features || []).join("\n")}
                                            onChange={(e) => updateProgram(i, { features: e.target.value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button type="button" variant="outline" size="sm" onClick={addProgram} className="inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add program card
                    </Button>
                </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-700">{message}</p>}

            <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-slate-200">
                <Button size="sm" onClick={save} disabled={saving || loading}>
                    {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button size="sm" variant="outline" onClick={load} disabled={saving || loading}>
                    Reload from server
                </Button>
            </div>
        </div>
    );
}


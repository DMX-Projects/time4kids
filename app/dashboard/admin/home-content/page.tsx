"use client";

import React, { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { LayoutTemplate, Plus, Trash2, ChevronDown, Eye, ExternalLink } from "lucide-react";
import {
    DEFAULT_HOME_PAGE_DATA,
    mergeHomePageData,
    type HomePageData,
    type KeyNavItem,
} from "@/config/home-page-defaults";

const NAV_CLASS_OPTIONS = [
    { value: "nav-link1", label: "Orange bubble (Style 1)", swatch: "from-[#ECB248] to-[#DD6705]" },
    { value: "nav-link2", label: "Green bubble (Style 2)", swatch: "from-[#B0CD67] to-[#789F35]" },
    { value: "nav-link3", label: "Red bubble (Style 3)", swatch: "from-[#D36655] to-[#BD2B13]" },
];

const METH_CLASS_PRESETS = [
    { value: "nav-item1", label: "Orange tile (1)" },
    { value: "nav-item2", label: "Green tile (2)" },
    { value: "nav-item3", label: "Red tile (3)" },
    { value: "nav-item4", label: "Orange tile (4)" },
    { value: "nav-item5", label: "Green tile (5)" },
    { value: "nav-item6", label: "Red tile (6)" },
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

function formatMb(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function colorForMethodologyClass(cls: string): string {
    if (cls === "nav-item2" || cls === "nav-item5") return "#94b64f";
    if (cls === "nav-item3" || cls === "nav-item6") return "#c94a36";
    return "#e6952e";
}

function PreviewPanel({ data }: { data: HomePageData }) {
    const keyNav = data.key_navigation ?? [];
    const intro = data.intro;
    const why = data.why_choose_us;
    const programs = data.programs_preview?.programs ?? [];
    const meth = data.methodology;

    return (
        <aside className="hidden lg:block lg:sticky lg:top-20 h-[calc(100vh-6rem)] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <Eye className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-900 truncate">Live preview</span>
                </div>
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-orange-700 hover:text-orange-800 inline-flex items-center gap-1"
                    title="Open public home page in a new tab"
                >
                    Open site <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>

            <div className="p-4 space-y-5">
                <div>
                    <div className="text-xs font-semibold text-slate-700">Key navigation (under hero)</div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {keyNav.slice(0, 6).map((item, i) => {
                            const opt = NAV_CLASS_OPTIONS.find((o) => o.value === item.nav_class) ?? NAV_CLASS_OPTIONS[0];
                            return (
                                <div key={`${item.href}-${i}`} className="rounded-xl border border-slate-100 p-2 bg-slate-50">
                                    <div className={`h-10 rounded-xl bg-gradient-to-br ${opt.swatch}`} />
                                    <div className="mt-1 text-[11px] font-semibold text-slate-800 leading-snug line-clamp-2">
                                        {item.label || "—"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {keyNav.length > 6 && <div className="mt-2 text-[11px] text-slate-500">+ {keyNav.length - 6} more</div>}
                </div>

                <div>
                    <div className="text-xs font-semibold text-slate-700">Welcome / intro</div>
                    <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="text-sm font-semibold text-slate-900">{intro.title || "—"}</div>
                        <div className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{intro.subtitle || "—"}</div>
                        <div className="text-xs text-slate-700 mt-2 whitespace-pre-wrap">
                            {(intro.paragraphs?.[0] ?? "").trim() ? intro.paragraphs[0] : "—"}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="text-xs font-semibold text-slate-700">Why Choose Us (cards)</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">
                        {why.heading_prefix}
                        <span className="text-orange-600">{why.heading_accent}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {why.features.slice(0, 4).map((f, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-slate-100 p-2"
                                style={{ background: f.color || "#F8FAFC" }}
                            >
                                <div className="text-[11px] font-semibold text-slate-900 line-clamp-2">{f.title || "—"}</div>
                                <div className="text-[11px] text-slate-700 line-clamp-2 mt-0.5">{f.desc || "—"}</div>
                                <div className="mt-1 h-1.5 w-10 rounded-full" style={{ background: f.accent || "#111827" }} />
                            </div>
                        ))}
                    </div>
                    {why.features.length > 4 && <div className="mt-2 text-[11px] text-slate-500">+ {why.features.length - 4} more</div>}
                </div>

                <div>
                    <div className="text-xs font-semibold text-slate-700">Programs preview (circles)</div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {programs.slice(0, 4).map((p, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full" style={{ background: p.color || "#CBD5E1" }} />
                                    <div className="min-w-0">
                                        <div className="text-[11px] font-semibold text-slate-900 truncate">{p.programName || "—"}</div>
                                        <div className="text-[11px] text-slate-600 truncate">{p.ageGroup || ""}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {programs.length > 4 && <div className="mt-2 text-[11px] text-slate-500">+ {programs.length - 4} more</div>}
                </div>

                <div>
                    <div className="text-xs font-semibold text-slate-700">Methodology (icon row)</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{meth.title || "—"}</div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {(meth.items ?? []).slice(0, 6).map((it, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-slate-100 p-2 text-white"
                                style={{ background: colorForMethodologyClass(it.class) }}
                            >
                                <div className="text-[11px] font-semibold leading-snug line-clamp-2">{it.label || "—"}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
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

    const uploadProgramsPreviewImage = async (programIndex: number, file: File) => {
        setError(null);
        setMessage(null);
        setUploadingProgramIndex(programIndex);
        try {
            const dims0 = await getImageDimensions(file);
            setProgramUploadInfo((prev) => ({
                ...prev,
                [programIndex]: `${file.name} • ${dims0.width}×${dims0.height}px • ${formatMb(file.size)}`,
            }));
            if (file.size > MAX_UPLOAD_BYTES) {
                throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max allowed is 5MB.`);
            }
            const { width, height } = dims0;
            const min = 256;
            if (width < min || height < min) {
                throw new Error(`Image is too small (${width}×${height}). Please upload at least ${min}×${min}px (recommended 512×512).`);
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
            const dims0 = await getImageDimensions(file);
            setWhyUploadInfo((prev) => ({
                ...prev,
                [featureIndex]: `${file.name} • ${dims0.width}×${dims0.height}px • ${formatMb(file.size)}`,
            }));
            if (file.size > MAX_UPLOAD_BYTES) {
                throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max allowed is 5MB.`);
            }

            const { width, height } = dims0;
            const minW = 800;
            const minH = 600;
            if (width < minW || height < minH) {
                throw new Error(`Image is too small (${width}×${height}). Please upload at least ${minW}×${minH}px (recommended 1200×900).`);
            }

            // Card uses aspect-[4/3]. Accept near 4:3 to avoid awkward crop.
            const aspect = width / Math.max(1, height);
            const ideal = 4 / 3;
            const tol = 0.25; // allow some flexibility
            if (Math.abs(aspect - ideal) > tol) {
                throw new Error(`Image ratio should be close to 4:3 (e.g. 1200×900). Your image is ${width}×${height} (${aspect.toFixed(2)}:1).`);
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
                    Edit the sections below. Use <strong>Save</strong> when finished. On desktop, the right side shows a <strong>live preview</strong>{" "}
                    so it’s clear what you’re editing.
                </p>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading…</p>
            ) : (
                <div className="grid lg:grid-cols-[1fr_380px] gap-6 max-w-6xl">
                    <div className="space-y-4 min-w-0">
                    <Section title="1. Key navigation (icons under the hero)">
                        <p className="text-xs text-slate-500">
                            Image paths are under <code className="bg-slate-100 px-1 rounded">/public</code> (e.g.{" "}
                            <code className="bg-slate-100 px-1 rounded">/icon-tour.png</code>).
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
                                <div className="grid sm:grid-cols-2 gap-2">
                                    <div>
                                        <label className={labelClass}>Icon image path</label>
                                        <input className={inputClass} value={row.icon} onChange={(e) => updateKeyNav(i, { icon: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Alt text (accessibility)</label>
                                        <input className={inputClass} value={row.alt} onChange={(e) => updateKeyNav(i, { alt: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Link URL</label>
                                        <input className={inputClass} value={row.href} onChange={(e) => updateKeyNav(i, { href: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Link text (use Enter for a new line)</label>
                                        <textarea
                                            className={`${inputClass} min-h-[60px]`}
                                            value={row.label}
                                            onChange={(e) => updateKeyNav(i, { label: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Visual style</label>
                                        <select
                                            className={inputClass}
                                            value={row.nav_class}
                                            onChange={(e) => updateKeyNav(i, { nav_class: e.target.value })}
                                        >
                                            {NAV_CLASS_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[11px] text-slate-500">Looks like</span>
                                            <span
                                                className={`inline-block h-3 w-10 rounded-full bg-gradient-to-r ${
                                                    (NAV_CLASS_OPTIONS.find((o) => o.value === row.nav_class) ?? NAV_CLASS_OPTIONS[0]).swatch
                                                }`}
                                            />
                                        </div>
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

                    <Section title="2. Welcome / intro (heading and paragraphs)">
                        <div>
                            <label className={labelClass}>Main heading</label>
                            <input
                                className={inputClass}
                                value={data.intro.title}
                                onChange={(e) => setData({ ...data, intro: { ...data.intro, title: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Subheading</label>
                            <textarea
                                className={`${inputClass} min-h-[72px]`}
                                value={data.intro.subtitle}
                                onChange={(e) => setData({ ...data, intro: { ...data.intro, subtitle: e.target.value } })}
                            />
                        </div>
                        <p className="text-xs font-medium text-slate-600">Paragraphs</p>
                        {data.intro.paragraphs.map((p, i) => (
                            <div key={i} className="flex gap-2 items-start">
                                <textarea
                                    className={`${inputClass} flex-1 min-h-[80px]`}
                                    value={p}
                                    onChange={(e) => {
                                        const next = [...data.intro.paragraphs];
                                        next[i] = e.target.value;
                                        setData({ ...data, intro: { ...data.intro, paragraphs: next } });
                                    }}
                                />
                                <button
                                    type="button"
                                    className="mt-2 text-red-600 p-1"
                                    onClick={() =>
                                        setData({
                                            ...data,
                                            intro: {
                                                ...data.intro,
                                                paragraphs: data.intro.paragraphs.filter((_, j) => j !== i),
                                            },
                                        })
                                    }
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setData({
                                    ...data,
                                    intro: { ...data.intro, paragraphs: [...data.intro.paragraphs, ""] },
                                })
                            }
                        >
                            <Plus className="w-4 h-4 inline mr-1" /> Add paragraph
                        </Button>
                    </Section>

                    <Section title='3. Why Choose Us (cards with photos)'>
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
                                        </div>
                                        <div className="mt-1 text-[11px] text-slate-500 space-y-1">
                                            <div>
                                                Requirements: max <strong>5MB</strong>, minimum <strong>800×600</strong>, best is <strong>1200×900 (4:3)</strong>.
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
                                    <div>
                                        <label className={labelClass}>Card background colour (hex)</label>
                                        <input
                                            className={inputClass}
                                            value={f.color}
                                            onChange={(e) => {
                                                const next = [...data.why_choose_us.features];
                                                next[i] = { ...next[i], color: e.target.value };
                                                setData({ ...data, why_choose_us: { ...data.why_choose_us, features: next } });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Accent colour (hex)</label>
                                        <input
                                            className={inputClass}
                                            value={f.accent}
                                            onChange={(e) => {
                                                const next = [...data.why_choose_us.features];
                                                next[i] = { ...next[i], accent: e.target.value };
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
                                                image: "/infra.jpg",
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

                    <Section title="4. Programs preview (circles on the home page)">
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
                                        </div>
                                        <div className="mt-1 text-[11px] text-slate-500 space-y-1">
                                            <div>
                                                Upload a square image (recommended <strong>512×512</strong>, minimum <strong>256×256</strong>). Use “Image crop” below if the face is not centered.
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

                    <Section title="5. Value based methodology (icon row)">
                        <div>
                            <label className={labelClass}>Section title</label>
                            <input
                                className={inputClass}
                                value={data.methodology.title}
                                onChange={(e) => setData({ ...data, methodology: { ...data.methodology, title: e.target.value } })}
                            />
                        </div>
                        {data.methodology.items.map((item, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 grid sm:grid-cols-2 gap-2 bg-slate-50/80">
                                <div className="sm:col-span-2 flex justify-between items-center">
                                    <span className="text-sm font-medium">Item {i + 1}</span>
                                    <button
                                        type="button"
                                        className="text-red-600 p-1"
                                        onClick={() =>
                                            setData({
                                                ...data,
                                                methodology: {
                                                    ...data.methodology,
                                                    items: data.methodology.items.filter((_, j) => j !== i),
                                                },
                                            })
                                        }
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <label className={labelClass}>Icon path</label>
                                    <input
                                        className={inputClass}
                                        value={item.icon}
                                        onChange={(e) => {
                                            const next = [...data.methodology.items];
                                            next[i] = { ...next[i], icon: e.target.value };
                                            setData({ ...data, methodology: { ...data.methodology, items: next } });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Label</label>
                                    <input
                                        className={inputClass}
                                        value={item.label}
                                        onChange={(e) => {
                                            const next = [...data.methodology.items];
                                            next[i] = { ...next[i], label: e.target.value };
                                            setData({ ...data, methodology: { ...data.methodology, items: next } });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Link</label>
                                    <input
                                        className={inputClass}
                                        value={item.href}
                                        onChange={(e) => {
                                            const next = [...data.methodology.items];
                                            next[i] = { ...next[i], href: e.target.value };
                                            setData({ ...data, methodology: { ...data.methodology, items: next } });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Shape style</label>
                                    <select
                                        className={inputClass}
                                        value={item.class}
                                        onChange={(e) => {
                                            const next = [...data.methodology.items];
                                            next[i] = { ...next[i], class: e.target.value };
                                            setData({ ...data, methodology: { ...data.methodology, items: next } });
                                        }}
                                    >
                                        {METH_CLASS_PRESETS.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
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
                                    methodology: {
                                        ...data.methodology,
                                        items: [
                                            ...data.methodology.items,
                                            {
                                                icon: "/methodology-icon1.png",
                                                label: "New item",
                                                class: "nav-item1",
                                                href: "/programs",
                                            },
                                        ],
                                    },
                                })
                            }
                        >
                            <Plus className="w-4 h-4 inline mr-1" /> Add item
                        </Button>
                    </Section>
                    </div>

                    <PreviewPanel data={data} />
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

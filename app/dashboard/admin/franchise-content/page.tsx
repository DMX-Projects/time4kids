"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { Building2, Plus, Trash2, Upload } from "lucide-react";
import {
    DEFAULT_FRANCHISE_PAGE_DATA,
    mergeFranchisePageData,
    type FranchiseBenefit,
    type FranchisePageData,
    type FranchiseTestimonial,
} from "@/config/franchise-page-defaults";

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";
const labelClass = "block text-xs font-medium text-slate-600 mb-1";
const MAX_VIDEO_BYTES = 20 * 1024 * 1024; // 20MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

function formatMb(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function CardPreview({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shrink-0">
                    {String(icon || "A").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{title || "—"}</div>
                    <div className="text-xs text-slate-600 mt-1 line-clamp-2">{description || "—"}</div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="font-semibold text-slate-900">{title}</div>
            </div>
            <div className="p-4 space-y-3">{children}</div>
        </div>
    );
}

export default function AdminFranchiseContentPage() {
    const { authFetch } = useAuth();
    const [data, setData] = useState<FranchisePageData>(DEFAULT_FRANCHISE_PAGE_DATA);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [uploadingKey, setUploadingKey] = useState<string | null>(null);
    const [uploadInfo, setUploadInfo] = useState<Record<string, string>>({});

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const raw = await authFetch<FranchisePageData>("/common/page-content/franchise-opportunity/");
            setData(mergeFranchisePageData(raw));
        } catch (e: unknown) {
            setData(DEFAULT_FRANCHISE_PAGE_DATA);
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
            await authFetch("/common/page-content/franchise-opportunity/", {
                method: "PUT",
                headers: jsonHeaders(),
                body: JSON.stringify(data),
            });
            setMessage("Saved. Refresh /franchise to see changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const benefits = useMemo(() => (Array.isArray(data.benefits) ? data.benefits : []), [data.benefits]);
    const testimonials = useMemo(() => (Array.isArray(data.testimonials) ? data.testimonials : []), [data.testimonials]);

    const updateBenefit = (i: number, patch: Partial<FranchiseBenefit>) => {
        const next = [...benefits];
        next[i] = { ...next[i], ...patch };
        setData({ ...data, benefits: next });
    };
    const addBenefit = () => {
        setData({
            ...data,
            benefits: [...benefits, { icon: "Award", title: "New benefit", description: "Description" }],
        });
    };
    const removeBenefit = (i: number) => setData({ ...data, benefits: benefits.filter((_, j) => j !== i) });

    const updateOfferingText = (i: number, text: string) => {
        const base = Array.isArray(data.offerings) ? data.offerings : [];
        const next = [...base];
        next[i] = text;
        setData({ ...data, offerings: next });
    };
    const addOffering = () => {
        const base = Array.isArray(data.offerings) ? data.offerings : [];
        setData({ ...data, offerings: [...base, "New offering"] });
    };
    const removeOffering = (i: number) => {
        const base = Array.isArray(data.offerings) ? data.offerings : [];
        setData({ ...data, offerings: base.filter((_, j) => j !== i) });
    };

    const updateTestimonial = (i: number, patch: Partial<FranchiseTestimonial>) => {
        const next = [...testimonials];
        next[i] = { ...next[i], ...patch };
        setData({ ...data, testimonials: next });
    };
    const addTestimonial = () => {
        setData({
            ...data,
            testimonials: [...testimonials, { title: "New story", author: "Franchise Partner", location: "City", video_url: "", thumbnail_url: "" }],
        });
    };
    const removeTestimonial = (i: number) => setData({ ...data, testimonials: testimonials.filter((_, j) => j !== i) });

    const uploadMedia = async (key: string, opts: { title: string; media_type: "image" | "video"; file: File }) => {
        setError(null);
        setMessage(null);
        setUploadingKey(key);
        try {
            const max = opts.media_type === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
            if (opts.file.size > max) {
                throw new Error(`File is too large (${formatMb(opts.file.size)}). Max allowed is ${opts.media_type === "video" ? "20MB" : "5MB"}.`);
            }
            setUploadInfo((prev) => ({ ...prev, [key]: `${opts.file.name} • ${formatMb(opts.file.size)}` }));

            const formData = new FormData();
            formData.append("title", opts.title);
            formData.append("category", "Banner");
            formData.append("media_type", opts.media_type);
            formData.append("file", opts.file);

            const created = (await authFetch("/media/", { method: "POST", body: formData })) as any;
            const filePath = created?.file;
            if (!filePath || typeof filePath !== "string") {
                throw new Error("Upload succeeded but server did not return a file path.");
            }
            return filePath as string;
        } finally {
            setUploadingKey(null);
        }
    };

    return (
        <div className="pb-16 space-y-4 max-w-6xl">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-7 h-7 text-orange-500" />
                    Franchise page content
                </h1>
                <p className="text-sm text-slate-600">
                    Edit the public <strong>/franchise</strong> page sections. Use <strong>Save</strong> when finished.
                </p>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading…</p>
            ) : (
                <div className="space-y-4">
                    <Section title="1. Hero (top heading)">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Title (first word)</label>
                                <input
                                    className={inputClass}
                                    value={data.hero.title_prefix}
                                    onChange={(e) => setData({ ...data, hero: { ...data.hero, title_prefix: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Title (second word)</label>
                                <input
                                    className={inputClass}
                                    value={data.hero.title_accent}
                                    onChange={(e) => setData({ ...data, hero: { ...data.hero, title_accent: e.target.value } })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Subtitle</label>
                                <input
                                    className={inputClass}
                                    value={data.hero.subtitle}
                                    onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Intro paragraph 1 (below subtitle)</label>
                                <textarea
                                    className={`${inputClass} min-h-[80px]`}
                                    value={data.hero.intro_paragraphs?.[0] ?? ""}
                                    onChange={(e) => {
                                        const second = data.hero.intro_paragraphs?.[1] ?? "";
                                        setData({
                                            ...data,
                                            hero: { ...data.hero, intro_paragraphs: [e.target.value, second] },
                                        });
                                    }}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Intro paragraph 2</label>
                                <textarea
                                    className={`${inputClass} min-h-[80px]`}
                                    value={data.hero.intro_paragraphs?.[1] ?? ""}
                                    onChange={(e) => {
                                        const first = data.hero.intro_paragraphs?.[0] ?? "";
                                        setData({
                                            ...data,
                                            hero: { ...data.hero, intro_paragraphs: [first, e.target.value] },
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </Section>

                    <Section title="1b. Benefits section heading">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Heading (first part)</label>
                                <input
                                    className={inputClass}
                                    value={data.benefits_section?.heading_prefix ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            benefits_section: { ...data.benefits_section, heading_prefix: e.target.value, heading_accent: data.benefits_section?.heading_accent ?? "" },
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Heading (accent part)</label>
                                <input
                                    className={inputClass}
                                    value={data.benefits_section?.heading_accent ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            benefits_section: {
                                                ...data.benefits_section,
                                                heading_prefix: data.benefits_section?.heading_prefix ?? "",
                                                heading_accent: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Blurb under heading (optional)</label>
                                <input
                                    className={inputClass}
                                    value={data.benefits_section?.blurb ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            benefits_section: {
                                                heading_prefix: data.benefits_section?.heading_prefix ?? "",
                                                heading_accent: data.benefits_section?.heading_accent ?? "",
                                                blurb: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </Section>

                    <Section title="2. Benefits (cards)">
                        {benefits.map((b, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 bg-slate-50/80 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-800 truncate">
                                        {b.title?.trim() ? b.title : `Benefit card ${i + 1}`}
                                        <span className="ml-2 text-xs font-normal text-slate-500">({b.icon || "Icon"})</span>
                                    </div>
                                    <button type="button" className="text-red-600 hover:bg-red-50 p-1 rounded" onClick={() => removeBenefit(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <CardPreview icon={b.icon} title={b.title} description={b.description} />
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Icon name (Award, DollarSign, BookOpen, Users, Headphones, TrendingUp, Heart, Brain, Globe, …)</label>
                                        <input className={inputClass} value={b.icon} onChange={(e) => updateBenefit(i, { icon: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Title</label>
                                        <input className={inputClass} value={b.title} onChange={(e) => updateBenefit(i, { title: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Description</label>
                                        <textarea className={`${inputClass} min-h-[72px]`} value={b.description} onChange={(e) => updateBenefit(i, { description: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addBenefit} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add benefit card
                        </Button>
                    </Section>

                    <Section title="2b. Offerings section heading">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Heading (first part)</label>
                                <input
                                    className={inputClass}
                                    value={data.offerings_section?.heading_prefix ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            offerings_section: {
                                                ...data.offerings_section,
                                                heading_prefix: e.target.value,
                                                heading_accent: data.offerings_section?.heading_accent ?? "",
                                            },
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Heading (accent part)</label>
                                <input
                                    className={inputClass}
                                    value={data.offerings_section?.heading_accent ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            offerings_section: {
                                                ...data.offerings_section,
                                                heading_prefix: data.offerings_section?.heading_prefix ?? "",
                                                heading_accent: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Intro above checklist (optional)</label>
                                <textarea
                                    className={`${inputClass} min-h-[72px]`}
                                    value={data.offerings_section?.intro ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            offerings_section: {
                                                heading_prefix: data.offerings_section?.heading_prefix ?? "",
                                                heading_accent: data.offerings_section?.heading_accent ?? "",
                                                intro: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </Section>

                    <Section title="3. What we offer (list)">
                        {(Array.isArray(data.offerings) ? data.offerings : []).map((t, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 bg-slate-50/80 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-800">Item {i + 1}</div>
                                    <button type="button" className="text-red-600 hover:bg-red-50 p-1 rounded" onClick={() => removeOffering(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <label className={labelClass}>Text</label>
                                    <input className={inputClass} value={t} onChange={(e) => updateOfferingText(i, e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addOffering} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add offering
                        </Button>
                    </Section>

                    <Section title="4. Success stories (3 cards)">
                        {testimonials.map((t, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 bg-slate-50/80 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-800 truncate">{t.title?.trim() ? t.title : `Success story ${i + 1}`}</div>
                                    <button type="button" className="text-red-600 hover:bg-red-50 p-1 rounded" onClick={() => removeTestimonial(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Video URL (mp4 link)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                className={inputClass}
                                                value={t.video_url ?? ""}
                                                onChange={(e) => updateTestimonial(i, { video_url: e.target.value })}
                                            />
                                            <label
                                                className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${
                                                    uploadingKey === `t${i}-video` ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                                }`}
                                                title="Upload video and auto-fill URL"
                                            >
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    disabled={uploadingKey === `t${i}-video`}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        e.target.value = "";
                                                        if (!file) return;
                                                        try {
                                                            const url = await uploadMedia(`t${i}-video`, { title: `Franchise success story: ${t.title || `Story ${i + 1}`}`, media_type: "video", file });
                                                            updateTestimonial(i, { video_url: url });
                                                            setMessage("Video uploaded. Don’t forget to Save changes.");
                                                        } catch (err: any) {
                                                            setError(err?.message || "Video upload failed");
                                                        }
                                                    }}
                                                />
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload
                                            </label>
                                        </div>
                                        <div className="mt-1 text-[11px] text-slate-500 space-y-1">
                                            <div>Video requirement: max <strong>20MB</strong>.</div>
                                            {uploadInfo[`t${i}-video`] ? <div className="text-slate-600">Selected: {uploadInfo[`t${i}-video`]}</div> : null}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Thumbnail image URL (optional)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                className={inputClass}
                                                value={t.thumbnail_url ?? ""}
                                                onChange={(e) => updateTestimonial(i, { thumbnail_url: e.target.value })}
                                            />
                                            <label
                                                className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${
                                                    uploadingKey === `t${i}-thumb` ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                                }`}
                                                title="Upload thumbnail and auto-fill URL"
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={uploadingKey === `t${i}-thumb`}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        e.target.value = "";
                                                        if (!file) return;
                                                        try {
                                                            const url = await uploadMedia(`t${i}-thumb`, { title: `Franchise story thumbnail: ${t.title || `Story ${i + 1}`}`, media_type: "image", file });
                                                            updateTestimonial(i, { thumbnail_url: url });
                                                            setMessage("Thumbnail uploaded. Don’t forget to Save changes.");
                                                        } catch (err: any) {
                                                            setError(err?.message || "Thumbnail upload failed");
                                                        }
                                                    }}
                                                />
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload
                                            </label>
                                        </div>
                                        <div className="mt-1 text-[11px] text-slate-500 space-y-1">
                                            <div>Thumbnail requirement: max <strong>5MB</strong>.</div>
                                            {uploadInfo[`t${i}-thumb`] ? <div className="text-slate-600">Selected: {uploadInfo[`t${i}-thumb`]}</div> : null}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Title</label>
                                        <input className={inputClass} value={t.title} onChange={(e) => updateTestimonial(i, { title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Author</label>
                                        <input className={inputClass} value={t.author} onChange={(e) => updateTestimonial(i, { author: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Location</label>
                                        <input className={inputClass} value={t.location} onChange={(e) => updateTestimonial(i, { location: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addTestimonial} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add story
                        </Button>
                    </Section>

                    <Section title="5. Main branch (map + contact)">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Heading prefix</label>
                                <input className={inputClass} value={data.main_branch.heading_prefix} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, heading_prefix: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Heading accent</label>
                                <input className={inputClass} value={data.main_branch.heading_accent} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, heading_accent: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Subtitle</label>
                                <input className={inputClass} value={data.main_branch.subtitle} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, subtitle: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Google map embed URL</label>
                                <input className={inputClass} value={data.main_branch.map_embed_url} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, map_embed_url: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Office title</label>
                                <input className={inputClass} value={data.main_branch.office_title} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, office_title: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Address (HTML allowed, use &lt;br /&gt; for new lines)</label>
                                <textarea className={`${inputClass} min-h-[96px]`} value={data.main_branch.address_html} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, address_html: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Phone</label>
                                <input className={inputClass} value={data.main_branch.phone} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, phone: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Fax</label>
                                <input className={inputClass} value={data.main_branch.fax} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, fax: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input className={inputClass} value={data.main_branch.email} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, email: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Franchise email</label>
                                <input className={inputClass} value={data.main_branch.franchise_email} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, franchise_email: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Cell</label>
                                <input className={inputClass} value={data.main_branch.cell} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, cell: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Directions URL</label>
                                <input className={inputClass} value={data.main_branch.directions_url} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, directions_url: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Directions button label</label>
                                <input className={inputClass} value={data.main_branch.directions_label} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, directions_label: e.target.value } })} />
                            </div>
                        </div>
                    </Section>

                    <Section title="6. Brochure (bottom section)">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Heading</label>
                                <input className={inputClass} value={data.brochure.heading} onChange={(e) => setData({ ...data, brochure: { ...data.brochure, heading: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Subtitle</label>
                                <input className={inputClass} value={data.brochure.subtitle} onChange={(e) => setData({ ...data, brochure: { ...data.brochure, subtitle: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Button label</label>
                                <input className={inputClass} value={data.brochure.button_label} onChange={(e) => setData({ ...data, brochure: { ...data.brochure, button_label: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Fallback PDF URL</label>
                                <input className={inputClass} value={data.brochure.fallback_url} onChange={(e) => setData({ ...data, brochure: { ...data.brochure, fallback_url: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Marketing asset slug (optional)</label>
                                <input
                                    className={inputClass}
                                    value={data.brochure.marketing_asset_slug}
                                    onChange={(e) => setData({ ...data, brochure: { ...data.brochure, marketing_asset_slug: e.target.value } })}
                                />
                                <p className="mt-1 text-[11px] text-slate-500">
                                    If a Marketing Asset with this slug exists, its file/title will be used for the button.
                                </p>
                            </div>
                        </div>
                    </Section>
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


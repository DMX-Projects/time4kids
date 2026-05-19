"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { GraduationCap, Plus, Trash2, Upload } from "lucide-react";
import { DEFAULT_ADMISSION_PAGE_DATA, mergeAdmissionPageData, type AdmissionFaq, type AdmissionPageData, type AdmissionSkill, type AdmissionVideoCard } from "@/config/admission-page-defaults";
import { MarketingBrochureUploader } from "@/components/admin/MarketingBrochureUploader";
import { ADMISSION_BROCHURE_PDF_URL } from "@/config/site-public";

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";
const labelClass = "block text-xs font-medium text-slate-600 mb-1";
const MAX_VIDEO_BYTES = 20 * 1024 * 1024; // 20MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

function formatMb(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
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

export default function AdminAdmissionContentPage() {
    const { authFetch } = useAuth();
    const [data, setData] = useState<AdmissionPageData>(DEFAULT_ADMISSION_PAGE_DATA);
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
            const raw = await authFetch<AdmissionPageData>("/common/page-content/admission/");
            setData(mergeAdmissionPageData(raw));
        } catch (e: unknown) {
            setData(DEFAULT_ADMISSION_PAGE_DATA);
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
            await authFetch("/common/page-content/admission/", {
                method: "PUT",
                headers: jsonHeaders(),
                body: JSON.stringify(data),
            });
            setMessage("Saved. Refresh /admission to see changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const whyPreschool = useMemo(() => (Array.isArray(data.why_preschool) ? data.why_preschool : []), [data.why_preschool]);
    const whyTimeKids = useMemo(() => (Array.isArray(data.why_time_kids) ? data.why_time_kids : []), [data.why_time_kids]);
    const skills = useMemo(() => (Array.isArray(data.skills) ? data.skills : []), [data.skills]);
    const faqs = useMemo(() => (Array.isArray(data.faqs) ? data.faqs : []), [data.faqs]);
    const happyParents = useMemo(() => (Array.isArray((data as any).happy_parents_videos) ? (data as any).happy_parents_videos : []), [data]);
    const faqSection = (data as any).faq_section || DEFAULT_ADMISSION_PAGE_DATA.faq_section;

    const updateWhyPreschool = (i: number, text: string) => {
        const next = [...whyPreschool];
        next[i] = text;
        setData({ ...data, why_preschool: next });
    };
    const addWhyPreschool = () => setData({ ...data, why_preschool: [...whyPreschool, "New point"] });
    const removeWhyPreschool = (i: number) => setData({ ...data, why_preschool: whyPreschool.filter((_, j) => j !== i) });

    const updateWhyTimeKids = (i: number, text: string) => {
        const next = [...whyTimeKids];
        next[i] = text;
        setData({ ...data, why_time_kids: next });
    };
    const addWhyTimeKids = () => setData({ ...data, why_time_kids: [...whyTimeKids, "New point"] });
    const removeWhyTimeKids = (i: number) => setData({ ...data, why_time_kids: whyTimeKids.filter((_, j) => j !== i) });

    const updateSkill = (i: number, patch: Partial<AdmissionSkill>) => {
        const next = [...skills];
        next[i] = { ...next[i], ...patch };
        setData({ ...data, skills: next });
    };
    const addSkill = () =>
        setData({
            ...data,
            skills: [...skills, { title: "New skill", desc: "", icon: "Star", color: "bg-orange-500" }],
        });
    const removeSkill = (i: number) => setData({ ...data, skills: skills.filter((_, j) => j !== i) });

    const updateFaq = (i: number, patch: Partial<AdmissionFaq>) => {
        const next = [...faqs];
        next[i] = { ...next[i], ...patch };
        setData({ ...data, faqs: next });
    };
    const addFaq = () => setData({ ...data, faqs: [...faqs, { question: "New question", answer: "Answer" }] });
    const removeFaq = (i: number) => setData({ ...data, faqs: faqs.filter((_, j) => j !== i) });

    const updateHappyParent = (i: number, patch: Partial<AdmissionVideoCard>) => {
        const next = [...happyParents];
        next[i] = { ...next[i], ...patch };
        setData({ ...data, happy_parents_videos: next as any });
    };
    const addHappyParent = () =>
        setData({
            ...data,
            happy_parents_videos: [
                ...happyParents,
                { title: "New video", author: "Centre", location: "", video_url: "", thumbnail_url: "" },
            ] as any,
        });
    const removeHappyParent = (i: number) =>
        setData({
            ...data,
            happy_parents_videos: happyParents.filter((_item: AdmissionVideoCard, j: number) => j !== i) as any,
        });

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
            if (!filePath || typeof filePath !== "string") throw new Error("Upload succeeded but server did not return a file path.");
            return filePath as string;
        } finally {
            setUploadingKey(null);
        }
    };

    return (
        <div className="pb-16 space-y-4 max-w-6xl">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-7 h-7 text-orange-500" />
                    Admission page content
                </h1>
                <p className="text-sm text-slate-600">
                    Edit CMS content on <strong>/admission</strong>. Use <strong>Save</strong> when finished.
                </p>
                <p className="text-xs text-slate-500 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    Not editable here (fixed in the page layout): top hero headline, enquiry form, infrastructure cards, and NEP block. Upload the admission brochure PDF below, or use{" "}
                    <strong>Brochures &amp; PDFs</strong> in the sidebar.
                </p>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading…</p>
            ) : (
                <div className="space-y-4">
                    <Section title="Admission brochure PDF">
                        <MarketingBrochureUploader
                            slug="admission-brochure"
                            defaultTitle="Admission Brochure"
                            fallbackUrl={ADMISSION_BROCHURE_PDF_URL}
                            description="Shown on /admission and the home page Admission Brochure download."
                            compact
                        />
                    </Section>

                    <Section title="1. Why Preschool? (list)">
                        {whyPreschool.map((t, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 bg-slate-50/80 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-800 truncate">{t?.trim() ? t : `Point ${i + 1}`}</div>
                                    <button type="button" className="text-red-600 hover:bg-red-50 p-1 rounded" onClick={() => removeWhyPreschool(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <label className={labelClass}>Text</label>
                                    <input className={inputClass} value={t} onChange={(e) => updateWhyPreschool(i, e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addWhyPreschool} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add point
                        </Button>
                    </Section>

                    <Section title="2. Why T.I.M.E. Kids? (list)">
                        {whyTimeKids.map((t, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 bg-slate-50/80 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-800 truncate">{t?.trim() ? t : `Point ${i + 1}`}</div>
                                    <button type="button" className="text-red-600 hover:bg-red-50 p-1 rounded" onClick={() => removeWhyTimeKids(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <label className={labelClass}>Text</label>
                                    <input className={inputClass} value={t} onChange={(e) => updateWhyTimeKids(i, e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addWhyTimeKids} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add point
                        </Button>
                    </Section>

                    <Section title="3. Skills we nurture (cards)">
                        {skills.map((s, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 bg-slate-50/80 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-800 truncate">{s.title?.trim() ? s.title : `Skill ${i + 1}`}</div>
                                    <button type="button" className="text-red-600 hover:bg-red-50 p-1 rounded" onClick={() => removeSkill(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Title</label>
                                        <input className={inputClass} value={s.title} onChange={(e) => updateSkill(i, { title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Short description</label>
                                        <input className={inputClass} value={s.desc} onChange={(e) => updateSkill(i, { desc: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Icon name (Brain, Heart, Users, Palette, Music, Dumbbell, BookOpen, Globe)</label>
                                        <input className={inputClass} value={s.icon} onChange={(e) => updateSkill(i, { icon: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addSkill} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add skill
                        </Button>
                    </Section>

                    <Section title="4. FAQs section (title + image + questions)">
                        <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/80 space-y-3">
                            <div className="text-sm font-semibold text-slate-800">“Got Questions?” box</div>
                            <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Title (first word)</label>
                                    <input
                                        className={inputClass}
                                        value={faqSection?.title_prefix ?? ""}
                                        onChange={(e) => setData({ ...data, faq_section: { ...faqSection, title_prefix: e.target.value } } as any)}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Title (highlight word)</label>
                                    <input
                                        className={inputClass}
                                        value={faqSection?.title_accent ?? ""}
                                        onChange={(e) => setData({ ...data, faq_section: { ...faqSection, title_accent: e.target.value } } as any)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Subtitle</label>
                                    <textarea
                                        className={`${inputClass} min-h-[72px]`}
                                        value={faqSection?.subtitle ?? ""}
                                        onChange={(e) => setData({ ...data, faq_section: { ...faqSection, subtitle: e.target.value } } as any)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Image path</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            className={inputClass}
                                            value={faqSection?.image ?? ""}
                                            onChange={(e) => setData({ ...data, faq_section: { ...faqSection, image: e.target.value } } as any)}
                                        />
                                        <label
                                            className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${
                                                uploadingKey === `faq-img`
                                                    ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                            }`}
                                            title="Upload image and auto-fill path"
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={uploadingKey === `faq-img`}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    e.target.value = "";
                                                    if (!file) return;
                                                    try {
                                                        const url = await uploadMedia(`faq-img`, { title: "Admission FAQ image", media_type: "image", file });
                                                        setData({ ...data, faq_section: { ...faqSection, image: url } } as any);
                                                        setMessage("Image uploaded. Don’t forget to Save changes.");
                                                    } catch (err: any) {
                                                        setError(err?.message || "Image upload failed");
                                                    }
                                                }}
                                            />
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload
                                        </label>
                                    </div>
                                    <div className="mt-1 text-[11px] text-slate-500 space-y-1">
                                        <div>Image requirement: max <strong>5MB</strong>.</div>
                                        {uploadInfo[`faq-img`] ? <div className="text-slate-600">Selected: {uploadInfo[`faq-img`]}</div> : null}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {faqs.map((f, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 bg-slate-50/80 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-800 truncate">{f.question?.trim() ? f.question : `FAQ ${i + 1}`}</div>
                                    <button type="button" className="text-red-600 hover:bg-red-50 p-1 rounded" onClick={() => removeFaq(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <label className={labelClass}>Question</label>
                                    <input className={inputClass} value={f.question} onChange={(e) => updateFaq(i, { question: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Answer</label>
                                    <textarea className={`${inputClass} min-h-[96px]`} value={f.answer} onChange={(e) => updateFaq(i, { answer: e.target.value })} />
                                </div>
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addFaq} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add FAQ
                        </Button>
                    </Section>

                    <Section title="5. Happy Parents (videos)">
                        {happyParents.map((v: any, i: number) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 bg-slate-50/80 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-800 truncate">{v.title?.trim() ? v.title : `Video ${i + 1}`}</div>
                                    <button type="button" className="text-red-600 hover:bg-red-50 p-1 rounded" onClick={() => removeHappyParent(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-3">
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Video URL (mp4 link)</label>
                                        <div className="flex items-center gap-2">
                                            <input className={inputClass} value={v.video_url ?? ""} onChange={(e) => updateHappyParent(i, { video_url: e.target.value })} />
                                            <label
                                                className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${
                                                    uploadingKey === `hp${i}-video`
                                                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                                }`}
                                                title="Upload video and auto-fill URL"
                                            >
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    disabled={uploadingKey === `hp${i}-video`}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        e.target.value = "";
                                                        if (!file) return;
                                                        try {
                                                            const url = await uploadMedia(`hp${i}-video`, { title: `Admission happy parent: ${v.title || `Video ${i + 1}`}`, media_type: "video", file });
                                                            updateHappyParent(i, { video_url: url });
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
                                            {uploadInfo[`hp${i}-video`] ? <div className="text-slate-600">Selected: {uploadInfo[`hp${i}-video`]}</div> : null}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Thumbnail image URL (optional)</label>
                                        <div className="flex items-center gap-2">
                                            <input className={inputClass} value={v.thumbnail_url ?? ""} onChange={(e) => updateHappyParent(i, { thumbnail_url: e.target.value })} />
                                            <label
                                                className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${
                                                    uploadingKey === `hp${i}-thumb`
                                                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                                }`}
                                                title="Upload thumbnail and auto-fill URL"
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={uploadingKey === `hp${i}-thumb`}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        e.target.value = "";
                                                        if (!file) return;
                                                        try {
                                                            const url = await uploadMedia(`hp${i}-thumb`, { title: `Admission happy parent thumbnail: ${v.title || `Video ${i + 1}`}`, media_type: "image", file });
                                                            updateHappyParent(i, { thumbnail_url: url });
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
                                            {uploadInfo[`hp${i}-thumb`] ? <div className="text-slate-600">Selected: {uploadInfo[`hp${i}-thumb`]}</div> : null}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Title</label>
                                        <input className={inputClass} value={v.title ?? ""} onChange={(e) => updateHappyParent(i, { title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Author / Centre</label>
                                        <input className={inputClass} value={v.author ?? ""} onChange={(e) => updateHappyParent(i, { author: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Location</label>
                                        <input className={inputClass} value={v.location ?? ""} onChange={(e) => updateHappyParent(i, { location: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addHappyParent} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add video
                        </Button>
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


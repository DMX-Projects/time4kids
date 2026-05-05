"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { HelpCircle, Plus, Trash2, Upload } from "lucide-react";
import { DEFAULT_FAQ_PAGE_DATA, mergeFaqPageData, type FaqItem, type FaqPageData } from "@/config/faq-page-defaults";

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";
const labelClass = "block text-xs font-medium text-slate-600 mb-1";

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

export default function AdminFaqContentPage() {
    const { authFetch } = useAuth();
    const [data, setData] = useState<FaqPageData>(DEFAULT_FAQ_PAGE_DATA);
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
            const raw = await authFetch<FaqPageData>("/common/page-content/faq/");
            setData(mergeFaqPageData(raw));
        } catch (e: unknown) {
            setData(DEFAULT_FAQ_PAGE_DATA);
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
            await authFetch("/common/page-content/faq/", {
                method: "PUT",
                headers: jsonHeaders(),
                body: JSON.stringify(data),
            });
            setMessage("Saved. Refresh /faq to see changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const faqs = useMemo(() => (Array.isArray(data.faqs) ? data.faqs : []), [data.faqs]);
    const banners = useMemo(() => (Array.isArray(data.banner_images) ? data.banner_images : []), [data.banner_images]);

    const updateBanner = (i: number, value: string) => {
        const next = [...banners];
        next[i] = value;
        setData({ ...data, banner_images: next });
    };
    const addBanner = () => setData({ ...data, banner_images: [...banners, "/faq-banner-new-1.png"] });
    const removeBanner = (i: number) => setData({ ...data, banner_images: banners.filter((_, j) => j !== i) });

    const updateFaq = (i: number, patch: Partial<FaqItem>) => {
        const next = [...faqs];
        next[i] = { ...next[i], ...patch };
        setData({ ...data, faqs: next });
    };
    const addFaq = () => setData({ ...data, faqs: [...faqs, { question: "New question", answer: ["Answer line 1"] }] });
    const removeFaq = (i: number) => setData({ ...data, faqs: faqs.filter((_, j) => j !== i) });

    const uploadImage = async (key: string, title: string, file: File) => {
        setError(null);
        setMessage(null);
        setUploadingKey(key);
        try {
            if (file.size > MAX_IMAGE_BYTES) throw new Error(`File is too large (${formatMb(file.size)}). Max allowed is 5MB.`);
            setUploadInfo((prev) => ({ ...prev, [key]: `${file.name} • ${formatMb(file.size)}` }));

            const formData = new FormData();
            formData.append("title", title);
            formData.append("category", "Banner");
            formData.append("media_type", "image");
            formData.append("file", file);

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
                    <HelpCircle className="w-7 h-7 text-orange-500" />
                    FAQ page content
                </h1>
                <p className="text-sm text-slate-600">
                    Edit the public <strong>/faq</strong> page banners and questions. Use <strong>Save</strong> when finished.
                </p>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading…</p>
            ) : (
                <div className="space-y-4">
                    <Section title="1. Banner images (top slideshow)">
                        {banners.map((src, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 bg-slate-50/80 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-800 truncate">{src?.trim() ? src : `Banner ${i + 1}`}</div>
                                    <button type="button" className="text-red-600 hover:bg-red-50 p-1 rounded" onClick={() => removeBanner(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input className={inputClass} value={src} onChange={(e) => updateBanner(i, e.target.value)} />
                                    <label
                                        className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${
                                            uploadingKey === `banner-${i}`
                                                ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                        }`}
                                        title="Upload image and auto-fill path"
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={uploadingKey === `banner-${i}`}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                e.target.value = "";
                                                if (!file) return;
                                                try {
                                                    const url = await uploadImage(`banner-${i}`, `FAQ banner ${i + 1}`, file);
                                                    updateBanner(i, url);
                                                    setMessage("Banner uploaded. Don’t forget to Save changes.");
                                                } catch (err: any) {
                                                    setError(err?.message || "Upload failed");
                                                }
                                            }}
                                        />
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload
                                    </label>
                                </div>
                                <div className="mt-1 text-[11px] text-slate-500 space-y-1">
                                    <div>Image requirement: max <strong>5MB</strong>.</div>
                                    {uploadInfo[`banner-${i}`] ? <div className="text-slate-600">Selected: {uploadInfo[`banner-${i}`]}</div> : null}
                                </div>
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addBanner} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add banner image
                        </Button>
                    </Section>

                    <Section title="2. FAQs (questions)">
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
                                    <label className={labelClass}>Answer (one line per point)</label>
                                    <textarea
                                        className={`${inputClass} min-h-[96px]`}
                                        value={(f.answer || []).join("\n")}
                                        onChange={(e) => updateFaq(i, { answer: e.target.value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean) })}
                                    />
                                </div>
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addFaq} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add FAQ
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


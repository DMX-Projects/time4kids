"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { FileText, GraduationCap, Upload, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { resolveCmsMediaUrl } from "@/lib/api-client";
import type { StudentsKitPageApi } from "@/lib/students-kit-server";

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";
const labelClass = "block text-xs font-medium text-slate-600 mb-1";

type PageForm = {
    title: string;
    short_label: string;
    image_alt: string;
    link_label: string;
    academic_year: string;
    is_active: boolean;
};

function KitCard({
    page,
    onSaved,
    authFetch,
}: {
    page: StudentsKitPageApi;
    onSaved: () => void;
    authFetch: ReturnType<typeof useAuth>["authFetch"];
}) {
    const { showToast } = useToast();
    const [form, setForm] = useState<PageForm>(() => ({
        title: page.title,
        short_label: page.short_label,
        image_alt: page.image_alt,
        link_label: page.link_label,
        academic_year: page.academic_year || "AY 2026-27",
        is_active: page.is_active,
    }));
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [clearImage, setClearImage] = useState(false);
    const [clearPdf, setClearPdf] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm({
            title: page.title,
            short_label: page.short_label,
            image_alt: page.image_alt,
            link_label: page.link_label,
            academic_year: page.academic_year || "AY 2026-27",
            is_active: page.is_active,
        });
        setImageFile(null);
        setPdfFile(null);
        setClearImage(false);
        setClearPdf(false);
    }, [page]);

    const imagePreview = imageFile
        ? URL.createObjectURL(imageFile)
        : clearImage
          ? ""
          : page.image
            ? resolveCmsMediaUrl(page.image)
            : "";

    const pdfHref = clearPdf ? "" : pdfFile ? URL.createObjectURL(pdfFile) : page.pdf ? resolveCmsMediaUrl(page.pdf) : "";

    const save = async () => {
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("title", form.title.trim());
            fd.append("short_label", form.short_label.trim());
            fd.append("image_alt", form.image_alt.trim());
            fd.append("link_label", form.link_label.trim());
            fd.append("academic_year", form.academic_year.trim());
            fd.append("is_active", form.is_active ? "true" : "false");
            if (imageFile) fd.append("image", imageFile);
            if (pdfFile) fd.append("pdf", pdfFile);
            if (clearImage) fd.append("clear_image", "true");
            if (clearPdf) fd.append("clear_pdf", "true");

            await authFetch(`/common/students-kit-pages/${page.slug}/`, {
                method: "PATCH",
                body: fd,
            });
            showToast(`${page.short_label} saved`, "success");
            onSaved();
        } catch (err) {
            console.error(err);
            showToast("Could not save. Try again.", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">{page.slug}</p>
                    <h2 className="text-lg font-bold text-slate-900">{page.short_label}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Public page:{" "}
                        <a href={page.public_path} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">
                            {page.public_path}
                        </a>
                    </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                        className="rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                    />
                    Active on site
                </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className={labelClass}>Page title</label>
                    <input
                        className={inputClass}
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    />
                </div>
                <div>
                    <label className={labelClass}>Short label</label>
                    <input
                        className={inputClass}
                        value={form.short_label}
                        onChange={(e) => setForm((f) => ({ ...f, short_label: e.target.value }))}
                    />
                </div>
                <div>
                    <label className={labelClass}>Center page link label</label>
                    <input
                        className={inputClass}
                        value={form.link_label}
                        onChange={(e) => setForm((f) => ({ ...f, link_label: e.target.value }))}
                    />
                </div>
                <div>
                    <label className={labelClass}>Academic year</label>
                    <input
                        className={inputClass}
                        value={form.academic_year}
                        onChange={(e) => setForm((f) => ({ ...f, academic_year: e.target.value }))}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className={labelClass}>Image alt text</label>
                    <input
                        className={inputClass}
                        value={form.image_alt}
                        onChange={(e) => setForm((f) => ({ ...f, image_alt: e.target.value }))}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-dashed border-slate-200 p-3 space-y-2">
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Kit poster image
                    </p>
                    {imagePreview ? (
                        <div className="relative aspect-[3/4] max-h-48 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                            <Image src={imagePreview} alt="" fill className="object-contain" unoptimized />
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500">No image — public page uses default PNG in /public/students-kits/</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200">
                            <Upload className="w-3.5 h-3.5" />
                            Upload image
                            <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                        setImageFile(f);
                                        setClearImage(false);
                                    }
                                }}
                            />
                        </label>
                        {(page.image || imageFile) && !clearImage ? (
                            <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                onClick={() => {
                                    setImageFile(null);
                                    setClearImage(true);
                                }}
                            >
                                <X className="w-3.5 h-3.5" /> Remove image
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="rounded-xl border border-dashed border-slate-200 p-3 space-y-2">
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Kit PDF
                    </p>
                    {pdfHref ? (
                        <a href={pdfHref} target="_blank" rel="noreferrer" className="text-sm text-orange-600 hover:underline break-all">
                            View current PDF
                        </a>
                    ) : (
                        <p className="text-xs text-slate-500">No PDF — franchise hub download disabled until uploaded.</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200">
                            <Upload className="w-3.5 h-3.5" />
                            Upload PDF
                            <input
                                type="file"
                                accept="application/pdf,.pdf"
                                className="sr-only"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                        setPdfFile(f);
                                        setClearPdf(false);
                                    }
                                }}
                            />
                        </label>
                        {(page.pdf || pdfFile) && !clearPdf ? (
                            <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                onClick={() => {
                                    setPdfFile(null);
                                    setClearPdf(true);
                                }}
                            >
                                <X className="w-3.5 h-3.5" /> Remove PDF
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={() => void save()} disabled={saving}>
                    {saving ? "Saving…" : `Save ${page.short_label}`}
                </Button>
            </div>
        </section>
    );
}

export default function AdminStudentsKitPagesPage() {
    const { authFetch } = useAuth();
    const [pages, setPages] = useState<StudentsKitPageApi[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await authFetch<StudentsKitPageApi[]>("/common/students-kit-pages/");
            setPages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-7 h-7 text-orange-500" />
                    Students kit pages
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                    Upload poster images and PDFs for Nursery, Play Group, PP-1, and PP-2. Images appear on the public kit
                    pages; PDFs sync to the franchise Students Kit hub.
                </p>
            </div>

            {loading ? (
                <p className="text-sm text-slate-500">Loading…</p>
            ) : (
                pages.map((page) => <KitCard key={page.slug} page={page} onSaved={load} authFetch={authFetch} />)
            )}
        </div>
    );
}

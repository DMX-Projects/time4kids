"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileText, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { mediaUrl } from "@/lib/api-client";
import { marketingAssetHref } from "@/lib/marketing-assets";
import {
    ADMISSION_BROCHURE_PDF_URL,
    FRANCHISE_BROCHURE_PDF_URL,
} from "@/config/site-public";

type MarketingAsset = {
    id: number;
    slug: string;
    title: string;
    file?: string | null;
    link?: string | null;
    is_active: boolean;
    updated_at?: string;
};

type AssetConfig = {
    slug: string;
    defaultTitle: string;
    description: string;
    acceptPdf?: boolean;
    fallbackUrl?: string;
};

const ASSET_CONFIGS: AssetConfig[] = [
    {
        slug: "admission-brochure",
        defaultTitle: "Admission Brochure",
        description: "Used on the home page (Admission Brochure tile) and the /admission download section.",
        acceptPdf: true,
        fallbackUrl: ADMISSION_BROCHURE_PDF_URL,
    },
    {
        slug: "franchise-brochure",
        defaultTitle: "Franchise Brochure",
        description: "Used on the home page (Franchise Brochure tile) and the /franchise download button.",
        acceptPdf: true,
        fallbackUrl: FRANCHISE_BROCHURE_PDF_URL,
    },
    {
        slug: "virtual-tour",
        defaultTitle: "Virtual Tour",
        description: "YouTube or Google Maps link for the Virtual Tour button (no PDF required).",
        acceptPdf: false,
    },
];

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";

export default function AdminMarketingAssetsPage() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();
    const [assets, setAssets] = useState<MarketingAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingSlug, setSavingSlug] = useState<string | null>(null);
    const [files, setFiles] = useState<Record<string, File | null>>({});
    const [forms, setForms] = useState<Record<string, { title: string; link: string; is_active: boolean }>>({});

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authFetch<MarketingAsset[]>("/common/marketing-assets/");
            const list = Array.isArray(data) ? data : [];
            setAssets(list);

            const nextForms: Record<string, { title: string; link: string; is_active: boolean }> = {};
            for (const cfg of ASSET_CONFIGS) {
                const row = list.find((a) => a.slug === cfg.slug);
                nextForms[cfg.slug] = {
                    title: row?.title?.trim() || cfg.defaultTitle,
                    link: row?.link?.trim() || "",
                    is_active: row?.is_active ?? true,
                };
            }
            setForms(nextForms);
            setFiles({});
        } catch (e) {
            console.error(e);
            showToast("Could not load marketing assets.", "error");
        } finally {
            setLoading(false);
        }
    }, [authFetch, showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const getAsset = (slug: string) => assets.find((a) => a.slug === slug);

    const previewHref = (cfg: AssetConfig) => {
        const row = getAsset(cfg.slug);
        const href = marketingAssetHref(row ?? null, cfg.fallbackUrl);
        return href !== "#" ? href : null;
    };

    const save = async (cfg: AssetConfig) => {
        const form = forms[cfg.slug];
        if (!form) return;

        if (cfg.acceptPdf) {
            const picked = files[cfg.slug];
            const existing = getAsset(cfg.slug);
            if (!existing && !picked) {
                showToast(`Choose a PDF for ${cfg.defaultTitle}.`, "error");
                return;
            }
            if (picked && picked.type !== "application/pdf" && !picked.name.toLowerCase().endsWith(".pdf")) {
                showToast("Please upload a PDF file.", "error");
                return;
            }
        } else if (!form.link.trim() && !getAsset(cfg.slug)?.link) {
            showToast("Enter a Virtual Tour URL (YouTube or Maps).", "error");
            return;
        }

        setSavingSlug(cfg.slug);
        try {
            const existing = getAsset(cfg.slug);
            const fd = new FormData();
            fd.append("title", form.title.trim() || cfg.defaultTitle);
            fd.append("is_active", form.is_active ? "1" : "0");

            const picked = files[cfg.slug];
            if (cfg.acceptPdf) {
                if (picked) {
                    fd.append("link", "");
                    fd.append("file", picked, picked.name);
                }
            } else {
                fd.append("link", form.link.trim());
            }

            if (existing?.id) {
                await authFetch(`/common/marketing-assets/${existing.id}/`, {
                    method: "PATCH",
                    body: fd,
                });
                showToast(`${cfg.defaultTitle} saved.`, "success");
            } else {
                fd.append("slug", cfg.slug);
                await authFetch("/common/marketing-assets/", {
                    method: "POST",
                    body: fd,
                });
                showToast(`${cfg.defaultTitle} uploaded.`, "success");
            }
            await load();
        } catch (e) {
            console.error(e);
            const msg = e instanceof Error ? e.message : "Save failed.";
            showToast(msg || "Save failed. Try again or use a smaller PDF.", "error");
        } finally {
            setSavingSlug(null);
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Brochures &amp; downloads</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Upload admission and franchise PDFs here. They appear on the public site after you save.
                    You do not need Django <code className="rounded bg-slate-100 px-1">/admin/</code>.
                </p>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading…</p>
            ) : (
                <div className="space-y-6">
                    {ASSET_CONFIGS.map((cfg) => {
                        const row = getAsset(cfg.slug);
                        const form = forms[cfg.slug] ?? {
                            title: cfg.defaultTitle,
                            link: "",
                            is_active: true,
                        };
                        const href = previewHref(cfg);
                        const fileLabel = files[cfg.slug]?.name;
                        const currentFile = row?.file ? mediaUrl(row.file) || row.file : null;

                        return (
                            <section
                                key={cfg.slug}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="mb-4 flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">{cfg.defaultTitle}</h2>
                                        <p className="text-xs text-slate-500">Slug: {cfg.slug}</p>
                                        <p className="mt-1 text-sm text-slate-600">{cfg.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Display title
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={form.title}
                                            onChange={(e) =>
                                                setForms((p) => ({
                                                    ...p,
                                                    [cfg.slug]: { ...form, title: e.target.value },
                                                }))
                                            }
                                        />
                                    </div>

                                    {cfg.acceptPdf ? (
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                PDF file
                                            </label>
                                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 transition hover:border-orange-300 hover:bg-orange-50/50">
                                                <Upload className="mb-2 h-6 w-6 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {fileLabel || (row?.file ? "Replace PDF" : "Choose PDF to upload")}
                                                </span>
                                                <span className="mt-1 text-xs text-slate-500">PDF only</span>
                                                <input
                                                    type="file"
                                                    accept="application/pdf,.pdf"
                                                    className="sr-only"
                                                    onChange={(e) => {
                                                        const f = e.target.files?.[0] ?? null;
                                                        setFiles((p) => ({ ...p, [cfg.slug]: f }));
                                                    }}
                                                />
                                            </label>
                                            {currentFile ? (
                                                <p className="mt-2 text-xs text-slate-500">
                                                    Current file on server:{" "}
                                                    <span className="break-all font-mono">{currentFile}</span>
                                                </p>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Tour URL
                                            </label>
                                            <input
                                                className={inputClass}
                                                type="url"
                                                placeholder="https://www.youtube.com/... or Google Maps embed"
                                                value={form.link}
                                                onChange={(e) =>
                                                    setForms((p) => ({
                                                        ...p,
                                                        [cfg.slug]: { ...form, link: e.target.value },
                                                    }))
                                                }
                                            />
                                        </div>
                                    )}

                                    <label className="flex items-center gap-2 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={(e) =>
                                                setForms((p) => ({
                                                    ...p,
                                                    [cfg.slug]: { ...form, is_active: e.target.checked },
                                                }))
                                            }
                                            className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        Active on website
                                    </label>

                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                        <Button
                                            type="button"
                                            onClick={() => void save(cfg)}
                                            disabled={savingSlug === cfg.slug}
                                        >
                                            {savingSlug === cfg.slug ? "Saving…" : row ? "Save changes" : "Upload & save"}
                                        </Button>
                                        {href ? (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Test public link
                                            </a>
                                        ) : (
                                            <span className="text-xs text-amber-700">No file yet — upload and save first.</span>
                                        )}
                                    </div>
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

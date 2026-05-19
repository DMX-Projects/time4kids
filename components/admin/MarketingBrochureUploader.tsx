"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { mediaUrl } from "@/lib/api-client";
import { marketingAssetHref } from "@/lib/marketing-assets";

type MarketingAsset = {
    id: number;
    slug: string;
    title: string;
    file?: string | null;
    link?: string | null;
    is_active: boolean;
};

type Props = {
    slug: string;
    defaultTitle: string;
    description?: string;
    fallbackUrl?: string;
    compact?: boolean;
};

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";

export function MarketingBrochureUploader({ slug, defaultTitle, description, fallbackUrl, compact }: Props) {
    const { authFetch } = useAuth();
    const { showToast } = useToast();
    const [asset, setAsset] = useState<MarketingAsset | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState(defaultTitle);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authFetch<MarketingAsset[]>("/common/marketing-assets/");
            const list = Array.isArray(data) ? data : [];
            const row = list.find((a) => a.slug === slug) ?? null;
            setAsset(row);
            setTitle(row?.title?.trim() || defaultTitle);
            setFile(null);
        } catch (e) {
            console.error(e);
            showToast("Could not load brochure.", "error");
        } finally {
            setLoading(false);
        }
    }, [authFetch, defaultTitle, showToast, slug]);

    useEffect(() => {
        void load();
    }, [load]);

    const previewHref = marketingAssetHref(asset, fallbackUrl);
    const publicHref = previewHref !== "#" ? previewHref : null;
    const currentFile = asset?.file ? mediaUrl(asset.file) || asset.file : null;

    const upload = async () => {
        if (!file) {
            showToast("Choose a PDF file first.", "error");
            return;
        }
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            showToast("Please upload a PDF file.", "error");
            return;
        }

        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("title", title.trim() || defaultTitle);
            fd.append("is_active", "true");
            fd.append("file", file);

            if (asset?.id) {
                await authFetch(`/common/marketing-assets/${asset.id}/`, {
                    method: "PATCH",
                    body: fd,
                });
                showToast(`${defaultTitle} updated.`, "success");
            } else {
                fd.append("slug", slug);
                await authFetch("/common/marketing-assets/", {
                    method: "POST",
                    body: fd,
                });
                showToast(`${defaultTitle} uploaded.`, "success");
            }
            await load();
        } catch (e) {
            console.error(e);
            showToast("Upload failed. Try again or use a smaller PDF.", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="text-sm text-slate-500">Loading brochure…</p>;
    }

    const wrapperClass = compact ? "space-y-3" : "rounded-xl border border-orange-100 bg-orange-50/40 p-4 space-y-3";

    return (
        <div className={wrapperClass}>
            {!compact && description ? <p className="text-sm text-slate-600">{description}</p> : null}

            <div className={compact ? "grid gap-3 md:grid-cols-2" : "space-y-3"}>
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Download button title</label>
                    <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">PDF file</label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-slate-200 bg-white px-4 py-3 transition hover:border-orange-300 hover:bg-orange-50/30">
                        <Upload className="h-5 w-5 shrink-0 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">
                            {file?.name || (asset?.file ? "Replace PDF" : "Choose PDF to upload")}
                        </span>
                        <input
                            type="file"
                            accept="application/pdf,.pdf"
                            className="sr-only"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        />
                    </label>
                    {currentFile ? (
                        <p className="mt-1.5 text-[11px] text-slate-500 break-all">
                            On server: <span className="font-mono">{currentFile}</span>
                        </p>
                    ) : (
                        <p className="mt-1.5 text-[11px] text-amber-700">
                            No PDF uploaded yet — site uses the default file until you upload.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Button type="button" size="sm" onClick={() => void upload()} disabled={saving || !file}>
                    {saving ? "Uploading…" : asset?.file ? "Upload & replace PDF" : "Upload PDF"}
                </Button>
                {publicHref ? (
                    <a
                        href={publicHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Test download link
                    </a>
                ) : null}
            </div>
        </div>
    );
}

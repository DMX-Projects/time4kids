"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Download, FileText, Play } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PARENT_NEWSLETTER_CATEGORY } from "@/config/parent-newsletter";
import {
    openNewsletterVideoEmbedLink,
    openParentDocumentAudioFile,
    openParentDocumentFile,
} from "@/lib/parent-document-file-open";
import { openDirectAudioUrlInNewTab } from "@/lib/inline-document-open";
import { fileMatchesParentDocumentCategory, parentDocumentFileKind } from "@/lib/parent-document-file-kind";

type DocRow = {
    id: number;
    title: string;
    file: string;
    display_title?: string;
    file_view_path?: string | null;
    video_embed_url?: string;
    audio_file?: string;
    audio_embed_url?: string;
};
type ParentDocRow = DocRow & { category?: string };

const normalizeDocs = (data: unknown): DocRow[] => {
    if (Array.isArray(data)) return data as DocRow[];
    if (data && typeof data === "object") {
        const obj = data as { results?: unknown; data?: unknown; documents?: unknown };
        if (Array.isArray(obj.results)) return obj.results as DocRow[];
        if (Array.isArray(obj.data)) return obj.data as DocRow[];
        if (Array.isArray(obj.documents)) return obj.documents as DocRow[];
    }
    return [];
};

export function ParentDocList({
    category,
    title,
    description,
    emptyMessage = "Nothing uploaded yet. Your centre can add PDFs from the franchise portal.",
    headerIcon,
    videoOnly = false,
    audioOnly = false,
    mixedMedia = false,
}: {
    category: string;
    title: string;
    description: string;
    emptyMessage?: string;
    headerIcon?: ReactNode;
    /** @deprecated Use mixedMedia for Watch • Hear • Learn */
    videoOnly?: boolean;
    audioOnly?: boolean;
    /** Watch • Hear • Learn — videos, audio, PDFs, and documents together. */
    mixedMedia?: boolean;
}) {
    const { authFetch, authFetchBlobResponse, getAccessTokenForDocumentView } = useAuth();
    const [docs, setDocs] = useState<DocRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await authFetch<unknown>(`/documents/parent/documents/category/${category}/`);
                if (!cancelled) {
                    setDocs(
                        normalizeDocs(data).filter((d) =>
                            fileMatchesParentDocumentCategory(d.file || "", category),
                        ),
                    );
                }
            } catch {
                // Fallback for environments where category endpoint is stricter/misconfigured.
                try {
                    const all = await authFetch<unknown>("/documents/parent/documents/");
                    const list = normalizeDocs(all) as ParentDocRow[];
                    const filtered = list.filter((d) => String(d.category || "").toUpperCase() === category.toUpperCase());
                    if (!cancelled) {
                        setDocs(
                            filtered.filter((d) =>
                                fileMatchesParentDocumentCategory(d.file || "", category),
                            ),
                        );
                    }
                } catch {
                    if (!cancelled) setDocs([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [authFetch, category]);

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        {headerIcon ?? <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">{title}</h1>
                        <p className="text-sm text-orange-700">{description}</p>
                    </div>
                </div>
            </section>

            {loading && <p className="text-sm text-orange-700">Loading…</p>}

            <ul className="space-y-3">
                {docs.map((d) => {
                    const showNewsletterEmbeds = category === PARENT_NEWSLETTER_CATEGORY;
                    const hasPdfFile = Boolean((d.file || "").trim());
                    const hasVideoEmbed = Boolean((d.video_embed_url || "").trim());
                    const hasAudioFile = Boolean((d.audio_file || "").trim());
                    const hasAudioEmbed = Boolean((d.audio_embed_url || "").trim());

                    return (
                    <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                        <span className="font-medium text-orange-900 text-sm">{d.display_title || d.title}</span>
                        {showNewsletterEmbeds ? (
                            <div className="flex flex-wrap items-center gap-2">
                                {hasPdfFile ? (
                                    <button
                                        type="button"
                                        onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d)}
                                        className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-800 border border-orange-100 hover:bg-orange-100"
                                    >
                                        <Download className="w-4 h-4" />
                                        View PDF / document
                                    </button>
                                ) : null}
                                {hasVideoEmbed ? (
                                    <button
                                        type="button"
                                        onClick={() => openNewsletterVideoEmbedLink(d.video_embed_url || "", d.display_title || d.title)}
                                        className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-xs font-semibold text-white border border-orange-700 hover:bg-orange-700"
                                    >
                                        <Play className="w-4 h-4" />
                                        Play video
                                    </button>
                                ) : null}
                                {hasAudioFile ? (
                                    <button
                                        type="button"
                                        onClick={() => openParentDocumentAudioFile(getAccessTokenForDocumentView, authFetchBlobResponse, d)}
                                        className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-800 border border-orange-100 hover:bg-orange-100"
                                    >
                                        <Play className="w-4 h-4" />
                                        Play audio
                                    </button>
                                ) : null}
                                {!hasAudioFile && hasAudioEmbed ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openDirectAudioUrlInNewTab(d.audio_embed_url || "", d.display_title || d.title || "Audio")
                                        }
                                        className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-800 border border-orange-100 hover:bg-orange-100"
                                    >
                                        <Play className="w-4 h-4" />
                                        Play audio
                                    </button>
                                ) : null}
                            </div>
                        ) : mixedMedia ? (
                            (() => {
                                const kind = parentDocumentFileKind(d.file || "");
                                if (kind === "video") {
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d)}
                                            className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-xs font-semibold text-white border border-orange-700 hover:bg-orange-700"
                                        >
                                            <Play className="w-4 h-4" />
                                            Play video
                                        </button>
                                    );
                                }
                                if (kind === "audio") {
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d)}
                                            className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-800 border border-orange-100 hover:bg-orange-100"
                                        >
                                            <Download className="w-4 h-4" />
                                            Play audio
                                        </button>
                                    );
                                }
                                return (
                                    <button
                                        type="button"
                                        onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d)}
                                        className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-800 border border-orange-100 hover:bg-orange-100"
                                    >
                                        <Download className="w-4 h-4" />
                                        View / download
                                    </button>
                                );
                            })()
                        ) : videoOnly ? (
                            <button
                                type="button"
                                onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d)}
                                className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-xs font-semibold text-white border border-orange-700 hover:bg-orange-700"
                            >
                                <Play className="w-4 h-4" />
                                Play video
                            </button>
                        ) : audioOnly ? (
                            <button
                                type="button"
                                onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d)}
                                className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-800 border border-orange-100 hover:bg-orange-100"
                            >
                                <Download className="w-4 h-4" />
                                Play audio
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d)}
                                className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-800 border border-orange-100 hover:bg-orange-100"
                            >
                                <Download className="w-4 h-4" />
                                View / download
                            </button>
                        )}
                    </li>
                    );
                })}
            </ul>

            {!loading && docs.length === 0 && (
                <section className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-6 space-y-3">
                    <p className="text-sm text-orange-900 font-medium">{emptyMessage}</p>
                    <p className="text-xs text-orange-800 leading-relaxed">
                        Nothing is wrong with this page — your centre has not uploaded files for this section yet. When they do, they will
                        show up here only (this screen does not list homework, fees, or other tools).
                    </p>
                </section>
            )}
        </div>
    );
}

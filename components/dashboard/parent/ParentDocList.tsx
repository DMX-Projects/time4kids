"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Download, FileText, Play } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";
import { PARENT_NEWSLETTER_CATEGORY } from "@/config/parent-newsletter";
import {
    openNewsletterVideoEmbedLink,
    openParentDocumentAudioFile,
    openParentDocumentFile,
} from "@/lib/parent-document-file-open";
import { openDirectAudioUrlInNewTab } from "@/lib/inline-document-open";
import { parentDocumentFileKind, parentDocumentRowVisible } from "@/lib/parent-document-file-kind";
import { parentDocClassTargets, parentDocVisibleForStudentGrade } from "@/lib/parent-doc-class-filter";

type DocRow = {
    id: number;
    title: string;
    file: string;
    display_title?: string;
    file_view_path?: string | null;
    audio_view_path?: string | null;
    video_embed_url?: string;
    audio_file?: string;
    audio_embed_url?: string;
    period_start?: string | null;
    period_end?: string | null;
    source_label?: string;
    franchise?: number | null;
    target_class_names?: string[];
    class_name?: string;
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
    const { scopedApiPath, studentScopeReady, selectedStudent, hasMultipleChildren } = useParentData();
    const [docs, setDocs] = useState<DocRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentScopeReady) return;
        setLoading(true);
        let cancelled = false;
        (async () => {
            try {
                const data = await authFetch<unknown>(
                    scopedApiPath(`/documents/parent/documents/category/${category}/?wrap=list`),
                );
                if (!cancelled) {
                    const rows = normalizeDocs(data).filter((d) => parentDocumentRowVisible(d, category));
                    if (category === PARENT_NEWSLETTER_CATEGORY) {
                        rows.sort((a, b) => {
                            const ad = (a.period_start || "").slice(0, 10);
                            const bd = (b.period_start || "").slice(0, 10);
                            if (ad !== bd) return bd.localeCompare(ad);
                            return String(a.source_label || "").localeCompare(String(b.source_label || ""));
                        });
                    }
                    setDocs(rows);
                }
            } catch {
                // Fallback for environments where category endpoint is stricter/misconfigured.
                try {
                    const all = await authFetch<unknown>(scopedApiPath("/documents/parent/documents/?wrap=list"));
                    const list = normalizeDocs(all) as ParentDocRow[];
                    const filtered = list.filter((d) => String(d.category || "").toUpperCase() === category.toUpperCase());
                    if (!cancelled) {
                        setDocs(
                            filtered
                                .filter((d) => parentDocumentRowVisible(d, category))
                                .filter((d) => parentDocVisibleForStudentGrade(d, selectedStudent?.grade)),
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
    }, [authFetch, category, scopedApiPath, studentScopeReady, selectedStudent?.id]);

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
                        {hasMultipleChildren && selectedStudent ? (
                            <p className="text-xs text-orange-600 mt-1">
                                Showing items for {selectedStudent.name}
                                {selectedStudent.grade ? ` (${selectedStudent.grade})` : ""}. Switch child from the header to see another class.
                            </p>
                        ) : null}
                    </div>
                </div>
            </section>

            {(!studentScopeReady || loading) && (
                <p className="text-sm text-orange-700">
                    {!studentScopeReady ? "Loading your child's profile…" : "Loading…"}
                </p>
            )}

            <ul className="space-y-3">
                {docs.map((d) => {
                    const showNewsletterEmbeds = category === PARENT_NEWSLETTER_CATEGORY;
                    const hasStoredFile = Boolean((d.file || "").trim() || (d.file_view_path || "").trim());
                    const hasPdfFile = hasStoredFile;
                    const hasVideoEmbed = Boolean((d.video_embed_url || "").trim());
                    const hasAudioFile = Boolean((d.audio_file || "").trim());
                    const hasAudioEmbed = Boolean((d.audio_embed_url || "").trim());
                    const classTargets = showNewsletterEmbeds ? parentDocClassTargets(d) : [];

                    return (
                    <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                        <div className="min-w-0">
                            <span className="font-medium text-orange-900 text-sm block">{d.display_title || d.title}</span>
                            {showNewsletterEmbeds && (d.period_start || d.source_label || classTargets.length) ? (
                                <span className="text-[11px] text-orange-700 mt-0.5 block">
                                    {[
                                        d.period_start ? String(d.period_start).slice(0, 10) : null,
                                        d.source_label,
                                        classTargets.length ? `Class: ${classTargets.join(", ")}` : null,
                                    ]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </span>
                            ) : null}
                        </div>
                        {showNewsletterEmbeds ? (
                            <div className="flex flex-wrap items-center gap-2">
                                {hasPdfFile ? (
                                    <button
                                        type="button"
                                        onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d, selectedStudent?.id)}
                                        className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-800 border border-orange-100 hover:bg-orange-100"
                                    >
                                        <Download className="w-4 h-4" />
                                        View / download file
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
                                        onClick={() => openParentDocumentAudioFile(getAccessTokenForDocumentView, authFetchBlobResponse, d, selectedStudent?.id)}
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
                                const hasVideoEmbed = Boolean((d.video_embed_url || "").trim());
                                if (hasVideoEmbed && !(d.file || "").trim()) {
                                    return (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openNewsletterVideoEmbedLink(
                                                    d.video_embed_url || "",
                                                    d.display_title || d.title,
                                                )
                                            }
                                            className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-xs font-semibold text-white border border-orange-700 hover:bg-orange-700"
                                        >
                                            <Play className="w-4 h-4" />
                                            Play video
                                        </button>
                                    );
                                }
                                const kind = parentDocumentFileKind(d.file || "");
                                if (kind === "video") {
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d, selectedStudent?.id)}
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
                                            onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d, selectedStudent?.id)}
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
                                        onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d, selectedStudent?.id)}
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
                                onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d, selectedStudent?.id)}
                                className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-xs font-semibold text-white border border-orange-700 hover:bg-orange-700"
                            >
                                <Play className="w-4 h-4" />
                                Play video
                            </button>
                        ) : audioOnly ? (
                            <button
                                type="button"
                                onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d, selectedStudent?.id)}
                                className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-800 border border-orange-100 hover:bg-orange-100"
                            >
                                <Download className="w-4 h-4" />
                                Play audio
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, d, selectedStudent?.id)}
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

            {!loading && studentScopeReady && docs.length === 0 && (
                <section className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-6 space-y-3">
                    <p className="text-sm text-orange-900 font-medium">{emptyMessage}</p>
                    {category === PARENT_NEWSLETTER_CATEGORY && hasMultipleChildren && selectedStudent ? (
                        <p className="text-xs text-orange-800 leading-relaxed">
                            Newsletters can be limited to one class (Play Group, Nursery, PP-1, etc.). You are viewing{" "}
                            <strong>{selectedStudent.name}</strong>
                            {selectedStudent.grade ? ` (${selectedStudent.grade})` : ""}. Switch child from the header if
                            you expected a newsletter for another class.
                        </p>
                    ) : (
                        <p className="text-xs text-orange-800 leading-relaxed">
                            Nothing is wrong with this page — your centre has not uploaded files for this section yet. When they do, they will
                            show up here only (this screen does not list homework, fees, or other tools).
                        </p>
                    )}
                </section>
            )}
        </div>
    );
}

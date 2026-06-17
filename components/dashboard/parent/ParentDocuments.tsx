"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import { ChevronDown, Download, Eye, FileText, LifeBuoy, Music, Play, Sparkles } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";
import { useParentAppNavCustom } from "@/hooks/useParentAppNavCustom";
import type { ParentDocumentForMatch } from "@/lib/admin-parent-app-upload";
import {
    buildParentDashboardSectionsFromNav,
    collectParentSectionDocs,
} from "@/lib/parent-dashboard-doc-sections";
import { mergeParentAppNavBlocks } from "@/lib/merge-parent-app-nav-blocks";
import {
    openNewsletterVideoEmbedLink,
    openParentDocumentFile,
    type AuthFetchBlobResponse,
} from "@/lib/parent-document-file-open";
import { parentDocumentFileKind } from "@/lib/parent-document-file-kind";
import type { GetAccessToken } from "@/lib/protected-document-view-url";



type ParentDoc = ParentDocumentForMatch & {
    file?: string;
    target_class_names?: string[];
    class_name?: string;
};



const normalizeDocs = (data: unknown): ParentDoc[] => {

    if (Array.isArray(data)) return data as ParentDoc[];

    if (data && typeof data === "object") {

        const obj = data as { results?: unknown; data?: unknown; documents?: unknown };

        if (Array.isArray(obj.results)) return obj.results as ParentDoc[];

        if (Array.isArray(obj.data)) return obj.data as ParentDoc[];

        if (Array.isArray(obj.documents)) return obj.documents as ParentDoc[];

    }

    return [];

};



const sectionIcons: Record<string, JSX.Element> = {

    "preschool-policies": <FileText className="w-4 h-4" />,

    "holiday-lists": <FileText className="w-4 h-4" />,

    "audio-rhymes": <Music className="w-4 h-4" />,

    videos: <Play className="w-4 h-4" />,

    "students-kit": <Sparkles className="w-4 h-4" />,

    "contact-us": <LifeBuoy className="w-4 h-4" />,

    "general-rhymes": <Music className="w-4 h-4" />,

    "student-transfer-policy": <FileText className="w-4 h-4" />,

    "parenting-tips": <Sparkles className="w-4 h-4" />,

};



const accentForIndex = (idx: number) =>

    idx % 2 === 0 ? { strip: "#FFE066", text: "#1F2937" } : { strip: "#A5D8FF", text: "#1F2937" };



type DocActionsProps = {

    item: ParentDocumentForMatch;

    category: string;

    studentId?: string | null;

    getAccessTokenForDocumentView: GetAccessToken;

    authFetchBlobResponse: AuthFetchBlobResponse;

};



function ParentDocumentActions({

    item,

    category,

    studentId,

    getAccessTokenForDocumentView,

    authFetchBlobResponse,

}: DocActionsProps) {

    const open = () =>
        openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, {
            ...item,
            file: item.file || "",
        }, studentId);

    const openEmbed = () =>
        openNewsletterVideoEmbedLink(item.video_embed_url || "", item.display_title || item.title);

    const hasEmbed = Boolean((item.video_embed_url || "").trim());
    const hasFile = Boolean((item.file || "").trim());
    const kind = parentDocumentFileKind(item.file || "");

    if (category === "VIDEOS") {
        if (hasEmbed && !hasFile) {
            return (
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 hover:-translate-y-[1px] transition-all"
                    onClick={openEmbed}
                >
                    <Play className="w-3.5 h-3.5" />
                    Play video
                </button>
            );
        }

        if (kind === "video") {

            return (

                <button

                    type="button"

                    className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 hover:-translate-y-[1px] transition-all"

                    onClick={open}

                >

                    <Play className="w-3.5 h-3.5" />

                    Play video

                </button>

            );

        }

        if (kind === "audio") {

            return (

                <button

                    type="button"

                    className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 hover:-translate-y-[1px] transition-all"

                    onClick={open}

                >

                    <Eye className="w-3.5 h-3.5" />

                    Play audio

                </button>

            );

        }

    }



    if (category === "AUDIO_RHYMES" && hasEmbed && !hasFile) {
        return (
            <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 hover:-translate-y-[1px] transition-all"
                onClick={openEmbed}
            >
                <Play className="w-3.5 h-3.5" />
                Play video
            </button>
        );
    }

    if (category === "AUDIO_RHYMES" && (kind === "video" || kind === "audio")) {
        const isVideo = kind === "video";

        return (

            <button

                type="button"

                className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 hover:-translate-y-[1px] transition-all"

                onClick={open}

            >

                {isVideo ? <Play className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}

                {isVideo ? "Play video" : "Play audio"}

            </button>

        );

    }



    return (

        <>

            <button

                type="button"

                className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 hover:-translate-y-[1px] transition-all"

                onClick={open}

            >

                <Eye className="w-3.5 h-3.5" />

                View

            </button>

            <button

                type="button"

                className="inline-flex items-center gap-2 rounded-full bg-[#FF922B] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 hover:-translate-y-[1px] transition-all"

                onClick={open}

            >

                <Download className="w-3.5 h-3.5" />

                Download

            </button>

        </>

    );

}



export function ParentDocuments() {

    const [openIds, setOpenIds] = useState<Set<string>>(new Set());

    const [loading, setLoading] = useState(true);

    const [docs, setDocs] = useState<ParentDoc[]>([]);

    const { authFetch, authFetchBlobResponse, getAccessTokenForDocumentView } = useAuth();
    const { scopedApiPath, studentScopeReady, selectedStudent, hasMultipleChildren } = useParentData();
    const { navCustom } = useParentAppNavCustom();



    const navBlocks = useMemo(() => mergeParentAppNavBlocks(navCustom), [navCustom]);

    const sections = useMemo(() => buildParentDashboardSectionsFromNav(navCustom), [navCustom]);

    const topItemsById = useMemo(() => {
        const map = new Map<string, import("@/config/franchise-center-page-nav").CenterPageTopItem>();
        for (const block of navBlocks) {
            for (const item of block) map.set(item.id, item);
        }
        return map;
    }, [navBlocks]);



    const load = useCallback(async () => {
        if (!studentScopeReady) return;
        setLoading(true);
        try {
            const data = await authFetch<unknown>(scopedApiPath("/documents/parent/documents/?wrap=list"));
            setDocs(normalizeDocs(data));
        } catch {
            setDocs([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, scopedApiPath, studentScopeReady]);

    useEffect(() => {
        void load();
    }, [load, selectedStudent?.id]);



    const categories = useMemo(() => {
        return sections
            .filter((section) => section.kind === "documents")
            .map((section, idx) => {
                const accent = accentForIndex(idx);
                const icon = sectionIcons[section.id] ?? <FileText className="w-4 h-4" />;
                const topItem = topItemsById.get(section.id);
                const items = topItem ? collectParentSectionDocs(topItem, docs) : [];
                return {
                    key: section.id,
                    category: section.category,
                    title: section.title,
                    subtitle: section.subtitle,
                    icon,
                    accent,
                    items,
                };
            })
            .filter((cat) => cat.items.length > 0);
    }, [sections, docs, topItemsById, selectedStudent]);



    useEffect(() => {

        setOpenIds(new Set(categories.map((c) => c.key)));

    }, [categories]);



    const toggle = (key: string) => {

        setOpenIds((prev) => {

            const next = new Set(prev);

            if (next.has(key)) next.delete(key);

            else next.add(key);

            return next;

        });

    };



    return (

        <section className="relative overflow-hidden rounded-3xl bg-white shadow-sm">

            <div className="relative p-6 md:p-8 space-y-6">

                <div className="flex items-center gap-3">

                    <div className="h-12 w-12 rounded-2xl bg-[#FFE066] text-[#1F2937] shadow-sm flex items-center justify-center text-xl">

                        📚

                    </div>

                    <div>

                        <p className="text-xs uppercase tracking-[0.08em] text-[#4B5563] font-semibold">All in one place</p>

                        <h2 className="text-2xl font-bold text-[#1F2937] leading-tight">Centre resources &amp; files</h2>

                    </div>

                </div>



                <div className="flex flex-col gap-4">

                    {loading && <p className="text-sm text-[#4B5563]">Loading documents...</p>}
                    {!loading && categories.length === 0 ? (
                        <p className="text-sm text-[#6B7280]">No documents are available yet.</p>
                    ) : null}

                    {categories.map((cat, idx) => {

                        const isOpen = openIds.has(cat.key);

                        return (

                            <article

                                key={cat.key}

                                className="relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1"

                                style={{ animationDelay: `${idx * 60}ms` }}

                            >

                                <button

                                    type="button"

                                    onClick={() => toggle(cat.key)}

                                    className="w-full flex items-center gap-3 px-4 py-3 font-semibold text-sm text-left"

                                    style={{ backgroundColor: cat.accent.strip, color: cat.accent.text }}

                                >

                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#1F2937] shadow-sm">

                                        {cat.icon}

                                        {cat.key === "audio-rhymes" && (

                                            <span className="wave-bars" aria-hidden>

                                                <span />

                                                <span />

                                                <span />

                                            </span>

                                        )}

                                    </span>

                                    <div className="flex flex-col leading-tight text-[#1F2937] flex-1 min-w-0">

                                        <span className="truncate">{cat.title}</span>

                                        <span className="text-[11px] text-[#4B5563]">{cat.subtitle}</span>

                                    </div>

                                    {cat.items.length > 0 && (

                                        <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold text-[#1F2937]">

                                            {cat.items.length}

                                        </span>

                                    )}

                                    <span

                                        className={`shrink-0 transition-transform duration-300 text-[#1F2937] ${isOpen ? "rotate-180" : ""}`}

                                        aria-hidden

                                    >

                                        <ChevronDown className="w-4 h-4" />

                                    </span>

                                </button>

                                {isOpen && (

                                    <ul className="divide-y divide-[#E5E7EB] px-4 pb-3">
                                        {cat.items.map((item) => (

                                            <li key={item.id} className="flex flex-col gap-2 py-3 text-sm">

                                                <div className="flex items-center gap-2">

                                                    <span className="text-lg shrink-0" aria-hidden>🧸</span>

                                                    <span className="font-semibold text-[#1F2937] break-words">

                                                        {item.display_title || item.title}

                                                    </span>

                                                </div>

                                                <div className="flex flex-wrap gap-2 pl-7">

                                                    <ParentDocumentActions

                                                        item={item}

                                                        category={cat.category}

                                                        studentId={selectedStudent?.id}

                                                        getAccessTokenForDocumentView={getAccessTokenForDocumentView}

                                                        authFetchBlobResponse={authFetchBlobResponse}

                                                    />

                                                </div>

                                            </li>

                                        ))}

                                    </ul>

                                )}

                            </article>

                        );

                    })}

                </div>

            </div>

        </section>

    );

}



export default ParentDocuments;


"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, Eye, FileText, Music, Play, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { mediaUrl } from "@/lib/api-client";

type ParentDoc = {
    id: number;
    category: string;
    title: string;
    display_title?: string;
    file: string;
};

const categoryMeta: Record<string, { title: string; icon: JSX.Element; accent: { strip: string; text: string } }> = {
    PRESCHOOL_POLICIES: { title: "Preschool Policies", icon: <FileText className="w-4 h-4" />, accent: { strip: "#A5D8FF", text: "#1F2937" } },
    CLASS_TIMETABLE: { title: "Class Timetable (PDF)", icon: <FileText className="w-4 h-4" />, accent: { strip: "#FFE066", text: "#1F2937" } },
    HOLIDAY_LISTS: { title: "Holiday Lists (AY 2025-26)", icon: <Sparkles className="w-4 h-4" />, accent: { strip: "#FFE066", text: "#1F2937" } },
    AUDIO_RHYMES: { title: "Audio Rhymes", icon: <Music className="w-4 h-4" />, accent: { strip: "#A5D8FF", text: "#1F2937" } },
    VIDEOS: { title: "Watch • Hear • Learn", icon: <Play className="w-4 h-4" />, accent: { strip: "#A5D8FF", text: "#1F2937" } },
    NEWSLETTERS: { title: "Newsletters", icon: <FileText className="w-4 h-4" />, accent: { strip: "#FFE066", text: "#1F2937" } },
    STUDENTS_KIT: { title: "Students Kit", icon: <Sparkles className="w-4 h-4" />, accent: { strip: "#FFE066", text: "#1F2937" } },
    PARENTING_TIPS: { title: "Parenting Tips & Articles", icon: <Sparkles className="w-4 h-4" />, accent: { strip: "#A5D8FF", text: "#1F2937" } },
};

export function ParentDocuments() {
    const [openId, setOpenId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [docs, setDocs] = useState<ParentDoc[]>([]);
    const { authFetch } = useAuth();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await authFetch<ParentDoc[]>("/documents/parent/documents/");
                setDocs(Array.isArray(data) ? data : []);
            } catch {
                setDocs([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const categories = useMemo(() => {
        return Object.entries(categoryMeta).map(([key, meta]) => ({
            key,
            ...meta,
            items: docs.filter((d) => d.category === key),
        }));
    }, [docs]);

    const toggle = (key: string) => {
        setOpenId((prev) => (prev === key ? null : key));
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
                        <p className="text-sm text-[#6B7280] mt-1">Same files as the separate Timetable, Holiday, and Policies pages — shown here by category.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {loading && <p className="text-sm text-[#4B5563]">Loading documents...</p>}
                    {categories.map((cat, idx) => {
                        const isOpen = openId === cat.key;
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
                                        {cat.key === "AUDIO_RHYMES" && (
                                            <span className="wave-bars" aria-hidden>
                                                <span />
                                                <span />
                                                <span />
                                            </span>
                                        )}
                                    </span>
                                    <div className="flex flex-col leading-tight text-[#1F2937] flex-1">
                                        <span>{cat.title}</span>
                                        <span className="text-[11px] text-[#4B5563]">Tap to view or download</span>
                                    </div>
                                    <span
                                        className={`transition-transform duration-300 text-[#1F2937] ${isOpen ? "rotate-180" : ""}`}
                                        aria-hidden
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </span>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                                >
                                    <ul className="divide-y divide-[#E5E7EB] px-4 pb-3">
                                        {cat.items.length === 0 && (
                                            <li className="py-3 text-sm text-[#6B7280]">
                                                No files uploaded yet for this section.
                                            </li>
                                        )}
                                        {cat.items.map((item) => {
                                            const fileUrl = mediaUrl(item.file);
                                            return (
                                            <li key={item.id} className="flex flex-col gap-2 py-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg" aria-hidden>🧸</span>
                                                    <span className="font-semibold text-[#1F2937]">{item.display_title || item.title}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 pl-7">
                                                    <a
                                                        className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 hover:-translate-y-[1px] transition-all"
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        View
                                                    </a>
                                                    <a
                                                        className="inline-flex items-center gap-2 rounded-full bg-[#FF922B] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 hover:-translate-y-[1px] transition-all"
                                                        href={fileUrl}
                                                        download
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        Download
                                                    </a>
                                                </div>
                                            </li>
                                        )})}
                                    </ul>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default ParentDocuments;

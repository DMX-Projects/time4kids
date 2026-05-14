"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, FileText, Music, Video } from "lucide-react";
import {
    PARENT_IMPORTANT_DOCUMENTS,
    type ParentImportantDocumentItem,
} from "@/config/parent-important-documents";

function linkIconForHref(href: string) {
    const h = href.trim().toLowerCase();
    if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(href)) return Video;
    if (h.includes("rhymes-videos.php")) return Video;
    if (h.includes("rhymes.php")) return Music;
    return FileText;
}

function HeaderWave() {
    return (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-[99%] text-white">
            <svg className="block h-4 w-full text-white md:h-5" viewBox="0 0 1200 24" preserveAspectRatio="none" aria-hidden>
                <path
                    fill="currentColor"
                    d="M0,8 C150,24 350,0 600,10 C850,20 1050,0 1200,8 L1200,24 L0,24 Z"
                />
            </svg>
        </div>
    );
}

function AccordionRow({
    item,
    open,
    onToggle,
}: {
    item: ParentImportantDocumentItem;
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border-b border-slate-200/80 last:border-b-0">
            <button
                type="button"
                id={`parent-doc-trigger-${item.id}`}
                aria-expanded={open}
                aria-controls={`parent-doc-panel-${item.id}`}
                onClick={onToggle}
                className="relative flex w-full items-center gap-3 overflow-hidden bg-[#FF922B] py-3 pl-3 pr-4 text-left shadow-sm transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-800 md:py-3.5 md:pl-4"
                style={{
                    clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)",
                }}
            >
                <ChevronRight
                    className={`h-5 w-5 shrink-0 text-[#0f172a] transition-transform duration-300 ease-out motion-reduce:duration-0 md:h-6 md:w-6 ${open ? "rotate-90" : ""}`}
                    aria-hidden
                />
                <span className="min-w-0 flex-1 font-bold leading-snug text-[#0f172a] md:text-lg">{item.title}</span>
            </button>
            <div
                className={[
                    "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                    "motion-reduce:transition-none motion-reduce:duration-0",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                ].join(" ")}
            >
                <div className="min-h-0 overflow-hidden">
                    <div
                        id={`parent-doc-panel-${item.id}`}
                        role="region"
                        aria-labelledby={`parent-doc-trigger-${item.id}`}
                        aria-hidden={!open}
                        className="border-t border-orange-200/70 bg-orange-50/60 px-4 py-4 text-sm leading-relaxed text-slate-800 md:px-5 md:text-base"
                    >
                        {item.body ? (
                            <p className={item.resourceLinks?.length ? "mb-3 text-slate-700" : "whitespace-pre-wrap"}>{item.body}</p>
                        ) : null}
                        {item.resourceLinks && item.resourceLinks.length > 0 ? (
                            <ul className="list-none space-y-2.5">
                                {item.resourceLinks.map((row) => {
                                    const Icon = linkIconForHref(row.href);
                                    return (
                                        <li key={row.href} className="flex items-start gap-2">
                                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" aria-hidden />
                                            <a
                                                href={row.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-semibold text-orange-800 underline decoration-orange-400/80 underline-offset-2 hover:text-orange-950"
                                            >
                                                {row.label}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : !item.body ? (
                            <p className="text-slate-500">No content yet.</p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ParentImportantDocumentsAccordion() {
    /** At most one row open — opening another closes the previous. */
    const [openId, setOpenId] = useState<string | null>(null);

    const toggle = useCallback((id: string) => {
        setOpenId((prev) => (prev === id ? null : id));
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.location.hash !== "#parent-important-documents") return;
        const el = document.getElementById("parent-important-documents");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

    return (
        <section id="parent-important-documents" className="scroll-mt-24">
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md">
                <div className="relative bg-[#1e3a5f] px-4 py-4 text-center md:px-6 md:py-5">
                    <h2 className="text-lg font-bold tracking-tight text-white md:text-xl">Parent Important Documents</h2>
                    <HeaderWave />
                </div>

                <div className="bg-white px-2 pb-2 pt-5 md:px-4 md:pb-4 md:pt-7">
                    <div className="space-y-2">
                        {PARENT_IMPORTANT_DOCUMENTS.map((item) => (
                            <AccordionRow
                                key={item.id}
                                item={item}
                                open={openId === item.id}
                                onToggle={() => toggle(item.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

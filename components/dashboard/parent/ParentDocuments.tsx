"use client";

import { useState } from "react";
import { ChevronDown, Download, Eye, FileText, Music, Play, Sparkles } from "lucide-react";

const documentCategories = [
    {
        title: "Holiday Lists (AY 2025-26)",
        icon: <Sparkles className="w-4 h-4" />,
        accent: { strip: "#FFE066", text: "#1F2937", iconBg: "#FFE066" },
        items: [
            { title: "AP & Telangana Holiday List", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { title: "Karnataka Holiday List", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { title: "Kerala Holiday List", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { title: "Maharashtra Holiday List", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { title: "Madhya Pradesh Holiday List", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { title: "Tamil Nadu Holiday List", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { title: "West Bengal Holiday List", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        ],
    },
    {
        title: "Audio Rhymes",
        icon: <Music className="w-4 h-4" />,
        accent: { strip: "#A5D8FF", text: "#1F2937", iconBg: "#A5D8FF" },
        items: [
            { title: "Morning Rhymes Kit", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { title: "Bedtime Lullabies", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        ],
    },
    {
        title: "Watch • Hear • Learn",
        icon: <Play className="w-4 h-4" />,
        accent: { strip: "#A5D8FF", text: "#1F2937", iconBg: "#A5D8FF" },
        items: [
            { title: "Shape & Color Hunt", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { title: "Story Time Guide", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        ],
    },
    {
        title: "Newsletters",
        icon: <FileText className="w-4 h-4" />,
        accent: { strip: "#FFE066", text: "#1F2937", iconBg: "#FFE066" },
        items: [
            { title: "July Newsletter", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { title: "August Newsletter", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        ],
    },
    {
        title: "Students Kit",
        icon: <Sparkles className="w-4 h-4" />,
        accent: { strip: "#FFE066", text: "#1F2937", iconBg: "#FFE066" },
        items: [
            { title: "Activity Sheets", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { title: "Practice Pack", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        ],
    },
    {
        title: "Parenting Tips & Articles",
        icon: <Sparkles className="w-4 h-4" />,
        accent: { strip: "#A5D8FF", text: "#1F2937", iconBg: "#A5D8FF" },
        items: [
            { title: "Healthy Screen Time", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
            { title: "Snack Ideas", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        ],
    },
];

export function ParentDocuments() {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggle = (title: string) => {
        setOpenId((prev) => (prev === title ? null : title));
    };

    return (
        <section className="relative overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="relative p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-[#FFE066] text-[#1F2937] shadow-sm flex items-center justify-center text-xl">
                        📚
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.08em] text-[#4B5563] font-semibold">Parent Dashboard</p>
                        <h2 className="text-2xl font-bold text-[#1F2937] leading-tight">Parent Important Documents</h2>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {documentCategories.map((cat, idx) => {
                        const isOpen = openId === cat.title;
                        return (
                            <article
                                key={cat.title}
                                className="relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                                style={{ animationDelay: `${idx * 60}ms` }}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(cat.title)}
                                    className="w-full flex items-center gap-3 px-4 py-3 font-semibold text-sm text-left"
                                    style={{ backgroundColor: cat.accent.strip, color: cat.accent.text }}
                                >
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#1F2937] shadow-sm">
                                        {cat.icon}
                                        {cat.title === "Audio Rhymes" && (
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
                                        {cat.items.map((item) => (
                                            <li key={item.title} className="flex flex-col gap-2 py-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg" aria-hidden>🧸</span>
                                                    <span className="font-semibold text-[#1F2937]">{item.title}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 pl-7">
                                                    <a
                                                        className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 hover:-translate-y-[1px] transition-all"
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        View
                                                    </a>
                                                    <a
                                                        className="inline-flex items-center gap-2 rounded-full bg-[#FF922B] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 hover:-translate-y-[1px] transition-all"
                                                        href={item.url}
                                                        download
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        Download
                                                    </a>
                                                </div>
                                            </li>
                                        ))}
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

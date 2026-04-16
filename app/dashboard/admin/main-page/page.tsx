"use client";

import Link from "next/link";
import { ExternalLink, Pencil, FileCode2, LayoutList } from "lucide-react";
import { mainPageSectionsForAdmin } from "@/config/main-page-sections";

const ALL_CONTENT_TOOLS: { label: string; href: string; hint: string }[] = [
    { label: "Hero / banners", href: "/dashboard/admin/hero-slides", hint: "Homepage slider" },
    { label: "Updates", href: "/dashboard/admin/updates", hint: "News carousel + social approvals" },
    { label: "Testimonials", href: "/dashboard/admin/testimonials", hint: "Quote slider on home" },
    { label: "Media files", href: "/dashboard/admin/media", hint: "Photos / videos (e.g. life at school grid)" },
    { label: "Events", href: "/dashboard/admin/events", hint: "Per-franchise events" },
    { label: "Careers", href: "/dashboard/admin/careers", hint: "Job listings" },
    { label: "Enquiries", href: "/dashboard/admin/enquiries", hint: "Forms inbox" },
    { label: "Locations", href: "/dashboard/admin/locations", hint: "Cities / presence ladder" },
    { label: "Franchises", href: "/dashboard/admin/manage-franchise", hint: "Centres & profiles" },
];

export default function AdminMainPageHub() {
    const sections = mainPageSectionsForAdmin();

    return (
        <div className="space-y-8 animate-fade-up max-w-4xl" style={{ animationDelay: "40ms" }}>
            <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Public website</p>
                <h1 className="text-2xl font-semibold text-[#111827]">Main page</h1>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                    Each block on the home page (<span className="text-[#111827]">/</span>) has the same name here as in the accessibility label on the live site.
                    Open the dashboard tool to edit CMS-backed content, or follow the file hint for sections that still live in code.
                </p>
                <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#EA580C] hover:underline"
                >
                    View live home page
                    <ExternalLink className="w-4 h-4" aria-hidden />
                </Link>
            </header>

            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
                    <LayoutList className="w-4 h-4 text-[#EA580C]" aria-hidden />
                    All content tools (admin)
                </h2>
                <p className="text-xs text-[#6B7280]">Jump to any area the marketing team can maintain.</p>
                <ul className="grid gap-2 sm:grid-cols-2 list-none p-0 m-0">
                    {ALL_CONTENT_TOOLS.map((t) => (
                        <li key={t.href}>
                            <Link
                                href={t.href}
                                className="flex flex-col rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm hover:border-[#FDBA74] transition-colors"
                            >
                                <span className="font-semibold text-[#111827] text-sm">{t.label}</span>
                                <span className="text-xs text-[#6B7280] mt-0.5">{t.hint}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="space-y-2">
                <h2 className="text-sm font-semibold text-[#111827]">Blocks on the home page (top to bottom)</h2>
            </section>

            <ol className="space-y-3 list-none p-0 m-0">
                {sections.map((s, index) => (
                    <li
                        key={s.key}
                        className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                    >
                        <div className="space-y-1 min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                                Block {index + 1}
                            </p>
                            <h2 className="text-base font-semibold text-[#111827] leading-snug">{s.label}</h2>
                            <p className="text-sm text-[#6B7280] leading-relaxed">{s.summary}</p>
                            <p className="text-xs text-[#6B7280]">
                                <span className="font-medium text-[#374151]">On-site anchor:</span>{" "}
                                <code className="text-[11px] bg-[#F3F4F6] px-1.5 py-0.5 rounded">#{s.id}</code>
                            </p>
                            {s.codeNote && (
                                <p className="text-xs text-[#6B7280] flex gap-1.5 items-start">
                                    <FileCode2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#9CA3AF]" aria-hidden />
                                    <span>{s.codeNote}</span>
                                </p>
                            )}
                        </div>
                        <div className="shrink-0 flex flex-col gap-2 sm:items-end">
                            {s.editHref ? (
                                <Link
                                    href={s.editHref}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#FF922B] text-white hover:brightness-105 transition-[filter]"
                                >
                                    <Pencil className="w-4 h-4" aria-hidden />
                                    Edit in dashboard
                                </Link>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F3F4F6] text-[#6B7280]">
                                    Not in CMS yet — code only
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}

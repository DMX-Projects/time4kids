import Image from "next/image";
import Link from "next/link";
import type { StudentsKitPageConfig } from "@/config/students-kit-public-pages";

type Props = {
    page: StudentsKitPageConfig;
};

export default function StudentsKitViewPage({ page }: Props) {
    return (
        <main className="min-h-screen bg-[#FFFAF5] pt-24 pb-16 md:pt-28 md:pb-20">
            <div className="container mx-auto max-w-5xl px-3 sm:px-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
                            Students Kit AY 2026-27
                        </p>
                        <h1 className="mt-1 font-display text-2xl font-black text-[#003366] md:text-3xl">{page.title}</h1>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#FF922B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105"
                    >
                        Back to site
                    </Link>
                </div>

                {page.pdfSrc ? (
                    <a
                        href={page.pdfSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center justify-center rounded-full border border-[#003366] bg-white px-4 py-2 text-sm font-semibold text-[#003366] hover:bg-slate-50"
                    >
                        Download PDF
                    </a>
                ) : null}

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
                    <Image
                        src={page.imageSrc}
                        alt={page.imageAlt}
                        width={1200}
                        height={1600}
                        priority
                        unoptimized
                        className="h-auto w-full"
                        sizes="(max-width: 1024px) 100vw, 960px"
                    />
                </div>
            </div>
        </main>
    );
}
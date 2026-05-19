'use client';

import React from 'react';
import Link from 'next/link';

/** Franchise green & blue — matches enquiry CTA / key-nav greens on the site */
const FRANCHISE_GREEN = {
    panel:
        'bg-gradient-to-b from-[#b5e06a] via-[#8AC43F] to-[#6b9e2e] hover:from-[#c4eb7c] hover:via-[#9ad04f] hover:to-[#7cb038] shadow-[0_12px_36px_rgba(138,196,63,0.45)] border-[#d4f0a8]/70',
    text: 'font-extrabold text-white drop-shadow-[0_1px_3px_rgba(30,70,15,0.5)]',
    accent: 'font-extrabold text-[#fffbeb] drop-shadow-[0_1px_3px_rgba(30,70,15,0.45)]',
};

const FRANCHISE_BLUE = {
    panel:
        'bg-gradient-to-b from-[#5eb0ef] via-[#2b7fd4] to-[#1a6fbd] hover:from-[#72bdf5] hover:via-[#3d8fe0] hover:to-[#257fc9] shadow-[0_12px_36px_rgba(43,127,212,0.45)] border-[#b8ddf7]/70',
    text: 'font-extrabold text-white drop-shadow-[0_1px_3px_rgba(12,52,92,0.55)]',
    accent: 'font-extrabold text-white drop-shadow-[0_1px_3px_rgba(12,52,92,0.55)]',
};

const TABS = [
    {
        href: '/admission/',
        theme: FRANCHISE_GREEN,
        parts: [
            { text: 'Admission ', accent: false },
            { text: 'enquiry', accent: true },
        ],
    },
    {
        href: '/franchise/',
        theme: FRANCHISE_BLUE,
        parts: [
            { text: 'Start a ', accent: false },
            { text: 'franchise', accent: true },
        ],
    },
] as const;

export default function FloatingSideTabs() {
    return (
        <aside
            className="fixed right-0 top-1/2 z-[8000] hidden -translate-y-1/2 flex-col gap-2 pointer-events-none sm:flex sm:gap-2.5"
            aria-label="Quick links"
        >
            {TABS.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={`pointer-events-auto flex min-h-[8rem] w-12 items-center justify-center rounded-l-2xl border border-r-0 px-2 py-4 transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8AC43F] sm:min-h-[9rem] sm:w-[3.25rem] ${tab.theme.panel}`}
                >
                    <span
                        className="whitespace-nowrap font-display text-xs font-extrabold uppercase leading-none tracking-[0.08em] sm:text-sm"
                        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                    >
                        {tab.parts.map((part) => (
                            <span
                                key={part.text}
                                className={part.accent ? tab.theme.accent : tab.theme.text}
                            >
                                {part.text}
                            </span>
                        ))}
                    </span>
                </Link>
            ))}
        </aside>
    );
}

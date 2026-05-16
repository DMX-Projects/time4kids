'use client';

import React, { useMemo } from 'react';

type NewsTickerMarqueeProps = {
    lines: string[];
    emptyMessage?: string;
    className?: string;
};

/** Continuous horizontal scroll for “Latest News & Updates”. */
export default function NewsTickerMarquee({ lines, emptyMessage, className = '' }: NewsTickerMarqueeProps) {
    const displayText = useMemo(() => {
        const parts = lines.map((l) => l.trim()).filter(Boolean);
        if (parts.length === 0) {
            return (emptyMessage || 'News updates and announcements will appear here.').trim();
        }
        return parts.join('   •   ');
    }, [lines, emptyMessage]);

    /** Long centre lists need a slower scroll so the full text is readable. */
    const marqueeDurationSec = useMemo(
        () => Math.min(240, Math.max(45, Math.round(displayText.length * 0.12))),
        [displayText.length],
    );

    const segment = (
        <span className="inline-flex shrink-0 items-center gap-3 px-6 py-5 sm:px-10 sm:py-6">
            <span className="shrink-0 text-2xl font-bold leading-none text-orange-500 md:text-3xl" aria-hidden>
                →
            </span>
            <span className="whitespace-nowrap text-base font-semibold leading-relaxed text-slate-800 md:text-lg">
                {displayText}
            </span>
        </span>
    );

    const marqueeStyle = { animationDuration: `${marqueeDurationSec}s` };

    return (
        <div
            className={`overflow-hidden ${className}`}
            role="region"
            aria-label="Latest news and updates"
            aria-live="polite"
        >
            <div className="flex w-max min-w-full">
                <div className="marquee-content flex shrink-0" style={marqueeStyle}>
                    {segment}
                </div>
                <div className="marquee-content flex shrink-0" style={marqueeStyle} aria-hidden>
                    {segment}
                </div>
            </div>
        </div>
    );
}

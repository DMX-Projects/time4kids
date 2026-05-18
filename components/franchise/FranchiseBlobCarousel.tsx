'use client';

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
    slideCount: number;
    activeIndex: number;
    onPrev: () => void;
    onNext: () => void;
    onSelect: (index: number) => void;
    prevLabel?: string;
    nextLabel?: string;
    dotsLabel?: string;
    children: ReactNode;
};

/** Horizontal video slider with outside arrows and dots. */
export default function FranchiseBlobCarousel({
    slideCount,
    activeIndex,
    onPrev,
    onNext,
    onSelect,
    prevLabel = 'Previous slide',
    nextLabel = 'Next slide',
    dotsLabel = 'Video slides',
    children,
}: Props) {
    if (slideCount === 0) return null;

    const sideNavClass =
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-md transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:h-10 sm:w-10';

    const slideTrack = (
        <div className="relative min-w-0 flex-1 overflow-hidden">
            <motion.div
                className="flex w-full transition-transform duration-500 ease-out will-change-transform"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
                {children}
            </motion.div>
        </div>
    );

    return (
        <motion.div className="w-full">
            {slideCount > 1 ? (
                <div className="flex items-center gap-2 sm:gap-3">
                    <button type="button" onClick={onPrev} className={sideNavClass} aria-label={prevLabel}>
                        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    {slideTrack}
                    <button type="button" onClick={onNext} className={sideNavClass} aria-label={nextLabel}>
                        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </div>
            ) : (
                slideTrack
            )}
            {slideCount > 1 ? (
                <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label={dotsLabel}>
                    {Array.from({ length: slideCount }, (_, i) => (
                        <button
                            key={i}
                            type="button"
                            role="tab"
                            aria-selected={i === activeIndex}
                            onClick={() => onSelect(i)}
                            className={`h-2.5 rounded-full transition-all ${
                                i === activeIndex ? 'w-8 bg-orange-500' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                            aria-label={`Show slide ${i + 1}`}
                        />
                    ))}
                </div>
            ) : null}
        </motion.div>
    );
}

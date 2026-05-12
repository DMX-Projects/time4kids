'use client';

import { useEffect, useRef } from 'react';

type LenisLike = { scroll: number; on: (e: string, fn: () => void) => void; off: (e: string, fn: () => void) => void };

export default function ScrollProgress() {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let rafId: number | null = null;

        const updateScrollProgress = () => {
            if (rafId !== null) return;

            rafId = requestAnimationFrame(() => {
                const lenis = (window as unknown as { lenis?: LenisLike }).lenis;
                const scrollY = lenis ? lenis.scroll : window.scrollY;
                const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                if (windowHeight > 0 && barRef.current) {
                    const progress = (scrollY / windowHeight) * 100;
                    barRef.current.style.transform = `scaleX(${progress / 100})`;
                }
                rafId = null;
            });
        };

        updateScrollProgress();

        const lenis = (window as unknown as { lenis?: LenisLike }).lenis;
        if (lenis) {
            lenis.on('scroll', updateScrollProgress);
            return () => {
                lenis.off('scroll', updateScrollProgress);
                if (rafId !== null) cancelAnimationFrame(rafId);
            };
        }

        window.addEventListener('scroll', updateScrollProgress, { passive: true });
        return () => {
            window.removeEventListener('scroll', updateScrollProgress);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div
            ref={barRef}
            className="fixed top-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-primary-500 via-secondary-500 to-orange-500 z-50"
        />
    );
}

'use client';

import { useEffect, useRef } from 'react';

export default function ScrollProgress() {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let rafId: number | null = null;

        const updateScrollProgress = () => {
            if (rafId !== null) return;

            rafId = requestAnimationFrame(() => {
                const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                if (windowHeight > 0 && barRef.current) {
                    const progress = (window.scrollY / windowHeight) * 100;
                    barRef.current.style.transform = `scaleX(${progress / 100})`;
                }
                rafId = null;
            });
        };

        updateScrollProgress();
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

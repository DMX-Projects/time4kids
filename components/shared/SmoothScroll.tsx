'use client';

import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

const SmoothScroll = () => {
    useEffect(() => {
        const hasTouch =
            typeof window !== 'undefined' &&
            (navigator.maxTouchPoints > 0 ||
                ((navigator as unknown as { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0 ||
                'ontouchstart' in window);
        if (hasTouch) {
            document.documentElement.style.scrollBehavior = 'smooth';
            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.scrollBehavior = 'smooth';
            return;
        }

        const html = document.documentElement;
        const originalScrollBehavior = html.style.scrollBehavior;
        // Must override globals.css `scroll-behavior: smooth` while Lenis runs — mixing both causes wheel jitter.
        html.style.scrollBehavior = 'auto';

        const lenis = new Lenis({
            duration: 0.65,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.05,
            touchMultiplier: 1.0,
            infinite: false,
        });

        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        (window as unknown as { lenis: typeof lenis }).lenis = lenis;

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            html.style.scrollBehavior = originalScrollBehavior;
            delete (window as unknown as { lenis?: unknown }).lenis;
        };
    }, []);

    return null;
};

export default SmoothScroll;

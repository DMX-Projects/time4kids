'use client';

import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

const SmoothScroll = () => {
    useEffect(() => {
        // Lenis has known touch-edge crashes on some mobile emulation / older Android UA.
        // For touch-first devices, fall back to native scrolling.
        const hasTouch =
            typeof window !== 'undefined' &&
            (navigator.maxTouchPoints > 0 ||
                (navigator as any).msMaxTouchPoints > 0 ||
                'ontouchstart' in window);
        if (hasTouch) return;

        // Disable CSS smooth scroll when Lenis is active
        const html = document.documentElement;
        const originalScrollBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';

        const lenis = new Lenis({
            duration: 1.0, // Reduced from 1.2 for snappier feel
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8, // Reduce wheel sensitivity for better control
            // Touch disabled (we early-return on touch devices)
            touchMultiplier: 1.0,
            infinite: false,
        });

        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        // Expose lenis instance globally for other components
        (window as any).lenis = lenis;

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            html.style.scrollBehavior = originalScrollBehavior;
            delete (window as any).lenis;
        };
    }, []);

    return null;
};

export default SmoothScroll;

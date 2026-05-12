'use client';

import { useEffect } from 'react';

/** Dispatched when Lenis is attached to `window.lenis` so listeners can switch from native scroll. */
export const LENIS_READY_EVENT = 'lenis-ready';

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
        let cancelled = false;
        let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;
        let rafId: number | null = null;

        void (async () => {
            const { default: Lenis } = await import('@studio-freight/lenis');
            if (cancelled) return;

            html.style.scrollBehavior = 'auto';

            const instance = new Lenis({
                duration: 0.55,
                easing: (t: number) => 1 - Math.pow(1 - t, 3),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 1,
                infinite: false,
            });

            if (cancelled) {
                instance.destroy();
                html.style.scrollBehavior = originalScrollBehavior;
                return;
            }

            lenis = instance;

            const raf = (time: number) => {
                instance.raf(time);
                rafId = requestAnimationFrame(raf);
            };
            rafId = requestAnimationFrame(raf);

            (window as unknown as { lenis: typeof instance }).lenis = instance;
            window.dispatchEvent(new Event(LENIS_READY_EVENT));
        })();

        return () => {
            cancelled = true;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            if (lenis) {
                lenis.destroy();
                lenis = null;
                delete (window as unknown as { lenis?: unknown }).lenis;
            }
            html.style.scrollBehavior = originalScrollBehavior;
        };
    }, []);

    return null;
};

export default SmoothScroll;

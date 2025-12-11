'use client';

import { useEffect, useRef, MutableRefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugin
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface UseGSAPOptions {
    dependencies?: any[];
    scope?: MutableRefObject<HTMLElement | null>;
    revertOnUpdate?: boolean;
}

/**
 * Custom hook for GSAP animations with automatic cleanup
 * @param animationFn - Function containing GSAP animations
 * @param options - Configuration options
 */
export const useGSAP = (
    animationFn: () => void | (() => void),
    options: UseGSAPOptions = {}
) => {
    const { dependencies = [], scope, revertOnUpdate = true } = options;
    const contextRef = useRef<gsap.Context | null>(null);

    useEffect(() => {
        // Create GSAP context for automatic cleanup
        contextRef.current = gsap.context(() => {
            animationFn();
        }, scope?.current || undefined);

        return () => {
            // Cleanup animations when component unmounts
            if (contextRef.current) {
                contextRef.current.revert();
            }
        };
    }, dependencies);

    return contextRef;
};

/**
 * Hook for scroll-triggered animations
 */
export const useScrollTrigger = (
    element: MutableRefObject<HTMLElement | null>,
    options: ScrollTrigger.Vars = {}
) => {
    useEffect(() => {
        if (!element.current) return;

        const trigger = ScrollTrigger.create({
            trigger: element.current,
            start: 'top 80%',
            ...options,
        });

        return () => {
            trigger.kill();
        };
    }, [element, options]);
};

/**
 * Hook for fade-in animation on scroll
 */
export const useFadeInOnScroll = (
    element: MutableRefObject<HTMLElement | null>,
    options = {}
) => {
    useGSAP(() => {
        if (!element.current) return;

        gsap.from(element.current, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: element.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
            ...options,
        });
    }, { dependencies: [element] });
};

/**
 * Hook for stagger animations
 */
export const useStaggerAnimation = (
    elements: MutableRefObject<HTMLElement[] | null>,
    options = {}
) => {
    useGSAP(() => {
        if (!elements.current || elements.current.length === 0) return;

        gsap.from(elements.current, {
            y: 100,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: elements.current[0],
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
            ...options,
        });
    }, { dependencies: [elements] });
};

/**
 * Hook for parallax effect
 */
export const useParallax = (
    element: MutableRefObject<HTMLElement | null>,
    speed = 0.5
) => {
    useGSAP(() => {
        if (!element.current) return;

        gsap.to(element.current, {
            y: () => window.innerHeight * speed,
            ease: 'none',
            scrollTrigger: {
                trigger: element.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });
    }, { dependencies: [element, speed] });
};

export default useGSAP;

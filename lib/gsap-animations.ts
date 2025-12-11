import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Draggable } from 'gsap/Draggable';
import { Flip } from 'gsap/Flip';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(
        ScrollTrigger,
        ScrollToPlugin,
        Draggable,
        Flip,
        MotionPathPlugin
    );
}

// Animation configurations
export const animationConfig = {
    duration: {
        fast: 0.3,
        normal: 0.6,
        slow: 1,
        verySlow: 1.5,
    },
    ease: {
        smooth: 'power2.out',
        bounce: 'back.out(1.7)',
        elastic: 'elastic.out(1, 0.5)',
        expo: 'expo.out',
    },
    stagger: {
        fast: 0.1,
        normal: 0.2,
        slow: 0.3,
    },
};

// Fade in animation
export const fadeIn = (element: HTMLElement | string, options = {}) => {
    const defaults = {
        y: 50,
        opacity: 0,
        duration: animationConfig.duration.normal,
        ease: animationConfig.ease.smooth,
    };

    return gsap.from(element, { ...defaults, ...options });
};

// Fade in with scroll trigger
export const fadeInOnScroll = (
    element: HTMLElement | string,
    options = {}
) => {
    const defaults = {
        y: 50,
        opacity: 0,
        duration: animationConfig.duration.normal,
        ease: animationConfig.ease.smooth,
        scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
        },
    };

    return gsap.from(element, { ...defaults, ...options });
};

// Stagger animation with scroll trigger
export const staggerFadeIn = (
    elements: HTMLElement[] | string,
    options = {}
) => {
    const defaults = {
        y: 100,
        opacity: 0,
        duration: animationConfig.duration.normal,
        stagger: animationConfig.stagger.normal,
        ease: animationConfig.ease.smooth,
        scrollTrigger: {
            trigger: elements,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
        },
    };

    return gsap.from(elements, { ...defaults, ...options });
};

// Parallax effect
export const parallax = (element: HTMLElement | string, speed = 0.5) => {
    return gsap.to(element, {
        y: () => window.innerHeight * speed,
        ease: 'none',
        scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
    });
};

// Scale in animation
export const scaleIn = (element: HTMLElement | string, options = {}) => {
    const defaults = {
        scale: 0.8,
        opacity: 0,
        duration: animationConfig.duration.normal,
        ease: animationConfig.ease.bounce,
    };

    return gsap.from(element, { ...defaults, ...options });
};

// Slide in from direction
export const slideIn = (
    element: HTMLElement | string,
    direction: 'left' | 'right' | 'top' | 'bottom' = 'left',
    options = {}
) => {
    const directionMap = {
        left: { x: -100 },
        right: { x: 100 },
        top: { y: -100 },
        bottom: { y: 100 },
    };

    const defaults = {
        ...directionMap[direction],
        opacity: 0,
        duration: animationConfig.duration.normal,
        ease: animationConfig.ease.smooth,
    };

    return gsap.from(element, { ...defaults, ...options });
};

// Text reveal animation (split text effect)
export const textReveal = (element: HTMLElement | string, options = {}) => {
    const defaults = {
        y: 100,
        opacity: 0,
        duration: animationConfig.duration.slow,
        ease: animationConfig.ease.expo,
        stagger: 0.05,
    };

    return gsap.from(element, { ...defaults, ...options });
};

// Counter animation
export const animateCounter = (
    element: HTMLElement,
    endValue: number,
    options = {}
) => {
    const obj = { value: 0 };
    const defaults = {
        value: endValue,
        duration: animationConfig.duration.verySlow,
        ease: animationConfig.ease.smooth,
        onUpdate: () => {
            element.textContent = Math.floor(obj.value).toString();
        },
    };

    return gsap.to(obj, { ...defaults, ...options });
};

// Rotate animation
export const rotate = (element: HTMLElement | string, options = {}) => {
    const defaults = {
        rotation: 360,
        duration: animationConfig.duration.verySlow,
        ease: animationConfig.ease.smooth,
    };

    return gsap.to(element, { ...defaults, ...options });
};

// Hover scale effect
export const hoverScale = (element: HTMLElement, scale = 1.05) => {
    element.addEventListener('mouseenter', () => {
        gsap.to(element, {
            scale,
            duration: animationConfig.duration.fast,
            ease: animationConfig.ease.smooth,
        });
    });

    element.addEventListener('mouseleave', () => {
        gsap.to(element, {
            scale: 1,
            duration: animationConfig.duration.fast,
            ease: animationConfig.ease.smooth,
        });
    });
};

// Magnetic effect (element follows cursor)
export const magneticEffect = (
    element: HTMLElement,
    strength = 0.3
) => {
    element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(element, {
            x: x * strength,
            y: y * strength,
            duration: animationConfig.duration.fast,
            ease: animationConfig.ease.smooth,
        });
    });

    element.addEventListener('mouseleave', () => {
        gsap.to(element, {
            x: 0,
            y: 0,
            duration: animationConfig.duration.normal,
            ease: animationConfig.ease.elastic,
        });
    });
};

// Scroll progress indicator
export const scrollProgress = (element: HTMLElement | string) => {
    return gsap.to(element, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
        },
    });
};

// Pin section during scroll
export const pinSection = (element: HTMLElement | string, duration = 1) => {
    return ScrollTrigger.create({
        trigger: element,
        start: 'top top',
        end: `+=${duration * 100}%`,
        pin: true,
        pinSpacing: true,
    });
};

// Batch animations for multiple elements
export const batchAnimation = (
    selector: string,
    animation: (element: HTMLElement) => void
) => {
    ScrollTrigger.batch(selector, {
        onEnter: (elements) => elements.forEach(animation),
        start: 'top 80%',
    });
};

// Cleanup function for ScrollTrigger
export const cleanupScrollTriggers = () => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
};

// Refresh ScrollTrigger (useful after content changes)
export const refreshScrollTrigger = () => {
    ScrollTrigger.refresh();
};

// Check for reduced motion preference
export const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Safe animation wrapper that respects reduced motion
export const safeAnimate = (
    animationFn: () => gsap.core.Tween | gsap.core.Timeline,
    fallback?: () => void
) => {
    if (prefersReducedMotion()) {
        if (fallback) fallback();
        return null;
    }
    return animationFn();
};

export { gsap, ScrollTrigger };

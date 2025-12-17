import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import motionConfig from './motion-config';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Advanced GSAP Animation Utilities
 * Enhanced animations for Skole-style motion
 */

// Floating animation with drift
export const createFloatingAnimation = (
    element: HTMLElement | string,
    config: {
        x?: number[];
        y?: number[];
        rotation?: number[];
        scale?: number[];
        opacity?: number[];
        duration?: number;
        ease?: string;
        delay?: number;
    } = {}
) => {
    const defaults = motionConfig.floatingShapes.drift;
    const settings = { ...defaults, ...config };

    const timeline = gsap.timeline({ repeat: -1, yoyo: true });

    timeline.to(element, {
        x: settings.x?.[1] || defaults.x[1],
        y: settings.y?.[1] || defaults.y[1],
        rotation: settings.rotation?.[1] || defaults.rotate[1],
        scale: settings.scale?.[1] || defaults.scale[1],
        opacity: settings.opacity?.[1] || defaults.opacity[1],
        duration: settings.duration,
        ease: settings.ease,
        delay: settings.delay || 0,
    });

    return timeline;
};

// Scroll-triggered reveal animation
export const createScrollReveal = (
    element: HTMLElement | string,
    animationType: 'fadeUp' | 'cardLeft' | 'cardRight' | 'sectionTitle' = 'fadeUp',
    customConfig?: gsap.TweenVars
) => {
    const config = motionConfig.scrollTrigger[animationType];
    const { start, ...animationProps } = config;

    return gsap.from(element, {
        ...animationProps,
        ...customConfig,
        scrollTrigger: {
            trigger: element,
            start: start || 'top 80%',
            toggleActions: 'play none none none',
        },
    });
};

// Stagger reveal for multiple elements
export const createStaggerReveal = (
    elements: HTMLElement[] | NodeListOf<Element> | string,
    direction: 'up' | 'down' | 'left' | 'right' = 'up',
    customConfig?: gsap.TweenVars
) => {
    const directionMap = {
        up: { y: 60, x: 0 },
        down: { y: -60, x: 0 },
        left: { x: 100, y: 0 },
        right: { x: -100, y: 0 },
    };

    const movement = directionMap[direction];

    return gsap.from(elements, {
        ...movement,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.2)',
        stagger: motionConfig.stagger.normal,
        scrollTrigger: {
            trigger: elements,
            start: 'top 75%',
            toggleActions: 'play none none none',
        },
        ...customConfig,
    });
};

// Micro-interaction: Button hover
export const createButtonHover = (button: HTMLElement) => {
    const hoverTween = gsap.to(button, {
        ...motionConfig.microInteractions.buttonHover,
        paused: true,
    });

    button.addEventListener('mouseenter', () => hoverTween.play());
    button.addEventListener('mouseleave', () => hoverTween.reverse());

    return hoverTween;
};

// Micro-interaction: Icon wobble
export const createIconWobble = (icon: HTMLElement) => {
    const wobbleTween = gsap.to(icon, {
        ...(motionConfig.microInteractions.iconWobble as any),
        paused: true,
    });

    icon.addEventListener('mouseenter', () => wobbleTween.restart());

    return wobbleTween;
};

// CTA Pulse animation
export const createCTAPulse = (element: HTMLElement | string) => {
    return gsap.to(element, motionConfig.microInteractions.ctaPulse as any);
};

// Illustration bobbing animation
export const createBobbingAnimation = (element: HTMLElement | string, customConfig?: gsap.TweenVars) => {
    return gsap.to(element, {
        ...(motionConfig.illustrations.bobbing as any),
        ...customConfig,
    });
};

// Tree/element sway animation
export const createSwayAnimation = (element: HTMLElement | string, customConfig?: gsap.TweenVars) => {
    return gsap.to(element, {
        ...(motionConfig.illustrations.treeSway as any),
        ...customConfig,
    });
};

// Mask-wipe reveal effect
export const createMaskWipe = (
    element: HTMLElement | string,
    shape: 'circle' | 'ellipse' | 'polygon' = 'circle'
) => {
    const shapeMap = {
        circle: {
            from: 'circle(0% at 50% 50%)',
            to: 'circle(100% at 50% 50%)',
        },
        ellipse: {
            from: 'ellipse(0% 0% at 50% 50%)',
            to: 'ellipse(100% 100% at 50% 50%)',
        },
        polygon: {
            from: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        },
    };

    return gsap.fromTo(
        element,
        { clipPath: shapeMap[shape].from },
        {
            clipPath: shapeMap[shape].to,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: element,
                start: 'top 70%',
                toggleActions: 'play none none none',
            },
        }
    );
};

// Hero entrance animation sequence
export const createHeroEntrance = (elements: {
    title?: HTMLElement | string;
    subtitle?: HTMLElement | string;
    description?: HTMLElement | string;
    buttons?: HTMLElement[] | NodeListOf<Element> | string;
    illustration?: HTMLElement | string;
}) => {
    const timeline = gsap.timeline();

    if (elements.title) {
        timeline.from(elements.title, motionConfig.hero.title);
    }

    if (elements.subtitle) {
        timeline.from(elements.subtitle, motionConfig.hero.subtitle, '<0.3');
    }

    if (elements.description) {
        timeline.from(elements.description, motionConfig.hero.description, '<0.2');
    }

    if (elements.buttons) {
        timeline.from(elements.buttons, motionConfig.hero.button, '<0.2');
    }

    if (elements.illustration) {
        timeline.from(elements.illustration, motionConfig.hero.illustration, '<');
    }

    return timeline;
};

// Batch scroll animations for performance
export const batchScrollAnimations = (
    selector: string,
    animationConfig: gsap.TweenVars,
    batchConfig?: ScrollTrigger.BatchVars
) => {
    return ScrollTrigger.batch(selector, {
        onEnter: (batch) => {
            gsap.from(batch, {
                ...animationConfig,
                stagger: motionConfig.stagger.normal,
            });
        },
        start: 'top 80%',
        ...batchConfig,
    });
};

// Parallax scrolling effect
export const createParallaxScroll = (
    element: HTMLElement | string,
    speed: number = 0.5,
    direction: 'vertical' | 'horizontal' = 'vertical'
) => {
    const movement = direction === 'vertical' ? { y: -100 * speed } : { x: -100 * speed };

    return gsap.to(element, {
        ...movement,
        ease: 'none',
        scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
    });
};

// Cleanup all ScrollTriggers
export const cleanupScrollTriggers = () => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
};

// Refresh ScrollTrigger (useful after content changes)
export const refreshScrollTrigger = () => {
    ScrollTrigger.refresh();
};

const gsapAdvanced = {
    createFloatingAnimation,
    createScrollReveal,
    createStaggerReveal,
    createButtonHover,
    createIconWobble,
    createCTAPulse,
    createBobbingAnimation,
    createSwayAnimation,
    createMaskWipe,
    createHeroEntrance,
    batchScrollAnimations,
    createParallaxScroll,
    cleanupScrollTriggers,
    refreshScrollTrigger,
};

export default gsapAdvanced;

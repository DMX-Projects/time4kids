'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface FadeInProps {
    children: ReactNode;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    delay?: number;
    duration?: number;
    className?: string;
}

export default function FadeIn({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.8,
    className = '',
}: FadeInProps) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const directionMap = {
            up: { y: 50 },
            down: { y: -50 },
            left: { x: 50 },
            right: { x: -50 },
            none: {},
        };

        const animation = gsap.from(elementRef.current, {
            ...directionMap[direction],
            opacity: 0,
            duration,
            delay,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: elementRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
        });

        return () => {
            animation.kill();
        };
    }, [direction, delay, duration]);

    return (
        <div ref={elementRef} className={className}>
            {children}
        </div>
    );
}

'use client';

import { useRef, useEffect, ReactNode, Children } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface StaggerGridProps {
    children: ReactNode;
    stagger?: number;
    delay?: number;
    className?: string;
}

export default function StaggerGrid({
    children,
    stagger = 0.2,
    delay = 0,
    className = '',
}: StaggerGridProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const childElements = containerRef.current.children;

        const animation = gsap.from(childElements, {
            y: 100,
            opacity: 0,
            duration: 0.8,
            stagger,
            delay,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
        });

        return () => {
            animation.kill();
        };
    }, [stagger, delay]);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
}

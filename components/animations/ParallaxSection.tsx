'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxSectionProps {
    children: ReactNode;
    speed?: number;
    className?: string;
}

export default function ParallaxSection({
    children,
    speed = 0.5,
    className = '',
}: ParallaxSectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const animation = gsap.to(sectionRef.current, {
            y: () => window.innerHeight * speed,
            ease: 'none',
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });

        return () => {
            animation.kill();
        };
    }, [speed]);

    return (
        <div ref={sectionRef} className={className}>
            {children}
        </div>
    );
}

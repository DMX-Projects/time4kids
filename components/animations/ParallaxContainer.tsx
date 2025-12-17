'use client';

import React, { useRef, useEffect, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxContainerProps {
    children: ReactNode;
    speed?: number;
    className?: string;
}

const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
    children,
    speed = 0.5,
    className = '',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        gsap.to(container, {
            y: () => {
                const scrollY = window.scrollY;
                const containerTop = container.offsetTop;
                return (scrollY - containerTop) * speed;
            },
            ease: 'none',
            scrollTrigger: {
                trigger: container,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [speed]);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
};

export default ParallaxContainer;

'use client';

import React, { useEffect, useRef } from 'react';
import { createScrollReveal, createStaggerReveal } from '@/lib/gsap-advanced';

interface ScrollRevealProps {
    children: React.ReactNode;
    animation?: 'fadeUp' | 'cardLeft' | 'cardRight' | 'sectionTitle';
    stagger?: boolean;
    staggerDirection?: 'up' | 'down' | 'left' | 'right';
    delay?: number;
    className?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    animation = 'fadeUp',
    stagger = false,
    staggerDirection = 'up',
    delay = 0,
    className = '',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            if (stagger) {
                const elements = containerRef.current.children;
                if (elements.length > 0) {
                    createStaggerReveal(elements as any, staggerDirection, { delay });
                }
            } else {
                createScrollReveal(containerRef.current, animation, { delay });
            }
        }
    }, [animation, stagger, staggerDirection, delay]);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
};

export default ScrollReveal;

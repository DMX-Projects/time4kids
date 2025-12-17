'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface MouseFollowerProps {
    count?: number;
    colors?: string[];
}

const MouseFollower: React.FC<MouseFollowerProps> = ({
    count = 5,
    colors = ['#f97316', '#0ea5e9', '#fb923c', '#38bdf8', '#ea580c'],
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const followersRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        // Only show on desktop
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) return;

        const followers = followersRef.current;
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const animateFollowers = () => {
            let currentX = mouseX;
            let currentY = mouseY;

            followers.forEach((follower, index) => {
                if (!follower) return;

                const speed = 0.1 - index * 0.015;
                const rect = follower.getBoundingClientRect();
                const currentFollowerX = rect.left + rect.width / 2;
                const currentFollowerY = rect.top + rect.height / 2;

                currentX += (mouseX - currentFollowerX) * speed;
                currentY += (mouseY - currentFollowerY) * speed;

                gsap.to(follower, {
                    x: currentX,
                    y: currentY,
                    duration: 0.5,
                    ease: 'power2.out',
                });
            });

            requestAnimationFrame(animateFollowers);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animateFollowers();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Don't render on touch devices
    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        return null;
    }

    return (
        <div ref={containerRef} className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    ref={(el) => {
                        if (el) followersRef.current[index] = el;
                    }}
                    className="absolute rounded-full opacity-40 blur-sm"
                    style={{
                        width: `${20 - index * 3}px`,
                        height: `${20 - index * 3}px`,
                        backgroundColor: colors[index % colors.length],
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            ))}
        </div>
    );
};

export default MouseFollower;

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

type CursorState = 'default' | 'hover' | 'click';

const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const cursorDotRef = useRef<HTMLDivElement>(null);
    const [cursorState, setCursorState] = useState<CursorState>('default');
    const mousePos = useRef({ x: 0, y: 0 });
    const cursorPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Only show on desktop devices
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) return;

        const cursor = cursorRef.current;
        const cursorDot = cursorDotRef.current;
        if (!cursor || !cursorDot) return;

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };

        // Smooth cursor animation
        const animateCursor = () => {
            const dx = mousePos.current.x - cursorPos.current.x;
            const dy = mousePos.current.y - cursorPos.current.y;

            cursorPos.current.x += dx * 0.15;
            cursorPos.current.y += dy * 0.15;

            gsap.set(cursor, {
                x: cursorPos.current.x,
                y: cursorPos.current.y,
            });

            gsap.set(cursorDot, {
                x: mousePos.current.x,
                y: mousePos.current.y,
            });

            requestAnimationFrame(animateCursor);
        };

        // Handle hover states
        const handleMouseEnter = () => setCursorState('hover');
        const handleMouseLeave = () => setCursorState('default');
        const handleMouseDown = () => setCursorState('click');
        const handleMouseUp = () => setCursorState('hover');

        // Add listeners to interactive elements
        const interactiveElements = document.querySelectorAll(
            'a, button, input, textarea, select, [role="button"], .cursor-pointer'
        );

        interactiveElements.forEach((el) => {
            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mouseleave', handleMouseLeave);
            el.addEventListener('mousedown', handleMouseDown);
            el.addEventListener('mouseup', handleMouseUp);
        });

        window.addEventListener('mousemove', handleMouseMove);
        animateCursor();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            interactiveElements.forEach((el) => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
                el.removeEventListener('mousedown', handleMouseDown);
                el.removeEventListener('mouseup', handleMouseUp);
            });
        };
    }, []);

    // Don't render on touch devices
    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        return null;
    }

    return (
        <>
            <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>
            {/* Outer cursor ring */}
            <div
                ref={cursorRef}
                className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference"
                style={{ transform: 'translate(-50%, -50%)' }}
            >
                <div
                    className={`rounded-full border-2 border-primary-400 transition-all duration-300 ${cursorState === 'hover'
                            ? 'w-16 h-16 bg-primary-400/20'
                            : cursorState === 'click'
                                ? 'w-12 h-12 bg-primary-500/30'
                                : 'w-12 h-12 bg-transparent'
                        }`}
                />
            </div>

            {/* Inner cursor dot */}
            <div
                ref={cursorDotRef}
                className="pointer-events-none fixed top-0 left-0 z-[9999]"
                style={{ transform: 'translate(-50%, -50%)' }}
            >
                <div
                    className={`rounded-full bg-primary-600 mix-blend-difference transition-all duration-100 ${cursorState === 'click' ? 'w-2 h-2' : 'w-3 h-3'
                        }`}
                />
            </div>
        </>
    );
};

export default CustomCursor;

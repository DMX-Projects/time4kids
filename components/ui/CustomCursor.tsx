'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const cursorInnerRef = useRef<HTMLDivElement>(null);
    const [isPointer, setIsPointer] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isVisible, setIsVisible] = useState(false); // Initially hidden until mouse moves

    useEffect(() => {
        // Only run on client with fine pointer (mouse)
        const isFinePointer = window.matchMedia('(pointer: fine)').matches;
        if (!isFinePointer) return;

        const cursor = cursorRef.current;
        const cursorInner = cursorInnerRef.current;

        if (!cursor || !cursorInner) return;

        // Use gsap.quickTo for performance optimized movement
        const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3.out" });
        const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3.out" });

        // Tilt effect logic
        const rotateTo = gsap.quickTo(cursor, "rotation", { duration: 0.2, ease: "power2.out" });

        let lastX = 0;
        let lastY = 0;
        let rotation = 0; // -15 to 0 (resting)

        const onMouseMove = (e: MouseEvent) => {
            // Make visible on first move
            if (!isVisible) setIsVisible(true);

            // Move cursor
            xTo(e.clientX);
            yTo(e.clientY);

            // Calculate tilt based on movement direction
            const deltaX = e.clientX - lastX;
            // Limit rotation between -30 and 10 degrees based on horizontal speed
            const targetRotation = Math.max(-30, Math.min(10, deltaX * 0.5 - 15));

            rotateTo(targetRotation);

            lastX = e.clientX;
            lastY = e.clientY;

            // Check if hovering over clickable elements
            const target = e.target as HTMLElement;
            const isClickable = window.getComputedStyle(target).cursor === 'pointer' ||
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') !== null ||
                target.closest('button') !== null;

            setIsPointer(isClickable);
        };

        const onMouseDown = () => setIsActive(true);
        const onMouseUp = () => setIsActive(false);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isVisible]);

    useEffect(() => {
        if (!cursorInnerRef.current) return;

        if (isPointer) {
            gsap.to(cursorInnerRef.current, {
                scale: 1.2,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        } else {
            gsap.to(cursorInnerRef.current, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }, [isPointer]);

    useEffect(() => {
        if (!cursorInnerRef.current) return;

        if (isActive) {
            gsap.to(cursorInnerRef.current, {
                scale: 0.8,
                rotation: -10,
                duration: 0.1,
                ease: "power1.out"
            });
        } else {
            gsap.to(cursorInnerRef.current, {
                scale: isPointer ? 1.2 : 1,
                rotation: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }, [isActive, isPointer]);

    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return null;

    return (
        <div
            ref={cursorRef}
            className={`fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-normal ${!isVisible ? 'opacity-0' : 'opacity-100'}`}
            style={{
                willChange: 'transform',
                // Adjusted offset for baby cursor (centering it)
                marginLeft: -20,
                marginTop: -20
            }}
        >
            <div ref={cursorInnerRef} className="origin-center relative drop-shadow-xl">
                {/* Cute Baby SVG */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-md">
                    <circle cx="12" cy="12" r="10" fill="#fecaca" stroke="#f87171" strokeWidth="1.5" />
                    {/* Hair */}
                    <path d="M12 2C9 2 6 4 6 7C6 7 8 5 12 5C16 5 18 7 18 7C18 4 15 2 12 2Z" fill="#78350f" />
                    {/* Eyes */}
                    <circle cx="9" cy="11" r="1.5" fill="#374151" />
                    <circle cx="15" cy="11" r="1.5" fill="#374151" />
                    {/* Cheeks */}
                    <circle cx="7.5" cy="13.5" r="1.5" fill="#fca5a5" opacity="0.6" />
                    <circle cx="16.5" cy="13.5" r="1.5" fill="#fca5a5" opacity="0.6" />
                    {/* Smile - Cute small mouth */}
                    <path d="M10 15C10 15 11 16 12 16C13 16 14 15 14 15" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" />
                    {/* Pacifier handle (optional hint) */}
                </svg>
            </div>
        </div>
    );
};

export default CustomCursor;

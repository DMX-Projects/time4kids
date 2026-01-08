'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Pips component for a single face
const Pips = ({ value }: { value: number }) => {
    // Positions for pips on a 3x3 grid (0, 1, 2)
    const pipMap: Record<number, number[][]> = {
        1: [[1, 1]],
        2: [[0, 0], [2, 2]],
        3: [[0, 0], [1, 1], [2, 2]],
        4: [[0, 0], [0, 2], [2, 0], [2, 2]],
        5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
        6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
    };

    return (
        <div className="relative w-full h-full p-2 grid grid-cols-3 grid-rows-3 gap-0.5 pointer-events-none select-none">
            {/* Render grid to place pips correctly */}
            {[0, 1, 2].map(row => (
                [0, 1, 2].map(col => {
                    const hasPip = pipMap[value]?.some(p => p[0] === row && p[1] === col);
                    return (
                        <div key={`${row}-${col}`} className="flex items-center justify-center">
                            {hasPip && (
                                <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{
                                        background: '#ffffff',
                                        boxShadow: '0 0.5px 1px rgba(0,0,0,0.5), inset 0 0 1px rgba(0,0,0,0.2)'
                                    }}
                                />
                            )}
                        </div>
                    );
                })
            ))}
        </div>
    );
};

// Particle Blast Component
const Blast = ({ x, y }: { x: number, y: number }) => {
    const particles = Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * 360;
        return {
            id: i,
            angle,
            dist: 60 + Math.random() * 50,
            size: 3 + Math.random() * 5,
            color: i % 2 === 0 ? '#111' : '#eee'
        };
    });

    return (
        <div className="fixed pointer-events-none z-[100000]" style={{ left: x, top: y }}>
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                        x: Math.cos(p.angle * Math.PI / 180) * p.dist,
                        y: Math.sin(p.angle * Math.PI / 180) * p.dist,
                        scale: [1, 0],
                        opacity: 0,
                        rotate: Math.random() * 360
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute rounded-sm border border-gray-300 shadow-sm"
                    style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        marginTop: -p.size / 2,
                        marginLeft: -p.size / 2
                    }}
                />
            ))}
        </div>
    );
};

// A solid filler face
const FillerFace = ({ rotateY = 0, rotateX = 0, translateZ, color }: { rotateY?: number, rotateX?: number, translateZ: number, color: string }) => (
    <div
        className="absolute inset-0 w-full h-full"
        style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
            backgroundColor: color,
            backfaceVisibility: 'hidden',
            borderRadius: '8px',
        }}
    />
);

// Solid Core to fill the volume and corners
// This prevents the "hollow" look by ensuring there is matter inside the dice gaps
// Solid Core to fill the volume and corners
// This prevents the "hollow" look by ensuring there is matter inside the dice gaps
const SolidVolume = () => {
    // We create a slightly smaller cube inside to plug the corners
    // Adjusted for 8px border radius
    const size = 47.8;
    const tz = size / 2;
    // Darker red for the core to blend with the face shadows
    const coreColor = '#b91c1c';

    return (
        <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
            <div className="relative" style={{ width: size, height: size, transformStyle: 'preserve-3d' }}>
                <FillerFace translateZ={tz} rotateY={0} color={coreColor} />
                <FillerFace translateZ={tz} rotateY={180} color={coreColor} />
                <FillerFace translateZ={tz} rotateY={90} color={coreColor} />
                <FillerFace translateZ={tz} rotateY={-90} color={coreColor} />
                <FillerFace translateZ={tz} rotateX={90} color={coreColor} />
                <FillerFace translateZ={tz} rotateX={-90} color={coreColor} />
            </div>
        </div>
    );
};

// The Face component
const Face = ({ translateZ, rotateY = 0, rotateX = 0, value }: { translateZ: number, rotateY?: number, rotateX?: number, value: number }) => {
    return (
        <motion.div
            className="absolute inset-0 w-12 h-12 flex items-center justify-center backface-visible"
            style={{
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
                // SOLID, SHARPER PLASTIC LOOK - Not Jelly
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                // Standard rounded corners, distinct shape
                borderRadius: '8px',
                // Sharper highlights for plastic feel
                boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.4), inset -2px -2px 5px rgba(0,0,0,0.2)',
                // Explicitly removed border
                border: 'none',
            }}
        >
            <Pips value={value} />
        </motion.div>
    );
};

export default function DiceCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Rotation state for the cube
    const [targetRotateX, setTargetRotateX] = useState(0);
    const [targetRotateY, setTargetRotateY] = useState(0);

    // Mouse position tracking
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const cursorX = useRef(0);
    const cursorY = useRef(0);

    // Frame loop for smooth position update
    useEffect(() => {
        const moveCursor = () => {
            // Lerp factor - adjusted for solid feel
            const ease = 0.15;

            cursorX.current += (mouseX.current - cursorX.current) * ease;
            cursorY.current += (mouseY.current - cursorY.current) * ease;

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${cursorX.current}px, ${cursorY.current}px, 0)`;
            }

            requestAnimationFrame(moveCursor);
        };
        const animId = requestAnimationFrame(moveCursor);
        return () => cancelAnimationFrame(animId);
    }, []);

    // Event listeners
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            mouseX.current = e.clientX;
            mouseY.current = e.clientY;
        };

        const onMouseDown = (e: MouseEvent) => {
            // Check if interactive
            const target = e.target as HTMLElement;
            const isInteractive = target.closest('a, button, [role="button"], input, select, textarea, .interactive');

            rollDice(isInteractive ? 8 : 4, !!isInteractive);
        };

        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('a, button, [role="button"], input, select, textarea, .interactive')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseover', onMouseOver);

        const showCursor = () => setIsVisible(true);
        document.addEventListener('mousemove', showCursor, { once: true });
        document.addEventListener('mouseenter', showCursor);
        document.addEventListener('mouseleave', () => setIsVisible(false));

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseover', onMouseOver);
            document.removeEventListener('mousemove', showCursor);
            document.removeEventListener('mouseenter', showCursor);
            document.removeEventListener('mouseleave', () => setIsVisible(false));
        };
    }, []);

    // Scroll handling (Tumble effect)
    useEffect(() => {
        let lastScrollY = window.scrollY;
        const onScroll = () => {
            const current = window.scrollY;
            const delta = current - lastScrollY;
            lastScrollY = current;

            // Multiply delta for speed control. 
            setTargetRotateX(prev => prev + delta * 0.4);
            setTargetRotateY(prev => prev + delta * 0.15);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Blast effect state
    const [blasts, setBlasts] = useState<{ id: number, x: number, y: number }[]>([]);

    const triggerBlast = (x: number, y: number) => {
        const id = Date.now();
        setBlasts(prev => [...prev, { id, x, y }]);
        setTimeout(() => {
            setBlasts(prev => prev.filter(b => b.id !== id));
        }, 1000);
    };

    const rollDice = (intensity: number, isInteractive: boolean = false) => {
        const randomX = Math.floor(Math.random() * 4) * 90 + (360 * intensity);
        const randomY = Math.floor(Math.random() * 4) * 90 + (360 * intensity);

        // Snap current rotation to nearest 90 so we always land flat after a click spin
        setTargetRotateX(prev => Math.round(prev / 90) * 90 + randomX);
        setTargetRotateY(prev => Math.round(prev / 90) * 90 + randomY);

        if (isInteractive) {
            triggerBlast(mouseX.current, mouseY.current);
        }
    };

    return (
        <>
            <style jsx global>{`
                body, a, button, [role="button"], input, select, textarea {
                    cursor: none !important;
                }
            `}</style>

            {blasts.map(blast => (
                <Blast key={blast.id} x={blast.x} y={blast.y} />
            ))}

            <div
                ref={cursorRef}
                className="fixed top-0 left-0 pointer-events-none z-[99999]"
                style={{
                    opacity: isVisible ? 1 : 0,
                    marginLeft: -24,
                    marginTop: -24,
                    willChange: 'transform'
                }}
            >
                {/* 3D Scene Wrapper */}
                <div className="relative w-12 h-12" style={{ perspective: '800px' }}>
                    <motion.div
                        className="w-full h-full relative"
                        style={{ transformStyle: 'preserve-3d' }}
                        animate={{
                            rotateX: targetRotateX,
                            rotateY: targetRotateY,
                            scale: isHovering ? 1.15 : 1
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 18,
                            mass: 1.2
                        }}
                    >
                        {/* Solid Volume Core */}
                        <SolidVolume />

                        {/* Define the 6 faces for the cube */}
                        {/* Front: 1 */}
                        <Face translateZ={24} rotateY={0} value={1} />
                        {/* Back: 6 */}
                        <Face translateZ={24} rotateY={180} value={6} />
                        {/* Right: 3 or 4 */}
                        <Face translateZ={24} rotateY={90} value={3} />
                        {/* Left: 4 or 3 */}
                        <Face translateZ={24} rotateY={-90} value={4} />
                        {/* Top: 2 or 5 */}
                        <Face translateZ={24} rotateX={90} value={2} />
                        {/* Bottom: 5 or 2 */}
                        <Face translateZ={24} rotateX={-90} value={5} />
                    </motion.div>
                </div>
            </div>
        </>
    );
}

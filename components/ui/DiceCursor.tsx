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
        <div className="relative w-full h-full p-2 grid grid-cols-3 grid-rows-3 gap-1">
            {/* Render grid to place pips correctly */}
            {[0, 1, 2].map(row => (
                [0, 1, 2].map(col => {
                    const hasPip = pipMap[value]?.some(p => p[0] === row && p[1] === col);
                    return (
                        <div key={`${row}-${col}`} className="flex items-center justify-center">
                            {hasPip && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                        </div>
                    );
                })
            ))}
        </div>
    );
};

export default function DiceCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Rotation state for the cube
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    // Mouse position tracking for smooth movement
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const cursorX = useRef(0);
    const cursorY = useRef(0);

    // Frame loop for smooth position update (better performance than state)
    useEffect(() => {
        const moveCursor = () => {
            // Lerp factor
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

            rollDice(isInteractive ? 8 : 4, !!isInteractive); // More spins if interactive
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

        // Handle visibility separately to avoid re-renders or checks
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

    // Scroll handling
    useEffect(() => {
        let lastScrollY = window.scrollY;
        const onScroll = () => {
            const current = window.scrollY;
            const delta = current - lastScrollY;
            lastScrollY = current;

            // Multiply delta for speed control. 
            // Y axis scroll -> Rotate X axis for tumbling forward/back
            setRotateX(prev => prev + delta * 0.5);
            // Add a bit of twist
            setRotateY(prev => prev + delta * 0.2);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Blast effect state
    const [blasts, setBlasts] = useState<{ id: number, x: number, y: number }[]>([]);

    const triggerBlast = (x: number, y: number) => {
        const id = Date.now();
        setBlasts(prev => [...prev, { id, x, y }]);
        // Cleanup after animation
        setTimeout(() => {
            setBlasts(prev => prev.filter(b => b.id !== id));
        }, 1000);
    };

    const rollDice = (intensity: number, isInteractive: boolean = false) => {
        // Add random rotation (multiples of 90 degrees + some spins)
        // We ensure we land on a face by rounding to nearest 90
        // But to make it look random, we add a lot of full rotations

        const randomX = Math.floor(Math.random() * 4) * 90 + (360 * intensity);
        const randomY = Math.floor(Math.random() * 4) * 90 + (360 * intensity);

        // Snap current rotation to nearest 90 so we always land flat after a click spin
        setRotateX(prev => Math.round(prev / 90) * 90 + randomX);
        setRotateY(prev => Math.round(prev / 90) * 90 + randomY);

        if (isInteractive) {
            triggerBlast(mouseX.current, mouseY.current);
        }
    };

    return (
        <>
            {/* Global style to hide default cursor */}
            <style jsx global>{`
                body, a, button, [role="button"], input {
                    cursor: none !important;
                }
            `}</style>

            {/* Blasts Container */}
            {blasts.map(blast => (
                <Blast key={blast.id} x={blast.x} y={blast.y} />
            ))}

            <div
                ref={cursorRef}
                className="fixed top-0 left-0 pointer-events-none z-[99999]"
                style={{
                    opacity: isVisible ? 1 : 0,
                    // Center the cursor. Assuming 48x48 dim
                    marginLeft: -24,
                    marginTop: -24
                }}
            >
                <div className="relative w-12 h-12" style={{ perspective: '600px' }}>
                    <motion.div
                        className="w-full h-full relative"
                        style={{ transformStyle: 'preserve-3d' } as React.CSSProperties}
                        animate={{
                            rotateX: rotateX,
                            rotateY: rotateY,
                            scale: isHovering ? 1.2 : 1
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 15, // Boucy roll
                            mass: 1
                        }}
                    >
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

// Particle Blast Component
const Blast = ({ x, y }: { x: number, y: number }) => {
    // Generate constant particles for this blast
    // We use a fixed number of particles
    const particles = Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        return {
            id: i,
            angle,
            dist: 60 + Math.random() * 40,
            size: 4 + Math.random() * 4,
            color: i % 2 === 0 ? '#000' : '#FFF' // Black and White confetti
        };
    });

    return (
        <div className="fixed pointer-events-none z-[100000]" style={{ left: x, top: y }}>
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                    animate={{
                        x: Math.cos(p.angle * Math.PI / 180) * p.dist,
                        y: Math.sin(p.angle * Math.PI / 180) * p.dist,
                        scale: 0,
                        opacity: 0
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute rounded-full border border-gray-200"
                    style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        marginTop: -p.size / 2,
                        marginLeft: -p.size / 2
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};

const Face = ({ translateZ, rotateY = 0, rotateX = 0, value }: { translateZ: number, rotateY?: number, rotateX?: number, value: number }) => (
    <motion.div
        className="absolute inset-0 w-12 h-12 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center shadow-sm backface-hidden"
        style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
            backfaceVisibility: 'hidden',
            backgroundColor: '#ffffff'
        } as React.CSSProperties}
    >
        <Pips value={value} />
    </motion.div>
);

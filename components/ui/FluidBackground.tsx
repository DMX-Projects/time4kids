'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const FluidBackground = ({ className }: { className?: string }) => {
    // Scroll progress for parallax effect
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -100]); // Moves slightly up as you scroll down
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

    // Organic blob paths (Closed shapes with same point count for smooth morphing)
    const blobPaths = [
        "M426.6 156.9c25.4 39.4 30.5 91.5 17.1 138.8 -13.4 47.3 -45.1 89.9 -88 111.4 -42.9 21.5 -97.1 21.5 -142 8.7 -44.9 -12.9 -80.7 -38.6 -108.8 -72.1 -28.1 -33.6 -48.4 -75 -47.1 -116.8 1.4 -41.8 24.5 -84.2 62.4 -109.9 37.9 -25.7 90.6 -34.8 135.2 -28 44.6 6.8 81.1 27.5 106.6 66.9Z",
        "M404.7 185.3c19.1 43.1 11.2 96.9 -16.2 136.6 -27.4 39.7 -74.4 65.3 -122.1 72.8 -47.7 7.5 -96.1 -4.1 -129.8 -33.5 -33.7 -29.4 -52.7 -76.6 -52.7 -122.9 0 -46.3 19 -93.5 52.7 -122.9 33.7 -29.4 82.1 -41 129.8 -33.5 47.7 7.5 94.7 33.1 122.1 72.8 5.7 8.3 10.8 17.5 16.2 27.2Z",
        "M389.2 129.7c31.8 33.3 49.3 83.5 41.5 130.8 -7.8 47.3 -40.8 91.7 -88.9 113.1 -48.1 21.4 -109.1 20 -151.7 1.3 -42.6 -18.7 -66.8 -54.7 -83 -98.7 -16.2 -44 -24.4 -95.9 -7.8 -130.8 16.6 -34.9 58.1 -52.8 104.7 -64.7 46.6 -11.9 98.4 -17.8 130.2 13.1 18.2 17.7 37 32.5 55 52Z",
        "M426.6 156.9c25.4 39.4 30.5 91.5 17.1 138.8 -13.4 47.3 -45.1 89.9 -88 111.4 -42.9 21.5 -97.1 21.5 -142 8.7 -44.9 -12.9 -80.7 -38.6 -108.8 -72.1 -28.1 -33.6 -48.4 -75 -47.1 -116.8 1.4 -41.8 24.5 -84.2 62.4 -109.9 37.9 -25.7 90.6 -34.8 135.2 -28 44.6 6.8 81.1 27.5 106.6 66.9Z"
    ];

    return (
        <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
            <motion.div
                style={{ y, rotate }}
                className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] opacity-30 blur-3xl"
            >
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Primary Large Blob */}
                    <svg viewBox="0 0 500 500" className="w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] max-w-[800px] max-h-[800px]">
                        <defs>
                            <linearGradient id="fluidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FBD267" />
                                <stop offset="50%" stopColor="#EF5F5F" />
                                <stop offset="100%" stopColor="#94B64F" />
                            </linearGradient>
                        </defs>
                        <motion.path
                            d={blobPaths[0]}
                            animate={{
                                d: blobPaths,
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "easeInOut",
                                times: [0, 0.33, 0.66, 1]
                            }}
                            fill="url(#fluidGradient)"
                        />
                    </svg>

                    {/* Secondary Floating Elements for Depth */}
                    <motion.div
                        className="absolute top-1/4 right-1/4 w-32 h-32 bg-[#2DD4BF] rounded-full mix-blend-multiply filter blur-xl opacity-60"
                        animate={{
                            x: [0, 50, -50, 0],
                            y: [0, -30, 30, 0],
                            scale: [1, 1.2, 0.9, 1]
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    <motion.div
                        className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-[#3B82F6] rounded-full mix-blend-multiply filter blur-2xl opacity-50"
                        animate={{
                            x: [0, -30, 30, 0],
                            y: [0, 40, -40, 0],
                            scale: [1, 1.1, 0.9, 1]
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default FluidBackground;

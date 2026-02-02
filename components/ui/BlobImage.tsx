'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BlobImageProps {
    src: string;
    alt: string;
    className?: string;
}

const BlobImage = ({ src, alt, className }: BlobImageProps) => {
    return (
        <div className={`relative ${className} flex items-center justify-center group`}>
            {/* 1. Main Rotating Teal Blob Shape */}
            <svg
                viewBox="0 0 500 500"
                className="absolute w-[145%] h-[145%] pointer-events-none z-0"
            >
                <motion.path
                    fill="none"
                    stroke="#3CB7B4"
                    strokeWidth="12"
                    strokeLinecap="round"
                    d="M 250,50 C 350,70 430,150 450,250 C 470,350 390,430 250,450 C 110,430 30,350 50,250 C 70,150 150,70 250,50 Z"
                    style={{ originX: "250px", originY: "250px" }}
                />
            </svg>

            {/* 2. Top Teal Arc */}
            <motion.svg
                className="absolute -top-8 left-12 w-48 h-32 pointer-events-none z-10"
                viewBox="0 0 200 100"
            >
                <path
                    d="M20 80 Q 60 10, 120 50"
                    fill="none"
                    stroke="#3CB7B4"
                    strokeWidth="10"
                    strokeLinecap="round"
                />
            </motion.svg>

            {/* 3. Top Right Orange/Red Dashed Arc */}
            <motion.svg
                className="absolute top-8 right-12 w-36 h-24 pointer-events-none z-10"
                viewBox="0 0 120 80"
                animate={{
                    x: [0, -10, 0],
                    y: [0, 6, 0]
                }}
                transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                }}
            >
                <path
                    d="M10 60 Q 50 10, 100 50"
                    fill="none"
                    stroke="#EF5350"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="12 8"
                />
            </motion.svg>

            {/* 4. Orange Circle */}
            <motion.div
                className="absolute top-24 right-16 w-12 h-12 rounded-full bg-[#FBB03B] z-10"
                animate={{
                    x: [0, 8, 0],
                    y: [0, -6, 0],
                    scale: [1, 1.05, 1]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            />

            {/* 5. Right Middle Teal Arc */}
            <motion.svg
                className="absolute top-32 right-4 w-40 h-36 pointer-events-none z-10"
                viewBox="0 0 140 130"
                animate={{
                    x: [0, -12, 0],
                    y: [0, 10, 0]
                }}
                transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8
                }}
            >
                <path
                    d="M120 30 Q 130 80, 110 120"
                    fill="none"
                    stroke="#3CB7B4"
                    strokeWidth="10"
                    strokeLinecap="round"
                />
            </motion.svg>

            {/* 6. Bottom Left Teal Arc */}
            <motion.svg
                className="absolute -bottom-6 left-2 w-40 h-36 pointer-events-none z-10"
                viewBox="0 0 150 130"
                animate={{
                    x: [0, 10, 0],
                    y: [0, 8, 0]
                }}
                transition={{
                    duration: 5.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.2
                }}
            >
                <path
                    d="M20 20 Q 60 80, 110 110"
                    fill="none"
                    stroke="#3CB7B4"
                    strokeWidth="10"
                    strokeLinecap="round"
                />
            </motion.svg>

            {/* 7. Bottom Right Single Green Curved Line */}
            <motion.svg
                className="absolute bottom-12 right-2 w-32 h-40 pointer-events-none z-10"
                viewBox="0 0 100 150"
                animate={{
                    x: [0, -8, 0],
                    y: [0, 10, 0]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                }}
            >
                <path
                    d="M80 30 Q 90 80, 65 130"
                    fill="none"
                    stroke="#94B64F"
                    strokeWidth="10"
                    strokeLinecap="round"
                />
            </motion.svg>

            {/* 8. Foreground Image (Static Blob Mask) */}
            <div className="relative z-20 w-[75%] h-[75%] md:w-[80%] md:h-[80%] flex items-center justify-center">
                <div
                    className="relative w-full h-full overflow-hidden shadow-2xl bg-white"
                    style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-contain p-4"
                    />
                </div>
            </div>
        </div>
    );
};

export default BlobImage;

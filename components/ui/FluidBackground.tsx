'use client';

import React from 'react';

const FluidBackground = ({ className }: { className?: string }) => {
    return (
        <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
            <div className="absolute top-[-18%] left-[-10%] h-[118%] w-[120%] opacity-25 blur-3xl">
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 500 500" className="w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] max-w-[800px] max-h-[800px]">
                        <defs>
                            <linearGradient id="fluidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FBD267" />
                                <stop offset="50%" stopColor="#EF5F5F" />
                                <stop offset="100%" stopColor="#94B64F" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M426.6 156.9c25.4 39.4 30.5 91.5 17.1 138.8 -13.4 47.3 -45.1 89.9 -88 111.4 -42.9 21.5 -97.1 21.5 -142 8.7 -44.9 -12.9 -80.7 -38.6 -108.8 -72.1 -28.1 -33.6 -48.4 -75 -47.1 -116.8 1.4 -41.8 24.5 -84.2 62.4 -109.9 37.9 -25.7 90.6 -34.8 135.2 -28 44.6 6.8 81.1 27.5 106.6 66.9Z"
                            fill="url(#fluidGradient)"
                        />
                    </svg>

                    <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-[#2DD4BF] rounded-full mix-blend-multiply blur-xl opacity-45" />
                    <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-[#3B82F6] rounded-full mix-blend-multiply blur-2xl opacity-35" />
                </div>
            </div>
        </div>
    );
};

export default FluidBackground;

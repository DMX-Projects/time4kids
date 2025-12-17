'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const BlobBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const blobsRef = useRef<SVGPathElement[]>([]);
    const xSet = useRef<((value: any) => void) | null>(null);
    const ySet = useRef<((value: any) => void) | null>(null);

    useEffect(() => {
        const blobs = blobsRef.current;

        // Animate each blob
        blobs.forEach((blob, index) => {
            if (!blob) return;

            const tl = gsap.timeline({ repeat: -1, yoyo: true });

            // Create morphing animation
            tl.to(blob, {
                attr: {
                    d: getBlobPath(index, true),
                },
                duration: 8 + index * 2,
                ease: 'sine.inOut',
            });
        });

        // Initialize quickSetter
        if (containerRef.current) {
            xSet.current = gsap.quickSetter(containerRef.current, "x", "px");
            ySet.current = gsap.quickSetter(containerRef.current, "y", "px");
        }

        // Mouse move effect using quickSetter for performance
        const handleMouseMove = (e: MouseEvent) => {
            if (!xSet.current || !ySet.current) return;

            const { clientX, clientY } = e;
            const xPercent = (clientX / window.innerWidth - 0.5) * 20;
            const yPercent = (clientY / window.innerHeight - 0.5) * 20;

            xSet.current(xPercent);
            ySet.current(yPercent);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const getBlobPath = (index: number, alternate = false) => {
        const paths = [
            [
                'M40,-65C52.3,-58.7,63.3,-48.8,69.8,-36.4C76.3,-24,78.3,-9.1,75.8,4.9C73.3,18.9,66.3,32,56.1,42.8C45.9,53.6,32.5,62.1,18.3,66.8C4.1,71.5,-10.9,72.4,-24.6,68.3C-38.3,64.2,-50.7,55.1,-59.4,43.2C-68.1,31.3,-73.1,16.6,-72.8,2.2C-72.5,-12.2,-66.9,-26.3,-58.3,-38.6C-49.7,-50.9,-38.1,-61.4,-24.8,-67.2C-11.5,-73,3.5,-74.1,17.3,-70.4C31.1,-66.7,27.7,-72.3,40,-65Z',
                'M43.2,-67.8C55.9,-61.3,66.3,-49.5,72.4,-35.8C78.5,-22.1,80.3,-6.5,77.6,8.1C74.9,22.7,67.7,36.3,57.6,46.9C47.5,57.5,34.5,65.1,20.3,69.8C6.1,74.5,-9.3,76.3,-23.5,73C-37.7,69.7,-50.7,61.3,-60.4,49.7C-70.1,38.1,-76.5,23.3,-77.2,8.2C-77.9,-6.9,-72.9,-22.3,-64.5,-35.2C-56.1,-48.1,-44.3,-58.5,-30.8,-64.4C-17.3,-70.3,-2.1,-71.7,12.5,-69.8C27.1,-67.9,30.5,-74.3,43.2,-67.8Z',
            ],
            [
                'M37.8,-61.5C48.7,-54.3,57.3,-44.2,63.1,-32.4C68.9,-20.6,71.9,-7.1,71.2,6.4C70.5,19.9,66.1,33.4,57.8,43.9C49.5,54.4,37.3,61.9,24.1,65.8C10.9,69.7,-3.3,70,-16.7,66.4C-30.1,62.8,-42.7,55.3,-52.8,45.1C-62.9,34.9,-70.5,22,-72.8,8.2C-75.1,-5.6,-72.1,-20.3,-65.3,-33.2C-58.5,-46.1,-47.9,-57.2,-35.5,-63.8C-23.1,-70.4,-9.2,-72.5,3.1,-68.8C15.4,-65.1,26.9,-68.7,37.8,-61.5Z',
                'M41.3,-64.2C53.2,-57.8,62.5,-46.6,68.7,-33.8C74.9,-21,78,-6.6,76.1,7.2C74.2,21,67.3,34.2,57.5,44.8C47.7,55.4,35,63.4,21.2,67.8C7.4,72.2,-7.5,73,-21.6,69.3C-35.7,65.6,-49,57.4,-59.2,46.4C-69.4,35.4,-76.5,21.6,-77.8,7.1C-79.1,-7.4,-74.6,-22.6,-66.4,-35.3C-58.2,-48,-46.3,-58.2,-33.2,-63.9C-20.1,-69.6,-5.8,-70.8,7.2,-69.5C20.2,-68.2,29.4,-70.6,41.3,-64.2Z',
            ],
        ];

        return alternate ? paths[index % 2][1] : paths[index % 2][0];
    };

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none z-0 opacity-30 will-change-transform"
            aria-hidden="true"
        >
            <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                {/* Blob 1 - Orange */}
                <g transform="translate(30, 30)">
                    <path
                        ref={(el) => {
                            if (el) blobsRef.current[0] = el;
                        }}
                        d={getBlobPath(0)}
                        fill="url(#gradient1)"
                        className="blur-3xl will-change-auto"
                    />
                </g>

                {/* Blob 2 - Blue */}
                <g transform="translate(140, 120)">
                    <path
                        ref={(el) => {
                            if (el) blobsRef.current[1] = el;
                        }}
                        d={getBlobPath(1)}
                        fill="url(#gradient2)"
                        className="blur-3xl will-change-auto"
                    />
                </g>

                <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 0.6 }} />
                        <stop offset="100%" style={{ stopColor: '#fb923c', stopOpacity: 0.3 }} />
                    </linearGradient>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 0.6 }} />
                        <stop offset="100%" style={{ stopColor: '#38bdf8', stopOpacity: 0.3 }} />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default BlobBackground;

'use client';

import React from 'react';

interface WaveBackgroundProps {
    position?: 'top' | 'bottom';
    color?: string;
    opacity?: number;
    className?: string;
}

const WaveBackground: React.FC<WaveBackgroundProps> = ({
    position = 'bottom',
    color = '#f97316',
    opacity = 0.1,
    className = '',
}) => {
    const isTop = position === 'top';

    return (
        <div
            className={`absolute ${isTop ? 'top-0' : 'bottom-0'} left-0 w-full overflow-hidden pointer-events-none ${className}`}
            style={{ height: '150px', opacity }}
        >
            <svg
                className="absolute w-full h-full"
                style={{
                    transform: isTop ? 'rotate(180deg)' : 'none',
                    animation: 'wave-motion 20s ease-in-out infinite',
                }}
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
            >
                <path
                    d="M0,50 C150,80 350,0 600,50 C850,100 1050,20 1200,50 L1200,120 L0,120 Z"
                    fill={color}
                    style={{
                        animation: 'wave-path 15s ease-in-out infinite alternate',
                    }}
                />
            </svg>
            <svg
                className="absolute w-full h-full"
                style={{
                    transform: isTop ? 'rotate(180deg)' : 'none',
                    animation: 'wave-motion 18s ease-in-out infinite reverse',
                    animationDelay: '1s',
                }}
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
            >
                <path
                    d="M0,70 C200,20 400,100 600,70 C800,40 1000,90 1200,70 L1200,120 L0,120 Z"
                    fill={color}
                    opacity="0.5"
                    style={{
                        animation: 'wave-path 12s ease-in-out infinite alternate-reverse',
                    }}
                />
            </svg>
        </div>
    );
};

export default WaveBackground;

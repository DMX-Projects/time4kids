'use client';

import React from 'react';

interface FloatingDotsProps {
    count?: number;
    colors?: string[];
    className?: string;
}

const FloatingDots: React.FC<FloatingDotsProps> = ({
    count = 6,
    colors = ['bg-pink-300', 'bg-blue-300', 'bg-orange-300', 'bg-green-300', 'bg-purple-300', 'bg-yellow-300'],
    className = '',
}) => {
    const dots = Array.from({ length: count }, (_, i) => ({
        id: i,
        size: Math.random() * 40 + 20, // 20-60px
        top: Math.random() * 100,
        left: Math.random() * 100,
        color: colors[i % colors.length],
        delay: Math.random() * 2,
        duration: Math.random() * 2 + 3, // 3-5s
    }));

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {dots.map((dot) => (
                <div
                    key={dot.id}
                    className={`absolute rounded-full ${dot.color} opacity-40 animate-pulse-soft`}
                    style={{
                        width: `${dot.size}px`,
                        height: `${dot.size}px`,
                        top: `${dot.top}%`,
                        left: `${dot.left}%`,
                        animationDelay: `${dot.delay}s`,
                        animationDuration: `${dot.duration}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default FloatingDots;

'use client';

import React from 'react';

interface TwinklingStarsProps {
    count?: number;
    className?: string;
}

const TwinklingStars: React.FC<TwinklingStarsProps> = ({ count = 8, className = '' }) => {
    const stars = Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 0.8 + 0.6, // 0.6-1.4rem (smaller)
        delay: Math.random() * 3,
        opacity: Math.random() * 0.3 + 0.2, // 0.2-0.5 opacity
    }));

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute animate-pulse"
                    style={{
                        top: `${star.top}%`,
                        left: `${star.left}%`,
                        fontSize: `${star.size}rem`,
                        opacity: star.opacity,
                        animationDelay: `${star.delay}s`,
                        animationDuration: '2.5s',
                    }}
                >
                    ⭐
                </div>
            ))}
        </div>
    );
};

export default TwinklingStars;

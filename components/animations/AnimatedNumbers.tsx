'use client';

import React from 'react';

interface AnimatedNumbersProps {
    className?: string;
}

const AnimatedNumbers: React.FC<AnimatedNumbersProps> = ({ className = '' }) => {
    const numbers = ['1', '2', '3', '4', '5'];

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {numbers.map((number, index) => (
                <div
                    key={number}
                    className="absolute text-4xl md:text-5xl font-bold opacity-20"
                    style={{
                        top: `${15 + index * 18}%`,
                        right: `${10 + index * 15}%`,
                        color: ['#f97316', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][index],
                        animation: `move-bounce ${3 + index * 0.5}s ease-in-out infinite`,
                        animationDelay: `${index * 0.3}s`,
                    }}
                >
                    {number}
                </div>
            ))}
        </div>
    );
};

export default AnimatedNumbers;

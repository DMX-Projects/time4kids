'use client';

import React from 'react';

interface AnimatedLettersProps {
    className?: string;
}

const AnimatedLetters: React.FC<AnimatedLettersProps> = ({ className = '' }) => {
    const letters = ['A', 'B', 'C', 'D', 'E'];

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {letters.map((letter, index) => (
                <div
                    key={letter}
                    className="absolute text-2xl md:text-3xl font-bold opacity-5 animate-float"
                    style={{
                        top: `${15 + index * 18}%`,
                        left: index % 2 === 0 ? `${5 + index * 10}%` : `${75 + index * 5}%`,
                        color: ['#f97316', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][index],
                        animationDelay: `${index * 0.7}s`,
                        animationDuration: `${6 + index}s`,
                    }}
                >
                    {letter}
                </div>
            ))}
        </div>
    );
};

export default AnimatedLetters;

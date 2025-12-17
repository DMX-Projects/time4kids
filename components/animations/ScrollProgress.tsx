'use client';

import React, { useEffect, useState } from 'react';

const ScrollProgress = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / documentHeight) * 100;
            setProgress(Math.min(progress, 100));
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial call

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Get color based on progress
    const getColor = () => {
        if (progress < 33) return 'stroke-primary-500';
        if (progress < 66) return 'stroke-secondary-500';
        return 'stroke-green-500';
    };

    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="fixed bottom-8 right-8 z-50 cursor-pointer group">
            <div className="relative w-14 h-14">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        className="stroke-gray-200"
                        strokeWidth="3"
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        className={`${getColor()} transition-all duration-300`}
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Percentage text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-fredoka font-bold text-gray-700">
                        {Math.round(progress)}%
                    </span>
                </div>

                {/* Scroll to top on click */}
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="absolute inset-0 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    aria-label="Scroll to top"
                >
                    <svg
                        className="w-5 h-5 text-primary-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ScrollProgress;

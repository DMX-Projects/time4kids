'use client';

import React from 'react';

interface DecorativeElementsProps {
    variant?: 'dots' | 'shapes' | 'mixed';
    className?: string;
}

const DecorativeElements: React.FC<DecorativeElementsProps> = ({
    variant = 'mixed',
    className = '',
}) => {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Floating colored circles */}
            <div className="absolute top-10 left-10 w-16 h-16 bg-pink-200 rounded-full opacity-50 animate-float" />
            <div className="absolute top-20 right-20 w-12 h-12 bg-blue-200 rounded-full opacity-50 animate-float-slow" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-orange-200 rounded-full opacity-40 animate-pulse-soft" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-10 right-1/3 w-14 h-14 bg-green-200 rounded-full opacity-50 animate-float-rotate" style={{ animationDelay: '1.5s' }} />

            {/* Organic shapes */}
            <div className="absolute top-1/3 right-10 w-24 h-24 bg-purple-100 opacity-30 animate-float organic-shape-1" style={{ animationDelay: '0.8s' }} />
            <div className="absolute bottom-1/3 left-10 w-28 h-28 bg-yellow-100 opacity-30 animate-float-slow organic-shape-2" style={{ animationDelay: '1.2s' }} />

            {/* Small accent dots */}
            <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-pink-300 rounded-full opacity-60 animate-pulse-soft" />
            <div className="absolute top-2/3 right-1/4 w-8 h-8 bg-blue-300 rounded-full opacity-60 animate-pulse-soft" style={{ animationDelay: '0.7s' }} />
            <div className="absolute bottom-1/4 left-2/3 w-5 h-5 bg-orange-300 rounded-full opacity-60 animate-pulse-soft" style={{ animationDelay: '1.3s' }} />
        </div>
    );
};

export default DecorativeElements;

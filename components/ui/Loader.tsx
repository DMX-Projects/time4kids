'use client';

import React from 'react';

export interface LoaderProps {
    /**
     * Size of the loader - 'sm', 'md', 'lg', or custom size
     */
    size?: 'sm' | 'md' | 'lg' | number;
    /**
     * Color variant - 'primary', 'secondary', or custom color
     */
    variant?: 'primary' | 'secondary' | 'white' | string;
    /**
     * Full screen overlay loader
     */
    fullScreen?: boolean;
    /**
     * Custom className for additional styling
     */
    className?: string;
    /**
     * Show text below loader
     */
    text?: string;
}

/**
 * Reusable Loader Component
 * 
 * Easy to customize and change in the future.
 * Supports multiple sizes, variants, and can be used as overlay or inline.
 * 
 * @example
 * // Simple usage
 * <Loader />
 * 
 * @example
 * // Full screen loader
 * <Loader fullScreen text="Loading..." />
 * 
 * @example
 * // Custom size and color
 * <Loader size="lg" variant="primary" />
 */
const Loader: React.FC<LoaderProps> = ({
    size = 'md',
    variant = 'primary',
    fullScreen = false,
    className = '',
    text,
}) => {
    // Size mapping
    const sizeMap = {
        sm: 24,
        md: 40,
        lg: 56,
    };

    const loaderSize = typeof size === 'number' ? size : sizeMap[size];

    // Color mapping
    const colorMap: Record<string, string> = {
        primary: '#f97316', // Orange
        secondary: '#0ea5e9', // Blue
        white: '#ffffff',
    };

    const loaderColor = colorMap[variant] || variant;

    // Base loader styles
    const spinnerStyle: React.CSSProperties = {
        width: loaderSize,
        height: loaderSize,
        border: `3px solid ${loaderColor}20`,
        borderTop: `3px solid ${loaderColor}`,
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite', // Faster spin: 0.8s → 0.6s
    };

    const containerClass = fullScreen
        ? `fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm ${className}`
        : `flex flex-col items-center justify-center ${className}`;

    return (
        <div className={containerClass}>
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <div style={spinnerStyle} />
            {text && (
                <p
                    className={`mt-4 font-fredoka font-semibold ${fullScreen ? 'text-lg' : 'text-sm'}`}
                    style={{ color: loaderColor }}
                >
                    {text}
                </p>
            )}
        </div>
    );
};

export default Loader;


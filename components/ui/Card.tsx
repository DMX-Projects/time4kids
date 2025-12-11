import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = true,
    glass = false
}) => {
    const baseStyles = 'rounded-2xl p-6 transition-all duration-300';
    const hoverStyles = hover ? 'hover:shadow-2xl hover:-translate-y-2' : '';
    const glassStyles = glass ? 'glass' : 'bg-white shadow-lg';

    return (
        <div className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}>
            {children}
        </div>
    );
};

export default Card;

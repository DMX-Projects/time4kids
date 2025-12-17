'use client';

import React, { useEffect, useRef } from 'react';
import { createFloatingAnimation } from '@/lib/gsap-advanced';

interface FloatingShape {
    id: number;
    type: 'circle' | 'blob' | 'squiggle';
    size: number;
    color: string;
    top: number;
    left: number;
    duration: number;
    delay: number;
}

interface FloatingShapesProps {
    count?: number;
    className?: string;
}

const FloatingShapes: React.FC<FloatingShapesProps> = ({ count = 6, className = '' }) => {
    const shapesRef = useRef<(HTMLDivElement | null)[]>([]);

    const colors = React.useMemo(() => [
        'bg-pink-200',
        'bg-blue-200',
        'bg-orange-200',
        'bg-green-200',
        'bg-purple-200',
        'bg-yellow-200',
        'bg-red-200',
        'bg-indigo-200',
    ], []);

    const shapes: FloatingShape[] = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
        id: i,
        type: ['circle', 'blob', 'squiggle'][Math.floor(Math.random() * 3)] as 'circle' | 'blob' | 'squiggle',
        size: Math.random() * 40 + 20, // 20-60px (smaller)
        color: colors[i % colors.length],
        top: Math.random() * 100,
        left: Math.random() * 100,
        duration: Math.random() * 5 + 10, // 10-15s (slower)
        delay: Math.random() * 3,
    })), [count, colors]);

    useEffect(() => {
        const timelines: gsap.core.Timeline[] = [];
        shapesRef.current.forEach((shape, index) => {
            if (shape) {
                const shapeData = shapes[index];
                const tl = createFloatingAnimation(shape, {
                    x: [-30, 30] as any,
                    y: [-40, 40] as any,
                    rotation: [-5, 5] as any,
                    scale: [0.95, 1.05] as any,
                    opacity: [0.05, 0.15] as any,
                    duration: shapeData.duration,
                    delay: shapeData.delay,
                });
                timelines.push(tl);
            }
        });

        return () => {
            timelines.forEach(tl => tl.kill());
        };
    }, [shapes]);

    const getShapeClass = (type: string) => {
        switch (type) {
            case 'circle':
                return 'rounded-full';
            case 'blob':
                return 'organic-shape-1';
            case 'squiggle':
                return 'organic-shape-2';
            default:
                return 'rounded-full';
        }
    };

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {shapes.map((shape, index) => (
                <div
                    key={shape.id}
                    ref={(el) => {
                        shapesRef.current[index] = el;
                    }}
                    className={`absolute ${shape.color} ${getShapeClass(shape.type)} opacity-10`}
                    style={{
                        width: `${shape.size}px`,
                        height: `${shape.size}px`,
                        top: `${shape.top}%`,
                        left: `${shape.left}%`,
                    }}
                />
            ))}
        </div>
    );
};

export default FloatingShapes;

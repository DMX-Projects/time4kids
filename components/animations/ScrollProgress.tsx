'use client';

import { useEffect, useState } from 'react';

export default function ScrollProgress() {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const updateScrollProgress = () => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (windowHeight === 0) return;

            const scrolled = window.scrollY;
            const progress = (scrolled / windowHeight) * 100;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', updateScrollProgress);
        return () => window.removeEventListener('scroll', updateScrollProgress);
    }, []);

    return (
        <div
            className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-orange-500 z-50 transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
        />
    );
}

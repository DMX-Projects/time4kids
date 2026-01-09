'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * PageReadyMarker
 * Marks the page as ready immediately for fast loading
 * Optimized to avoid expensive visibility checks
 */
export default function PageReadyMarker() {
    const pathname = usePathname();

    useEffect(() => {
        // Mark page as ready immediately
        const main = document.querySelector('main');

        if (main) {
            main.setAttribute('data-page-ready', 'true');
        }
        document.body.classList.add('page-ready');

        // No need for complex checking - mark ready instantly!
    }, [pathname]);

    return null;
}


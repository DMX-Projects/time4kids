'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * PageReadyMarker
 * Marks the page as ready when content is actually visible
 * Uses immediate content detection instead of fixed delay
 */
export default function PageReadyMarker() {
    const pathname = usePathname();

    useEffect(() => {
        // Reset marker on route change
        const main = document.querySelector('main');
        if (main) {
            main.setAttribute('data-page-ready', 'false');
        }
        document.body.classList.remove('page-ready');

        // Function to check if content is actually visible
        const checkContentVisible = (): boolean => {
            if (!main) return false;
            
            // Check if main has visible children
            const children = Array.from(main.children);
            const hasVisibleContent = children.some((child) => {
                const element = child as HTMLElement;
                // Check if element is visible (not hidden, has dimensions, etc.)
                const style = window.getComputedStyle(element);
                return (
                    style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    style.opacity !== '0' &&
                    (element.offsetWidth > 0 || element.offsetHeight > 0)
                );
            });
            
            return hasVisibleContent || main.children.length > 0;
        };

        // Try to mark ready immediately if content is already visible
        const markReady = () => {
            if (main) {
                main.setAttribute('data-page-ready', 'true');
            }
            document.body.classList.add('page-ready');
        };

        // Check immediately
        if (checkContentVisible()) {
            markReady();
            return;
        }

        // If not ready, check periodically (but with shorter intervals)
        let checkCount = 0;
        const maxChecks = 20; // Max 1 second (20 * 50ms)
        
        const checkInterval = setInterval(() => {
            checkCount++;
            
            if (checkContentVisible()) {
                markReady();
                clearInterval(checkInterval);
            } else if (checkCount >= maxChecks) {
                // Timeout - mark as ready anyway (safety)
                markReady();
                clearInterval(checkInterval);
            }
        }, 50); // Check every 50ms

        return () => {
            clearInterval(checkInterval);
        };
    }, [pathname]);

    return null;
}


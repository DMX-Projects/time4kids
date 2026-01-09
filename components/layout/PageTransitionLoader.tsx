'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import MiniLoader from '@/components/ui/MiniLoader';

/**
 * Page Transition Loader
 * Simple fixed timeout - loader disappears after 300ms
 */

const LOADER_ENABLED = true; // Enabled with fixed timeout

export default function PageTransitionLoader() {
    if (!LOADER_ENABLED) {
        return null;
    }

    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const prevPathRef = useRef<string>(pathname);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Hide loader after fixed timeout
    useEffect(() => {
        if (isLoading) {
            // Always hide after 300ms - no complex checking
            timeoutRef.current = setTimeout(() => {
                setIsLoading(false);
            }, 300); // Fixed 300ms timeout

            return () => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            };
        }
    }, [isLoading]);

    // Handle pathname changes
    useEffect(() => {
        const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const prevPath = prevPathRef.current;

        if (currentPath !== prevPath) {
            prevPathRef.current = currentPath;
            setIsLoading(false); // Hide immediately on route change
        }
    }, [pathname, searchParams]);

    // Show loader on link clicks
    useEffect(() => {
        const handleLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a[href]') as HTMLAnchorElement;

            if (!link || !link.href) return;

            try {
                const url = new URL(link.href);
                const currentUrl = new URL(window.location.href);

                const isInternalNav =
                    url.origin === currentUrl.origin &&
                    url.pathname !== currentUrl.pathname &&
                    !link.target;

                if (isInternalNav) {
                    setIsLoading(true);
                }
            } catch (err) {
                // Invalid URL, ignore
            }
        };

        const handlePopState = () => {
            setIsLoading(false);
        };

        document.addEventListener('click', handleLinkClick, true);
        window.addEventListener('popstate', handlePopState);

        return () => {
            document.removeEventListener('click', handleLinkClick, true);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    if (!isLoading) return null;

    return <MiniLoader />;
}


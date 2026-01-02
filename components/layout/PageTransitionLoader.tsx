'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Loader from '@/components/ui/Loader';

/**
 * Page Transition Loader
 * Shows a loader during page navigation transitions
 * Properly synchronized with Next.js App Router navigation and actual page rendering
 */
export default function PageTransitionLoader() {
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const prevPathRef = useRef<string>(pathname);
    const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const observerRef = useRef<MutationObserver | null>(null);
    const navStartTimeRef = useRef<number | null>(null);
    const isNavigatingRef = useRef(false);

    // Check if page content is actually rendered and ready
    const checkPageReady = (): boolean => {
        // Simple check: Just verify main content is mounted
        // This avoids expensive style reflows from getComputedStyle
        const main = document.querySelector('main');
        return !!main;
    };

    // Hide loader when page is ready
    const hideLoaderWhenReady = () => {
        if (!isLoading) return;

        let checkCount = 0;
        const maxChecks = 10; // Max 0.5 seconds (10 * 50ms) - Reduced from 2.5s

        const checkReady = () => {
            checkCount++;

            if (checkPageReady()) {
                // Page is ready, hide loader immediately
                setIsLoading(false);
                isNavigatingRef.current = false;
                navStartTimeRef.current = null;
                return;
            }

            if (checkCount < maxChecks) {
                setTimeout(checkReady, 50);
            } else {
                // Timeout - hide loader anyway
                setIsLoading(false);
                isNavigatingRef.current = false;
                navStartTimeRef.current = null;
            }
        };

        // Start checking
        checkReady();
    };

    // Handle pathname/searchParams changes (route change detected)
    useEffect(() => {
        const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const prevPath = prevPathRef.current;

        if (currentPath !== prevPath) {
            // Route has changed
            prevPathRef.current = currentPath;

            if (isNavigatingRef.current && isLoading) {
                // We were navigating and route changed, now wait for content
                hideLoaderWhenReady();
            } else if (!isNavigatingRef.current) {
                // Route changed but we weren't tracking navigation (e.g., direct URL change, back button)
                // Hide loader immediately to be responsive
                setIsLoading(false);
            }
        }
    }, [pathname, searchParams, isLoading]);

    // Set up navigation detection
    useEffect(() => {
        const handleLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a[href]') as HTMLAnchorElement;

            if (!link || !link.href) return;

            try {
                const url = new URL(link.href);
                const currentUrl = new URL(window.location.href);

                // Only handle internal navigation to different pages
                const isInternalNav =
                    url.origin === currentUrl.origin &&
                    url.pathname !== currentUrl.pathname &&
                    !link.hasAttribute('data-no-loader') &&
                    !link.target &&
                    (link.getAttribute('href')?.startsWith('/') || link.getAttribute('href')?.startsWith(window.location.origin));

                if (isInternalNav) {
                    // Clear existing timeouts
                    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);

                    // Show loader after small delay (avoid flash on instant nav)
                    loadingTimeoutRef.current = setTimeout(() => {
                        // Double-check navigation is still happening
                        if (window.location.pathname === currentUrl.pathname) {
                            setIsLoading(true);
                            isNavigatingRef.current = true;
                            navStartTimeRef.current = Date.now();
                        }
                    }, 50); // Reduced delay
                }
            } catch (err) {
                // Invalid URL, ignore
            }
        };

        // Handle browser back/forward
        const handlePopState = () => {
            setIsLoading(false); // Just hide it on back/forward to be safe and fast
        };

        // Listeners
        document.addEventListener('click', handleLinkClick, true);
        window.addEventListener('popstate', handlePopState);

        return () => {
            if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
            document.removeEventListener('click', handleLinkClick, true);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    if (!isLoading) return null;

    return (
        <Loader
            fullScreen
            size="lg"
            variant="primary"
            text="Loading..."
            className="transition-opacity duration-300 z-[9999]"
        />
    );
}


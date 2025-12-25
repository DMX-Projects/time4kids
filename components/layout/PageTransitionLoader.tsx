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
        const main = document.querySelector('main');
        if (!main) return false;

        // Primary check: data-page-ready attribute (set by PageReadyMarker)
        const pageReadyAttr = main.getAttribute('data-page-ready');
        if (pageReadyAttr === 'true') {
            return true;
        }

        // Check for visible content in main element
        const checkVisibleContent = (): boolean => {
            const children = Array.from(main.children);
            if (children.length === 0) return false;

            // Check if at least one child is visible
            return children.some((child) => {
                const element = child as HTMLElement;
                const style = window.getComputedStyle(element);
                const isVisible = 
                    style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    style.opacity !== '0' &&
                    (element.offsetWidth > 0 || element.offsetHeight > 0);
                
                // Also check if element has text content or images
                const hasContent = 
                    element.textContent?.trim().length > 0 ||
                    element.querySelector('img') !== null ||
                    element.querySelector('svg') !== null;
                
                return isVisible && hasContent;
            });
        };

        // Fallback checks
        const hasVisibleContent = checkVisibleContent();
        const bodyHasReadyClass = document.body.classList.contains('page-ready');
        const mainHasChildren = main.children.length > 0;
        
        // Minimum time check (reduced to 100ms for faster response)
        const minTimeElapsed = navStartTimeRef.current 
            ? Date.now() - navStartTimeRef.current >= 100 
            : true;
        
        // Page is ready if:
        // 1. Has ready attribute/class OR
        // 2. Has visible content AND minimum time elapsed
        return (bodyHasReadyClass || (hasVisibleContent && mainHasChildren)) && minTimeElapsed;
    };

    // Hide loader when page is ready
    const hideLoaderWhenReady = () => {
        if (!isLoading) return;

        let checkCount = 0;
        const maxChecks = 50; // Max 5 seconds (50 * 100ms)

        const checkReady = () => {
            checkCount++;
            
            if (checkPageReady()) {
                // Page is ready, hide loader immediately
                setIsLoading(false);
                isNavigatingRef.current = false;
                navStartTimeRef.current = null;
                
                if (observerRef.current) {
                    observerRef.current.disconnect();
                    observerRef.current = null;
                }
                return;
            }

            if (checkCount < maxChecks) {
                // Check again with shorter interval for faster detection
                setTimeout(checkReady, 50); // Reduced from 100ms to 50ms
            } else {
                // Timeout - hide loader anyway (safety net)
                setIsLoading(false);
                isNavigatingRef.current = false;
                navStartTimeRef.current = null;
                if (observerRef.current) {
                    observerRef.current.disconnect();
                    observerRef.current = null;
                }
            }
        };

        // Start checking
        checkReady();

        // Also observe DOM changes for faster detection
        if (!observerRef.current) {
            observerRef.current = new MutationObserver(() => {
                if (checkPageReady()) {
                    setIsLoading(false);
                    isNavigatingRef.current = false;
                    navStartTimeRef.current = null;
                    observerRef.current?.disconnect();
                    observerRef.current = null;
                }
            });

            observerRef.current.observe(document.body, {
                childList: true,
                subtree: true,
            });
        }
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
                // Start checking immediately (don't wait)
                hideLoaderWhenReady();
            } else if (!isNavigatingRef.current) {
                // Route changed but we weren't tracking navigation (e.g., direct URL change, back button)
                // Immediately check if page is ready (might be cached)
                const immediateReady = checkPageReady();
                
                if (!immediateReady) {
                    // Page needs to load
                    setTimeout(() => {
                        if (!checkPageReady()) {
                            setIsLoading(true);
                            isNavigatingRef.current = true;
                            navStartTimeRef.current = Date.now();
                            hideLoaderWhenReady();
                        }
                    }, 50);
                }
                // If immediateReady is true, page is cached - don't show loader
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
                    if (loadingTimeoutRef.current) {
                        clearTimeout(loadingTimeoutRef.current);
                    }
                    if (hideTimeoutRef.current) {
                        clearTimeout(hideTimeoutRef.current);
                    }

                    // Show loader after small delay (avoid flash on instant nav)
                    loadingTimeoutRef.current = setTimeout(() => {
                        // Double-check navigation is still happening
                        if (window.location.pathname === currentUrl.pathname) {
                            setIsLoading(true);
                            isNavigatingRef.current = true;
                            navStartTimeRef.current = Date.now();
                        }
                    }, 80);
                }
            } catch (err) {
                // Invalid URL, ignore
            }
        };

        // Handle browser back/forward
        const handlePopState = () => {
            // Immediately check if page is already ready (cached)
            // If content exists right away, it's cached - don't show loader
            const immediateCheck = checkPageReady();
            
            if (immediateCheck) {
                // Page is cached and ready, don't show loader
                return;
            }
            
            // Page needs to load, show loader
            setTimeout(() => {
                // Double-check it's still not ready
                if (!checkPageReady()) {
                    setIsLoading(true);
                    isNavigatingRef.current = true;
                    navStartTimeRef.current = Date.now();
                    hideLoaderWhenReady();
                }
            }, 50);
        };

        // Listeners
        document.addEventListener('click', handleLinkClick, true);
        window.addEventListener('popstate', handlePopState);

        return () => {
            if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
            }
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
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


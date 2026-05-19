/** Offset for fixed site header (header-top + main nav on desktop; main nav on mobile). */
export const SITE_HEADER_SCROLL_OFFSET = -100;

type LenisLike = {
    scrollTo: (target: Element | string, options?: { offset?: number; duration?: number }) => void;
};

function getLenis(): LenisLike | undefined {
    if (typeof window === 'undefined') return undefined;
    return (window as unknown as { lenis?: LenisLike }).lenis;
}

/**
 * Scrolls to an element id from a hash (e.g. `#nursery`). Returns false if the target is missing.
 */
export function scrollToHashSection(
    hash: string,
    options?: { offset?: number; behavior?: ScrollBehavior },
): boolean {
    if (typeof window === 'undefined') return false;

    const id = decodeURIComponent(hash.replace(/^#/, '')).trim();
    if (!id) return false;

    const el = document.getElementById(id);
    if (!el) return false;

    const offset = options?.offset ?? SITE_HEADER_SCROLL_OFFSET;
    const lenis = getLenis();

    if (lenis) {
        lenis.scrollTo(el, { offset, duration: 0.85 });
    } else {
        const top = el.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({
            top: Math.max(0, top),
            behavior: options?.behavior ?? 'smooth',
        });
    }

    return true;
}

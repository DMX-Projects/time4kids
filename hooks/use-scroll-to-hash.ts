'use client';

import { useEffect } from 'react';
import { scrollToHashSection } from '@/lib/scroll-to-hash';

/**
 * Scrolls to `location.hash` on mount and when the hash changes (after layout settles).
 */
export function useScrollToHash(deps: ReadonlyArray<unknown> = []) {
    useEffect(() => {
        const run = () => {
            const hash = window.location.hash;
            if (!hash) return;
            scrollToHashSection(hash);
        };

        run();
        const t1 = window.setTimeout(run, 120);
        const t2 = window.setTimeout(run, 450);

        window.addEventListener('hashchange', run);
        return () => {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
            window.removeEventListener('hashchange', run);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- caller passes when DOM is ready (e.g. CMS loaded)
    }, deps);
}

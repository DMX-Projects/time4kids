"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api-client";
import {
    CENTRE_PAGE_NAV_CUSTOM_SLUG,
    emptyCentrePageNavCustom,
    parseCentrePageNavCustom,
    type CentrePageNavCustomData,
} from "@/lib/centre-page-nav-custom";

/** Public read of admin CMS centre-page nav (sections, renames, extra links). */
export function useCentrePageNavCustom() {
    const [customNav, setCustomNav] = useState<CentrePageNavCustomData>(emptyCentrePageNavCustom());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await fetch(apiUrl(`/common/page-content/${CENTRE_PAGE_NAV_CUSTOM_SLUG}/`), {
                    cache: "no-store",
                });
                if (!res.ok) throw new Error("load failed");
                const data = await res.json();
                if (!cancelled) setCustomNav(parseCentrePageNavCustom(data));
            } catch {
                if (!cancelled) setCustomNav(emptyCentrePageNavCustom());
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    return { customNav, loading };
}

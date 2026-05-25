"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api-client";
import {
    CENTRE_PAGE_NAV_CUSTOM_SLUG,
    emptyCentrePageNavCustom,
    type CentrePageNavCustomData,
} from "@/lib/centre-page-nav-custom";

function parseCustomNav(raw: unknown): CentrePageNavCustomData {
    if (!raw || typeof raw !== "object") return emptyCentrePageNavCustom();
    const o = raw as Record<string, unknown>;
    return {
        customTopSections: Array.isArray(o.customTopSections)
            ? (o.customTopSections as CentrePageNavCustomData["customTopSections"])
            : [],
        staticExtensions: Array.isArray(o.staticExtensions)
            ? (o.staticExtensions as CentrePageNavCustomData["staticExtensions"])
            : [],
    };
}

/** Public read of admin-added Centre Page sections (for franchise dashboard). */
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
                if (!cancelled) setCustomNav(parseCustomNav(data));
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

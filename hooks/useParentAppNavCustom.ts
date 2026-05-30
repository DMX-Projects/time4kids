"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api-client";
import {
    PARENT_APP_NAV_CUSTOM_SLUG,
    emptyParentAppNavCustom,
    parseParentAppNavCustom,
    type ParentAppNavCustomData,
} from "@/lib/parent-app-nav-custom";

/** Public read of admin CMS parent-app section/slot renames. */
export function useParentAppNavCustom() {
    const [navCustom, setNavCustom] = useState<ParentAppNavCustomData>(emptyParentAppNavCustom());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await fetch(apiUrl(`/common/page-content/${PARENT_APP_NAV_CUSTOM_SLUG}/`), {
                    cache: "no-store",
                });
                if (!res.ok) throw new Error("load failed");
                const data = await res.json();
                if (!cancelled) setNavCustom(parseParentAppNavCustom(data));
            } catch {
                if (!cancelled) setNavCustom(emptyParentAppNavCustom());
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    return { navCustom, loading };
}

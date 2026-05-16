"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiUrl } from "@/lib/api-client";
import { DEFAULT_FOOTER_PAGE_DATA, mergeFooterPageData, type FooterPageData } from "@/config/footer-defaults";

const FooterContentContext = createContext<FooterPageData>(DEFAULT_FOOTER_PAGE_DATA);

export function FooterContentProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<FooterPageData>(DEFAULT_FOOTER_PAGE_DATA);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(apiUrl("/common/page-content/footer/"));
                if (!res.ok) throw new Error("bad status");
                const json = await res.json();
                if (!cancelled) setData(mergeFooterPageData(json));
            } catch {
                if (!cancelled) setData(DEFAULT_FOOTER_PAGE_DATA);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const value = useMemo(() => data, [data]);

    return <FooterContentContext.Provider value={value}>{children}</FooterContentContext.Provider>;
}

export function useFooterContent(): FooterPageData {
    return useContext(FooterContentContext);
}

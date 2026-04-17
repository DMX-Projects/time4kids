"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiUrl } from "@/lib/api-client";
import { DEFAULT_HOME_PAGE_DATA, mergeHomePageData, type HomePageData } from "@/config/home-page-defaults";

const HomePageContentContext = createContext<HomePageData>(DEFAULT_HOME_PAGE_DATA);

export function HomePageContentProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<HomePageData>(DEFAULT_HOME_PAGE_DATA);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(apiUrl("/common/home-page-content/"));
                if (!res.ok) throw new Error("bad status");
                const json = await res.json();
                if (!cancelled) setData(mergeHomePageData(json));
            } catch {
                if (!cancelled) setData(DEFAULT_HOME_PAGE_DATA);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const value = useMemo(() => data, [data]);

    return <HomePageContentContext.Provider value={value}>{children}</HomePageContentContext.Provider>;
}

export function useHomePageContent(): HomePageData {
    return useContext(HomePageContentContext);
}

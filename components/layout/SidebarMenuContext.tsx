"use client";

import React, { createContext, useContext } from "react";

type SidebarMenuContextValue = {
    closeMenu: () => void;
};

const SidebarMenuContext = createContext<SidebarMenuContextValue | undefined>(undefined);

export function SidebarMenuProvider({ closeMenu, children }: { closeMenu: () => void; children: React.ReactNode }) {
    return <SidebarMenuContext.Provider value={{ closeMenu }}>{children}</SidebarMenuContext.Provider>;
}

export function useSidebarMenu() {
    const ctx = useContext(SidebarMenuContext);
    if (!ctx) throw new Error("useSidebarMenu must be used within SidebarMenuProvider");
    return ctx;
}


"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarNav } from "@/components/crm/SidebarNav";

export function CrmLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLogin = pathname?.startsWith("/crm-admin/login");

    if (isLogin) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0 z-10">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
                    <span className="font-bold text-lg text-gray-800">T.I.M.E. Kids CRM</span>
                </div>
                <SidebarNav />
            </aside>
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
                {children}
            </div>
        </div>
    );
}

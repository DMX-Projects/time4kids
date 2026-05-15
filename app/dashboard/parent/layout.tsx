"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { PARENT_SIDEBAR_NAV } from "@/config/parent-sidebar-nav";
import { ParentDataProvider } from "@/components/dashboard/parent/ParentDataProvider";
import { ParentTiKESWelcomeModal } from "@/components/dashboard/parent/ParentTiKESWelcomeModal";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    return (
        <ParentDataProvider>
            <ParentTiKESWelcomeModal />
            <DashboardShell
                role="parent"
                brand={{ initials: "PR", title: "Parent Dashboard", subtitle: "Your child’s school hub", accentClass: "bg-orange-500" }}
                navItems={PARENT_SIDEBAR_NAV}
                themeKey="orange"
            >
                {children}
            </DashboardShell>
        </ParentDataProvider>
    );
}

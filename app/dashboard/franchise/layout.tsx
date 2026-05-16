"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { FRANCHISE_SIDEBAR_NAV } from "@/config/franchise-sidebar-nav";
import { FranchiseDataProvider, useFranchiseData } from "@/components/dashboard/franchise/FranchiseDataProvider";
/** Sidebar/header: show which centre this login belongs to (from GET /franchises/franchise/profile/). */
function FranchiseDashboardShell({ children }: { children: React.ReactNode }) {
    const { profile } = useFranchiseData();
    const name = profile.name?.trim();
    const city = profile.city?.trim();
    const title = name || "Franchise Dashboard";
    const subtitle = city || (name ? "Centre portal" : "Centre overview");

    return (
        <DashboardShell
            role="franchise"
            brand={{ initials: "FR", title, subtitle, accentClass: "bg-[#FFE066]" }}
            navItems={FRANCHISE_SIDEBAR_NAV}
            themeKey="orange"
        >
            {children}
        </DashboardShell>
    );
}

export default function FranchiseLayout({ children }: { children: React.ReactNode }) {
    return (
        <FranchiseDataProvider>
            <FranchiseDashboardShell>{children}</FranchiseDashboardShell>
        </FranchiseDataProvider>
    );
}

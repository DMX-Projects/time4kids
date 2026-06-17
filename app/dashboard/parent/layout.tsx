"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { PARENT_SIDEBAR_NAV } from "@/config/parent-sidebar-nav";
import { ParentChildSwitcher } from "@/components/dashboard/parent/ParentChildSwitcher";
import { ParentDataProvider, useParentData } from "@/components/dashboard/parent/ParentDataProvider";
import { ParentTiKESWelcomeModal } from "@/components/dashboard/parent/ParentTiKESWelcomeModal";

function ParentLayoutShell({ children }: { children: React.ReactNode }) {
    const { selectedStudent, hasMultipleChildren } = useParentData();
    const subtitle =
        hasMultipleChildren && selectedStudent
            ? `${selectedStudent.name}${selectedStudent.grade ? ` · ${selectedStudent.grade}` : ""}`
            : "Your child's school hub";

    return (
        <DashboardShell
            role="parent"
            brand={{
                initials: "PR",
                title: "Parent Dashboard",
                subtitle,
                accentClass: "bg-orange-500",
            }}
            navItems={PARENT_SIDEBAR_NAV}
            themeKey="orange"
            headerExtra={<ParentChildSwitcher />}
        >
            {children}
        </DashboardShell>
    );
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    return (
        <ParentDataProvider>
            <ParentTiKESWelcomeModal />
            <ParentLayoutShell>{children}</ParentLayoutShell>
        </ParentDataProvider>
    );
}

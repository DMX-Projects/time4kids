"use client";

import { LayoutDashboard, ClipboardCheck, FileCheck2 } from "lucide-react";
import { DashboardShell, DashboardNavItem } from "@/components/layout/DashboardShell";

const navItems: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/approver", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Social approvals", href: "/dashboard/approver/updates", icon: <ClipboardCheck className="w-4 h-4" /> },
    { label: "Indent approvals", href: "/dashboard/approver/indents", icon: <FileCheck2 className="w-4 h-4" /> },
];

export default function ApproverLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardShell
            role="approver"
            brand={{
                initials: "AP",
                title: "Approver",
                subtitle: "Head office reviews",
                accentClass: "bg-amber-500",
            }}
            navItems={navItems}
            themeKey="slate"
        >
            {children}
        </DashboardShell>
    );
}

"use client";

import { LayoutDashboard, CalendarRange, ClipboardList, FileText, GraduationCap, Megaphone, School, Settings, UserCircle, Users, Wallet } from "lucide-react";
import { DashboardShell, DashboardNavItem } from "@/components/layout/DashboardShell";
import { FranchiseDataProvider } from "@/components/dashboard/franchise/FranchiseDataProvider";

const navItems: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/franchise", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Profile", href: "/dashboard/franchise/profile", icon: <UserCircle className="w-4 h-4" /> },
    // Legacy flows preserved for quick access
    { label: "Add Parent", href: "/dashboard/franchise/add-parent", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Update Parent", href: "/dashboard/franchise/update-parent", icon: <Settings className="w-4 h-4" /> },
    { label: "Add Grades", href: "/dashboard/franchise/add-grades", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Add Events", href: "/dashboard/franchise/add-events", icon: <CalendarRange className="w-4 h-4" /> },
    { label: "Update Events", href: "/dashboard/franchise/update-events", icon: <CalendarRange className="w-4 h-4" /> },
    { label: "Add Schools", href: "/dashboard/franchise/add-schools", icon: <School className="w-4 h-4" /> },
    { label: "Update Schools", href: "/dashboard/franchise/update-schools", icon: <School className="w-4 h-4" /> },
];

export default function FranchiseLayout({ children }: { children: React.ReactNode }) {
    return (
        <FranchiseDataProvider>
            <DashboardShell
                role="franchise"
                brand={{ initials: "FR", title: "Franchise Dashboard", subtitle: "Centre overview", accentClass: "bg-[#FFE066]" }}
                navItems={navItems}
                themeKey="orange"
            >
                {children}
            </DashboardShell>
        </FranchiseDataProvider>
    );
}

"use client";

import { LayoutDashboard, CalendarRange, ClipboardList, UserCircle, MessageSquare } from "lucide-react";
import { DashboardShell, DashboardNavItem } from "@/components/layout/DashboardShell";
import { FranchiseDataProvider } from "@/components/dashboard/franchise/FranchiseDataProvider";

const navItems: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/franchise", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Parents", href: "/dashboard/franchise/parents", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Enquiries", href: "/dashboard/franchise/enquiries", icon: <MessageSquare className="w-4 h-4" /> },
    { label: "Events", href: "/dashboard/franchise/events", icon: <CalendarRange className="w-4 h-4" /> },
    { label: "Add Grades", href: "/dashboard/franchise/add-grades", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Profile", href: "/dashboard/franchise/profile", icon: <UserCircle className="w-4 h-4" /> },
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

"use client";

import { LayoutDashboard, Building2, CalendarDays, Briefcase, UserCircle, Inbox } from "lucide-react";
import { DashboardShell, DashboardNavItem } from "@/components/layout/DashboardShell";
import { AdminDataProvider } from "@/components/dashboard/admin/AdminDataProvider";

const navItems: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Franchise", href: "/dashboard/admin/manage-franchise", icon: <Building2 className="w-4 h-4" /> },
    { label: "Events", href: "/dashboard/admin/events", icon: <CalendarDays className="w-4 h-4" /> },
    { label: "Careers", href: "/dashboard/admin/careers", icon: <Briefcase className="w-4 h-4" /> },
    { label: "Enquiries", href: "/dashboard/admin/enquiries", icon: <Inbox className="w-4 h-4" /> },
    { label: "Profile", href: "/dashboard/admin/profile", icon: <UserCircle className="w-4 h-4" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminDataProvider>
            <DashboardShell
                role="admin"
                brand={{ initials: "AD", title: "Admin Dashboard", subtitle: "Manage franchises and careers", accentClass: "bg-orange-500" }}
                navItems={navItems}
                themeKey="orange"
            >
                {children}
            </DashboardShell>
        </AdminDataProvider>
    );
}

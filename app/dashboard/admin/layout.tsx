"use client";

import { LayoutDashboard, Building2, CalendarDays, Briefcase, UserCircle, Inbox, Images } from "lucide-react";

import { DashboardShell, DashboardNavItem } from "@/components/layout/DashboardShell";
import { AdminDataProvider } from "@/components/dashboard/admin/AdminDataProvider";

const navItems: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Franchise", href: "/dashboard/admin/manage-franchise", icon: <Building2 className="w-5 h-5" /> },
    { label: "Events", href: "/dashboard/admin/events", icon: <CalendarDays className="w-5 h-5" /> },
    { label: "Careers", href: "/dashboard/admin/careers", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Enquiries", href: "/dashboard/admin/enquiries", icon: <Inbox className="w-5 h-5" /> },
    { label: "Updates", href: "/dashboard/admin/updates", icon: <CalendarDays className="w-5 h-5" /> },
    { label: "Hero Slider", href: "/dashboard/admin/hero-slides", icon: <Images className="w-5 h-5" /> },
    { label: "Profile", href: "/dashboard/admin/profile", icon: <UserCircle className="w-5 h-5" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminDataProvider>
            <DashboardShell
                role="admin"
                brand={{ initials: "AD", title: "Admin Dashboard", accentClass: "bg-orange-500" }}
                navItems={navItems}
                themeKey="orange"
            >
                {children}
            </DashboardShell>
        </AdminDataProvider>
    );
}

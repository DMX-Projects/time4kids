"use client";

import { LayoutDashboard, Briefcase, Settings, FileText, UserCircle, Plus, Inbox } from "lucide-react";
import { DashboardShell, DashboardNavItem } from "@/components/layout/DashboardShell";
import { AdminDataProvider } from "@/components/dashboard/admin/AdminDataProvider";

const navItems: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Add Franchise", href: "/dashboard/admin/add-franchise", icon: <Plus className="w-4 h-4" /> },
    { label: "Manage Franchise", href: "/dashboard/admin/manage-franchise", icon: <Settings className="w-4 h-4" /> },
    { label: "Add Careers", href: "/dashboard/admin/add-careers", icon: <Plus className="w-4 h-4" /> },
    { label: "Update Careers", href: "/dashboard/admin/update-careers", icon: <FileText className="w-4 h-4" /> },
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

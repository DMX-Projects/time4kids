"use client";

import { LayoutDashboard, CalendarDays, CalendarRange, ClipboardList, UserCircle, Image as ImageIcon, MessageSquare, Images, Star, LayoutGrid } from "lucide-react";
import { DashboardShell, DashboardNavItem } from "@/components/layout/DashboardShell";
import { FranchiseDataProvider, useFranchiseData } from "@/components/dashboard/franchise/FranchiseDataProvider";
import { ToastProvider } from "@/components/ui/Toast";

const navItems: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/franchise", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Parent Records", href: "/dashboard/franchise/parents", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Parent portal", href: "/dashboard/franchise/parent-portal", icon: <LayoutGrid className="w-4 h-4" /> },
    { label: "Enquiries", href: "/dashboard/franchise/enquiries", icon: <MessageSquare className="w-4 h-4" /> },
    { label: "Events", href: "/dashboard/franchise/events", icon: <CalendarRange className="w-4 h-4" /> },
    { label: "Event Schedule", href: "/dashboard/franchise/event-schedule", icon: <CalendarDays className="w-4 h-4" /> },
    { label: "Add Grades", href: "/dashboard/franchise/add-grades", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Achievements", href: "/dashboard/franchise/student-achievements", icon: <Star className="w-4 h-4" /> },
    { label: "Home Page Photos", href: "/dashboard/franchise/hero-slider", icon: <ImageIcon className="w-4 h-4" /> },
    { label: "Updates", href: "/dashboard/franchise/updates", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Centre Gallery", href: "/dashboard/franchise/gallery", icon: <Images className="w-4 h-4" /> },
    { label: "Profile", href: "/dashboard/franchise/profile", icon: <UserCircle className="w-4 h-4" /> },
];

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
            navItems={navItems}
            themeKey="orange"
        >
            {children}
        </DashboardShell>
    );
}

export default function FranchiseLayout({ children }: { children: React.ReactNode }) {
    return (
        <FranchiseDataProvider>
            <ToastProvider>
                <FranchiseDashboardShell>{children}</FranchiseDashboardShell>
            </ToastProvider>
        </FranchiseDataProvider>
    );
}

"use client";


import { LayoutDashboard, CalendarRange, ClipboardList, UserCircle, Image as ImageIcon, MessageSquare, Images } from "lucide-react";
import { DashboardShell, DashboardNavItem } from "@/components/layout/DashboardShell";
import { FranchiseDataProvider } from "@/components/dashboard/franchise/FranchiseDataProvider";
import { ToastProvider } from "@/components/ui/Toast";

const navItems: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/franchise", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Parents", href: "/dashboard/franchise/parents", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Enquiries", href: "/dashboard/franchise/enquiries", icon: <MessageSquare className="w-4 h-4" /> },
    { label: "Events", href: "/dashboard/franchise/events", icon: <CalendarRange className="w-4 h-4" /> },
    { label: "Add Grades", href: "/dashboard/franchise/add-grades", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Hero Slider", href: "/dashboard/franchise/hero-slider", icon: <ImageIcon className="w-4 h-4" /> },
    { label: "Updates", href: "/dashboard/franchise/updates", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Gallery", href: "/dashboard/franchise/gallery", icon: <Images className="w-4 h-4" /> },
    { label: "Profile", href: "/dashboard/franchise/profile", icon: <UserCircle className="w-4 h-4" /> },
];

export default function FranchiseLayout({ children }: { children: React.ReactNode }) {
    return (
        <FranchiseDataProvider>
            <ToastProvider>
                <DashboardShell
                    role="franchise"
                    brand={{ initials: "FR", title: "Franchise Dashboard", subtitle: "Centre overview", accentClass: "bg-[#FFE066]" }}
                    navItems={navItems}
                    themeKey="orange"
                >
                    {children}
                </DashboardShell>
            </ToastProvider>
        </FranchiseDataProvider>
    );
}

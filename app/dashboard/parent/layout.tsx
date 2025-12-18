"use client";

import { LayoutDashboard, User, ClipboardList, CalendarRange, CalendarDays, Star, Images, UserCircle } from "lucide-react";
import { DashboardShell, DashboardNavItem } from "@/components/layout/DashboardShell";
import { ParentDataProvider } from "@/components/dashboard/parent/ParentDataProvider";

const navItems: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/parent", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Student Profile", href: "/dashboard/parent/student-profile", icon: <User className="w-4 h-4" /> },
    { label: "Marks / Grades", href: "/dashboard/parent/marks-grades", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Events", href: "/dashboard/parent/events", icon: <CalendarDays className="w-4 h-4" /> },
    { label: "Event Schedule", href: "/dashboard/parent/event-schedule", icon: <CalendarRange className="w-4 h-4" /> },
    { label: "Achievements", href: "/dashboard/parent/achievements", icon: <Star className="w-4 h-4" /> },
    { label: "Event Gallery", href: "/dashboard/parent/event-gallery", icon: <Images className="w-4 h-4" /> },
    { label: "Profile", href: "/dashboard/parent/profile", icon: <UserCircle className="w-4 h-4" /> },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    return (
        <ParentDataProvider>
            <DashboardShell
                role="parent"
                brand={{ initials: "PR", title: "Parent Dashboard", subtitle: "View your child's progress", accentClass: "bg-orange-500" }}
                navItems={navItems}
                themeKey="orange"
            >
                {children}
            </DashboardShell>
        </ParentDataProvider>
    );
}

"use client";

import {
    LayoutDashboard,
    User,
    BookOpen,
    Bell,
    Palmtree,
    Table2,
    Sparkles,
    CreditCard,
    Bus,
    LifeBuoy,
    Settings,
    Calendar,
} from "lucide-react";
import { DashboardShell, DashboardNavItem } from "@/components/layout/DashboardShell";
import { ParentDataProvider } from "@/components/dashboard/parent/ParentDataProvider";

/** Main menu: after My details — homework → settings (single column, aligned in sidebar). */
const navItems: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/parent", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { label: "My details", href: "/dashboard/parent/student-profile", icon: <User className="w-[18px] h-[18px]" /> },
    { label: "Homework", href: "/dashboard/parent/homework", icon: <BookOpen className="w-[18px] h-[18px]" /> },
    { label: "Notifications", href: "/dashboard/parent/notifications", icon: <Bell className="w-[18px] h-[18px]" /> },
    { label: "Timetable", href: "/dashboard/parent/timetable", icon: <Table2 className="w-[18px] h-[18px]" /> },
    { label: "Transport", href: "/dashboard/parent/transport", icon: <Bus className="w-[18px] h-[18px]" /> },
    { label: "Calendar", href: "/dashboard/parent/calendar", icon: <Calendar className="w-[18px] h-[18px]" /> },
    { label: "Showcase", href: "/dashboard/parent/showcase", icon: <Sparkles className="w-[18px] h-[18px]" /> },
    { label: "Fees", href: "/dashboard/parent/fees", icon: <CreditCard className="w-[18px] h-[18px]" /> },
    { label: "Holiday list", href: "/dashboard/parent/holidays", icon: <Palmtree className="w-[18px] h-[18px]" /> },
    { label: "Support", href: "/dashboard/parent/support", icon: <LifeBuoy className="w-[18px] h-[18px]" /> },
    { label: "Settings", href: "/dashboard/parent/settings", icon: <Settings className="w-[18px] h-[18px]" /> },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    return (
        <ParentDataProvider>
            <DashboardShell
                role="parent"
                brand={{ initials: "PR", title: "Parent Dashboard", subtitle: "Your child’s school hub", accentClass: "bg-orange-500" }}
                navItems={navItems}
                themeKey="orange"
            >
                {children}
            </DashboardShell>
        </ParentDataProvider>
    );
}

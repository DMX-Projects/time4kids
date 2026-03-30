"use client";

import {
    LayoutDashboard,
    User,
    ClipboardList,
    CalendarDays,
    Star,
    Images,
    BookOpen,
    Bell,
    Palmtree,
    Table2,
    CalendarCheck,
    Sparkles,
    CreditCard,
    Bus,
    LifeBuoy,
    Settings,
    ScrollText,
} from "lucide-react";
import { DashboardShell, DashboardNavItem } from "@/components/layout/DashboardShell";
import { ParentDataProvider } from "@/components/dashboard/parent/ParentDataProvider";

const navItems: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/parent", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "My details", href: "/dashboard/parent/student-profile", icon: <User className="w-4 h-4" /> },
    { label: "Preschool policies", href: "/dashboard/parent/preschool-policies", icon: <ScrollText className="w-4 h-4" /> },
    { label: "Homework", href: "/dashboard/parent/homework", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Notifications", href: "/dashboard/parent/notifications", icon: <Bell className="w-4 h-4" /> },
    { label: "Timetable", href: "/dashboard/parent/timetable", icon: <Table2 className="w-4 h-4" /> },
    { label: "Holiday list", href: "/dashboard/parent/holidays", icon: <Palmtree className="w-4 h-4" /> },
    { label: "Attendance", href: "/dashboard/parent/attendance", icon: <CalendarCheck className="w-4 h-4" /> },
    { label: "Showcase", href: "/dashboard/parent/showcase", icon: <Sparkles className="w-4 h-4" /> },
    { label: "Fees", href: "/dashboard/parent/fees", icon: <CreditCard className="w-4 h-4" /> },
    { label: "Transport", href: "/dashboard/parent/transport", icon: <Bus className="w-4 h-4" /> },
    { label: "Support", href: "/dashboard/parent/support", icon: <LifeBuoy className="w-4 h-4" /> },
    { label: "Marks / grades", href: "/dashboard/parent/marks-grades", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Events", href: "/dashboard/parent/events", icon: <CalendarDays className="w-4 h-4" /> },
    { label: "Achievements", href: "/dashboard/parent/achievements", icon: <Star className="w-4 h-4" /> },
    { label: "Event gallery", href: "/dashboard/parent/event-gallery", icon: <Images className="w-4 h-4" /> },
    { label: "Settings", href: "/dashboard/parent/settings", icon: <Settings className="w-4 h-4" /> },
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

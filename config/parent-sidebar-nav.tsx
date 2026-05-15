/**
 * Parent dashboard sidebar (`/dashboard/parent/*`).
 *
 * Set ``HIDE_PARENT_SIDEBAR_MAIN_LINKS`` to ``false`` when My details, Homework,
 * and the rest of the main parent menu should appear in the sidebar again.
 */

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
    CalendarCheck,
    FileText,
} from "lucide-react";
import type { DashboardNavItem } from "@/components/layout/DashboardShell";

/** When `true`, hides the main parent portal links (see filter set below). Dashboard + Important documents stay. */
export const HIDE_PARENT_SIDEBAR_MAIN_LINKS = true;

const HIDDEN_WHEN_FLAG: ReadonlySet<string> = new Set([
    "My details",
    "Homework",
    "Notifications",
    "Calendar/Attendance",
    "Timetable",
    "Transport",
    "Showcase",
    "Fees",
    "Holiday list",
    "Support",
    "Settings",
]);

const PARENT_SIDEBAR_NAV_ALL: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/parent", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    {
        label: "Important documents",
        href: "/dashboard/parent#parent-important-documents",
        icon: <FileText className="w-[18px] h-[18px]" />,
    },
    { label: "My details", href: "/dashboard/parent/student-profile", icon: <User className="w-[18px] h-[18px]" /> },
    { label: "Homework", href: "/dashboard/parent/homework", icon: <BookOpen className="w-[18px] h-[18px]" /> },
    { label: "Notifications", href: "/dashboard/parent/notifications", icon: <Bell className="w-[18px] h-[18px]" /> },
    { label: "Calendar/Attendance", href: "/dashboard/parent/attendance", icon: <CalendarCheck className="w-[18px] h-[18px]" /> },
    { label: "Timetable", href: "/dashboard/parent/timetable", icon: <Table2 className="w-[18px] h-[18px]" /> },
    { label: "Transport", href: "/dashboard/parent/transport", icon: <Bus className="w-[18px] h-[18px]" /> },
    { label: "Showcase", href: "/dashboard/parent/showcase", icon: <Sparkles className="w-[18px] h-[18px]" /> },
    { label: "Fees", href: "/dashboard/parent/fees", icon: <CreditCard className="w-[18px] h-[18px]" /> },
    { label: "Holiday list", href: "/dashboard/parent/holidays", icon: <Palmtree className="w-[18px] h-[18px]" /> },
    { label: "Support", href: "/dashboard/parent/support", icon: <LifeBuoy className="w-[18px] h-[18px]" /> },
    { label: "Settings", href: "/dashboard/parent/settings", icon: <Settings className="w-[18px] h-[18px]" /> },
];

export const PARENT_SIDEBAR_NAV: DashboardNavItem[] = HIDE_PARENT_SIDEBAR_MAIN_LINKS
    ? PARENT_SIDEBAR_NAV_ALL.filter((item) => !HIDDEN_WHEN_FLAG.has(item.label))
    : PARENT_SIDEBAR_NAV_ALL;

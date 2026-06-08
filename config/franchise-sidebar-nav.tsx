/**
 * Franchise sidebar — shown on every `/dashboard/franchise/*` route via `layout.tsx`.
 *
 * - Array order = top-to-bottom in the sidebar.
 * - Remove an entry to hide that link everywhere under the franchise dashboard.
 */

import {
    LayoutDashboard,
    ClipboardList,
    UserCircle,
    MessageSquare,
    LayoutGrid,
    GraduationCap,
    LifeBuoy,
} from "lucide-react";
import type { DashboardNavItem } from "@/components/layout/DashboardShell";

export const FRANCHISE_SIDEBAR_NAV: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/franchise/", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Parent Records", href: "/dashboard/franchise/parents/", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Students", href: "/dashboard/franchise/students/", icon: <UserCircle className="w-4 h-4" /> },
    /** Attendance, Event Gallery, parent tickets → tabs inside Parent App (see parent-portal). */
    { label: "Parent App", href: "/dashboard/franchise/parent-portal/", icon: <LayoutGrid className="w-4 h-4" /> },
    { label: "Add Grades", href: "/dashboard/franchise/add-grades/", icon: <GraduationCap className="w-4 h-4" /> },
    { label: "Parent Support", href: "/dashboard/franchise/parent-tickets/", icon: <LifeBuoy className="w-4 h-4" /> },
    { label: "Drivers", href: "/dashboard/franchise/drivers/", icon: <UserCircle className="w-4 h-4" /> },
    { label: "Enquiries", href: "/dashboard/franchise/enquiries/", icon: <MessageSquare className="w-4 h-4" /> },
    { label: "Profile", href: "/dashboard/franchise/profile/", icon: <UserCircle className="w-4 h-4" /> },
];

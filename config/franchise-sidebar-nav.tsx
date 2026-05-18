/**
 * Franchise sidebar — shown on every `/dashboard/franchise/*` route via `layout.tsx`.
 *
 * - Array order = top-to-bottom in the sidebar.
 * - Remove an entry to hide that link everywhere under the franchise dashboard.
 * - Set ``SHOW_FRANCHISE_SIDEBAR_NAV`` to ``true`` when the full sidebar should appear again.
 */

import {
    LayoutDashboard,
    CalendarDays,
    CalendarRange,
    ClipboardList,
    UserCircle,
    Image as ImageIcon,
    MessageSquare,
    Images,
    Star,
    LayoutGrid,
    LifeBuoy,
    FileText,
    FolderUp,
} from "lucide-react";
import type { DashboardNavItem } from "@/components/layout/DashboardShell";

/** Set to `true` to show the franchise left nav again. */
export const SHOW_FRANCHISE_SIDEBAR_NAV = true;

const FRANCHISE_SIDEBAR_NAV_ALL: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/franchise/", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Parent Records", href: "/dashboard/franchise/parents/", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Students", href: "/dashboard/franchise/students/", icon: <UserCircle className="w-4 h-4" /> },
    { label: "Attendance", href: "/dashboard/franchise/attendance/", icon: <CalendarDays className="w-4 h-4" /> },
    { label: "Parent portal", href: "/dashboard/franchise/parent-portal/", icon: <LayoutGrid className="w-4 h-4" /> },
    { label: "Upload centre files", href: "/dashboard/franchise/upload-for-parents/", icon: <FolderUp className="w-4 h-4" /> },
    { label: "Parent documents", href: "/dashboard/franchise/parent-documents/", icon: <FileText className="w-4 h-4" /> },
    { label: "Parent support tickets", href: "/dashboard/franchise/parent-tickets/", icon: <LifeBuoy className="w-4 h-4" /> },
    { label: "Drivers", href: "/dashboard/franchise/drivers/", icon: <UserCircle className="w-4 h-4" /> },
    { label: "Enquiries", href: "/dashboard/franchise/enquiries/", icon: <MessageSquare className="w-4 h-4" /> },
    { label: "Events", href: "/dashboard/franchise/events/", icon: <CalendarRange className="w-4 h-4" /> },
    { label: "Event Schedule", href: "/dashboard/franchise/event-schedule/", icon: <CalendarDays className="w-4 h-4" /> },
    { label: "Add Grades", href: "/dashboard/franchise/add-grades/", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Achievements", href: "/dashboard/franchise/student-achievements/", icon: <Star className="w-4 h-4" /> },
    { label: "Home Page Photos", href: "/dashboard/franchise/hero-slider/", icon: <ImageIcon className="w-4 h-4" /> },
    { label: "Classes Photos", href: "/dashboard/franchise/classes-photos/", icon: <Images className="w-4 h-4" /> },
    { label: "Updates", href: "/dashboard/franchise/updates/", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Centre Gallery", href: "/dashboard/franchise/gallery/", icon: <Images className="w-4 h-4" /> },
    { label: "Profile", href: "/dashboard/franchise/profile/", icon: <UserCircle className="w-4 h-4" /> },
];

export const FRANCHISE_SIDEBAR_NAV: DashboardNavItem[] = SHOW_FRANCHISE_SIDEBAR_NAV ? FRANCHISE_SIDEBAR_NAV_ALL : [];

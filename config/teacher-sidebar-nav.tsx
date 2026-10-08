/**
 * Teacher sidebar — shown on every `/dashboard/teacher/*` route via `layout.tsx`.
 * Teachers manage the parent app for their own class only.
 */

import { GraduationCap, LayoutGrid, Users } from "lucide-react";
import type { DashboardNavItem } from "@/components/layout/DashboardShell";

export const TEACHER_SIDEBAR_NAV: DashboardNavItem[] = [
    { label: "My Class", href: "/dashboard/teacher/", icon: <Users className="w-4 h-4" /> },
    { label: "Parent App", href: "/dashboard/teacher/parent-app/", icon: <LayoutGrid className="w-4 h-4" /> },
    { label: "Add Grades", href: "/dashboard/teacher/add-grades/", icon: <GraduationCap className="w-4 h-4" /> },
];

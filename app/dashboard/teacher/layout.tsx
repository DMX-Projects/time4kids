"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { FranchiseDataProvider } from "@/components/dashboard/franchise/FranchiseDataProvider";
import { TEACHER_SIDEBAR_NAV } from "@/config/teacher-sidebar-nav";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    return (
        <FranchiseDataProvider>
            <DashboardShell
                role="teacher"
                brand={{
                    initials: "TR",
                    title: user?.fullName || "Teacher",
                    subtitle: user?.teacherClass || "Teacher portal",
                }}
                navItems={TEACHER_SIDEBAR_NAV}
                themeKey="sky"
            >
                {children}
            </DashboardShell>
        </FranchiseDataProvider>
    );
}

"use client";

import { CalendarDays, Briefcase, Images, MessageSquareQuote, LayoutTemplate, LayoutList, GraduationCap, HelpCircle, FileText, Star, MapPin } from "lucide-react";

import { DashboardShell, DashboardNavItem } from "@/components/layout/DashboardShell";
import { AdminDataProvider } from "@/components/dashboard/admin/AdminDataProvider";

const navItems: DashboardNavItem[] = [
    { label: "Slider Images", href: "/dashboard/admin/hero-slides", icon: <Images className="w-5 h-5" /> },
    { label: "Media Files", href: "/dashboard/admin/media", icon: <Images className="w-5 h-5" /> },
    { label: "Brochures & Downloads", href: "/dashboard/admin/marketing-assets", icon: <FileText className="w-5 h-5" /> },
    { label: "Home page content", href: "/dashboard/admin/home-content", icon: <LayoutTemplate className="w-5 h-5" /> },
    { label: "Cities (franchise)", href: "/dashboard/admin/locations", icon: <MapPin className="w-5 h-5" /> },
    { label: "Our programs", href: "/dashboard/admin/programs-content", icon: <LayoutList className="w-5 h-5" /> },
    { label: "Admission page content", href: "/dashboard/admin/admission-content", icon: <GraduationCap className="w-5 h-5" /> },
    { label: "FAQ page content", href: "/dashboard/admin/faq-content", icon: <HelpCircle className="w-5 h-5" /> },
    { label: "About page content", href: "/dashboard/admin/about-content", icon: <LayoutTemplate className="w-5 h-5" /> },
    { label: "Careers", href: "/dashboard/admin/careers", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Updates", href: "/dashboard/admin/updates", icon: <CalendarDays className="w-5 h-5" /> },
    { label: "Testimonials", href: "/dashboard/admin/testimonials", icon: <MessageSquareQuote className="w-5 h-5" /> },
    { label: "Centre page documents", href: "/dashboard/admin/franchise-documents", icon: <FileText className="w-5 h-5" /> },
    { label: "Parent app documents", href: "/dashboard/admin/parent-documents", icon: <FileText className="w-5 h-5" /> },
    { label: "Student achievements", href: "/dashboard/admin/student-achievements", icon: <Star className="w-5 h-5" /> },
    { label: "Students kit pages", href: "/dashboard/admin/students-kit-pages", icon: <GraduationCap className="w-5 h-5" /> },
    { label: "Centre class photos", href: "/dashboard/admin/centre-program-cards", icon: <Images className="w-5 h-5" /> },
    { label: "Footer content", href: "/dashboard/admin/footer-content", icon: <LayoutTemplate className="w-5 h-5" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminDataProvider>
            <DashboardShell
                role="admin"
                brand={{ initials: "AD", title: "Admin Dashboard", accentClass: "bg-orange-500" }}
                navItems={navItems}
                themeKey="orange"
            >
                {children}
            </DashboardShell>
        </AdminDataProvider>
    );
}

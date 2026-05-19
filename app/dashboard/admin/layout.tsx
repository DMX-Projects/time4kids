"use client";

import { LayoutDashboard, Building2, CalendarDays, Briefcase, UserCircle, Inbox, Images, MapPin, MessageSquareQuote, LayoutTemplate, LayoutList, BadgeDollarSign, GraduationCap, HelpCircle, FileText, Star } from "lucide-react";

import { DashboardShell, DashboardNavItem } from "@/components/layout/DashboardShell";
import { AdminDataProvider } from "@/components/dashboard/admin/AdminDataProvider";

const navItems: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Slider Images", href: "/dashboard/admin/hero-slides", icon: <Images className="w-5 h-5" /> },
    { label: "Media Files", href: "/dashboard/admin/media", icon: <Images className="w-5 h-5" /> },
    { label: "Centre page documents", href: "/dashboard/admin/franchise-documents", icon: <FileText className="w-5 h-5" /> },
    { label: "Parent app documents", href: "/dashboard/admin/parent-documents", icon: <FileText className="w-5 h-5" /> },
    { label: "Student achievements", href: "/dashboard/admin/student-achievements", icon: <Star className="w-5 h-5" /> },
    { label: "Students kit pages", href: "/dashboard/admin/students-kit-pages", icon: <GraduationCap className="w-5 h-5" /> },
    { label: "Home page content", href: "/dashboard/admin/home-content", icon: <LayoutTemplate className="w-5 h-5" /> },
    { label: "Programs page content", href: "/dashboard/admin/programs-content", icon: <LayoutList className="w-5 h-5" /> },
    { label: "Centre class photos", href: "/dashboard/admin/centre-program-cards", icon: <Images className="w-5 h-5" /> },
    { label: "Franchise page content", href: "/dashboard/admin/franchise-content", icon: <BadgeDollarSign className="w-5 h-5" /> },
    { label: "Admission page content", href: "/dashboard/admin/admission-content", icon: <GraduationCap className="w-5 h-5" /> },
    { label: "FAQ page content", href: "/dashboard/admin/faq-content", icon: <HelpCircle className="w-5 h-5" /> },
    { label: "About page content", href: "/dashboard/admin/about-content", icon: <LayoutTemplate className="w-5 h-5" /> },
    { label: "Footer content", href: "/dashboard/admin/footer-content", icon: <LayoutTemplate className="w-5 h-5" /> },
    { label: "Locations", href: "/dashboard/admin/locations", icon: <MapPin className="w-5 h-5" /> },
    { label: "Franchise", href: "/dashboard/admin/add-franchise", icon: <Building2 className="w-5 h-5" /> },
    { label: "Careers", href: "/dashboard/admin/careers", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Enquiries", href: "/dashboard/admin/enquiries", icon: <Inbox className="w-5 h-5" /> },
    { label: "Landing leads", href: "/leads/all/", icon: <Inbox className="w-5 h-5" /> },
    { label: "Updates", href: "/dashboard/admin/updates", icon: <CalendarDays className="w-5 h-5" /> },
    { label: "Testimonials", href: "/dashboard/admin/testimonials", icon: <MessageSquareQuote className="w-5 h-5" /> },
    { label: "Profile", href: "/dashboard/admin/profile", icon: <UserCircle className="w-5 h-5" /> },
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

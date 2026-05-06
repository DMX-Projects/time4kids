"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Star, X } from "lucide-react";
import { Role, RoleGuard, useAuth } from "@/components/auth/AuthProvider";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { AdminSidebar, FranchiseSidebar, ParentSidebar } from "./SidebarLayout";
import { SidebarMenuProvider } from "./SidebarMenuContext";

export type DashboardNavItem = {
    label: string;
    href: string;
    icon?: ReactNode;
};

type DashboardThemeKey = "slate" | "orange" | "sky" | "emerald";

export type DashboardShellProps = {
    role: Role;
    brand: {
        initials: string;
        title: string;
        subtitle?: string;
        accentClass?: string;
    };
    navItems: DashboardNavItem[];
    children: ReactNode;
    themeKey?: DashboardThemeKey;
};

const navThemes: Record<DashboardThemeKey, { active: string; idle: string }> = {
    slate: {
        active: "bg-slate-900 text-white border-slate-900",
        idle: "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50",
    },
    orange: {
        active: "bg-[#FFF4CC] text-[#1F2937] shadow-sm",
        idle: "text-[#1F2937] hover:bg-[#F8FAFC]",
    },
    sky: {
        active: "bg-[#A5D8FF] text-sky-900 border-[#A5D8FF] shadow-sm",
        idle: "border-sky-100 text-sky-800 hover:border-[#A5D8FF] hover:bg-[#E7F5FF]",
    },
    emerald: {
        active: "bg-[#C0F5E6] text-emerald-900 border-[#C0F5E6] shadow-sm",
        idle: "border-emerald-100 text-emerald-800 hover:border-[#C0F5E6] hover:bg-[#E8FFF7]",
    },
};

export function DashboardShell({ role, brand, navItems, children, themeKey = "slate" }: DashboardShellProps) {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const isAdmin = role === "admin";
    const appliedTheme = isAdmin
        ? { active: "bg-[#FFF4CC] text-[#111827] font-semibold", idle: "text-[#374151] hover:bg-[#F3F4F6]" }
        : navThemes[themeKey];

    const handleLogoutClick = () => setShowLogoutConfirm(true);

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
        // Hard redirect prevents client-side transition stalls in production.
        if (typeof window !== "undefined") {
            window.location.replace("/login/");
            return;
        }
        router.replace("/login/");
    };

    const handleCancelLogout = () => setShowLogoutConfirm(false);

    return (
        <RoleGuard allowedRole={role}>
            <div className="h-screen flex bg-white isolate overflow-hidden">

                <SidebarMenuProvider closeMenu={() => setOpen(false)}>
                    {/* Render role-specific sidebar */}
                    {isAdmin && <AdminSidebar brand={brand} navItems={navItems} open={open} />}
                    {role === "franchise" && <FranchiseSidebar brand={brand} navItems={navItems} open={open} />}
                    {role === "parent" && <ParentSidebar brand={brand} navItems={navItems} open={open} />}
                </SidebarMenuProvider>
                {open && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setOpen(false)} aria-label="Close menu" />}

                <div className="flex-1 flex flex-col min-w-0 relative z-[1] overflow-y-auto bg-slate-50">
                    <header className="sticky top-0 bg-white border-b border-[#E5E7EB] z-30 shadow-sm">
                        <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <button
                                    className="md:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#1F2937] border border-[#E5E7EB] flex-shrink-0"
                                    onClick={() => setOpen((prev) => !prev)}
                                    aria-label="Toggle menu"
                                >
                                    {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    {isAdmin ? (
                                        <>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-[#111827] truncate">{brand.title}</span>
                                                <span className="hidden sm:block text-xs text-[#374151]">System command center</span>
                                            </div>
                                            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF4CC] text-[#111827] text-xs font-semibold">
                                                System Control
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-[#1F2937] truncate">{brand.title}</span>
                                                <span className="hidden sm:block text-xs text-[#4B5563]">Welcome</span>
                                            </div>
                                            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E7EB] text-[#1F2937]">
                                                <Star className="w-4 h-4 text-[#FFA94D]" />
                                                <span className="text-xs font-semibold">{brand.subtitle}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center flex-shrink-0">
                                <button
                                    onClick={handleLogoutClick}
                                    className={`group relative overflow-hidden text-white font-semibold transition-all duration-150 rounded-full shadow-sm px-3 py-2 sm:px-4 ${isAdmin
                                        ? "bg-[#FF922B] hover:brightness-110 active:brightness-90"
                                        : "bg-[#FF922B] hover:shadow-md active:brightness-90"
                                        }`}
                                >
                                    {!isAdmin && <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />}
                                    <span className="relative flex items-center gap-1.5 text-sm">
                                        <LogOut className="w-4 h-4" />
                                        <span className="hidden sm:inline">Logout</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Avoid nested <main> (root layout already wraps app in main). */}
                    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 flex-1 min-w-0 min-h-[50vh] w-full relative z-10 bg-slate-50/90">
                        {children}
                    </div>

                    <Modal isOpen={showLogoutConfirm} onClose={handleCancelLogout} title="Confirm Logout" size="sm">
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">Are you sure you want to logout?</p>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={handleCancelLogout} className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50">
                                    Cancel
                                </Button>
                                <Button onClick={handleConfirmLogout} className="bg-[#FF922B] hover:brightness-105 text-white">
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        </RoleGuard>
    );
}

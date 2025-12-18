"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Star, X } from "lucide-react";
import { Role, RoleGuard, useAuth } from "@/components/auth/AuthProvider";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

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
        subtitle: string;
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
        active: "bg-[#FFF4CC] text-[#1F2937] shadow-none",
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
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const isAdmin = role === "admin";
    const appliedTheme = isAdmin
        ? { active: "bg-[#FFF4CC] text-[#111827] font-semibold", idle: "text-[#374151] hover:bg-[#F3F4F6]" }
        : navThemes[themeKey];

    const handleLogoutClick = () => setShowLogoutConfirm(true);

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
        router.replace("/login");
    };

    const handleCancelLogout = () => setShowLogoutConfirm(false);

    return (
        <RoleGuard allowed={[role]}>
            <div className="min-h-screen flex bg-white">

                <Sidebar
                    brand={brand}
                    items={navItems}
                    open={open}
                    onClose={() => setOpen(false)}
                    theme={appliedTheme}
                    isAdmin={isAdmin}
                />
                {open && <button className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setOpen(false)} aria-label="Close menu" />}

                <div className="flex-1 flex flex-col min-w-0 relative">
                    <header className="bg-white border-b border-[#E5E7EB] relative z-10">
                        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#1F2937] border border-[#E5E7EB]"
                                    onClick={() => setOpen((prev) => !prev)}
                                    aria-label="Toggle menu"
                                >
                                    {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                                <div className="hidden md:flex items-center gap-3">
                                    {isAdmin ? (
                                        <>
                                            <div className="flex flex-col">
                                                <span className="text-base font-semibold text-[#111827]">{brand.title}</span>
                                                <span className="text-sm text-[#374151]">System command center</span>
                                            </div>
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF4CC] text-[#111827] text-xs font-semibold">
                                                System Control
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-[#1F2937]">{brand.title}</span>
                                                <span className="text-xs text-[#4B5563]">Welcome</span>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E7EB] text-[#1F2937]">
                                                <Star className="w-4 h-4 text-[#FFA94D]" />
                                                <span className="text-xs font-semibold">{brand.subtitle}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleLogoutClick}
                                    className={`group relative overflow-hidden text-white border-transparent shadow-sm transition-all duration-150 rounded-full px-4 py-2 text-sm ${
                                        isAdmin ? "bg-[#FF922B] hover:brightness-105" : "bg-[#FF922B] hover:shadow-md hover:translate-y-[1px]"
                                    }`}
                                    style={{ borderRadius: "9999px" }}
                                >
                                    {!isAdmin && <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />}
                                    <span className="relative flex items-center gap-2">
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </header>

                    <main className="container mx-auto px-4 py-8 flex-1 min-w-0 relative z-10">
                        {children}
                    </main>

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

function Sidebar({
    brand,
    items,
    open,
    onClose,
    theme,
    isAdmin,
}: {
    brand: DashboardShellProps["brand"];
    items: DashboardNavItem[];
    open: boolean;
    onClose: () => void;
    theme: { active: string; idle: string };
    isAdmin: boolean;
}) {
    const pathname = usePathname();

    return (
        <aside
            className={`fixed md:static z-40 w-72 md:w-64 bg-white border-r border-[#E5E7EB] h-full transform transition-transform duration-200 ease-out ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
            <div className="px-4 py-5 border-b border-[#E5E7EB] flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-orange-900 bg-[#FFE066]">
                    {brand.initials}
                </div>
                <div>
                    <div className="text-sm font-semibold text-[#1F2937]">{brand.title}</div>
                    <div className="text-xs text-[#4B5563]">{brand.subtitle}
                    </div>
                </div>
            </div>
            <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-160px)]">
                {items.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2 ${isAdmin ? "rounded-md" : "rounded-full"} text-sm transition-colors ${active ? `${theme.active}` : `${theme.idle}`}`}
                        >
                            {item.icon && <span className="w-4 h-4" aria-hidden>{item.icon}</span>}
                            <span className="text-[#1F2937]">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

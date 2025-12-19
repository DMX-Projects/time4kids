"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
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

                {!isAdmin && (
                    <style jsx global>{`
                        @keyframes float-slow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                        @keyframes float-slower { 0%,100% { transform: translateY(0); } 50% { transform: translateY(10px); } }
                        @keyframes float-balloon { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(2deg); } }
                        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
                        .animate-float-slower { animation: float-slower 8s ease-in-out infinite; }
                        .animate-float-balloon { animation: float-balloon 7s ease-in-out infinite; }
                    `}</style>
                )}

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

    const bubbles = !isAdmin;

    return (
        <aside
            className={`fixed md:static z-40 w-72 md:w-64 h-full transform transition-transform duration-200 ease-out ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
            <div className="relative h-full bg-gradient-to-b from-[#FFF9E6] via-[#E7F5FF] to-[#E8FFF7] border-r border-[#E5E7EB] overflow-hidden">
                {bubbles && (
                    <>
                        <div className="absolute -left-6 top-10 w-20 h-20 bg-[#FFE066]/60 blur-3xl rounded-full animate-float-slow" aria-hidden />
                        <div className="absolute right-0 top-1/3 w-16 h-16 bg-[#A5D8FF]/50 blur-3xl rounded-full animate-float-slower" aria-hidden />
                        <div className="absolute -bottom-8 left-10 w-24 h-24 bg-[#C0F5E6]/60 blur-3xl rounded-full animate-float-slow" aria-hidden />
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute left-4 bottom-8 text-4xl opacity-60 animate-float-balloon" aria-hidden>🎈</div>
                            <div className="absolute right-6 top-6 text-3xl opacity-60 animate-float-balloon delay-150" aria-hidden>🎈</div>
                        </div>
                        <div className="absolute -right-8 bottom-6 w-24 h-24 opacity-80 animate-float-slower" aria-hidden>
                            <Image src="https://i.imgur.com/gqug7j8.png" alt="Doraemon" fill className="object-contain" priority />
                        </div>
                        <div className="absolute -left-10 top-40 w-24 h-24 opacity-80 animate-float-slow" aria-hidden>
                            <Image src="https://i.imgur.com/EtKqGQ9.png" alt="Chota Bheem" fill className="object-contain" priority />
                        </div>
                        <div className="absolute right-4 top-1/2 w-20 h-20 opacity-80 animate-float-slow" aria-hidden>
                            <Image src="https://i.imgur.com/37cFJe8.png" alt="Ben 10" fill className="object-contain" priority />
                        </div>
                    </>
                )}

                <div className="relative px-4 py-5 border-b border-[#E5E7EB] flex items-center gap-3 bg-white/70 backdrop-blur">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-orange-900 bg-[#FFE066] shadow-sm">
                        {brand.initials}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-[#1F2937]">{brand.title}</div>
                        <div className="text-xs text-[#4B5563]">{brand.subtitle}</div>
                    </div>
                </div>

                <nav className="relative p-4 space-y-2 overflow-y-auto h-[calc(100%-200px)]">
                    {items.map((item, idx) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch
                                onClick={onClose}
                                className={`group flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-all duration-200 ${
                                    active ? `${theme.active} shadow-[0_8px_24px_-12px_rgba(255,146,43,0.7)] scale-[1.02]` : `${theme.idle} bg-white/70`
                                } ${bubbles ? "border border-white/40 backdrop-blur" : ""}`}
                                style={{ animationDelay: `${idx * 40}ms` }}
                            >
                                {item.icon && <span className="w-4 h-4" aria-hidden>{item.icon}</span>}
                                <span className="text-[#1F2937]">{item.label}</span>
                                {!isAdmin && <span className="ml-auto text-xs text-[#FF922B] opacity-0 group-hover:opacity-100 transition-opacity">→</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { SidebarNav } from "@/components/crm/SidebarNav";
import { hardRefreshCrmDashboard } from "@/lib/crmDashboardFilters";

export function CrmLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
    const isLogin = pathname?.startsWith("/crm-admin/login");
    const isLeadDetail = Boolean(pathname?.match(/\/crm-admin\/leads\//));

    const handleLogout = () => {
        logout();
        router.push("/crm-admin/login");
    };

    React.useEffect(() => {
        setMobileNavOpen(false);
    }, [pathname]);

    if (isLogin) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0 z-10">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
                    <button
                        type="button"
                        onClick={hardRefreshCrmDashboard}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0"
                        title="Refresh CRM dashboard"
                    >
                        <img src="/time-kids-logo-new.png" alt="T.I.M.E. Kids Logo" className="h-8 w-auto object-contain" />
                        <span className="font-bold text-sm text-gray-500 uppercase tracking-wider">CRM</span>
                    </button>
                </div>
                <SidebarNav />
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
                {/* Mobile top bar — keep logout top-right on small screens */}
                <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between px-4 py-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileNavOpen((o) => !o)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                            aria-label="Toggle menu"
                        >
                            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">CRM</span>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700 text-xs font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                    {mobileNavOpen && (
                        <div className="border-t border-gray-100 px-2 pb-3">
                            <Link
                                href="/crm-admin"
                                className="block px-3 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/crm-admin/reports"
                                className="block px-3 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Reports
                            </Link>
                        </div>
                    )}
                </div>

                {/* Lead detail has no CrmDashboard header — keep top-right logout on desktop */}
                {isLeadDetail && (
                    <div className="hidden md:flex items-center justify-end gap-3 px-6 py-3 border-b border-gray-200 bg-white sticky top-0 z-30">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 text-sm font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardNavItem } from "./DashboardShell";

/** Exact match or a real child path (`href/...`), never sibling URLs that only share a string prefix (e.g. /events vs /event-gallery). */
export function isDashboardNavActive(pathname: string, href: string, dashboardRootHref: string): boolean {
    const norm = (s: string) => s.replace(/\/+$/, "") || "/";
    const p = norm(pathname);
    const h = norm(href);
    const root = norm(dashboardRootHref);
    if (p === h) return true;
    if (h === root) return false;
    return p.startsWith(`${h}/`);
}

type SidebarProps = {
    brand: {
        initials: string;
        title: string;
        subtitle?: string;
    };
    navItems: DashboardNavItem[];
    open: boolean;
    onClose: () => void;
};

// ==================== ADMIN SIDEBAR ====================
export function AdminSidebar({ brand, navItems, open, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`fixed md:sticky md:top-0 z-40 w-72 md:w-64 h-screen transform transition-transform duration-200 ease-out ${
                open ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none md:translate-x-0 md:pointer-events-auto"
            }`}
        >
            <div className="h-screen bg-white border-r border-[#E5E7EB] flex flex-col">
                {/* Header */}
                <div className="px-4 py-4 border-b border-[#E5E7EB] flex items-center gap-3 flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[#111827] bg-[#FFF4CC] shadow-sm">
                        {brand.initials}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-[#111827]">{brand.title}</div>
                        {brand.subtitle && <div className="text-xs text-[#6B7280]">{brand.subtitle}</div>}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="px-3 py-3 space-y-1">
                    {navItems.map((item, idx) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch
                                onClick={onClose}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${active
                                    ? "bg-[#FFF4CC] text-[#111827] font-semibold"
                                    : "text-[#374151] hover:bg-[#F3F4F6]"
                                    }`}
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                {item.icon && <span className="w-6 h-6 flex-shrink-0">{item.icon}</span>}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Spacer to push footer to bottom */}
                <div className="flex-1"></div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-[#E5E7EB] flex-shrink-0">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>System Online</span>
                        </div>
                        <div className="text-xs text-[#9CA3AF]">v1.0.0 • Admin Panel</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

// ==================== FRANCHISE SIDEBAR ====================
export function FranchiseSidebar({ brand, navItems, open, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`fixed md:sticky md:top-0 z-40 w-72 md:w-64 h-screen transform transition-transform duration-200 ease-out ${
                open ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none md:translate-x-0 md:pointer-events-auto"
            }`}
        >
            <div className="h-screen bg-white border-r border-[#E5E7EB] flex flex-col">
                {/* Header */}
                <div className="px-4 py-4 border-b border-[#E5E7EB] flex items-center gap-3 flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[#111827] bg-[#FFF4CC] shadow-sm">
                        {brand.initials}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-[#111827]">{brand.title}</div>
                        {brand.subtitle && <div className="text-xs text-[#6B7280]">{brand.subtitle}</div>}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="px-3 py-3 space-y-1 flex-1 min-h-0 overflow-y-auto">
                    {navItems.map((item, idx) => {
                        const active = isDashboardNavActive(pathname, item.href, "/dashboard/franchise");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch
                                onClick={onClose}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${active
                                    ? "bg-[#FFF4CC] text-[#111827] font-semibold"
                                    : "text-[#374151] hover:bg-[#F3F4F6]"
                                    }`}
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                {item.icon && <span className="w-6 h-6 flex-shrink-0">{item.icon}</span>}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}

// ==================== PARENT SIDEBAR ====================
export function ParentSidebar({ brand, navItems, open, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`fixed md:sticky md:top-0 z-40 w-72 md:w-64 h-screen transform transition-transform duration-200 ease-out ${
                open ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none md:translate-x-0 md:pointer-events-auto"
            }`}
        >
            <div className="h-screen bg-white border-r border-[#E5E7EB] flex flex-col">
                {/* Header */}
                <div className="px-4 py-4 border-b border-[#E5E7EB] flex items-center gap-3 flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[#111827] bg-[#FFF4CC] shadow-sm">
                        {brand.initials}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-[#111827]">{brand.title}</div>
                        {brand.subtitle && <div className="text-xs text-[#6B7280]">{brand.subtitle}</div>}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="px-3 py-3 space-y-1 flex-1 min-h-0 overflow-y-auto">
                    {navItems.map((item, idx) => {
                        const active = isDashboardNavActive(pathname, item.href, "/dashboard/parent");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch
                                onClick={onClose}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${active
                                    ? "bg-[#FFF4CC] text-[#111827] font-semibold"
                                    : "text-[#374151] hover:bg-[#F3F4F6]"
                                    }`}
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                {item.icon && <span className="w-6 h-6 flex-shrink-0">{item.icon}</span>}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}

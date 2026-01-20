"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardNavItem } from "./DashboardShell";

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
            className={`fixed md:sticky md:top-0 z-40 w-72 md:w-64 h-screen transform transition-transform duration-200 ease-out ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
            className={`fixed md:sticky md:top-0 z-40 w-72 md:w-64 h-screen transform transition-transform duration-200 ease-out ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">?</span>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-[#1F2937]">Need Help?</div>
                            <div className="text-[10px] text-[#6B7280]">Contact support</div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

// ==================== PARENT SIDEBAR ====================
export function ParentSidebar({ brand, navItems, open, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`fixed md:sticky md:top-0 z-40 w-72 md:w-64 h-screen transform transition-transform duration-200 ease-out ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl border border-orange-100">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">?</span>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-[#1F2937]">Need Help?</div>
                            <div className="text-[10px] text-[#6B7280]">Contact support</div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

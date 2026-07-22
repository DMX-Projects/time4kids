"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PieChart } from "lucide-react";

export function SidebarNav() {
    const pathname = usePathname();

    const isDashboard = pathname === '/crm-admin' || pathname === '/crm-admin/';
    const isReports = pathname?.includes('/reports');

    return (
        <nav className="p-3 space-y-1 flex-1">
            <Link 
                href="/crm-admin" 
                className={`w-full flex items-center px-2.5 py-2 text-sm font-medium rounded-md mb-1 ${isDashboard ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
                <LayoutDashboard className="w-4 h-4 mr-2.5 shrink-0" />
                Dashboard
            </Link>
            <Link 
                href="/crm-admin/reports" 
                className={`w-full flex items-center px-2.5 py-2 text-sm font-medium rounded-md ${isReports ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
                <PieChart className="w-4 h-4 mr-2.5 shrink-0" />
                Reports
            </Link>
        </nav>
    );
}

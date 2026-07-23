"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PieChart } from "lucide-react";
import {
    buildCrmDashboardHref,
    loadCrmDashboardFilters,
    type CrmDashboardFiltersSnapshot,
} from "@/lib/crmDashboardFilters";

function hrefFor(path: "/crm-admin" | "/crm-admin/reports"): string {
    const saved = loadCrmDashboardFilters();
    if (!saved) return path;
    const snapshot: CrmDashboardFiltersSnapshot = {
        ...saved,
        returnPath: path,
    };
    return buildCrmDashboardHref(snapshot);
}

export function SidebarNav() {
    const pathname = usePathname();
    const router = useRouter();

    const isDashboard = pathname === "/crm-admin" || pathname === "/crm-admin/";
    const isReports = Boolean(pathname?.includes("/reports"));

    return (
        <nav className="p-3 space-y-1 flex-1">
            <button
                type="button"
                onClick={() => router.push(hrefFor("/crm-admin"))}
                className={`w-full flex items-center px-2.5 py-2 text-sm font-medium rounded-md mb-1 ${isDashboard ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
            >
                <LayoutDashboard className="w-4 h-4 mr-2.5 shrink-0" />
                Dashboard
            </button>
            <button
                type="button"
                onClick={() => router.push(hrefFor("/crm-admin/reports"))}
                className={`w-full flex items-center px-2.5 py-2 text-sm font-medium rounded-md ${isReports ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
            >
                <PieChart className="w-4 h-4 mr-2.5 shrink-0" />
                Reports
            </button>
        </nav>
    );
}

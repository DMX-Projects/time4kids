"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, PieChart } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { clearCrmDashboardFilters } from "@/lib/crmDashboardFilters";
import { isCampaignExternalViewerEmail } from "@/lib/crmCampaignAccess";

export function SidebarNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const hideReports = isCampaignExternalViewerEmail(user?.email);

    const isDashboard = pathname === "/crm-admin" || pathname === "/crm-admin/";
    const isReports = Boolean(pathname?.includes("/reports"));

    const goFresh = (path: "/crm-admin" | "/crm-admin/reports") => {
        // Always open a clean view — clear saved filters and hard-refresh.
        clearCrmDashboardFilters(path);
        window.location.assign(path);
    };

    return (
        <nav className="p-3 space-y-1 flex-1">
            <button
                type="button"
                onClick={() => goFresh("/crm-admin")}
                className={`w-full flex items-center px-2.5 py-2 text-sm font-medium rounded-md mb-1 ${isDashboard ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
            >
                <LayoutDashboard className="w-4 h-4 mr-2.5 shrink-0" />
                Dashboard
            </button>
            {!hideReports && (
                <button
                    type="button"
                    onClick={() => goFresh("/crm-admin/reports")}
                    className={`w-full flex items-center px-2.5 py-2 text-sm font-medium rounded-md ${isReports ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
                >
                    <PieChart className="w-4 h-4 mr-2.5 shrink-0" />
                    Reports
                </button>
            )}
        </nav>
    );
}

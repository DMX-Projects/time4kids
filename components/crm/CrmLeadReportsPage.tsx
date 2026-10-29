"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AccessLoading } from "@/components/auth/AccessLoading";
import { normalizeRole, useAuth } from "@/components/auth/AuthProvider";
import SuperAdminLeadReport from "@/components/crm/admin/SuperAdminLeadReport";
import { isCrmSuperAdminUser } from "@/lib/crmSuperAdmin";

/** Standalone super-admin Lead Reports page (/crm-admin/lead-reports). */
export default function CrmLeadReportsPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const allowed = Boolean(user && normalizeRole(user.role) === "crm" && isCrmSuperAdminUser(user));

    useEffect(() => {
        if (loading) return;
        if (!user) router.replace("/crm-admin/login");
        else if (!allowed) router.replace("/crm-admin");
    }, [loading, user, allowed, router]);

    if (loading || !user || !allowed) return <AccessLoading />;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <SuperAdminLeadReport />
        </div>
    );
}
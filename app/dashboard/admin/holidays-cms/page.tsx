"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import { ParentHolidayCmsPanel } from "@/components/dashboard/ParentHolidayCmsPanel";
import { useToast } from "@/components/ui/Toast";
import { holidayCityDropdownOptions } from "@/lib/cms-publish-target";

export default function AdminHolidaysCmsPage() {
    const { authFetch } = useAuth();
    const { franchises, savedLocations, reloadFranchises, franchisesLoading } = useAdminData();
    const { showToast } = useToast();

    useEffect(() => {
        if (franchises.length === 0 && !franchisesLoading) {
            void reloadFranchises();
        }
    }, [franchises.length, franchisesLoading, reloadFranchises]);

    const holidayCityOptions = holidayCityDropdownOptions(franchises, savedLocations);

    return (
        <div className="space-y-6">
            <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold text-slate-900">Holiday lists</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Same layout as centre Parent Portal — state PDF, manual dates, and saved lists by state. Head office
                    can publish globally or to selected centres.
                </p>
            </div>
            <ParentHolidayCmsPanel
                mode="admin"
                authFetch={authFetch}
                showToast={showToast}
                franchises={franchises}
                holidayCityOptions={holidayCityOptions}
            />
        </div>
    );
}

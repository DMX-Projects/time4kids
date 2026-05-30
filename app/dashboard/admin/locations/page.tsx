"use client";

import { Suspense } from "react";
import { AdminFranchiseLocationsEditor } from "@/components/dashboard/admin/AdminFranchiseLocationsEditor";

function LocationsEditorFallback() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center p-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
    );
}

export default function FranchiseLocationsPage() {
    return (
        <Suspense fallback={<LocationsEditorFallback />}>
            <AdminFranchiseLocationsEditor />
        </Suspense>
    );
}

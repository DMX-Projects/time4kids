"use client";

import type { FranchiseCentreAccess } from "@/components/dashboard/franchise/FranchiseDataProvider";

export function FranchiseCentreAccessBanner({
    centreAccess,
    loadedCount,
    recordLabel,
}: {
    centreAccess: FranchiseCentreAccess | null;
    loadedCount: number;
    recordLabel: "parents" | "students";
}) {
    if (!centreAccess) return null;

    if (!centreAccess.linked) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 max-w-3xl">
                <p className="font-semibold">Centre login is not linked to your school record.</p>
                <p className="mt-1">
                    {centreAccess.hint ||
                        "Ask head office to run link_franchise_centre_logins on the live server, then log in again."}
                </p>
            </div>
        );
    }

    const expected =
        recordLabel === "parents" ? centreAccess.parents_count ?? 0 : centreAccess.students_count ?? 0;

    if (expected > 0 && loadedCount === 0) {
        return (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 max-w-3xl">
                <p className="font-semibold">
                    {centreAccess.franchise_name || "Your centre"} has {expected} {recordLabel} in the database, but
                    none loaded in the app.
                </p>
                <p className="mt-1">
                    Deploy the latest backend and frontend on live, then hard-refresh (Ctrl+F5). If it persists, check
                    the Network tab for <code className="text-xs">/api/franchises/franchise/parents/</code> or{" "}
                    <code className="text-xs">/api/students/franchise/students/</code>.
                </p>
            </div>
        );
    }

    return null;
}

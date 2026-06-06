"use client";

import dynamic from "next/dynamic";

const ParentPortalCalendarPanel = dynamic(
    () => import("@/components/dashboard/shared/ParentPortalCalendarPanel").then((m) => m.ParentPortalCalendarPanel),
    { ssr: false },
);

export default function ParentCalendarPage() {
    return (
        <div className="space-y-6">
            <ParentPortalCalendarPanel mode="parent" />
        </div>
    );
}

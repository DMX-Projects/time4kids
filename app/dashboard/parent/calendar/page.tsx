"use client";

import dynamic from "next/dynamic";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";

const ParentPortalCalendarPanel = dynamic(
    () => import("@/components/dashboard/shared/ParentPortalCalendarPanel").then((m) => m.ParentPortalCalendarPanel),
    { ssr: false },
);

export default function ParentCalendarPage() {
    const { selectedStudent } = useParentData();

    return (
        <div className="space-y-6">
            <ParentPortalCalendarPanel
                mode="parent"
                parentStudentId={selectedStudent?.id ?? undefined}
                parentStudentClassName={selectedStudent?.grade ?? undefined}
            />
        </div>
    );
}

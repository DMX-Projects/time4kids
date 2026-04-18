"use client";

import { ParentDocList } from "@/components/dashboard/parent/ParentDocList";

export default function HolidayListPage() {
    return (
        <ParentDocList
            category="HOLIDAY_LISTS"
            title="Holiday list"
            description="Academic year holiday calendars (PDF) for your state / centre."
            emptyMessage="No holiday list uploaded yet. Your centre can add an academic-year holiday PDF when it is ready."
        />
    );
}

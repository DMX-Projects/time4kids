"use client";

import { ParentDocList } from "@/components/dashboard/parent/ParentDocList";

export default function HolidayListPage() {
    return (
        <ParentDocList
            category="HOLIDAY_LISTS"
            title="Holiday list"
            description="Academic year holiday calendars (PDF) for your state / centre."
            emptyMessage="No holiday list yet. Your centre can upload one under Parent documents → Holiday lists."
        />
    );
}

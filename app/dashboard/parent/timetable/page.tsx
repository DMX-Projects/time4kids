"use client";

import { ParentDocList } from "@/components/dashboard/parent/ParentDocList";

export default function TimetablePage() {
    return (
        <ParentDocList
            category="CLASS_TIMETABLE"
            title="Class timetable"
            description="Uploaded class timetables (usually PDF). Your centre publishes these for your batch."
            emptyMessage="No timetable uploaded yet. Ask your centre to add a PDF under Parent resources → Class timetable."
        />
    );
}

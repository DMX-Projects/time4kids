"use client";

import { CalendarRange } from "lucide-react";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

export default function EventSchedulePage() {
    const { events } = useSchoolData();

    return (
        <div className="space-y-6">
            <Section
                id="event-schedule"
                title="Event Schedule"
                description="Full calendar view with reminders and timings."
                icon={<CalendarRange className="w-5 h-5 text-orange-600" />}
            >
                <div className="flex flex-col gap-3 text-sm text-orange-800">
                    {events.map((ev) => (
                        <div key={ev.id} className="flex items-center justify-between bg-white border border-orange-100 rounded-lg px-3 py-2 shadow-sm">
                            <div>
                                <p className="font-semibold text-orange-900">{ev.title}</p>
                                <p className="text-xs text-orange-700">{ev.venue || "Venue TBD"}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs px-2 py-1 bg-orange-50 border border-orange-100 rounded-full">{ev.date || "TBD"}</span>
                                <div className="text-[11px] text-orange-600 mt-1">RSVP: {ev.rsvp || "Maybe"}</div>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && <p className="text-sm text-orange-700">No events yet. Add one from the Events page.</p>}
                </div>
            </Section>
        </div>
    );
}

function Section({ id, title, description, icon, children }: { id: string; title: string; description: string; icon: React.ReactNode; children?: React.ReactNode }) {
    return (
        <section id={id} className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-orange-900">{title}</h2>
                    <p className="text-sm text-orange-700">{description}</p>
                </div>
            </div>
            {children && <div>{children}</div>}
        </section>
    );
}

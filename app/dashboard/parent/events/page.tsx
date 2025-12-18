"use client";

import { CalendarDays } from "lucide-react";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

export default function EventsPage() {
    const { events } = useSchoolData();

    return (
        <div className="space-y-6">
            <Section
                id="events"
                title="Events"
                description="Events published by your centre."
                icon={<CalendarDays className="w-5 h-5 text-orange-600" />}
            >
            </Section>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {events.map((ev) => (
                    <div key={ev.id} className="bg-white border border-orange-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-orange-900 text-sm">{ev.title}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">{ev.date || "Date"}</span>
                        </div>
                        <p className="text-sm text-orange-700">Venue: {ev.venue || "—"}</p>
                        {ev.notes && <p className="text-xs text-orange-700">Notes: {ev.notes}</p>}
                    </div>
                ))}
                {events.length === 0 && <p className="text-sm text-orange-700">No events shared yet.</p>}
            </div>
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

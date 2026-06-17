"use client";

import { useMemo } from "react";
import { Images } from "lucide-react";
import { ParentEventGalleryGrid } from "@/components/dashboard/parent/ParentEventGalleryGrid";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";
import Button from "@/components/ui/Button";

export default function EventGalleryPage() {
    const { eventMedia, events, parentEventsLoading, refreshEvents } = useSchoolData();
    const eventTitleById = useMemo(() => {
        const m = new Map<string, string>();
        for (const ev of events) {
            m.set(ev.id, ev.title);
        }
        return m;
    }, [events]);

    if (parentEventsLoading && events.length === 0 && eventMedia.length === 0) {
        return (
            <div className="space-y-6">
                <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6">
                    <p className="text-sm text-orange-700">Loading event gallery…</p>
                </section>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Images className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-orange-900">Event Media</h2>
                        <p className="text-sm text-orange-700">
                            Browse photos and videos by class. Use the class dropdown to filter — defaults to your
                            child&apos;s class. Centre-wide events appear under every class filter.
                        </p>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="ml-auto shrink-0"
                        onClick={() => void refreshEvents()}
                    >
                        Refresh
                    </Button>
                </div>
            </section>

            <ParentEventGalleryGrid media={eventMedia} events={events} eventTitleById={eventTitleById} />
        </div>
    );
}

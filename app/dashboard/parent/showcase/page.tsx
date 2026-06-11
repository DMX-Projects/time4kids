"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { ParentEventGalleryGrid } from "@/components/dashboard/parent/ParentEventGalleryGrid";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

export default function ShowcasePage() {
    const { eventMedia, events, parentSchoolLoading, refreshEvents } = useSchoolData();
    const eventTitleById = useMemo(() => {
        const m = new Map<string, string>();
        for (const ev of events) m.set(ev.id, ev.title);
        return m;
    }, [events]);

    if (parentSchoolLoading) {
        return (
            <div className="space-y-6">
                <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-orange-900">Event Gallery</h1>
                            <p className="text-sm text-orange-700">Photos and videos shared by your centre.</p>
                        </div>
                    </div>
                </section>
                <div className="text-center py-8">
                    <p className="text-sm text-orange-700">Loading event gallery…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Event Gallery</h1>
                        <p className="text-sm text-orange-700">
                            Photos and videos for your child&apos;s class (and centre-wide events). Filter by class, then photos or videos.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => void refreshEvents()}
                        className="ml-auto text-xs font-semibold text-orange-600 underline hover:text-orange-800"
                    >
                        Refresh
                    </button>
                </div>
            </section>

            <ParentEventGalleryGrid media={eventMedia} events={events} eventTitleById={eventTitleById} />
        </div>
    );
}

"use client";

import { useMemo } from "react";
import { Images } from "lucide-react";
import { ParentEventGalleryGrid } from "@/components/dashboard/parent/ParentEventGalleryGrid";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

export default function EventGalleryPage() {
    const { eventMedia, events } = useSchoolData();
    const eventTitleById = useMemo(() => {
        const m = new Map<string, string>();
        for (const ev of events) {
            m.set(ev.id, ev.title);
        }
        return m;
    }, [events]);

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
                            Images and videos shared by your centre. Photos and videos are shown in separate tabs.
                        </p>
                    </div>
                </div>
            </section>

            <ParentEventGalleryGrid media={eventMedia} eventTitleById={eventTitleById} />
        </div>
    );
}

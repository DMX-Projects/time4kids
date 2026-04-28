"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

export default function ShowcasePage() {
    const { eventMedia, events, parentSchoolLoading } = useSchoolData();
    const eventTitleById = useMemo(() => {
        const m = new Map<string, string>();
        for (const ev of events) m.set(ev.id, ev.title);
        return m;
    }, [events]);

    // Show loading state while API data is being fetched
    if (parentSchoolLoading) {
        return (
            <div className="space-y-6">
                <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-orange-900">Showcase</h1>
                            <p className="text-sm text-orange-700">Photos and videos shared by your centre.</p>
                        </div>
                    </div>
                </section>
                <div className="text-center py-8">
                    <p className="text-sm text-orange-700">Loading showcase media...</p>
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
                        <h1 className="text-lg font-semibold text-orange-900">Showcase</h1>
                        <p className="text-sm text-orange-700">Photos and videos shared by your centre.</p>
                    </div>
                </div>
            </section>

            <div className="grid md:grid-cols-3 gap-3">
                {eventMedia.map((ph) => (
                    <div key={ph.id} className="overflow-hidden rounded-xl border border-orange-100 shadow-sm bg-white">
                        {ph.type === "video" ? (
                            <div className="h-40 w-full bg-black flex items-center justify-center">
                                <video className="w-full h-40 object-contain" src={ph.url} controls playsInline preload="metadata" aria-label={ph.title || "Showcase video"} />
                            </div>
                        ) : ph.url ? (
                            <div className="relative h-40 w-full">
                                <Image src={ph.url} alt={ph.title || "Showcase image"} fill className="object-cover" unoptimized />
                            </div>
                        ) : (
                            <div className="h-40 w-full bg-orange-50" />
                        )}
                        <div className="p-3 flex items-center justify-between text-sm text-orange-900">
                            <div>
                                <p className="font-semibold">{ph.title || "Media"}</p>
                                {ph.eventId && (
                                    <p className="text-xs text-orange-700">
                                        Event: {eventTitleById.get(ph.eventId) || `#${ph.eventId}`}
                                    </p>
                                )}
                            </div>
                            <span className="text-[11px] px-2 py-1 rounded-full bg-orange-50 border border-orange-100">{ph.type}</span>
                        </div>
                    </div>
                ))}
            </div>
            {eventMedia.length === 0 && <p className="text-sm text-orange-700">No showcase media yet.</p>}
        </div>
    );
}

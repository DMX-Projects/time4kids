"use client";

import { useMemo } from "react";
import { Images } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

export default function EventGalleryPage() {
    const { user } = useAuth();
    const { getEventMediaForParent, events } = useSchoolData();
    const media = getEventMediaForParent(user?.id || "parent-1");
    const eventTitleById = useMemo(() => {
        const m = new Map<string, string>();
        for (const ev of events) {
            m.set(ev.id, ev.title);
        }
        return m;
    }, [events]);

    return (
        <div className="space-y-6">
            <Section
                id="event-gallery"
                title="Event Media"
                description="Images and videos shared by your centre."
                icon={<Images className="w-5 h-5 text-orange-600" />}
            />

            <div className="grid md:grid-cols-3 gap-3 pt-1">
                {media.map((ph) => (
                    <div key={ph.id} className="overflow-hidden rounded-xl border border-orange-100 shadow-sm bg-white">
                        {ph.type === "video" ? (
                            <div className="h-40 w-full bg-black flex items-center justify-center">
                                <video className="w-full h-40 object-contain" src={ph.url} controls playsInline preload="metadata" aria-label={ph.title || "Event video"} />
                            </div>
                        ) : ph.url ? (
                            <img src={ph.url} alt={ph.title} className="h-40 w-full object-cover" />
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
                {media.length === 0 && <p className="text-sm text-orange-700">No media shared yet.</p>}
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

"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { EventGalleryImage } from "@/components/ui/EventGalleryImage";
import { EventGalleryVideo } from "@/components/ui/EventGalleryVideo";
import type { EventMedia } from "@/components/dashboard/shared/SchoolDataProvider";

type MediaFilter = "all" | "image" | "video";

export function ParentEventGalleryGrid({
    media,
    eventTitleById,
}: {
    media: EventMedia[];
    eventTitleById: Map<string, string>;
}) {
    const { tokens } = useAuth();
    const [filter, setFilter] = useState<MediaFilter>("all");

    const filtered = useMemo(() => {
        if (filter === "all") return media;
        return media.filter((m) => m.type === filter);
    }, [media, filter]);

    const counts = useMemo(
        () => ({
            all: media.length,
            image: media.filter((m) => m.type === "image").length,
            video: media.filter((m) => m.type === "video").length,
        }),
        [media],
    );

    const tabs: { id: MediaFilter; label: string }[] = [
        { id: "all", label: `All (${counts.all})` },
        { id: "image", label: `Photos (${counts.image})` },
        { id: "video", label: `Videos (${counts.video})` },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilter(tab.id)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold border transition-colors ${
                            filter === tab.id
                                ? "bg-orange-600 text-white border-orange-600"
                                : "bg-white text-orange-800 border-orange-200 hover:bg-orange-50"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-3">
                {filtered.map((ph) => (
                    <div key={ph.id} className="overflow-hidden rounded-xl border border-orange-100 shadow-sm bg-white">
                        {ph.type === "video" ? (
                            <div className="h-40 w-full bg-black flex items-center justify-center">
                                <EventGalleryVideo
                                    filePath={ph.filePath}
                                    mediaId={Number(ph.id)}
                                    accessToken={tokens?.access}
                                    caption={ph.title}
                                    className="w-full h-40 object-contain"
                                    aria-label={ph.title || "Event video"}
                                />
                            </div>
                        ) : ph.filePath ? (
                            <div className="relative h-40 w-full">
                                <EventGalleryImage
                                    file={ph.filePath}
                                    mediaId={Number(ph.id)}
                                    accessToken={tokens?.access}
                                    alt={ph.title || "Event image"}
                                    fill
                                />
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
                            <span className="text-[11px] px-2 py-1 rounded-full bg-orange-50 border border-orange-100 capitalize">
                                {ph.type === "video" ? "Video" : "Photo"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 ? (
                <p className="text-sm text-orange-700">
                    {media.length === 0
                        ? "No media shared yet."
                        : filter === "image"
                          ? "No photos in this gallery yet."
                          : filter === "video"
                            ? "No videos in this gallery yet."
                            : "No media shared yet."}
                </p>
            ) : null}
        </div>
    );
}

"use client";



import { useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";

import { EventGalleryImage } from "@/components/ui/EventGalleryImage";

import { EventGalleryVideo } from "@/components/ui/EventGalleryVideo";

import type { EventMedia, EventRecord } from "@/components/dashboard/shared/SchoolDataProvider";

import { PORTAL_CLASS_OPTIONS, portalClassLabel } from "@/config/portal-class-options";

import { studentGradeMatchesClassFilter } from "@/lib/student-class-match";



type MediaFilter = "all" | "image" | "video" | "url";



export function ParentEventGalleryGrid({

    media,

    events,

    eventTitleById,

}: {

    media: EventMedia[];

    events: EventRecord[];

    eventTitleById: Map<string, string>;

}) {

    const { tokens } = useAuth();

    const [classFilter, setClassFilter] = useState("");

    const [filter, setFilter] = useState<MediaFilter>("all");



    const eventClassById = useMemo(() => {

        const m = new Map<string, string>();

        for (const ev of events) {

            m.set(ev.id, ev.className || "");

        }

        return m;

    }, [events]);



    const classTabs = useMemo(() => {
        const known = new Set(PORTAL_CLASS_OPTIONS.map((o) => o.label));
        const extras: string[] = [];
        for (const ev of events) {
            const label = portalClassLabel(ev.className);
            if (!known.has(label)) {
                known.add(label);
                extras.push(label);
            }
        }
        return [...PORTAL_CLASS_OPTIONS.map((o) => o.label), ...extras.sort((a, b) => a.localeCompare(b))];
    }, [events]);



    const mediaForClass = useMemo(() => {

        if (!classFilter) return media;

        return media.filter((item) => {

            if (!item.eventId) return false;

            const eventClass = eventClassById.get(item.eventId) || "";

            return studentGradeMatchesClassFilter(eventClass, classFilter);

        });

    }, [classFilter, eventClassById, media]);



    const filtered = useMemo(() => {

        if (filter === "all") return mediaForClass;

        return mediaForClass.filter((m) => m.type === filter);

    }, [mediaForClass, filter]);



    const counts = useMemo(

        () => ({

            all: mediaForClass.length,

            image: mediaForClass.filter((m) => m.type === "image").length,

            video: mediaForClass.filter((m) => m.type === "video").length,

            url: mediaForClass.filter((m) => m.type === "url").length,

        }),

        [mediaForClass],

    );



    const tabs: { id: MediaFilter; label: string }[] = [

        { id: "all", label: `All (${counts.all})` },

        { id: "image", label: `Photos (${counts.image})` },

        { id: "video", label: `Videos (${counts.video})` },

        ...(counts.url > 0 ? [{ id: "url" as const, label: `Links (${counts.url})` }] : []),

    ];



    return (

        <div className="space-y-4">

            {classTabs.length > 1 ? (

                <div className="space-y-2">

                    <p className="text-xs font-semibold text-orange-800">Class</p>

                    <div className="flex flex-wrap gap-2">

                        {classTabs.map((label) => {

                            const value = label === "All classes" ? "" : label;

                            const active = classFilter === value;

                            return (

                                <button

                                    key={label}

                                    type="button"

                                    onClick={() => setClassFilter(value)}

                                    className={`rounded-full px-4 py-2 text-xs font-semibold border transition-colors ${

                                        active

                                            ? "bg-orange-600 text-white border-orange-600"

                                            : "bg-white text-orange-800 border-orange-200 hover:bg-orange-50"

                                    }`}

                                >

                                    {label}

                                </button>

                            );

                        })}

                    </div>

                </div>

            ) : null}



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

                {filtered.map((ph) => {

                    const eventClass = ph.eventId ? eventClassById.get(ph.eventId) : "";

                    return (

                        <div key={ph.id} className="overflow-hidden rounded-xl border border-orange-100 shadow-sm bg-white">

                            {ph.type === "video" || ph.type === "url" ? (

                                <div className="h-40 w-full bg-black flex items-center justify-center">

                                    <EventGalleryVideo

                                        filePath={ph.filePath}

                                        mediaId={ph.type === "url" ? undefined : Number(ph.id)}

                                        accessToken={tokens?.access}

                                        caption={ph.title}

                                        className="w-full h-40 object-contain"

                                        aria-label={ph.title || (ph.type === "url" ? "Event video link" : "Event video")}

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

                                    {ph.eventId ? (

                                        <p className="text-xs text-orange-700">

                                            Event: {eventTitleById.get(ph.eventId) || `#${ph.eventId}`}

                                        </p>

                                    ) : null}

                                    {eventClass ? (

                                        <p className="text-[11px] text-orange-600 mt-0.5">{portalClassLabel(eventClass)}</p>

                                    ) : null}

                                </div>

                                <span className="text-[11px] px-2 py-1 rounded-full bg-orange-50 border border-orange-100 capitalize">

                                    {ph.type === "url" ? "Link" : ph.type === "video" ? "Video" : "Photo"}

                                </span>

                            </div>

                        </div>

                    );

                })}

            </div>



            {filtered.length === 0 ? (

                <p className="text-sm text-orange-700">

                    {media.length === 0

                        ? "No media shared yet."

                        : classFilter

                          ? "No media for this class yet."

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


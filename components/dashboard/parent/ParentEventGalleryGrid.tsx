"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";
import { EventGalleryImage } from "@/components/ui/EventGalleryImage";
import { EventGalleryVideo } from "@/components/ui/EventGalleryVideo";
import type { EventMedia, EventRecord } from "@/components/dashboard/shared/SchoolDataProvider";
import { PORTAL_CLASS_OPTIONS, portalClassLabel } from "@/config/portal-class-options";
import { canonicalClassLabel, studentGradeMatchesClassFilter } from "@/lib/student-class-match";

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
    const { selectedStudent, studentScopeReady, hasMultipleChildren } = useParentData();
    const [filter, setFilter] = useState<MediaFilter>("all");

    const childClassLabel = useMemo(() => {
        const grade = (selectedStudent?.grade || "").trim();
        if (!grade) return "";
        return canonicalClassLabel(grade) || grade;
    }, [selectedStudent?.grade]);

    const [classFilter, setClassFilter] = useState("");

    useEffect(() => {
        if (!studentScopeReady) return;
        setClassFilter(childClassLabel);
    }, [childClassLabel, studentScopeReady, selectedStudent?.id]);

    const classOptions = useMemo(() => {
        const known = new Set<string>();
        const options: { value: string; label: string }[] = [];
        for (const opt of PORTAL_CLASS_OPTIONS) {
            const label = opt.label.trim();
            if (!label || known.has(label)) continue;
            known.add(label);
            options.push({ value: opt.value, label });
        }
        for (const ev of events) {
            const raw = (ev.className || "").trim();
            if (!raw) continue;
            const label = portalClassLabel(raw);
            if (label === "All classes" || known.has(label)) continue;
            known.add(label);
            options.push({ value: label, label });
        }
        return options;
    }, [events]);

    const eventClassById = useMemo(() => {
        const m = new Map<string, string>();
        for (const ev of events) {
            m.set(ev.id, ev.className || "");
        }
        return m;
    }, [events]);

    const mediaForClass = useMemo(() => {
        if (!classFilter) return media;
        return media.filter((item) => {
            if (!item.eventId) return false;
            const eventClass = eventClassById.get(item.eventId) || "";
            if (!eventClass.trim()) return true;
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

    const selectedClassLabel =
        classOptions.find((o) => o.value === classFilter)?.label || portalClassLabel(classFilter) || "All classes";

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                <label className="block flex-1 max-w-md space-y-1">
                    <span className="text-xs font-semibold text-orange-800">Filter by class</span>
                    <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm text-orange-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    >
                        {classOptions.map((opt) => (
                            <option key={opt.label} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </label>
                {studentScopeReady && childClassLabel ? (
                    <p className="text-xs text-orange-700 sm:pb-2">
                        Default:{" "}
                        <span className="font-semibold">
                            {selectedStudent?.name}
                            {selectedStudent?.grade ? ` (${portalClassLabel(selectedStudent.grade)})` : ""}
                        </span>
                        {hasMultipleChildren ? " — change child in the header to update the default." : null}
                    </p>
                ) : null}
            </div>

            <p className="text-[11px] text-orange-600">
                Viewing: <span className="font-semibold">{selectedClassLabel}</span>
                {classFilter ? " (includes centre-wide events)" : " — all classes at your centre"}
            </p>

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
                                    ) : (
                                        <p className="text-[11px] text-orange-600 mt-0.5">All classes</p>
                                    )}
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
                          ? `No media for ${selectedClassLabel} yet.`
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

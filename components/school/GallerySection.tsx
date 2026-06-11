"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Play, Hand, Clock, ArrowLeft, Calendar, MapPin, AlertCircle, Image as ImageIcon, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventGalleryImage } from '@/components/ui/EventGalleryImage';
import { EventGalleryVideo } from '@/components/ui/EventGalleryVideo';
import { franchisePublicLocationLine } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import { mergeEventGalleryVideoLinks } from '@/lib/event-gallery-video-links';
import { PORTAL_CLASS_OPTIONS, portalClassLabel } from '@/config/portal-class-options';

interface MediaItem {
    id: number;
    file: string;
    media_type: 'IMAGE' | 'VIDEO' | 'URL';
    caption: string;
}

interface EventItem {
    id: number;
    title: string;
    description: string;
    start_date: string;
    year: number;
    class_name?: string;
    audience_label?: string;
    media: MediaItem[];
}

function eventClassLabel(event: EventItem): string {
    return portalClassLabel(event.class_name || event.audience_label);
}

// Fallback for old gallery items if needed, though we prioritize events
interface OldGalleryItem {
    id: number;
    media_type: 'photo' | 'video';
    title: string;
    image: string;
    video_link?: string;
    academic_year: string;
    event_category: string;
    created_at: string;
}

interface GallerySectionProps {
    schoolName: string;
    city: string;
    state?: string | null;
    urlCityFallback?: string | null;
    /** Franchise slug — enables Django stream URLs when files are not on the Next host. */
    centreSlug?: string;
    galleryItems?: OldGalleryItem[];
    events?: EventItem[];
}

const EVENTS_PAGE_SIZE = 12;
const MEDIA_PAGE_SIZE = 24;

/** Legacy franchise gallery rows (pre–Event Gallery migration). */
function galleryItemsAsEvents(items: OldGalleryItem[]): EventItem[] {
    return items
        .map((item) => {
            const year =
                parseInt(String(item.academic_year || "").trim(), 10) ||
                (item.created_at ? new Date(item.created_at).getFullYear() : new Date().getFullYear());
            const media: MediaItem[] = [];
            if (item.media_type === "video" && item.video_link?.trim()) {
                media.push({
                    id: item.id,
                    file: item.video_link.trim(),
                    media_type: "VIDEO",
                    caption: item.title || "",
                });
            } else if (item.image?.trim()) {
                media.push({
                    id: item.id,
                    file: item.image.trim(),
                    media_type: "IMAGE",
                    caption: item.title || "",
                });
            }
            if (media.length === 0) return null;
            return {
                id: -item.id,
                title: item.title || item.event_category || "Gallery",
                description: item.event_category || "",
                start_date: item.created_at || `${year}-01-01`,
                year,
                media,
            };
        })
        .filter((e): e is EventItem => e !== null);
}

export default function GallerySection({
    schoolName,
    city,
    state,
    urlCityFallback,
    centreSlug,
    galleryItems = [],
    events = [],
}: GallerySectionProps) {
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    const [filterYear, setFilterYear] = useState<string>('');
    const [filterClass, setFilterClass] = useState<string>('');
    const [filterMediaType, setFilterMediaType] = useState<'all' | 'IMAGE' | 'VIDEO' | 'URL'>('all');
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const [eventsVisibleCount, setEventsVisibleCount] = useState(EVENTS_PAGE_SIZE);
    const [mediaVisibleCount, setMediaVisibleCount] = useState(MEDIA_PAGE_SIZE);

    const lifeAtCentreName = franchisePublicLocationLine(schoolName ?? '', { city, state, urlCityFallback });
    const lifeAtHeading = lifeAtCentreName ? `Life at ${lifeAtCentreName}` : 'Life at T.I.M.E. Kids';

    const displayEvents = useMemo(() => {
        if (events.length > 0) return mergeEventGalleryVideoLinks(events);
        return galleryItemsAsEvents(galleryItems);
    }, [events, galleryItems]);

    // Extract Years from Events
    const eventYears = useMemo(() => {
        const years = new Set(displayEvents.map(e => e.year || new Date(e.start_date).getFullYear()));
        return Array.from(years).sort().reverse();
    }, [displayEvents]);

    const eventClasses = useMemo(() => {
        const known = new Set(PORTAL_CLASS_OPTIONS.map((o) => o.label));
        const extras: string[] = [];
        for (const e of displayEvents) {
            const label = eventClassLabel(e);
            if (!known.has(label)) {
                known.add(label);
                extras.push(label);
            }
        }
        return [...PORTAL_CLASS_OPTIONS.map((o) => o.label), ...extras.sort((a, b) => a.localeCompare(b))];
    }, [displayEvents]);

    // Filter Events by year + class
    const filteredEvents = useMemo(() => {
        let list = displayEvents;
        if (filterYear) {
            list = list.filter((e) => (e.year || new Date(e.start_date).getFullYear()).toString() === filterYear);
        }
        if (filterClass) {
            list = list.filter((e) => eventClassLabel(e) === filterClass);
        }
        return list;
    }, [displayEvents, filterYear, filterClass]);

    const visibleEvents = useMemo(
        () => filteredEvents.slice(0, eventsVisibleCount),
        [filteredEvents, eventsVisibleCount],
    );

    const galleryStats = useMemo(() => {
        let photos = 0;
        let videos = 0;
        let links = 0;
        for (const ev of displayEvents) {
            for (const m of ev.media || []) {
                if (m.media_type === 'IMAGE') photos += 1;
                else if (m.media_type === 'URL') links += 1;
                else videos += 1;
            }
        }
        return { events: displayEvents.length, photos, videos, links };
    }, [displayEvents]);

    useEffect(() => {
        setEventsVisibleCount(EVENTS_PAGE_SIZE);
    }, [filterYear, filterClass]);

    // Filter Media within Selected Event
    const filteredMedia = useMemo(() => {
        if (!selectedEvent) return [];
        if (filterMediaType === 'all') return selectedEvent.media;
        return selectedEvent.media.filter(m => m.media_type === filterMediaType);
    }, [selectedEvent, filterMediaType]);

    const visibleMedia = useMemo(
        () => filteredMedia.slice(0, mediaVisibleCount),
        [filteredMedia, mediaVisibleCount],
    );

    const mediaTabCounts = useMemo(() => {
        if (!selectedEvent) return { all: 0, image: 0, video: 0, url: 0 };
        const media = selectedEvent.media || [];
        return {
            all: media.length,
            image: media.filter((m) => m.media_type === 'IMAGE').length,
            video: media.filter((m) => m.media_type === 'VIDEO').length,
            url: media.filter((m) => m.media_type === 'URL').length,
        };
    }, [selectedEvent]);

    useEffect(() => {
        setMediaVisibleCount(MEDIA_PAGE_SIZE);
    }, [selectedEvent?.id, filterMediaType]);

    const handleEventClick = (event: EventItem) => {
        setSelectedEvent(event);
        setFilterMediaType('all');
        setMediaVisibleCount(MEDIA_PAGE_SIZE);
    };

    const handleBackToEvents = () => {
        setSelectedEvent(null);
    };

    const handleMediaClick = (item: MediaItem) => {
        setSelectedMedia(item);
    };

    const closeLightbox = () => {
        setSelectedMedia(null);
    };

    // Navigate to next media item
    const goToNextMedia = useCallback(() => {
        if (!selectedMedia || filteredMedia.length === 0) return;
        const currentIndex = filteredMedia.findIndex(m => m.id === selectedMedia.id);
        const nextIndex = (currentIndex + 1) % filteredMedia.length;
        setSelectedMedia(filteredMedia[nextIndex]);
    }, [filteredMedia, selectedMedia]);

    // Navigate to previous media item
    const goToPreviousMedia = useCallback(() => {
        if (!selectedMedia || filteredMedia.length === 0) return;
        const currentIndex = filteredMedia.findIndex(m => m.id === selectedMedia.id);
        const previousIndex = (currentIndex - 1 + filteredMedia.length) % filteredMedia.length;
        setSelectedMedia(filteredMedia[previousIndex]);
    }, [filteredMedia, selectedMedia]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (!selectedMedia) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToNextMedia();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToPreviousMedia();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeLightbox();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedMedia, filteredMedia, goToNextMedia, goToPreviousMedia]); // Re-attach when selectedMedia or filteredMedia changes


    return (
        <section id="gallery" className="relative py-24 scroll-mt-24 font-fredoka overflow-hidden">
            {/* Whimsical Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/classes-bg.png"
                    alt="Gallery Background"
                    fill
                    className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/40" />
            </div>

            {/* Top Right: Camera */}
            <div className="absolute top-8 right-16 pointer-events-none z-10 hidden lg:block">
                <motion.div
                    animate={{ rotate: [12, 17, 12] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-48 h-48"
                >
                    <Image
                        src="/camera.png"
                        alt="Camera"
                        fill
                        className="object-contain drop-shadow-2xl"
                    />
                </motion.div>
            </div>

            {/* Bottom Left: Teddy & Blocks */}
            <div className="absolute bottom-10 left-10 flex items-end gap-2 pointer-events-none z-10 hidden lg:flex">
                <div className="relative w-24 h-24">
                    <Image src="/teddy-bear.png" alt="Teddy" fill className="object-contain" />
                </div>
                <div className="relative w-16 h-16 mb-2">
                    <Image src="/toy-stack.png" alt="Blocks" fill className="object-contain" />
                </div>
            </div>

            {/* Bottom Right: Characters */}
            <div className="absolute bottom-10 right-10 pointer-events-none z-10 hidden lg:flex">
                <div className="relative w-40 h-24 mb-2">
                    <Image src="/school-footer.png" alt="Characters" fill className="object-contain object-right-bottom scale-150 origin-bottom-right opacity-30" />
                </div>
            </div>


            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-200">
                            <Hand className="w-6 h-6 text-white -rotate-12" fill="white" />
                        </div>
                        <span className="bg-pink-50 text-pink-500 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-pink-100 flex items-center">
                            Our Event Gallery
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black text-[#2D3142] mb-10">
                        {selectedEvent ? selectedEvent.title : lifeAtHeading}
                    </h2>

                    {!selectedEvent && (
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <div className="relative inline-block group">
                                <select
                                    value={filterClass}
                                    onChange={(e) => setFilterClass(e.target.value)}
                                    className="appearance-none bg-white text-gray-700 py-3 px-10 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-2 border-transparent focus:outline-none focus:border-yellow-200 font-bold text-base cursor-pointer transition-all hover:scale-105 min-w-[200px] text-center"
                                >
                                    {eventClasses.map((label) => (
                                        <option key={label} value={label === 'All classes' ? '' : label}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative inline-block group">
                                <select
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                    className="appearance-none bg-white text-gray-700 py-3 px-12 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-2 border-transparent focus:outline-none focus:border-yellow-200 font-bold text-lg cursor-pointer transition-all hover:scale-105 min-w-[220px] text-center"
                                >
                                    <option value="">All Years</option>
                                    {eventYears.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    )}

                    {!selectedEvent && displayEvents.length > 0 ? (
                        <p className="mt-6 text-center text-sm font-semibold text-gray-500">
                            {filteredEvents.length} of {galleryStats.events} event{galleryStats.events === 1 ? '' : 's'}
                            {galleryStats.photos + galleryStats.videos + galleryStats.links > 0
                                ? ` · ${galleryStats.photos} photos · ${galleryStats.videos} videos${galleryStats.links ? ` · ${galleryStats.links} links` : ''}`
                                : ''}
                            {filterClass || filterYear ? ' (filtered)' : ''}
                        </p>
                    ) : null}
                </div>

                <AnimatePresence mode="wait">
                    {!selectedEvent ? (
                        <motion.div
                            key="event-list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
                            {filteredEvents.length > 0 ? (
                                visibleEvents.map((event, idx) => {
                                    const glowColors = [
                                        'shadow-lg group-hover:shadow-xl border-orange-200/50 hover:border-orange-300',
                                        'shadow-lg group-hover:shadow-xl border-green-200/50 hover:border-green-300',
                                        'shadow-lg group-hover:shadow-xl border-yellow-200/50 hover:border-yellow-300'
                                    ];
                                    const cardGlow = glowColors[idx % 3];

                                    return (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                                            onClick={() => handleEventClick(event)}
                                            className={`group relative bg-white rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${cardGlow}`}
                                        >
                                            {/* Top Badge */}
                                            <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-bold text-gray-600 shadow-sm flex items-center gap-1.5 border border-gray-100">
                                                <ImageIcon size={12} className="text-gray-400" />
                                                {event.media?.length || 0}
                                            </div>

                                            {/* Event Image */}
                                            <div className="relative h-40 w-full overflow-hidden">
                                                {event.media && event.media.length > 0 ? (() => {
                                                    const thumb =
                                                        event.media.find((m) => m.media_type === "IMAGE") ?? event.media[0];
                                                    if (!thumb) return null;
                                                    return thumb.media_type === "VIDEO" || thumb.media_type === "URL" ? (
                                                        <EventGalleryVideo
                                                            filePath={thumb.file}
                                                            mediaId={thumb.id}
                                                            centreSlug={centreSlug}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            controls={false}
                                                            muted
                                                            playsInline
                                                            preload="metadata"
                                                        />
                                                    ) : (
                                                        <EventGalleryImage
                                                            file={thumb.file}
                                                            centreSlug={centreSlug}
                                                            mediaId={thumb.id}
                                                            alt={event.title}
                                                            fill
                                                            className="transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    );
                                                })() : (
                                                    <div className="flex items-center justify-center h-full bg-gray-50 text-gray-300">
                                                        <ImageIcon size={40} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            {/* Details Section */}
                                            <div className="p-4">
                                                <div className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold mb-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <h3 className="text-base font-bold text-gray-800 mb-2 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                    {event.title}
                                                </h3>
                                                <span className="inline-block mb-3 rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold text-violet-700 border border-violet-100">
                                                    {eventClassLabel(event)}
                                                </span>

                                                {/* Bottom Badge */}
                                                <div className="inline-flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 group-hover:bg-orange-100 transition-colors">
                                                    <div className="w-4 h-4 rounded bg-orange-400 flex items-center justify-center text-white">
                                                        <ImageIcon size={10} className="fill-current" />
                                                    </div>
                                                    <span className="text-orange-700 font-bold text-xs">
                                                        {event.media?.length || 0} {event.media?.length === 1 ? 'Item' : 'Items'}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center py-20">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                        <AlertCircle size={48} />
                                    </div>
                                    <p className="text-gray-400 text-xl font-bold">
                                        {displayEvents.length === 0
                                            ? "Photos and videos from your centre will appear here once uploaded in Event Gallery."
                                            : filterClass && filterYear
                                              ? `No events for ${filterClass} in ${filterYear}.`
                                              : filterClass
                                                ? `No events for ${filterClass} yet.`
                                                : filterYear
                                                  ? `No events found for ${filterYear}.`
                                                  : 'No events match your filters.'}
                                    </p>
                                </div>
                            )}
                        </div>
                        {filteredEvents.length > visibleEvents.length ? (
                            <div className="mt-10 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setEventsVisibleCount((n) => n + EVENTS_PAGE_SIZE)}
                                    className="rounded-full bg-[#2D3142] px-8 py-3 text-sm font-black text-white shadow-lg hover:bg-[#1f2230] transition-colors"
                                >
                                    Load more events ({filteredEvents.length - visibleEvents.length} remaining)
                                </button>
                            </div>
                        ) : null}
                        </motion.div>
                    ) : (
                        /* VIEW 2: EVENT MEDIA DETAIL */
                        <motion.div
                            key="event-detail"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 min-h-[500px] border-4 border-white shadow-[0_32px_64px_rgba(0,0,0,0.05)]"
                        >
                            {/* Toolbar */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-gray-100 pb-8">
                                <button
                                    onClick={handleBackToEvents}
                                    className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 rounded-full font-black text-[#2D3142] hover:bg-[#2D3142] hover:text-white transition-all shadow-sm hover:shadow-xl active:scale-95"
                                >
                                    <ArrowLeft className="w-5 h-5" /> Back to Album
                                </button>

                                <p className="text-sm font-bold text-gray-500 md:mx-auto">
                                    {selectedEvent.title} · {filteredMedia.length} item{filteredMedia.length === 1 ? '' : 's'}
                                </p>

                                <div className="flex flex-wrap justify-center bg-[#F8F9FA] p-2 rounded-3xl border border-gray-100 shadow-inner gap-1">
                                    {[
                                        { id: 'all', label: `All (${mediaTabCounts.all})` },
                                        { id: 'IMAGE', label: `Photos (${mediaTabCounts.image})` },
                                        { id: 'VIDEO', label: `Videos (${mediaTabCounts.video})` },
                                        ...(mediaTabCounts.url > 0 ? [{ id: 'URL', label: `Links (${mediaTabCounts.url})` }] : []),
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setFilterMediaType(tab.id as any)}
                                            className={`px-8 py-3 rounded-2xl text-[13px] font-black transition-all ${filterMediaType === tab.id ? 'bg-[#2D3142] text-white shadow-lg' : 'text-gray-400 hover:text-gray-700'}`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Media Grid */}
                            {filteredMedia.length > 0 ? (
                                <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                    {visibleMedia.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: Math.min(index * 0.03, 0.35) }}
                                            className="group relative aspect-[4/5] rounded-[32px] overflow-hidden cursor-pointer shadow-xl hover:shadow-[0_20px_40px_rgba(45,49,66,0.2)] transition-all hover:-translate-y-2"
                                            onClick={() => handleMediaClick(item)}
                                        >
                                            {item.media_type === "VIDEO" || item.media_type === "URL" ? (
                                                <EventGalleryVideo
                                                    filePath={item.file}
                                                    mediaId={item.id}
                                                    centreSlug={centreSlug}
                                                    caption={item.caption}
                                                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                                                    controls={false}
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                />
                                            ) : (
                                                <EventGalleryImage
                                                    file={item.file}
                                                    centreSlug={centreSlug}
                                                    mediaId={item.id}
                                                    alt={item.caption || "Event Media"}
                                                    fill
                                                    className="transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                                                />
                                            )}
                                            {item.media_type === 'VIDEO' && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-all">
                                                    <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                                        <Play className="w-7 h-7 text-blue-600 fill-current translate-x-1" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all">
                                                <p className="text-white font-bold text-sm truncate">{item.caption || 'View Media'}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                {filteredMedia.length > visibleMedia.length ? (
                                    <div className="mt-10 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => setMediaVisibleCount((n) => n + MEDIA_PAGE_SIZE)}
                                            className="rounded-full border-2 border-[#2D3142] px-8 py-3 text-sm font-black text-[#2D3142] hover:bg-[#2D3142] hover:text-white transition-colors"
                                        >
                                            Load more photos & videos ({filteredMedia.length - visibleMedia.length} remaining)
                                        </button>
                                    </div>
                                ) : null}
                                </>
                            ) : (
                                <div className="text-center py-32">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                        <ImageIcon size={40} />
                                    </div>
                                    <p className="text-gray-400 font-bold text-lg">
                                        {filterMediaType === 'all'
                                            ? 'No media in this event yet.'
                                            : `No ${filterMediaType === 'URL' ? 'links' : filterMediaType.toLowerCase()} in this album.`}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Lightbox Modal */}
                <Modal
                    isOpen={!!selectedMedia}
                    onClose={closeLightbox}
                    size="xl"
                >
                    {selectedMedia && (
                        <div className="relative w-full h-[80vh] flex flex-col items-center justify-center bg-transparent rounded-3xl overflow-hidden">
                            {/* Navigation Arrows */}
                            {filteredMedia.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); goToPreviousMedia(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/20 hover:bg-white text-gray-800 rounded-full transition-all shadow-xl backdrop-blur-md group"
                                    >
                                        <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); goToNextMedia(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/20 hover:bg-white text-gray-800 rounded-full transition-all shadow-xl backdrop-blur-md group"
                                    >
                                        <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </>
                            )}

                            {selectedMedia.media_type === 'VIDEO' || selectedMedia.media_type === 'URL' ? (
                                <EventGalleryVideo
                                    filePath={selectedMedia.file}
                                    mediaId={selectedMedia.id}
                                    centreSlug={centreSlug}
                                    caption={selectedMedia.caption}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-full rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.3)]"
                                />
                            ) : (
                                <div className="relative w-full h-full p-4">
                                    <EventGalleryImage
                                        file={selectedMedia.file}
                                        centreSlug={centreSlug}
                                        mediaId={selectedMedia.id}
                                        alt={selectedMedia.caption || "Gallery View"}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                    />
                                </div>
                            )}

                            {selectedMedia.caption && (
                                <div className="absolute bottom-10 bg-white/10 backdrop-blur-xl px-10 py-4 rounded-3xl border border-white/20 shadow-2xl">
                                    <p className="text-white font-black text-xl drop-shadow-md">{selectedMedia.caption}</p>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </section>
    );
}

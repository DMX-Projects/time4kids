'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CmsImage from '@/components/ui/CmsImage';
import { Play, ArrowLeft, AlertCircle, Image as ImageIcon, Hand, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { apiUrl, mediaUrl } from '@/lib/api-client';
import { buildFallbackGalleryFromMock } from '@/lib/mock-media-data';
import { resolveFranchiseEmbedSrc } from '@/lib/franchise-embed-url';

interface MediaItem {
    id: number;
    file: string;
    embed_url?: string;
    media_type: 'image' | 'video' | 'embed';
    caption: string;
    order: number;
}

interface EventGroup {
    title: string;
    media: MediaItem[];
}

function embedSrcForItem(item: MediaItem): string | null {
    if (item.media_type !== 'embed') return null;
    return resolveFranchiseEmbedSrc(item.embed_url || '') || item.embed_url || null;
}

function thumbnailForEvent(media: MediaItem[]): MediaItem | null {
    return media.find(m => m.media_type === 'image' && m.file)
        ?? media.find(m => m.media_type === 'video' && m.file)
        ?? media[0]
        ?? null;
}

/** Public photo/video gallery. Lives at `/gallery/` so `/media/` stays free for Django uploaded files (avoids nginx 403 on live). */
export default function GalleryPage() {
    const [events, setEvents] = useState<EventGroup[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventGroup | null>(null);
    const [filterMediaType, setFilterMediaType] = useState<'all' | 'image' | 'video'>('all');
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    // Fetch media from API and group by title; use local sample data if API is empty or unavailable
    useEffect(() => {
        const fetchMedia = async () => {
            const applyFallback = () => {
                setEvents(buildFallbackGalleryFromMock());
            };

            try {
                const res = await fetch(apiUrl('/media/'));

                if (!res.ok) throw new Error('Failed to fetch media');

                const data = await res.json();
                const rawResults = Array.isArray(data) ? data : data.results || [];
                // Only gallery CMS albums (heading + uploads). Excludes home/franchise Banner uploads.
                const results = rawResults.filter(
                    (item: { category?: string; section?: number | null; section_title?: string }) => {
                        if ((item.category || '').trim() === 'Banner') return false;
                        return item.section != null && Boolean((item.section_title || '').trim());
                    },
                );

                // Group by gallery heading id so title collisions cannot merge other media in.
                const albumBySectionId = new Map<number, EventGroup>();

                results.forEach((item: {
                    id: number;
                    section: number;
                    section_title?: string;
                    file?: string;
                    embed_url?: string;
                    media_type: MediaItem['media_type'];
                    caption?: string;
                    title?: string;
                    order?: number;
                }) => {
                    const sectionId = item.section;
                    const sectionTitle = (item.section_title || '').trim();
                    if (!albumBySectionId.has(sectionId)) {
                        albumBySectionId.set(sectionId, { title: sectionTitle, media: [] });
                    }
                    albumBySectionId.get(sectionId)!.media.push({
                        id: item.id,
                        file: item.file || '',
                        embed_url: item.embed_url || undefined,
                        media_type: item.media_type,
                        caption: item.caption || item.title || '',
                        order: typeof item.order === 'number' ? item.order : 0,
                    });
                });

                albumBySectionId.forEach((album) => {
                    album.media.sort((a, b) => (a.order !== b.order ? a.order - b.order : a.id - b.id));
                });

                const eventGroups: EventGroup[] = Array.from(albumBySectionId.values());

                if (eventGroups.length === 0) {
                    applyFallback();
                } else {
                    setEvents(eventGroups);
                }
                setLoading(false);
            } catch {
                applyFallback();
                setLoading(false);
            }
        };

        fetchMedia();
    }, []);

    // Filter media within selected event
    const filteredMedia = useMemo(() => {
        if (!selectedEvent) return [];
        if (filterMediaType === 'all') return selectedEvent.media;
        if (filterMediaType === 'video') {
            return selectedEvent.media.filter(m => m.media_type === 'video' || m.media_type === 'embed');
        }
        return selectedEvent.media.filter(m => m.media_type === filterMediaType);
    }, [selectedEvent, filterMediaType]);

    const handleEventClick = (event: EventGroup) => {
        setSelectedEvent(event);
        setFilterMediaType('all');
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

    // Navigate to next/previous media with keyboard arrows
    const navigateMedia = useCallback((direction: 'next' | 'prev') => {
        if (!selectedMedia) return;

        const currentIndex = filteredMedia.findIndex(m => m.id === selectedMedia.id);
        if (currentIndex === -1) return;

        let newIndex: number;

        if (direction === 'next') {
            // Loop to first if at end
            newIndex = (currentIndex + 1) % filteredMedia.length;
        } else {
            // Loop to last if at beginning
            newIndex = (currentIndex - 1 + filteredMedia.length) % filteredMedia.length;
        }

        setSelectedMedia(filteredMedia[newIndex]);
    }, [selectedMedia, filteredMedia]);

    // Keyboard navigation + lock body scroll while lightbox is open
    useEffect(() => {
        if (!selectedMedia) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                navigateMedia('next');
            } else if (e.key === 'ArrowLeft') {
                navigateMedia('prev');
            } else if (e.key === 'Escape') {
                closeLightbox();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedMedia, navigateMedia]);

    return (
        <div className="bg-[#FFFAF5] min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Hand className="w-8 h-8 text-yellow-400 -rotate-12 animate-wave" fill="currentColor" />
                        <span className="inline-block py-2 px-6 rounded-full bg-pink-50 text-pink-500 font-bold text-sm uppercase tracking-widest border border-pink-100">
                            Our Event Gallery
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-[#003366] mb-4 font-luckiest tracking-wider drop-shadow-sm">
                        {selectedEvent ? selectedEvent.title : (
                            <>Our <span className="text-[#ef5f5f]">Event Gallery</span></>
                        )}
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium italic">
                        Capturing the smiles, learning, and unforgettable moments at T.I.M.E. Kids.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {/* VIEW 1: EVENT LIST */}
                    {!selectedEvent ? (
                        <motion.div
                            key="event-list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {loading ? (
                                <div className="col-span-full text-center py-20">
                                    <p className="text-gray-500 text-lg font-bold">Loading events...</p>
                                </div>
                            ) : events.length > 0 ? (
                                events.map((event, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleEventClick(event)}
                                        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-[#fbd267]"
                                    >
                                        {/* Event Thumbnail (First Media Item) */}
                                        <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                                            {(() => {
                                                const thumb = thumbnailForEvent(event.media);
                                                if (!thumb) {
                                                    return (
                                                <div className="flex items-center justify-center h-full text-gray-300">
                                                    <ImageIcon size={48} />
                                                </div>
                                                    );
                                                }
                                                if (thumb.media_type === 'embed') {
                                                    return (
                                                <div className="flex items-center justify-center h-full bg-slate-800 text-white">
                                                    <Play size={48} className="opacity-80" />
                                                </div>
                                                    );
                                                }
                                                if (thumb.media_type === 'video') {
                                                    return (
                                                <video
                                                    src={mediaUrl(thumb.file)}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    muted
                                                    preload="metadata"
                                                />
                                                    );
                                                }
                                                return (
                                                <CmsImage
                                                    src={thumb.file}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                );
                                            })()}
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1">
                                                <ImageIcon size={14} />
                                                {event.media?.length || 0} Items
                                            </div>
                                        </div>

                                        {/* Event Details */}
                                        <div className="p-6">
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-[#ef5f5f] transition-colors">
                                                {event.title}
                                            </h3>
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <span className="text-[#003366] font-bold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center ml-auto">
                                                    View Gallery <ArrowLeft className="w-4 h-4 rotate-180 ml-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg font-bold">No events found.</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        /* VIEW 2: EVENT MEDIA DETAIL */
                        <motion.div
                            key="event-detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Toolbar */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-2xl">
                                <button
                                    onClick={handleBackToEvents}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm hover:shadow-md"
                                >
                                    <ArrowLeft className="w-5 h-5" /> Back to Events
                                </button>

                                <div className="flex bg-gray-200 p-1 rounded-full">
                                    <button
                                        onClick={() => setFilterMediaType('all')}
                                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${filterMediaType === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilterMediaType('image')}
                                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${filterMediaType === 'image' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Photos
                                    </button>
                                    <button
                                        onClick={() => setFilterMediaType('video')}
                                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${filterMediaType === 'video' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Videos
                                    </button>
                                </div>
                            </div>

                            {/* Media Grid */}
                            {filteredMedia.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {filteredMedia.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all hover:scale-[1.02] bg-gray-200"
                                            onClick={() => handleMediaClick(item)}
                                        >
                                            {item.media_type === 'embed' ? (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white">
                                                    <Play className="w-10 h-10 opacity-90" />
                                                </div>
                                            ) : item.media_type === 'video' ? (
                                                <video
                                                    src={mediaUrl(item.file)}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    preload="metadata"
                                                    muted
                                                />
                                            ) : (
                                                <CmsImage
                                                    src={item.file}
                                                    alt={item.caption || "Event Media"}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    sizes="(max-width: 768px) 50vw, 33vw"
                                                />
                                            )}
                                            {(item.media_type === 'video' || item.media_type === 'embed') && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                        <Play className="w-5 h-5 text-red-600 fill-current translate-x-0.5" />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 font-bold">No media found for this filter.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Full-screen lightbox — entire image visible on mobile */}
                {typeof document !== 'undefined' &&
                    createPortal(
                        <AnimatePresence>
                            {selectedMedia ? (
                                <motion.div
                                    key="gallery-lightbox"
                                    className="fixed inset-0 z-[9999] flex flex-col bg-slate-950/95 backdrop-blur-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label="Gallery photo viewer"
                                >
                                    <button
                                        type="button"
                                        onClick={closeLightbox}
                                        className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25 sm:right-5 sm:top-5"
                                        aria-label="Close"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                    {filteredMedia.length > 1 ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => navigateMedia('prev')}
                                                className="absolute left-2 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg transition hover:scale-105 sm:left-4"
                                                aria-label="Previous"
                                            >
                                                <ChevronLeft className="h-6 w-6" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => navigateMedia('next')}
                                                className="absolute right-2 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg transition hover:scale-105 sm:right-4"
                                                aria-label="Next"
                                            >
                                                <ChevronRight className="h-6 w-6" />
                                            </button>
                                        </>
                                    ) : null}

                                    <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto overscroll-contain px-3 pb-4 pt-14 sm:px-12 sm:pb-8 sm:pt-16">
                                        <AnimatePresence mode="wait">
                                            {selectedMedia.media_type === 'embed' ? (
                                                <motion.div
                                                    key={`embed-${selectedMedia.id}`}
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.98 }}
                                                    className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-lg bg-black"
                                                    style={{ maxHeight: 'min(80dvh, 720px)' }}
                                                >
                                                    <iframe
                                                        src={embedSrcForItem(selectedMedia) || ''}
                                                        title={selectedMedia.caption || 'Gallery video'}
                                                        className="absolute inset-0 h-full w-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </motion.div>
                                            ) : selectedMedia.media_type === 'video' ? (
                                                <motion.video
                                                    key={`video-${selectedMedia.id}`}
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.98 }}
                                                    src={mediaUrl(selectedMedia.file)}
                                                    controls
                                                    autoPlay
                                                    playsInline
                                                    className="mx-auto block max-h-[min(80dvh,calc(100dvh-8rem))] max-w-[min(96vw,56rem)] w-auto rounded-lg shadow-2xl"
                                                />
                                            ) : (
                                                <motion.img
                                                    key={`img-${selectedMedia.id}`}
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.98 }}
                                                    src={mediaUrl(selectedMedia.file)}
                                                    alt={selectedMedia.caption || 'Gallery photo'}
                                                    className="mx-auto block h-auto w-auto max-h-[min(88dvh,calc(100dvh-7rem))] max-w-[min(96vw,calc(100vw-1.5rem))] select-none object-contain object-center"
                                                    decoding="async"
                                                    draggable={false}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {selectedMedia.caption ? (
                                        <p className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-sm font-semibold text-white/90 sm:text-base">
                                            {selectedMedia.caption}
                                        </p>
                                    ) : null}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>,
                        document.body,
                    )}
            </div>
        </div>
    );
}

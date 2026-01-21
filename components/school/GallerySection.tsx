"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Play, Hand, Clock, ArrowLeft, Calendar, MapPin, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mediaUrl } from '@/lib/api-client';

interface MediaItem {
    id: number;
    file: string;
    media_type: 'IMAGE' | 'VIDEO';
    caption: string;
}

interface EventItem {
    id: number;
    title: string;
    description: string;
    start_date: string;
    year: number;
    media: MediaItem[];
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
    galleryItems?: OldGalleryItem[];
    events?: EventItem[];
}

export default function GallerySection({ schoolName, city, galleryItems = [], events = [] }: GallerySectionProps) {
    // Debug logging to verify data
    console.log('🎨 GallerySection Debug:', {
        schoolName,
        city,
        eventsCount: events.length,
        events: events.map(e => ({
            id: e.id,
            title: e.title,
            mediaCount: e.media?.length || 0,
            mediaItems: e.media
        })),
        galleryItemsCount: galleryItems.length
    });

    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    const [filterYear, setFilterYear] = useState<string>('');
    const [filterMediaType, setFilterMediaType] = useState<'all' | 'IMAGE' | 'VIDEO'>('all');

    // Extract Years from Events
    const eventYears = useMemo(() => {
        const years = new Set(events.map(e => e.year || new Date(e.start_date).getFullYear()));
        return Array.from(years).sort().reverse();
    }, [events]);

    // Filter Events by Year
    const filteredEvents = useMemo(() => {
        if (!filterYear) return events;
        return events.filter(e => (e.year || new Date(e.start_date).getFullYear()).toString() === filterYear);
    }, [events, filterYear]);

    // Filter Media within Selected Event
    const filteredMedia = useMemo(() => {
        if (!selectedEvent) return [];
        if (filterMediaType === 'all') return selectedEvent.media;
        return selectedEvent.media.filter(m => m.media_type === filterMediaType);
    }, [selectedEvent, filterMediaType]);

    const handleEventClick = (event: EventItem) => {
        console.log('📸 Event clicked:', event);
        setSelectedEvent(event);
        setFilterMediaType('all'); // Reset media filter when opening an event
    };

    const handleBackToEvents = () => {
        setSelectedEvent(null);
    };

    const handleMediaClick = (item: MediaItem) => {
        // Simple open in new tab for now, lightbox could be added later
        window.open(mediaUrl(item.file), '_blank');
    };

    return (
        <section id="gallery" className="py-16 bg-white scroll-mt-24 font-fredoka">
            <style jsx global>{`
                @keyframes shimmer {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .wavy-card {
                    --s: 10px;
                    padding: var(--s);
                    border: var(--s) solid transparent;
                    background: linear-gradient(45deg, #CD8C52, #FFD700, #F4A460, #8B4513, #CD8C52);
                    background-size: 300% 300%;
                    animation: shimmer 4s ease infinite;
                    border-radius: calc(2 * var(--s));
                    mask:
                        linear-gradient(#fff 0 0) content-box,
                        conic-gradient(#fff 0 0) padding-box; 
                    -webkit-mask:
                         linear-gradient(#fff 0 0) content-box,
                        conic-gradient(#fff 0 0) padding-box;
                    
                    /* Note: The complex wavy mask from previous CSS might need checking. 
                       Simplifying to a border gradient for robustness first, or reusing if proven works.
                       Let's stick to a cleaner card style for events 
                    */
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.3s ease;
                }
                
                .event-card {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    border: 2px solid #fff;
                }
                
                .event-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    border-color: #ffd700;
                }
            `}</style>
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Hand className="w-8 h-8 text-yellow-400 -rotate-12 animate-wave" fill="currentColor" />
                        <span className="inline-block py-2 px-6 rounded-full bg-pink-50 text-pink-500 font-bold text-sm uppercase tracking-widest border border-pink-100">
                            Gallery
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
                        {selectedEvent ? selectedEvent.title : `Life at ${schoolName}`}
                    </h2>

                    {!selectedEvent && (
                        <div className="flex justify-center max-w-xs mx-auto">
                            <div className="relative w-full">
                                <select
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                    className="w-full appearance-none bg-white border-2 border-gray-100 text-gray-700 py-3 px-6 pr-10 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold text-base cursor-pointer hover:border-yellow-200 transition-colors"
                                >
                                    <option value="">All Years</option>
                                    {eventYears.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    )}
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
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        onClick={() => handleEventClick(event)}
                                        className="event-card group cursor-pointer h-full flex flex-col"
                                    >
                                        {/* Event Thumbnail (First Media Item) */}
                                        <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                                            {event.media && event.media.length > 0 ? (
                                                <Image
                                                    src={mediaUrl(event.media[0].file)}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-300">
                                                    <ImageIcon size={48} className="lucide-image" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1">
                                                <ImageIcon size={14} className="lucide-image w-3.5 h-3.5" />
                                                {event.media?.length || 0} Items
                                            </div>
                                        </div>

                                        {/* Event Details */}
                                        <div className="p-6 flex-grow flex flex-col">
                                            <div className="flex items-center gap-2 text-sm text-yellow-600 font-bold mb-3 uppercase tracking-wider">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                                {event.title}
                                            </h3>
                                            {event.description && (
                                                <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed font-medium">
                                                    {event.description}
                                                </p>
                                            )}
                                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <span className="text-blue-500 font-bold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center ml-auto">
                                                    View Gallery <ArrowLeft className="w-4 h-4 rotate-180 ml-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg font-bold">No events found for the selected year.</p>
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
                                        onClick={() => setFilterMediaType('IMAGE')}
                                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${filterMediaType === 'IMAGE' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Photos
                                    </button>
                                    <button
                                        onClick={() => setFilterMediaType('VIDEO')}
                                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${filterMediaType === 'VIDEO' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
                                            className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all hover:scale-[1.02]"
                                            onClick={() => handleMediaClick(item)}
                                        >
                                            <Image
                                                src={mediaUrl(item.file)}
                                                alt={item.caption || "Event Media"}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                sizes="(max-width: 768px) 50vw, 33vw"
                                            />
                                            {item.media_type === 'VIDEO' && (
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
            </div>
        </section>
    );
}

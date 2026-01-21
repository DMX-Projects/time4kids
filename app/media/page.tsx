'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowLeft, Calendar, AlertCircle, Image as ImageIcon, Hand } from 'lucide-react';
import { SERVER_URL, mediaUrl } from '@/lib/api-client';

interface MediaItem {
    id: number;
    file: string;
    media_type: 'image' | 'video';
    caption: string;
}

interface EventGroup {
    title: string;
    media: MediaItem[];
}

export default function MediaPage() {
    const [events, setEvents] = useState<EventGroup[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventGroup | null>(null);
    const [filterMediaType, setFilterMediaType] = useState<'all' | 'image' | 'video'>('all');
    const [loading, setLoading] = useState(true);

    // Fetch media from API and group by title
    useEffect(() => {
        const fetchMedia = async () => {
            try {
                console.log('🎬 Fetching media from API...');
                const res = await fetch(`${SERVER_URL}/api/media/`);

                if (!res.ok) throw new Error('Failed to fetch media');

                const data = await res.json();
                const results = Array.isArray(data) ? data : data.results || [];

                console.log('📦 Fetched media items:', results.length);

                // Group media by extracting event name from title
                // e.g., "anuall day - 1" -> event: "Annual Day"
                const groupedEvents: { [key: string]: MediaItem[] } = {};

                results.forEach((item: any) => {
                    // Extract event name from title (before the dash)
                    const eventMatch = item.title.match(/^(.+?)\s*-\s*\d+$/);
                    const eventName = eventMatch
                        ? eventMatch[1].trim()
                        : item.title;

                    // Capitalize event name properly
                    const formattedEventName = eventName
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');

                    if (!groupedEvents[formattedEventName]) {
                        groupedEvents[formattedEventName] = [];
                    }

                    groupedEvents[formattedEventName].push({
                        id: item.id,
                        file: item.file,
                        media_type: item.media_type,
                        caption: item.title,
                    });
                });

                // Convert to array of EventGroup
                const eventGroups: EventGroup[] = Object.entries(groupedEvents).map(([title, media]) => ({
                    title,
                    media
                }));

                console.log('✅ Grouped into events:', eventGroups);
                setEvents(eventGroups);
                setLoading(false);
            } catch (error) {
                console.error('❌ Error loading media:', error);
                setLoading(false);
            }
        };

        fetchMedia();
    }, []);

    // Filter media within selected event
    const filteredMedia = useMemo(() => {
        if (!selectedEvent) return [];
        if (filterMediaType === 'all') return selectedEvent.media;
        return selectedEvent.media.filter(m => m.media_type === filterMediaType);
    }, [selectedEvent, filterMediaType]);

    const handleEventClick = (event: EventGroup) => {
        console.log('📸 Event clicked:', event);
        setSelectedEvent(event);
        setFilterMediaType('all');
    };

    const handleBackToEvents = () => {
        setSelectedEvent(null);
    };

    const handleMediaClick = (item: MediaItem) => {
        window.open(mediaUrl(item.file), '_blank');
    };

    return (
        <div className="bg-[#FFFAF5] min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Hand className="w-8 h-8 text-yellow-400 -rotate-12 animate-wave" fill="currentColor" />
                        <span className="inline-block py-2 px-6 rounded-full bg-pink-50 text-pink-500 font-bold text-sm uppercase tracking-widest border border-pink-100">
                            Gallery
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-[#003366] mb-4 font-luckiest tracking-wider drop-shadow-sm">
                        {selectedEvent ? selectedEvent.title : (
                            <>Our <span className="text-[#ef5f5f]">Gallery</span></>
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
                                            {event.media && event.media.length > 0 ? (
                                                <Image
                                                    src={mediaUrl(event.media[0].file)}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-300">
                                                    <ImageIcon size={48} />
                                                </div>
                                            )}
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
                                            {item.media_type === 'video' && (
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
        </div>
    );
}

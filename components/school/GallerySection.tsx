"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Play, Hand, Clock, Image as ImageIcon, Video, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mediaUrl } from '@/lib/api-client';

interface GalleryItem {
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
    galleryItems?: GalleryItem[];
}

export default function GallerySection({ schoolName, city, galleryItems = [] }: GallerySectionProps) {
    const [filterType, setFilterType] = useState<'all' | 'photo' | 'video'>('all');

    // Extract Filters
    const years = useMemo(() => Array.from(new Set(galleryItems.map(item => item.academic_year))).sort().reverse(), [galleryItems]);
    const events = useMemo(() => Array.from(new Set(galleryItems.map(item => item.event_category))).sort(), [galleryItems]);

    const [selectedYear, setSelectedYear] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('');

    const filteredItems = useMemo(() => {
        return galleryItems.filter(item => {
            const matchesYear = selectedYear ? item.academic_year === selectedYear : true;
            const matchesEvent = selectedEvent ? item.event_category === selectedEvent : true;
            const matchesType = filterType === 'all' ? true : item.media_type === filterType;
            return matchesYear && matchesEvent && matchesType;
        });
    }, [galleryItems, selectedYear, selectedEvent, filterType]);

    const handleItemClick = (item: GalleryItem) => {
        if (item.media_type === 'video' && item.video_link) {
            window.open(item.video_link, '_blank');
        }
        // Future: Add photo lightbox
    };

    return (
        <section id="gallery" className="py-16 bg-white scroll-mt-24">
            <style jsx global>{`
                @keyframes shimmer {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .wavy-image-card {
                    --s: 10px; /* Control curve size */
                    width: 280px; 
                    height: 280px;
                    padding: var(--s);
                    border: var(--s) solid transparent;
                    
                    /* Animated Gradient Background */
                    background: linear-gradient(45deg, #CD8C52, #FFD700, #F4A460, #8B4513, #CD8C52);
                    background-size: 300% 300%;
                    animation: shimmer 4s ease infinite;

                    border-radius: calc(3 * var(--s));
                    mask:
                        radial-gradient(calc(1.414 * var(--s)), #000 calc(100% - 1px), transparent),
                        conic-gradient(#000 0 0) content-box,
                        radial-gradient(calc(1.414 * var(--s)), transparent 100%, #000 calc(100% + 1px)) var(--s) var(--s) padding-box;
                    mask-size: calc(var(--s) * 4) calc(var(--s) * 4);
                    
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                
                .wavy-image-card:hover {
                    transform: scale(1.05) rotate(2deg);
                    z-index: 10;
                    animation-duration: 2s;
                }
                
                @media (min-width: 768px) {
                     .wavy-image-card { 
                        width: 320px; 
                        height: 320px;
                        --s: 14px; 
                     }
                }
            `}</style>

            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Hand className="w-8 h-8 text-yellow-400 -rotate-12 animate-wave" fill="currentColor" />
                        <span className="inline-block py-2 px-6 rounded-full bg-pink-50 text-pink-500 font-bold text-sm uppercase tracking-widest border border-pink-100">
                            Gallery
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-fredoka font-bold text-gray-900 mb-6">Life at {schoolName}</h2>

                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto mb-10 mt-8">
                        {/* Type Filters (Pills) */}
                        <div className="flex bg-gray-100 p-1 rounded-full">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filterType === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterType('photo')}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filterType === 'photo' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Photos
                            </button>
                            <button
                                onClick={() => setFilterType('video')}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filterType === 'video' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Videos
                            </button>
                        </div>

                        {/* Date/Year Select */}
                        <div className="relative w-full md:w-48">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm"
                            >
                                <option value="">All Years</option>
                                {years.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Event Select */}
                        <div className="relative w-full md:w-64">
                            <select
                                value={selectedEvent}
                                onChange={(e) => setSelectedEvent(e.target.value)}
                                className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm"
                            >
                                <option value="">All Events</option>
                                {events.map(event => <option key={event} value={event}>{event}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* No Items Message */}
                    {filteredItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center py-12 text-gray-400">
                            <div className="bg-gray-50 rounded-full p-6 mb-4">
                                <AlertCircle size={48} className="opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-600 mb-2">No Items Found</h3>
                            <p>We couldn't find any items matching your selected filters.</p>
                        </div>
                    )}
                </div>

                <div className="min-h-[300px]">
                    <AnimatePresence mode='popLayout'>
                        {filteredItems.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                                {filteredItems.map((item, index) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        key={item.id}
                                        className="wavy-image-card group"
                                        onClick={() => handleItemClick(item)}
                                        title={`${item.title} (${item.academic_year})`}
                                    >
                                        <div className="relative w-full h-full rounded-[10px] overflow-hidden bg-white">
                                            <Image
                                                src={mediaUrl(item.image)}
                                                alt={item.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                unoptimized
                                            />
                                            {/* Video Overlay */}
                                            {item.media_type === 'video' && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                                    <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/60 shadow-lg group-hover:scale-110 transition-transform">
                                                        <Play className="w-6 h-6 text-white fill-current translate-x-0.5" />
                                                    </div>
                                                </div>
                                            )}
                                            {/* Text Overlay on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                                <p className="text-white text-base font-bold truncate w-full font-fredoka">{item.title}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

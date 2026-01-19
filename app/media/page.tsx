'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_MEDIA_ITEMS, MediaItem } from '@/lib/mock-media-data';
import { Play, X, ChevronLeft, ChevronRight, Image as ImageIcon, Film } from 'lucide-react';
import { SERVER_URL } from '@/lib/api-client';

export default function MediaPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

    // Fetch media from API
    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await fetch(`${SERVER_URL}/api/media/`);
                if (!res.ok) throw new Error('Failed to fetch media');

                const data = await res.json();
                const results = Array.isArray(data) ? data : data.results || [];

                // Map API response to MediaItem interface
                const mappedItems: MediaItem[] = results.map((item: any) => {
                    const fileUrl = item.file.startsWith('http')
                        ? item.file
                        : `${SERVER_URL}${item.file.startsWith('/') ? '' : '/'}${item.file}`;

                    return {
                        id: item.id,
                        type: item.media_type,
                        src: mediaUrl(item.file),
                        title: item.title,
                        category: item.category || 'Events',
                        size: 'normal',
                        thumb: item.media_type === 'video' ? '/images/event-1.jpg' : undefined
                    };
                });

                setMediaItems(mappedItems);
            } catch (error) {
                console.error('Error loading media:', error);
                // Fallback to mock data if API fails (optional, removing for now to force API usage)
                // setMediaItems(MOCK_MEDIA_ITEMS); 
            }
        };

        fetchMedia();
    }, []);

    const categories = ['All', 'Events', 'Classroom', 'Activities', 'Campus'];

    const filteredItems = selectedCategory === 'All'
        ? mediaItems
        : mediaItems.filter(item => item.category === selectedCategory);

    const openLightbox = (item: MediaItem) => setLightboxItem(item);
    const closeLightbox = () => setLightboxItem(null);

    const navigateLightbox = (direction: 'next' | 'prev') => {
        if (!lightboxItem) return;
        const currentIndex = filteredItems.findIndex(i => i.id === lightboxItem.id);
        const newIndex = direction === 'next'
            ? (currentIndex + 1) % filteredItems.length
            : (currentIndex - 1 + filteredItems.length) % filteredItems.length;
        setLightboxItem(filteredItems[newIndex]);
    };

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxItem) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') navigateLightbox('next');
            if (e.key === 'ArrowLeft') navigateLightbox('prev');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxItem]);

    return (
        <div className="bg-[#FFFAF5] min-h-screen pt-32 pb-20">
            {/* Header Section */}
            <div className="container mx-auto px-4 mb-12">
                <div className="text-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold text-[#003366] mb-4 font-luckiest tracking-wider drop-shadow-sm">
                            Our <span className="text-[#ef5f5f]">Gallery</span>
                        </h1>
                    </motion.div>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium italic">
                        Capturing the smiles, learning, and unforgettable moments at T.I.M.E. Kids.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-4 mt-10">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${selectedCategory === cat
                                ? 'bg-[#fbd267] text-[#003366] shadow-lg scale-105'
                                : 'bg-white text-gray-500 hover:bg-gray-50 border-2 border-transparent hover:border-[#fbd267]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="container mx-auto px-4">
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px] grid-flow-dense">
                    <AnimatePresence>
                        {filteredItems.map((item) => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.4 }}
                                className={`relative group rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gray-100 ${item.size === 'wide' ? 'md:col-span-2' :
                                    item.size === 'tall' ? 'row-span-2' : ''
                                    }`}
                                onClick={() => openLightbox(item)}
                            >
                                {item.type === 'video' ? (
                                    <div className="relative w-full h-full">
                                        <video
                                            src={item.src}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                            muted
                                            playsInline
                                            poster={item.thumb}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
                                                <Play fill="white" className="text-white ml-1" size={32} />
                                            </div>
                                        </div>
                                        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                            <Film size={14} /> Video
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={item.src}
                                            alt={item.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                            <p className="text-white font-bold text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{item.title}</p>
                                            <p className="text-white/80 text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">{item.category}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                        onClick={closeLightbox}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                            onClick={closeLightbox}
                        >
                            <X size={40} />
                        </button>

                        {/* Navigation */}
                        <button
                            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors hidden md:block"
                            onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                        >
                            <ChevronLeft size={60} />
                        </button>
                        <button
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors hidden md:block"
                            onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                        >
                            <ChevronRight size={60} />
                        </button>

                        {/* Content */}
                        <div
                            className="relative w-full max-w-5xl max-h-[85vh] aspect-video rounded-lg overflow-hidden shadow-2xl bg-black"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {lightboxItem.type === 'video' ? (
                                <video
                                    src={lightboxItem.src}
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay
                                />
                            ) : (
                                <Image
                                    src={lightboxItem.src}
                                    alt={lightboxItem.title}
                                    fill
                                    className="object-contain"
                                />
                            )}
                        </div>

                        {/* Caption */}
                        <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none">
                            <h3 className="text-white text-2xl font-bold font-luckiest tracking-wide drop-shadow-md">{lightboxItem.title}</h3>
                            <p className="text-white/70 text-lg">{lightboxItem.category}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

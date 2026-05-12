'use client';

import React, { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Play, Sparkles } from 'lucide-react';
import FluidBackground from '@/components/ui/FluidBackground';

import { apiUrl, mediaUrl } from '@/lib/api-client';

const TestimonialsSection = () => {
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<any[]>([]);
    const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
    const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

    const STATIC_TESTIMONIALS = [
        {
            title: "Exploring & Learning",
            author: "T.I.M.E. Kids",
            location: "Main Branch",
            thumbnailUrl: "/Explore and Learn.png",
            type: 'image'
        },
        {
            title: "Morning Assembly",
            author: "T.I.M.E. Kids",
            location: "Chennai City",
            thumbnailUrl: "/Morning Assembly.png",
            type: 'image'
        },
        {
            title: "Ramzan Celebrations",
            author: "T.I.M.E. Kids",
            location: "Main Branch",
            thumbnailUrl: "/event-1.jpg",
            type: 'image'
        },
        {
            title: "Creative Arts Session",
            author: "T.I.M.E. Kids",
            location: "Trichy Center",
            thumbnailUrl: "/event-3.jpg",
            type: 'image'
        },
        {
            title: "Annual Day Celebrations",
            author: "T.I.M.E. Kids Kilpauk",
            location: "Chennai",
            videoUrl: "/chaninai kilpauk-AnnualDay-Video-2018-19.mp4",
            thumbnailUrl: "/feature-annual-day-celebrations.png",
            type: 'video'
        },
        {
            title: "Christmas Celebrations",
            author: "T.I.M.E. Kids",
            location: "Salem Branch",
            thumbnailUrl: "/event-2.jpg",
            type: 'image'
        },
        {
            title: "Graduation Day Celebrations",
            author: "T.I.M.E. Kids",
            location: "Trichy Branch",
            thumbnailUrl: "/event-4.jpg",
            type: 'image'
        },
        {
            title: "Fun Time at School",
            author: "T.I.M.E. Kids Chennai",
            location: "Chennai",
            videoUrl: "/chennai2.mp4",
            thumbnailUrl: "/event-2.jpg",
            type: 'video'
        },
        {
            title: "Activity Highlights",
            author: "T.I.M.E. Kids Trichy",
            location: "Raja Colony",
            videoUrl: "/trichy-rajacolony.mp4",
            thumbnailUrl: "/5.jpeg",
            type: 'video'
        },
    ];

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                // Fetch from the media endpoint
                const response = await fetch(apiUrl('/media/'));
                let itemsToGroup = [];

                if (response.ok) {
                    const data = await response.json();
                    itemsToGroup = Array.isArray(data) ? data : data.results || [];
                }

                if (itemsToGroup.length === 0) {
                    // Fallback to static items if API is empty or fails
                    itemsToGroup = STATIC_TESTIMONIALS.map((item, id) => ({
                        ...item,
                        id: `static-${id}`,
                        file: item.thumbnailUrl // For consistent mapping
                    }));
                }

                // Group items by title (removing numerical suffixes like " - 1")
                const groupsMap: Record<string, any[]> = {};
                itemsToGroup.forEach((item: any) => {
                    const baseTitle = item.title.replace(/\s*-\s*\d+$/, '').trim();
                    if (!groupsMap[baseTitle]) {
                        groupsMap[baseTitle] = [];
                    }
                    groupsMap[baseTitle].push({
                        title: item.title,
                        author: item.author || 'T.I.M.E. Kids',
                        location: item.location || 'Main Branch',
                        thumbnailUrl: item.file?.startsWith('http') ? item.file : mediaUrl(item.file || item.thumbnailUrl),
                        videoUrl: (item.media_type === 'video' || item.type === 'video') ? (item.file?.startsWith('http') ? item.file : mediaUrl(item.file || item.videoUrl)) : null,
                        type: item.media_type || item.type || 'image'
                    });
                });

                const grouped = Object.entries(groupsMap).map(([title, items]) => ({
                    title,
                    items
                }));

                setGroups(grouped);
            } catch (error) {
                console.error('Error fetching media:', error);
                // Fallback on error
                const fallbackGroupsMap: Record<string, any[]> = {};
                STATIC_TESTIMONIALS.forEach((item: any) => {
                    const baseTitle = item.title.replace(/\s*-\s*\d+$/, '').trim();
                    if (!fallbackGroupsMap[baseTitle]) fallbackGroupsMap[baseTitle] = [];
                    fallbackGroupsMap[baseTitle].push(item);
                });
                setGroups(Object.entries(fallbackGroupsMap).map(([title, items]) => ({ title, items })));
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    // Fetch once on mount; static fallback data is intentionally in-component content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const nextMedia = useCallback(() => {
        if (activeGroupIndex !== null) {
            const group = groups[activeGroupIndex];
            setActiveItemIndex((activeItemIndex + 1) % group.items.length);
        }
    }, [activeGroupIndex, activeItemIndex, groups]);

    const prevMedia = useCallback(() => {
        if (activeGroupIndex !== null) {
            const group = groups[activeGroupIndex];
            setActiveItemIndex((activeItemIndex - 1 + group.items.length) % group.items.length);
        }
    }, [activeGroupIndex, activeItemIndex, groups]);

    // Organic line paths for the fluid animation (Hollow/Stroked effect)
    const organicLinePaths = [
        "M0,50 C360,90 720,10 1080,90 1440,50",
        "M0,50 C400,20 800,80 1200,20 1440,50",
        "M0,50 C300,80 600,20 1000,80 1440,50",
        "M0,50 C360,90 720,10 1080,90 1440,50"
    ];

    const getGridClass = (index: number) => {
        // Handle dynamic number of items by looping through patterns
        const patternIndex = index % 9;
        switch (patternIndex) {
            // Column 1
            case 0: return "md:col-start-1 md:row-start-1 md:row-span-2"; // Tall
            case 1: return "md:col-start-1 md:row-start-3 md:row-span-1";
            case 2: return "md:col-start-1 md:row-start-4 md:row-span-1";
            // Column 2
            case 3: return "md:col-start-2 md:row-start-1 md:row-span-1";
            case 4: return "md:col-start-2 md:row-start-2 md:row-span-2"; // Tall
            case 5: return "md:col-start-2 md:row-start-4 md:row-span-1";
            // Column 3
            case 6: return "md:col-start-3 md:row-start-1 md:row-span-1";
            case 7: return "md:col-start-3 md:row-start-2 md:row-span-1";
            case 8: return "md:col-start-3 md:row-start-3 md:row-span-2"; // Tall
            default: return "";
        }
    };

    useEffect(() => {
        if (activeGroupIndex !== null) {
            document.body.classList.add('lightbox-open');
        } else {
            document.body.classList.remove('lightbox-open');
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (activeGroupIndex === null) return;
            if (e.key === 'ArrowRight') nextMedia();
            if (e.key === 'ArrowLeft') prevMedia();
            if (e.key === 'Escape') setActiveGroupIndex(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.classList.remove('lightbox-open');
        };
    }, [activeGroupIndex, activeItemIndex, nextMedia, prevMedia]);

    return (
        <section className="relative overflow-hidden bg-[#fff8ec] py-20 md:py-28">
            <style jsx global>{`
                body.lightbox-open {
                    overflow: hidden !important;
                }
                body.lightbox-open .header,
                body.lightbox-open .header-top {
                    display: none !important;
                }
            `}</style>

            {/* Animated Fluid Background */}
            <FluidBackground className="opacity-35" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_12%_18%,rgba(251,146,60,0.16),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(125,211,252,0.18),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,248,236,0.78))]" />


            <div className="container mx-auto px-4 relative z-10">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-lg shadow-orange-200/20 backdrop-blur-xl"
                    >
                        <Sparkles size={16} className="text-orange-500" />
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">School moments gallery</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="font-display text-4xl font-black leading-tight tracking-[-0.02em] text-slate-800 md:text-6xl"
                    >
                        Joyful <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-sky-400 bg-clip-text text-transparent">Campus Stories</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.08 }}
                        className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 md:text-lg"
                    >
                        A warm look at celebrations, activities, assemblies, and little everyday wins from T.I.M.E. Kids.
                    </motion.p>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-3 relative z-10 h-auto max-w-7xl mx-auto gap-5 md:gap-6 ${groups.length > 0 ? 'md:h-[980px] md:grid-rows-4' : ''}`}>
                    {loading ? (
                        <div className="col-span-3 flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F15A29]"></div>
                        </div>
                    ) : (
                        groups.map((group, index) => (
                            <motion.div
                                key={index}
                                className={`relative group cursor-pointer overflow-hidden rounded-[2rem] border-[8px] border-white/80 bg-white shadow-[0_22px_65px_rgba(15,23,42,0.13)] ${getGridClass(index)} min-h-[260px] md:min-h-0`}
                                initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                viewport={{ once: true, margin: '-80px' }}
                                whileHover={{ y: -8, scale: 1.012 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                onClick={() => {
                                    setActiveGroupIndex(index);
                                    setActiveItemIndex(0);
                                }}
                            >
                                <Image
                                    src={group.items[0].thumbnailUrl}
                                    alt={group.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/48 via-transparent to-white/5 opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.34),transparent_28%)] opacity-70" />

                                {/* Album Badge */}
                                <div className="absolute top-4 left-4 z-20 max-w-[calc(100%-2rem)]">
                                    <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/88 px-3.5 py-2 shadow-lg backdrop-blur-md">
                                        {group.items[0].type === 'video' ? <Play size={13} className="text-[#F15A29]" fill="currentColor" /> : <ImageIcon size={13} className="text-[#F15A29]" />}
                                        <h3 className="truncate text-[#003366] text-[11px] font-black uppercase tracking-[0.12em]">{group.title}</h3>
                                    </div>
                                </div>

                                {/* Count Badge */}
                                {group.items.length > 1 && (
                                    <div className="absolute bottom-4 right-4 z-20">
                                        <div className="bg-[#F15A29] text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.12em] shadow-lg">
                                            {group.items.length} Files
                                        </div>
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-[#003366]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        className="w-16 h-16 bg-white text-[#F15A29] rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </motion.div>
                                </div>

                                {/* Play Button for video featured albums */}
                                {group.items[0].type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity">
                                        <div className="w-12 h-12 bg-white/92 rounded-full flex items-center justify-center shadow-lg">
                                            <svg className="w-6 h-6 text-[#F15A29] ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )))}
                </div>
            </div>

            <AnimatePresence>
                {activeGroupIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveGroupIndex(null)}
                        className="fixed inset-0 z-[10000] bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setActiveGroupIndex(null)}
                            className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors z-50 p-2"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Navigation buttons */}
                        {groups[activeGroupIndex].items.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 z-50"
                                >
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 z-50"
                                >
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {/* Content */}
                        <motion.div
                            key={`${activeGroupIndex}-${activeItemIndex}`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-auto max-w-[90vw] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="flex-1 flex items-center justify-center overflow-hidden bg-black/20">
                                {groups[activeGroupIndex].items[activeItemIndex].type === 'video' ? (
                                    <video
                                        src={groups[activeGroupIndex].items[activeItemIndex].videoUrl}
                                        controls
                                        autoPlay
                                        className="max-w-full max-h-[60vh] w-auto h-auto"
                                    />
                                ) : (
                                    <div className="relative w-[80vw] h-[60vh]">
                                        <Image
                                            src={groups[activeGroupIndex].items[activeItemIndex].thumbnailUrl}
                                            alt={groups[activeGroupIndex].items[activeItemIndex].title}
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Caption */}
                            <div className="p-6 bg-white/10 backdrop-blur-md">
                                <h3 className="text-white text-xl font-black uppercase tracking-tight">{groups[activeGroupIndex].items[activeItemIndex].title}</h3>
                                <p className="text-white/60 text-sm font-bold">{groups[activeGroupIndex].items[activeItemIndex].author} - {groups[activeGroupIndex].items[activeItemIndex].location}</p>
                                <div className="mt-2 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                                    {activeItemIndex + 1} of {groups[activeGroupIndex].items.length} in {groups[activeGroupIndex].title}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


        </section>
    );
};

export default TestimonialsSection;

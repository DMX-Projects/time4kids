'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FluidBackground from '@/components/ui/FluidBackground';

import { apiUrl, mediaUrl } from '@/lib/api-client';

const TestimonialsSection = () => {
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [testimonials, setTestimonials] = useState<any[]>([]);

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
            thumbnailUrl: "/day care.png",
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
                // Fetch from the media endpoint (mapped to gallery app)
                const response = await fetch(apiUrl('/media/'));
                if (response.ok) {
                    const data = await response.json();
                    const results = Array.isArray(data) ? data : data.results || [];

                    if (results.length > 0) {
                        // Map backend fields to frontend format
                        const mappedItems = results.map((item: any) => ({
                            title: item.title,
                            author: item.author || 'T.I.M.E. Kids',
                            location: item.location || 'Main Branch',
                            thumbnailUrl: mediaUrl(item.file),
                            videoUrl: item.media_type === 'video' ? mediaUrl(item.file) : null,
                            type: item.media_type
                        }));
                        setTestimonials(mappedItems);
                    } else {
                        setTestimonials(STATIC_TESTIMONIALS);
                    }
                } else {
                    setTestimonials(STATIC_TESTIMONIALS);
                }
            } catch (error) {
                console.error('Error fetching media:', error);
                setTestimonials(STATIC_TESTIMONIALS);
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, []);


    const nextMedia = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex + 1) % testimonials.length);
        }
    };

    const prevMedia = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex - 1 + testimonials.length) % testimonials.length);
        }
    };

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
        if (lightboxIndex !== null) {
            document.body.classList.add('lightbox-open');
        } else {
            document.body.classList.remove('lightbox-open');
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'ArrowRight') nextMedia();
            if (e.key === 'ArrowLeft') prevMedia();
            if (e.key === 'Escape') setLightboxIndex(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.classList.remove('lightbox-open');
        };
    }, [lightboxIndex]);

    return (
        <section className="relative py-24 bg-white overflow-hidden">
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
            <FluidBackground className="opacity-60" />


            <div className="container mx-auto px-4 relative z-10">
                <div className={`grid grid-cols-1 md:grid-cols-3 relative z-10 h-auto max-w-7xl mx-auto gap-8 ${testimonials.length > 0 ? 'md:h-[1100px] md:grid-rows-4' : ''}`}>
                    {loading ? (
                        <div className="col-span-3 flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F15A29]"></div>
                        </div>
                    ) : (
                        testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                className={`relative group cursor-pointer overflow-hidden rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] ${getGridClass(index)}`}
                                whileHover={{ y: -10, scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                onClick={() => setLightboxIndex(index)}
                            >
                                <img
                                    src={testimonial.thumbnailUrl}
                                    alt={testimonial.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        className="w-20 h-20 bg-[#F15A29] rounded-full flex items-center justify-center shadow-2xl"
                                    >
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </motion.div>
                                </div>

                                {/* Play Button for videos (non-hover) */}
                                {testimonial.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity">
                                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
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

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxIndex(null)}
                        className="fixed inset-0 z-[10000] bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setLightboxIndex(null)}
                            className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors z-50 p-2"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Navigation buttons */}
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

                        {/* Content */}
                        <motion.div
                            key={lightboxIndex}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-auto max-w-[90vw] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="flex-1 flex items-center justify-center overflow-hidden bg-black/20">
                                {testimonials[lightboxIndex].type === 'video' ? (
                                    <video
                                        src={testimonials[lightboxIndex].videoUrl}
                                        controls
                                        autoPlay
                                        className="max-w-full max-h-[60vh] w-auto h-auto"
                                    />
                                ) : (
                                    <img
                                        src={testimonials[lightboxIndex].thumbnailUrl}
                                        alt={testimonials[lightboxIndex].title}
                                        className="max-w-full max-h-[60vh] w-auto h-auto object-contain"
                                    />
                                )}
                            </div>

                            {/* Caption - more minimal like the 2nd image */}
                            <div className="p-6 bg-white/10 backdrop-blur-md">
                                <h3 className="text-white text-xl font-bold">{testimonials[lightboxIndex].title}</h3>
                                <p className="text-white/60 text-sm">{testimonials[lightboxIndex].author} - {testimonials[lightboxIndex].location}</p>
                                <div className="mt-2 text-white/40 text-[10px] uppercase tracking-widest">
                                    {lightboxIndex + 1} of {testimonials.length}
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
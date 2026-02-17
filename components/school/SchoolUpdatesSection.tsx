"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface Update {
    id: number;
    text: string;
    start_date: string;
    end_date: string | null;
}

interface SchoolUpdatesSectionProps {
    franchiseSlug: string;
}

export default function SchoolUpdatesSection({ franchiseSlug }: SchoolUpdatesSectionProps) {
    const [updates, setUpdates] = useState<Update[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/updates/?franchise_slug=${franchiseSlug}`);
                if (res.ok) {
                    const data = await res.json();
                    const updatesList = Array.isArray(data) ? data : data?.results || [];
                    setUpdates(updatesList);
                }
            } catch (error) {
                console.error("Failed to fetch updates:", error);
            } finally {
                setLoading(false);
            }
        };

        if (franchiseSlug) {
            fetchUpdates();
        }
    }, [franchiseSlug]);

    useEffect(() => {
        if (updates.length > 0 && currentIndex >= updates.length) {
            setCurrentIndex(0);
        }
    }, [updates, currentIndex]);

    useEffect(() => {
        if (updates.length > 1 && !isPaused) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % updates.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [updates.length, isPaused]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % updates.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? updates.length - 1 : prev - 1));
    };

    if (loading) return null;
    if (updates.length === 0) return null;

    const formatDateRange = (start: string, end: string | null) => {
        const startDate = new Date(start).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        if (!end) return startDate;
        const endDate = new Date(end).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        return `${startDate} - ${endDate}`;
    };

    return (
        <section
            className="py-20 relative overflow-hidden bg-cover bg-center bg-no-repeat"
            id="updates"
            style={{ backgroundImage: "url('/updates-bg.png')" }}
        >
            {/* Overlay for better readability if needed */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-0" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#111827] font-display">
                        Updates
                    </h2>
                    <div className="w-24 h-1.5 bg-[#FF9F1C] mx-auto rounded-full mt-4" />
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mt-6 font-medium">
                        Stay connected with our latest news, exciting events, and important announcements!
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 min-h-[500px]">

                    {/* Left Side: Pencil with Today's Update(s) Text */}
                    <div className="w-full lg:w-[30%] relative flex justify-center lg:justify-start">
                        <div className="relative w-full max-w-[380px] aspect-[3/1]">
                            <img
                                src="/pencil.png"
                                alt="Pencil Icon"
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <h4 className="text-[#0F3B67] text-xl md:text-2xl font-bold font-handwriting pr-50 md:pr-50">
                                    Today's Update(s)
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Notice Board with Updates */}
                    <div className="w-full lg:w-[70%] relative">
                        {/* Wooden Board Background */}
                        <div
                            className="relative w-full max-w-[900px] mx-auto overflow-hidden rounded-[2.5rem] group"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            <img
                                src="/notice board.png"
                                alt="Notice Board"
                                className="w-full h-auto"
                            />

                            {/* Section 1: Date (Top Area - Hidden on hover) */}
                            <div className="absolute inset-x-0 top-[38%] md:top-[34%] flex justify-center pointer-events-none px-12 z-20 group-hover:opacity-0 transition-opacity duration-300">
                                <AnimatePresence mode="wait">
                                    {updates[currentIndex] && (
                                        <motion.div
                                            key={`date-${currentIndex}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.1 }}
                                            className="inline-flex items-center gap-3 bg-[#8B5A2B]/15 backdrop-blur-md px-8 py-3 rounded-full text-[#4A3728] text-base md:text-xl font-extrabold border border-[#8B5A2B]/20 shadow-lg shadow-[#8B5A2B]/5"
                                        >
                                            <Calendar className="w-6 h-6 text-[#8B5A2B]" />
                                            <span className="tracking-tight">{formatDateRange(updates[currentIndex].start_date, updates[currentIndex].end_date)}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Section 2: Text (Main Area) */}
                            <div className="absolute inset-x-4 md:inset-x-8 bottom-[10%] top-[45%] flex items-center justify-center px-8 md:px-16 pointer-events-auto">
                                <div className="w-full text-center relative">
                                    <AnimatePresence mode="wait">
                                        {updates[currentIndex] && (
                                            <div key={currentIndex}>
                                                <motion.div
                                                    key={`text-${currentIndex}`}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.05 }}
                                                    transition={{ duration: 0.4 }}
                                                    className="w-full group-hover:opacity-0 transition-opacity duration-300"
                                                >
                                                    <h3 className="text-base md:text-xl lg:text-2xl font-handwriting leading-relaxed font-bold text-[#4A3728] tracking-wide line-clamp-4 cursor-help whitespace-pre-wrap">
                                                        "{updates[currentIndex].text}"
                                                    </h3>
                                                </motion.div>

                                                {/* Hover Inner Board (Popup) */}
                                                <div className="absolute inset-0 -top-20 -bottom-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 z-50 flex items-center justify-center">
                                                    <div className="bg-[#F4E3C1] w-full h-full p-6 md:p-8 rounded-3xl shadow-inner border border-[#8B5A2B]/20 flex flex-col items-center">
                                                        {/* Date inside the beige board */}
                                                        <div className="inline-flex items-center gap-2 text-[#4A3728]/70 text-sm md:text-base font-bold mb-4 border-b border-[#8B5A2B]/20 pb-2 w-full justify-center">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatDateRange(updates[currentIndex].start_date, updates[currentIndex].end_date)}</span>
                                                        </div>

                                                        <div className="w-full flex-1 overflow-y-auto custom-scrollbar pr-2">
                                                            <p className="text-[#4A3728] text-base md:text-xl font-handwriting font-bold leading-relaxed whitespace-pre-wrap">
                                                                "{updates[currentIndex].text}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Controls Overlayed on Board */}
                            {updates.length > 1 && (
                                <>
                                    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-30 group-hover:opacity-20 transition-opacity">
                                        {updates.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentIndex(idx)}
                                                className={`transition-all duration-300 rounded-full h-2 ${idx === currentIndex
                                                    ? "w-8 bg-[#FF9F1C]"
                                                    : "w-2 bg-[#8B5A2B]/40 hover:bg-[#8B5A2B]/60"
                                                    }`}
                                                aria-label={`Go to slide ${idx + 1}`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={prevSlide}
                                        className="absolute left-4 top-[55%] -translate-y-1/2 p-2 rounded-full bg-[#8B5A2B]/10 hover:bg-[#8B5A2B]/20 text-[#8B5A2B] transition-all z-30 border border-[#8B5A2B]/20 group-hover:opacity-20"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="absolute right-4 top-[55%] -translate-y-1/2 p-2 rounded-full bg-[#8B5A2B]/10 hover:bg-[#8B5A2B]/20 text-[#8B5A2B] transition-all z-30 border border-[#8B5A2B]/20 group-hover:opacity-20"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
'use client';

import React, { useState } from 'react';
import TestimonialVideo from '@/components/shared/TestimonialVideo';

const TestimonialsSection = () => {
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);

    const testimonials = [
        {
            title: "Annual Day Celebrations 2018-19",
            author: "T.I.M.E. Kids Kilpauk",
            location: "Chennai",
            videoUrl: "/chaninai kilpauk-AnnualDay-Video-2018-19.mp4",
            thumbnailUrl: "/day care.png"
        },
        {
            title: "Fun Time at School",
            author: "T.I.M.E. Kids Chennai",
            location: "Chennai",
            videoUrl: "/chennai2.mp4",
            thumbnailUrl: "/infra.jpg"
        },
        {
            title: "Raja Colony Branch Highlights",
            author: "T.I.M.E. Kids Trichy",
            location: "Trichy",
            videoUrl: "/trichy-rajacolony.mp4",
            thumbnailUrl: "/5.jpeg"
        },
    ];

    // SVG path for the scallop border
    const scallopPath = "M0,0 V12 Q15,24 30,12 T60,12 T90,12 T120,12 T150,12 T180,12 T210,12 T240,12 T270,12 T300,12 T330,12 T360,12 T390,12 T420,12 T450,12 T480,12 T510,12 T540,12 T570,12 T600,12 T630,12 T660,12 T690,12 T720,12 T750,12 T780,12 T810,12 T840,12 T870,12 T900,12 T930,12 T960,12 T990,12 T1020,12 T1050,12 T1080,12 T1110,12 T1140,12 T1170,12 T1200,12 V0 Z";

    return (
        <section className="relative py-12 bg-[#FFFAF5] overflow-hidden">

            {/* Top Scallop Border */}
            <div className="absolute top-0 left-0 w-full z-20 pointer-events-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.03)]">
                <svg viewBox="0 0 1200 24" className="w-full h-12 block fill-white" preserveAspectRatio="none">
                    <path d={scallopPath} />
                </svg>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header Removed as per request */}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="transform transition-transform hover:-translate-y-2">
                            <TestimonialVideo
                                title={testimonial.title}
                                author={testimonial.author}
                                location={testimonial.location}
                                videoUrl={testimonial.videoUrl}
                                thumbnailUrl={testimonial.thumbnailUrl}
                                isPlaying={playingIndex === index}
                                onPlay={() => setPlayingIndex(index)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Scallop Border (Upside down) */}
            <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none rotate-180 drop-shadow-[0_4px_4px_rgba(0,0,0,0.03)]">
                <svg viewBox="0 0 1200 24" className="w-full h-12 block fill-white" preserveAspectRatio="none">
                    <path d={scallopPath} />
                </svg>
            </div>
        </section>
    );
};

export default TestimonialsSection;
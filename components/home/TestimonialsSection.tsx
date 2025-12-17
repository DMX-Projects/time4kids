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

    return (
        <section className="py-10 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="font-display font-bold text-4xl md:text-5xl mb-4 text-[#003366]">
                        Parent <span className="text-[#E67E22]">Testimonials</span>
                    </h2>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                        Hear from parents who have trusted us with their children&apos;s early education.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialVideo
                            key={index}
                            title={testimonial.title}
                            author={testimonial.author}
                            location={testimonial.location}
                            videoUrl={testimonial.videoUrl}
                            thumbnailUrl={testimonial.thumbnailUrl}
                            isPlaying={playingIndex === index}
                            onPlay={() => setPlayingIndex(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;

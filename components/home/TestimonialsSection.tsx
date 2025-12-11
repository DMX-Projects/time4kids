'use client';

import React from 'react';
import TestimonialVideo from '@/components/shared/TestimonialVideo';

const TestimonialsSection = () => {
    const testimonials = [
        {
            title: "Best decision for our child",
            author: "Mother of Mugil",
            location: "Hyderabad",
        },
        {
            title: "Remarkable development in 3 months",
            author: "Roma Majumdar - Mother of Nandika",
            location: "Hyderabad",
        },
        {
            title: "My kid wants to go on Sundays too!",
            author: "Deepa Bahukhandi - Mother of Diya",
            location: "Hyderabad",
        },
    ];

    return (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
                        What <span className="gradient-text">Parents Say</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Hear from parents who have trusted us with their children's early education.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialVideo
                            key={index}
                            title={testimonial.title}
                            author={testimonial.author}
                            location={testimonial.location}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;

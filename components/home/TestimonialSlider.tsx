'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const TestimonialSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const testimonials = [
        {
            name: "Priya Sharma",
            role: "Parent",
            location: "Bangalore",
            rating: 5,
            text: "T.I.M.E. Kids has been a wonderful experience for my daughter. The teachers are caring and the curriculum is excellent. She looks forward to going to school every day!",
            gradient: "gradient-to-br from-primary-100 to-secondary-100",
        },
        {
            name: "Rajesh Kumar",
            role: "Parent",
            location: "Mumbai",
            rating: 5,
            text: "The best preschool in the area! My son has learned so much in just a few months. The activity-based learning approach really works wonders.",
            gradient: "gradient-to-br from-secondary-100 to-primary-100",
        },
        {
            name: "Anita Desai",
            role: "Parent",
            location: "Delhi",
            rating: 5,
            text: "Excellent infrastructure and caring staff. The NEP 2020 curriculum is well-implemented. Highly recommend T.I.M.E. Kids to all parents!",
            gradient: "gradient-to-br from-primary-50 to-secondary-50",
        },
        {
            name: "Vikram Singh",
            role: "Parent",
            location: "Hyderabad",
            rating: 5,
            text: "My twins absolutely love their preschool! The teachers are patient and the learning environment is perfect for young children. Thank you T.I.M.E. Kids!",
            gradient: "gradient-to-br from-secondary-50 to-primary-100",
        },
    ];

    // Auto-rotate slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [testimonials.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <div className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-50 to-white py-20">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 right-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 animate-fade-in">
                        {/* Section Header */}
                        <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-lg">
                            <Quote className="w-5 h-5 text-primary-600" />
                            <span className="text-sm font-bold text-gray-900">Parent Testimonials</span>
                        </div>

                        {/* Slide Content */}
                        <div className="space-y-6">
                            <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-gray-900">
                                What <span className="gradient-text">Parents Say</span>
                            </h2>

                            <p className="text-xl md:text-2xl font-display font-semibold text-primary-600">
                                {testimonials[currentSlide].name}
                            </p>

                            <div className="flex items-center space-x-1 mb-4">
                                {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            <p className="text-lg text-gray-600 leading-relaxed max-w-xl italic">
                                "{testimonials[currentSlide].text}"
                            </p>

                            <div className="text-gray-600">
                                <span className="font-semibold">{testimonials[currentSlide].role}</span>
                                <span className="mx-2">•</span>
                                <span>{testimonials[currentSlide].location}</span>
                            </div>
                        </div>

                        {/* Slider Dots */}
                        <div className="flex items-center space-x-3">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-2 rounded-full transition-all ${index === currentSlide
                                            ? 'w-8 bg-primary-500'
                                            : 'w-2 bg-gray-300 hover:bg-primary-300'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Content - Visual Card */}
                    <div className="relative animate-fade-in">
                        <div className={`relative rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-500 ${testimonials[currentSlide].gradient}`}>
                            <div className="aspect-[4/3] flex items-center justify-center p-12">
                                {/* Testimonial Visual */}
                                <div className="text-center">
                                    <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                                        <Quote className="w-16 h-16 text-primary-500" />
                                    </div>
                                    <p className="text-gray-900 font-bold text-2xl mb-2">
                                        {testimonials[currentSlide].name}
                                    </p>
                                    <p className="text-gray-700 text-lg mb-4">
                                        {testimonials[currentSlide].role} • {testimonials[currentSlide].location}
                                    </p>
                                    <div className="flex items-center justify-center space-x-1">
                                        {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                                            <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                        >
                            <ChevronLeft className="w-6 h-6 text-primary-600" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                        >
                            <ChevronRight className="w-6 h-6 text-primary-600" />
                        </button>

                        {/* Floating Stats */}
                        <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-2xl p-6 animate-float hidden lg:block">
                            <div className="text-4xl font-black gradient-text">1000+</div>
                            <div className="text-sm text-gray-600 font-medium">Happy Parents</div>
                        </div>

                        <div className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-2xl p-6 animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
                            <div className="text-4xl font-black gradient-text">4.9★</div>
                            <div className="text-sm text-gray-600 font-medium">Average Rating</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialSlider;

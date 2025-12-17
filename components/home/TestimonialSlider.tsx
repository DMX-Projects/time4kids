'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const testimonials = [
    {
        id: 1,
        text: "A good school plays an important role in the development of a child. It's the light that helps us choose the right path in the various walks of life. I am glad that I found T.I.M.E. Kids for my daughter. In just three months there has been a lot of development in Nandika, especially with respect to her linguistic skills and social skills. I like the way kids are handled and education is imparted at T.I.M.E. Kids. Thanks to all the wonderful teachers for enabling such remarkable change in my child.",
        author: "Roma Majumdar",
        relation: "Mother of Nandika",
        location: "HYDERABAD",
        rating: 5
    },
    {
        id: 2,
        text: "T.I.M.E. Kids is my son's second home. It is a completely safe environment. He is playing, learning and enjoying every minute he spends there. Nowadays he is showing a lot of interest in colouring and painting and is creating new pictures of his own. Thanks to the innovative teaching methods and caring teachers, Mugil has become a keen learner and is learning new things every day.",
        author: "Mother of Mugil",
        relation: "",
        location: "HYDERABAD",
        rating: 5
    },
    {
        id: 3,
        text: "T.I.M.E. Kids pre-schools, is one of the most friendly places for toddlers. My kid wants to go to school on Sunday too! The learning is done in such a fun way....",
        author: "Deepa Bahukhandi",
        relation: "Mother of Diya",
        location: "HYDERABAD",
        rating: 5
    }
];

const TestimonialSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative bg-[#6032a8] py-10 overflow-hidden">
            {/* Top Wavy Banner SVG */}
            <div className="absolute top-0 left-0 w-full overflow-hidden rotate-180 leading-[0]">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%_+_1.3px)] h-[30px] md:h-[50px]">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#F0F8FF"></path>
                </svg>
            </div>

            {/* Bottom Wavy Banner SVG */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%_+_1.3px)] h-[30px] md:h-[50px]">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
                </svg>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-6">
                    <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
                        Parent&apos;s Speak
                    </h2>
                    <p className="text-purple-200 text-lg max-w-2xl mx-auto">
                        See what our community has to say about their experience
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        {/* Navigation Buttons */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                        >
                            <ChevronLeft size={32} />
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                        >
                            <ChevronRight size={32} />
                        </button>

                        <div className="overflow-hidden px-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl mx-auto md:min-h-[300px] flex flex-col justify-center"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="mb-6 text-[#ef5f5f]">
                                            <Quote size={48} className="fill-current opacity-20" />
                                        </div>

                                        <p className="text-gray-700 text-lg md:text-xl italic mb-8 leading-relaxed font-medium">
                                            &ldquo;{testimonials[currentIndex].text}&rdquo;
                                        </p>

                                        <div className="flex items-center justify-center gap-1 mb-4 text-[#fbd267]">
                                            {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                                <Star key={i} size={20} fill="currentColor" />
                                            ))}
                                        </div>

                                        <div className="mt-2">
                                            <h4 className="font-bold text-xl text-gray-900">
                                                {testimonials[currentIndex].author}
                                            </h4>
                                            {testimonials[currentIndex].relation && (
                                                <p className="text-gray-500 text-sm font-medium">
                                                    {testimonials[currentIndex].relation}
                                                </p>
                                            )}
                                            <p className="text-[#6032a8] text-sm font-bold mt-1 tracking-wider">
                                                {testimonials[currentIndex].location}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white w-6' : 'bg-white/40'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialSlider;

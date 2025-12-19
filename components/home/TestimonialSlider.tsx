'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { gsap } from 'gsap';

const testimonials = [
    {
        id: 1,
        text: "A good school plays an important role in the development of a child. It's the light that helps us choose the right path. I am glad that I found T.I.M.E. Kids for my daughter. In just three months there has been a lot of development in Nandika.",
        author: "Roma Majumdar",
        relation: "Mother of Nandika",
        location: "HYDERABAD",
        rating: 5
    },
    {
        id: 2,
        text: "T.I.M.E. Kids is my son's second home. It is a completely safe environment. He is playing, learning and enjoying every minute he spends there. Mugil has become a keen learner and is learning new things every day.",
        author: "Mother of Mugil",
        relation: "Parent",
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
    const sectionRef = useRef(null);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    useEffect(() => {
        const timer = setInterval(nextSlide, 6000);
        
        // GSAP Background Animation for the "Blobs"
        const ctx = gsap.context(() => {
            gsap.to(".bg-blob", {
                x: "random(-40, 40)",
                y: "random(-30, 30)",
                duration: "random(4, 6)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: 0.5
            });
        }, sectionRef);

        return () => {
            clearInterval(timer);
            ctx.revert();
        };
    }, []);

    const scallopPath = "M0,0 V12 Q15,24 30,12 T60,12 T90,12 T120,12 T150,12 T180,12 T210,12 T240,12 T270,12 T300,12 T330,12 T360,12 T390,12 T420,12 T450,12 T480,12 T510,12 T540,12 T570,12 T600,12 T630,12 T660,12 T690,12 T720,12 T750,12 T780,12 T810,12 T840,12 T870,12 T900,12 T930,12 T960,12 T990,12 T1020,12 T1050,12 T1080,12 T1110,12 T1140,12 T1170,12 T1200,12 V0 Z";

    return (
        // Reduced py-20 to py-12 for a sleeker height
        <section ref={sectionRef} className="relative bg-gradient-to-br from-[#6032a8] via-[#7c4dff] to-[#6032a8] py-12 overflow-hidden">
            
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
                <div className="bg-blob absolute top-10 left-10 w-64 h-64 bg-purple-400 rounded-full blur-[80px]"></div>
                <div className="bg-blob absolute bottom-10 right-10 w-80 h-80 bg-indigo-400 rounded-full blur-[100px]"></div>
                <div className="bg-blob absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-48 bg-pink-400 rounded-full blur-[120px]"></div>
            </div>

            {/* --- Borders --- */}
            <div className="absolute top-0 left-0 w-full z-20 pointer-events-none">
                <svg viewBox="0 0 1200 24" className="w-full h-6 md:h-8" preserveAspectRatio="none">
                    <path d={scallopPath} fill="white" />
                </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none rotate-180">
                <svg viewBox="0 0 1200 24" className="w-full h-6 md:h-8" preserveAspectRatio="none">
                    <path d={scallopPath} fill="white" />
                </svg>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-8">
                    <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-2 drop-shadow-md">
                        Parent&apos;s Speak
                    </h2>
                    <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
                </div>

                <div className="max-w-3xl mx-auto relative group">
                    {/* Navigation - Made more compact */}
                    <button onClick={prevSlide} className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/10 hover:bg-white/30 text-white transition-all backdrop-blur-sm">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextSlide} className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/10 hover:bg-white/30 text-white transition-all backdrop-blur-sm">
                        <ChevronRight size={24} />
                    </button>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-10 shadow-xl flex flex-col items-center text-center relative overflow-hidden"
                        >
                            {/* Decorative Quote Icon */}
                            <Quote size={60} className="absolute -top-2 -left-2 text-purple-100 -rotate-12 z-0" />
                            
                            <div className="relative z-10">
                                <p className="text-gray-700 text-base md:text-lg italic mb-6 leading-relaxed font-medium">
                                    &ldquo;{testimonials[currentIndex].text}&rdquo;
                                </p>

                                <div className="flex justify-center gap-1 mb-3 text-[#fbd267]">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                                </div>

                                <h4 className="font-bold text-lg text-gray-900 leading-tight">
                                    {testimonials[currentIndex].author}
                                </h4>
                                <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mt-1">
                                    {testimonials[currentIndex].relation} • {testimonials[currentIndex].location}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Compact Dots */}
                    <div className="flex justify-center gap-2 mt-6">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white w-8' : 'bg-white/30 w-3'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialSlider;
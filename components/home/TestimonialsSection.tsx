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

const TestimonialsSection = () => {
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
        <section ref={sectionRef} className="w-full relative bg-gradient-to-br from-[#6032a8] via-[#7c4dff] to-[#6032a8] py-12 overflow-hidden">

            {/* Animated Background Blobs */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
                <div className="bg-blob absolute top-10 left-10 w-64 h-64 bg-purple-400 rounded-full blur-[80px]"></div>
                <div className="bg-blob absolute bottom-10 right-10 w-80 h-80 bg-indigo-400 rounded-full blur-[100px]"></div>
                <div className="bg-blob absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-48 bg-pink-400 rounded-full blur-[120px]"></div>
            </div>

            {/* Animated Wave at Top */}
            <div className="absolute top-0 left-0 w-full z-20 pointer-events-none overflow-hidden" style={{ height: '100px' }}>
                <svg
                    className="absolute top-0 w-[400%] h-full wave-svg-animate"
                    viewBox="0 0 4800 200"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0,0 Q30,50 60,25 Q90,0 120,25 Q150,50 180,25 Q210,0 240,25 Q270,50 300,25 Q330,0 360,25 Q390,50 420,25 Q450,0 480,25 Q510,50 540,25 Q570,0 600,25 Q630,50 660,25 Q690,0 720,25 Q750,50 780,25 Q810,0 840,25 Q870,50 900,25 Q930,0 960,25 Q990,50 1020,25 Q1050,0 1080,25 Q1110,50 1140,25 Q1170,0 1200,25 Q1230,50 1260,25 Q1290,0 1320,25 Q1350,50 1380,25 Q1410,0 1440,25 Q1470,50 1500,25 Q1530,0 1560,25 Q1590,50 1620,25 Q1650,0 1680,25 Q1710,50 1740,25 Q1770,0 1800,25 Q1830,50 1860,25 Q1890,0 1920,25 Q1950,50 1980,25 Q2010,0 2040,25 Q2070,50 2100,25 Q2130,0 2160,25 Q2190,50 2220,25 Q2250,0 2280,25 Q2310,50 2340,25 Q2370,0 2400,25 Q2430,50 2460,25 Q2490,0 2520,25 Q2550,50 2580,25 Q2610,0 2640,25 Q2670,50 2700,25 Q2730,0 2760,25 Q2790,50 2820,25 Q2850,0 2880,25 Q2910,50 2940,25 Q2970,0 3000,25 Q3030,50 3060,25 Q3090,0 3120,25 Q3150,50 3180,25 Q3210,0 3240,25 Q3270,50 3300,25 Q3330,0 3360,25 Q3390,50 3420,25 Q3450,0 3480,25 Q3510,50 3540,25 Q3570,0 3600,25 Q3630,50 3660,25 Q3690,0 3720,25 Q3750,50 3780,25 Q3810,0 3840,25 Q3870,50 3900,25 Q3930,0 3960,25 Q3990,50 4020,25 Q4050,0 4080,25 Q4110,50 4140,25 Q4170,0 4200,25 Q4230,50 4260,25 Q4290,0 4320,25 Q4350,50 4380,25 Q4410,0 4440,25 Q4470,50 4500,25 Q4530,0 4560,25 Q4590,50 4620,25 Q4650,0 4680,25 Q4710,50 4740,25 Q4770,0 4800,25 L4800,0 L0,0 Z"
                        fill="white"
                    />
                </svg>

                {/* Floating Whale */}
                <div className="absolute -bottom-4 right-10 md:right-20 z-10 animate-float">
                    <img
                        src="/images/whale.png"
                        alt="Whale"
                        width="120"
                        height="120"
                        className="drop-shadow-2xl"
                    />
                </div>
            </div>

            {/* Animated Wave at Bottom */}
            <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none overflow-hidden rotate-180" style={{ height: '100px' }}>
                <svg
                    className="absolute top-0 w-[400%] h-full wave-svg-animate-reverse"
                    viewBox="0 0 4800 200"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0,0 Q30,50 60,25 Q90,0 120,25 Q150,50 180,25 Q210,0 240,25 Q270,50 300,25 Q330,0 360,25 Q390,50 420,25 Q450,0 480,25 Q510,50 540,25 Q570,0 600,25 Q630,50 660,25 Q690,0 720,25 Q750,50 780,25 Q810,0 840,25 Q870,50 900,25 Q930,0 960,25 Q990,50 1020,25 Q1050,0 1080,25 Q1110,50 1140,25 Q1170,0 1200,25 Q1230,50 1260,25 Q1290,0 1320,25 Q1350,50 1380,25 Q1410,0 1440,25 Q1470,50 1500,25 Q1530,0 1560,25 Q1590,50 1620,25 Q1650,0 1680,25 Q1710,50 1740,25 Q1770,0 1800,25 Q1830,50 1860,25 Q1890,0 1920,25 Q1950,50 1980,25 Q2010,0 2040,25 Q2070,50 2100,25 Q2130,0 2160,25 Q2190,50 2220,25 Q2250,0 2280,25 Q2310,50 2340,25 Q2370,0 2400,25 Q2430,50 2460,25 Q2490,0 2520,25 Q2550,50 2580,25 Q2610,0 2640,25 Q2670,50 2700,25 Q2730,0 2760,25 Q2790,50 2820,25 Q2850,0 2880,25 Q2910,50 2940,25 Q2970,0 3000,25 Q3030,50 3060,25 Q3090,0 3120,25 Q3150,50 3180,25 Q3210,0 3240,25 Q3270,50 3300,25 Q3330,0 3360,25 Q3390,50 3420,25 Q3450,0 3480,25 Q3510,50 3540,25 Q3570,0 3600,25 Q3630,50 3660,25 Q3690,0 3720,25 Q3750,50 3780,25 Q3810,0 3840,25 Q3870,50 3900,25 Q3930,0 3960,25 Q3990,50 4020,25 Q4050,0 4080,25 Q4110,50 4140,25 Q4170,0 4200,25 Q4230,50 4260,25 Q4290,0 4320,25 Q4350,50 4380,25 Q4410,0 4440,25 Q4470,50 4500,25 Q4530,0 4560,25 Q4590,50 4620,25 Q4650,0 4680,25 Q4710,50 4740,25 Q4770,0 4800,25 L4800,0 L0,0 Z"
                        fill="white"
                    />
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

export default TestimonialsSection;
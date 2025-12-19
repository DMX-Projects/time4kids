'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const ProgramsPreview = () => {
    const sectionRef = useRef(null);
    const kidRef = useRef(null);

    const programs = [
        {
            image: '/13.png',
            programName: 'Play Group',
            ageGroup: '1.5 - 2.5 years',
            description: 'Introduction to social interaction and basic motor skills.',
            color: '#ef5f5f',
            yOffset: '-20px'
        },
        {
            image: '/12.png',
            programName: 'Nursery',
            ageGroup: '2.5 - 3.5 years',
            description: 'Building foundation for language, numbers, and expression.',
            color: '#fbd267',
            yOffset: '40px'
        },
        {
            image: '/1.png',
            programName: 'PP-1 & PP-2',
            ageGroup: '3.5 - 5.5 years',
            description: 'Preparing for formal schooling with comprehensive education.',
            color: '#6cc3d5',
            yOffset: '-30px'
        },
        {
            image: '/16.png',
            programName: 'Day Care',
            ageGroup: '1.5 - 5.5 years',
            description: 'Extended care with engaging activities throughout the day.',
            color: '#ff9f43',
            yOffset: '30px'
        }
    ];

    const scallopPath = "M0,0 V12 Q15,24 30,12 T60,12 T90,12 T120,12 T150,12 T180,12 T210,12 T240,12 T270,12 T300,12 T330,12 T360,12 T390,12 T420,12 T450,12 T480,12 T510,12 T540,12 T570,12 T600,12 T630,12 T660,12 T690,12 T720,12 T750,12 T780,12 T810,12 T840,12 T870,12 T900,12 T930,12 T960,12 T990,12 T1020,12 T1050,12 T1080,12 T1110,12 T1140,12 T1170,12 T1200,12 V0 Z";

    useEffect(() => {
        const ctx = gsap.context(() => {
            // TARGET ONLY THE KID: Move from left to right based on scroll
            gsap.to(kidRef.current, {
                x: "85vw", // Kid travels across the screen
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top center", // Animation starts when section hits middle of screen
                    end: "bottom center",
                    scrub: 1, // Smooth movement tied to scroll
                    onUpdate: (self) => {
                        // Flip character to face direction of travel
                        if (self.direction === 1) {
                            gsap.to(kidRef.current, { scaleX: 1, duration: 0.1 });
                        } else {
                            gsap.to(kidRef.current, { scaleX: -1, duration: 0.1 });
                        }
                    }
                }
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative py-24 bg-[#FFFAF5] overflow-hidden">
            
            {/* Top Border */}
            <div className="absolute top-0 left-0 w-full z-20 pointer-events-none">
                <svg viewBox="0 0 1200 24" className="w-full h-12 block fill-white" preserveAspectRatio="none">
                    <path d={scallopPath} />
                </svg>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="font-bubblegum text-5xl md:text-6xl text-[#003366]">
                        Our <span className="text-[#ef5f5f]">Programs</span>
                    </h2>
                    <p className="text-gray-400 font-medium italic mt-2">Where learning feels like an adventure...</p>
                </div>

                <div className="relative">
                    {/* Adventure Path Line (Static) */}
                    <svg className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 -z-10 opacity-20" preserveAspectRatio="none" viewBox="0 0 1000 100">
                        <path 
                            d="M0,50 Q125,0 250,50 T500,50 T750,50 T1000,50" 
                            fill="none" 
                            stroke="#003366" 
                            strokeWidth="3" 
                            strokeDasharray="10 10" 
                        />
                    </svg>

                    {/* Program Cards (Static) */}
                    <div className="flex flex-nowrap overflow-x-auto pb-32 pt-10 gap-12 no-scrollbar md:justify-between">
                        {programs.map((program, index) => (
                            <div 
                                key={index} 
                                className="flex-shrink-0 w-72 flex flex-col items-center text-center"
                                style={{ transform: `translateY(${program.yOffset})` }}
                            >
                                <div className="relative group mb-6">
                                    <div className="absolute inset-0 rounded-full blur-2xl opacity-10" style={{ backgroundColor: program.color }} />
                                    <div className="relative w-48 h-48 rounded-full border-[10px] border-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                        <Image src={program.image} alt={program.programName} fill className="object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 right-2 px-4 py-1.5 rounded-full text-white font-black text-[10px] shadow-lg rotate-12" style={{ backgroundColor: program.color }}>
                                        {program.ageGroup}
                                    </div>
                                </div>
                                <h3 className="font-bubblegum text-3xl text-[#003366] mb-2 leading-tight">{program.programName}</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-4 px-4 line-clamp-2">{program.description}</p>
                                <Link href="/programs" className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest" style={{ color: program.color }}>
                                    JOIN THE FUN <span className="text-lg">→</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Explore Button */}
                <div className="mt-4 text-center">
                    <Link href="/programs" className="relative inline-block group">
                        <div className="relative bg-[#ef5f5f] text-white font-bubblegum text-2xl px-12 py-5 rounded-[2rem_4rem_2rem_5rem] shadow-lg hover:shadow-xl transition-all">
                            Explore All Classes
                        </div>
                    </Link>
                </div>
            </div>

            {/* --- FIXED: THE KID WALKS INDEPENDENTLY AT BOTTOM --- */}
            <div 
                ref={kidRef} 
                className="absolute bottom-6 left-0 z-50 pointer-events-none"
            >
                <div className="relative w-36 h-36 md:w-44 md:h-44">
                    <Image 
                        src="/kid-character.gif" 
                        alt="Walking Kid" 
                        fill
                        className="object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.15)]"
                        unoptimized 
                        priority
                    />
                </div>
            </div>

            {/* Bottom Scallop */}
            <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none rotate-180">
                <svg viewBox="0 0 1200 24" className="w-full h-12 block fill-white" preserveAspectRatio="none">
                    <path d={scallopPath} />
                </svg>
            </div>
        </section>
    );
};

export default ProgramsPreview;
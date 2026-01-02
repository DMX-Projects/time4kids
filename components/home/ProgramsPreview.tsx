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

    const programs = [
        {
            image: '/day care.png',
            programName: 'Play Group',
            ageGroup: '1.5 - 2.5 years',
            description: 'Introduction to social interaction and basic motor skills.',
            color: '#ef5f5f',
            yOffset: '-20px'
        },
        {
            image: '/faq2.jpeg',
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
            image: '/images/landing-banner.jpg',
            programName: 'Day Care',
            ageGroup: '1.5 - 5.5 years',
            description: 'Extended care with engaging activities throughout the day.',
            color: '#ff9f43',
            yOffset: '30px'
        }
    ];

    const scallopPath = "M0,0 V12 Q15,24 30,12 T60,12 T90,12 T120,12 T150,12 T180,12 T210,12 T240,12 T270,12 T300,12 T330,12 T360,12 T390,12 T420,12 T450,12 T480,12 T510,12 T540,12 T570,12 T600,12 T630,12 T660,12 T690,12 T720,12 T750,12 T780,12 T810,12 T840,12 T870,12 T900,12 T930,12 T960,12 T990,12 T1020,12 T1050,12 T1080,12 T1110,12 T1140,12 T1170,12 T1200,12 V0 Z";

    return (
        <section ref={sectionRef} className="relative py-12 bg-[#FFFAF5] overflow-hidden">

            {/* Top Border */}
            <div className="absolute top-0 left-0 w-full z-20 pointer-events-none">
                <svg viewBox="0 0 1200 24" className="w-full h-12 block fill-white" preserveAspectRatio="none">
                    <path d={scallopPath} />
                </svg>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                {/* Flying Birds */}
                <Image
                    src="/images/icon-bird1.png"
                    alt=""
                    width={80}
                    height={80}
                    className="absolute top-20 left-10 md:left-20 animate-bounce"
                    style={{ animationDuration: '4s', height: 'auto' }}
                />
                <Image
                    src="/images/icon-bird2.png"
                    alt=""
                    width={60}
                    height={60}
                    className="absolute top-40 right-16 md:right-32 animate-bounce"
                    style={{ animationDuration: '5s', animationDelay: '1s', height: 'auto' }}
                />

                {/* Butterfly */}
                <Image
                    src="/images/buterfly-2.png"
                    alt=""
                    width={70}
                    height={70}
                    className="absolute top-1/3 left-1/4 animate-pulse"
                    style={{ animationDuration: '3s', height: 'auto' }}
                />

                {/* Whale */}
                <Image
                    src="/images/whale.png"
                    alt=""
                    width={100}
                    height={100}
                    className="absolute bottom-40 right-10 md:right-20 animate-pulse"
                    style={{ animationDuration: '4s', animationDelay: '0.5s', height: 'auto' }}
                />

                {/* School Bus */}
                <Image
                    src="/images/school-bus.png"
                    alt=""
                    width={90}
                    height={90}
                    className="absolute bottom-32 left-1/3 opacity-40"
                    style={{ height: 'auto' }}
                />
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
                    <svg className="hidden md:block absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 -z-10" preserveAspectRatio="none" viewBox="0 0 1000 100">
                        <path
                            id="adventurePath"
                            d="M0,50 Q125,0 250,50 T500,50 T750,50 T1000,50"
                            fill="none"
                            stroke="#003366"
                            strokeWidth="3"
                            strokeDasharray="15 10"
                            className="dashed-path opacity-20"
                        />
                        <image href="/images/whale.png" width="50" height="50" x="-25" y="-25" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                            <animateMotion dur="20s" repeatCount="indefinite" rotate="auto">
                                <mpath href="#adventurePath" />
                            </animateMotion>
                        </image>
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
                                        <Image src={program.image} alt={program.programName} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover" />
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
            </div>{/* Bottom Scallop */}
            <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none rotate-180">
                <svg viewBox="0 0 1200 24" className="w-full h-12 block fill-white" preserveAspectRatio="none">
                    <path d={scallopPath} />
                </svg>
            </div>
            {/* CSS Animation for Dashed Line */}
            <style jsx>{`
                .dashed-path {
                    animation: dashMove 20s linear infinite;
                }

                @keyframes dashMove {
                    from {
                        stroke-dashoffset: 1000;
                    }
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </section>
    );
};

export default ProgramsPreview;

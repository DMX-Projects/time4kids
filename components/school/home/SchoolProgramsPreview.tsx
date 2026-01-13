'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const SchoolProgramsPreview = () => {
    const sectionRef = useRef(null);

    const programs = [
        { image: '/day care.png', programName: 'Play Group', ageGroup: '1.5 - 2.5 years', description: 'Introduction to social interaction and basic motor skills.', color: '#ef5f5f', yOffset: '-20px' },
        { image: '/faq2.jpeg', programName: 'Nursery', ageGroup: '2.5 - 3.5 years', description: 'Building foundation for language, numbers, and expression.', color: '#fbd267', yOffset: '40px' },
        { image: '/1.png', programName: 'PP-1 & PP-2', ageGroup: '3.5 - 5.5 years', description: 'Preparing for formal schooling with comprehensive education.', color: '#6cc3d5', yOffset: '-30px' },
        { image: '/images/landing-banner.jpg', programName: 'Day Care', ageGroup: '1.5 - 5.5 years', description: 'Extended care with engaging activities throughout the day.', color: '#ff9f43', yOffset: '30px' }
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(".wave-front", { x: -60, duration: 2.5, repeat: -1, ease: "linear" });
            gsap.to(".wave-back", { x: -60, duration: 4.5, repeat: -1, ease: "linear" });
            gsap.fromTo(".school-bus", { x: 0 }, { x: "-150vw", duration: 15, repeat: -1, ease: "none" });
            gsap.to(".school-bus", { y: -5, duration: 0.3, repeat: -1, yoyo: true, ease: "sine.inOut" });
            gsap.to(".floating-fish", { y: -20, rotation: 5, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative py-12 bg-[#FFFAF5] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-12 z-20 pointer-events-none overflow-hidden">
                <div className="wave-back absolute top-0 left-0 w-[200%] h-full opacity-40">
                    <svg className="w-full h-full block" preserveAspectRatio="none" viewBox="0 0 1200 24">
                        <defs><pattern id="progScallopPattern" x="0" y="0" width="60" height="24" patternUnits="userSpaceOnUse"><path d="M0 0 V12 Q15 24 30 12 T60 12 V0 H0 Z" fill="white" /></pattern></defs>
                        <rect x="0" y="0" width="100%" height="24" fill="url(#progScallopPattern)" />
                    </svg>
                </div>
                <div className="wave-front absolute top-0 left-0 w-[200%] h-full">
                    <svg className="w-full h-full block" preserveAspectRatio="none" viewBox="0 0 1200 24">
                        <defs><pattern id="progScallopPatternFront" x="0" y="0" width="60" height="24" patternUnits="userSpaceOnUse"><path d="M0 0 V12 Q15 24 30 12 T60 12 V0 H0 Z" fill="white" /></pattern></defs>
                        <rect x="0" y="0" width="100%" height="24" fill="url(#progScallopPatternFront)" />
                    </svg>
                </div>
            </div>

            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                <Image src="/images/icon-bird1.png" alt="" width={80} height={80} className="absolute top-20 left-10 md:left-20 animate-bounce" style={{ animationDuration: '4s', height: 'auto' }} />
                <Image src="/images/icon-bird2.png" alt="" width={60} height={60} className="absolute top-40 right-16 md:right-32 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s', height: 'auto' }} />
                <Image src="/images/buterfly-2.png" alt="" width={70} height={70} className="absolute top-1/3 left-1/4 animate-pulse" style={{ animationDuration: '3s', height: 'auto' }} />
                <Image src="/images/whale.png" alt="" width={100} height={100} className="floating-fish absolute bottom-40 right-10 md:right-20" style={{ height: 'auto' }} />
                <Image src="/images/school-bus.png" alt="" width={90} height={90} className="school-bus absolute bottom-32 opacity-80" style={{ height: 'auto', left: '100%' }} />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="font-bubblegum text-5xl md:text-6xl text-[#003366]">Our <span className="text-[#ef5f5f]">Programs</span></h2>
                    <p className="text-gray-400 font-medium italic mt-2">Where learning feels like an adventure...</p>
                </div>

                <div className="relative">
                    <div className="flex flex-nowrap overflow-x-auto pb-32 pt-10 gap-12 no-scrollbar md:justify-between">
                        {programs.map((program, index) => (
                            <div key={index} className="flex-shrink-0 w-72 flex flex-col items-center text-center" style={{ transform: `translateY(${program.yOffset})` }}>
                                <div className="relative group mb-6">
                                    <div className="absolute inset-0 rounded-full blur-2xl opacity-10" style={{ backgroundColor: program.color }} />
                                    <div className="relative w-48 h-48 rounded-full border-[10px] border-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                        <Image src={program.image} alt={program.programName} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 right-2 px-4 py-1.5 rounded-full text-white font-black text-[10px] shadow-lg rotate-12" style={{ backgroundColor: program.color }}>{program.ageGroup}</div>
                                </div>
                                <h3 className="font-bubblegum text-3xl text-[#003366] mb-2 leading-tight">{program.programName}</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-4 px-4 line-clamp-2">{program.description}</p>
                                <Link href="/programs" className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest" style={{ color: program.color }}>JOIN THE FUN <span className="text-lg">→</span></Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/programs" className="relative inline-block group">
                        <div className="relative bg-[#ef5f5f] text-white font-bubblegum text-2xl px-12 py-5 rounded-[2rem_4rem_2rem_5rem] shadow-lg hover:shadow-xl transition-all">Explore All Classes</div>
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-12 z-20 pointer-events-none rotate-180 overflow-hidden">
                <div className="wave-back absolute top-0 left-0 w-[200%] h-full opacity-40"><svg className="w-full h-full block" preserveAspectRatio="none" viewBox="0 0 1200 24"><rect x="0" y="0" width="100%" height="24" fill="url(#progScallopPattern)" /></svg></div>
                <div className="wave-front absolute top-0 left-0 w-[200%] h-full"><svg className="w-full h-full block" preserveAspectRatio="none" viewBox="0 0 1200 24"><rect x="0" y="0" width="100%" height="24" fill="url(#progScallopPatternFront)" /></svg></div>
            </div>
            <style jsx>{` .dashed-path { animation: dashMove 20s linear infinite; } @keyframes dashMove { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } } `}</style>
        </section>
    );
};

export default SchoolProgramsPreview;

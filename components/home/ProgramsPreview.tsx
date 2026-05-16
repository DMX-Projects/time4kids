'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useHomePageContent } from '@/components/home/HomePageContentProvider';
import { formatAgeGroupLabel } from '@/lib/format-age-group';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const ProgramsPreview = () => {
    const sectionRef = useRef(null);
    const home = useHomePageContent();
    const programs = home.programs_preview.programs;

    const formatProgramName = (name: string) => {
        return name.trim().toLowerCase() === 'day care' ? 'Summer Programs' : name;
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Parallax Wave Animation
            gsap.to(".wave-front", {
                x: -60,
                duration: 2.5,
                repeat: -1,
                ease: "linear"
            });

            gsap.to(".wave-back", {
                x: -60,
                duration: 4.5,
                repeat: -1,
                ease: "linear"
            });

            // School Bus Drive Animation - Explicit fromTo for guaranteed loop
            gsap.fromTo(".school-bus",
                { x: 0 },
                {
                    x: "-150vw", // Move well past the left edge
                    duration: 15,
                    repeat: -1,
                    ease: "none"
                }
            );

            // School Bus Subtle Drive Vibration
            gsap.to(".school-bus", {
                y: -2, // Reduced from -5 for a subtler effect
                duration: 0.6, // Increased from 0.3 for a smoother feel
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Floating Fish Animation
            gsap.to(".floating-fish", {
                y: -20,
                rotation: 5,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [programs.length]);

    return (
        <section ref={sectionRef} className="relative section-gap bg-[#FFFAF5] overflow-hidden">



            {/* Decorative Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                {/* Flying Birds */}
                <Image
                    src="/images/icon-bird1.png"
                    alt=""
                    width={80}
                    height={80}
                    className="absolute top-20 left-10 md:left-20 animate-bounce"
                    style={{ animationDuration: '4s' }}
                />
                <Image
                    src="/images/icon-bird2.png"
                    alt=""
                    width={60}
                    height={60}
                    className="absolute top-40 right-16 md:right-32 animate-bounce"
                    style={{ animationDuration: '5s', animationDelay: '1s' }}
                />

                {/* Butterfly */}
                <Image
                    src="/images/buterfly-2.png"
                    alt=""
                    width={70}
                    height={70}
                    className="absolute top-1/3 left-1/4 animate-pulse"
                    style={{ animationDuration: '3s' }}
                />

                {/* Whale - Floating Animation */}
                <Image
                    src="/images/whale.png"
                    alt=""
                    width={100}
                    height={100}
                    className="floating-fish absolute bottom-40 right-10 md:right-20"
                    style={{}}
                />
            </div>

            {/* School bus — outside low-opacity decor layer so it stays visible */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <Image
                    src="/images/school-bus.png"
                    alt=""
                    width={90}
                    height={90}
                    className="school-bus absolute -bottom-2 opacity-100 saturate-200 brightness-100 contrast-110 drop-shadow-[0_10px_14px_rgba(120,72,20,0.35)] md:bottom-0"
                    style={{ left: '100%' }}
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="font-display text-5xl font-black leading-tight text-[#253247] md:text-6xl">
                        Our <span className="text-[#ef5f5f]">Programs</span>
                    </h2>
                    <p className="text-gray-400 font-medium italic mt-2">Where learning feels like an adventure...</p>
                </div>

                <div className="relative">
                    {/* Adventure Path Line (Static) */}
                    <svg className="hidden md:block absolute top-[25%] left-0 w-full h-32 -translate-y-1/2 -z-10" preserveAspectRatio="none" viewBox="0 0 1000 100">
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

                    {/* Program cards — responsive grid, no horizontal scroll */}
                    <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-x-3 gap-y-10 pb-32 pt-10 sm:gap-x-4 sm:gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-5 lg:gap-x-3 lg:gap-y-10 xl:gap-x-4">
                        {programs.map((program, index) => (
                            <div
                                key={index}
                                className="flex min-w-0 flex-col items-center px-1 text-center sm:px-2"
                                style={{ transform: `translateY(${program.yOffset})` }}
                            >
                                <Link
                                    href="/programs"
                                    className="group relative mb-4 mx-auto block w-full max-w-[12rem] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFFAF5] sm:mb-6 sm:max-w-[13rem] lg:max-w-[11rem]"
                                    aria-label={`${formatProgramName(program.programName).replace(/\n/g, ' ')} — view programs`}
                                >
                                    <div
                                        className="pointer-events-none absolute inset-0 rounded-full blur-2xl opacity-10"
                                        style={{ backgroundColor: program.color }}
                                    />
                                    {/* Explicit width + height so Next/Image fill always has a box (aspect + min() alone can collapse in grid) */}
                                    <div className="relative mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-full border-[6px] border-white shadow-xl transition-transform duration-500 group-hover:scale-105 sm:h-44 sm:w-44 sm:border-[8px] lg:h-[10.5rem] lg:w-[10.5rem] lg:border-[10px]">
                                        <Image
                                            src={program.image}
                                            alt=""
                                            fill
                                            sizes="(max-width: 640px) 160px, (max-width: 1024px) 180px, 168px"
                                            className="object-cover"
                                            style={program.imageStyle as React.CSSProperties | undefined}
                                        />
                                    </div>
                                    <div
                                        className="absolute -bottom-1 right-0 max-w-[min(100%,13rem)] rounded-full px-3 py-1.5 text-center text-[11px] font-black leading-tight text-white shadow-lg sm:-bottom-2 sm:right-1 sm:max-w-none sm:px-4 sm:py-2 sm:text-[13px]"
                                        style={{ backgroundColor: program.color }}
                                    >
                                        {formatAgeGroupLabel(program.ageGroup)}
                                    </div>
                                </Link>
                                <h3 className="font-display text-xl font-black leading-tight text-[#253247] sm:text-2xl lg:text-3xl mb-1 sm:mb-2 whitespace-pre-line">
                                    {formatProgramName(program.programName)}
                                </h3>
                                <p className="mb-3 px-0 text-xs font-medium leading-relaxed text-gray-500 sm:mb-4 sm:px-1 sm:text-sm">
                                    {program.description}
                                </p>
                                <Link href="/programs" className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-black text-[10px] uppercase tracking-widest text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.22)]" style={{ backgroundColor: program.color }}>
                                    JOIN THE FUN <span className="text-lg">→</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Explore Button */}
                <div className="mt-4 text-center">
                    <Link href="/programs" className="relative inline-block group">
                        <div className="relative inline-flex items-center gap-3 rounded-[2rem_4rem_2rem_5rem] bg-[#ef5f5f] px-12 py-5 font-display text-2xl font-black text-white shadow-lg transition-all hover:shadow-xl">
                            <span className="leading-none">Explore All Classes</span>
                            <ArrowRight
                                className="h-7 w-7 shrink-0 translate-y-px stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1"
                                aria-hidden
                            />
                        </div>
                    </Link>
                </div>
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

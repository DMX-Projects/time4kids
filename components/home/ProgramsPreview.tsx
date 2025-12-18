'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import FloatingDots from '@/components/animations/FloatingDots';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const ProgramsPreview = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);

    const programs = [
        {
            image: '/13.png',
            name: 'Experience Yourself',
            programName: 'Play Group', // Keeping original name as subtitle or context if needed, but using "Experience Yourself" style titles from ss/request? No, user said "change format", implied content usually stays or adapts. Screenshot shows "Experience Yourself". 
            // Wait, the screenshot has titles "Experience Yourself", "Quality lessons", "Toys and Games".
            // The USER said "change the format of 1st ss images to 2nd ss images".
            // Typically this means styles. I should probably keep the CONTENT (Play Group) but use the STYLE (Red background).
            // Let's stick to the content "Play Group" etc but with the styling.
            ageGroup: '1.5 - 2.5 years',
            description: 'Introduction to social interaction and basic motor skills development.',
            bgColor: 'bg-[#ef5f5f]', // Red-ish from screenshot
            buttonColor: 'bg-[#4facfe]', // Blue button from screenshot
        },
        {
            image: '/12.png',
            name: 'Quality lessons',
            programName: 'Nursery',
            ageGroup: '2.5 - 3.5 years',
            description: 'Building foundation for language, numbers, and creative expression.',
            bgColor: 'bg-[#fbd267]', // Yellow from screenshot
            buttonColor: 'bg-[#5ccca3]', // Green/Teal button from screenshot
        },
        {
            image: '/1.png',
            name: 'Toys and Games',
            programName: 'PP-1 & PP-2',
            ageGroup: '3.5 - 5.5 years',
            description: 'Comprehensive pre-primary education preparing for formal schooling.',
            bgColor: 'bg-[#6cc3d5]', // Cyan/Blue from screenshot
            buttonColor: 'bg-[#ef5f5f]', // Red button
        },
        {
            image: '/16.png',
            name: 'Day Care',
            programName: 'Day Care',
            ageGroup: '1.5 - 5.5 years',
            description: 'Extended care with engaging activities throughout the day.',
            bgColor: 'bg-[#ff9f43]', // Orange (matches screenshot style if there was a 4th)
            buttonColor: 'bg-[#5f27cd]', // Purple button
        },
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Heading animation
            gsap.from(headingRef.current, {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: headingRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
            });

            // Description animation
            gsap.from(descriptionRef.current, {
                y: 30,
                opacity: 0,
                duration: 0.8,
                delay: 0.2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: descriptionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
            });

            // Cards stagger animation
            if (cardsRef.current) {
                const cards = cardsRef.current.children;
                gsap.from(cards, {
                    y: 100,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: cardsRef.current,
                        start: 'top 70%',
                        toggleActions: 'play none none reverse',
                    },
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-10 bg-gray-50 relative overflow-hidden">
            {/* Floating Decorative Dots */}
            <FloatingDots count={6} colors={['bg-pink-200', 'bg-blue-200', 'bg-orange-200', 'bg-green-200']} />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-8">
                    <h2 ref={headingRef} className="font-bubblegum text-4xl md:text-5xl mb-4 text-[#003366] tracking-wide">
                        Our <span className="text-[#ef5f5f]">Programs</span>
                    </h2>
                    <p ref={descriptionRef} className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Every class, group and child is unique and has different needs at different times. At T.I.M.E. Kids pre-schools, we believe in a curriculum that matches abilities to skills.
                    </p>
                </div>

                <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                    {programs.map((program, index) => (
                        <div key={index} className="group relative h-full">
                            {/* Image Section */}
                            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-3xl shadow-lg">
                                <Image
                                    src={program.image}
                                    alt={program.programName}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </div>

                            {/* Content Card - Overlapping */}
                            <div className="absolute -bottom-12 left-4 right-4 bg-white rounded-2xl p-6 text-center shadow-xl transition-transform duration-300 group-hover:-translate-y-2">
                                <h3 className="font-display font-bold text-xl mb-2 text-[#003366]">
                                    {program.programName}
                                </h3>

                                <p className="text-gray-700 text-sm mb-4 line-clamp-2 font-medium">
                                    {program.description}
                                </p>

                                <div className="hidden group-hover:block transition-all duration-300"> {/* Optional: Only show button on hover to keep it clean like the reference? Or always show. Reference text is small. Let's keep it clean. */}
                                </div>
                                {/* Making the whole card clickable or adding a subtle indicator */}
                                <div className="w-8 h-1 bg-gray-200 mx-auto rounded-full group-hover:bg-[#ef5f5f] transition-colors duration-300" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <Link href="/programs">
                        <Button size="lg" variant="primary">View All Programs</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ProgramsPreview;

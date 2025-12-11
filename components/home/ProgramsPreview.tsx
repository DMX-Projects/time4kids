'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
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
            image: '/playgroup.jpg',
            name: 'Play Group',
            ageGroup: '1.5 - 2.5 years',
            description: 'Introduction to social interaction and basic motor skills development.',
            color: 'from-pink-500 to-pink-600',
        },
        {
            image: '/nursery.jpg',
            name: 'Nursery',
            ageGroup: '2.5 - 3.5 years',
            description: 'Building foundation for language, numbers, and creative expression.',
            color: 'from-blue-500 to-blue-600',
        },
        {
            image: '/pp1.jpg',
            name: 'PP-1 & PP-2',
            ageGroup: '3.5 - 5.5 years',
            description: 'Comprehensive pre-primary education preparing for formal schooling.',
            color: 'from-purple-500 to-purple-600',
        },
        {
            image: '/pp2.jpg',
            name: 'Day Care',
            ageGroup: '1.5 - 5.5 years',
            description: 'Extended care with engaging activities throughout the day.',
            color: 'from-orange-500 to-orange-600',
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
        <section ref={sectionRef} className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
            {/* Floating Decorative Dots */}
            <FloatingDots count={6} colors={['bg-pink-200', 'bg-blue-200', 'bg-orange-200', 'bg-green-200']} />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 ref={headingRef} className="font-display font-bold text-4xl md:text-5xl mb-4">
                        Our <span className="gradient-text">Programs</span>
                    </h2>
                    <p ref={descriptionRef} className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Every class, group and child is unique and has different needs at different times. At T.I.M.E. Kids pre-schools, we believe in a curriculum that matches abilities to skills that preschoolers need as a base for later learning and success at school.
                    </p>
                </div>

                <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {programs.map((program, index) => (
                        <Card key={index} className="text-center group overflow-hidden hover-lift">
                            <div className="relative w-full aspect-square mb-6 overflow-hidden rounded-t-2xl">
                                <Image
                                    src={program.image}
                                    alt={program.name}
                                    fill
                                    className="object-cover rounded-t-2xl"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                            </div>
                            <h3 className="font-display font-bold text-xl mb-2 text-gray-900">{program.name}</h3>
                            <div className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                                {program.ageGroup}
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">{program.description}</p>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/programs">
                        <Button size="lg">View All Programs</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ProgramsPreview;

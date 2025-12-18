'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Card from '@/components/ui/Card';
import TiltCard from '@/components/ui/TiltCard';
import FloatingShapes from '@/components/animations/FloatingShapes';
import AnimatedNumbers from '@/components/animations/AnimatedNumbers';
import WaveBackground from '@/components/animations/WaveBackground';
import { Shield, Users, BookOpen, Award, Heart, Sparkles } from 'lucide-react';
import Image from 'next/image';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const WhyChooseUs = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descRef = useRef<HTMLParagraphElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Title animation - faster
            if (titleRef.current) {
                gsap.from(titleRef.current, {
                    scrollTrigger: {
                        trigger: titleRef.current,
                        start: 'top 85%',
                    },
                    scale: 0.9,
                    y: 40,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                });
            }

            // Description animation
            if (descRef.current) {
                gsap.from(descRef.current, {
                    scrollTrigger: {
                        trigger: descRef.current,
                        start: 'top 85%',
                    },
                    y: 30,
                    opacity: 0,
                    duration: 0.6,
                    delay: 0.2,
                    ease: 'power2.out',
                });
            }

            // Cards stagger animation - faster and bouncier
            cardsRef.current.forEach((card, index) => {
                if (card) {
                    const direction = index % 2 === 0 ? -80 : 80;
                    gsap.from(card, {
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 85%',
                        },
                        x: direction,
                        y: 40,
                        opacity: 0,
                        duration: 0.7,
                        ease: 'back.out(1.4)',
                        delay: index * 0.1,
                    });


                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const features = [
        {
            image: '/26@2x.png',
            title: 'Safe Infrastructure',
            description: 'Child-safe environment with CCTV surveillance and secure premises for complete peace of mind.',
            color: 'from-blue-500 to-blue-600',
        },
        {
            image: '/11.png',
            title: 'Trained Teachers',
            description: 'Experienced and caring educators dedicated to nurturing your child\'s development.',
            color: 'from-green-500 to-green-600',
        },
        {
            image: '/4.png',
            title: 'NEP 2020 Curriculum',
            description: 'Updated curriculum aligned with National Education Policy 2020 for holistic development.',
            color: 'from-purple-500 to-purple-600',
        },
        {
            image: '/17.png',
            title: '17 Years Legacy',
            description: 'Backed by T.I.M.E. Group\'s 30+ years of educational expertise and excellence.',
            color: 'from-orange-500 to-orange-600',
        },
        {
            image: '/18.png',
            title: 'Caring Environment',
            description: 'Warm, nurturing atmosphere that makes the transition from home to school seamless.',
            color: 'from-pink-500 to-pink-600',
        },
        {
            image: '/12.png',
            title: 'Fun Learning',
            description: 'Activity-based learning with emphasis on concepts, themes, and hands-on experiences.',
            color: 'from-yellow-500 to-yellow-600',
        },
    ];

    return (
        <section ref={sectionRef} className="py-10 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
            {/* Floating Shapes Background */}
            <FloatingShapes count={10} />

            {/* Wave Background */}
            <WaveBackground position="top" color="#f97316" opacity={0.05} />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-8">
                    <h2 ref={titleRef} className="font-bubblegum text-5xl md:text-6xl mb-4 text-[#003366] tracking-wide">
                        Why Choose <span className="text-[#E67E22]">T.I.M.E. Kids?</span>
                    </h2>
                    <p ref={descRef} className="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
                        We provide the perfect foundation for your child&apos;s educational journey with our proven approach and caring environment.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <TiltCard
                            key={index}
                            intensity={10}
                            className="feature-card group cursor-pointer"
                        >
                            <div ref={(el) => { cardsRef.current[index] = el; }} className="h-full">
                                <Card className="h-full hover-lift">
                                    <div className="feature-icon w-full h-56 mb-6 relative group-hover:scale-105 transition-transform duration-500">
                                        <Image
                                            src={feature.image}
                                            alt={feature.title}
                                            fill
                                            className="object-contain"
                                            priority={false}
                                        />
                                    </div>
                                    <h3 className="font-fredoka font-bold text-2xl mb-3 text-[#003366]">{feature.title}</h3>
                                    <p className="text-gray-700 leading-relaxed font-medium">{feature.description}</p>
                                </Card>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </div>
        </section >
    );
};

export default WhyChooseUs;

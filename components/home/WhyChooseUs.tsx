'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Card from '@/components/ui/Card';
import { Shield, Users, BookOpen, Award, Heart, Sparkles } from 'lucide-react';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const WhyChooseUs = () => {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.feature-card', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out',
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const features = [
        {
            icon: Shield,
            title: 'Safe Infrastructure',
            description: 'Child-safe environment with CCTV surveillance and secure premises for complete peace of mind.',
            color: 'from-blue-500 to-blue-600',
        },
        {
            icon: Users,
            title: 'Trained Teachers',
            description: 'Experienced and caring educators dedicated to nurturing your child\'s development.',
            color: 'from-green-500 to-green-600',
        },
        {
            icon: BookOpen,
            title: 'NEP 2020 Curriculum',
            description: 'Updated curriculum aligned with National Education Policy 2020 for holistic development.',
            color: 'from-purple-500 to-purple-600',
        },
        {
            icon: Award,
            title: '17 Years Legacy',
            description: 'Backed by T.I.M.E. Group\'s 30+ years of educational expertise and excellence.',
            color: 'from-orange-500 to-orange-600',
        },
        {
            icon: Heart,
            title: 'Caring Environment',
            description: 'Warm, nurturing atmosphere that makes the transition from home to school seamless.',
            color: 'from-pink-500 to-pink-600',
        },
        {
            icon: Sparkles,
            title: 'Fun Learning',
            description: 'Activity-based learning with emphasis on concepts, themes, and hands-on experiences.',
            color: 'from-yellow-500 to-yellow-600',
        },
    ];

    return (
        <section ref={sectionRef} className="py-20 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
                        Why Choose <span className="gradient-text">T.I.M.E. Kids?</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We provide the perfect foundation for your child's educational journey with our proven approach and caring environment.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="feature-card group cursor-pointer">
                            <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                <feature.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-display font-bold text-xl mb-3 text-gray-900">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;

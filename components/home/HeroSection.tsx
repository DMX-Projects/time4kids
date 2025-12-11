'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = () => {
    const heroRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const taglineRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(titleRef.current, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
            });

            gsap.from(taglineRef.current, {
                y: 30,
                opacity: 0,
                duration: 1,
                delay: 0.3,
                ease: 'power3.out',
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Background with Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-400 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                            <Sparkles className="w-5 h-5 text-primary-600" />
                            <span className="text-sm font-semibold text-gray-700">17 Years of Legacy in Early Education</span>
                        </div>

                        <h1
                            ref={titleRef}
                            className="font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-tight"
                        >
                            <span className="gradient-text">T.I.M.E. Kids</span>
                            <br />
                            <span className="text-gray-900">Preschool</span>
                        </h1>

                        <p
                            ref={taglineRef}
                            className="text-2xl md:text-3xl font-display font-semibold text-gray-700"
                        >
                            The Preschool That Cares
                        </p>

                        <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                            Providing wholesome, fun-filled and memorable childhood education with 250+ preschools across India. NEP 2020 updated curriculum for your child's bright future.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <Link href="/admission">
                                <Button size="lg" className="group">
                                    Admission Enquiry
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/locate-centre">
                                <Button variant="outline" size="lg">
                                    Locate a Centre
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link href="/franchise">
                                <Button variant="secondary" size="md">
                                    Franchise Enquiry
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Content - Hero Image */}
                    <div className="relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                            <div className="aspect-[4/3] bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                                {/* Placeholder for hero image */}
                                <div className="text-center p-8">
                                    <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                                        <span className="text-6xl">👧👦</span>
                                    </div>
                                    <p className="text-gray-700 font-semibold text-lg">Happy Kids in Orange Uniform</p>
                                    <p className="text-gray-600 text-sm mt-2">Smiling, Learning, Growing</p>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary-400 rounded-full blur-2xl opacity-50"></div>
                            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-400 rounded-full blur-2xl opacity-50"></div>
                        </div>

                        {/* Floating Stats */}
                        <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-6 animate-float hidden lg:block">
                            <div className="text-4xl font-bold gradient-text">250+</div>
                            <div className="text-sm text-gray-600 font-medium">Preschools</div>
                        </div>

                        <div className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-xl p-6 animate-float hidden lg:block" style={{ animationDelay: '0.5s' }}>
                            <div className="text-4xl font-bold gradient-text">17+</div>
                            <div className="text-sm text-gray-600 font-medium">Years Legacy</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;

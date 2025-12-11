'use client';

import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowRight, MapPin, Briefcase, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import Image from 'next/image';
import FloatingDots from '@/components/animations/FloatingDots';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const HeroSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Welcome to T.I.M.E. Kids",
            subtitle: "The Preschool That Cares",
            description: "Providing wholesome, fun-filled and memorable childhood education",
            image: "gradient-to-br from-brand-100 to-secondary-100",
        },
        {
            title: "17 Years of Legacy",
            subtitle: "Excellence in Early Education",
            description: "250+ preschools across India, trusted by thousands of parents",
            image: "gradient-to-br from-secondary-100 to-brand-100",
        },
        {
            title: "NEP 2020 Updated Curriculum",
            subtitle: "Future-Ready Learning",
            description: "Activity-based learning for holistic child development",
            image: "gradient-to-br from-brand-50 to-secondary-50",
        },
    ];

    // Auto-rotate slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
            {/* Floating Decorative Dots */}
            <FloatingDots count={8} />

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 right-20 w-96 h-96 bg-primary-400 rounded-full blur-3xl animate-pulse-soft"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary-400 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 animate-fade-in-left">
                        {/* Legacy Badge */}
                        <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform">
                            <Award className="w-5 h-5 text-primary-600" />
                            <span className="text-sm font-bold text-gray-900">17 Years of Legacy in Early Education</span>
                        </div>

                        {/* Slide Content */}
                        <div className="space-y-4">
                            <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-tight text-gray-900">
                                {slides[currentSlide].title}
                            </h1>

                            <p className="text-3xl md:text-4xl font-display font-bold gradient-text">
                                {slides[currentSlide].subtitle}
                            </p>

                            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                                {slides[currentSlide].description}
                            </p>
                        </div>

                        {/* 4 CTA Buttons as per structure */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <Link href="/admission">
                                    <Button size="lg" className="group animate-scale-in">
                                        Admission Enquiry
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link href="/locate-centre">
                                    <Button variant="secondary" size="lg" className="group animate-scale-in delay-100">
                                        <MapPin className="w-5 h-5" />
                                        Locate a Centre
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Link href="/franchise">
                                    <Button variant="outline" size="md" className="group animate-scale-in delay-200">
                                        <Briefcase className="w-5 h-5" />
                                        Franchise Enquiry
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Slider Dots */}
                        <div className="flex items-center space-x-3">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-2 rounded-full transition-all ${index === currentSlide
                                        ? 'w-8 bg-primary-500'
                                        : 'w-2 bg-gray-300 hover:bg-primary-300'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>


                    {/* Right Content - Hero Image */}
                    <div className="relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                            {/* Keep the same aspect ratio box */}
                            <div className="aspect-[4/3] bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                                {/* Image wrapper needs to fill the aspect box */}
                                <div className="relative w-full h-full">
                                    {/* 
                                        Put your image file under `public/images/hero-kids-orange.jpg`
                                        or change the src path below to match your file name.
                                    */}
                                    <Image
                                        src="/kids.png"
                                        alt="Happy kids in orange uniform - smiling and learning"
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover object-center"
                                        priority
                                    />
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

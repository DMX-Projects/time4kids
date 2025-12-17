'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowRight, MapPin, Briefcase, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import Image from 'next/image';
//import FloatingShapes from '@/components/animations/FloatingShapes';
//import TwinklingStars from '@/components/animations/TwinklingStars';
//import AnimatedLetters from '@/components/animations/AnimatedLetters';
import { createHeroEntrance, createCTAPulse } from '@/lib/gsap-advanced';
import MagneticButton from '@/components/ui/MagneticButton';
import SmoothScroll from '@/components/shared/SmoothScroll';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const HeroSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const badgeRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const descRef = useRef<HTMLParagraphElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const ctaButtonRef = useRef<HTMLAnchorElement>(null);

    const slides = [
        {
            title: "Welcome to T.I.M.E. Kids",
            subtitle: "The Preschool That Cares",
            description: "Providing wholesome, fun-filled and memorable childhood education",
            image: "/5@2x.png",
            gradient: "gradient-to-br from-primary-100 to-secondary-100",
        },
        {
            title: "17 Years of Legacy",
            subtitle: "Excellence in Early Education",
            description: "250+ preschools across India, trusted by thousands of parents",
            image: "/26@2x.png",
            gradient: "gradient-to-br from-secondary-100 to-primary-100",
        },
        {
            title: "NEP 2020 Updated Curriculum",
            subtitle: "Future-Ready Learning",
            description: "Activity-based learning for holistic child development",
            image: "/4.png",
            gradient: "gradient-to-br from-primary-50 to-secondary-50",
        },
    ];

    // Hero entrance animations
    useEffect(() => {
        let ctx = gsap.context(() => {
            const timeline = gsap.timeline({ delay: 0.2 });

            // Badge bounce in
            if (badgeRef.current) {
                timeline.fromTo(badgeRef.current, {
                    scale: 0.5,
                    opacity: 0
                }, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.6,
                    ease: 'back.out(1.7)',
                });
            }

            // Title entrance
            if (titleRef.current) {
                timeline.fromTo(titleRef.current, {
                    y: 50,
                    opacity: 0
                }, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                }, '-=0.4');
            }

            // Subtitle entrance
            if (subtitleRef.current) {
                timeline.fromTo(subtitleRef.current, {
                    y: 30,
                    opacity: 0
                }, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                }, '-=0.6');
            }

            // Description entrance
            if (descRef.current) {
                timeline.fromTo(descRef.current, {
                    y: 20,
                    opacity: 0
                }, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: 'power2.out',
                }, '-=0.6');
            }

            // Buttons stagger
            if (buttonsRef.current) {
                const buttons = buttonsRef.current.querySelectorAll('a');
                timeline.fromTo(buttons, {
                    y: 20,
                    opacity: 0
                }, {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'back.out(1.2)',
                }, '-=0.4');
            }

            // Image entrance
            if (imageRef.current) {
                timeline.fromTo(imageRef.current, {
                    x: 50,
                    opacity: 0
                }, {
                    x: 0,
                    opacity: 1,
                    duration: 1,
                    ease: 'power3.out',
                }, '-=0.8');
            }

            // CTA pulse animation
            if (ctaButtonRef.current) {
                createCTAPulse(ctaButtonRef.current);
            }
        });

        return () => ctx.revert();
    }, []);

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
            {/* Kid-Friendly Animations - Behind everything */}
            {/*<div className="absolute inset-0 z-0 pointer-events-none">
                
                <TwinklingStars count={8} />
                <AnimatedLetters />
                <FloatingShapes count={6} />
            </div>*/}

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 z-1">
                <div className="absolute top-20 right-20 w-96 h-96 bg-primary-400 rounded-full blur-3xl animate-pulse-soft"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary-400 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 relative z-20">
                        {/* Legacy Badge */}
                        <div ref={badgeRef} className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform">
                            <Award className="w-5 h-5 text-primary-600" />
                            <span className="text-sm font-bold text-black ">17 Years of Legacy in Early Education</span>
                        </div>

                        {/* Slide Content */}
                        <div className="space-y-4">
                            <h1 ref={titleRef} className="font-fredoka font-bold text-6xl md:text-7xl lg:text-8xl leading-tight text-black " style={{ textShadow: '0 3px 6px rgba(0,0,0,0.12)' }}>
                                {slides[currentSlide].title}
                            </h1>

                            <p ref={subtitleRef} className="text-4xl md:text-5xl font-baloo font-bold text-primary-600" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                {slides[currentSlide].subtitle}
                            </p>

                            <p ref={descRef} className="text-xl text-black leading-relaxed max-w-xl font-comic font-medium">
                                {slides[currentSlide].description}
                            </p>
                        </div>

                        {/* 4 CTA Buttons with Magnetic Effects */}
                        <div ref={buttonsRef} className="space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <MagneticButton strength={0.4}>
                                    <Link ref={ctaButtonRef} href="/admission">
                                        <Button size="lg" className="group animate-scale-in font-fredoka">
                                            Admission Enquiry
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </MagneticButton>
                                <MagneticButton strength={0.4}>
                                    <Link href="/locate-centre">
                                        <Button variant="secondary" size="lg" className="group animate-scale-in delay-100 font-fredoka">
                                            <MapPin className="w-5 h-5" />
                                            Locate a Centre
                                        </Button>
                                    </Link>
                                </MagneticButton>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <MagneticButton strength={0.3}>
                                    <Link href="/franchise">
                                        <Button variant="outline" size="md" className="group animate-scale-in delay-200 font-fredoka">
                                            <Briefcase className="w-5 h-5" />
                                            Franchise Enquiry
                                        </Button>
                                    </Link>
                                </MagneticButton>
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
                    <div ref={imageRef} className="relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                            {/* Keep the same aspect ratio box */}
                            <div className={`aspect-[4/3] bg-gradient-to-br from-primary-200 to-secondary-200 flex items-center justify-center transition-colors duration-500`}>
                                {/* Image wrapper needs to fill the aspect box */}
                                <div className="relative w-full h-full">
                                    <Image
                                        key={currentSlide} // Key forces re-render for animation
                                        src={slides[currentSlide].image}
                                        alt={slides[currentSlide].title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover object-center animate-fade-in"
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

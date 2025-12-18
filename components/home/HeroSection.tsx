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
        <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#FFF5F0]">
            {/* Playful Zig-Zag Background using SVG */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <svg className="absolute top-0 right-0 w-1/2 h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 0 L10 10 L20 0 L30 10 L40 0 L50 10 L60 0 L70 10 L80 0 L90 10 L100 0 V100 H0 Z" fill="#FF9F1C" />
                </svg>
                <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-40 right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="container mx-auto px-4 relative z-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 relative z-20">
                        {/* Legacy Badge - Styled as a pill */}
                        <div ref={badgeRef} className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-transform border border-gray-100">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <Award className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-800">17 Years of Legacy in Early Education</span>
                        </div>

                        {/* Slide Content */}
                        <div className="space-y-4">
                            <h1 ref={titleRef} className="font-luckiest text-5xl md:text-6xl lg:text-7xl leading-tight text-[#003366] tracking-wide" style={{ textShadow: '2px 4px 6px rgba(0,0,0,0.15)' }}>
                                {slides[currentSlide].title}
                            </h1>

                            <p ref={subtitleRef} className="text-3xl md:text-4xl font-bubblegum text-[#E67E22]" style={{ textShadow: '1px 2px 3px rgba(0,0,0,0.1)' }}>
                                {slides[currentSlide].subtitle}
                            </p>

                            <p ref={descRef} className="text-xl text-gray-700 leading-relaxed max-w-xl font-medium">
                                {slides[currentSlide].description}
                            </p>
                        </div>

                        {/* 4 CTA Buttons with Magnetic Effects */}
                        <div ref={buttonsRef} className="space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <MagneticButton strength={0.4}>
                                    <Link ref={ctaButtonRef} href="/admission">
                                        <Button size="lg" className="relative font-fredoka bg-orange-500 hover:bg-orange-600 text-white shadow-xl px-8 py-4 animate-wiggle-slow transition-transform hover:scale-110" style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}>
                                            Admission Enquiry
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-2" />
                                        </Button>
                                    </Link>
                                </MagneticButton>
                                <MagneticButton strength={0.4}>
                                    <Link href="/locate-centre">
                                        <Button variant="secondary" size="lg" className="relative font-fredoka bg-blue-400 hover:bg-blue-500 text-white shadow-xl px-8 py-4 animate-wiggle-slow animation-delay-500 transition-transform hover:scale-110" style={{ borderRadius: '25px 225px 25px 255px / 255px 25px 225px 25px' }}>
                                            <MapPin className="w-5 h-5 mr-2" />
                                            Locate a Centre
                                        </Button>
                                    </Link>
                                </MagneticButton>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <MagneticButton strength={0.3}>
                                    <Link href="/franchise">
                                        <Button variant="outline" size="md" className="relative font-fredoka border-2 border-dashed border-gray-400 text-gray-600 hover:border-orange-400 hover:text-orange-500 px-6 py-3 bg-white/80 backdrop-blur-sm shadow-lg animate-wiggle-slow animation-delay-1000 transition-transform hover:scale-110" style={{ borderRadius: '225px 25px 225px 25px / 25px 225px 25px 255px' }}>
                                            <Briefcase className="w-5 h-5 mr-2" />
                                            Franchise Enquiry
                                        </Button>
                                    </Link>
                                </MagneticButton>
                            </div>
                        </div>

                        {/* Slider Dots */}
                        <div className="flex items-center space-x-3 pt-4">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-3 transition-all rounded-full ${index === currentSlide
                                        ? 'w-10 bg-orange-500'
                                        : 'w-3 bg-gray-300 hover:bg-orange-300'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>


                    {/* Right Content - Organic Shape Image */}
                    <div ref={imageRef} className="relative mt-10 lg:mt-0">
                        {/* Organic Blob Shape Background for Image */}
                        <div className="relative animate-float-slow">
                            {/* The "Blob" Mask/Border Radius */}
                            <div className="relative overflow-hidden shadow-2xl transform transition-transform duration-500 rounded-[3rem_2rem_4rem_2rem] border-4 border-white">
                                <div className={`aspect-[4/3] bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center transition-colors duration-500`}>
                                    <div className="relative w-full h-full">
                                        <Image
                                            key={currentSlide}
                                            src={slides[currentSlide].image}
                                            alt={slides[currentSlide].title}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="object-cover object-center animate-fade-in"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Background Blobs behind the image */}
                            <div className="absolute -top-10 -right-10 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 animate-pulse-soft"></div>
                            <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
                        </div>

                        {/* Floating Stats Badges - Asymmetric & Playful */}
                        <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-6 animate-float z-30 border-b-4 border-blue-500 rotate-[-3deg] hover:rotate-0 transition-transform">
                            <div className="flex items-center gap-3">
                                <div className="text-4xl font-black text-blue-500">250+</div>
                                <div className="text-sm text-gray-600 font-bold leading-tight">Pre-<br />schools</div>
                            </div>
                        </div>

                        <div className="absolute top-8 -right-8 bg-white rounded-2xl shadow-xl p-5 animate-float z-30 border-b-4 border-orange-500 rotate-[3deg] hover:rotate-0 transition-transform" style={{ animationDelay: '1.5s' }}>
                            <div className="flex flex-col items-center">
                                <div className="text-4xl font-black text-orange-500">17+</div>
                                <div className="text-sm text-gray-600 font-bold">Years Legacy</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;

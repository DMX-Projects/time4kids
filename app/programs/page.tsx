'use client';

import React, { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, BookOpen, Star, Heart, Music, Palette, Users, Sparkles, Sun, Cloud, Bird } from 'lucide-react';
import TwinklingStars from '@/components/animations/TwinklingStars';
import AnimatedNumbers from '@/components/animations/AnimatedNumbers';
import { gsap } from 'gsap';

// --- Interactive Bubbles Component ---
const InteractiveBubbles = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const bubbles: HTMLDivElement[] = [];
        const bubbleCount = 15;
        const colors = ['bg-pink-300', 'bg-blue-300', 'bg-purple-300', 'bg-yellow-300', 'bg-green-300', 'bg-orange-300'];

        // Create Bubbles
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            const size = Math.random() * 60 + 20; // 20px to 80px
            const color = colors[Math.floor(Math.random() * colors.length)];

            bubble.className = `absolute rounded-full opacity-60 mix-blend-multiply filter blur-sm ${color} pointer-events-auto cursor-pointer transition-transform duration-300 hover:scale-125`;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${Math.random() * 100}%`;
            bubble.style.top = `${Math.random() * 100}%`;

            container.appendChild(bubble);
            bubbles.push(bubble);

            // Floating Animation
            gsap.to(bubble, {
                y: `-=${Math.random() * 200 + 100}`,
                x: `+=${Math.random() * 50 - 25}`,
                rotation: Math.random() * 360,
                duration: Math.random() * 10 + 10,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: Math.random() * 5
            });
        }

        // Mouse Interaction
        const onMouseMove = (e: MouseEvent) => {
            bubbles.forEach(bubble => {
                const rect = bubble.getBoundingClientRect();
                const bubbleX = rect.left + rect.width / 2;
                const bubbleY = rect.top + rect.height / 2;
                const distX = e.clientX - bubbleX;
                const distY = e.clientY - bubbleY;
                const dist = Math.sqrt(distX * distX + distY * distY);
                const maxDist = 150;

                if (dist < maxDist) {
                    const power = (maxDist - dist) / maxDist;
                    gsap.to(bubble, {
                        x: `-=${distX * power * 0.5}`,
                        y: `-=${distY * power * 0.5}`,
                        duration: 0.5,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                }
            });
        };

        window.addEventListener('mousemove', onMouseMove);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            bubbles.forEach(b => b.remove());
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden" />;
};

// --- Cloud Shape Divider ---
const CloudDivider = ({ flip = false }) => (
    <div className={`w-full text-white relative z-10 -my-2 ${flip ? 'rotate-180' : ''}`}>
        <svg viewBox="0 0 1440 320" className="w-full h-auto block" preserveAspectRatio="none">
            <path fill="currentColor" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
    </div>
);

export default function ProgramsPage() {
    const programs = [
        {
            image: '/1.png',
            name: 'Play Group',
            ageGroup: '1.5 - 2.5 years',
            duration: '2-3 hours',
            description: 'A magical start to learning! We focus on sensory play, making friends, and discovering the colorful world around us.',
            features: ['Messy & Sensory Play', 'Music & Dance', 'Making Friends', 'Fun with Colors'],
            colorStart: 'from-[#FF9A9E]',
            colorEnd: 'to-[#FECFEF]',
            accent: 'text-pink-500',
            bg: 'bg-pink-50',
            blobShape: 'rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%]',
            icon: Music,
        },
        {
            image: '/2 (1).png',
            name: 'Nursery',
            ageGroup: '2.5 - 3.5 years',
            duration: '3-4 hours',
            description: 'Building bridges to big ideas! Hands-on activities that spark curiosity, language, and creativity in little minds.',
            features: ['Story Time Fun', 'Arts & Crafts', 'Counting Games', 'Outdoor Exploration'],
            colorStart: 'from-[#a18cd1]',
            colorEnd: 'to-[#fbc2eb]',
            accent: 'text-purple-500',
            bg: 'bg-purple-50',
            blobShape: 'rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%]',
            icon: Palette,
        },
        {
            image: '/2.png',
            name: 'Pre-Primary 1',
            ageGroup: '3.5 - 4.5 years',
            duration: '4 hours',
            description: 'Ready, set, grow! We introduce phonics, writing, and numbers through exciting themes and interactive play.',
            features: ['Phonics & Reading', 'Writing Fun', 'Number Magic', 'World Around Us'],
            colorStart: 'from-[#84fab0]',
            colorEnd: 'to-[#8fd3f4]',
            accent: 'text-teal-600',
            bg: 'bg-teal-50',
            blobShape: 'rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]',
            icon: BookOpen,
        },
        {
            image: '/16.png',
            name: 'Pre-Primary 2',
            ageGroup: '4.5 - 5.5 years',
            duration: '4-5 hours',
            description: 'Future school superstars! Advanced concepts in math, science, and language to prep for big school with confidence.',
            features: ['Little Scientists', 'Math Whiz', 'Creative Writing', 'Public Speaking'],
            colorStart: 'from-[#f6d365]',
            colorEnd: 'to-[#fda085]',
            accent: 'text-orange-500',
            bg: 'bg-orange-50',
            blobShape: 'rounded-[50%_50%_20%_80%_/_25%_80%_20%_75%]',
            icon: Star,
        },
        {
            image: '/day care.png',
            name: 'Day Care',
            ageGroup: '1.5 - 10 years',
            duration: 'Full Day',
            description: 'A home away from home! Safe, loving, and engaging care with nutritious meals and help with homework.',
            features: ['Homework Help', 'Yummy Meals', 'Nap Time', 'Free Play'],
            colorStart: 'from-[#4facfe]',
            colorEnd: 'to-[#00f2fe]',
            accent: 'text-blue-500',
            bg: 'bg-blue-50',
            blobShape: 'rounded-[70%_30%_30%_70%_/_60%_40%_60%_40%]',
            icon: Heart,
        },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#FDFBF7] font-sans selection:bg-yellow-200">
            {/* Background Animations */}
            <InteractiveBubbles />
            <div className="fixed top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none z-[-1]"></div>

            {/* Hero Section */}
            <section className="relative pt-12 pb-20 overflow-visible">
                {/* Decorative Elements */}
                <div className="absolute top-20 left-[10%] w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-24 right-[15%] w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-32 left-[20%] w-28 h-28 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white to-transparent opacity-60 z-0 pointer-events-none"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-1.5 rounded-full shadow-sm mb-4 border border-orange-100 hover:scale-105 transition-transform cursor-default">
                        <Sun className="w-4 h-4 text-yellow-500 animate-spin-slow" />
                        <span className="font-bold text-orange-500 tracking-wide uppercase text-xs">Bright futures start here</span>
                    </div>

                    <h1 className="font-display font-black text-5xl md:text-6xl mb-4 text-slate-800 tracking-tight drop-shadow-sm">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 relative inline-block">
                            Programs
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300 -z-10 opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                        Curiosity-led learning adventures for every stage of your child&apos;s magical early years.
                    </p>
                </div>

                {/* Cartoon Character */}
                <div className="absolute bottom-0 right-[5%] z-20 w-40 h-40 hidden md:block animate-bounce-slow">
                    <Image src="/kid-character.gif" alt="Happy Kid" fill className="object-contain drop-shadow-2xl" unoptimized />
                </div>
            </section>

            {/* Cloud Divider */}
            <div className="relative -mt-32 md:-mt-56 z-20">
                <CloudDivider />
            </div>

            {/* Content Section - The Program Cards */}
            <section className="relative bg-white pt-0 pb-20 z-10">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col gap-12 md:gap-16">
                        {programs.map((program, index) => (
                            <div key={index} className={`flex flex-col md:flex-row items-center gap-8 lg:gap-12 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>

                                {/* Image Side */}
                                <div className="w-full md:w-5/12 relative group perspective-1000">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${program.colorStart} ${program.colorEnd} opacity-40 blur-xl transform scale-90 group-hover:scale-100 transition-all duration-700 rounded-full`}></div>

                                    <div className={`relative w-full aspect-square md:aspect-[4/3] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-500 transform group-hover:rotate-1`} style={{ borderRadius: index % 2 === 0 ? '60% 40% 30% 70% / 60% 30% 70% 40%' : '30% 70% 70% 30% / 30% 30% 70% 70%' }}>
                                        <div className="absolute inset-0 bg-white/20 z-10"></div>
                                        <Image
                                            src={program.image}
                                            alt={program.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />

                                        {/* Floating Badge */}
                                        <div className={`absolute bottom-8 ${index % 2 === 0 ? 'right-8' : 'left-8'} z-20 bg-white p-4 rounded-full shadow-xl animate-float`}>
                                            <program.icon className={`w-8 h-8 ${program.accent}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Side */}
                                <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
                                    <div className="inline-block">
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider bg-white border shadow-sm ${program.accent} border-current`}>
                                            {program.ageGroup}
                                        </span>
                                    </div>

                                    <h2 className="font-display font-black text-4xl md:text-5xl text-slate-800 leading-tight">
                                        {program.name}
                                    </h2>

                                    <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-bold">
                                        <Clock className="w-5 h-5" />
                                        <span>{program.duration}</span>
                                    </div>

                                    <p className="text-xl text-slate-600 leading-relaxed font-medium">
                                        {program.description}
                                    </p>

                                    <ul className="grid grid-cols-2 gap-3 pt-4">
                                        {program.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-slate-700 font-semibold bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${program.colorStart} ${program.colorEnd}`}></div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="pt-6">
                                        <Link href="/admission">
                                            <Button className={`px-10 py-5 text-lg rounded-full font-bold shadow-xl shadow-orange-100 hover:shadow-orange-200 hover:-translate-y-1 transition-all bg-gradient-to-r ${program.colorStart} ${program.colorEnd} border-none`}>
                                                Enroll Your Child
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
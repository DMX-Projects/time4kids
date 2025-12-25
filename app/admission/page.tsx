'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import {
    Shield, Users, BookOpen, Download, Video, Sparkles, Sun, Star, Heart,
    Music, Smile, Brain, Palette, Dumbbell, Globe
} from 'lucide-react';

import AdmissionForm from '@/components/admission/AdmissionForm';
import FAQAccordion from '@/components/admission/FAQAccordion';
import TestimonialVideo from '@/components/shared/TestimonialVideo';

// --- 1. Interactive Bubbles (Clean) ---
const InteractiveBubbles = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const bubbles: HTMLDivElement[] = [];
        const bubbleCount = 20;
        const colors = ['bg-pink-300', 'bg-purple-300', 'bg-blue-300', 'bg-green-300', 'bg-yellow-300', 'bg-orange-300'];

        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            const size = Math.random() * 40 + 10;
            const color = colors[Math.floor(Math.random() * colors.length)];

            bubble.className = `absolute rounded-full opacity-30 mix-blend-multiply filter blur-[1px] ${color} pointer-events-auto cursor-pointer transition-transform duration-300 hover:scale-110 shadow-sm border border-slate-100/30 backdrop-blur-[1px]`;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${Math.random() * 100}%`;
            bubble.style.top = `${Math.random() * 100}%`;
            container.appendChild(bubble);
            bubbles.push(bubble);
            gsap.to(bubble, { y: `-=${Math.random() * 300 + 100}`, x: `+=${Math.random() * 100 - 50}`, rotation: Math.random() * 360, duration: Math.random() * 15 + 10, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: Math.random() * 5 });
        }
        const onMouseMove = (e: MouseEvent) => {
            bubbles.forEach(bubble => {
                const rect = bubble.getBoundingClientRect();
                const bubbleX = rect.left + rect.width / 2;
                const bubbleY = rect.top + rect.height / 2;
                const distX = e.clientX - bubbleX;
                const distY = e.clientY - bubbleY;
                const dist = Math.sqrt(distX * distX + distY * distY);
                if (dist < 200) {
                    const power = (200 - dist) / 200;
                    gsap.to(bubble, { x: `-=${distX * power * 0.8}`, y: `-=${distY * power * 0.8}`, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
                }
            });
        };
        window.addEventListener('mousemove', onMouseMove);
        return () => { window.removeEventListener('mousemove', onMouseMove); bubbles.forEach(b => b.remove()); };
    }, []);
    return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden" suppressHydrationWarning />;
};

// --- 2. Cloud Divider ---
const CloudDivider = ({ flip = false, className = '' }) => (
    <div className={`w-full text-slate-50 relative z-20 ${flip ? 'rotate-180' : ''} ${className}`}>
        <svg viewBox="0 0 1440 320" className="w-full h-auto block drop-shadow-none" preserveAspectRatio="none">
            <path fill="#f8fafc" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
    </div>
);

// --- 3. Main Page Component ---
export default function AdmissionPage() {
    const whyPreschool = ['Strong foundation for future', 'Social & emotional growth', 'Ready for big school!', 'Brain development boost', 'Confidence building'];
    const whyTimeKids = ['17 Years of Happiness', '250+ Centers in India', 'NEP 2020 Compliant', 'Loving & Trained Teachers', 'Safe, Colorful Spaces', 'Fun Activity Learning'];
    const skills = [
        { title: 'Cognitive', desc: 'Problem solving', icon: <Brain className="w-8 h-8 text-white" />, color: 'bg-purple-500', shadow: 'shadow-purple-200', shape: 'rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%]' },
        { title: 'Emotional', desc: 'Self-awareness', icon: <Heart className="w-8 h-8 text-white" />, color: 'bg-pink-500', shadow: 'shadow-pink-200', shape: 'rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%]' },
        { title: 'Social', desc: 'Team work', icon: <Users className="w-8 h-8 text-white" />, color: 'bg-blue-500', shadow: 'shadow-blue-200', shape: 'rounded-[50%_50%_20%_80%_/_25%_80%_20%_75%]' },
        { title: 'Creative', desc: 'Art & Craft', icon: <Palette className="w-8 h-8 text-white" />, color: 'bg-orange-500', shadow: 'shadow-orange-200', shape: 'rounded-[40%_60%_60%_40%_/_40%_40%_60%_60%]' },
        { title: 'Musical', desc: 'Rhythm & Beat', icon: <Music className="w-8 h-8 text-white" />, color: 'bg-green-500', shadow: 'shadow-green-200', shape: 'rounded-[70%_30%_30%_70%_/_60%_40%_60%_40%]' },
        { title: 'Physical', desc: 'Motor skills', icon: <Dumbbell className="w-8 h-8 text-white" />, color: 'bg-red-500', shadow: 'shadow-red-200', shape: 'rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]' },
        { title: 'Language', desc: 'Reading skills', icon: <BookOpen className="w-8 h-8 text-white" />, color: 'bg-indigo-500', shadow: 'shadow-indigo-200', shape: 'rounded-[60%_40%_40%_60%_/_50%_50%_50%_50%]' },
        { title: 'Nature', desc: 'Eco awareness', icon: <Globe className="w-8 h-8 text-white" />, color: 'bg-teal-500', shadow: 'shadow-teal-200', shape: 'rounded-[30%_70%_50%_50%_/_30%_30%_70%_70%]' }
    ];

    return (
        <div className="min-h-screen relative overflow-x-hidden bg-slate-50 font-sans selection:bg-pink-200" suppressHydrationWarning>
            <InteractiveBubbles />

            {/* HERO SECTION */}
            <section className="relative pt-12 pb-32 md:pb-48 overflow-visible z-10">
                <div className="absolute top-20 right-10 animate-bounce-slow opacity-60 hidden md:block"><Star className="text-yellow-400 w-12 h-12 fill-current" /></div>
                <div className="absolute top-40 left-10 animate-pulse opacity-60 hidden md:block"><Music className="text-orange-400 w-10 h-10" /></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow-sm mb-6 border border-slate-200 hover:scale-110 transition-transform cursor-pointer animate-float">
                        <Sparkles className="w-5 h-5 text-yellow-500 animate-spin-slow" />
                        <span className="font-bold text-slate-600 tracking-wide uppercase text-sm">Admissions Open 2025-26</span>
                    </div>
                    <div className="max-w-2xl mx-auto">
                        <h1 className="font-display font-black text-4xl md:text-6xl mb-6 text-slate-800 tracking-tight leading-tight">
                            Start Your Child&apos;s <br />
                            <span className="relative inline-block mt-2">
                                {/* CHANGED: Pink gradient to Orange/Yellow Gradient */}
                                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 drop-shadow-sm">
                                    Magical Journey
                                </span>
                                <svg className="absolute w-[110%] h-6 -bottom-1 -left-[5%] text-yellow-200 -z-10 opacity-100" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="12" fill="none" strokeLinecap="round" /></svg>
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-4">
                            Join the <span className="font-bold text-blue-500">T.I.M.E. Kids</span> family! Where learning is a <span className="text-orange-500 font-bold">fun adventure</span> every single day.
                        </p>
                    </div>
                </div>
            </section>

            {/* DIVIDER */}
            <div className="relative z-20 text-slate-50 -mt-32 md:-mt-64">
                <CloudDivider />
            </div>

            {/* ADMISSION FORM */}
            <section className="relative bg-white pt-0 pb-24 z-30 -mt-10 md:-mt-20">
                <div className="container mx-auto px-4 relative">
                    <div className="absolute top-0 -left-8 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center animate-float shadow-lg border-2 border-yellow-200 z-40 hidden md:flex"><Sun className="text-yellow-500 w-8 h-8" /></div>
                    <div className="absolute top-20 -right-8 w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center animate-float animation-delay-1000 shadow-lg border-2 border-pink-200 z-40 hidden md:flex"><Heart className="text-pink-500 w-8 h-8 fill-current" /></div>

                    <div className="max-w-5xl mx-auto bg-white p-8 md:p-12 relative transition-all duration-500">
                        <div className="absolute inset-0 bg-white rounded-[3rem] md:rounded-[65%_35%_70%_30%_/_30%_50%_50%_70%] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border-[6px] border-slate-50 ring-4 ring-slate-100 -z-10 transform transition-all hover:scale-[1.01] hover:rotate-1"></div>
                        <div className="text-center mb-10 relative z-10">
                            <h2 className="font-display font-black text-3xl md:text-5xl text-slate-800 mb-3 drop-shadow-sm">Enquiry Form</h2>
                            <p className="text-slate-500 font-bold text-lg">Let&apos;s get to know your little one!</p>
                        </div>
                        <div className="relative z-10">
                            <AdmissionForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Preschool & Why T.I.M.E. Kids */}
            <section className="py-24 relative bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
                        <div className="group relative">
                            <div className="absolute inset-0 bg-yellow-400 rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] transform rotate-3 scale-105 opacity-20 group-hover:rotate-6 transition-transform duration-500"></div>
                            <div className="bg-white relative rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] p-12 md:p-16 shadow-xl border-4 border-yellow-100 hover:border-yellow-300 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col justify-center">
                                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6 text-yellow-600 mx-auto shadow-inner"><BookOpen className="w-10 h-10" /></div>
                                <h3 className="font-display font-black text-3xl mb-6 text-slate-800 text-center">Why Preschool?</h3>
                                <ul className="space-y-4">{whyPreschool.map((item, index) => (<li key={index} className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-yellow-400 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-md">✓</div><span className="text-slate-600 font-bold text-lg">{item}</span></li>))}</ul>
                            </div>
                        </div>

                        {/* CHANGED: Purple Box to Orange/Yellow Theme */}
                        <div className="group relative mt-12 md:mt-0">
                            <div className="absolute inset-0 bg-orange-400 rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] transform -rotate-2 scale-105 opacity-20 group-hover:-rotate-6 transition-transform duration-500"></div>
                            {/* Changed Gradient to Orange/Yellow */}
                            <div className="bg-gradient-to-br from-orange-400 to-yellow-500 text-white relative rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] p-12 md:p-16 shadow-xl border-4 border-white/20 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col justify-center">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 text-white backdrop-blur-md mx-auto shadow-inner"><Star className="w-10 h-10 fill-current" /></div>
                                <h3 className="font-display font-black text-3xl mb-6 text-center">Why T.I.M.E. Kids?</h3>
                                <ul className="space-y-4">
                                    {whyTimeKids.map((item, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            {/* Changed Check circle to White bg with Orange text */}
                                            <div className="w-8 h-8 rounded-full bg-white text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-lg">★</div>
                                            <span className="text-white font-bold text-lg">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Infrastructure Section */}
            <section className="py-12 md:py-24 bg-white relative z-10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <div className="inline-block px-6 py-2 rounded-full bg-green-100 text-green-700 font-black text-sm mb-4 border-2 border-green-200 uppercase tracking-wider">World Class Facilities</div>
                        <h2 className="font-display font-black text-4xl md:text-6xl mb-6 text-slate-800">Safe & Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">Infrastructure</span></h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        <div className="bg-blue-50 rounded-[45%_55%_70%_30%_/_30%_60%_40%_70%] p-12 text-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:bg-blue-100 hover:scale-105 border-4 border-white group">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md group-hover:rotate-12 transition-transform"><Shield className="w-12 h-12 text-blue-500" /></div>
                            <h3 className="font-display font-bold text-2xl mb-4 text-slate-800">Safe Environment</h3>
                            <p className="text-slate-600 font-semibold">CCTV surveillance & child-safe corners.</p>
                        </div>
                        <div className="bg-green-50 rounded-[65%_35%_25%_75%_/_55%_30%_70%_45%] p-12 text-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:bg-green-100 hover:scale-105 border-4 border-white group md:mt-12">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md group-hover:-rotate-12 transition-transform"><Users className="w-12 h-12 text-green-500" /></div>
                            <h3 className="font-display font-bold text-2xl mb-4 text-slate-800">Concept Rooms</h3>
                            <p className="text-slate-600 font-semibold">Bright, colorful & stimulating walls.</p>
                        </div>
                        <div className="bg-orange-50 rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] p-12 text-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:bg-orange-100 hover:scale-105 border-4 border-white group">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform"><Smile className="w-12 h-12 text-orange-500" /></div>
                            <h3 className="font-display font-bold text-2xl mb-4 text-slate-800">Fun Play Area</h3>
                            <p className="text-slate-600 font-semibold">Safe outdoor slides & swings.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative py-20 bg-slate-50 z-10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4 inline-block">Our Curriculum</span>
                        <h2 className="font-display font-black text-4xl md:text-5xl text-slate-800">Skills We <span className="text-orange-500">Nurture</span></h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 max-w-7xl mx-auto">
                        {skills.map((skill, index) => (
                            <div key={index} className="group relative flex flex-col items-center justify-center p-8 text-center transition-all duration-500 hover:-translate-y-2 cursor-pointer">
                                <div className={`absolute inset-0 bg-white ${skill.shape} shadow-xl ${skill.shadow} border-4 border-white transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:rotate-3 group-hover:rounded-[50%] z-0`}></div>
                                <div className="relative z-10">
                                    <div className={`${skill.color} w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 ring-4 ring-white`}>{skill.icon}</div>
                                    <h3 className="font-display font-bold text-xl text-slate-800 mb-1 group-hover:text-orange-500 transition-colors">{skill.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{skill.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 relative overflow-hidden bg-white">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto bg-slate-50 rounded-[50px] p-12 md:p-20 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center relative border-b-8 border-purple-200">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-100 rounded-br-[100px] rounded-tl-[50px] -z-0"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-100 rounded-tl-[100px] rounded-br-[50px] -z-0"></div>
                        <div className="relative z-10">
                            <div className="inline-block p-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 shadow-xl mb-8 text-white animate-bounce-slow"><BookOpen className="w-12 h-12" /></div>
                            <h2 className="font-display font-black text-4xl md:text-5xl mb-8 text-slate-800">NEP 2020 Updated Curriculum</h2>
                            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-10 font-medium max-w-3xl mx-auto">We follow the latest national standards to ensure your child learns the <span className="text-purple-600 font-bold">right things</span> at the <span className="text-pink-600 font-bold">right time</span>.</p>
                            <button className="bg-slate-800 text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-all hover:shadow-purple-200/50 hover:shadow-2xl flex items-center gap-3 mx-auto"><Star className="w-5 h-5 text-yellow-400 fill-current" />Holistic Development Model</button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-blue-50/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16"><h2 className="font-display font-black text-4xl md:text-6xl mb-4 text-slate-800">Happy <span className="text-orange-500 underline decoration-wavy decoration-yellow-400">Parents</span></h2></div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        <div className="transform hover:rotate-1 transition-transform duration-300"><TestimonialVideo title="Annual Day Fun" author="T.I.M.E. Kids Kilpauk" location="Chennai" videoUrl="/chaninai kilpauk-AnnualDay-Video-2018-19.mp4" thumbnailUrl="/day care.png" /></div>
                        <div className="transform hover:-rotate-1 transition-transform duration-300 md:-mt-8"><TestimonialVideo title="School Activities" author="T.I.M.E. Kids Chennai" location="Chennai" videoUrl="/chennai2.mp4" thumbnailUrl="/infra.jpg" /></div>
                        <div className="transform hover:rotate-1 transition-transform duration-300"><TestimonialVideo title="Happy Moments" author="T.I.M.E. Kids Trichy" location="Trichy" videoUrl="/trichy-rajacolony.mp4" thumbnailUrl="/5.jpeg" /></div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        <div className="lg:col-span-4 lg:sticky lg:top-24">
                            <div className="bg-yellow-50 rounded-[40px_60px_40px_60px] p-10 border-4 border-yellow-100 shadow-xl">
                                <h2 className="font-display font-black text-4xl mb-6 text-slate-800">Got <span className="text-yellow-500">Questions?</span></h2>
                                <p className="text-lg text-slate-600 font-bold mb-8">We have answers! Here is everything you need to know.</p>
                                <div className="hidden lg:block relative h-64 w-full animate-float"><Image src="/2.png" alt="Question" fill className="object-contain drop-shadow-lg" /></div>
                            </div>
                        </div>
                        <div className="lg:col-span-8"><FAQAccordion /></div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="font-display font-black text-4xl mb-12 text-slate-800">Download Corner</h2>
                        <div className="grid md:grid-cols-2 gap-10">
                            <a href="https://www.timekidspreschools.in/uploads/pc/TIME-KIDS-BROCHURE.pdf" target="_blank" rel="noopener noreferrer" download className="group relative bg-pink-50 rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] p-12 border-4 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col items-center">
                                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mb-4 text-white shadow-lg group-hover:rotate-12 transition-transform"><Download className="w-8 h-8" /></div>
                                <h3 className="font-display font-bold text-2xl mb-2 text-slate-800">Brochure</h3>
                                <p className="text-slate-600 font-medium">Get all the details</p>
                            </a>
                            <button className="group relative bg-purple-50 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] p-12 border-4 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col items-center">
                                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4 text-white shadow-lg group-hover:-rotate-12 transition-transform"><Video className="w-8 h-8" /></div>
                                <h3 className="font-display font-bold text-2xl mb-2 text-slate-800">Virtual Tour</h3>
                                <p className="text-slate-600 font-medium">Watch the magic</p>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

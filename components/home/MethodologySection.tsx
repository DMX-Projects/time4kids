'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles } from 'lucide-react';
import { useHomePageContent } from '@/components/home/HomePageContentProvider';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const cardGradients = [
    'from-orange-400 to-amber-300',
    'from-lime-400 to-emerald-300',
    'from-red-400 to-orange-300',
    'from-amber-400 to-yellow-300',
    'from-emerald-400 to-teal-300',
    'from-rose-400 to-orange-300',
];

const particles = Array.from({ length: 16 }, (_, index) => ({
    left: `${6 + ((index * 11) % 88)}%`,
    top: `${14 + ((index * 19) % 70)}%`,
    delay: index * 0.2,
    duration: 4.5 + (index % 4) * 0.6,
}));

export default function MethodologySection() {
    const home = useHomePageContent();
    const methodologyItems = home.methodology.items;
    const methodologyTitle = home.methodology.title || 'Value-Based Learning Methodology';
    const displayMethodologyTitle = methodologyTitle
        .replace('Value based', 'Value-Based Learning')
        .replace(/\bmethodology\b/gi, 'Methodology');
    const sectionRef = useRef<HTMLElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            gsap.from('.methodology-reveal', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 78%',
                },
                y: 34,
                opacity: 0,
                filter: 'blur(10px)',
                duration: 0.8,
                stagger: 0.08,
                ease: 'power3.out',
            });

            gsap.to('.sun-ray', {
                opacity: 0.72,
                rotate: 2,
                duration: 4.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
        if (!glowRef.current) return;
        const rect = event.currentTarget.getBoundingClientRect();
        gsap.to(glowRef.current, {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            opacity: 1,
            duration: 0.45,
            ease: 'power3.out',
        });
    };

    const handleMouseLeave = () => {
        if (!glowRef.current) return;
        gsap.to(glowRef.current, { opacity: 0, duration: 0.5, ease: 'power3.out' });
    };

    return (
        <section
            ref={sectionRef}
            className="relative isolate overflow-hidden bg-[#fff8ed] py-20 font-sans md:py-24"
        >
            <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_16%_20%,rgba(45,212,191,0.28),transparent_32%),radial-gradient(circle_at_82%_16%,rgba(251,146,60,0.24),transparent_30%),linear-gradient(135deg,#fff8ed_0%,#eefcff_48%,#fff4d6_100%)]" />
            <div className="absolute inset-x-0 top-0 -z-20 h-40 bg-gradient-to-b from-white/90 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 -z-20 h-44 bg-gradient-to-t from-white/80 to-transparent" />
            <div className="absolute left-[8%] top-20 -z-10 h-48 w-48 rounded-full bg-teal-200/30 blur-3xl" />
            <div className="absolute right-[10%] top-12 -z-10 h-56 w-56 rounded-full bg-orange-200/35 blur-3xl" />
            <div className="sun-ray absolute -left-24 -top-20 -z-10 h-[560px] w-[560px] rotate-[-18deg] bg-[conic-gradient(from_180deg,rgba(255,214,128,0.0),rgba(255,214,128,0.2),rgba(255,214,128,0.0),rgba(255,255,255,0.18),rgba(255,214,128,0.0))] blur-2xl" />
            <div ref={glowRef} className="pointer-events-none absolute left-0 top-0 z-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,200,120,0.28),rgba(125,211,252,0.14)_44%,transparent_72%)] opacity-0 blur-2xl" />

            {particles.map((particle, index) => (
                <motion.span
                    key={index}
                    animate={{ y: [0, -16, 0], opacity: [0.16, 0.5, 0.16] }}
                    transition={{ duration: particle.duration, repeat: Infinity, ease: 'easeInOut', delay: particle.delay }}
                    className="absolute z-0 h-1.5 w-1.5 rounded-full bg-amber-100/80 shadow-[0_0_18px_rgba(254,243,199,0.85)]"
                    style={{ left: particle.left, top: particle.top }}
                />
            ))}

            <div className="container relative z-10 mx-auto px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="methodology-reveal mb-5 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/78 px-4 py-2 shadow-xl backdrop-blur-md">
                        <Sparkles size={16} className="text-orange-500" />
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-800">Joyful learning, thoughtfully designed</span>
                    </div>

                    <h2
                        className="methodology-reveal font-display text-4xl font-black leading-tight tracking-[-0.02em] text-slate-900 md:text-6xl"
                        style={{ fontFamily: "'Clash Display', 'Satoshi', 'Plus Jakarta Sans', var(--font-poppins), system-ui, sans-serif" }}
                    >
                        <span className="methodology-gradient">{displayMethodologyTitle}</span>
                    </h2>

                    <div className="methodology-reveal mx-auto mt-5 h-1 w-32 rounded-full bg-gradient-to-r from-orange-300 via-amber-100 to-sky-200 shadow-[0_0_24px_rgba(252,211,77,0.55)]" />
                </div>

                <div className="relative mt-12 rounded-[34px] border border-white/80 bg-white/60 p-4 shadow-[0_35px_95px_rgba(15,23,42,0.14)] backdrop-blur-sm md:p-6">
                    <div className="absolute inset-0 rounded-[34px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.68),transparent_42%)]" />
                    <ul className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {methodologyItems.map((item, index) => {
                            const gradient = cardGradients[index % cardGradients.length];

                            return (
                                <motion.li
                                    key={`${item.label}-${index}`}
                                    className="methodology-reveal"
                                    animate={{ y: [0, index % 2 === 0 ? -7 : -4, 0] }}
                                    transition={{ duration: 4.2 + index * 0.15, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
                                >
                                    <Link
                                        href={item.href}
                                        className="group relative flex min-h-[190px] flex-col items-center justify-center overflow-hidden rounded-[26px] border border-white/70 bg-white/40 p-5 text-center text-white shadow-[0_20px_48px_rgba(15,23,42,0.13)] backdrop-blur-sm transition duration-500 hover:-translate-y-2 hover:border-amber-100 hover:bg-white/52 hover:shadow-[0_28px_70px_rgba(251,191,36,0.18)]"
                                    >
                                        <div className={`absolute -inset-16 bg-gradient-to-br ${gradient} opacity-18 blur-3xl transition duration-500 group-hover:opacity-35`} />
                                        <div className="absolute inset-0 translate-x-[-130%] bg-gradient-to-r from-transparent via-white/22 to-transparent transition-transform duration-700 group-hover:translate-x-[130%]" />

                                        <motion.span
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.18 }}
                                            className={`relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-[0_16px_42px_rgba(0,0,0,0.18)] ring-1 ring-white/40`}
                                        >
                                            <Image src={item.icon} alt={item.label} width={44} height={44} className="h-11 w-11 object-contain brightness-0 invert" />
                                        </motion.span>

                                        <strong className="relative block text-base font-black leading-tight drop-shadow md:text-lg">
                                            {item.label}
                                        </strong>
                                    </Link>
                                </motion.li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            <style jsx>{`
                .methodology-gradient {
                    background: linear-gradient(90deg, #10203f, #0f5f7a, #d86b1f, #10203f);
                    background-size: 240% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    animation: methodologyGradient 7s ease-in-out infinite;
                }

                @keyframes methodologyGradient {
                    0%, 100% { background-position: 0% center; }
                    50% { background-position: 100% center; }
                }
            `}</style>
        </section>
    );
}

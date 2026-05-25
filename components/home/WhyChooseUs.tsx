'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    type LucideIcon,
    Award,
    BookOpen,
    GraduationCap,
    Heart,
    Lightbulb,
    ShieldCheck,
    Sparkles,
    Star,
} from 'lucide-react';
import { useHomePageContent } from '@/components/home/HomePageContentProvider';
import { resolveCentrePageImageSrc } from '@/lib/api-client';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

type Feature = {
    title: string;
    desc: string;
    image: string;
    accent: string;
    color: string;
};

const cardIcons: LucideIcon[] = [ShieldCheck, GraduationCap, BookOpen, Award, Heart, Lightbulb];
const cardGradients = [
    'from-rose-400 via-orange-300 to-amber-300',
    'from-sky-400 via-cyan-300 to-blue-400',
    'from-orange-400 via-amber-300 to-yellow-300',
    'from-emerald-400 via-mint-300 to-teal-400',
    'from-pink-400 via-rose-300 to-orange-300',
    'from-violet-400 via-indigo-300 to-sky-300',
];

const particles = Array.from({ length: 18 }, (_, index) => ({
    left: `${6 + ((index * 13) % 88)}%`,
    top: `${12 + ((index * 17) % 76)}%`,
    delay: index * 0.18,
    duration: 4 + (index % 4) * 0.7,
}));

const PremiumFeatureCard = ({
    feature,
    index,
}: {
    feature: Feature;
    index: number;
}) => {
    const Icon = cardIcons[index % cardIcons.length];
    const gradient = cardGradients[index % cardGradients.length];

    return (
        <motion.article
            initial={{ opacity: 0, y: 44, filter: 'blur(14px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
            animate={{ y: [0, index % 2 === 0 ? -7 : -4, 0] }}
            whileHover={{ y: -14, scale: 1.025, rotateX: 2, rotateY: index % 2 === 0 ? -2 : 2 }}
            className="why-card group relative min-h-[390px] overflow-hidden rounded-[30px] border border-white/70 bg-white/58 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-2xl md:min-h-[420px]"
        >
            <div className={`absolute inset-px rounded-[29px] bg-gradient-to-br ${gradient} opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.16]`} />
            <div className="absolute inset-px rounded-[29px] bg-gradient-to-br from-white/80 via-white/32 to-white/10" />
            <div className={`absolute -right-14 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-3xl transition duration-500 group-hover:opacity-35`} />
            <div className="card-sheen absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10">
                <div className="mb-2 flex items-center justify-between">
                    <motion.div
                        animate={{ y: [0, -3, 0], rotate: [0, 3, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 }}
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-[0_14px_36px_rgba(15,23,42,0.18)]`}
                    >
                        <Icon size={23} />
                    </motion.div>
                    <div className="rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 backdrop-blur-xl">
                        0{index + 1}
                    </div>
                </div>

                <motion.div
                    whileHover={{ scale: 1.035 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="relative mb-6 overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_22px_55px_rgba(15,23,42,0.13)]"
                >
                    <div className={`absolute -inset-8 bg-gradient-to-br ${gradient} opacity-25 blur-3xl`} />
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                        <Image
                            src={resolveCentrePageImageSrc(feature.image)}
                            alt={feature.title}
                            fill
                            sizes="(min-width: 1024px) 31vw, (min-width: 768px) 45vw, 92vw"
                            className="object-cover transition duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-white/10" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,rgba(255,255,255,0.38),transparent_28%)]" />
                    </div>
                </motion.div>

                <div>
                    <h3 className="font-display text-xl font-black leading-tight text-slate-950">
                        {feature.title}
                    </h3>
                    <motion.div
                        initial={{ width: 34 }}
                        whileHover={{ width: 92 }}
                        className={`mt-3 h-1 rounded-full bg-gradient-to-r ${gradient}`}
                    />
                    <p className="mt-4 text-sm leading-7 text-slate-600 md:text-[15px]">
                        {feature.desc}
                    </p>
                </div>
            </div>
        </motion.article>
    );
};

const WhyChooseUs = () => {
    const home = useHomePageContent();
    const features = home.why_choose_us.features as Feature[];

    const sectionRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            gsap.from('.why-heading-piece', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 78%',
                },
                y: 32,
                opacity: 0,
                filter: 'blur(10px)',
                duration: 0.9,
                stagger: 0.08,
                ease: 'power3.out',
            });

            gsap.to('.why-ambient', {
                xPercent: 10,
                yPercent: -8,
                duration: 10,
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
        gsap.to(glowRef.current, { opacity: 0, duration: 0.55, ease: 'power3.out' });
    };

    return (
        <section
            ref={sectionRef}
            className="relative isolate overflow-hidden bg-[#fff8ee] py-20 font-sans select-none md:py-28"
        >
            <div
                ref={glowRef}
                className="pointer-events-none absolute left-0 top-0 z-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,177,103,0.28),rgba(125,211,252,0.16)_44%,transparent_72%)] opacity-0 blur-2xl"
            />

            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="why-ambient absolute inset-[-18%] bg-[linear-gradient(125deg,rgba(255,248,238,0.98)_0%,rgba(255,218,185,0.62)_24%,rgba(224,231,255,0.52)_48%,rgba(186,230,253,0.50)_72%,rgba(255,244,214,0.92)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(251,146,60,0.22),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(167,139,250,0.18),transparent_26%),radial-gradient(circle_at_72%_78%,rgba(56,189,248,0.18),transparent_30%)]" />
                <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.62)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.62)_1px,transparent_1px)] [background-size:46px_46px]" />
                {particles.map((particle, index) => (
                    <motion.span
                        key={index}
                        animate={{ y: [0, -18, 0], opacity: [0.16, 0.5, 0.16] }}
                        transition={{ duration: particle.duration, repeat: Infinity, ease: 'easeInOut', delay: particle.delay }}
                        className="absolute h-1.5 w-1.5 rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.8)]"
                        style={{ left: particle.left, top: particle.top }}
                    />
                ))}
                <motion.div
                    animate={{ rotate: [0, 9, 0], y: [0, -12, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    className="why-parallax absolute left-[7%] top-[18%] hidden h-16 w-16 rounded-[22px] border border-white/70 bg-white/35 text-orange-400 shadow-xl backdrop-blur-xl md:flex md:items-center md:justify-center"
                >
                    <Sparkles size={25} />
                </motion.div>
                <motion.div
                    animate={{ rotate: [0, -10, 0], y: [0, 14, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="why-parallax absolute right-[8%] top-[24%] hidden h-14 w-14 rounded-full border border-white/70 bg-white/35 text-sky-400 shadow-xl backdrop-blur-xl md:flex md:items-center md:justify-center"
                >
                    <Star size={22} />
                </motion.div>
            </div>

            <div className="container relative z-10 mx-auto px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="why-heading-piece mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 shadow-lg shadow-orange-200/20 backdrop-blur-xl">
                        <Sparkles size={16} className="text-orange-500" />
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Parent-trusted preschool experience</span>
                    </div>
                    <h2
                        className="font-display text-4xl font-black leading-[1.04] tracking-[-0.02em] text-slate-700 md:text-6xl"
                        style={{ fontFamily: "'Clash Display', 'Satoshi', 'Plus Jakarta Sans', var(--font-poppins), system-ui, sans-serif" }}
                    >
                        <span className="why-heading-piece inline-block">Why Parents Love</span>{' '}
                        <span className="why-heading-piece inline-flex translate-y-1 items-center align-middle">
                            <Image
                                src="/time-kids-logo-new.png"
                                alt="T.I.M.E. Kids"
                                width={260}
                                height={104}
                                className="h-[58px] w-auto object-contain md:h-[76px]"
                                priority={false}
                            />
                        </span>
                    </h2>
                    <p className="why-heading-piece mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                        A warm, safe, and forward-thinking preschool environment where children build confidence through care, creativity, and modern early learning.
                    </p>
                </div>

                <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-7">
                    {features.map((feature, index) => (
                        <PremiumFeatureCard key={`${feature.title}-${index}`} feature={feature} index={index} />
                    ))}
                </div>
            </div>

            <style jsx>{`
                .why-gradient-text {
                    background: linear-gradient(90deg, #ff8058, #ffb347, #45c8e6, #8b5cf6, #ff8058);
                    background-size: 260% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    animation: whyTextGradient 6s ease-in-out infinite;
                }

                .card-sheen {
                    background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.32) 45%, transparent 64%);
                    transform: translateX(-130%);
                }

                .why-card:hover .card-sheen {
                    animation: whyCardSheen 1.1s ease-out;
                }

                @keyframes whyTextGradient {
                    0%, 100% { background-position: 0% center; }
                    50% { background-position: 100% center; }
                }

                @keyframes whyCardSheen {
                    0% { transform: translateX(-130%); }
                    100% { transform: translateX(130%); }
                }
            `}</style>
        </section>
    );
};

export default WhyChooseUs;

'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    type LucideIcon,
    ArrowRight,
    BookOpen,
    GraduationCap,
    Heart,
    Paintbrush2,
    ShieldCheck,
    Smile,
    Sparkles,
    Star,
    Users,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const headingWords = [
    { text: 'Where', className: 'text-slate-700' },
    { text: 'Every', className: 'text-[#ff8058]' },
    { text: 'Child', className: 'text-[#ffb347]' },
    { text: 'Begins', className: 'text-slate-700' },
    { text: 'Their', className: 'text-[#45c8e6]' },
];

const features: Array<{ icon: LucideIcon; title: string; desc: string }> = [
    {
        icon: ShieldCheck,
        title: 'Safe & Caring Environment',
        desc: 'Warm routines, attentive supervision, and spaces designed to help little learners feel secure from the first hello.',
    },
    {
        icon: Heart,
        title: 'Love-Based Learning',
        desc: 'Every activity is shaped around joy, curiosity, confidence, and the emotional comfort children need to blossom.',
    },
    {
        icon: GraduationCap,
        title: 'Expert Early Educators',
        desc: 'Experienced mentors guide early milestones with patience, creativity, and age-appropriate learning practices.',
    },
];

const infoCards: Array<{ icon: LucideIcon; value: string; label: string; className: string; delay: number }> = [
    {
        icon: Users,
        value: '350+',
        label: 'Pre-Schools',
        className: 'left-0 top-8 md:-left-5',
        delay: 0,
    },
    {
        icon: Star,
        value: '27+',
        label: 'Years Excellence',
        className: 'right-0 top-24 md:-right-8',
        delay: 0.7,
    },
    {
        icon: ShieldCheck,
        value: 'Safe',
        label: 'Transport',
        className: 'left-3 bottom-24 md:-left-10',
        delay: 1.2,
    },
    {
        icon: Paintbrush2,
        value: 'Daily',
        label: 'Interactive Activities',
        className: 'right-4 bottom-6 md:-right-4',
        delay: 1.7,
    },
];

const decorItems = [
    { text: 'A', className: 'left-[6%] top-[18%] bg-sky-100 text-sky-600 rotate-[-10deg]', delay: 0.2 },
    { text: 'B', className: 'right-[15%] top-[4%] bg-orange-100 text-orange-600 rotate-[12deg]', delay: 0.8 },
    { text: 'C', className: 'right-[4%] bottom-[35%] bg-emerald-100 text-emerald-600 rotate-[-8deg]', delay: 1.4 },
];

const FloatingInfoCard = ({ icon: Icon, value, label, className, delay }: (typeof infoCards)[number]) => (
    <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        animate={{ y: [0, -10, 0] }}
        transition={{
            opacity: { duration: 0.5, delay },
            y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay },
            scale: { duration: 0.5, delay },
        }}
        whileHover={{ y: -14, rotate: 1.5, scale: 1.03 }}
        className={`parallax-layer absolute z-30 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2.5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-xl md:gap-3 md:px-4 md:py-3 ${className}`}
    >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-300 text-white shadow-lg shadow-orange-300/40 md:h-11 md:w-11">
            <Icon size={21} />
        </div>
        <div>
            <div className="font-display text-lg font-black leading-none text-slate-900 md:text-xl">{value}</div>
            <div className="mt-1 max-w-[105px] text-[9px] font-black uppercase leading-tight tracking-[0.15em] text-slate-500 md:max-w-[110px] md:text-[10px]">
                {label}
            </div>
        </div>
    </motion.div>
);

const FeatureCard = ({ icon: Icon, title, desc, index }: { icon: LucideIcon; title: string; desc: string; index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.65, delay: index * 0.12 }}
        whileHover={{ y: -8, scale: 1.015 }}
        className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/62 p-3.5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl xl:p-4"
    >
        <div className="absolute inset-px rounded-2xl bg-gradient-to-br from-white/70 via-white/25 to-orange-100/50 opacity-80" />
        <div className="absolute -right-10 -top-14 h-28 w-28 rounded-full bg-orange-200/25 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative flex gap-3 xl:gap-4">
            <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.35 }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-orange-50 text-orange-600 shadow-[0_12px_32px_rgba(249,115,22,0.22)] ring-1 ring-orange-100 xl:h-12 xl:w-12"
            >
                <Icon size={22} />
            </motion.div>
            <div>
                <h3 className="font-display text-sm font-black leading-snug text-slate-900 xl:text-base">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-600 xl:text-sm xl:leading-6">{desc}</p>
            </div>
        </div>
    </motion.div>
);

export default function IntroSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const visualRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLAnchorElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            gsap.to('.ambient-sweep', {
                xPercent: 16,
                yPercent: -10,
                duration: 9,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });

            gsap.to('.parallax-layer', {
                y: (index) => -24 - index * 10,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.7,
                },
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

    const handleButtonMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        gsap.to(buttonRef.current, {
            x: x * 0.18,
            y: y * 0.22,
            scale: 1.035,
            duration: 0.35,
            ease: 'power3.out',
        });
    };

    const resetButton = () => {
        if (!buttonRef.current) return;
        gsap.to(buttonRef.current, { x: 0, y: 0, scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.45)' });
    };

    return (
        <section
            id="about"
            ref={sectionRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative isolate overflow-hidden bg-[#fff8ec] py-16 font-sans scroll-mt-20 md:py-20 lg:flex lg:min-h-screen lg:items-center lg:py-12"
        >
            <div
                ref={glowRef}
                className="pointer-events-none absolute left-0 top-0 z-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,186,91,0.32),rgba(125,211,252,0.14)_45%,transparent_72%)] opacity-0 blur-2xl"
            />

            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="ambient-sweep absolute inset-[-18%] bg-[linear-gradient(125deg,rgba(255,244,214,0.94)_0%,rgba(255,213,171,0.72)_25%,rgba(220,252,231,0.62)_50%,rgba(186,230,253,0.58)_72%,rgba(255,247,237,0.92)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(251,146,60,0.28),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(125,211,252,0.28),transparent_25%),radial-gradient(circle_at_72%_82%,rgba(134,239,172,0.22),transparent_28%)]" />
                <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:42px_42px]" />
                <motion.div
                    animate={{ x: [0, 18, 0], y: [0, -18, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-[8%] top-[20%] h-24 w-24 rounded-[36%_64%_45%_55%] border border-orange-200/70 bg-white/20 backdrop-blur-md"
                />
                <motion.div
                    animate={{ x: [0, -20, 0], y: [0, 16, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-[16%] right-[12%] h-28 w-28 rounded-[62%_38%_60%_40%] border border-sky-200/70 bg-white/20 backdrop-blur-md"
                />
            </div>

            <div className="container relative z-10 mx-auto px-4">
                <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 xl:gap-16">
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.7 }}
                            className="badge-shimmer relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/80 bg-white/55 px-5 py-3 shadow-[0_16px_45px_rgba(251,146,60,0.16)] backdrop-blur-2xl"
                        >
                            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70" />
                            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-400/40">
                                <Sparkles size={16} />
                            </span>
                            <span className="relative text-xs font-black uppercase tracking-[0.2em] text-orange-700 md:text-sm">
                                Trusted Preschool Since 2008
                            </span>
                            {[0, 1, 2].map((item) => (
                                <motion.span
                                    key={item}
                                    animate={{ scale: [0.8, 1.35, 0.8], opacity: [0.35, 1, 0.35] }}
                                    transition={{ duration: 2.4, repeat: Infinity, delay: item * 0.45 }}
                                    className="absolute h-1.5 w-1.5 rounded-full bg-amber-300"
                                    style={{ right: 18 + item * 18, top: item % 2 ? 11 : 29 }}
                                />
                            ))}
                        </motion.div>

                        <div className="pointer-events-none absolute -left-6 top-28 hidden h-12 w-12 rounded-2xl border border-white/80 bg-sky-100/70 text-sky-600 shadow-lg md:flex md:items-center md:justify-center">
                            <Star size={22} />
                        </div>
                        <div className="pointer-events-none absolute right-8 top-20 hidden h-10 w-10 rotate-12 rounded-full border border-white/80 bg-amber-100/80 text-amber-500 shadow-lg md:flex md:items-center md:justify-center">
                            <Sparkles size={18} />
                        </div>

                        <motion.h2
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: '-90px' }}
                            variants={{
                                hidden: {},
                                show: { transition: { staggerChildren: 0.08 } },
                            }}
                            className="mt-5 max-w-3xl font-display text-4xl font-black leading-[1.02] tracking-[-0.02em] text-slate-950 md:text-5xl xl:text-6xl"
                            style={{ fontFamily: "'Clash Display', 'Satoshi', 'Plus Jakarta Sans', var(--font-poppins), system-ui, sans-serif" }}
                        >
                            {headingWords.map((word) => (
                                <motion.span
                                    key={word.text}
                                    variants={{
                                        hidden: { opacity: 0, y: 36, filter: 'blur(10px)' },
                                        show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
                                    }}
                                    className={`mr-3 inline-block md:mr-4 ${word.className}`}
                                >
                                    {word.text}
                                </motion.span>
                            ))}
                            <motion.span
                                variants={{
                                    hidden: { opacity: 0, y: 36, filter: 'blur(10px)' },
                                    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
                                }}
                                className="animated-gradient-text mt-2 block"
                            >
                                Beautiful Journey
                            </motion.span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 22 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-90px' }}
                            transition={{ duration: 0.7, delay: 0.18 }}
                            className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg md:leading-8"
                        >
                            A joyful early-learning world where children feel safe, seen, and excited to discover who they are becoming.
                        </motion.p>

                        <div className="mt-6 grid gap-3">
                            {features.map((feature, index) => (
                                <FeatureCard key={feature.title} {...feature} index={index} />
                            ))}
                        </div>

                    </div>

                    <div ref={visualRef} className="relative mx-auto flex h-[540px] w-full max-w-[650px] flex-col md:h-[600px] lg:h-[min(74vh,620px)]">
                        <motion.a
                            ref={buttonRef}
                            href="/programs"
                            onMouseMove={handleButtonMove}
                            onMouseLeave={resetButton}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.65, delay: 0.25 }}
                            className="cta-sweep group relative z-40 mb-5 ml-auto inline-flex min-h-[54px] items-center justify-center overflow-hidden rounded-full bg-slate-700 px-7 text-base font-black text-white shadow-[0_22px_55px_rgba(15,23,42,0.22)] ring-1 ring-slate-500 transition-colors duration-300 hover:bg-orange-600"
                        >
                            <span className="particle-trail absolute left-7 top-1/2 h-1.5 w-1.5 rounded-full bg-amber-200 opacity-0" />
                            <span className="relative z-10 whitespace-nowrap">Discover Our Programs</span>
                            <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                                className="relative z-10 ml-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 transition-transform duration-300 group-hover:scale-110"
                            >
                                <ArrowRight size={18} />
                            </motion.span>
                        </motion.a>

                        <div className="relative flex-1">
                        <motion.div
                            animate={{ rotate: [0, 4, 0], scale: [1, 1.02, 1] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                            className="parallax-layer absolute left-[8%] top-[8%] h-[78%] w-[78%] rounded-[56px] border border-white/70 bg-white/28 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 42, rotate: -2 }}
                            whileInView={{ opacity: 1, y: 0, rotate: -1 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ rotate: 0, scale: 1.015 }}
                            className="relative z-20 mx-auto h-[430px] w-[88%] overflow-hidden rounded-[42px] border-[10px] border-white bg-white shadow-[0_45px_100px_rgba(15,23,42,0.22)] md:h-[500px] lg:h-[calc(min(74vh,620px)-78px)]"
                        >
                            <Image
                                src="/1.png"
                                alt="Happy child enjoying creative preschool learning"
                                fill
                                priority={false}
                                sizes="(min-width: 1024px) 560px, 90vw"
                                className="object-cover object-[42%_center]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-white/10" />
                            <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/50 bg-white/28 p-4 text-white shadow-2xl backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500">
                                        <Smile size={22} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-[0.18em] text-white/75">Joyful Confidence</p>
                                        <p className="mt-1 text-lg font-black leading-tight">Learning that feels like wonder.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {infoCards.map((card) => (
                            <FloatingInfoCard key={card.label} {...card} />
                        ))}

                        {decorItems.map((item) => (
                            <motion.div
                                key={item.text}
                                animate={{ y: [0, -16, 0], rotate: [0, 5, 0] }}
                                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}
                                className={`parallax-layer absolute z-30 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 text-2xl font-black shadow-xl backdrop-blur-md ${item.className}`}
                            >
                                {item.text}
                            </motion.div>
                        ))}

                        <motion.div
                            animate={{ y: [0, -18, 0], rotate: [-6, 3, -6] }}
                            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="parallax-layer absolute bottom-[18%] left-[26%] z-30 flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/80 bg-white/70 text-emerald-600 shadow-xl backdrop-blur-xl"
                        >
                            <BookOpen size={28} />
                        </motion.div>

                        <motion.div
                            animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.8, 0.45] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute left-[1%] top-[48%] z-10 h-36 w-36 rounded-[42px] border border-orange-200/70"
                        />
                        <motion.div
                            animate={{ scale: [1.08, 1, 1.08], opacity: [0.35, 0.68, 0.35] }}
                            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute right-[6%] top-[44%] z-10 h-44 w-44 rounded-full border border-sky-200/70"
                        />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />

            <style jsx>{`
                .badge-shimmer > span:first-child {
                    animation: badgeSweep 3.4s ease-in-out infinite;
                    transform: translateX(-120%);
                }

                .animated-gradient-text {
                    background: linear-gradient(90deg, #475569, #64748b, #475569);
                    background-size: 260% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    animation: textGradient 6s ease-in-out infinite;
                }

                .cta-sweep::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.22) 45%, transparent 65%);
                    transform: translateX(-120%);
                    animation: buttonSweep 2.8s ease-in-out infinite;
                }

                .cta-sweep:hover .particle-trail {
                    animation: particleTrail 0.9s ease-out infinite;
                }

                @keyframes badgeSweep {
                    0%, 38% { transform: translateX(-120%); }
                    72%, 100% { transform: translateX(120%); }
                }

                @keyframes textGradient {
                    0%, 100% { background-position: 0% center; }
                    50% { background-position: 100% center; }
                }

                @keyframes buttonSweep {
                    0%, 45% { transform: translateX(-120%); }
                    80%, 100% { transform: translateX(120%); }
                }

                @keyframes particleTrail {
                    0% { opacity: 0; transform: translate(0, -50%) scale(0.6); }
                    35% { opacity: 1; }
                    100% { opacity: 0; transform: translate(180px, -50%) scale(0.1); }
                }
            `}</style>
        </section>
    );
}

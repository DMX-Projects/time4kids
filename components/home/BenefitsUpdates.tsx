'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    type LucideIcon,
    Bell,
    BookOpen,
    Briefcase,
    CalendarDays,
    ChevronRight,
    GraduationCap,
    ShieldCheck,
    Sparkles,
    Star,
    TrendingUp,
    Users,
} from 'lucide-react';
import { apiUrl } from '@/lib/api-client';
import { useHomePageContent } from '@/components/home/HomePageContentProvider';

gsap.registerPlugin(ScrollTrigger);

type Slide = { id?: number; date: string; text: string };

const benefitIcons: LucideIcon[] = [TrendingUp, Star, BookOpen, GraduationCap, ShieldCheck, Briefcase];
const benefitGradients = [
    'from-emerald-400 to-lime-400',
    'from-sky-400 to-blue-500',
    'from-fuchsia-400 to-pink-500',
    'from-amber-300 to-orange-500',
    'from-cyan-400 to-teal-500',
    'from-violet-400 to-indigo-500',
];

/** Clean horizontal mark from `public` (no screenshot / checkerboard). Replace file if you export a new PNG with alpha. */
const FRANCHISE_HEADING_LOGO = '/time-kids-logo-new.png';

const BrandLogoText = () => (
    <span className="inline-flex shrink-0 items-end self-end leading-none">
        <Image
            src={FRANCHISE_HEADING_LOGO}
            alt="T.I.M.E. Kids"
            width={520}
            height={208}
            className="h-[3.25rem] w-auto max-w-[min(100%,24rem)] object-contain object-left object-bottom md:h-[4.25rem] xl:h-[4.75rem] sm:max-w-none"
            sizes="(max-width:768px) 85vw,(max-width:1280px) 380px,480px"
        />
    </span>
);

function formatSlideDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

const FALLBACK_UPDATES: Slide[] = [
    {
        date: '28-12-2015',
        text: 'T.I.M.E. Kids pre-schools is a chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training. With 350+ pre-schools, T.I.M.E. Kids is poised for major expansion across the country.',
    },
];

const BenefitCard = ({ text, number, index }: { text: string; number: number; index: number }) => {
    const Icon = benefitIcons[index % benefitIcons.length];
    const gradient = benefitGradients[index % benefitGradients.length];

    return (
        <motion.li
            initial={{ opacity: 0, y: 26, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8, scale: 1.02, rotate: -0.6 }}
            className={`group relative overflow-hidden rounded-2xl border border-white/70 bg-white/62 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl ${index === 4 ? 'sm:col-span-2' : ''}`}
        >
            <div className="absolute inset-px rounded-2xl bg-gradient-to-br from-white/70 via-white/25 to-orange-100/45" />
            <div className={`absolute -right-10 -top-12 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-2xl transition-opacity duration-500 group-hover:opacity-30`} />
            <div className="relative flex items-center gap-3">
                <motion.div
                    animate={{ y: [0, -4, 0], rotate: [0, 2, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 }}
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-[0_14px_34px_rgba(15,23,42,0.18)]`}
                >
                    <span className="font-display text-lg font-black">{number}</span>
                </motion.div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <Icon size={17} className="text-orange-500 transition-transform duration-300 group-hover:rotate-6" />
                        <p className="font-display text-sm font-black leading-snug text-slate-900 xl:text-base">{text}</p>
                    </div>
                </div>
            </div>
        </motion.li>
    );
};

const UpdatesEmptyState = () => (
    <div className="relative flex min-h-[280px] flex-col items-center justify-center px-5 text-center">
        <p className="max-w-md text-lg font-semibold leading-8 text-white/90">
            News updates and announcements will appear here.
        </p>
        <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-100/70">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Waiting for the next announcement
        </div>
    </div>
);

export default function BenefitsUpdates() {
    const home = useHomePageContent();
    const sectionRef = useRef<HTMLDivElement>(null);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [updatesReady, setUpdatesReady] = useState(false);

    const benefitTexts = (home.franchise_benefits ?? [])
        .map((x) => String(x || '').trim())
        .filter(Boolean);
    const benefits = benefitTexts.length > 0 ? benefitTexts : [
        'Low Investment High Returns',
        'Strong Brand Name of T.I.M.E.',
        'Complete Curriculum Support',
        'Regular Staff Training',
        'Operational Support',
    ];

    const hasUpdates = slides.some((slide) => slide.date || slide.text !== ((home.updates_empty_message || '').trim() || 'News updates and announcements will appear here.'));

    const updatesSettings = {
        dots: true,
        infinite: slides.length > 1,
        fade: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: slides.length > 1,
        autoplaySpeed: 4200,
        arrows: false,
        vertical: false,
        verticalSwiping: false,
    };

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const response = await fetch(apiUrl('/updates/?placement=franchise'));
                if (!response.ok) throw new Error('bad status');
                const data = await response.json();
                const items = Array.isArray(data) ? data : data.results || [];
                const mapped: Slide[] = items.map((u: { id?: number; text?: string; start_date?: string | null }) => ({
                    id: u.id,
                    date: formatSlideDate(u.start_date),
                    text: (u.text || '').trim(),
                })).filter((u: Slide) => u.text.length > 0);
                setSlides(
                    mapped.length > 0
                        ? mapped
                        : [{ date: '', text: (home.updates_empty_message || '').trim() || 'News updates and announcements will appear here.' }],
                );
            } catch {
                setSlides(FALLBACK_UPDATES);
            } finally {
                setUpdatesReady(true);
            }
        };
        fetchUpdates();
    }, [home.updates_empty_message]);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            gsap.to('.franchise-ambient', {
                xPercent: 12,
                yPercent: -8,
                duration: 9,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative isolate overflow-hidden bg-[#fff8ec] py-16 font-sans md:py-20 xl:flex xl:min-h-screen xl:items-center xl:py-10"
        >
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="franchise-ambient absolute inset-[-18%] bg-[linear-gradient(125deg,rgba(255,248,236,0.96)_0%,rgba(255,213,171,0.62)_24%,rgba(220,252,231,0.58)_48%,rgba(186,230,253,0.56)_72%,rgba(255,244,214,0.9)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(251,146,60,0.22),transparent_28%),radial-gradient(circle_at_48%_36%,rgba(134,239,172,0.2),transparent_26%),radial-gradient(circle_at_84%_22%,rgba(125,211,252,0.24),transparent_26%)]" />
                <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.62)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.62)_1px,transparent_1px)] [background-size:44px_44px]" />
                {[...Array(14)].map((_, index) => (
                    <motion.span
                        key={index}
                        animate={{ y: [0, -18, 0], opacity: [0.18, 0.5, 0.18] }}
                        transition={{ duration: 4 + (index % 4), repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
                        className="absolute h-1.5 w-1.5 rounded-full bg-white/80 shadow-[0_0_16px_rgba(255,255,255,0.9)]"
                        style={{ left: `${8 + index * 6}%`, top: `${18 + (index % 5) * 13}%` }}
                    />
                ))}
            </div>

            <div className="container relative z-10 mx-auto px-4">
                <div className="grid gap-10 lg:grid-cols-2 lg:items-center xl:gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -28, filter: 'blur(8px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full"
                    >
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 shadow-lg shadow-sky-200/20 backdrop-blur-xl">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">Live updates</span>
                                </div>
                                <h3
                                    className="mt-3 text-nowrap font-display text-3xl font-black leading-tight text-[#253247] sm:text-4xl md:text-5xl"
                                    style={{ fontFamily: "'Clash Display', 'Satoshi', 'Plus Jakarta Sans', var(--font-poppins), system-ui, sans-serif" }}
                                >
                                    Latest News & Updates
                                </h3>
                            </div>
                        </div>

                        <div className="updates-panel relative overflow-visible rounded-[32px] border border-white/20 bg-[#3f4652] p-4 shadow-[0_30px_100px_rgba(63,70,82,0.22)]">
                            <motion.div
                                animate={{ rotate: [-7, 8, -7], y: [0, -5, 0] }}
                                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -right-4 -top-5 z-30 flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/15 bg-white/10 text-amber-200 shadow-[0_0_45px_rgba(251,191,36,0.2)] backdrop-blur-xl md:-right-5 md:-top-6"
                            >
                                <Bell size={25} />
                                <span className="absolute right-3 top-3 h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
                            </motion.div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.25),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(251,191,36,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%)]" />
                            <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:26px_26px]" />
                            <motion.div
                                animate={{ x: ['-120%', '120%'] }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/12 to-transparent"
                            />
                            <div className="relative min-h-[350px] rounded-[26px] border border-white/12 bg-[#4b5563]/45 p-5 backdrop-blur-xl xl:min-h-[430px]">
                                {!updatesReady ? (
                                    <div className="flex min-h-[300px] items-center justify-center text-center text-sm font-semibold text-white/80">
                                        Loading updates...
                                    </div>
                                ) : !hasUpdates ? (
                                    <UpdatesEmptyState />
                                ) : (
                                    <Slider {...updatesSettings}>
                                        {slides.map((update, index) => (
                                            <div key={update.id ?? `slide-${index}`}>
                                                <motion.article
                                                    initial={{ opacity: 0, y: 18 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: index * 0.08 }}
                                                    className="group flex min-h-[300px] flex-col justify-center rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-white transition duration-300 hover:border-amber-200/40 hover:bg-white/[0.09] xl:min-h-[380px]"
                                                >
                                                    <div className="mb-5 flex items-center gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-slate-950 shadow-lg shadow-amber-300/25">
                                                            <CalendarDays size={22} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-100/70">Announcement</p>
                                                            {update.date ? (
                                                                <p className="mt-1 font-display text-xl font-black text-amber-100">{update.date}</p>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <p className="text-lg font-semibold leading-8 text-white/88">{update.text}</p>
                                                    <div className="mt-7 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-sky-200">
                                                        Read more <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                                                    </div>
                                                </motion.article>
                                            </div>
                                        ))}
                                    </Slider>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 28, filter: 'blur(8px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className="relative max-w-2xl lg:justify-self-end"
                    >
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 shadow-lg shadow-orange-200/20 backdrop-blur-xl">
                            <Sparkles size={16} className="text-orange-500" />
                            <span className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Franchise advantage</span>
                        </div>
                        <h2
                            className="font-display text-4xl font-black leading-[1.05] text-[#253247] md:text-5xl xl:text-[3.35rem]"
                            style={{ fontFamily: "'Clash Display', 'Satoshi', 'Plus Jakarta Sans', var(--font-poppins), system-ui, sans-serif" }}
                        >
                            <span className="block">Why Choose</span>
                            <span className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
                                <BrandLogoText />
                                <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                                    Franchise?
                                </span>
                            </span>
                        </h2>
                        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                            A proven preschool model with brand trust, curriculum depth, operational guidance, and a support system built for confident growth.
                        </p>

                        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                            {benefits.map((text, index) => (
                                <BenefitCard key={`${text}-${index}`} text={text} number={index + 1} index={index} />
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            <style jsx global>{`
                .updates-panel .slick-dotted.slick-slider {
                    margin: 0;
                }

                .updates-panel .slick-dots {
                    bottom: -28px;
                }

                .updates-panel .slick-dots li {
                    margin: 0 4px;
                    width: 22px;
                    height: 6px;
                }

                .updates-panel .slick-dots li button {
                    display: none;
                }

                .updates-panel .slick-dots li::before {
                    content: '';
                    display: block;
                    width: 100%;
                    height: 100%;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.28);
                    transition: all 0.25s ease;
                }

                .updates-panel .slick-dots li.slick-active::before {
                    background: #fcd34d;
                    box-shadow: 0 0 18px rgba(252, 211, 77, 0.6);
                }
            `}</style>
        </section>
    );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    type LucideIcon,
    BookOpen,
    Briefcase,
    GraduationCap,
    ShieldCheck,
    Sparkles,
    Star,
    TrendingUp,
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
    <span className="inline-flex shrink-0 items-center leading-none">
        <Image
            src={FRANCHISE_HEADING_LOGO}
            alt="T.I.M.E. Kids"
            width={520}
            height={208}
            className="h-[3.5rem] w-auto max-w-[min(100%,26rem)] object-contain object-left md:h-[4.5rem] xl:h-[5rem] sm:max-w-none"
            sizes="(max-width:768px) 85vw,(max-width:1280px) 400px,520px"
        />
    </span>
);

const FRANCHISE_ENQUIRY_URL = 'https://timekids1.t4e.in/franchise/';

const FRANCHISE_SECTION_HIGHLIGHTS = [
    'The T.I.M.E. Kids Advantage',
    'Comprehensive Franchise Support',
    'What You Need to Get Started',
    'Start Your Journey with T.I.M.E. Kids',
] as const;

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
            className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/62 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl"
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

export default function BenefitsUpdates() {
    const home = useHomePageContent();
    const sectionRef = useRef<HTMLDivElement>(null);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [updatesReady, setUpdatesReady] = useState(false);

    const benefits = [...FRANCHISE_SECTION_HIGHLIGHTS];

    const emptyMessage = (home.updates_empty_message || '').trim() || 'News updates and announcements will appear here.';

    const tickerSegments = (() => {
        if (!updatesReady) return ['Loading updates…'];
        const texts = slides.map((s) => s.text.trim()).filter(Boolean);
        if (texts.length === 0) return [emptyMessage];
        return texts;
    })();

    const tickerLine = tickerSegments.join('  ·  ');

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
                <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10 xl:gap-12">
                    {/* Main column: franchise first, news + ticker below */}
                    <motion.div
                        initial={{ opacity: 0, x: -28, filter: 'blur(8px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className="order-2 space-y-10 lg:order-1 lg:col-span-8"
                    >
                        <div className="relative w-full max-w-3xl lg:max-w-none">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 shadow-lg shadow-orange-200/20 backdrop-blur-xl">
                                <Sparkles size={16} className="text-orange-500" />
                                <span className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Franchise advantage</span>
                            </div>
                            <h2
                                className="font-display text-4xl font-black leading-[1.08] text-[#253247] md:text-5xl xl:text-[3.35rem]"
                                style={{ fontFamily: "'Clash Display', 'Satoshi', 'Plus Jakarta Sans', var(--font-poppins), system-ui, sans-serif" }}
                            >
                                <span className="flex flex-wrap items-center gap-x-2 gap-y-2 md:gap-x-3">
                                    <span>Why Partner with</span>
                                    <BrandLogoText />
                                    <span>Preschools?</span>
                                </span>
                            </h2>
                            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                                Join India&apos;s Most Trusted Preschool Franchise Network — build a meaningful business backed by the educational legacy of T.I.M.E.
                            </p>

                            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                                {benefits.map((text, index) => (
                                    <BenefitCard key={`${text}-${index}`} text={text} number={index + 1} index={index} />
                                ))}
                            </ul>
                        </div>

                        <div className="w-full space-y-4 border-t border-white/40 pt-10">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 shadow-lg shadow-sky-200/20 backdrop-blur-xl">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">Live updates</span>
                                </div>
                                <h3
                                    className="mt-4 font-display text-3xl font-black leading-tight text-[#253247] sm:text-4xl md:text-5xl"
                                    style={{ fontFamily: "'Clash Display', 'Satoshi', 'Plus Jakarta Sans', var(--font-poppins), system-ui, sans-serif" }}
                                >
                                    Latest News & Updates
                                </h3>
                            </div>

                            <div className="relative min-h-[3.5rem] w-full overflow-hidden rounded-2xl border border-white/70 bg-white/60 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#fff8ec] to-transparent" />
                                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#fff8ec] to-transparent" />
                                <div
                                    className="benefits-news-marquee flex w-max items-center"
                                    style={{
                                        animationDuration: `${Math.max(24, Math.min(100, tickerLine.length * 0.085))}s`,
                                    }}
                                >
                                    <span className="whitespace-nowrap px-6 text-sm font-semibold leading-relaxed text-slate-700 md:text-base">
                                        {tickerLine}
                                    </span>
                                    <span className="whitespace-nowrap px-6 text-sm font-semibold leading-relaxed text-slate-700 md:text-base" aria-hidden>
                                        {tickerLine}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Top-right (desktop): franchise enquiry */}
                    <motion.div
                        initial={{ opacity: 0, x: 28, filter: 'blur(8px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className="order-1 flex items-start justify-end lg:order-2 lg:col-span-4 lg:self-start lg:pt-1"
                    >
                        <a
                            href={FRANCHISE_ENQUIRY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-full border border-orange-400/40 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-5 py-3 text-center text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_40px_rgba(234,88,12,0.35)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 sm:px-7 sm:text-sm"
                        >
                            Franchisee enquiry
                        </a>
                    </motion.div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes benefits-news-marquee {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }
                .benefits-news-marquee {
                    animation-name: benefits-news-marquee;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </section>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import {
    type LucideIcon,
    Bell,
    CalendarDays,
    ChevronRight,
    GraduationCap,
    Heart,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { apiUrl } from '@/lib/api-client';
import { useHomePageContent } from '@/components/home/HomePageContentProvider';

type Slide = { id?: number; date: string; text: string };

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
                <h3 className="font-display text-base font-black leading-snug text-slate-900 md:text-lg xl:text-xl">
                    {title}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-600 xl:mt-2 xl:text-sm xl:leading-6">
                    {desc}
                </p>
            </div>
        </div>
    </motion.div>
);

export default function IntroSection() {
    const home = useHomePageContent();
    const [slides, setSlides] = useState<Slide[]>([]);
    const [updatesReady, setUpdatesReady] = useState(false);

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const response = await fetch(apiUrl('/updates/?placement=intro'));
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
                        : [{ date: '', text: (home.updates_empty_message || '').trim() || 'New updates and announcements will appear here.' }],
                );
            } catch {
                setSlides(FALLBACK_UPDATES);
            } finally {
                setUpdatesReady(true);
            }
        };

        fetchUpdates();
    }, [home.updates_empty_message]);

    const hasUpdates = slides.some((slide) => slide.date || slide.text !== ((home.updates_empty_message || '').trim() || 'New updates and announcements will appear here.'));
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

    return (
        <section
            id="about"
            className="relative isolate overflow-hidden bg-[#fff8ec] py-16 font-sans scroll-mt-20 md:py-20 lg:flex lg:min-h-screen lg:items-center lg:py-12"
        >
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-[-18%] bg-[linear-gradient(125deg,rgba(255,244,214,0.94)_0%,rgba(255,213,171,0.72)_25%,rgba(220,252,231,0.62)_50%,rgba(186,230,253,0.58)_72%,rgba(255,247,237,0.92)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(251,146,60,0.28),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(125,211,252,0.28),transparent_25%),radial-gradient(circle_at_72%_82%,rgba(134,239,172,0.22),transparent_28%)]" />
                <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:42px_42px]" />
            </div>

            <div className="container relative z-10 mx-auto px-4">
                <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 xl:gap-16">
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.7 }}
                            className="relative inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/55 px-5 py-3 shadow-[0_16px_45px_rgba(251,146,60,0.16)] backdrop-blur-2xl"
                        >
                            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-400/40">
                                <Sparkles size={16} />
                            </span>
                            <span className="relative text-xs font-black uppercase tracking-[0.2em] text-orange-700 md:text-sm">
                                Trusted Preschool Since 2008
                            </span>
                        </motion.div>

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
                                className="mt-2 block font-display text-neutral-700"
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

                    <motion.div
                        initial={{ opacity: 0, x: 28, filter: 'blur(8px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full"
                    >
                        <div className="mb-5">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 shadow-lg shadow-sky-200/20 backdrop-blur-xl">
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">Live updates</span>
                            </div>
                            <h3
                                className="mt-3 font-display text-3xl font-black leading-tight text-[#253247] sm:text-4xl md:text-5xl"
                                style={{ fontFamily: "'Clash Display', 'Satoshi', 'Plus Jakarta Sans', var(--font-poppins), system-ui, sans-serif" }}
                            >
                                Latest News & Updates
                            </h3>
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
                </div>
            </div>

            <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />

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

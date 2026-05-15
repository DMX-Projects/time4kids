'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    BookOpen,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Play,
    ShieldCheck,
    Sparkles,
    Star,
    TrendingUp,
    type LucideIcon,
} from 'lucide-react';
import { apiUrl, mediaUrl } from '@/lib/api-client';
import { useHomePageContent } from '@/components/home/HomePageContentProvider';
import Modal from '@/components/ui/Modal';
import { DEFAULT_HOME_PAGE_DATA } from '@/config/home-page-defaults';

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

/** Colourful child-style handprint for franchise CTA (matches brand hand motif). */
function FranchiseHandprintIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 64 52" aria-hidden="true">
            <ellipse cx="32" cy="36" rx="13" ry="11" fill="#fde047" />
            <rect x="4" y="16" width="7" height="20" rx="3.5" fill="#f472b6" transform="rotate(-18 7.5 26)" />
            <rect x="16" y="6" width="8" height="26" rx="4" fill="#60a5fa" />
            <rect x="28" y="2" width="9" height="30" rx="4.5" fill="#86efac" />
            <rect x="42" y="6" width="8" height="26" rx="4" fill="#c084fc" />
            <rect x="54" y="18" width="7" height="18" rx="3.5" fill="#4ade80" transform="rotate(16 57.5 27)" />
        </svg>
    );
}

/** YouTube watch / embed / shorts / youtu.be → embed URL, or null for direct video/file URLs. */
function getYoutubeEmbedSrc(raw: string): string | null {
    const u = raw.trim();
    if (!u) return null;
    try {
        const url = new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`);
        const h = url.hostname.replace(/^www\./i, '');
        if (h === 'youtu.be') {
            const id = url.pathname.replace(/^\//, '').split('/')[0];
            return id ? `https://www.youtube.com/embed/${id}` : null;
        }
        if (h.includes('youtube.com')) {
            const v = url.searchParams.get('v');
            if (v) return `https://www.youtube.com/embed/${v}`;
            const m = url.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/);
            if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;
        }
    } catch {
        /* ignore */
    }
    return null;
}

function blobShape(variant: number) {
    const borderRadius =
        variant % 2 === 0
            ? '60% 40% 30% 70% / 60% 30% 70% 40%'
            : '30% 70% 70% 30% / 30% 30% 70% 70%';
    const glow =
        variant % 2 === 0
            ? 'from-orange-300 via-amber-300 to-orange-400'
            : 'from-sky-300 via-cyan-300 to-teal-400';
    return { borderRadius, glow };
}

function FranchiseVideoBlob({
    variant,
    surfaceSrc,
    surfaceAlt,
    onOpen,
    videoReady,
}: {
    variant: number;
    surfaceSrc: string;
    surfaceAlt: string;
    onOpen: () => void;
    videoReady: boolean;
}) {
    const { borderRadius, glow } = blobShape(variant);

    return (
        <button
            type="button"
            onClick={onOpen}
            disabled={!videoReady}
            className="group relative mx-auto w-full max-w-[min(100%,20rem)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8ec] disabled:pointer-events-none disabled:opacity-55 sm:max-w-[22rem] lg:max-w-[24rem]"
            aria-label={videoReady ? 'Play franchise video' : 'Video not configured yet'}
        >
            <div
                className={`pointer-events-none absolute inset-0 scale-[0.92] rounded-full bg-gradient-to-br ${glow} opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-40 group-disabled:opacity-20`}
                aria-hidden
            />
            <div
                className="relative aspect-square w-full overflow-hidden border-[7px] border-white shadow-[0_24px_56px_rgba(15,23,42,0.16)] transition-transform duration-500 group-hover:scale-[1.02] group-disabled:group-hover:scale-100 sm:border-[8px] lg:border-[9px]"
                style={{ borderRadius }}
            >
                <Image
                    src={surfaceSrc}
                    alt={surfaceAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 90vw, 360px"
                    unoptimized={/^https?:\/\//i.test(surfaceSrc)}
                />
                <span
                    className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30"
                    aria-hidden
                >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-orange-600 shadow-lg ring-2 ring-white/80 sm:h-[4.25rem] sm:w-[4.25rem]">
                        <Play className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={2} fill="currentColor" />
                    </span>
                </span>
            </div>
        </button>
    );
}

function FranchisePhotoBlob({
    variant,
    surfaceSrc,
    surfaceAlt,
    onOpen,
}: {
    variant: number;
    surfaceSrc: string;
    surfaceAlt: string;
    onOpen: () => void;
}) {
    const { borderRadius, glow } = blobShape(variant + 1);

    return (
        <button
            type="button"
            onClick={onOpen}
            className="group relative mx-auto w-full max-w-[min(100%,20rem)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8ec] sm:max-w-[22rem] lg:max-w-[24rem]"
            aria-label={`View ${surfaceAlt}`}
        >
            <motion.div
                className={`pointer-events-none absolute inset-0 scale-[0.92] rounded-full bg-gradient-to-br ${glow} opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-40`}
                aria-hidden
            />
            <motion.div
                className="relative aspect-square w-full overflow-hidden border-[7px] border-white shadow-[0_24px_56px_rgba(15,23,42,0.16)] transition-transform duration-500 group-hover:scale-[1.02] sm:border-[8px] lg:border-[9px]"
                style={{ borderRadius }}
            >
                <Image
                    src={surfaceSrc}
                    alt={surfaceAlt}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 90vw, 360px"
                    unoptimized={/^https?:\/\//i.test(surfaceSrc)}
                />
                <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-80 transition group-hover:opacity-100"
                    aria-hidden
                />
            </motion.div>
        </button>
    );
}

function FranchiseAdvantageCarousel({
    slideCount,
    activeIndex,
    onPrev,
    onNext,
    onSelect,
    prevLabel,
    nextLabel,
    dotsLabel,
    children,
}: {
    slideCount: number;
    activeIndex: number;
    onPrev: () => void;
    onNext: () => void;
    onSelect: (index: number) => void;
    prevLabel: string;
    nextLabel: string;
    dotsLabel: string;
    children: React.ReactNode;
}) {
    if (slideCount === 0) return null;

    return (
        <>
            <div className="relative overflow-hidden pb-2">
                <motion.div
                    className="flex transition-transform duration-500 ease-out will-change-transform"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {children}
                </motion.div>
                {slideCount > 1 ? (
                    <>
                        <button
                            type="button"
                            onClick={onPrev}
                            className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/95 text-slate-800 shadow-md transition hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:h-11 sm:w-11"
                            aria-label={prevLabel}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            type="button"
                            onClick={onNext}
                            className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/95 text-slate-800 shadow-md transition hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:h-11 sm:w-11"
                            aria-label={nextLabel}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </>
                ) : null}
            </div>
            {slideCount > 1 ? (
                <div className="mt-2 flex justify-center gap-2" role="tablist" aria-label={dotsLabel}>
                    {Array.from({ length: slideCount }, (_, i) => (
                        <button
                            key={i}
                            type="button"
                            role="tab"
                            aria-selected={i === activeIndex}
                            onClick={() => onSelect(i)}
                            className={`h-2.5 rounded-full transition-all ${
                                i === activeIndex ? 'w-8 bg-orange-500' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                            aria-label={`Show slide ${i + 1}`}
                        />
                    ))}
                </div>
            ) : null}
        </>
    );
}

const FRANCHISE_SECTION_HIGHLIGHTS = [
    'The T.I.M.E. Kids Advantage',
    'Comprehensive Franchise Support',
    'What You Need to Get Started',
    'Start Your Journey with T.I.M.E. Kids',
] as const;

function NewsUpdateSlide({ text }: { text: string }) {
    const message = text.trim();
    return (
        <div className="flex min-h-[5.5rem] items-center gap-3 px-8 py-5 pb-6 sm:min-h-[6.25rem] sm:gap-4 sm:px-10 sm:py-6 sm:pb-7">
            <span className="shrink-0 text-2xl font-bold leading-none text-orange-500 md:text-3xl" aria-hidden>
                →
            </span>
            <p className="min-w-0 flex-1 text-base font-semibold leading-relaxed text-slate-800 md:text-lg">{message}</p>
        </div>
    );
}

const FRANCHISE_PHOTO_TARGET_COUNT = 10;

function buildFranchisePhotoSlides(
    raw: { src: string; alt?: string }[] | undefined,
    defaults: { src: string; alt?: string }[],
): { src: string; alt?: string }[] {
    const base = raw?.length ? raw : defaults;
    const filtered = base.filter((p) => (p.src || '').trim());
    if (filtered.length >= FRANCHISE_PHOTO_TARGET_COUNT) {
        return filtered.slice(0, FRANCHISE_PHOTO_TARGET_COUNT);
    }
    const out = [...filtered];
    const used = new Set(out.map((p) => p.src.trim()));
    for (const d of defaults) {
        if (out.length >= FRANCHISE_PHOTO_TARGET_COUNT) break;
        const s = d.src.trim();
        if (s && !used.has(s)) {
            out.push(d);
            used.add(s);
        }
    }
    return out.length > 0 ? out : defaults.slice(0, FRANCHISE_PHOTO_TARGET_COUNT);
}

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
    const [modalVideoIndex, setModalVideoIndex] = useState<number | null>(null);
    const [modalPhotoIndex, setModalPhotoIndex] = useState<number | null>(null);
    const [videoCarouselIndex, setVideoCarouselIndex] = useState(0);
    const [photoCarouselIndex, setPhotoCarouselIndex] = useState(0);
    const [newsIndex, setNewsIndex] = useState(0);

    const franchiseVideos = useMemo(() => {
        const raw =
            home.franchise_advantage_videos?.length > 0
                ? home.franchise_advantage_videos
                : DEFAULT_HOME_PAGE_DATA.franchise_advantage_videos;
        const filtered = raw.filter((v) => (v.poster || '').trim() || (v.src || '').trim());
        return filtered.length > 0
            ? filtered
            : DEFAULT_HOME_PAGE_DATA.franchise_advantage_videos.filter(
                  (v) => (v.poster || '').trim() || (v.src || '').trim(),
              );
    }, [home.franchise_advantage_videos]);

    const franchisePhotos = useMemo(
        () =>
            buildFranchisePhotoSlides(
                home.franchise_advantage_photos,
                DEFAULT_HOME_PAGE_DATA.franchise_advantage_photos,
            ),
        [home.franchise_advantage_photos],
    );

    useEffect(() => {
        setVideoCarouselIndex((i) => Math.min(Math.max(0, i), Math.max(0, franchiseVideos.length - 1)));
    }, [franchiseVideos.length]);

    useEffect(() => {
        setPhotoCarouselIndex((i) => Math.min(Math.max(0, i), Math.max(0, franchisePhotos.length - 1)));
    }, [franchisePhotos.length]);

    const benefits = [...FRANCHISE_SECTION_HIGHLIGHTS];

    const emptyMessage = (home.updates_empty_message || '').trim() || 'News updates and announcements will appear here.';

    const newsItems = useMemo(() => {
        if (!updatesReady) return [{ text: 'Loading updates…', date: '' }];
        const withText = slides.filter((s) => s.text.trim());
        if (withText.length === 0) return [{ text: emptyMessage, date: '' }];
        return withText;
    }, [slides, updatesReady, emptyMessage]);

    useEffect(() => {
        setNewsIndex((i) => Math.min(Math.max(0, i), Math.max(0, newsItems.length - 1)));
    }, [newsItems.length]);

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

                            <motion.div className="w-full rounded-2xl border border-white/70 bg-white/60 px-2 pb-3 pt-2 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-3">
                                <FranchiseAdvantageCarousel
                                    slideCount={newsItems.length}
                                    activeIndex={newsIndex}
                                    onPrev={() =>
                                        setNewsIndex((idx) => {
                                            const n = newsItems.length;
                                            return (idx - 1 + n) % n;
                                        })
                                    }
                                    onNext={() =>
                                        setNewsIndex((idx) => {
                                            const n = newsItems.length;
                                            return (idx + 1) % n;
                                        })
                                    }
                                    onSelect={setNewsIndex}
                                    prevLabel="Previous news update"
                                    nextLabel="Next news update"
                                    dotsLabel="News updates"
                                >
                                    {newsItems.map((item, i) => (
                                        <div
                                            key={item.id ?? `${item.text.slice(0, 24)}-${i}`}
                                            className="min-w-full shrink-0"
                                        >
                                            <NewsUpdateSlide text={item.text} />
                                        </div>
                                    ))}
                                </FranchiseAdvantageCarousel>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Top-right: enquiry + franchise video carousel (CMS) */}
                    <motion.div
                        initial={{ opacity: 0, x: 28, filter: 'blur(8px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className="order-1 flex w-full flex-col items-stretch gap-8 lg:order-2 lg:col-span-4 lg:items-end lg:self-start lg:gap-10 lg:pt-1"
                    >
                        <div className="flex justify-center lg:justify-end">
                            <Link
                                href="/franchise/"
                                className="inline-flex max-w-full items-center gap-3 rounded-lg bg-[#2b7fd4] px-4 py-3 text-left shadow-[0_10px_28px_rgba(30,100,180,0.35)] transition hover:bg-[#2570bd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 sm:gap-4 sm:px-5 sm:py-3.5"
                            >
                                <FranchiseHandprintIcon className="h-10 w-10 shrink-0 drop-shadow sm:h-11 sm:w-11" />
                                <span className="font-display text-xs font-black uppercase leading-tight tracking-[0.1em] text-[#ffe94d] sm:text-sm md:text-base">
                                    Franchise enquiry
                                </span>
                            </Link>
                        </div>
                        <div className="relative w-full max-w-[min(100%,24rem)] sm:mx-auto lg:mx-0 lg:max-w-[26rem]">
                            {franchiseVideos.length > 0 ? (
                                <>
                                    <div className="relative overflow-hidden pb-2">
                                        <div
                                            className="flex transition-transform duration-500 ease-out will-change-transform"
                                            style={{ transform: `translateX(-${videoCarouselIndex * 100}%)` }}
                                        >
                                            {franchiseVideos.map((item, i) => {
                                                const posterRaw = (item.poster || '').trim();
                                                const posterSrc =
                                                    mediaUrl(posterRaw || (item.src.trim() ? '/icon-media.svg' : '')) ||
                                                    posterRaw ||
                                                    '/icon-media.svg';
                                                const openable = Boolean(item.src.trim());
                                                return (
                                                    <div key={`${item.poster}-${item.src}-${i}`} className="min-w-full shrink-0 px-1 sm:px-2">
                                                        <FranchiseVideoBlob
                                                            variant={i}
                                                            surfaceSrc={posterSrc}
                                                            surfaceAlt={item.alt || `Franchise video ${i + 1}`}
                                                            videoReady={openable}
                                                            onOpen={() => openable && setModalVideoIndex(i)}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {franchiseVideos.length > 1 ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setVideoCarouselIndex((idx) => {
                                                            const n = franchiseVideos.length;
                                                            return (idx - 1 + n) % n;
                                                        })
                                                    }
                                                    className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/95 text-slate-800 shadow-md transition hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:h-11 sm:w-11"
                                                    aria-label="Previous video"
                                                >
                                                    <ChevronLeft className="h-6 w-6" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setVideoCarouselIndex((idx) => {
                                                            const n = franchiseVideos.length;
                                                            return (idx + 1) % n;
                                                        })
                                                    }
                                                    className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/95 text-slate-800 shadow-md transition hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:h-11 sm:w-11"
                                                    aria-label="Next video"
                                                >
                                                    <ChevronRight className="h-6 w-6" />
                                                </button>
                                            </>
                                        ) : null}
                                    </div>
                                    {franchiseVideos.length > 1 ? (
                                        <div className="mt-2 flex justify-center gap-2" role="tablist" aria-label="Video slides">
                                            {franchiseVideos.map((_, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={i === videoCarouselIndex}
                                                    onClick={() => setVideoCarouselIndex(i)}
                                                    className={`h-2.5 rounded-full transition-all ${
                                                        i === videoCarouselIndex ? 'w-8 bg-orange-500' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                                                    }`}
                                                    aria-label={`Show video ${i + 1}`}
                                                />
                                            ))}
                                        </div>
                                    ) : null}
                                </>
                            ) : null}
                        </div>
                        {franchisePhotos.length > 0 ? (
                            <div className="relative w-full max-w-[min(100%,24rem)] sm:mx-auto lg:mx-0 lg:max-w-[26rem]">
                                <FranchiseAdvantageCarousel
                                    slideCount={franchisePhotos.length}
                                    activeIndex={photoCarouselIndex}
                                    onPrev={() =>
                                        setPhotoCarouselIndex((idx) => {
                                            const n = franchisePhotos.length;
                                            return (idx - 1 + n) % n;
                                        })
                                    }
                                    onNext={() =>
                                        setPhotoCarouselIndex((idx) => {
                                            const n = franchisePhotos.length;
                                            return (idx + 1) % n;
                                        })
                                    }
                                    onSelect={setPhotoCarouselIndex}
                                    prevLabel="Previous photo"
                                    nextLabel="Next photo"
                                    dotsLabel="Photo slides"
                                >
                                    {franchisePhotos.map((item, i) => {
                                        const srcRaw = (item.src || '').trim();
                                        const imageSrc = mediaUrl(srcRaw) || srcRaw;
                                        return (
                                            <div key={`${srcRaw}-${i}`} className="min-w-full shrink-0 px-1 sm:px-2">
                                                <FranchisePhotoBlob
                                                    variant={i}
                                                    surfaceSrc={imageSrc}
                                                    surfaceAlt={item.alt || `Franchise photo ${i + 1}`}
                                                    onOpen={() => setModalPhotoIndex(i)}
                                                />
                                            </div>
                                        );
                                    })}
                                </FranchiseAdvantageCarousel>
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            </div>

            <Modal
                isOpen={modalVideoIndex !== null}
                onClose={() => setModalVideoIndex(null)}
                title="Franchise video"
                size="xl"
            >
                {modalVideoIndex !== null && franchiseVideos[modalVideoIndex] ? (
                    (() => {
                        const item = franchiseVideos[modalVideoIndex];
                        const srcRaw = item.src.trim();
                        if (!srcRaw) {
                            return (
                                <p className="text-center text-sm text-slate-600">
                                    Add a video URL (MP4 or YouTube) for this slide in Admin → Home content → Franchise videos.
                                </p>
                            );
                        }
                        const resolved = mediaUrl(srcRaw) || srcRaw;
                        const yt = getYoutubeEmbedSrc(srcRaw);
                        if (yt) {
                            return (
                                <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
                                    <iframe
                                        src={`${yt}?rel=0`}
                                        title={item.alt || 'Franchise video'}
                                        className="h-full w-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                </div>
                            );
                        }
                        return (
                            <video
                                key={resolved}
                                src={resolved}
                                controls
                                playsInline
                                className="mx-auto max-h-[75vh] w-full rounded-xl bg-black shadow-lg"
                            />
                        );
                    })()
                ) : null}
            </Modal>

            <Modal
                isOpen={modalPhotoIndex !== null}
                onClose={() => setModalPhotoIndex(null)}
                title="Franchise photo"
                size="xl"
            >
                {modalPhotoIndex !== null && franchisePhotos[modalPhotoIndex] ? (
                    (() => {
                        const item = franchisePhotos[modalPhotoIndex];
                        const srcRaw = (item.src || '').trim();
                        const resolved = mediaUrl(srcRaw) || srcRaw;
                        return (
                            <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-xl bg-slate-100 shadow-lg">
                                <Image
                                    src={resolved}
                                    alt={item.alt || 'Franchise photo'}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 90vw, 512px"
                                    unoptimized={/^https?:\/\//i.test(resolved)}
                                />
                            </div>
                        );
                    })()
                ) : null}
            </Modal>

        </section>
    );
}

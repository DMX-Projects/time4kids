'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { mediaUrl, resolveCmsMediaUrl, resolveHomeMediaAssetUrl } from '@/lib/api-client';
import { useHomePageContent } from '@/components/home/HomePageContentProvider';
import { FranchiseBlobThumbnail, FranchiseVideoBlob, getFranchiseVideoEmbedSrc } from '@/components/home/FranchiseVideoBlob';
import { FranchiseVideoOpenContext } from '@/components/home/franchise-video-open-context';
import { FranchiseBlobShell } from '@/components/home/franchise-blob';
import FranchisePhotoGalleryModal from '@/components/home/FranchisePhotoGalleryModal';
import FranchiseVideoGalleryModal from '@/components/home/FranchiseVideoGalleryModal';
import NewsTickerMarquee from '@/components/home/NewsTickerMarquee';
import NewsUpdatesModal from '@/components/home/NewsUpdatesModal';
import {
    DEFAULT_FRANCHISE_VIDEO_POSTER,
    DEFAULT_HOME_PAGE_DATA,
} from '@/config/home-page-defaults';

gsap.registerPlugin(ScrollTrigger);

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
    return (
        <button
            type="button"
            onClick={onOpen}
            className="group relative mx-auto w-full text-left transition-transform duration-500 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8ec]"
            aria-label={`View ${surfaceAlt}`}
        >
            <FranchiseBlobShell variant={variant}>
                <FranchiseBlobThumbnail src={surfaceSrc} alt={surfaceAlt} />
                <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-70 transition group-hover:opacity-90 [border-radius:inherit]"
                    aria-hidden
                />
            </FranchiseBlobShell>
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
    controlsOutside = false,
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
    controlsOutside?: boolean;
    children: React.ReactNode;
}) {
    if (slideCount === 0) return null;

    const sideNavClass =
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-md transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:h-10 sm:w-10';

    const slideTrack = (
        <motion.div className={`relative min-w-0 flex-1 overflow-hidden ${controlsOutside ? '' : 'pb-2'}`}>
            <motion.div
                className="flex w-full transition-transform duration-500 ease-out will-change-transform"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
                {children}
            </motion.div>
            {slideCount > 1 && !controlsOutside ? (
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
        </motion.div>
    );

    return (
        <>
            {controlsOutside && slideCount > 1 ? (
                <motion.div className="flex items-center gap-2 sm:gap-3">
                    <button type="button" onClick={onPrev} className={sideNavClass} aria-label={prevLabel}>
                        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    {slideTrack}
                    <button type="button" onClick={onNext} className={sideNavClass} aria-label={nextLabel}>
                        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </motion.div>
            ) : (
                slideTrack
            )}
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

type FranchiseAdvantageVideo = { poster?: string; src: string; alt?: string };

function franchiseVideoBlobProps(item: FranchiseAdvantageVideo, index: number) {
    const posterRaw = (item.poster || '').trim();
    const posterSrc =
        resolveCmsMediaUrl(posterRaw) ||
        resolveCmsMediaUrl(DEFAULT_FRANCHISE_VIDEO_POSTER) ||
        resolveHomeMediaAssetUrl(posterRaw) ||
        resolveHomeMediaAssetUrl(DEFAULT_FRANCHISE_VIDEO_POSTER) ||
        DEFAULT_FRANCHISE_VIDEO_POSTER;
    const srcRaw = item.src.trim();
    const embedSrc = getFranchiseVideoEmbedSrc(srcRaw);
    const fileSrc = embedSrc ? null : (srcRaw ? mediaUrl(srcRaw) || srcRaw : null);
    const openable = Boolean(embedSrc || fileSrc);

    return {
        variant: index,
        surfaceSrc: posterSrc,
        surfaceAlt: item.alt || (index === 0 ? 'T.I.M.E. Kids franchise advantage' : `Franchise video ${index + 1}`),
        videoReady: openable,
        videoIndex: index,
    } as const;
}

function FranchiseAdvantageVideosPanel({
    videos,
    carouselIndex,
    onCarouselIndexChange,
    onOpenVideo,
}: {
    videos: FranchiseAdvantageVideo[];
    carouselIndex: number;
    onCarouselIndexChange: React.Dispatch<React.SetStateAction<number>>;
    onOpenVideo: (index: number) => void;
}) {
    return (
        <FranchiseVideoOpenContext.Provider value={{ openVideo: onOpenVideo }}>
            {videos.length === 1 ? (
                <FranchiseVideoBlob {...franchiseVideoBlobProps(videos[0], 0)} />
            ) : (
        <FranchiseAdvantageCarousel
            slideCount={videos.length}
            activeIndex={carouselIndex}
            onPrev={() => {
                onCarouselIndexChange((idx) => {
                    const n = videos.length;
                    return (idx - 1 + n) % n;
                });
            }}
            onNext={() => {
                onCarouselIndexChange((idx) => {
                    const n = videos.length;
                    return (idx + 1) % n;
                });
            }}
            onSelect={(next) => {
                onCarouselIndexChange(next);
            }}
            prevLabel="Previous video"
            nextLabel="Next video"
            dotsLabel="Video slides"
            controlsOutside
        >
            {videos.map((v, vi) => (
                    <motion.div key={`${v.poster}-${v.src}-${vi}`} className="w-full shrink-0 basis-full">
                        <FranchiseVideoBlob {...franchiseVideoBlobProps(v, vi)} />
                    </motion.div>
                ))}
        </FranchiseAdvantageCarousel>
            )}
        </FranchiseVideoOpenContext.Provider>
    );
}

/** Franchise advantage photo slider — CMS supports up to 8 oval slides. */
const FRANCHISE_PHOTO_TARGET_COUNT = 8;

function buildFranchisePhotoSlides(
    raw: { src: string; alt?: string }[] | undefined,
    defaults: { src: string; alt?: string }[],
): { src: string; alt?: string }[] {
    const fromCms = (raw ?? []).map((p) => ({ src: (p.src || '').trim(), alt: p.alt })).filter((p) => p.src);
    if (fromCms.length > 0) {
        return fromCms.slice(0, FRANCHISE_PHOTO_TARGET_COUNT);
    }
    return defaults
        .filter((p) => (p.src || '').trim())
        .slice(0, FRANCHISE_PHOTO_TARGET_COUNT);
}

export default function BenefitsUpdates() {
    const home = useHomePageContent();
    const sectionRef = useRef<HTMLDivElement>(null);
    const [modalPhotoIndex, setModalPhotoIndex] = useState<number | null>(null);
    const [modalVideoIndex, setModalVideoIndex] = useState<number | null>(null);
    const [newsModalOpen, setNewsModalOpen] = useState(false);
    const [videoCarouselIndex, setVideoCarouselIndex] = useState(0);
    const [photoCarouselIndex, setPhotoCarouselIndex] = useState(0);

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

    const newsTickerItems = useMemo(() => {
        const raw =
            home.news_ticker_items?.length > 0
                ? home.news_ticker_items
                : DEFAULT_HOME_PAGE_DATA.news_ticker_items;
        return raw.map((item) => ({ text: (item.text || '').trim() })).filter((item) => item.text);
    }, [home.news_ticker_items]);

    const newsTickerLines = useMemo(() => newsTickerItems.map((item) => item.text), [newsTickerItems]);

    const newsEmptyMessage =
        (home.updates_empty_message || '').trim() || 'News updates and announcements will appear here.';

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
                            <Link
                                href="/franchise/"
                                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 underline decoration-orange-300 underline-offset-4 transition hover:text-orange-700 hover:decoration-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                            >
                                More details
                                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                            </Link>
                        </div>

                        <button
                            type="button"
                            onClick={() => setNewsModalOpen(true)}
                            className="group w-full space-y-4 border-t border-white/40 pt-10 text-left transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8ec] rounded-xl"
                            aria-label="Latest news and updates. Click to view all."
                        >
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

                            <div className="w-full rounded-2xl border border-white/70 bg-white/60 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                                <NewsTickerMarquee lines={newsTickerLines} emptyMessage={newsEmptyMessage} />
                            </div>
                        </button>
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
                                <FranchiseAdvantageVideosPanel
                                    videos={franchiseVideos}
                                    carouselIndex={videoCarouselIndex}
                                    onCarouselIndexChange={setVideoCarouselIndex}
                                    onOpenVideo={(i) => {
                                        setVideoCarouselIndex(i);
                                        setModalVideoIndex(i);
                                    }}
                                />
                            ) : null}
                        </div>
                        {franchisePhotos.length > 0 ? (
                            <motion.div
                                className="relative w-full max-w-[min(100%,24rem)] sm:mx-auto lg:mx-0 lg:max-w-[26rem]"
                            >
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
                                    controlsOutside
                                >
                                    {franchisePhotos.map((item, i) => {
                                        const srcRaw = (item.src || '').trim();
                                        const imageSrc =
                                            resolveCmsMediaUrl(srcRaw) || resolveHomeMediaAssetUrl(srcRaw) || srcRaw;
                                        return (
                                            <div key={`${srcRaw}-${i}`} className="min-w-full shrink-0 px-1 sm:px-2">
                                                <FranchisePhotoBlob
                                                    variant={i}
                                                    surfaceSrc={imageSrc}
                                                    surfaceAlt={item.alt || `Franchise photo ${i + 1}`}
                                                    onOpen={() => {
                                                        setPhotoCarouselIndex(i);
                                                        setModalPhotoIndex(i);
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </FranchiseAdvantageCarousel>
                            </motion.div>
                        ) : null}
                    </motion.div>
                </div>
            </div>

            <FranchisePhotoGalleryModal
                photos={franchisePhotos}
                activeIndex={modalPhotoIndex}
                onClose={() => setModalPhotoIndex(null)}
                onIndexChange={(i) => {
                    setModalPhotoIndex(i);
                    setPhotoCarouselIndex(i);
                }}
            />

            <FranchiseVideoGalleryModal
                videos={franchiseVideos}
                activeIndex={modalVideoIndex}
                onClose={() => setModalVideoIndex(null)}
                onIndexChange={(i) => {
                    setModalVideoIndex(i);
                    setVideoCarouselIndex(i);
                }}
            />

            <NewsUpdatesModal
                items={newsTickerItems}
                emptyMessage={newsEmptyMessage}
                isOpen={newsModalOpen}
                onClose={() => setNewsModalOpen(false)}
            />

        </section>
    );
}

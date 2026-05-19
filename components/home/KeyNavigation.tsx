'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHomePageContent } from '@/components/home/HomePageContentProvider';
import VirtualTourModal from '@/components/home/VirtualTourModal';
import { apiUrl, mediaUrl } from '@/lib/api-client';
import { findMarketingAsset, marketingAssetHref, type MarketingAssetRecord } from '@/lib/marketing-assets';
import { isVirtualTourNavItem } from '@/lib/virtual-tour';
import { fixKeyNavItem, type KeyNavItem } from '@/config/home-page-defaults';
import { HOME_SHORTCUTS_HASH } from '@/components/layout/PublicPageBackLink';

// --- Types & Constants ---
interface NavItem {
    label: string;
    href: string;
    icon: string;
    alt: string;
    external?: boolean;
}

const toNavItem = (item: KeyNavItem): NavItem => {
    const fixed = fixKeyNavItem(item);
    return {
        label: fixed.label,
        href: fixed.href,
        icon: fixed.icon,
        alt: fixed.alt,
        external: fixed.external,
    };
};

const THEMES = [
    { primary: "#F15A29", light: "#ff825c" },
    { primary: "#8AC43F", light: "#b0e66a" },
    { primary: "#C94A36", light: "#f0715d" },
    { primary: "#0ea5e9", light: "#7dd3fc" },
    { primary: "#8b5cf6", light: "#c4b5fd" },
    { primary: "#f59e0b", light: "#fcd34d" },
];

const WAVE_DURATION_SECONDS = 1.15;
const WAVE_RING_GAP_SECONDS = 0.22;
const WAVE_RING_DELAYS = [0, WAVE_RING_GAP_SECONDS, WAVE_RING_GAP_SECONDS * 2];

const formatNavLabel = (label: string) => {
    if (/^virtual\s*tour$/i.test(label)) return "Virtual\nTour";
    if (/^tv\s*commercial$/i.test(label.replace(/\n/g, ' '))) return "Media";
    if (/^become\s+a\s+franchise$/i.test(label.replace(/\n/g, ' '))) return "Become a\nFranchisee";
    if (/download\s*brochure/i.test(label.replace(/\n/g, ' '))) return "Download\nBrochure";
    return label;
};

const DEFAULT_BROCHURE_HREFS = {
    admission:
        mediaUrl('pc/admission-brochure/admission-brochure.pdf') ||
        '/media/pc/admission-brochure/admission-brochure.pdf',
    franchise:
        'https://www.timekidspreschools.in/uploads/pc/TIME-Kids-Franchise%20Brochure.pdf',
};

const getNavIcon = (item: NavItem) => {
    if (/^media$/i.test(item.label.replace(/\n/g, ' ')) || item.href === '/gallery' && item.icon.includes('icon-media')) {
        return '/icon-media.svg';
    }
    if (/^tv\s*commercial$/i.test(item.label.replace(/\n/g, ' ')) || /tv-commercial/i.test(item.href)) {
        return '/icon-media.svg';
    }

    return item.icon;
};

const getNavAlt = (item: NavItem) => {
    if (/^media$/i.test(item.label.replace(/\n/g, ' ')) || /tv-commercial/i.test(item.href)) {
        return 'Media';
    }

    if (/^become\s+a\s+franchise$/i.test(item.label.replace(/\n/g, ' ')) || item.href === '/franchise') {
        return 'Become a Franchisee';
    }

    return item.alt;
};

// --- Card Component ---
const isExternalHref = (item: NavItem) =>
    Boolean(item.external) || /^https?:\/\//i.test(item.href);

const isBrochureNavItem = (item: NavItem) => {
    const icon = (item.icon || '').toLowerCase();
    const label = (item.label || '').replace(/\n/g, ' ');
    const alt = (item.alt || '');
    return (
        icon.includes('brochure') ||
        /download\s*brochure/i.test(label) ||
        /download\s*brochure/i.test(alt) ||
        /\.pdf(\?|#|$)/i.test(item.href || '')
    );
};

type BrochureLinks = { admission: string; franchise: string };

const NavigationCard = ({
    item,
    index,
    isActive,
    onOpenVirtualTour,
    brochureLinks,
    brochureOpen,
    onBrochureToggle,
}: {
    item: NavItem,
    index: number,
    isActive: boolean,
    onOpenVirtualTour: () => void,
    brochureLinks?: BrochureLinks | null,
    brochureOpen?: boolean,
    onBrochureToggle?: () => void,
}) => {
    const theme = THEMES[index % THEMES.length];
    const displayLabel = formatNavLabel(item.label);
    const virtualTour = isVirtualTourNavItem(item);
    const isBrochure = Boolean(brochureLinks);
    const external = !virtualTour && !isBrochure && isExternalHref(item);
    const ariaLabel = virtualTour
        ? `${getNavAlt(item)}, opens virtual tour`
        : `${getNavAlt(item)}${external ? ', opens in a new tab' : ''}`;
    const linkClass =
        'relative flex shrink-0 flex-col items-center group no-underline text-inherit cursor-pointer min-w-[100px] sm:min-w-[118px] md:min-w-[140px] lg:min-w-[148px] xl:min-w-[178px] px-1.5 pt-6 pb-2 sm:px-2 md:px-2.5 lg:px-2.5 xl:px-3 rounded-3xl transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 bg-transparent border-0';

    const cardBody = (
        <>
            {/* Main Visual Card Container */}
            <div className="relative z-10 flex h-[8.25rem] w-[8.25rem] shrink-0 items-center justify-center sm:h-36 sm:w-36 xl:h-44 xl:w-44">
                {/* Outside card wave lines */}
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                    {WAVE_RING_DELAYS.map((delay, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: isActive ? [1.02, 1.26, 1.55, 1.82] : 1.03,
                                opacity: isActive ? [0, 0.38, 0.2, 0] : 0,
                            }}
                            transition={{
                                duration: WAVE_DURATION_SECONDS,
                                ease: "easeOut",
                                delay,
                                repeat: isActive ? Infinity : 0,
                                repeatDelay: 0,
                            }}
                            className="absolute h-full w-full rounded-[45px] border"
                            style={{
                                borderColor: theme.primary,
                                boxShadow: `0 0 10px ${theme.primary}1f`,
                                mixBlendMode: "multiply",
                            }}
                        />
                    ))}
                    {!isActive && (
                        <div
                            className="absolute h-full w-full rounded-[45px] border"
                            style={{
                                borderColor: theme.primary,
                                opacity: 0.08,
                                mixBlendMode: "multiply",
                            }}
                        />
                    )}
                </div>
                
                {/* 1. Base Glass Card (Squircle) */}
                <motion.div 
                    animate={{
                        scale: isActive ? 1.025 : 1,
                        boxShadow: isActive 
                            ? `0 30px 60px -12px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.3)`
                            : `0 10px 30px -10px rgba(0,0,0,0.1)`,
                        border: isActive 
                            ? `2.5px solid rgba(255,255,255,0.8)` 
                            : `1.5px solid rgba(255,255,255,0.4)`
                    }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full h-full rounded-[45px] overflow-hidden flex items-center justify-center transition-all duration-700"
                    style={{ 
                        background: `linear-gradient(145deg, ${theme.light}, ${theme.primary})`,
                    }}
                >
                    {/* Glass Layer & Inner Glow */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm pointer-events-none" />



                    {/* 4. Icon */}
                    <div className="relative z-20 flex h-16 w-16 items-center justify-center xl:h-20 xl:w-20">
                        <Image 
                            src={getNavIcon(item)} 
                            alt={getNavAlt(item)} 
                            width={75} 
                            height={75} 
                            className="object-contain invert brightness-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.2)]" 
                            unoptimized 
                        />
                    </div>
                </motion.div>


            </div>

            {/* Text Content */}
            <div className="relative z-20 mt-8 max-w-[min(100%,10.5rem)] text-center sm:mt-9 sm:max-w-[12.5rem] md:mt-10 md:max-w-[11rem] xl:max-w-[170px]">
                <motion.span
                    animate={{
                        color: isActive ? theme.primary : '#1e293b',
                        scale: isActive ? 1.05 : 1,
                    }}
                    className="block text-sm md:text-base font-black uppercase tracking-[0.1em] leading-tight font-jakarta transition-all duration-500"
                >
                    {displayLabel.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                            {line}
                            {i < displayLabel.split('\n').length - 1 && <br />}
                        </React.Fragment>
                    ))}
                </motion.span>

                {/* Visual indicator of the energy passing */}
                <motion.div
                    animate={{
                        width: isActive ? '100%' : '0%',
                        opacity: isActive ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-1 bg-orange-500 mt-4 mx-auto rounded-full"
                />
            </div>
        </>
    );

    return (
            <motion.div layout className="relative mx-auto flex w-full max-w-[11.5rem] flex-col items-center group md:max-w-none">
            {isBrochure && brochureLinks ? (
                <>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onBrochureToggle?.();
                        }}
                        className={linkClass}
                        aria-label="Download brochure — choose admission or franchise"
                        aria-expanded={brochureOpen}
                        aria-haspopup="true"
                    >
                        {cardBody}
                    </button>
                    <AnimatePresence initial={false}>
                        {brochureOpen ? (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="mt-2 w-full min-w-[12rem] max-w-[14rem] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
                            >
                                <a
                                    href={brochureLinks.admission}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-violet-50 hover:text-violet-800"
                                    onClick={() => onBrochureToggle?.()}
                                >
                                    Admission Brochure
                                </a>
                                <div className="mx-3 border-t border-slate-100" aria-hidden />
                                <a
                                    href={brochureLinks.franchise}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-violet-50 hover:text-violet-800"
                                    onClick={() => onBrochureToggle?.()}
                                >
                                    Franchise Brochure
                                </a>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </>
            ) : virtualTour ? (
                <button
                    type="button"
                    onClick={onOpenVirtualTour}
                    className={linkClass}
                    aria-label={ariaLabel}
                    title={ariaLabel}
                >
                    {cardBody}
                </button>
            ) : external ? (
                <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                    aria-label={ariaLabel}
                    title={ariaLabel}
                >
                    {cardBody}
                </a>
            ) : (
                <Link href={item.href} className={linkClass} aria-label={ariaLabel} title={ariaLabel}>
                    {cardBody}
                </Link>
            )}
        </motion.div>
    );
};

// --- Main Component ---
export default function KeyNavigation() {
    const home = useHomePageContent();
    const items = (home.key_navigation?.length ? home.key_navigation : []).map(toNavItem);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [virtualTourOpen, setVirtualTourOpen] = useState(false);
    const [brochureHrefs, setBrochureHrefs] = useState<BrochureLinks>(DEFAULT_BROCHURE_HREFS);
    const [marketingTourUrl, setMarketingTourUrl] = useState<string | null>(null);
    const [mobileIndex, setMobileIndex] = useState(0);
    const [openBrochureIndex, setOpenBrochureIndex] = useState<number | null>(null);
    const tourItem = items.find((item) => isVirtualTourNavItem(item));
    const tourEmbedUrl = (() => {
        const cms = (tourItem?.href || "").trim();
        const marketing = (marketingTourUrl || "").trim();
        return marketing || cms || null;
    })();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.location.hash !== `#${HOME_SHORTCUTS_HASH}`) return;
        const el = document.getElementById(HOME_SHORTCUTS_HASH);
        if (!el) return;
        const t = window.setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return () => window.clearTimeout(t);
    }, []);

    useEffect(() => {
        if (items.length === 0) {
            setMobileIndex(0);
            return;
        }
        setMobileIndex((i) => Math.min(i, items.length - 1));
    }, [items.length]);

    useEffect(() => {
        setOpenBrochureIndex(null);
    }, [mobileIndex]);

    const toggleBrochureMenu = (index: number) => {
        setOpenBrochureIndex((cur) => (cur === index ? null : index));
    };

    const goMobilePrev = () => {
        setOpenBrochureIndex(null);
        setMobileIndex((i) => Math.max(0, i - 1));
    };

    const goMobileNext = () => {
        setOpenBrochureIndex(null);
        setMobileIndex((i) => Math.min(items.length - 1, i + 1));
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(apiUrl('/common/marketing-assets/'));
                if (!res.ok) return;
                const assets = (await res.json()) as MarketingAssetRecord[];
                if (cancelled) return;
                const admission = marketingAssetHref(
                    findMarketingAsset(assets, 'admission-brochure'),
                    DEFAULT_BROCHURE_HREFS.admission,
                );
                const franchise = marketingAssetHref(
                    findMarketingAsset(assets, 'franchise-brochure'),
                    DEFAULT_BROCHURE_HREFS.franchise,
                );
                setBrochureHrefs({
                    admission: admission !== '#' ? admission : DEFAULT_BROCHURE_HREFS.admission,
                    franchise: franchise !== '#' ? franchise : DEFAULT_BROCHURE_HREFS.franchise,
                });
                const tourAsset = findMarketingAsset(assets, 'virtual-tour');
                const tourLink = (tourAsset?.link || "").trim();
                if (tourLink) setMarketingTourUrl(tourLink);
            } catch {
                // keep defaults
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section id="home-shortcuts" className="relative scroll-mt-28 bg-white pb-5 pt-9 font-jakarta md:pt-11 md:scroll-mt-32">
            {/* Background Architecture */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
                <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-b from-slate-50/80 to-white" />
                <div className="absolute left-1/2 top-1/2 h-[300px] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-50/30 blur-[150px]" />
            </div>

            <div className="relative z-10 mx-auto w-full min-w-0 px-3 sm:px-4 md:container md:px-4">
                {items.length > 0 ? (
                    <motion.div className="md:hidden">
                        <motion.div
                            role="region"
                            aria-label="Quick links"
                            className="flex items-center justify-center gap-1 pb-2 pt-2 sm:gap-2"
                        >
                            <button
                                type="button"
                                onClick={goMobilePrev}
                                disabled={mobileIndex === 0}
                                aria-label="Previous shortcut"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                                <ChevronLeft className="h-6 w-6" aria-hidden />
                            </button>
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={mobileIndex}
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex min-w-0 flex-1 flex-col items-center justify-center ${openBrochureIndex === mobileIndex ? 'relative z-20' : ''}`}
                                    onMouseEnter={() => setHoveredIndex(mobileIndex)}
                                    onFocus={() => setHoveredIndex(mobileIndex)}
                                    onBlur={() => setHoveredIndex(null)}
                                >
                                    <NavigationCard
                                        item={items[mobileIndex]}
                                        index={mobileIndex}
                                        isActive={
                                            mobileIndex === hoveredIndex || openBrochureIndex === mobileIndex
                                        }
                                        onOpenVirtualTour={() => setVirtualTourOpen(true)}
                                        brochureLinks={
                                            isBrochureNavItem(items[mobileIndex]) ? brochureHrefs : null
                                        }
                                        brochureOpen={openBrochureIndex === mobileIndex}
                                        onBrochureToggle={() => toggleBrochureMenu(mobileIndex)}
                                    />
                                </motion.div>
                            </AnimatePresence>
                            <button
                                type="button"
                                onClick={goMobileNext}
                                disabled={mobileIndex >= items.length - 1}
                                aria-label="Next shortcut"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                                <ChevronRight className="h-6 w-6" aria-hidden />
                            </button>
                        </motion.div>
                        {items.length > 1 ? (
                            <motion.div
                                className="flex justify-center gap-1.5 pb-4"
                                role="tablist"
                                aria-label="Shortcut pages"
                            >
                                {items.map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        role="tab"
                                        aria-selected={i === mobileIndex}
                                        aria-label={`Shortcut ${i + 1} of ${items.length}`}
                                        onClick={() => setMobileIndex(i)}
                                        className={`h-2 rounded-full transition-all ${
                                            i === mobileIndex ? 'w-5 bg-[#F15A29]' : 'w-2 bg-slate-200'
                                        }`}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div className="pb-4" aria-hidden />
                        )}
                    </motion.div>
                ) : null}

                <motion.div className="relative hidden md:block">
                    <motion.div
                        role="region"
                        aria-label="Quick links"
                        className={`key-nav-track no-scrollbar max-w-full min-w-0 pb-4 pt-6 ${
                            openBrochureIndex != null ? 'overflow-visible' : 'overflow-x-auto overflow-y-visible'
                        }`}
                        onMouseLeave={() => {
                            setHoveredIndex(null);
                            setOpenBrochureIndex(null);
                        }}
                    >
                        <motion.div className="mx-auto flex w-max min-w-full flex-nowrap items-center justify-center gap-3 lg:gap-4 xl:gap-5">
                            {items.map((item, index) => (
                                <motion.div
                                    key={`${item.href}-${index}`}
                                    className={`shrink-0 ${openBrochureIndex === index ? 'relative z-20' : ''}`}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onFocus={() => setHoveredIndex(index)}
                                    onBlur={() => setHoveredIndex(null)}
                                >
                                    <NavigationCard
                                        item={item}
                                        index={index}
                                        isActive={index === hoveredIndex || openBrochureIndex === index}
                                        onOpenVirtualTour={() => setVirtualTourOpen(true)}
                                        brochureLinks={isBrochureNavItem(item) ? brochureHrefs : null}
                                        brochureOpen={openBrochureIndex === index}
                                        onBrochureToggle={() => toggleBrochureMenu(index)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Subtle Aurora background particles */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <VirtualTourModal
                isOpen={virtualTourOpen}
                onClose={() => setVirtualTourOpen(false)}
                embedUrl={tourEmbedUrl}
            />
        </section>
    );
}

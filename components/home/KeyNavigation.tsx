'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useHomePageContent } from '@/components/home/HomePageContentProvider';
import VirtualTourModal from '@/components/home/VirtualTourModal';
import { apiUrl, mediaUrl } from '@/lib/api-client';
import { findMarketingAsset, marketingAssetHref, type MarketingAssetRecord } from '@/lib/marketing-assets';
import { isVirtualTourNavItem } from '@/lib/virtual-tour';

// --- Types & Constants ---
interface NavItem {
    label: string;
    href: string;
    icon: string;
    alt: string;
    external?: boolean;
}

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
    if (/^tv\s*commercial$/i.test(item.label.replace(/\n/g, ' ')) || item.href === '/tv-commercial') {
        return '/icon-media.svg';
    }

    return item.icon;
};

const getNavAlt = (item: NavItem) => {
    if (/^tv\s*commercial$/i.test(item.label.replace(/\n/g, ' ')) || item.href === '/tv-commercial') {
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
    const brochureMenuRef = useRef<HTMLDivElement>(null);
    const brochureButtonRef = useRef<HTMLButtonElement>(null);
    const [brochureMenuPos, setBrochureMenuPos] = useState<{ top: number; left: number } | null>(null);
    const theme = THEMES[index % THEMES.length];
    const displayLabel = formatNavLabel(item.label);
    const virtualTour = isVirtualTourNavItem(item);
    const isBrochure = Boolean(brochureLinks);
    const external = !virtualTour && !isBrochure && isExternalHref(item);

    useEffect(() => {
        if (!brochureOpen || !brochureButtonRef.current) {
            setBrochureMenuPos(null);
            return;
        }
        const updatePosition = () => {
            const el = brochureButtonRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            setBrochureMenuPos({
                top: rect.bottom + 8,
                left: rect.left + rect.width / 2,
            });
        };
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [brochureOpen]);

    useEffect(() => {
        if (!brochureOpen || !onBrochureToggle) return;
        const onPointerDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (brochureMenuRef.current?.contains(target)) return;
            if (brochureButtonRef.current?.contains(target)) return;
            onBrochureToggle();
        };
        const timer = window.setTimeout(() => {
            document.addEventListener('mousedown', onPointerDown);
        }, 0);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', onPointerDown);
        };
    }, [brochureOpen, onBrochureToggle]);
    const ariaLabel = virtualTour
        ? `${getNavAlt(item)}, opens virtual tour`
        : `${getNavAlt(item)}${external ? ', opens in a new tab' : ''}`;
    const linkClass =
        'relative flex shrink-0 flex-col items-center group no-underline text-inherit cursor-pointer min-w-[108px] xs:min-w-[118px] sm:min-w-[132px] md:min-w-[140px] lg:min-w-[148px] xl:min-w-[178px] px-1.5 pt-6 pb-2 sm:px-2 md:px-2.5 lg:px-2.5 xl:px-3 rounded-3xl transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 bg-transparent border-0';

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
        <motion.div layout className="relative flex flex-col items-center group">
            {isBrochure && brochureLinks ? (
                <>
                    <button
                        ref={brochureButtonRef}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onBrochureToggle?.();
                        }}
                        className={linkClass}
                        aria-label="Download brochure — choose admission or franchise"
                        aria-expanded={brochureOpen}
                        aria-haspopup="menu"
                    >
                        {cardBody}
                        <span
                            className="absolute right-3 top-3 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm"
                            aria-hidden
                        >
                            <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${brochureOpen ? 'rotate-180' : ''}`}
                            />
                        </span>
                    </button>
                    {typeof document !== 'undefined' &&
                        createPortal(
                            <AnimatePresence>
                                {brochureOpen && brochureMenuPos ? (
                                    <motion.div
                                        ref={brochureMenuRef}
                                        role="menu"
                                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                        className="fixed z-[10050] w-56 max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200/90 bg-white py-1.5 shadow-[0_20px_50px_rgba(15,23,42,0.18)]"
                                        style={{ top: brochureMenuPos.top, left: brochureMenuPos.left }}
                                    >
                                        <a
                                            role="menuitem"
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
                                            role="menuitem"
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
                            </AnimatePresence>,
                            document.body,
                        )}
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
    const items = home.key_navigation?.length ? home.key_navigation : [];
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [virtualTourOpen, setVirtualTourOpen] = useState(false);
    const [brochureMenuOpen, setBrochureMenuOpen] = useState(false);
    const [brochureHrefs, setBrochureHrefs] = useState<BrochureLinks>(DEFAULT_BROCHURE_HREFS);
    const [marketingTourUrl, setMarketingTourUrl] = useState<string | null>(null);
    const tourItem = items.find((item) => isVirtualTourNavItem(item));
    const brochureIndex = items.findIndex((item) => isBrochureNavItem(item));
    const tourEmbedUrl = (() => {
        const cms = (tourItem?.href || "").trim();
        const marketing = (marketingTourUrl || "").trim();
        return marketing || cms || null;
    })();

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
        <section className="relative bg-white pb-5 pt-9 font-jakarta md:pt-11">
            {/* Background Architecture */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
                <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-b from-slate-50/80 to-white" />
                <div className="absolute left-1/2 top-1/2 h-[300px] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-50/30 blur-[150px]" />
            </div>

            {/* Scroll when needed; `w-max min-w-full` + `justify-center` centers the row when it fits (no extra gap on the right). */}
            <div className="relative z-10 mx-auto w-full min-w-0 px-3 sm:px-4 md:container md:px-4">
                <div
                    className={`no-scrollbar max-w-full min-w-0 touch-pan-x overscroll-x-contain pb-4 pt-6 snap-x snap-proximity ${
                        brochureMenuOpen ? 'overflow-visible' : 'overflow-x-auto overflow-y-visible'
                    }`}
                    onMouseLeave={() => {
                        if (!brochureMenuOpen) setHoveredIndex(null);
                    }}
                >
                    <div className="mx-auto flex min-w-full w-max flex-nowrap items-center justify-center gap-1.5 scroll-px-3 sm:gap-2 sm:scroll-px-4 md:gap-3 lg:gap-4 xl:gap-5">
                        {items.map((item, index) => (
                            <motion.div
                                key={`${item.href}-${index}`}
                                className={`shrink-0 snap-start ${brochureMenuOpen && index === brochureIndex ? 'relative z-[100]' : ''}`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onFocus={() => setHoveredIndex(index)}
                                onBlur={() => setHoveredIndex(null)}
                            >
                                <NavigationCard
                                    item={item}
                                    index={index}
                                    isActive={index === hoveredIndex || (brochureMenuOpen && index === brochureIndex)}
                                    onOpenVirtualTour={() => setVirtualTourOpen(true)}
                                    brochureLinks={isBrochureNavItem(item) ? brochureHrefs : null}
                                    brochureOpen={brochureMenuOpen && index === brochureIndex}
                                    onBrochureToggle={
                                        isBrochureNavItem(item)
                                            ? () => setBrochureMenuOpen((open) => !open)
                                            : undefined
                                    }
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
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

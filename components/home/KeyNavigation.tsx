'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useHomePageContent } from '@/components/home/HomePageContentProvider';

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
    return label;
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
const NavigationCard = ({
    item,
    index,
    isActive,
}: {
    item: NavItem,
    index: number,
    isActive: boolean,
}) => {
    const theme = THEMES[index % THEMES.length];
    const displayLabel = formatNavLabel(item.label);
    
    return (
        <motion.div
            layout
            className="relative flex shrink-0 flex-col items-center group cursor-pointer min-w-[108px] xs:min-w-[118px] sm:min-w-[132px] md:min-w-[140px] lg:min-w-[148px] xl:min-w-[178px] px-1.5 pt-6 pb-2 sm:px-2 md:px-2.5 lg:px-2.5 xl:px-3"
        >
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
                <a
                    href={item.href}
                    {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="block"
                >
                    <motion.span 
                        animate={{ 
                            color: isActive ? theme.primary : "#1e293b",
                            scale: isActive ? 1.05 : 1
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
                </a>
                
                {/* Visual indicator of the energy passing */}
                <motion.div 
                    animate={{ 
                        width: isActive ? "100%" : "0%",
                        opacity: isActive ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-1 bg-orange-500 mt-4 mx-auto rounded-full"
                />
            </div>
        </motion.div>
    );
};

// --- Main Component ---
export default function KeyNavigation() {
    const home = useHomePageContent();
    const items = home.key_navigation?.length ? home.key_navigation : [];
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section className="relative bg-white pb-5 pt-9 font-jakarta md:pt-11">
            {/* Background Architecture */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
                <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-b from-slate-50/80 to-white" />
                <div className="absolute left-1/2 top-1/2 h-[300px] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-50/30 blur-[150px]" />
            </div>

            {/* Full-width scroll strip: justify-start avoids end cards sitting half off-screen when row overflows */}
            <div className="relative z-10 mx-auto w-full min-w-0 px-3 sm:px-4 md:container md:px-4">
                <div
                    className="no-scrollbar flex max-w-full min-w-0 flex-nowrap touch-pan-x items-center justify-start gap-1.5 overflow-x-auto overflow-y-visible overscroll-x-contain scroll-px-3 pb-4 pe-8 pt-6 snap-x snap-proximity sm:gap-2 sm:scroll-px-4 sm:pe-10 md:gap-3 md:pe-12 lg:gap-4 xl:gap-5 xl:pe-10"
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    {items.map((item, index) => (
                        <div
                            key={`${item.href}-${index}`}
                            className="shrink-0 snap-start"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onFocus={() => setHoveredIndex(index)}
                            onBlur={() => setHoveredIndex(null)}
                        >
                            <NavigationCard
                                item={item}
                                index={index}
                                isActive={index === hoveredIndex}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Subtle Aurora background particles */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </section>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
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

// --- Card Component ---
const NavigationCard = ({ item, index, isActive }: { item: NavItem, index: number, isActive: boolean }) => {
    const theme = THEMES[index % THEMES.length];
    const isFastWave = index < 2;
    
    return (
        <motion.div
            layout
            className="relative flex flex-col items-center group cursor-pointer min-w-[180px] md:min-w-[220px] px-4 py-10"
        >
            {/* Main Visual Card Container */}
            <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center z-10">
                {/* Outside card wave lines */}
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                    {[0, 0.32, 0.64, 0.96].map((delay, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: isActive
                                    ? isFastWave
                                        ? [0.96, 1.38, 1.82]
                                        : [0.96, 1.28, 1.62]
                                    : 1.08 + i * 0.1,
                                opacity: isActive
                                    ? isFastWave
                                        ? [0, 0.72, 0]
                                        : [0, 0.56, 0]
                                    : 0.18,
                            }}
                            transition={{
                                duration: isFastWave ? 1.45 : 2.25,
                                ease: [0.22, 1, 0.36, 1],
                                delay: isFastWave ? delay * 0.7 : delay,
                                repeat: isActive ? Infinity : 0,
                            }}
                            className="absolute h-full w-full rounded-[45px] border"
                            style={{
                                borderColor: theme.primary,
                                boxShadow: isFastWave ? `0 0 18px ${theme.primary}33` : undefined,
                                mixBlendMode: "multiply",
                            }}
                        />
                    ))}
                </div>
                
                {/* 1. Base Glass Card (Squircle) */}
                <motion.div 
                    animate={{
                        scale: isActive ? 1.05 : 1,
                        boxShadow: isActive 
                            ? `0 30px 60px -12px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.3)`
                            : `0 10px 30px -10px rgba(0,0,0,0.1)`,
                        border: isActive 
                            ? `2.5px solid rgba(255,255,255,0.8)` 
                            : `1.5px solid rgba(255,255,255,0.4)`
                    }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full h-full rounded-[45px] overflow-hidden flex items-center justify-center transition-all duration-700"
                    style={{ 
                        background: `linear-gradient(145deg, ${theme.light}, ${theme.primary})`,
                    }}
                >
                    {/* Glass Layer & Inner Glow */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm pointer-events-none" />



                    {/* 4. Icon */}
                    <div className="relative z-20 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                        <Image 
                            src={item.icon} 
                            alt={item.alt} 
                            width={75} 
                            height={75} 
                            className="object-contain invert brightness-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.2)]" 
                            unoptimized 
                        />
                    </div>
                </motion.div>


            </div>

            {/* Text Content */}
            <div className="mt-10 text-center relative z-20 max-w-[170px]">
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
                        {item.label.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                {i < item.label.split('\n').length - 1 && <br />}
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
                    transition={{ duration: 0.8 }}
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
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (!items.length) return;

        // Sequential Timer to cycle through active cards
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % items.length);
        }, 3000); // 3s duration per card animation

        return () => clearInterval(interval);
    }, [items.length]);

    return (
        <section className="relative py-32 overflow-hidden bg-white font-jakarta">
            {/* Background Architecture */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-50/80 to-white" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[300px] bg-blue-50/30 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-nowrap lg:justify-center items-center gap-2 md:gap-6 overflow-x-auto no-scrollbar pb-20 pt-10 px-4">
                    {items.map((item, index) => (
                        <NavigationCard 
                            key={`${item.href}-${index}`} 
                            item={item} 
                            index={index} 
                            isActive={index === activeIndex}
                        />
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

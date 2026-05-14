'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, BookOpen, Star, Heart, Music, Palette, Users, Sparkles, Sun, Cloud, Bird } from 'lucide-react';
import TwinklingStars from '@/components/animations/TwinklingStars';
import AnimatedNumbers from '@/components/animations/AnimatedNumbers';
import { gsap } from 'gsap';
import { apiUrl } from '@/lib/api-client';
import { DEFAULT_PROGRAMS_PAGE_DATA, mergeProgramsPageData, type ProgramsPageProgram } from '@/config/programs-page-defaults';

// --- Interactive Bubbles Component ---
const InteractiveBubbles = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const bubbles: HTMLDivElement[] = [];
        const bubbleCount = 15;
        const colors = ['bg-pink-300', 'bg-blue-300', 'bg-purple-300', 'bg-yellow-300', 'bg-green-300', 'bg-orange-300'];

        // Create Bubbles
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            const size = Math.random() * 60 + 20; // 20px to 80px
            const color = colors[Math.floor(Math.random() * colors.length)];

            bubble.className = `absolute rounded-full opacity-60 mix-blend-multiply filter blur-sm ${color} pointer-events-auto cursor-pointer transition-transform duration-300 hover:scale-125`;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${Math.random() * 100}%`;
            bubble.style.top = `${Math.random() * 100}%`;

            container.appendChild(bubble);
            bubbles.push(bubble);

            // Floating Animation
            gsap.to(bubble, {
                y: `-=${Math.random() * 200 + 100}`,
                x: `+=${Math.random() * 50 - 25}`,
                rotation: Math.random() * 360,
                duration: Math.random() * 10 + 10,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: Math.random() * 5
            });
        }

        // Mouse Interaction
        const onMouseMove = (e: MouseEvent) => {
            bubbles.forEach(bubble => {
                const rect = bubble.getBoundingClientRect();
                const bubbleX = rect.left + rect.width / 2;
                const bubbleY = rect.top + rect.height / 2;
                const distX = e.clientX - bubbleX;
                const distY = e.clientY - bubbleY;
                const dist = Math.sqrt(distX * distX + distY * distY);
                const maxDist = 150;

                if (dist < maxDist) {
                    const power = (maxDist - dist) / maxDist;
                    gsap.to(bubble, {
                        x: `-=${distX * power * 0.5}`,
                        y: `-=${distY * power * 0.5}`,
                        duration: 0.5,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                }
            });
        };

        window.addEventListener('mousemove', onMouseMove);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            bubbles.forEach(b => b.remove());
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden" />;
};

// --- Cloud Shape Divider ---
const CloudDivider = ({ flip = false }) => (
    <div className={`w-full text-white relative z-10 -my-2 ${flip ? 'rotate-180' : ''}`}>
        <svg viewBox="0 0 1440 320" className="w-full h-auto block" preserveAspectRatio="none">
            <path fill="currentColor" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
    </div>
);

type ProgramDescriptionTheme = {
    accent: string;
    bg: string;
};

function descriptionBoxClass(lead: boolean, theme: ProgramDescriptionTheme, size: 'compact' | 'expanded') {
    const sizeCls =
        size === 'expanded'
            ? 'text-lg font-medium leading-relaxed text-slate-700 md:text-xl md:leading-[1.6]'
            : 'text-base font-medium leading-relaxed text-slate-600 md:text-lg md:leading-[1.7]';
    return `rounded-2xl border border-slate-100/90 bg-white/90 px-4 py-3.5 shadow-sm backdrop-blur md:px-5 md:py-4 ${sizeCls} ${lead ? `border-l-4 ${theme.bg}` : ''}`;
}

/** First paragraph + Know more → full text with larger type. */
function ExpandableProgramDescription({
    paragraphs,
    theme,
    buttonRowClass,
}: {
    paragraphs: string[];
    theme: ProgramDescriptionTheme;
    buttonRowClass: string;
}) {
    const [expanded, setExpanded] = useState(false);
    if (!paragraphs.length) return null;

    if (paragraphs.length === 1) {
        return <p className={descriptionBoxClass(true, theme, 'compact')}>{paragraphs[0]}</p>;
    }

    return (
        <div className="space-y-3">
            {!expanded ? (
                <p className={descriptionBoxClass(true, theme, 'compact')}>{paragraphs[0]}</p>
            ) : (
                <div className="space-y-2.5 md:space-y-3">
                    {paragraphs.map((paragraph, idx) => (
                        <p key={idx} className={descriptionBoxClass(idx === 0, theme, 'expanded')}>
                            {paragraph}
                        </p>
                    ))}
                </div>
            )}
            <div className={buttonRowClass}>
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className={`inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wide underline-offset-4 transition hover:underline ${theme.accent}`}
                    aria-expanded={expanded}
                >
                    {expanded ? 'Show less' : 'Know more'}
                </button>
            </div>
        </div>
    );
}

export default function ProgramsPage() {
    const [pageData, setPageData] = useState(() => DEFAULT_PROGRAMS_PAGE_DATA);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(apiUrl('/common/page-content/programs/'));
                if (!res.ok) throw new Error('bad status');
                const json = await res.json();
                if (!cancelled) setPageData(mergeProgramsPageData(json));
            } catch {
                if (!cancelled) setPageData(DEFAULT_PROGRAMS_PAGE_DATA);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const themeByIndex = (index: number) => {
        const themes = [
            { colorStart: 'from-[#FF9A9E]', colorEnd: 'to-[#FECFEF]', accent: 'text-pink-500', bg: 'bg-pink-50', icon: Music },
            { colorStart: 'from-[#a18cd1]', colorEnd: 'to-[#fbc2eb]', accent: 'text-purple-500', bg: 'bg-purple-50', icon: Palette },
            { colorStart: 'from-[#84fab0]', colorEnd: 'to-[#8fd3f4]', accent: 'text-teal-600', bg: 'bg-teal-50', icon: BookOpen },
            { colorStart: 'from-[#f6d365]', colorEnd: 'to-[#fda085]', accent: 'text-orange-500', bg: 'bg-orange-50', icon: Star },
            { colorStart: 'from-[#4facfe]', colorEnd: 'to-[#00f2fe]', accent: 'text-blue-500', bg: 'bg-blue-50', icon: Heart },
        ];
        return themes[index % themes.length];
    };

    /** Summer / day care: last two description blocks sit under the image column; rest stay in the main card. */
    const splitSummerDescription = (description: string, isSummer: boolean) => {
        const all = description.split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);
        if (isSummer && all.length >= 4) {
            return { mainParagraphs: all.slice(0, -2), asideParagraphs: all.slice(-2) };
        }
        return { mainParagraphs: all, asideParagraphs: [] as string[] };
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#FDFBF7] font-sans selection:bg-yellow-200">
            {/* Background Animations */}
            <InteractiveBubbles />
            <div className="fixed top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none z-[-1]"></div>

            {/* Hero Section */}
            <section className="relative section-gap overflow-visible">
                {/* Decorative Elements */}
                <div className="absolute top-20 left-[10%] w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-24 right-[15%] w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-32 left-[20%] w-28 h-28 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white to-transparent opacity-60 z-0 pointer-events-none"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-1.5 rounded-full shadow-sm mb-4 border border-orange-100 hover:scale-105 transition-transform cursor-default">
                        <Sun className="w-4 h-4 text-yellow-500 animate-spin-slow" />
                        <span className="font-bold text-orange-500 tracking-wide uppercase text-xs">{pageData.hero.badge}</span>
                    </div>

                    <h1 className="font-display font-black text-5xl md:text-6xl mb-4 text-slate-800 tracking-tight drop-shadow-sm">
                        {pageData.hero.title_prefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 relative inline-block">
                            {pageData.hero.title_accent}
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300 -z-10 opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                        {pageData.hero.subtitle}
                    </p>
                </div>

                {/* Cartoon Character */}
                <div className="absolute bottom-0 right-[5%] z-20 w-40 h-40 hidden md:block animate-bounce-slow">
                    <Image src="/kid-character.gif" alt="Happy Kid" fill className="object-contain drop-shadow-2xl" unoptimized />
                </div>
            </section>

            {/* Cloud Divider */}
            <div className="relative -mt-32 md:-mt-56 z-20">
                <CloudDivider />
            </div>

            {/* Content Section - The Program Cards */}
            <section className="relative z-10 bg-white pb-12 pt-6 md:pb-16 md:pt-8">
                <div className="container mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="flex flex-col gap-10 md:gap-12">
                        {pageData.programs.map((program: ProgramsPageProgram, index) => {
                            const theme = themeByIndex(index);
                            const programName = (program.name || '').trim().toLowerCase();
                            const isSummerPrograms = programName === 'summer programs' || programName === 'day care';
                            const { mainParagraphs, asideParagraphs } = splitSummerDescription(
                                program.description,
                                isSummerPrograms,
                            );

                            return (
                                <React.Fragment key={index}>
                                <header className={`mb-6 w-full text-center md:mb-8 lg:mb-10 ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                                    <p className={`text-xs font-bold uppercase tracking-widest text-slate-500 sm:text-sm ${theme.accent}`}>
                                        {program.ageGroup}
                                    </p>
                                    <h2 className="mt-2 font-display font-black text-4xl leading-tight tracking-tight text-slate-800 drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl">
                                        {program.name}
                                    </h2>
                                    <div className={`mt-3 flex items-center justify-center gap-2 text-base font-bold text-slate-500 sm:text-lg md:gap-3 ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}>
                                        <div className={`rounded-full bg-slate-100/90 p-2.5 ${theme.accent}`}>
                                            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <span>{program.duration}</span>
                                    </div>
                                </header>

                                <div className={`relative flex flex-col items-center gap-10 md:flex-row md:items-stretch md:gap-12 lg:gap-16 xl:gap-20 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''} ${isSummerPrograms ? 'py-10 md:py-14' : ''}`}>

                                    {/* Special Background for Summer Programs */}
                                    {isSummerPrograms && (
                                        <div className="absolute left-0 right-0 w-full h-[500px] bg-gradient-to-r from-blue-50/50 to-cyan-50/50 -skew-y-3 -z-10 rounded-3xl"></div>
                                    )}

                                    {/* Image Side */}
                                    <div className="relative flex w-full flex-col gap-5 md:w-1/2">
                                        <div className="relative group perspective-1000">
                                            <div className={`absolute inset-0 bg-gradient-to-br ${theme.colorStart} ${theme.colorEnd} opacity-30 blur-2xl transform scale-90 group-hover:scale-105 transition-all duration-700 rounded-full`}></div>

                                            <div className={`relative w-full aspect-square md:aspect-[4/3] overflow-hidden shadow-2xl transition-all duration-500 transform group-hover:rotate-1 group-hover:-translate-y-2 border-4 border-white`} style={{ borderRadius: index % 2 === 0 ? '60% 40% 30% 70% / 60% 30% 70% 40%' : '30% 70% 70% 30% / 30% 30% 70% 70%' }}>
                                                <div className="absolute inset-0 bg-black/5 z-10 group-hover:bg-transparent transition-colors duration-500"></div>
                                                <Image
                                                    src={program.image}
                                                    alt={program.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />

                                                <div className={`absolute bottom-8 ${index % 2 === 0 ? 'right-8' : 'left-8'} z-20 bg-white/90 backdrop-blur-md p-5 rounded-full shadow-2xl animate-float border border-white/60 ring-4 ring-black/5`}>
                                                    <theme.icon className={`w-10 h-10 ${theme.accent}`} />
                                                </div>
                                            </div>
                                        </div>

                                        {isSummerPrograms && (
                                            <div className="absolute -top-10 -right-10 z-0 h-32 w-32 rounded-full bg-yellow-300 opacity-70 mix-blend-multiply blur-xl filter animate-blob" />
                                        )}

                                        <div className="relative z-10 w-full rounded-2xl border border-slate-100/90 bg-white/85 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm md:p-5">
                                            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Program highlights">
                                                {program.features.map((feature, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex items-start gap-2 rounded-xl border border-slate-100 bg-white/90 px-3 py-2.5 text-left text-xs font-bold leading-snug text-slate-700 shadow-sm md:text-sm"
                                                    >
                                                        <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r ${theme.colorStart} ${theme.colorEnd}`} aria-hidden />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {asideParagraphs.length > 0 && (
                                            <div className="relative z-10 w-full">
                                                <ExpandableProgramDescription
                                                    paragraphs={asideParagraphs}
                                                    theme={theme}
                                                    buttonRowClass="flex justify-start pt-0.5"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Side */}
                                    <div className="flex w-full md:w-1/2 md:min-h-0 md:max-w-none">
                                        <div className="flex w-full flex-col rounded-[2rem] border border-slate-100/90 bg-white/80 p-6 text-center shadow-[0_16px_48px_rgba(15,23,42,0.06)] backdrop-blur-sm md:h-full md:p-7 md:text-left lg:p-8">
                                            <div className="flex flex-col gap-5 md:gap-6">
                                                <div className="mx-auto w-full max-w-2xl md:mx-0">
                                                    <ExpandableProgramDescription
                                                        paragraphs={mainParagraphs}
                                                        theme={theme}
                                                        buttonRowClass={`flex pt-0.5 ${index % 2 === 0 ? 'justify-center md:justify-start' : 'justify-center md:justify-end'}`}
                                                    />
                                                </div>

                                                <div className={`flex justify-center pt-1 md:pt-2 ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}>
                                                    <Link
                                                        href={pageData.hero.cta_href || "/admission"}
                                                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-orange-200/40 transition hover:-translate-y-0.5 hover:shadow-orange-300/50 sm:text-base"
                                                    >
                                                        {pageData.hero.cta_label || "Enroll Your Child"}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {index < pageData.programs.length - 1 && (
                                    <hr
                                        className="mx-auto my-1 h-px w-full max-w-5xl border-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent md:my-3"
                                        aria-hidden
                                    />
                                )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}

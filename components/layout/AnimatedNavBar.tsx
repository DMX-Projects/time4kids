'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, BookOpen, MapPin, Image as ImageIcon, GraduationCap, Briefcase, LogIn, HelpCircle } from 'lucide-react';

/** Keeps two-word labels on one line in the header (same visual as a space, won’t wrap mid-phrase). */
const NBSP = '\u00A0';

const navItems = [
    { name: `ABOUT${NBSP}US`, path: '/about', icon: Users },
    { name: `OUR${NBSP}PROGRAMS`, path: '/programs', icon: BookOpen },
    { name: `FRANCHISE${NBSP}OPPORTUNITY`, path: '/franchise', icon: Briefcase },
    { name: `LOCATE${NBSP}CENTRE`, path: '/locate-centre', icon: MapPin },
    { name: 'ADMISSIONS', path: '/admission', icon: GraduationCap },
    { name: 'MEDIA', path: '/media', icon: ImageIcon },
    { name: 'FAQ\'S', path: '/faq', icon: HelpCircle },
    { name: 'Login', path: '/login', icon: LogIn },
];

export default function AnimatedNavBar({
    mobile = false,
    inlineScroll = false,
}: {
    mobile?: boolean;
    /** Compact horizontal row for small screens (no hamburger menu) */
    inlineScroll?: boolean;
}) {
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState(pathname);

    useEffect(() => {
        setActiveTab(pathname);
    }, [pathname]);

    return (
        <div
            className={`relative ${
                mobile
                    ? 'w-full bg-transparent'
                    : inlineScroll
                      ? 'bg-transparent py-1 pr-2'
                      : 'bg-white rounded-full px-8 py-3 border border-gray-200 shadow-md shadow-black/5'
            }`}
        >
            <ul
                className={`flex m-0 p-0 list-none relative z-10 ${
                    mobile
                        ? 'flex-col gap-6 w-full'
                        : inlineScroll
                          ? 'flex-row flex-nowrap items-center gap-3 md:gap-4'
                          : 'items-center gap-8'
                }`}
            >
                {navItems.map((item) => {
                    const isActive = activeTab === item.path;
                    const isLogin = item.name === 'Login';

                    // Skip Login on stacked mobile drawer; keep for inline scroll + desktop
                    if (mobile && !inlineScroll && isLogin) return null;

                    return (
                        <li key={item.path} className={`relative z-10 ${mobile ? 'w-full' : ''} ${inlineScroll ? 'shrink-0' : ''}`}>
                            <Link
                                href={item.path}
                                onClick={() => setActiveTab(item.path)}
                                className={`relative block ${isLogin
                                    ? inlineScroll ? 'p-0 shrink-0' : 'p-0 ml-4'
                                    : mobile
                                        ? 'py-3 text-lg font-bold w-full text-center'
                                        : inlineScroll
                                          ? 'py-2 text-[11px] sm:text-xs font-bold tracking-wide uppercase whitespace-nowrap'
                                          : 'text-sm font-bold tracking-wide uppercase'
                                    } transition-all duration-300 ${!isLogin && isActive
                                        ? 'text-gray-800 font-extrabold scale-105'
                                        : !isLogin
                                            ? 'text-gray-700/90 hover:text-gray-900'
                                            : ''
                                    }`}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {isLogin ? (
                                    <div className={`${mobile && !inlineScroll ? 'flex justify-center' : ''}`}>
                                        {inlineScroll ? (
                                            <Image
                                                src="/login-btn-new.png"
                                                alt="Login"
                                                width={88}
                                                height={32}
                                                className="h-8 w-auto object-contain hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <Image
                                                src="/login-btn-new.png"
                                                alt="Login"
                                                width={120}
                                                height={40}
                                                className="h-10 w-auto object-contain hover:scale-105 transition-transform"
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 relative">
                                        <item.icon
                                            className={`${inlineScroll ? 'w-4 h-4 shrink-0' : 'w-5 h-5'} ${isActive ? 'stroke-[2.5px] text-gray-800' : 'stroke-2'}`}
                                        />
                                        <span>{item.name}</span>
                                        {isActive && !mobile && !inlineScroll && (
                                            <motion.div
                                                layoutId="activeGlow"
                                                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-4 bg-orange-400/40 blur-md rounded-full"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        {isActive && !mobile && !inlineScroll && (
                                            <motion.div
                                                layoutId="activeBottomLine"
                                                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] rounded-full"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </div>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
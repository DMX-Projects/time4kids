'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, BookOpen, MapPin, Image as ImageIcon, GraduationCap, Briefcase, LogIn, HelpCircle } from 'lucide-react';

const navItems = [
    { name: 'ABOUT US', mobileLabel: 'About us', path: '/about', icon: Users },
    { name: 'OUR PROGRAMS', mobileLabel: 'Our programs', path: '/programs', icon: BookOpen },
    { name: 'FRANCHISE OPPORTUNITY', mobileLabel: 'Franchise opportunity', path: '/franchise', icon: Briefcase },
    { name: 'LOCATE CENTRE', mobileLabel: 'Locate centre', path: '/locate-centre', icon: MapPin },
    { name: 'ADMISSIONS', mobileLabel: 'Admissions', path: '/admission', icon: GraduationCap },
    { name: 'MEDIA', mobileLabel: 'Media', path: '/gallery', icon: ImageIcon },
    { name: 'FAQ\'S', mobileLabel: 'FAQs', path: '/faq', icon: HelpCircle },
    { name: 'Login', mobileLabel: 'Log in', path: '/login', icon: LogIn },
];

export default function AnimatedNavBar({
    mobile = false,
    onLinkClick,
}: {
    mobile?: boolean;
    /** Close mobile drawer after navigation */
    onLinkClick?: () => void;
}) {
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState(pathname);

    useEffect(() => {
        setActiveTab(pathname);
    }, [pathname]);

    const handleNavClick = (path: string) => {
        setActiveTab(path);
        onLinkClick?.();
    };

    return (
        <div
            className={`relative ${
                mobile
                    ? 'w-full bg-transparent'
                    : 'bg-transparent px-2'
            }`}
        >
            <ul className={`flex ${mobile ? 'flex-col gap-0.5 w-full' : 'flex-nowrap items-center gap-4 lg:gap-6'} m-0 p-0 list-none relative z-10`}>
                {navItems.map((item) => {
                    const isActive = activeTab === item.path;
                    const isLogin = item.name === 'Login';
                    const label = mobile ? item.mobileLabel : item.name;

                    return (
                        <li key={item.path} className={`relative z-10 ${mobile ? 'w-full' : 'shrink-0'}`}>
                            <Link
                                href={item.path}
                                onClick={() => handleNavClick(item.path)}
                                className={`relative ${isLogin
                                    ? mobile
                                        ? `mt-3 flex w-full items-stretch rounded-xl bg-gradient-to-r from-[#ff9933] to-[#ff6633] px-4 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-orange-500/25 transition active:scale-[0.98] hover:from-[#ffa347] hover:to-[#ff7540] ring-2 ${isActive ? 'ring-white/70' : 'ring-white/20'}`
                                        : 'inline-flex items-center p-0 shrink-0'
                                    : mobile
                                        ? 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] w-full font-semibold text-left text-slate-800 normal-case tracking-tight hover:bg-orange-50/90 active:bg-orange-100/80'
                                        : 'block text-sm tracking-wide uppercase font-bold'
                                    } transition-all duration-300 ${!isLogin && isActive
                                        ? mobile
                                            ? 'bg-orange-50 text-slate-900 ring-1 ring-orange-200/80'
                                            : 'text-gray-900 font-extrabold scale-105'
                                        : !isLogin
                                            ? 'text-gray-800 hover:text-gray-900'
                                            : ''
                                    }`}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {isLogin ? (
                                    mobile ? (
                                        <span className="flex w-full items-center justify-center gap-2.5">
                                            <LogIn className="h-5 w-5 shrink-0 opacity-95" strokeWidth={2.25} aria-hidden />
                                            <span>{label}</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <Image
                                                src="/login-btn-new.png"
                                                alt="Login"
                                                width={88}
                                                height={32}
                                                className="h-8 w-auto max-h-8 object-contain object-center hover:opacity-95"
                                            />
                                        </span>
                                    )
                                ) : (
                                    <div className="relative flex min-w-0 flex-nowrap items-center gap-3">
                                        <span
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isActive ? 'bg-orange-100 text-slate-900' : 'bg-slate-100/80 text-slate-600'}`}
                                            aria-hidden
                                        >
                                            <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'stroke-[2.25px]' : 'stroke-2'}`} />
                                        </span>
                                        <span className={`min-w-0 flex-1 leading-snug ${mobile ? '' : 'whitespace-nowrap'}`}>{label}</span>
                                        {/* Active Soft Light Indicator */}
                                        {isActive && !mobile && (
                                            <motion.div
                                                layoutId="activeGlow"
                                                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-4 bg-orange-400/40 blur-md rounded-full"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        {isActive && !mobile && (
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
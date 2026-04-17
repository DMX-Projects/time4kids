'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, BookOpen, MapPin, Image as ImageIcon, GraduationCap, Briefcase, LogIn, HelpCircle } from 'lucide-react';

const navItems = [
    { name: 'ABOUT US', path: '/about', icon: Users },
    { name: 'OUR PROGRAMS', path: '/programs', icon: BookOpen },
    { name: 'FRANCHISE OPPORTUNITY', path: '/franchise', icon: Briefcase },
    { name: 'LOCATE CENTRE', path: '/locate-centre', icon: MapPin },
    { name: 'ADMISSIONS', path: '/admission', icon: GraduationCap },
    { name: 'MEDIA', path: '/media', icon: ImageIcon },
    { name: 'FAQ\'S', path: '/faq', icon: HelpCircle },
    { name: 'Login', path: '/login', icon: LogIn },
];

export default function AnimatedNavBar({ mobile = false }: { mobile?: boolean }) {
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
                    : 'bg-white rounded-full px-6 py-2 sm:px-8 sm:py-2.5 border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
            }`}
        >
            <ul className={`flex ${mobile ? 'flex-col gap-6 w-full' : 'flex-nowrap items-center gap-6 lg:gap-8'} m-0 p-0 list-none relative z-10`}>
                {navItems.map((item) => {
                    const isActive = activeTab === item.path;
                    const isLogin = item.name === 'Login';

                    // Skip Login item on mobile as it's handled separately in Header
                    if (mobile && isLogin) return null;

                    return (
                        <li key={item.path} className={`relative z-10 ${mobile ? 'w-full' : 'shrink-0'}`}>
                            <Link
                                href={item.path}
                                onClick={() => setActiveTab(item.path)}
                                className={`relative ${isLogin
                                    ? 'inline-flex items-center p-0 ml-2 shrink-0 sm:ml-3'
                                    : mobile
                                        ? 'block py-3 text-lg w-full text-center font-bold'
                                        : 'block text-sm tracking-wide uppercase font-bold'
                                    } transition-all duration-300 ${!isLogin && isActive
                                        ? 'text-gray-900 font-extrabold scale-105'
                                        : !isLogin
                                            ? 'text-gray-800 hover:text-gray-900'
                                            : ''
                                    }`}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {isLogin ? (
                                    <span className={`${mobile ? 'flex justify-center' : 'flex items-center'}`}>
                                        <Image
                                            src="/login-btn-new.png"
                                            alt="Login"
                                            width={100}
                                            height={32}
                                            className="h-8 w-auto max-h-8 object-contain object-center hover:opacity-95 sm:h-9 sm:max-h-9"
                                        />
                                    </span>
                                ) : (
                                    <div className="relative flex flex-nowrap items-center gap-2">
                                        <item.icon
                                            className={`w-5 h-5 shrink-0 ${isActive ? 'stroke-[2.5px] text-gray-900' : 'stroke-2 text-gray-600'}`}
                                        />
                                        <span className="whitespace-nowrap">{item.name}</span>
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
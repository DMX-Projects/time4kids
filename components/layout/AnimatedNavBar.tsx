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
    { name: 'FAQ\'S', path: '/faqs', icon: HelpCircle },
    { name: 'Login', path: '/login', icon: LogIn },
];

export default function AnimatedNavBar({ mobile = false }: { mobile?: boolean }) {
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState(pathname);

    useEffect(() => {
        setActiveTab(pathname);
    }, [pathname]);

    return (
        <div className={`relative ${mobile ? 'w-full bg-transparent' : 'bg-white/5 backdrop-blur-md rounded-full px-8 py-3 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'}`}>
            <ul className={`flex ${mobile ? 'flex-col gap-6 w-full' : 'items-center gap-8'} m-0 p-0 list-none relative z-10`}>
                {navItems.map((item) => {
                    const isActive = activeTab === item.path;
                    const isLogin = item.name === 'Login';

                    return (
                        <li key={item.path} className={`relative z-10 ${mobile ? 'w-full' : ''}`}>
                            <Link
                                href={item.path}
                                onClick={() => setActiveTab(item.path)}
                                className={`relative block ${isLogin
                                    ? 'p-0 ml-4'
                                    : mobile
                                        ? 'py-3 text-lg w-full text-center'
                                        : 'text-sm tracking-wide uppercase'
                                    } transition-all duration-300 ${!isLogin && isActive
                                        ? 'text-gray-800 font-extrabold scale-105'
                                        : !isLogin
                                            ? 'text-gray-700/90 font-medium hover:text-gray-900'
                                            : ''
                                    }`}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {isLogin ? (
                                    <div className={`${mobile ? 'flex justify-center' : ''}`}>
                                        <Image
                                            src="/login-btn-new.png"
                                            alt="Login"
                                            width={120}
                                            height={40}
                                            className="h-10 w-auto object-contain hover:scale-105 transition-transform"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 relative">
                                        <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-gray-800' : 'stroke-2'}`} />
                                        <span>{item.name}</span>
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
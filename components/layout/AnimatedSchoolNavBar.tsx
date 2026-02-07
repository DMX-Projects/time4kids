'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Info, BookOpen, GraduationCap, Camera, Phone, Users, Briefcase, MapPin, HelpCircle, Handshake, Backpack } from 'lucide-react';

const schoolNavItems = [
    { name: 'Home', href: '#home', icon: Home },
    { name: 'About Us', href: '#about', icon: Info },
    { name: 'Classes', href: '#programs', icon: BookOpen },
    { name: 'Admissions', href: '#admission', icon: GraduationCap },
    { name: 'Media', href: '#gallery', icon: Camera },
    { name: 'contact us', href: '#contact', icon: Phone },
];

export default function AnimatedSchoolNavBar() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 120; // Offset for fixed header

            const sections = schoolNavItems.map((item, index) => {
                const id = item.href.replace('#', '');
                const element = document.getElementById(id);
                if (element) {
                    return { index, top: element.offsetTop, bottom: element.offsetTop + element.offsetHeight };
                }
                return null;
            }).filter(Boolean) as { index: number, top: number, bottom: number }[];

            const current = sections.find(s => scrollPosition >= s.top && scrollPosition < s.bottom);
            if (current) setActiveIndex(current.index);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="relative bg-white/20 backdrop-blur-md rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.1)] px-8 py-3 border border-white/30">
            <ul className="flex items-center gap-8 m-0 p-0 list-none">
                {schoolNavItems.map((item, index) => {
                    const isActive = activeIndex === index;
                    const Icon = item.icon;

                    return (
                        <li key={item.name} className="relative group">
                            <Link
                                href={item.href}
                                onClick={() => setActiveIndex(index)}
                                className={`flex items-center gap-3 transition-all duration-300 relative z-20 pt-1 pb-0.5 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                                <span className={`text-[12px] font-bold uppercase tracking-wide whitespace-nowrap`}>
                                    {item.name}
                                </span>
                            </Link>

                            {/* Active Indicator (Notch + Ball) */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute -top-[23px] left-0 right-0 flex justify-center pointer-events-none z-10"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    >
                                        <div className="relative w-20 h-10">
                                            {/* Removed the colored notch since header is now transparent */}
                                            <div className="w-full h-full bg-transparent" />


                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </li>
                    );
                })}

                {/* Login Button inside the pill */}
                <li className="flex items-center ml-2">
                    <Link href="/login" className="hover:opacity-90 transition-opacity relative block flex-shrink-0">
                        <div className="relative w-28 h-9">
                            <Image
                                src="/btn-login.png"
                                alt="Login"
                                fill
                                className="object-contain"
                            />
                            <span className="absolute inset-0 flex items-center justify-center pl-6 text-white font-bold text-[11px] tracking-wide">
                                LOGIN
                            </span>
                        </div>
                    </Link>
                </li>
            </ul>
        </div>
    );
}

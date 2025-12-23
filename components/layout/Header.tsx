'use client';

import Image from 'next/image';
import Link from 'next/link';
import GooeyNav from '@/components/ui/GooeyNav';
import { useState, useMemo } from 'react';

const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const menuItems = useMemo(() => [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/about' },
        { label: 'Programs', href: '/programs' },
        { label: 'Admission', href: '/admission' },
        { label: 'Locate Centre', href: '/locate-centre' },
        { label: 'Franchise', href: '/franchise' },
        { label: 'Contact', href: '/contact' },
    ], []);

    const leftNav = useMemo(() => menuItems.slice(0, 4), [menuItems]);
    const rightNav = useMemo(() => menuItems.slice(4), [menuItems]);

    return (
        <header className="sticky top-0 left-0 right-0 z-50 bg-white">
            <div className="container mx-auto px-4 flex items-center justify-between h-20 md:h-24 overflow-visible">
                {/* Left Nav (Desktop) */}
                <div className="hidden lg:flex flex-1 justify-end pr-8">
                    <GooeyNav
                        items={leftNav}
                        textColor={'#333'}
                        pillColor={'#f97316'}
                        activeTextColor={'#ffffff'}
                    />
                </div>

                {/* Logo (Centered) */}
                <div className="flex-shrink-0 px-4">
                    <Link href="/" className="flex items-center">
                        <div className="relative w-32 h-12 md:w-44 md:h-16">
                            <Image src="/logo.jpg" alt="T.I.M.E. Kids" fill className="object-contain" priority />
                        </div>
                    </Link>
                </div>

                {/* Right Nav + Login (Desktop) */}
                <div className="hidden lg:flex flex-1 items-center justify-start pl-8 gap-6">
                    <GooeyNav
                        items={rightNav}
                        textColor={'#333'}
                        pillColor={'#f97316'}
                        activeTextColor={'#ffffff'}
                    />
                    <Link
                        href="/login/"
                        className="btn-base bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-transform hover:scale-105 active:scale-95 px-8 font-bold"
                    >
                        Login
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                    aria-label="Toggle navigation"
                    onClick={() => setMobileOpen(v => !v)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                        {mobileOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" />
                        ) : (
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div id="mobile-nav" aria-hidden="false" className="lg:hidden border-t bg-white absolute top-full left-0 w-full shadow-xl">
                    <div className="container mx-auto px-4 py-6">
                        <ul className="flex flex-col gap-4">
                            {menuItems.map((item, idx) => (
                                <li key={idx}>
                                    <Link
                                        href={item.href}
                                        className="text-lg font-medium text-gray-700 hover:text-orange-500 block"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                            <li className="pt-2 border-t mt-2">
                                <Link
                                    href="/login/"
                                    className="btn-base bg-secondary-blue text-white w-full"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
            {/* Scalloped bottom to visually separate header from hero */}
            <div className="absolute top-[100%] left-0 w-full leading-[0] overflow-hidden pointer-events-none -mt-[1px]">
                <svg
                    className="w-full h-5 block"
                    viewBox="0 0 1200 15"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0,0 H1200 V0 
                           C1185,0 1185,12 1170,12 S1155,0 1140,0 
                           S1125,12 1110,12 S1095,0 1080,0 
                           S1065,12 1050,12 S1035,0 1020,0 
                           S1005,12 990,12 S975,0 960,0 
                           S945,12 930,12 S915,0 900,0 
                           S885,12 870,12 S855,0 840,0 
                           S825,12 810,12 S795,0 780,0 
                           S765,12 750,12 S735,0 720,0 
                           S705,12 690,12 S675,0 660,0 
                           S645,12 630,12 S615,0 600,0 
                           S585,12 570,12 S555,0 540,0 
                           S525,12 510,12 S495,0 480,0 
                           S465,12 450,12 S435,0 420,0 
                           S405,12 390,12 S375,0 360,0 
                           S345,12 330,12 S315,0 300,0 
                           S285,12 270,12 S255,0 240,0 
                           S225,12 210,12 S195,0 180,0 
                           S165,12 150,12 S135,0 120,0 
                           S105,12 90,0 S75,0 60,0 
                           S45,12 30,12 S15,0 0,0 Z"
                        fill="#ffffff"
                    />
                </svg>
            </div>
        </header>
    );
};

export default Header;
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Youtube, MessageCircle, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface SchoolBrandHeaderProps {
    schoolName: string;
    basePath?: string;
    homeUrl?: string;
}

// ... imports remain the same

// Create a reusable floating element component
const FloatingElement = ({ children, delay = 0, duration = 3, className }: { children: React.ReactNode, delay?: number, duration?: number, className?: string }) => (
    <motion.div
        className={className}
        animate={{
            y: [-10, 10, -10],
            rotate: [-5, 5, -5]
        }}
        transition={{
            duration: duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay
        }}
    >
        {children}
    </motion.div>
);

const SchoolBrandHeader = ({ schoolName, basePath = "/", homeUrl }: SchoolBrandHeaderProps) => {
    // ... logic remains same
    const homeLink = homeUrl || (basePath === "/" ? "/" : basePath);

    return (
        <div className="w-full font-sans">
            {/* Top Blue Bar ... */}
            <div className="bg-[#0066cc] text-white py-2 px-4 shadow-sm relative z-30">
                {/* ... content ... */}
                <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between text-sm font-bold">
                    <div className="flex items-center space-x-2">
                        <span>For Admissions:</span>
                        <span className="text-yellow-300">7659002266, 7659003366</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 md:mt-0">
                        <div className="flex space-x-2">
                            <a href="#" className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors"><Facebook className="w-3 h-3" /></a>
                            <a href="#" className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors"><Twitter className="w-3 h-3" /></a>
                            <a href="#" className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors"><Youtube className="w-3 h-3" /></a>
                            <a href="#" className="bg-green-500 p-1.5 rounded-full hover:bg-green-600 transition-colors"><MessageCircle className="w-3 h-3" /></a>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span>Call or Ask Us</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Standard Nav Header ... */}
            <div className="bg-white py-4 relative z-20 shadow-sm">
                <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">
                    <Link href={homeLink}>
                        <div className="relative w-40 h-12">
                            <Image
                                src="/logo.jpg"
                                alt="TIME Kids Logo"
                                fill
                                className="object-contain object-left"
                            />
                        </div>
                    </Link>

                    <div className="md:hidden">
                        <Link href="/login" className="hover:opacity-90 transition-opacity relative block">
                            <div className="relative w-24 h-8">
                                <Image
                                    src="/btn-login.png"
                                    alt="Login"
                                    fill
                                    className="object-contain"
                                />
                                <span className="absolute inset-0 flex items-center justify-center pl-6 text-white font-bold text-[10px] tracking-wide">
                                    LOGIN
                                </span>
                            </div>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
                        <Link href="#home" className="hover:text-primary-600 transition-colors scroll-smooth">Home</Link>
                        <Link href="#about" className="hover:text-primary-600 transition-colors scroll-smooth">About us</Link>
                        <Link href="#admission" className="hover:text-primary-600 transition-colors scroll-smooth">Admissions</Link>
                        <Link href="#programs" className="hover:text-primary-600 transition-colors scroll-smooth">Classes</Link>
                        <Link href="#gallery" className="hover:text-primary-600 transition-colors scroll-smooth">Gallery</Link>
                        <Link href="#contact" className="hover:text-primary-600 transition-colors scroll-smooth">Contact us</Link>

                        <Link href="/login" className="hover:opacity-90 transition-opacity relative block">
                            <div className="relative w-32 h-10">
                                <Image
                                    src="/btn-login.png"
                                    alt="Login"
                                    fill
                                    className="object-contain"
                                />
                                <span className="absolute inset-0 flex items-center justify-center pl-8 text-white font-bold text-sm tracking-wide">
                                    LOGIN
                                </span>
                            </div>
                        </Link>
                    </nav>
                </div>
            </div>



        </div>
    );
};

export default SchoolBrandHeader;

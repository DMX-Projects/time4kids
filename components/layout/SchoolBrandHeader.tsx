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

                    <nav className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
                        <Link href={homeLink} className="hover:text-primary-600 transition-colors">Home</Link>
                        <Link href={`${basePath}/about`} className="hover:text-primary-600 transition-colors">About us</Link>
                        <Link href={`${basePath}/admission`} className="hover:text-primary-600 transition-colors">Admissions</Link>
                        <Link href={`${basePath}/programs`} className="hover:text-primary-600 transition-colors">Classes</Link>
                        <Link href={`${basePath}/gallery`} className="hover:text-primary-600 transition-colors">Gallery</Link>
                        <Link href={`${basePath}/contact`} className="hover:text-primary-600 transition-colors">Contact us</Link>
                    </nav>
                </div>
            </div>


            {/* Teal Banner with Waves */}
            <div className="relative bg-[#68b2b5] min-h-[300px] flex items-center justify-center overflow-hidden">
                {/* Top Wavy Edge (White) - Animated */}
                <div className="absolute top-0 left-0 w-full h-auto pointer-events-none z-10 overflow-hidden">
                    <motion.div
                        className="flex w-[200%]"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            duration: 20,
                            ease: "linear"
                        }}
                    >
                        <svg viewBox="0 0 1440 50" className="w-1/2 h-auto block" preserveAspectRatio="none">
                            <path fill="#ffffff" fillOpacity="1" d="M0,30 C30,10 50,10 80,30 C110,50 130,50 160,30 C190,10 210,10 240,30 C270,50 290,50 320,30 C350,10 370,10 400,30 C430,50 450,50 480,30 C510,10 530,10 560,30 C590,50 610,50 640,30 C670,10 690,10 720,30 C750,50 770,50 800,30 C830,10 850,10 880,30 C910,50 930,50 960,30 C990,10 1010,10 1040,30 C1070,50 1090,50 1120,30 C1150,10 1170,10 1200,30 C1230,50 1250,50 1280,30 C1310,10 1330,10 1360,30 C1390,50 1410,50 1440,30 L1440,0 L0,0 Z"></path>
                        </svg>
                        <svg viewBox="0 0 1440 50" className="w-1/2 h-auto block" preserveAspectRatio="none">
                            <path fill="#ffffff" fillOpacity="1" d="M0,30 C30,10 50,10 80,30 C110,50 130,50 160,30 C190,10 210,10 240,30 C270,50 290,50 320,30 C350,10 370,10 400,30 C430,50 450,50 480,30 C510,10 530,10 560,30 C590,50 610,50 640,30 C670,10 690,10 720,30 C750,50 770,50 800,30 C830,10 850,10 880,30 C910,50 930,50 960,30 C990,10 1010,10 1040,30 C1070,50 1090,50 1120,30 C1150,10 1170,10 1200,30 C1230,50 1250,50 1280,30 C1310,10 1330,10 1360,30 C1390,50 1410,50 1440,30 L1440,0 L0,0 Z"></path>
                        </svg>
                    </motion.div>
                </div>

                {/* Decorative Elements - Animated */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    <FloatingElement delay={0} duration={4} className="absolute top-20 left-[10%] text-white text-6xl font-bold">+</FloatingElement>
                    <FloatingElement delay={1} duration={5} className="absolute top-32 right-[15%] text-yellow-300 text-6xl font-bold">*</FloatingElement>
                    <FloatingElement delay={2} duration={3.5} className="absolute bottom-10 left-[20%] text-green-300 text-4xl font-bold">=</FloatingElement>
                    <FloatingElement delay={0.5} duration={6} className="absolute top-1/2 right-[5%] text-pink-300 text-5xl font-bold">Aa</FloatingElement>
                    <FloatingElement delay={1.5} duration={4.5} className="absolute bottom-20 right-[30%] text-blue-300 text-5xl font-bold">Bb</FloatingElement>
                    <FloatingElement delay={2.5} duration={5.5} className="absolute top-40 left-[30%] text-purple-300 text-5xl font-bold">Cc</FloatingElement>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center text-white mt-8 mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-6xl font-fredoka font-bold drop-shadow-md tracking-wide"
                    >
                        {schoolName}
                    </motion.h1>
                </div>
            </div>
        </div>
    );
};

export default SchoolBrandHeader;

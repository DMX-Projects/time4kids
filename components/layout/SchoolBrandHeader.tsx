"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Youtube, MessageCircle, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedSchoolNavBar from './AnimatedSchoolNavBar';

interface SchoolBrandHeaderProps {
    schoolName: string;
    basePath?: string;
    homeUrl?: string;
    contactPhone?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    youtubeUrl?: string;
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

const SchoolBrandHeader = ({
    schoolName,
    basePath = "/",
    homeUrl,
    contactPhone,
    facebookUrl,
    instagramUrl,
    twitterUrl,
    youtubeUrl
}: SchoolBrandHeaderProps) => {
    const [isSticky, setIsSticky] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const homeLink = homeUrl || (basePath === "/" ? "/" : basePath);

    // Check if any social media links exist
    const hasSocialMedia = facebookUrl || instagramUrl || twitterUrl || youtubeUrl;

    return (
        <div className={`w-full font-sans transition-all duration-300 fixed top-0 left-0 right-0 z-[1000] bg-white`}>
            {/* Top Blue Bar */}
            {!isSticky && (
                <div className="bg-[#0066cc] text-white py-2 px-4 shadow-sm relative z-30">
                    <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between text-sm font-bold">
                        <div className="flex items-center space-x-2">
                            <span>For Admissions:</span>
                            <span className="text-yellow-300">{contactPhone || '7659002266, 7659003366'}</span>
                        </div>
                        {hasSocialMedia && (
                            <div className="flex items-center space-x-4 mt-2 md:mt-0">
                                <div className="flex space-x-2">
                                    {facebookUrl && (
                                        <a
                                            href={facebookUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors"
                                        >
                                            <Facebook className="w-3 h-3" />
                                        </a>
                                    )}
                                    {instagramUrl && (
                                        <a
                                            href={instagramUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors"
                                        >
                                            <MessageCircle className="w-3 h-3" />
                                        </a>
                                    )}
                                    {twitterUrl && (
                                        <a
                                            href={twitterUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors"
                                        >
                                            <Twitter className="w-3 h-3" />
                                        </a>
                                    )}
                                    {youtubeUrl && (
                                        <a
                                            href={youtubeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors"
                                        >
                                            <Youtube className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                                <div className="flex items-center space-x-1">
                                    <span>Call or Ask Us</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Standard Nav Header */}
            <div className={`transition-all duration-300 ${isSticky ? 'py-1 shadow-md' : 'py-2'} relative z-20`}>
                <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">
                    <Link href={homeLink}>
                        <div className="relative w-56 h-16">
                            <Image
                                src="/time-kids-logo-new.png"
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

                    <div className="hidden md:flex items-center space-x-8">
                        <AnimatedSchoolNavBar />
                    </div>
                </div>
            </div>



        </div>
    );
};

export default SchoolBrandHeader;

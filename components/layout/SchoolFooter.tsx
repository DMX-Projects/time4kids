"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, Instagram, Facebook, Twitter, ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface SchoolFooterProps {
    homeUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    contactPhone?: string;
    contactEmail?: string;
}

const SchoolFooter = ({ homeUrl, facebookUrl, instagramUrl, twitterUrl, contactPhone, contactEmail }: SchoolFooterProps) => {
    const homeLink = homeUrl || '/';
    const currentYear = new Date().getFullYear();

    // Check if any social media links exist
    const hasSocialMedia = facebookUrl || instagramUrl || twitterUrl;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <footer className="relative w-full mt-12 font-fredoka overflow-hidden">
            {/* Top Wavy Border */}
            <div className="absolute top-0 left-0 w-full h-[30px] z-20 pointer-events-none">
                <svg viewBox="0 0 1440 30" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                    <path fill="#fff" d="M0,15 C120,5 240,5 360,15 C480,25 600,25 720,15 C840,5 960,5 1080,15 C1200,25 1320,25 1440,15 L1440,0 L0,0 Z"></path>
                    <path fill="#FFD8BE" fillOpacity="0.4" d="M0,20 C120,10 240,10 360,20 C480,30 600,30 720,20 C840,10 960,10 1080,20 C1200,30 1320,30 1440,20 L1440,0 L0,0 Z"></path>
                </svg>
            </div>

            {/* Custom Illustration Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/school-footer.png"
                    alt="Footer Background"
                    fill
                    className="object-cover object-bottom"
                    priority
                />
                {/* Minimal Overlay or subtle gradient to keep characters clear */}
                <div className="absolute inset-0 bg-white/10" />
            </div>

            {/* Floating Back Button */}
            <div className="absolute top-[-20px] left-0 w-full flex justify-center z-20">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                    className="pt-2"
                >
                    <Link
                        href="/"
                        className="group flex items-center gap-2 px-8 py-3 bg-white border-2 border-orange-100 rounded-full text-orange-600 font-bold text-sm shadow-lg hover:shadow-orange-200/50 hover:-translate-y-1 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Main Site</span>
                    </Link>
                </motion.div>
            </div>

            <div className="relative z-10 pt-20 pb-20">
                <div className="container mx-auto px-6 lg:px-8 relative z-10">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 items-start"
                    >
                        {/* 1st Section: Logo & Text */}
                        <motion.div variants={itemVariants} className="space-y-6">
                            <Link href={homeLink} className="inline-block bg-white/60 backdrop-blur-md p-4 rounded-3xl shadow-sm border-2 border-white/40 mb-2">
                                <div className="relative w-40 h-14">
                                    <Image
                                        src="/time-kids-logo-new.png"
                                        alt="T.I.M.E. Kids Logo"
                                        fill
                                        sizes="160px"
                                        className="object-contain"
                                    />
                                </div>
                            </Link>
                            <p className="text-gray-700 text-lg leading-relaxed font-bold">
                                Empowering young minds with broadly based, age-appropriate, and wholesome education. We care for your child's future.
                            </p>
                            {hasSocialMedia && (
                                <div className="flex gap-4 pt-4">
                                    {facebookUrl && (
                                        <motion.a
                                            href={facebookUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ y: -5, scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-500 hover:text-white shadow-sm transition-colors border border-white/40 hover:bg-[#1877F2] hover:border-[#1877F2]"
                                        >
                                            <Facebook className="w-5 h-5" />
                                        </motion.a>
                                    )}
                                    {instagramUrl && (
                                        <motion.a
                                            href={instagramUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ y: -5, scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-500 hover:text-white shadow-sm transition-colors border border-white/40 hover:bg-[#E4405F] hover:border-[#E4405F]"
                                        >
                                            <Instagram className="w-5 h-5" />
                                        </motion.a>
                                    )}
                                    {twitterUrl && (
                                        <motion.a
                                            href={twitterUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ y: -5, scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-500 hover:text-white shadow-sm transition-colors border border-white/40 hover:bg-[#1DA1F2] hover:border-[#1DA1F2]"
                                        >
                                            <Twitter className="w-5 h-5" />
                                        </motion.a>
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* 2nd Section: Quick Links */}
                        <motion.div variants={itemVariants} className="lg:pl-8 space-y-6">
                            <h4 className="text-2xl font-bold text-[#FF6B35] mb-6 drop-shadow-sm">Quick Links</h4>
                            <ul className="space-y-4">
                                {[
                                    { name: 'Home', href: '#home' },
                                    { name: 'About Us', href: '#about' },
                                    { name: 'Classes', href: '#programs' },
                                    { name: 'Admission', href: '#admission' },
                                    { name: 'Gallery', href: '#gallery' },
                                ].map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-800 hover:text-[#FF6B35] font-bold text-lg flex items-center group transition-colors"
                                        >
                                            <span className="mr-3 text-[#FF6B35] group-hover:translate-x-1 transition-transform">→</span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* 3rd Section: Our Programs */}
                        <motion.div variants={itemVariants} className="space-y-6">
                            <h4 className="text-2xl font-bold text-[#2E8B57] mb-6 drop-shadow-sm">Our Programs</h4>
                            <ul className="space-y-5">
                                {[
                                    { name: 'Play Group', color: 'bg-[#ffebf5] text-[#d63384]', initial: 'P' },
                                    { name: 'Nursery', color: 'bg-[#f3eaff] text-[#6f42c1]', initial: 'N' },
                                    { name: 'Pre-Primary I', color: 'bg-[#e7f3ff] text-[#0d6efd]', initial: 'P' },
                                    { name: 'Pre-Primary II', color: 'bg-[#ecf9f2] text-[#198754]', initial: 'P' },
                                    { name: 'Day Care', color: 'bg-[#fff9e6] text-[#ffc107]', initial: 'D' }
                                ].map((item) => (
                                    <li key={item.name} className="flex items-center gap-4 group cursor-default">
                                        <span className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-sm font-black shadow-sm group-hover:scale-110 transition-transform`}>
                                            {item.initial}
                                        </span>
                                        <span className="text-gray-800 font-bold text-lg group-hover:text-gray-900 transition-colors">{item.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* 4th Section: Get in Touch */}
                        <motion.div variants={itemVariants} className="space-y-6">
                            <h4 className="text-2xl font-bold text-[#1E90FF] mb-6 drop-shadow-sm">Get in Touch</h4>
                            <div className="space-y-4">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center gap-5 bg-white p-5 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all border border-gray-50"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#ecf9f2] flex items-center justify-center text-[#198754] flex-shrink-0">
                                        <Phone size={22} className="fill-current" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">PHONE</p>
                                        <p className="text-[#2D3142] font-black text-xl">{contactPhone || '+91 99994 88885'}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center gap-5 bg-white p-5 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all border border-gray-50"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#e7f3ff] flex items-center justify-center text-[#0d6efd] flex-shrink-0">
                                        <Mail size={22} className="fill-current" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">EMAIL</p>
                                        <p className="text-[#2D3142] font-black text-sm break-all font-sans">{contactEmail || 'info@timekidspreschools.in'}</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div >
            </div >

            {/* Copyright Bar style */}
            < div className="bg-transparent border-t border-white/10 py-6 relative z-10" >
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex-1" /> {/* Spacer */}

                    <p className="text-base font-medium text-gray-500 flex items-center gap-2">
                        <span>© {currentYear} T.I.M.E. Kids</span>
                        <Heart className="w-4 h-4 text-red-400 fill-current" />
                        <span>All Rights Reserved.</span>
                    </p>

                    <div className="flex-1 flex justify-end gap-2 text-base font-medium text-gray-500">
                        <Link href="/privacy" className="hover:text-gray-800 transition-colors">Privacy Policy</Link>
                        <span>|</span>
                        <Link href="/terms" className="hover:text-gray-800 transition-colors">Terms of Use</Link>
                    </div>
                </div>
            </div >
        </footer >
    );
};

export default SchoolFooter;

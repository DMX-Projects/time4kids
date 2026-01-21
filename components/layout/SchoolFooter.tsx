"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, Instagram, Facebook, Twitter, ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface SchoolFooterProps {
    homeUrl?: string;
}

const SchoolFooter = ({ homeUrl }: SchoolFooterProps) => {
    const homeLink = homeUrl || '/';
    const currentYear = new Date().getFullYear();

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
        <footer className="relative w-full bg-[#fff9f0] mt-32 font-fredoka">

            {/* Animated Scrolling Waves - Top Decoration */}
            <div className="absolute top-[-50px] left-0 w-full h-[50px] overflow-hidden leading-none rotate-180 z-10">
                {/* Background Wave (Orange Accent) */}
                <motion.div
                    className="absolute top-0 left-0 flex w-[200%] h-full opacity-40 z-0"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                >
                    <svg viewBox="0 0 1440 50" className="w-1/2 h-full block" preserveAspectRatio="none">
                        <path fill="#fb923c" fillOpacity="1" d="M0,30 C30,10 50,10 80,30 C110,50 130,50 160,30 C190,10 210,10 240,30 C270,50 290,50 320,30 C350,10 370,10 400,30 C430,50 450,50 480,30 C510,10 530,10 560,30 C590,50 610,50 640,30 C670,10 690,10 720,30 C750,50 770,50 800,30 C830,10 850,10 880,30 C910,50 930,50 960,30 C990,10 1010,10 1040,30 C1070,50 1090,50 1120,30 C1150,10 1170,10 1200,30 C1230,50 1250,50 1280,30 C1310,10 1330,10 1360,30 C1390,50 1410,50 1440,30 L1440,50 L0,50 Z"></path>
                    </svg>
                    <svg viewBox="0 0 1440 50" className="w-1/2 h-full block" preserveAspectRatio="none">
                        <path fill="#fb923c" fillOpacity="1" d="M0,30 C30,10 50,10 80,30 C110,50 130,50 160,30 C190,10 210,10 240,30 C270,50 290,50 320,30 C350,10 370,10 400,30 C430,50 450,50 480,30 C510,10 530,10 560,30 C590,50 610,50 640,30 C670,10 690,10 720,30 C750,50 770,50 800,30 C830,10 850,10 880,30 C910,50 930,50 960,30 C990,10 1010,10 1040,30 C1070,50 1090,50 1120,30 C1150,10 1170,10 1200,30 C1230,50 1250,50 1280,30 C1310,10 1330,10 1360,30 C1390,50 1410,50 1440,30 L1440,50 L0,50 Z"></path>
                    </svg>
                </motion.div>

                {/* Foreground Wave (Footer Color) */}
                <motion.div
                    className="absolute top-0 left-0 flex w-[200%] h-full z-10"
                    animate={{ x: ["-50%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                >
                    <svg viewBox="0 0 1440 50" className="w-1/2 h-full block" preserveAspectRatio="none">
                        <path fill="#fff9f0" fillOpacity="1" d="M0,30 C30,10 50,10 80,30 C110,50 130,50 160,30 C190,10 210,10 240,30 C270,50 290,50 320,30 C350,10 370,10 400,30 C430,50 450,50 480,30 C510,10 530,10 560,30 C590,50 610,50 640,30 C670,10 690,10 720,30 C750,50 770,50 800,30 C830,10 850,10 880,30 C910,50 930,50 960,30 C990,10 1010,10 1040,30 C1070,50 1090,50 1120,30 C1150,10 1170,10 1200,30 C1230,50 1250,50 1280,30 C1310,10 1330,10 1360,30 C1390,50 1410,50 1440,30 L1440,50 L0,50 Z"></path>
                    </svg>
                    <svg viewBox="0 0 1440 50" className="w-1/2 h-full block" preserveAspectRatio="none">
                        <path fill="#fff9f0" fillOpacity="1" d="M0,30 C30,10 50,10 80,30 C110,50 130,50 160,30 C190,10 210,10 240,30 C270,50 290,50 320,30 C350,10 370,10 400,30 C430,50 450,50 480,30 C510,10 530,10 560,30 C590,50 610,50 640,30 C670,10 690,10 720,30 C750,50 770,50 800,30 C830,10 850,10 880,30 C910,50 930,50 960,30 C990,10 1010,10 1040,30 C1070,50 1090,50 1120,30 C1150,10 1170,10 1200,30 C1230,50 1250,50 1280,30 C1310,10 1330,10 1360,30 C1390,50 1410,50 1440,30 L1440,50 L0,50 Z"></path>
                    </svg>
                </motion.div>
            </div>

            {/* Floating Back Button */}
            <div className="absolute top-[-24px] left-0 w-full flex justify-center z-20">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, type: "spring" }}
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

            {/* Decorative Background Elements */}
            <div className="absolute top-40 right-10 w-32 h-32 bg-yellow-200/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-10 w-40 h-40 bg-pink-200/40 rounded-full blur-3xl animate-pulse delay-700"></div>


            <div className="relative pt-16 pb-12">
                <div className="container mx-auto px-6 lg:px-8 relative z-10">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8"
                    >

                        {/* Brand Column */}
                        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
                            <Link href={homeLink} className="inline-block bg-white p-4 rounded-3xl shadow-sm rotate-[-2deg] hover:rotate-0 transition-transform duration-300 border-2 border-orange-50">
                                <div className="relative w-40 h-14">
                                    <Image
                                        src="/logo.jpg"
                                        alt="T.I.M.E. Kids Logo"
                                        fill
                                        sizes="160px"
                                        className="object-contain"
                                    />
                                </div>
                            </Link>
                            <p className="text-gray-600 text-base leading-relaxed font-medium max-w-sm">
                                Empowering young minds with broadly based, age-appropriate, and wholesome education. We care for your child's future.
                            </p>
                            <div className="flex gap-4 pt-2">
                                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                                    <motion.a
                                        key={i}
                                        href="#"
                                        whileHover={{ y: -5, scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-white shadow-sm transition-colors border-2 border-gray-100
                                            ${i === 0 ? 'hover:bg-[#1877F2] hover:border-[#1877F2]' : ''}
                                            ${i === 1 ? 'hover:bg-[#E4405F] hover:border-[#E4405F]' : ''}
                                            ${i === 2 ? 'hover:bg-[#1DA1F2] hover:border-[#1DA1F2]' : ''}
                                        `}
                                    >
                                        <Icon size={20} />
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div variants={itemVariants} className="lg:col-span-1 lg:pl-8">
                            <h4 className="text-2xl font-bold text-orange-500 mb-6 drop-shadow-sm">Quick Links</h4>
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
                                            className="text-gray-600 hover:text-orange-500 font-bold text-base flex items-center group transition-colors"
                                        >
                                            <ArrowRight className="w-4 h-4 mr-2 text-orange-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Programs */}
                        <motion.div variants={itemVariants} className="lg:col-span-1">
                            <h4 className="text-2xl font-bold text-green-500 mb-6 drop-shadow-sm">Our Programs</h4>
                            <ul className="space-y-3">
                                {[
                                    { name: 'Play Group', color: 'bg-pink-100 text-pink-600' },
                                    { name: 'Nursery', color: 'bg-purple-100 text-purple-600' },
                                    { name: 'Pre-Primary I', color: 'bg-blue-100 text-blue-600' },
                                    { name: 'Pre-Primary II', color: 'bg-green-100 text-green-600' },
                                    { name: 'Day Care', color: 'bg-yellow-100 text-yellow-600' }
                                ].map((item) => (
                                    <li key={item.name} className="flex items-center gap-3 group cursor-default">
                                        <span className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-xs font-black shadow-sm group-hover:scale-110 transition-transform`}>
                                            {item.name[0]}
                                        </span>
                                        <span className="text-gray-600 font-bold group-hover:text-gray-900 transition-colors">{item.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Contact Preview */}
                        <motion.div variants={itemVariants} className="lg:col-span-1">
                            <h4 className="text-2xl font-bold text-blue-500 mb-6 drop-shadow-sm">Get in Touch</h4>
                            <div className="space-y-6">
                                <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    href="tel:+919999488885"
                                    className="flex items-center gap-4 group bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 hover:shadow-md transition-all"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors flex-shrink-0 shadow-inner">
                                        <Phone size={20} className="fill-current" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider mb-0.5">Phone</p>
                                        <p className="text-gray-800 font-bold group-hover:text-green-600 transition-colors md:text-lg">+91 99994 88885</p>
                                    </div>
                                </motion.a>

                                <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    href="mailto:info@timekidspreschools.in"
                                    className="flex items-center gap-4 group bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors flex-shrink-0 shadow-inner">
                                        <Mail size={20} className="fill-current" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider mb-0.5">Email</p>
                                        <p className="text-gray-800 font-bold group-hover:text-blue-600 transition-colors break-all">info@timekidspreschools.in</p>
                                    </div>
                                </motion.a>
                            </div>
                        </motion.div>

                    </motion.div>
                </div>
            </div>

            {/* Copyright Bar style */}
            <div className="bg-white border-t-2 border-dashed border-gray-200 py-8 relative z-10">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm font-bold text-gray-400 flex items-center gap-2">
                        <span>© {currentYear} T.I.M.E. Kids</span>
                        <Heart className="w-4 h-4 text-red-400 fill-current animate-pulse" />
                        <span>All Rights Reserved.</span>
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-sm font-bold text-gray-400 hover:text-orange-500 transition-colors underline decoration-dotted underline-offset-4">Privacy Policy</Link>
                        <Link href="/terms" className="text-sm font-bold text-gray-400 hover:text-orange-500 transition-colors underline decoration-dotted underline-offset-4">Terms of Use</Link>
                    </div>
                </div>
            </div>

            {/* Rainbow Bottom Bar */}
            <div className="h-3 w-full bg-gradient-to-r from-[#fc5c7d] via-[#6a82fb] to-[#38ef7d]"></div>
        </footer>
    );
};

export default SchoolFooter;

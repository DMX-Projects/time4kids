"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MessageCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const SchoolFooter = () => {
    return (
        <footer className="relative w-full overflow-hidden bg-white mt-12">
            {/* Back to Main Site Navigation - Kept above the visual elements */}
            <div className="flex justify-center pb-12 bg-white relative z-10">
                <Link
                    href="/"
                    className="group flex items-center space-x-2 px-6 py-3 bg-white border-2 border-green-500 rounded-full text-green-700 font-bold max-w-xs hover:bg-green-50 transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                    <div className="bg-green-100 p-1.5 rounded-full">
                        <ArrowLeft className="w-4 h-4 text-green-700" />
                    </div>
                    <span>Back to Main Site</span>
                </Link>
            </div>

            {/* Grass Top Decoration */}
            <div className="absolute top-[80px] left-0 w-full h-[60px] z-10">
                {/* Repeating Grass SVG pattern */}
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320' preserveAspectRatio='none'%3E%3Cpath fill='%234ade80' fill-opacity='1' d='M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'bottom',
                    backgroundRepeat: 'no-repeat'
                }}></div>
            </div>

            {/* Main Footer Body with Gradient (Grass Green to Soil Brown) */}
            <div className="bg-gradient-to-b from-green-500 via-[#689f38] to-[#5d4037] text-white pt-32 pb-12 px-6 relative">
                {/* Visual Grass Top Overlay (extra layer for depth if needed, or just rely on gradient) */}

                <div className="container mx-auto max-w-7xl relative z-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                        {/* About Us Section */}
                        <div className="space-y-4">
                            <h3 className="font-fredoka text-3xl font-bold text-yellow-300 drop-shadow-sm">About us</h3>
                            <p className="text-sm leading-relaxed text-white font-medium opacity-90">
                                A good school plays an important role in the development of a child. It's the light that helps us choose the right path in the various walks of life. I am glad that I found T.I.M.E. Kids for my daughter. In just three months there has been a lot of development in Nandika, especially with respect to her linguistic skills and social skills. I like the way kids are handled and education is imparted at T.I.M.E. Kids. Thanks to all the wonderful teachers for enabling such remarkable change in my child.
                            </p>
                        </div>

                        {/* Quick Links Section */}
                        <div className="space-y-4 md:pl-12">
                            <h3 className="font-fredoka text-3xl font-bold text-yellow-300 drop-shadow-sm">Quick Links</h3>
                            <ul className="grid grid-cols-1 gap-2 font-bold text-base">
                                <li><Link href="/" className="hover:text-yellow-200 transition-colors">Home</Link></li>
                                <li><Link href="/about" className="hover:text-yellow-200 transition-colors">About us</Link></li>
                                <li><Link href="/admission" className="hover:text-yellow-200 transition-colors">Admissions</Link></li>
                                <li><Link href="/programs" className="hover:text-yellow-200 transition-colors">Classes</Link></li>
                                <li><Link href="/gallery" className="hover:text-yellow-200 transition-colors">Gallery</Link></li>
                                <li><Link href="/contact" className="hover:text-yellow-200 transition-colors">Contact us</Link></li>
                            </ul>
                        </div>

                        {/* Questions Section */}
                        <div className="space-y-6">
                            <h3 className="font-fredoka text-3xl font-bold text-yellow-300 drop-shadow-sm">Questions?</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <MessageCircle className="w-6 h-6 text-yellow-300" />
                                    <a href="tel:+919999488885" className="text-xl font-bold hover:text-yellow-200 transition-colors">+91 99994 88885</a>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-6 h-6 text-yellow-300" />
                                    <a href="mailto:timekids.hyd@gmail.com" className="text-lg font-bold hover:text-yellow-200 transition-colors truncate">timekids.hyd@gmail.com</a>
                                </div>
                            </div>

                            {/* Logo */}
                            <div className="pt-4">
                                <Link href="/">
                                    <div className="bg-white p-4 rounded-xl inline-block shadow-lg -rotate-2 hover:rotate-0 transition-transform duration-300">
                                        <div className="relative w-40 h-10">
                                            <Image
                                                src="/logo.jpg"
                                                alt="Time Kids Logo"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-800 font-bold mt-1 text-center italic">The pre-school that cares</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Wavy Edge (Sand/White) - Animated */}
            <div className="relative w-full h-auto bg-[#5d4037] overflow-hidden">
                <motion.div
                    className="flex w-[200%]"
                    animate={{ x: ["-50%", "0%"] }}
                    transition={{
                        repeat: Infinity,
                        duration: 20,
                        ease: "linear"
                    }}
                >
                    <svg viewBox="0 0 1440 50" className="w-1/2 h-auto block" preserveAspectRatio="none">
                        <path fill="#ffffff" fillOpacity="1" d="M0,30 C30,10 50,10 80,30 C110,50 130,50 160,30 C190,10 210,10 240,30 C270,50 290,50 320,30 C350,10 370,10 400,30 C430,50 450,50 480,30 C510,10 530,10 560,30 C590,50 610,50 640,30 C670,10 690,10 720,30 C750,50 770,50 800,30 C830,10 850,10 880,30 C910,50 930,50 960,30 C990,10 1010,10 1040,30 C1070,50 1090,50 1120,30 C1150,10 1170,10 1200,30 C1230,50 1250,50 1280,30 C1310,10 1330,10 1360,30 C1390,50 1410,50 1440,30 L1440,50 L0,50 Z"></path>
                    </svg>
                    <svg viewBox="0 0 1440 50" className="w-1/2 h-auto block" preserveAspectRatio="none">
                        <path fill="#ffffff" fillOpacity="1" d="M0,30 C30,10 50,10 80,30 C110,50 130,50 160,30 C190,10 210,10 240,30 C270,50 290,50 320,30 C350,10 370,10 400,30 C430,50 450,50 480,30 C510,10 530,10 560,30 C590,50 610,50 640,30 C670,10 690,10 720,30 C750,50 770,50 800,30 C830,10 850,10 880,30 C910,50 930,50 960,30 C990,10 1010,10 1040,30 C1070,50 1090,50 1120,30 C1150,10 1170,10 1200,30 C1230,50 1250,50 1280,30 C1310,10 1330,10 1360,30 C1390,50 1410,50 1440,30 L1440,50 L0,50 Z"></path>
                    </svg>
                </motion.div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="bg-white py-4 text-center">
                <p className="text-[10px] md:text-sm font-bold text-gray-500 tracking-wider">
                    © {new Date().getFullYear()} ALL RIGHTS RESERVED T.I.M.E. (TRIUMPHANT INSTITUTE OF MANAGEMENT EDUCATION PVT. LTD.)
                </p>
            </div>

        </footer>
    );
};

export default SchoolFooter;

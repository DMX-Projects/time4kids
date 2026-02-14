'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AdmissionForm from '@/components/admission/AdmissionForm';
import { Sparkles, Star } from 'lucide-react';
import Image from 'next/image';

interface AdmissionSectionProps {
    franchiseSlug?: string;
    city?: string;
    contactPhone?: string;
}

const FloatingElement = ({ children, className, delay = 0, duration = 4 }: { children: React.ReactNode, className: string, delay?: number, duration?: number }) => (
    <motion.div
        className={className}
        initial={{ y: 0, opacity: 0 }}
        animate={{
            y: [0, -20, 0],
            opacity: [0.6, 1, 0.6],
        }}
        transition={{
            duration: duration,
            repeat: Infinity,
            repeatType: "reverse",
            delay: delay,
            ease: "easeInOut"
        }}
    >
        {children}
    </motion.div>
);

const SparkleElement = ({ delay = 0, size = 24, top, left, right }: { delay?: number, size?: number, top?: string, left?: string, right?: string }) => (
    <motion.div
        className="absolute"
        style={{ top, left, right }}
        animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 1, 0.4],
            rotate: [0, 180, 360],
        }}
        transition={{
            duration: 3,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut"
        }}
    >
        <Sparkles size={size} className="text-yellow-400" fill="currentColor" />
    </motion.div>
);

const StarElement = ({ delay = 0, size = 16, top, left, right }: { delay?: number, size?: number, top?: string, left?: string, right?: string }) => (
    <motion.div
        className="absolute"
        style={{ top, left, right }}
        animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
            rotate: [0, 90, 0],
        }}
        transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut"
        }}
    >
        <Star size={size} className="text-yellow-400" fill="currentColor" />
    </motion.div>
);

const PaperPlane = () => (
    <motion.div
        className="absolute top-[15%] right-[8%]"
        animate={{
            x: [0, -150, -300],
            y: [0, -30, -60],
        }}
        transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
        }}
    >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="opacity-70">
            <path d="M10 40L70 10L50 70L40 50L10 40Z" fill="#7DD3FC" stroke="#0EA5E9" strokeWidth="2" strokeLinejoin="round" />
            <motion.path
                d="M40 50L70 10"
                stroke="#0EA5E9"
                strokeWidth="2"
                strokeDasharray="4 4"
                animate={{ strokeDashoffset: [0, -8] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
        </svg>
    </motion.div>
);

const Cloud = ({ className, size = 120 }: { className: string, size?: number }) => (
    <svg width={size} height={size * 0.6} viewBox="0 0 200 120" className={className}>
        <path
            d="M160 60c0-11-9-20-20-20-1 0-2 0-3 0-3-17-18-30-36-30-15 0-28 9-33 22-1 0-2 0-3 0-14 0-25 11-25 25s11 25 25 25h90c11 0 20-9 20-20 0-11-9-20-20-20 3-6 5-12 5-18z"
            fill="currentColor"
            opacity="0.3"
        />
    </svg>
);

const WavyLine = () => (
    <svg width="100%" height="80" viewBox="0 0 1200 80" preserveAspectRatio="none" className="absolute top-[25%] left-0 w-full opacity-40">
        <path
            d="M0,40 Q300,10 600,40 T1200,40"
            stroke="#FCD34D"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
        />
        <motion.path
            d="M0,50 Q300,20 600,50 T1200,50"
            stroke="#FCA5A5"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="10 10"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
    </svg>
);

export default function AdmissionSection({ franchiseSlug, city, contactPhone }: AdmissionSectionProps) {
    return (
        <section id="admission" className="py-24 relative overflow-hidden scroll-mt-24"
            style={{
                background: 'linear-gradient(180deg, #FFF5E6 0%, #FFE8CC 50%, #FFF5E6 100%)'
            }}
        >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Clouds */}
                <FloatingElement className="absolute top-[10%] left-[5%] text-orange-200" delay={0}>
                    <Cloud size={150} className="opacity-40" />
                </FloatingElement>
                <FloatingElement className="absolute top-[15%] right-[10%] text-pink-200" delay={1.5}>
                    <Cloud size={120} className="opacity-40" />
                </FloatingElement>
                <FloatingElement className="absolute top-[50%] left-[3%] text-yellow-200" delay={2.5}>
                    <Cloud size={100} className="opacity-30" />
                </FloatingElement>

                {/* Wavy Lines */}
                <WavyLine />

                {/* Stars and Sparkles - Scattered around */}
                <SparkleElement delay={0} size={28} top="8%" left="25%" />
                <SparkleElement delay={0.5} size={20} top="12%" left="30%" />
                <SparkleElement delay={1} size={32} top="10%" right="25%" />
                <SparkleElement delay={1.5} size={24} top="8%" right="30%" />
                <SparkleElement delay={2} size={20} top="15%" right="35%" />

                <StarElement delay={0.3} size={20} top="20%" left="15%" />
                <StarElement delay={0.8} size={16} top="18%" left="20%" />
                <StarElement delay={1.3} size={24} top="22%" right="18%" />
                <StarElement delay={1.8} size={18} top="25%" right="22%" />

                {/* Bottom decorative sparkles/stars */}
                <SparkleElement delay={0.5} size={24} top="75%" left="12%" />
                <SparkleElement delay={1.2} size={20} top="80%" right="15%" />
                <StarElement delay={0.7} size={22} top="78%" left="18%" />
                <StarElement delay={1.5} size={18} top="82%" right="20%" />

                {/* Paper Plane */}
                <PaperPlane />

                {/* Small floating circles/dots */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={`circle-${i}`}
                        className="absolute w-3 h-3 rounded-full bg-yellow-300/40"
                        style={{
                            top: `${20 + Math.random() * 60}%`,
                            left: `${10 + Math.random() * 80}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.3, 0.7, 0.3],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-6xl font-fredoka font-black text-[#1a1a3e] mb-6 tracking-tight"
                    >
                        Admissions Open
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-gray-600 font-medium font-outfit"
                    >
                        Join the T.I.M.E. Kids family today!
                    </motion.p>
                </div>

                {/* Form Container with Characters */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-7xl mx-auto relative"
                >
                    {/* Left Character - Teddy Bear */}
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="absolute -left-4 md:-left-12 lg:-left-20 bottom-0 z-20 w-32 md:w-40 lg:w-48 hidden sm:block"
                    >
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Image
                                src="/teddy-bear.png"
                                alt="Teddy Bear"
                                width={200}
                                height={200}
                                className="w-full h-auto drop-shadow-2xl"
                            />
                        </motion.div>
                    </motion.div>

                    {/* Form Card */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border-[6px] border-white p-6 md:p-10 lg:p-12 relative">
                        {/* Small decorative sparkles around form */}
                        <SparkleElement delay={0.5} size={20} top="5%" right="8%" />
                        <SparkleElement delay={1} size={16} top="50%" left="2%" />
                        <StarElement delay={0.8} size={18} top="30%" right="3%" />

                        <AdmissionForm franchiseSlug={franchiseSlug} defaultCity={city} contactPhone={contactPhone} />
                    </div>
                </motion.div>
            </div>

            {/* Bottom Grass/Plants */}
            <div className="absolute bottom-0 left-0 w-full h-24 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 1200 100" preserveAspectRatio="none">
                    <path
                        d="M0,60 Q100,40 200,60 T400,60 T600,60 T800,60 T1000,60 T1200,60 L1200,100 L0,100 Z"
                        fill="#86C18C"
                        opacity="0.3"
                    />
                    <path
                        d="M0,70 Q150,50 300,70 T600,70 T900,70 T1200,70 L1200,100 L0,100 Z"
                        fill="#7AB87F"
                        opacity="0.4"
                    />
                </svg>
            </div>
        </section>
    );
}
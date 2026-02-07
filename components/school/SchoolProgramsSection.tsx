'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
    Music,
    Palette,
    BookOpen,
    Star,
    Heart,
    Cloud,
    Sparkles,
    Sun,
    Layers,
    FlaskConical
} from 'lucide-react';

const programs = [
    {
        id: 1,
        title: 'Play Group',
        icon: Music,
        age: '1.5 - 2.5 YEARS',
        description: 'Sensory play, music, and social skills.',
        themeColor: '#FF6F91',
        bgColor: 'bg-[#FFF0F3]',
        borderColor: 'border-[#FFB8C9]',
        iconColor: 'text-[#FF6F91]',
        image: '/1.png'
    },
    {
        id: 2,
        title: 'Nursery',
        icon: Palette,
        age: '2.5 - 3.5 YEARS',
        description: 'Curiosity, language, and creativity.',
        themeColor: '#9B6BFF',
        bgColor: 'bg-[#F5F0FF]',
        borderColor: 'border-[#D8C4FF]',
        iconColor: 'text-[#9B6BFF]',
        image: '/2 (1).png'
    },
    {
        id: 3,
        title: 'Pre-Primary',
        icon: BookOpen,
        age: '3.5 - 4.5 YEARS',
        description: 'Phonics, writing, and numbers.',
        themeColor: '#4ADE80',
        bgColor: 'bg-[#F0FFF4]',
        borderColor: 'border-[#B2F5C9]',
        iconColor: 'text-[#4ADE80]',
        image: '/2.png'
    },
    {
        id: 4,
        title: 'Pre-Primary',
        icon: Star,
        age: '4.5 - 5.5 YEARS',
        description: 'Math, science, and school readiness.',
        themeColor: '#FDBA74',
        bgColor: 'bg-[#FFF7ED]',
        borderColor: 'border-[#FFD8B1]',
        iconColor: 'text-[#FDBA74]',
        image: '/16.png'
    },
    {
        id: 5,
        title: 'Day Care',
        icon: Heart,
        age: '1.5 - 10 YEARS',
        description: 'Safe, loving care with homework help.',
        themeColor: '#60A5FA',
        bgColor: 'bg-[#EFF6FF]',
        borderColor: 'border-[#BEE3FF]',
        iconColor: 'text-[#60A5FA]',
        image: '/day care.png'
    }
];

const FloatingElement = ({ children, delay = 0, duration = 4, className }: any) => (
    <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
        className={className}
    >
        {children}
    </motion.div>
);

const SchoolProgramsSection = () => {
    return (
        <section id="programs" className="relative py-28 px-4 overflow-hidden min-h-screen flex items-center">
            {/* New Illustrative Background Image */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <Image
                    src="/classes-bg.png"
                    alt="Background"
                    fill
                    className="object-cover object-bottom opacity-90"
                    priority
                />
                {/* Subtle overlay to ensure text readability if needed */}
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white/20 to-transparent" />
            </div>

            <div className="container mx-auto relative z-10 max-w-7xl">
                {/* Header Sub-Section */}
                <div className="text-center mb-16 space-y-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center gap-4"
                    >
                        <Sparkles className="text-[#FFB1B1] w-6 h-6" />
                        <h2 className="text-5xl md:text-6xl font-fredoka font-black text-[#5C4D82]">
                            Our Classes
                        </h2>
                        <Sparkles className="text-[#FFB1B1] w-6 h-6" />
                    </motion.div>

                    <motion.h3
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-3xl md:text-4xl font-fredoka font-bold text-[#2D2D52]"
                    >
                        Learning Pathways
                    </motion.h3>

                    <motion.p
                        className="text-[#6B7280] font-medium max-w-2xl mx-auto text-lg"
                    >
                        Curated programs for every stage of your child's early years.
                    </motion.p>
                </div>

                {/* Programs Horizontal List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                    {programs.map((program, index) => (
                        <motion.div
                            key={program.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            whileHover={{ y: -10 }}
                            className={`flex flex-col rounded-[3.5rem] border-[3px] ${program.borderColor} ${program.bgColor} overflow-hidden shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] transition-all h-full bg-white/60 backdrop-blur-sm`}
                        >
                            {/* Center Image with Inset look */}
                            <div className="mx-4 mt-8 relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border-[6px] border-white shadow-inner bg-gray-100">
                                <Image
                                    src={program.image}
                                    alt={program.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)] pointer-events-none" />
                            </div>

                            {/* Card Body Information */}
                            <div className="p-8 text-center flex flex-col flex-grow bg-white/40">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <h5 className="text-lg font-fredoka font-bold text-[#2D2D52]">
                                        {program.title === 'Pre-Primary' ? `${program.title} ${program.id - 2}` : program.title}
                                    </h5>
                                    <program.icon className={`${program.iconColor} w-5 h-5`} strokeWidth={2.5} />
                                </div>
                                <div className={`text-[11px] font-bold ${program.iconColor} mb-4 tracking-tighter`}>
                                    {program.age}
                                </div>
                                <p className="text-[14px] text-[#4B5563] font-medium leading-relaxed">
                                    {program.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>



            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
            `}</style>
        </section>
    );
};

export default SchoolProgramsSection;

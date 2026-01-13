"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Music, Palette, BookOpen, Star, Heart } from 'lucide-react';

const programs = [
    {
        image: '/1.png',
        name: 'Play Group',
        ageGroup: '1.5 - 2.5 years',
        description: 'Sensory play, music, and social skills.',
        colorStart: 'from-[#FF9A9E]',
        colorEnd: 'to-[#FECFEF]',
        accent: 'text-pink-500',
        bg: 'bg-pink-50',
        borderColor: 'border-pink-100',
        icon: Music,
    },
    {
        image: '/2 (1).png', // Using the same path as Programs Page
        name: 'Nursery',
        ageGroup: '2.5 - 3.5 years',
        description: 'Curiosity, language, and creativity.',
        colorStart: 'from-[#a18cd1]',
        colorEnd: 'to-[#fbc2eb]',
        accent: 'text-purple-500',
        bg: 'bg-purple-50',
        borderColor: 'border-purple-100',
        icon: Palette,
    },
    {
        image: '/2.png',
        name: 'Pre-Primary 1',
        ageGroup: '3.5 - 4.5 years',
        description: 'Phonics, writing, and numbers.',
        colorStart: 'from-[#84fab0]',
        colorEnd: 'to-[#8fd3f4]',
        accent: 'text-teal-600',
        bg: 'bg-teal-50',
        borderColor: 'border-teal-100',
        icon: BookOpen,
    },
    {
        image: '/16.png',
        name: 'Pre-Primary 2',
        ageGroup: '4.5 - 5.5 years',
        description: 'Math, science, and school readiness.',
        colorStart: 'from-[#f6d365]',
        colorEnd: 'to-[#fda085]',
        accent: 'text-orange-500',
        bg: 'bg-orange-50',
        borderColor: 'border-orange-100',
        icon: Star,
    },
    {
        image: '/day care.png',
        name: 'Day Care',
        ageGroup: '1.5 - 10 years',
        description: 'Safe, loving care with homework help.',
        colorStart: 'from-[#4facfe]',
        colorEnd: 'to-[#00f2fe]',
        accent: 'text-blue-500',
        bg: 'bg-blue-50',
        borderColor: 'border-blue-100',
        icon: Heart,
    }
];

export default function SchoolProgramsSection() {
    return (
        <section id="programs" className="py-28 bg-white relative overflow-hidden scroll-mt-24">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block"
                    >
                        <span className="py-2 px-6 rounded-full bg-blue-50 text-blue-600 font-bold text-sm uppercase tracking-widest border border-blue-100 mb-6 inline-block">
                            Our Classes
                        </span>
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-fredoka font-bold text-gray-900 mb-6">Learning Pathways</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
                        Curated programs for every stage of your child&apos;s early years.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {programs.map((program, i) => {
                        const Icon = program.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -10 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className={`group relative bg-white rounded-[2rem] overflow-hidden border-2 ${program.borderColor} hover:shadow-2xl transition-all duration-300 flex flex-col`}
                            >
                                {/* Image Area */}
                                <div className="relative h-48 w-full overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${program.colorStart} ${program.colorEnd} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                                    <Image
                                        src={program.image}
                                        alt={program.name}
                                        fill
                                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                        unoptimized
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                                        <Icon className={`w-5 h-5 ${program.accent}`} />
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className={`p-6 flex-grow flex flex-col ${program.bg} bg-opacity-30`}>
                                    <h3 className="text-xl font-black text-gray-900 mb-2 font-fredoka">{program.name}</h3>
                                    <div className="mb-3">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${program.accent} bg-white px-2 py-1 rounded-md shadow-sm opacity-90`}>
                                            {program.ageGroup}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm font-medium leading-relaxed mb-4 flex-grow">
                                        {program.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

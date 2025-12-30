"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Baby, BookOpen, Rocket, GraduationCap, ArrowRight } from 'lucide-react';

const programs = [
    {
        title: 'Playgroup',
        age: '1.5 - 2.5 Years',
        desc: 'A fun-filled environment where toddlers explore and learn through play.',
        icon: Baby,
        color: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-600',
        iconBg: 'bg-red-100'
    },
    {
        title: 'Nursery',
        age: '2.5 - 3.5 Years',
        desc: 'Building foundational skills in language, math, and social interaction.',
        icon: BookOpen,
        color: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-600',
        iconBg: 'bg-blue-100'
    },
    {
        title: 'PP I (LKG)',
        age: '3.5 - 4.5 Years',
        desc: 'Enhancing cognitive and motor skills with a structured curriculum.',
        icon: Rocket,
        color: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-600',
        iconBg: 'bg-green-100'
    },
    {
        title: 'PP II (UKG)',
        age: '4.5 - 5.5 Years',
        desc: 'Preparing children for formal schooling with advanced concepts.',
        icon: GraduationCap,
        color: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-600',
        iconBg: 'bg-orange-100'
    }
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function SchoolProgramsPage() {
    return (
        <div className="min-h-screen bg-white py-8 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-gray-900 mb-4">Our Programs</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We provide a nurturing environment for every stage of your child&apos;s early development.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
                >
                    {programs.map((program, i) => {
                        const Icon = program.icon;
                        return (
                            <motion.div
                                key={i}
                                variants={item}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className={`group relative rounded-[2rem] p-8 border-2 ${program.borderColor} ${program.color} transition-all duration-300 hover:shadow-xl`}
                            >
                                {/* Decorative Icon Background */}
                                <div className={`w-16 h-16 rounded-2xl ${program.iconBg} ${program.textColor} flex items-center justify-center mb-6 text-3xl shadow-sm group-hover:rotate-6 transition-transform duration-300`}>
                                    <Icon size={32} strokeWidth={2.5} />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-fredoka">{program.title}</h3>

                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 bg-white ${program.textColor} shadow-sm border border-opacity-20`}>
                                    {program.age}
                                </div>

                                <p className="text-gray-700 leading-relaxed mb-8 font-medium">
                                    {program.desc}
                                </p>

                                <div className={`absolute bottom-8 right-8 ${program.textColor} opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300`}>
                                    <ArrowRight size={24} />
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}

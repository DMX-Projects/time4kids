'use client';

import React from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Baby, Users2, GraduationCap, Sun } from 'lucide-react';

const ProgramsPreview = () => {
    const programs = [
        {
            icon: Baby,
            name: 'Play Group',
            ageGroup: '1.5 - 2.5 years',
            description: 'Introduction to social interaction and basic motor skills development.',
            color: 'from-pink-500 to-pink-600',
        },
        {
            icon: Users2,
            name: 'Nursery',
            ageGroup: '2.5 - 3.5 years',
            description: 'Building foundation for language, numbers, and creative expression.',
            color: 'from-blue-500 to-blue-600',
        },
        {
            icon: GraduationCap,
            name: 'PP-1 & PP-2',
            ageGroup: '3.5 - 5.5 years',
            description: 'Comprehensive pre-primary education preparing for formal schooling.',
            color: 'from-purple-500 to-purple-600',
        },
        {
            icon: Sun,
            name: 'Day Care',
            ageGroup: '1.5 - 5.5 years',
            description: 'Extended care with engaging activities throughout the day.',
            color: 'from-orange-500 to-orange-600',
        },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
                        Our <span className="gradient-text">Programs</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Age-appropriate programs designed to nurture every stage of your child's early development.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {programs.map((program, index) => (
                        <Card key={index} className="text-center group">
                            <div className={`w-20 h-20 bg-gradient-to-br ${program.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                                <program.icon className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="font-display font-bold text-xl mb-2 text-gray-900">{program.name}</h3>
                            <div className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                                {program.ageGroup}
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">{program.description}</p>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/programs">
                        <Button size="lg">View All Programs</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ProgramsPreview;

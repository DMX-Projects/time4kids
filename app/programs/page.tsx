'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, BookOpen } from 'lucide-react';
import TwinklingStars from '@/components/animations/TwinklingStars';
import AnimatedNumbers from '@/components/animations/AnimatedNumbers';


export default function ProgramsPage() {
    const programs = [
        {
            image: '/play group.png',
            name: 'Play Group',
            ageGroup: '1.5 - 2.5 years',
            duration: '2-3 hours/day',
            description: 'Introduction to social interaction and basic motor skills development through play-based activities.',
            features: [
                'Sensory play activities',
                'Basic motor skills development',
                'Social interaction with peers',
                'Introduction to colors and shapes',
                'Music and movement',
            ],
            color: 'from-pink-500 to-pink-600',
        },
        {
            image: '/2(1).png',
            name: 'Nursery',
            ageGroup: '2.5 - 3.5 years',
            duration: '3-4 hours/day',
            description: 'Building foundation for language, numbers, and creative expression in a nurturing environment.',
            features: [
                'Language development',
                'Number recognition',
                'Creative arts and crafts',
                'Story telling sessions',
                'Outdoor play activities',
            ],
            color: 'from-blue-500 to-blue-600',
        },
        {
            image: '/2.png',
            name: 'Pre-Primary 1 (PP-1)',
            ageGroup: '3.5 - 4.5 years',
            duration: '4 hours/day',
            description: 'Structured learning program focusing on pre-reading, pre-writing, and pre-math skills.',
            features: [
                'Pre-reading and phonics',
                'Pre-writing skills',
                'Number concepts',
                'Environmental awareness',
                'Physical education',
            ],
            color: 'from-purple-500 to-purple-600',
        },
        {
            image: '/16.png',
            name: 'Pre-Primary 2 (PP-2)',
            ageGroup: '4.5 - 5.5 years',
            duration: '4-5 hours/day',
            description: 'Comprehensive kindergarten readiness program preparing children for formal schooling.',
            features: [
                'Advanced reading skills',
                'Writing practice',
                'Mathematical thinking',
                'Science exploration',
                'Social studies',
            ],
            color: 'from-orange-500 to-orange-600',
        },
        {
            image: '/day care.png',
            name: 'Day Care',
            ageGroup: '1.5 - 2.5 years',
            duration: 'Full day',
            description: 'Extended care program providing safe, nurturing environment with age-appropriate activities.',
            features: [
                'Flexible timings',
                'Nutritious meals',
                'Supervised activities',
                'Rest time',
                'Age-appropriate learning',
            ],
            color: 'from-green-500 to-green-600',
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 relative overflow-hidden">
                {/* Kid-Friendly Animations */}
                <TwinklingStars count={18} />
                <AnimatedNumbers />


                {/* Animated GIF Character */}
                <div className="absolute bottom-10 right-10 w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 z-20 animate-bounce">
                    <Image
                        src="/kid-character.gif"
                        alt="Animated kid character"
                        fill
                        className="object-contain drop-shadow-lg"
                        unoptimized
                    />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
                            Our <span className="gradient-text">Programs</span>
                        </h1>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            Age-appropriate programs designed to nurture every child&apos;s unique potential
                        </p>
                    </div>
                </div>
            </section>

            {/* Programs Grid */}
            <section className="py-20 bg-white relative overflow-hidden">


                <div className="container mx-auto px-4 relative z-10">
                    <div className="space-y-16">
                        {programs.map((program, index) => (
                            <div
                                key={index}
                                className={`grid md:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''
                                    }`}
                            >
                                {/* Image - Puzzle Shape Theme */}
                                <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                                    <div className="relative rounded-3xl overflow-hidden shadow-2xl hover-lift">
                                        <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
                                            <Image
                                                src={program.image}
                                                alt={program.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                                    <Card className="hover-lift">
                                        <div className={`w-16 h-16 bg-gradient-to-br ${program.color} rounded-2xl flex items-center justify-center mb-6`}>
                                            <BookOpen className="w-8 h-8 text-white" />
                                        </div>

                                        <h2 className="font-display font-bold text-3xl mb-2 text-gray-900">
                                            {program.name}
                                        </h2>

                                        <div className="flex items-center space-x-4 text-gray-600 mb-4">
                                            <span className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {program.ageGroup}
                                            </span>
                                            <span>•</span>
                                            <span>{program.duration}</span>
                                        </div>

                                        <p className="text-gray-700 mb-6 leading-relaxed">
                                            {program.description}
                                        </p>

                                        <div className="space-y-2 mb-6">
                                            <h3 className="font-bold text-gray-900">Key Features:</h3>
                                            <ul className="space-y-1">
                                                {program.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start text-gray-700">
                                                        <span className="text-primary-500 mr-2">✓</span>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <Link href="/admission">
                                            <Button className="w-full md:w-auto">
                                                Enroll Now
                                            </Button>
                                        </Link>
                                    </Card>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
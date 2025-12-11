import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, BookOpen } from 'lucide-react';

export const metadata = {
    title: 'Our Programs - T.I.M.E. Kids Preschool',
    description: 'Explore our age-appropriate programs: Play Group, Nursery, PP-1, PP-2, and Day Care. Quality early education for children aged 1.5 to 5.5 years.',
};

export default function ProgramsPage() {
    const programs = [
        {
            image: '/playgroup.jpg',
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
            image: '/nursery.jpg',
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
            image: '/pp1.jpg',
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
            image: '/pp2.jpg',
            name: 'Pre-Primary 2 (PP-2)',
            ageGroup: '4.5 - 5.5 years',
            duration: '4-5 hours/day',
            description: 'Comprehensive preparation for formal schooling with advanced learning activities.',
            features: [
                'Reading and writing',
                'Basic mathematics',
                'Science exploration',
                'Computer basics',
                'School readiness skills',
            ],
            color: 'from-indigo-500 to-indigo-600',
        },
        {
            image: '/playgroup.jpg',
            name: 'Day Care',
            ageGroup: '1.5 - 5.5 years',
            duration: 'Full day/Extended hours',
            description: 'Extended care with engaging activities, meals, and rest time throughout the day.',
            features: [
                'Full day supervision',
                'Nutritious meals provided',
                'Age-appropriate activities',
                'Rest and nap time',
                'Safe and secure environment',
            ],
            color: 'from-orange-500 to-orange-600',
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
                            Our <span className="gradient-text">Programs</span>
                        </h1>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            Age-appropriate programs designed to nurture every stage of your child's early development
                        </p>
                    </div>
                </div>
            </section>

            {/* Programs Grid */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="space-y-12">
                        {programs.map((program, index) => (
                            <Card key={index} className="max-w-5xl mx-auto">
                                <div className="grid md:grid-cols-3 gap-8">
                                    {/* Image and Basic Info */}
                                    <div className="text-center md:text-left">
                                        <div className="relative w-48 h-48 mx-auto md:mx-0 mb-6 rounded-2xl overflow-hidden shadow-xl">
                                            <Image
                                                src={program.image}
                                                alt={program.name}
                                                fill
                                                className="object-cover"
                                                sizes="192px"
                                            />
                                        </div>
                                        <h3 className="font-display font-bold text-2xl mb-2 text-gray-900">{program.name}</h3>
                                        <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-3">
                                            {program.ageGroup}
                                        </div>
                                        <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">{program.duration}</span>
                                        </div>
                                    </div>

                                    {/* Description and Features */}
                                    <div className="md:col-span-2">
                                        <p className="text-gray-700 leading-relaxed mb-6">{program.description}</p>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                                                Key Features
                                            </h4>
                                            <ul className="grid sm:grid-cols-2 gap-3">
                                                {program.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start space-x-2">
                                                        <span className="text-primary-600 mt-1">✓</span>
                                                        <span className="text-gray-700">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <h3 className="font-display font-bold text-3xl mb-6">Ready to Enroll?</h3>
                        <Link href="/admission">
                            <Button size="lg">Start Admission Process</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

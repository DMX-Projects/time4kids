'use client';

import React from 'react';
import { Building2, Target, Lightbulb, Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import TwinklingStars from '@/components/animations/TwinklingStars';
import AnimatedLetters from '@/components/animations/AnimatedLetters';

export default function AboutPage() {
    const businesses = [
        {
            name: 'T.I.M.E.',
            description: 'National leader in entrance exam training',
            icon: Award,
        },
        {
            name: 'CLAT Training',
            description: 'Specialized coaching for law entrance exams',
            icon: Building2,
        },
        {
            name: 'School Level Programs',
            description: 'Academic support for school students',
            icon: Lightbulb,
        },
        {
            name: 'T.I.M.E. School',
            description: 'Complete K-12 education',
            icon: Target,
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 relative overflow-hidden">
                {/* Kid-Friendly Animations */}
                <TwinklingStars count={15} />
                <AnimatedLetters />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
                            About <span className="gradient-text">T.I.M.E. Kids</span>
                        </h1>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            A legacy of educational excellence spanning over 17 years in early childhood education
                        </p>
                    </div>
                </div>
            </section>

            {/* About T.I.M.E. Kids - TV Frame Theme */}
            <section className="py-20 bg-white relative overflow-hidden">


                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="font-display font-bold text-4xl mb-8 text-center">Our Story</h2>

                        {/* TV Frame Container */}
                        <div className="tv-frame text-primary-600 p-8 md:p-12 bg-gradient-to-br from-blue-50 to-purple-50 mb-8">
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    T.I.M.E. Kids pre-schools is a chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training. After its hugely successful beginning in Hyderabad, T.I.M.E. Kids with 250+ pre-schools is now poised for major expansion across the country.
                                </p>
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    The programme at T.I.M.E. Kids pre-schools aims at making the transition from home to school easy, by providing the warm, safe and caring learning environment that young children have at home. Our play schools offer wholesome, fun-filled and memorable childhood education to our children.
                                </p>
                                <p className="text-gray-700 leading-relaxed">
                                    T.I.M.E. Kids pre-schools are backed by our educational expertise of over 30 years, well trained care providers and a balanced educational programme. The programme at T.I.M.E. Kids pre-schools is based on the principles of age-appropriate child development practices.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & Philosophy - Cloud Shapes */}
            <section className="py-20 bg-gray-50 relative overflow-hidden">
                <TwinklingStars count={12} />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white hover-lift">
                            <Target className="w-16 h-16 mb-6" />
                            <h3 className="font-display font-bold text-3xl mb-4">Our Vision</h3>
                            <p className="text-white/90 leading-relaxed">
                                To be the most trusted and preferred preschool chain in India, providing world-class early childhood education that nurtures every child&apos;s potential and prepares them for a bright future.
                            </p>
                        </Card>

                        <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white hover-lift">
                            <Lightbulb className="w-16 h-16 mb-6" />
                            <h3 className="font-display font-bold text-3xl mb-4">Our Philosophy</h3>
                            <p className="text-white/90 leading-relaxed">
                                We believe in holistic development through play-based learning, fostering creativity, curiosity, and confidence in every child. Our approach combines traditional values with modern educational practices.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* T.I.M.E. Group Businesses */}
            <section className="py-20 bg-white relative overflow-hidden">


                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="font-display font-bold text-4xl mb-4">
                            Part of the <span className="gradient-text">T.I.M.E. Group</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Backed by 30+ years of educational excellence across multiple domains
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {businesses.map((business, index) => (
                            <Card key={index} className="text-center group hover-lift">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <business.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-display font-bold text-xl mb-3 text-gray-900">{business.name}</h3>
                                <p className="text-gray-600 text-sm">{business.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

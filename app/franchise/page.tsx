'use client';

import React from 'react';
import FranchiseForm from '@/components/franchise/FranchiseForm';
import TestimonialVideo from '@/components/shared/TestimonialVideo';
import Card from '@/components/ui/Card';
import AnimatedNumbers from '@/components/animations/AnimatedNumbers';
import TwinklingStars from '@/components/animations/TwinklingStars';
import { TrendingUp, Users, BookOpen, Headphones, Award, DollarSign, Download } from 'lucide-react';

export default function FranchisePage() {
    const benefits = [
        {
            icon: Award,
            title: 'Strong Brand Name',
            description: 'Leverage 17 years of T.I.M.E. Kids legacy and 30+ years of T.I.M.E. Group expertise',
        },
        {
            icon: DollarSign,
            title: 'Low Investment, High Returns',
            description: 'Profitable business model with quick ROI and sustainable growth',
        },
        {
            icon: BookOpen,
            title: 'Complete Curriculum Support',
            description: 'NEP 2020 updated curriculum, teaching materials, and activity plans',
        },
        {
            icon: Users,
            title: 'Regular Staff Training',
            description: 'Continuous training programs for teachers and staff development',
        },
        {
            icon: Headphones,
            title: 'Operational Support',
            description: 'End-to-end support in setup, marketing, and daily operations',
        },
        {
            icon: TrendingUp,
            title: 'Marketing Assistance',
            description: 'National and local marketing support to grow your centre',
        },
    ];

    const offerings = [
        'Proven business model with 250+ successful centres',
        'Comprehensive training for franchisees and staff',
        'Marketing and promotional materials',
        'Technology platform for operations',
        'Quality assurance and monitoring',
        'Parent engagement programs',
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section - Cloud Theme */}
            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 relative overflow-hidden">
                {/* Kid-Friendly Animations - Business Dreams */}
                <AnimatedNumbers />

                <TwinklingStars count={15} />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-luckiest text-5xl md:text-6xl mb-6 text-[#003366] tracking-wider">
                            <span className="text-[#E67E22]">Franchise</span> Opportunity
                        </h1>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            Partner with India&apos;s trusted preschool brand and build a rewarding business
                        </p>
                    </div>
                </div>
            </section>

            {/* Franchise Form */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <FranchiseForm />
                </div>
            </section>

            {/* Why T.I.M.E. Kids Franchise */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="font-bubblegum text-4xl mb-4 tracking-wide text-[#003366]">
                            Why Choose <span className="text-[#ef5f5f]">T.I.M.E. Kids Franchise?</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Join a proven business model backed by educational excellence
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {benefits.map((benefit, index) => (
                            <Card key={index} className="group">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                    <benefit.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="font-bubblegum text-xl mb-3 text-gray-900 tracking-wide">{benefit.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="font-bubblegum text-4xl mb-8 text-center text-[#003366] tracking-wide">
                            What We <span className="text-[#E67E22]">Offer You</span>
                        </h2>
                        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                            <ul className="grid md:grid-cols-2 gap-4">
                                {offerings.map((offering, index) => (
                                    <li key={index} className="flex items-start space-x-3">
                                        <span className="mt-1 flex-shrink-0">✓</span>
                                        <span className="text-white/90">{offering}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Franchise Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-bubblegum text-4xl mb-4 text-[#003366] tracking-wide">
                            Franchisee <span className="text-[#ef5f5f]">Success Stories</span>
                        </h2>
                        <p className="text-lg text-gray-600">Hear from our successful franchise partners</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <TestimonialVideo
                            title="Best business decision"
                            author="Franchise Partner"
                            location="Bangalore"
                        />
                        <TestimonialVideo
                            title="Complete support from day one"
                            author="Franchise Partner"
                            location="Chennai"
                        />
                        <TestimonialVideo
                            title="Rewarding and fulfilling"
                            author="Franchise Partner"
                            location="Pune"
                        />
                    </div>
                </div>
            </section>

            {/* Download Brochure */}
            <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <Download className="w-16 h-16 mx-auto mb-6" />
                        <h2 className="font-bubblegum text-4xl mb-6 tracking-wide">Download Franchise Brochure</h2>
                        <p className="text-xl text-white/90 mb-8">
                            Get detailed information about investment, support, and franchise benefits
                        </p>
                        <a
                            href="https://www.timekidspreschools.in/uploads/pc/TIME-Kids-Franchise%20Brochure.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl"
                        >
                            Download Brochure (PDF)
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}

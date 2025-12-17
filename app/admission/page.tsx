'use client';

import React from 'react';
import AdmissionForm from '@/components/admission/AdmissionForm';
import KeySkills from '@/components/admission/KeySkills';
import FAQAccordion from '@/components/admission/FAQAccordion';
import TestimonialVideo from '@/components/shared/TestimonialVideo';
import TwinklingStars from '@/components/animations/TwinklingStars';
import { Shield, Users, BookOpen, Download, Video } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AdmissionPage() {
    const whyPreschool = [
        'Early childhood education builds strong foundation',
        'Develops social and emotional skills',
        'Prepares children for formal schooling',
        'Enhances cognitive development',
        'Builds confidence and independence',
    ];

    const whyTimeKids = [
        '17 years of legacy in early education',
        '250+ preschools across India',
        'NEP 2020 updated curriculum',
        'Trained and caring teachers',
        'Safe and secure infrastructure',
        'Activity-based learning approach',
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 relative overflow-hidden">
                {/* Kid-Friendly Animations - Envelope Theme */}
                <TwinklingStars count={20} />


                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
                            Start Your Child&apos;s <span className="gradient-text">Learning Journey</span>
                        </h1>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            Join T.I.M.E. Kids family and give your child the best foundation for a bright future
                        </p>
                    </div>
                </div>
            </section>

            {/* Admission Form - Envelope Theme */}
            <section className="py-20 bg-white relative overflow-hidden">


                <div className="container mx-auto px-4 relative z-10">
                    <AdmissionForm />
                </div>
            </section>

            {/* Why Preschool & Why T.I.M.E. Kids */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        <Card>
                            <h3 className="font-display font-bold text-2xl mb-6 text-gray-900">Why Preschool?</h3>
                            <ul className="space-y-3">
                                {whyPreschool.map((item, index) => (
                                    <li key={index} className="flex items-start space-x-3">
                                        <span className="text-primary-600 mt-1 flex-shrink-0">✓</span>
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                            <h3 className="font-display font-bold text-2xl mb-6">Why T.I.M.E. Kids?</h3>
                            <ul className="space-y-3">
                                {whyTimeKids.map((item, index) => (
                                    <li key={index} className="flex items-start space-x-3">
                                        <span className="mt-1 flex-shrink-0">✓</span>
                                        <span className="text-white/90">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Infrastructure */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-display font-bold text-4xl mb-4">
                            Safe & Secure <span className="gradient-text">Infrastructure</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Child-safe environment designed for optimal learning and development
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <Card className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-display font-bold text-xl mb-3">Safe Environment</h3>
                            <p className="text-gray-600">CCTV surveillance, secure entry/exit, and child-safe furniture</p>
                        </Card>

                        <Card className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-display font-bold text-xl mb-3">Concept Classrooms</h3>
                            <p className="text-gray-600">Colorful, stimulating classrooms designed for active learning</p>
                        </Card>

                        <Card className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <BookOpen className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-display font-bold text-xl mb-3">Play Areas</h3>
                            <p className="text-gray-600">Safe outdoor play equipment in ample open space</p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Key Skills */}
            <KeySkills />

            {/* NEP 2020 Curriculum */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-3xl p-12 shadow-2xl">
                            <h2 className="font-display font-bold text-4xl mb-6">NEP 2020 Updated Curriculum</h2>
                            <p className="text-xl text-white/90 leading-relaxed mb-8">
                                Our curriculum is aligned with the National Education Policy 2020, ensuring your child receives education that meets the latest national standards and prepares them for future success.
                            </p>
                            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                                <BookOpen className="w-5 h-5" />
                                <span className="font-semibold">Holistic Development Approach</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Parent Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-display font-bold text-4xl mb-4">
                            Parent <span className="gradient-text">Testimonials</span>
                        </h2>
                        <p className="text-lg text-gray-600">Hear from parents who trust us with their children</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <TestimonialVideo
                            title="Annual Day Celebrations"
                            author="T.I.M.E. Kids Kilpauk"
                            location="Chennai"
                            videoUrl="/chaninai kilpauk-AnnualDay-Video-2018-19.mp4"
                            thumbnailUrl="/day care.png"
                        />
                        <TestimonialVideo
                            title="Fun Time at School"
                            author="T.I.M.E. Kids Chennai"
                            location="Chennai"
                            videoUrl="/chennai2.mp4"
                            thumbnailUrl="/infra.jpg"
                        />
                        <TestimonialVideo
                            title="Raja Colony Highlights"
                            author="T.I.M.E. Kids Trichy"
                            location="Trichy"
                            videoUrl="/trichy-rajacolony.mp4"
                            thumbnailUrl="/5.jpeg"
                        />
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-display font-bold text-4xl mb-4">
                            Frequently Asked <span className="gradient-text">Questions</span>
                        </h2>
                        <p className="text-lg text-gray-600">Find answers to common admission queries</p>
                    </div>
                    <FAQAccordion />
                </div>
            </section>

            {/* Downloads */}
            <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="font-display font-bold text-4xl mb-8">Download Resources</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <a
                                href="https://www.timekidspreschools.in/uploads/pc/TIME-KIDS-BROCHURE.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="block bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-2xl p-8 transition-all hover:scale-105"
                            >
                                <Download className="w-12 h-12 mx-auto mb-4" />
                                <h3 className="font-display font-bold text-xl mb-2">Admission Brochure</h3>
                                <p className="text-white/80 text-sm">Complete information about our programs and facilities</p>
                            </a>
                            <button className="bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-2xl p-8 transition-all hover:scale-105">
                                <Video className="w-12 h-12 mx-auto mb-4" />
                                <h3 className="font-display font-bold text-xl mb-2">School Tour Video</h3>
                                <p className="text-white/80 text-sm">Virtual tour of our preschool facilities</p>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

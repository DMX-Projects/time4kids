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

            {/* Main Branch Location */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-bubblegum text-4xl mb-4 text-[#003366] tracking-wide">
                            Visit Our <span className="text-[#E67E22]">Main Branch</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Come meet our team and explore our flagship centre
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Map */}
                            <div className="rounded-3xl overflow-hidden shadow-xl h-[400px] md:h-[500px]">
                                <iframe
                                    src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Siddamsetty+Complex+Parklane+Secunderabad+500003&zoom=15"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="T.I.M.E. Kids Corporate Office Location"
                                ></iframe>
                            </div>

                            {/* Contact Details */}
                            <Card className="flex flex-col justify-center">
                                <h3 className="font-bubblegum text-2xl mb-6 text-gray-900 tracking-wide">
                                    T.I.M.E. Kids Corporate Office
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 mb-1">Address</p>
                                            <p className="text-gray-600 leading-relaxed">
                                                Triumphant Institute of Management Education Pvt. (T.I.M.E.)<br />
                                                95B, Second Floor<br />
                                                Siddamsetty Complex<br />
                                                Parklane, Secunderabad<br />
                                                500003
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 mb-1">Phone</p>
                                            <p className="text-gray-600">040-40088300</p>
                                            <p className="text-sm text-gray-500 mt-1">Fax: 040-27847334</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 mb-1">Email</p>
                                            <p className="text-gray-600">info@timekidspreschools.com</p>
                                            <p className="text-sm text-gray-500 mt-1">Franchise: franchise@timekidspreschools.com</p>
                                            <p className="text-sm text-gray-500">Cell: 8096355335</p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <a
                                            href="https://www.google.com/maps/dir/?api=1&destination=Siddamsetty+Complex+Secunderabad+500003"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                            <span>Get Directions</span>
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        </div>
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

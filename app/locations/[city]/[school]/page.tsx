"use client";

import React, { useState, useEffect } from 'react';
import { centres } from '@/data/centres';
import { slugify } from '@/lib/utils';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Camera,
    Info,
    Map as MapIcon,
    MessageSquare,
    ExternalLink,
    Star,
    Award,
    Users
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function SchoolDetailPage({ params }: { params: { city: string, school: string } }) {
    const city = decodeURIComponent(params.city);
    const schoolSlug = params.school;

    const school = centres.find(c =>
        c.city.toLowerCase().includes(city.toLowerCase()) &&
        slugify(c.name) === schoolSlug
    );

    const [activeSection, setActiveSection] = useState('overview');

    if (!school) {
        return (
            <div className="min-h-screen flex flex-center items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">School Not Found</h1>
                    <Link href={`/locations/${params.city}`}>
                        <Button variant="primary">Back to {city}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const navItems = [
        { id: 'overview', label: 'Overview', icon: Info },
        { id: 'photos', label: 'Photos', icon: Camera },
        { id: 'location', label: 'Location', icon: MapIcon },
        { id: 'contact', label: 'Contact', icon: MessageSquare },
    ];

    const stats = [
        { label: 'Experience', value: '17+ Years', icon: Award },
        { label: 'Students', value: '50,000+', icon: Users },
        { label: 'Rating', value: '4.8/5', icon: Star },
    ];

    return (
        <>
            {/* New Brand Header & Banner is now in Layout */}

            <main className="flex-1">
                {/* Content Sections */}
                <div className="container mx-auto px-4 py-16 space-y-24">
                    {/* School Details Info Block */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl -mt-20 relative z-20 border border-gray-100 max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1 space-y-4">
                                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold uppercase tracking-widest">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>Top Rated Centre</span>
                                </div>
                                <div className="flex items-start space-x-3 text-gray-600">
                                    <MapPin className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                                    <p className="text-lg leading-relaxed">{school.address}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-4 pt-4">
                                    {stats.map((stat, i) => (
                                        <div key={i} className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                                            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-tighter">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* School Main Image */}
                            <div className="flex-1 w-full aspect-[4/3] relative rounded-2xl overflow-hidden shadow-lg group">
                                <Image
                                    src="https://images.unsplash.com/photo-1587588354456-ae376af71a25?auto=format&fit=crop&q=80&w=1000"
                                    alt={school.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <p className="font-bold text-lg">Main Campus</p>
                                    <p className="text-sm opacity-80">{school.city}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Overview Section */}
                    <section id="overview" className="scroll-mt-32">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                                <Info className="w-6 h-6 text-primary-600" />
                            </div>
                            <h2 className="text-3xl font-bold font-fredoka">Overview</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="prose prose-lg text-gray-600 max-w-none">
                                <p className="font-medium text-xl text-gray-900 mb-6 leading-relaxed">
                                    Welcome to T.I.M.E. Kids {school.name}, where we prioritize the holistic development of every child through a blend of academic excellence and creative play.
                                </p>
                                <p>
                                    Our curriculum is meticulously designed to align with NEP 2020, focusing on experiential learning and skill development. We provide a safe, nurturing, and stimulating environment that encourages curiosity and fosters a love for learning.
                                </p>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 list-none p-0">
                                    {[
                                        'Experienced Educators',
                                        'Safe & Secure Campus',
                                        'NEP 2020 Based Curriculum',
                                        'Play-way Method',
                                        'CCTV Surveillance',
                                        'Smart Learning Tools'
                                    ].map((feature, i) => (
                                        <li key={feature} className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                            <span className="font-bold text-gray-700 text-sm uppercase">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
                                    alt="Classroom"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Photos Section */}
                    <section id="photos" className="scroll-mt-32">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center">
                                <Camera className="w-6 h-6 text-secondary-600" />
                            </div>
                            <h2 className="text-3xl font-bold font-fredoka">School Gallery</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[
                                'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
                                'https://images.unsplash.com/photo-1509062522246-3755977927d7',
                                'https://images.unsplash.com/photo-1574515644163-f24e93094cba',
                                'https://images.unsplash.com/photo-1564424223910-401de909a27b',
                                'https://images.unsplash.com/photo-1507537362145-590e38a59301',
                                'https://images.unsplash.com/photo-1453749024858-4bca89bd9edc',
                                'https://images.unsplash.com/photo-1516627145497-ae6968895b74',
                                'https://images.unsplash.com/photo-1519331379826-f10be5486c6f'
                            ].map((src, i) => (
                                <div key={i} className="aspect-square relative rounded-2xl overflow-hidden group cursor-pointer shadow-md">
                                    <Image
                                        src={`${src}?auto=format&fit=crop&q=80&w=400`}
                                        alt={`Gallery image ${i + 1}`}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ExternalLink className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Location & Contact */}
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Location */}
                        <section id="location" className="scroll-mt-32">
                            <div className="flex items-center space-x-4 mb-8">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                    <MapIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-bold font-fredoka">Visit Us</h2>
                            </div>
                            <Card className="p-0 overflow-hidden shadow-xl border-0 h-[400px]">
                                <iframe
                                    className="w-full h-full grayscale opacity-80"
                                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(school.address + ' ' + school.city)}`}
                                    allowFullScreen
                                />
                            </Card>
                        </section>

                        {/* Contact */}
                        <section id="contact" className="scroll-mt-32">
                            <div className="flex items-center space-x-4 mb-8">
                                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6 text-orange-600" />
                                </div>
                                <h2 className="text-3xl font-bold font-fredoka">Get in Touch</h2>
                            </div>
                            <div className="space-y-6">
                                <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Call Us</p>
                                            <a href={`tel:${school.phone}`} className="text-xl font-bold text-gray-900 hover:text-primary-600">
                                                {school.phone}
                                            </a>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-6 h-6 text-secondary-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Us</p>
                                            <a href={`mailto:${school.email || 'info@timekidspreschools.com'}`} className="text-xl font-bold text-gray-900 hover:text-secondary-600">
                                                {school.email || 'info@timekidspreschools.com'}
                                            </a>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">School Hours</p>
                                            <p className="text-xl font-bold text-gray-900">Mon - Sat: 9:00 AM - 1:30 PM</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </section>

                        {/* Location Map Section */}
                        <section className="bg-white py-16 scroll-mt-20" id="location">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-fredoka font-bold text-gray-900 mb-4">Visit Our Campus</h2>
                                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                    Come and see our facilities. We are conveniently located in {school.city}.
                                </p>
                            </div>
                            <div className="bg-gray-100 rounded-3xl overflow-hidden shadow-xl h-[400px] border-4 border-white relative z-10 w-full">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    title="map"
                                    className="border-0"
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(school.address + ' ' + school.city + ' TIME Kids Preschool')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Footer is now in Layout */}

            {/* Sticky Mobile Enrollment */}
            <div className="lg:hidden sticky bottom-6 mx-4 p-2 bg-primary-600 rounded-2xl shadow-2xl shadow-primary-500/40 z-50 border border-primary-500/20">
                <Link href="/admission">
                    <Button className="w-full rounded-xl bg-white text-primary-600 border-0 hover:bg-gray-50 active:scale-95 transition-all text-sm font-bold uppercase tracking-widest py-4" size="lg">
                        Enroll Your Child Now
                    </Button>
                </Link>
            </div>
        </>
    );
}

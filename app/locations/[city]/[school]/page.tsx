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
    ExternalLink,
    Star,
    Award,
    Users,
    Info,
    Map as MapIcon,
    MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AdmissionBar from '@/components/admission/AdmissionBar';
import WelcomeSection from '@/components/school/WelcomeSection';
import TeachingTools from '@/components/school/TeachingTools';
import ClassesSection from '@/components/school/ClassesSection';

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
        { id: 'teaching-tools', label: 'Teaching Tools', icon: Camera },
        { id: 'classes', label: 'Classes', icon: Users }, // Changed icon from Star to Users as Star is no longer imported
    ];

    return (
        <>
            {/* New Brand Header & Banner is now in Layout */}

            <main className="flex-1 space-y-24 py-16">
                {/* Admission Bar Replacement - Keeping in container for centering */}
                <div className="container mx-auto px-4 -mt-16 relative z-20">
                    <AdmissionBar />
                </div>

                {/* Welcome Section Replacement */}
                <div id="overview" className="scroll-mt-32 w-full">
                    <WelcomeSection schoolName={school.name} />
                </div>

                {/* Teaching & Learning Tools Replacement */}
                <div id="teaching-tools" className="scroll-mt-32 w-full">
                    <TeachingTools />
                </div>

                {/* Classes Section Replacement */}
                <section id="classes" className="scroll-mt-32 w-full">
                    <ClassesSection />
                </section>
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

"use client";

import React, { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api-client';
import {
    Info,
    Camera,
    Users
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import AdmissionBar from '@/components/admission/AdmissionBar';
import WelcomeSection from '@/components/school/WelcomeSection';
import TeachingTools from '@/components/school/TeachingTools';
import ClassesSection from '@/components/school/ClassesSection';
import { slugify } from '@/lib/utils';


export default function SchoolDetailPage({ params }: { params: { city: string, school: string } }) {
    const city = decodeURIComponent(params.city);
    const schoolSlug = params.school;

    const [school, setSchool] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchool = async () => {
            try {
                // Fetch all centres to ensure we find the school even if the URL city name differs from backend city
                const res = await fetch(apiUrl(`/franchises/public/`));
                if (!res.ok) throw new Error('Failed to fetch data');
                const data = await res.json();
                const rawData = Array.isArray(data) ? data : (data.results || []);
                // Match school using slug logic:
                // 1. Exact match on slug
                // 2. Fallback match on slugified name
                const foundSchool = rawData.find((c: any) =>
                    c.slug === schoolSlug || slugify(c.name) === schoolSlug
                );

                if (foundSchool) {
                    setSchool(foundSchool);
                } else {
                    setSchool(null);
                }
            } catch (err) {
                console.error(err);
                setSchool(null);
            } finally {
                setLoading(false);
            }
        };

        if (schoolSlug && city) {
            fetchSchool();
        } else {
            setLoading(false);
        }
    }, [schoolSlug, city]);

    const [activeSection, setActiveSection] = useState('overview');

    if (loading) {
        return (
            <div className="min-h-screen flex flex-center items-center justify-center p-4">
                <div className="text-center text-gray-500">Loading school details...</div>
            </div>
        );
    }

    if (!school) {
        return (
            <div className="min-h-screen flex flex-center items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Centre Not Found</h1>
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
        { id: 'classes', label: 'Classes', icon: Users },
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

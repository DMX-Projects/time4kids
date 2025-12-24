"use client";

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import SchoolBrandHeader from '@/components/layout/SchoolBrandHeader';
import SchoolFooter from '@/components/layout/SchoolFooter';
import { centres } from '@/data/centres';
import { slugify } from '@/lib/utils';

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
    // ... params logic
    const params = useParams();
    const city = typeof params.city === 'string' ? decodeURIComponent(params.city) : '';
    const schoolSlug = typeof params.school === 'string' ? params.school : '';

    const school = centres.find(c =>
        c.city.toLowerCase().includes(city.toLowerCase()) &&
        slugify(c.name) === schoolSlug
    );

    const basePath = `/locations/${params.city}/${params.school}`;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <SchoolBrandHeader schoolName={school ? school.name : 'School'} basePath={basePath} />

            <AnimatePresence mode="wait">
                <motion.div
                    key={useParams().toString()} // Key changes on route change to trigger animation
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            <SchoolFooter />
        </div>
    );
}

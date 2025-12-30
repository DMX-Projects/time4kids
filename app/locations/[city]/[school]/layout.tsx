"use client";

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import SchoolBrandHeader from '@/components/layout/SchoolBrandHeader';
import SchoolFooter from '@/components/layout/SchoolFooter';

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
    // ... params logic
    const params = useParams();
    // const city = typeof params.city === 'string' ? decodeURIComponent(params.city) : '';
    // const schoolSlug = typeof params.school === 'string' ? params.school : '';

    const basePath = `/locations/${params.city}/${params.school}`;
    const cityHomeUrl = `/locations/${params.city}`;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <SchoolBrandHeader schoolName="School Details" basePath={basePath} homeUrl={cityHomeUrl} />

            <AnimatePresence mode="wait">
                <motion.div
                    key={params.toString()} // Key changes on route change to trigger animation
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            <SchoolFooter homeUrl={cityHomeUrl} />
        </div>
    );
}

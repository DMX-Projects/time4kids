"use client";

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import SchoolBrandHeader from '@/components/layout/SchoolBrandHeader';
import SchoolFooter from '@/components/layout/SchoolFooter';
import { getFranchiseBySlug } from '@/lib/api/franchises';
import type { Franchise } from '@/lib/api/franchises';

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const [franchise, setFranchise] = useState<Franchise | null>(null);

    const basePath = `/locations/${params.city}/${params.school}`;
    const cityHomeUrl = `/locations/${params.city}`;
    const schoolSlug = typeof params.school === 'string' ? params.school : '';

    useEffect(() => {
        const fetchFranchise = async () => {
            if (schoolSlug) {
                const data = await getFranchiseBySlug(schoolSlug);
                setFranchise(data);
            }
        };
        fetchFranchise();
    }, [schoolSlug]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <SchoolBrandHeader
                schoolName="School Details"
                basePath={basePath}
                homeUrl={basePath}
                contactPhone={franchise?.contact_phone}
                facebookUrl={franchise?.facebook_url}
                instagramUrl={franchise?.instagram_url}
                twitterUrl={franchise?.twitter_url}
                youtubeUrl={franchise?.youtube_url}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={params.toString()} // Key changes on route change to trigger animation
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 pt-[120px]"
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            <SchoolFooter
                homeUrl={cityHomeUrl}
                facebookUrl={franchise?.facebook_url}
                instagramUrl={franchise?.instagram_url}
                twitterUrl={franchise?.twitter_url}
                contactPhone={franchise?.contact_phone}
                contactEmail={franchise?.contact_email}
            />
        </div>
    );
}

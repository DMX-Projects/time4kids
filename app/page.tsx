import React from 'react';
import nextDynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import KeyNavigation from '@/components/home/KeyNavigation';
import LocationsLadderSection from '@/components/home/LocationsLadderSection';
import { HomePageContentProvider } from '@/components/home/HomePageContentProvider';
import { fetchPublicFranchiseCityTiles } from '@/lib/public-franchise-cities';

/** Always load fresh cities from franchise table (never stale static export). */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BenefitsUpdates = nextDynamic(() => import('@/components/home/BenefitsUpdates'), {
    loading: () => <div className="h-96" />,
});
const WhyChooseUs = nextDynamic(() => import('@/components/home/WhyChooseUs'), {
    loading: () => <div className="h-96" />,
});
const ProgramsPreview = nextDynamic(() => import('@/components/home/ProgramsPreview'), {
    loading: () => <div className="h-96" />,
});
const TestimonialSlider = nextDynamic(() => import('@/components/home/TestimonialSlider'), {
    loading: () => <div className="h-96" />,
});

export default async function Home() {
    const { tiles: presenceCities, fromDatabase } = await fetchPublicFranchiseCityTiles();

    return (
        <HomePageContentProvider>
            <div className="min-w-0">
                <HeroSection />
                <KeyNavigation />
                <ProgramsPreview />
                <BenefitsUpdates />
                <WhyChooseUs />
                <TestimonialSlider />
                <LocationsLadderSection tiles={presenceCities} fromDatabase={fromDatabase} />
            </div>
        </HomePageContentProvider>
    );
}

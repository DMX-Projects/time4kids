'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import KeyNavigation from '@/components/home/KeyNavigation';
import IntroSection from '@/components/home/IntroSection';

// Lazy load below-the-fold components for faster initial page load
const BenefitsUpdates = dynamic(() => import('@/components/home/BenefitsUpdates'), {
    loading: () => <div className="h-96" />, // Placeholder to prevent layout shift
});
const WhyChooseUs = dynamic(() => import('@/components/home/WhyChooseUs'), {
    loading: () => <div className="h-96" />,
});
const ProgramsPreview = dynamic(() => import('@/components/home/ProgramsPreview'), {
    loading: () => <div className="h-96" />,
});
const MethodologySection = dynamic(() => import('@/components/home/MethodologySection'), {
    loading: () => <div className="h-96" />,
});
const CounterSection = dynamic(() => import('@/components/home/CounterSection'), {
    loading: () => <div className="h-96" />,
});
const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'), {
    loading: () => <div className="h-96" />,
});
const LocationsLadder = dynamic(() => import('@/components/home/LocationsLadder'), {
    loading: () => <div className="h-96" />,
});

export default function Home() {
    return (
        <div className="overflow-hidden">
            {/* Hero Section - Banner Slider */}
            <HeroSection />

            {/* Key Navigation Icons */}
            <KeyNavigation />

            {/* Introduction Section */}
            <IntroSection />

            {/* Benefits & Updates */}
            <BenefitsUpdates />

            {/* Why Choose Us Section */}
            <WhyChooseUs />

            {/* Programs Preview Section */}
            <ProgramsPreview />

            {/* Events, Tips, and Brands - Integrated with Whale and Waves */}
            {/* <EventsTipsBrands /> */}

            {/* Methodology Section */}
            <MethodologySection />

            {/* Counter Results */}
            <CounterSection />

            {/* Testimonials */}
            <TestimonialsSection />

            {/* Locations Ladder Section */}
            <LocationsLadder />
        </div>
    );
}

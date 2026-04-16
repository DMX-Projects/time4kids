

import React from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import { MAIN_PAGE_SECTIONS } from '@/config/main-page-sections';
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
// Integrating TestimonialSlider & TestimonialsSection with dynamic import
const TestimonialSlider = dynamic(() => import('@/components/home/TestimonialSlider'), {
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
        <>
            <a
                href={`#${MAIN_PAGE_SECTIONS.intro.id}`}
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:px-4 focus:py-3 focus:bg-white focus:text-[#111827] focus:text-sm focus:font-semibold focus:shadow-lg focus:rounded-md focus:ring-2 focus:ring-[#F97316] focus:outline-none"
            >
                Skip to welcome section
            </a>
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

            {/* Methodology Section */}
            <MethodologySection />

            {/* Counter Results */}
            <CounterSection />

            {/* Testimonials */}
            <TestimonialSlider />
            <TestimonialsSection />

            {/* Locations Ladder Section */}
            <LocationsLadder />
            </div>
        </>
    );
}

'use client';

import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import KeyNavigation from '@/components/home/KeyNavigation';
import IntroSection from '@/components/home/IntroSection';
import BenefitsUpdates from '@/components/home/BenefitsUpdates';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import ProgramsPreview from '@/components/home/ProgramsPreview';
// import EventsTipsBrands from '@/components/home/EventsTipsBrands';
import MethodologySection from '@/components/home/MethodologySection';
import CounterSection from '@/components/home/CounterSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import LocationsLadder from '@/components/home/LocationsLadder';

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

import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import ProgramsPreview from '@/components/home/ProgramsPreview';
import TestimonialSlider from '@/components/home/TestimonialSlider';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CTASection from '@/components/home/CTASection';

export default function Home() {
    return (
        <div className="overflow-hidden">
            <HeroSection />
            <WhyChooseUs />
            <ProgramsPreview />
            <TestimonialSlider />
            <TestimonialsSection />
            <CTASection />
        </div>
    );
}

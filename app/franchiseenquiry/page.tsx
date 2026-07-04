import React from 'react';
import CustomFranchiseEnquiryForm from '@/components/franchise/CustomFranchiseEnquiryForm';
import AnimatedNumbers from '@/components/animations/AnimatedNumbers';
import TwinklingStars from '@/components/animations/TwinklingStars';

export const metadata = {
    title: 'Franchise Enquiry | T.I.M.E. Kids',
    description: 'Submit your franchise enquiry for T.I.M.E. Kids preschools.',
};

export default function FranchiseEnquiryPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 pb-12 pt-[7.5rem] md:pb-16 md:pt-36">
                <AnimatedNumbers />
                <TwinklingStars count={15} />

                <div className="container relative z-20 mx-auto px-4 sm:px-6">
                    <div className="mx-auto w-full max-w-4xl text-center">
                        <h1 className="font-display mx-auto mb-4 flex w-full max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-3xl font-black leading-tight tracking-tight text-[#003366] sm:max-w-3xl sm:text-4xl md:text-5xl">
                            <span>Partner with</span>
                            <span className="text-[#E67E22]">T.I.M.E. Kids</span>
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Fill out the form below to take the first step towards a rewarding business opportunity in early childhood education.
                        </p>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="mx-auto max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-6 md:p-8">
                            <CustomFranchiseEnquiryForm />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

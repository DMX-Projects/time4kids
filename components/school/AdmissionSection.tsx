import React from 'react';
import AdmissionForm from '@/components/admission/AdmissionForm';

interface AdmissionSectionProps {
    franchiseSlug?: string;
    city?: string;
}

export default function AdmissionSection({ franchiseSlug, city }: AdmissionSectionProps) {
    return (
        <section id="admission" className="py-28 bg-[#fffcf5] relative scroll-mt-24">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center mb-12">
                    <h2 className="text-4xl font-fredoka font-bold text-gray-900 mb-4">Admissions Open</h2>
                    <p className="text-xl text-gray-600">Join the T.I.M.E. Kids family today!</p>
                </div>

                <div className="bg-white max-w-4xl mx-auto rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
                    <AdmissionForm franchiseSlug={franchiseSlug} defaultCity={city} />
                </div>
            </div>
        </section>
    );
}

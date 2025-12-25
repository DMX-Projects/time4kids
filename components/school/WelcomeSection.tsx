'use client';

import React from 'react';

interface WelcomeSectionProps {
    schoolName: string;
}

const WelcomeSection = ({ schoolName }: WelcomeSectionProps) => {
    return (
        <section className="bg-[#fcf8f1] py-16 px-4 relative overflow-hidden">
            {/* Background Pattern Placeholder - Can be replaced with a real doodle image if available */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("/latest-scroll-bg.jpg")', backgroundSize: 'cover' }}></div>

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    {/* Left: YouTube Video */}
                    <div className="w-full lg:w-1/2">
                        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Placeholder Video
                                title="Welcome to TIME Kids"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <div className="bg-black py-2 px-4 rounded text-white text-xs font-bold inline-flex items-center gap-2">
                                <span className="bg-red-600 px-1 rounded">Watch on</span> YouTube
                            </div>
                        </div>
                    </div>

                    {/* Right: Text Content */}
                    <div className="w-full lg:w-1/2 space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold font-fredoka flex flex-wrap gap-x-2">
                            <span className="text-red-500">Welcome</span>
                            <span className="text-gray-800">to T.I.M.E. Kids</span>
                            <span className="text-blue-600">{schoolName}</span>
                        </h2>

                        <div className="space-y-4 text-gray-700 text-base md:text-lg leading-relaxed font-medium">
                            <p>
                                A chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training
                                T.I.M.E. Kids pre-schools is a chain of pre-schools launched by T.I.M.E., the national leader in
                                entrance exam training. After its hugely successful beginning in Hyderabad, T.I.M.E. Kids
                                with 350+ pre-schools is now poised for major expansion across the country.
                            </p>
                            <p>
                                The programme at T.I.M.E. Kids pre-schools aims at making the transition from home to
                                school easy, by providing the warm, safe and caring and learning environment that young
                                children have at home. Our play schools offer wholesome, fun-filled and memorable
                                childhood education to our children.
                            </p>
                            <p>
                                T.I.M.E. Kids pre-schools are backed by our educational expertise of over 27 years, well
                                trained care providers and a balanced educational programme. The programme at T.I.M.E.
                                Kids pre-schools is based on the principles of age-appropriate child development
                                practices. All our Play schools are well-equipped with learning aids and educational toys
                                suitable for different age groups.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WelcomeSection;

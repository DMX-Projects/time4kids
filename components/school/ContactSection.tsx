import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';
import SchoolContactForm from './SchoolContactForm';

export default function ContactSection({ school, franchiseSlug }: { school: any, franchiseSlug?: string }) {
    if (!school) return null;

    return (
        <section id="contact" className="relative py-20 lg:py-32 overflow-hidden font-fredoka scroll-mt-24">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/classes-bg.png"
                    alt="Background"
                    fill
                    className="object-cover object-center opacity-40"
                    priority
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block py-2 px-8 rounded-full bg-green-100/80 text-green-700 font-bold text-sm uppercase tracking-widest mb-6 border border-green-200">
                        GET IN TOUCH
                    </span>
                    <h2 className="text-5xl md:text-6xl font-black text-[#1F2937] drop-shadow-sm flex items-center justify-center gap-4">
                        Contact Us
                        <span className="text-yellow-400 text-4xl">✨</span>
                    </h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-7xl mx-auto">
                    {/* Left Column: Contact Info & Bear */}
                    <div className="space-y-8 relative">
                        {/* Visit Us */}
                        <div className="bg-white rounded-[2rem] p-8 flex gap-6 shadow-xl shadow-orange-100/50 border-2 border-orange-50 items-start hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-200">
                                <MapPin strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-orange-500 font-black mb-2 uppercase tracking-wide">VISIT US</h4>
                                <p className="font-bold text-gray-700 text-lg leading-relaxed">{school.address}</p>
                            </div>
                        </div>

                        {/* Call Us */}
                        <div className="bg-white rounded-[2rem] p-8 flex gap-6 shadow-xl shadow-green-100/50 border-2 border-green-50 items-center hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-200">
                                <Phone strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-green-500 font-black mb-2 uppercase tracking-wide">CALL US</h4>
                                <a href={`tel:${school.contact_phone}`} className="font-bold text-gray-700 text-xl hover:text-green-600 transition-colors">
                                    {school.contact_phone || '+91 123 456 7890'}
                                </a>
                            </div>
                        </div>

                        {/* Email Us */}
                        <div className="bg-white rounded-[2rem] p-8 flex gap-6 shadow-xl shadow-blue-100/50 border-2 border-blue-50 items-center hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                                <Mail strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-blue-500 font-black mb-2 uppercase tracking-wide">EMAIL US</h4>
                                <a href={`mailto:${school.contact_email}`} className="font-bold text-gray-700 text-lg break-all hover:text-blue-600 transition-colors">
                                    {school.contact_email || 'info@timekidspreschools.com'}
                                </a>
                            </div>
                        </div>

                        <div className="relative h-64 mt-10 hidden md:block">
                            <div className="absolute bottom-0 left-0 z-10 w-48 animate-bounce">
                                <Image src="/teddy-bear.png" width={200} height={200} alt="Bear" className="drop-shadow-xl" />
                            </div>
                            <div className="absolute bottom-0 left-40 z-0">
                                <Image src="/science-blocks.png" width={120} height={120} alt="Blocks" className="drop-shadow-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form & Robot */}
                    <div className="relative">
                        <SchoolContactForm franchiseSlug={franchiseSlug} city={school.city} />

                        {/* Decorative Robot */}
                        <div className="absolute -bottom-12 -right-16 z-20 pointer-events-none hidden xl:block w-48">
                            <Image src="/robot.png" width={200} height={200} alt="Robot" className="drop-shadow-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Helper for animations if motion is not available in standard imports, but we can assume standard CSS or just static
// I'll stick to static functionality for now to avoid module resolution issues if motion isn't set up perfectly or used in this file
// Note: I removed motion-div to avoid errors; if animation is needed we can add standard CSS classes.

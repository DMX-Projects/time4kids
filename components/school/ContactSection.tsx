"use client";

import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function ContactSection({ school }: { school: any }) {
    if (!school) return null;

    return (
        <section id="contact" className="py-28 bg-gradient-to-b from-[#fdfbf7] to-white relative overflow-hidden scroll-mt-24">
            {/* Decorative Blobs */}
            <div className="absolute top-20 right-0 w-64 h-64 bg-green-200/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-20 left-0 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl -z-10"></div>

            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <span className="inline-block py-2 px-6 rounded-full bg-green-100 text-green-700 font-bold text-sm uppercase tracking-widest mb-6 border border-green-200">
                        Get in Touch
                    </span>
                    <h2 className="text-4xl md:text-6xl font-fredoka font-bold text-gray-900 drop-shadow-sm">Contact Us</h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto items-start">
                    <div className="space-y-8">
                        {/* Address Card */}
                        <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[2rem] shadow-xl border border-white flex items-start gap-8 hover:-translate-y-2 transition-transform duration-300 group">
                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                <MapPin size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-wide opacity-50">Visit Us</h4>
                                <p className="text-gray-800 leading-relaxed text-xl font-medium">{school.address}</p>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[2rem] shadow-xl border border-white flex items-start gap-8 hover:-translate-y-2 transition-transform duration-300 group">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                <Phone size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-wide opacity-50">Call Us</h4>
                                <a href={`tel:${school.phone}`} className="text-gray-900 hover:text-green-600 text-2xl font-bold transition-colors block tracking-tight">{school.phone}</a>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[2rem] shadow-xl border border-white flex items-start gap-8 hover:-translate-y-2 transition-transform duration-300 group">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                <Mail size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-wide opacity-50">Email Us</h4>
                                <a href={`mailto:${school.email}`} className="text-gray-900 hover:text-blue-600 text-xl font-bold transition-colors block break-all">{school.email || 'info@timekidspreschools.com'}</a>
                            </div>
                        </div>
                    </div>

                    <div className="h-[600px] bg-gray-100 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-8 border-white transform rotate-2 hover:rotate-0 transition-transform duration-700 ease-out relative">
                        <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.1)]"></div>
                        <iframe
                            className="w-full h-full"
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(school.address + ' ' + school.city + ' TIME Kids Preschool')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

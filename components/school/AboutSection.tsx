"use client";

import React from 'react';
import { motion } from 'framer-motion';



export default function AboutSection({ school }: { school: any }) {
    if (!school) return null;

    return (
        <section id="about" className="py-24 bg-[#fdfaf1] relative overflow-hidden scroll-mt-24">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block"
                    >
                        <span className="py-2 px-6 rounded-full bg-orange-100 text-orange-600 font-bold text-sm uppercase tracking-widest border border-orange-200 mb-6 inline-block">
                            About Us
                        </span>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-gray-900 mb-8 leading-tight">
                        Welcome to T.I.M.E. Kids <span className="text-orange-500 inline-block relative">
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-orange-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed font-medium">
                        We are proud to be a part of the T.I.M.E. Kids family, bringing world-class early childhood education to your neighborhood.
                        Our centre at <span className="text-gray-900 font-bold">{school.address}</span> is equipped with state-of-the-art facilities designed to provide a safe, secure, and stimulating environment.
                    </p>
                </div>



            </div>
        </section>
    );
}

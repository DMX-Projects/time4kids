'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useHomePageContent } from '@/components/home/HomePageContentProvider';
import { Sparkles, Heart, ShieldCheck, GraduationCap, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// --- Content Components ---
const StoryFeature = ({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) => (
    <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay }}
        className="flex gap-6 items-start group"
    >
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-orange-100/50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-sm">
            <Icon size={28} />
        </div>
        <div>
            <h4 className="text-xl font-black text-slate-800 mb-2 font-jakarta">{title}</h4>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">{desc}</p>
        </div>
    </motion.div>
);

const FloatingStatCard = ({ label, value, icon: Icon, className }: { label: string, value: string, icon: any, className: string }) => (
    <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl z-20 flex items-center gap-4 ${className}`}
    >
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
            <Icon size={24} />
        </div>
        <div>
            <div className="text-2xl font-black text-slate-900 font-jakarta">{value}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
        </div>
    </motion.div>
);

export default function IntroSection() {
    const home = useHomePageContent();
    const intro = home.intro;
    const sectionRef = useRef<HTMLDivElement>(null);
    const rightSideRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !rightSideRef.current) return;

        // GSAP Parallax for Floating Elements
        const elements = rightSideRef.current.querySelectorAll('.parallax-element');
        elements.forEach((el, i) => {
            gsap.to(el, {
                y: -50 * (i + 1),
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                }
            });
        });
    }, []);

    return (
        <section 
            id="about" 
            ref={sectionRef}
            className="relative py-24 md:py-40 overflow-hidden bg-[#fffcf5] scroll-mt-20"
        >
            {/* Background Architecture */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-50/50 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/30 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] bg-[url('/images/doodle-pattern.png')] bg-repeat" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    
                    {/* LEFT SIDE: Storytelling Content */}
                    <div className="space-y-10 order-2 lg:order-1">
                        <div className="space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/80 border border-orange-100 shadow-sm backdrop-blur-md"
                            >
                                <Sparkles className="text-orange-500" size={18} />
                                <span className="text-sm font-bold text-orange-600 uppercase tracking-widest font-jakarta">
                                    Trusted Preschool Since 2008
                                </span>
                            </motion.div>

                            <motion.h2 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] font-jakarta"
                            >
                                Where Every Child Begins Their <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                                    Beautiful Journey.
                                </span>
                            </motion.h2>

                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl"
                            >
                                {intro.subtitle}
                            </motion.p>
                        </div>

                        {/* Feature Blocks */}
                        <div className="space-y-8 pt-6">
                            <StoryFeature 
                                icon={ShieldCheck} 
                                title="Safe & Caring Environment" 
                                desc="We provide a warm and nurturing space that feels just like home, ensuring your child's safety and emotional well-veing."
                                delay={0.2}
                            />
                            <StoryFeature 
                                icon={Heart} 
                                title="Love-Based Learning" 
                                desc="Our curriculum is built on the principles of fun, creativity, and love, making every lesson an unforgettable adventure."
                                delay={0.4}
                            />
                            <StoryFeature 
                                icon={GraduationCap} 
                                title="Expert Early Educators" 
                                desc="Led by national leaders in education, our team is dedicated to age-appropriate child development and excellence."
                                delay={0.6}
                            />
                        </div>

                        {/* CTA / Story Link */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8 }}
                            className="pt-6"
                        >
                            <button className="px-8 py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-orange-600 transition-colors shadow-xl flex items-center gap-3 group">
                                Learn More About Us
                                <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                    →
                                </motion.div>
                            </button>
                        </motion.div>
                    </div>

                    {/* RIGHT SIDE: Cinematic Visual Composition */}
                    <div ref={rightSideRef} className="relative order-1 lg:order-2">
                        {/* Central Visual Composition */}
                        <div className="relative aspect-square w-full max-w-[500px] mx-auto">
                            {/* Animated Background Blobs */}
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
                                transition={{ duration: 20, repeat: Infinity }}
                                className="absolute inset-0 bg-gradient-to-tr from-orange-200/40 to-blue-200/40 blur-[100px] rounded-[30%_70%_70%_30%/30%_30%_70%_70%]"
                            />

                            {/* Main Child Image Placeholder (Will use the one from Hero or similar) */}
                            <div className="relative z-10 w-full h-full rounded-[60px] overflow-hidden border-8 border-white shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 group">
                                <Image 
                                    src="/images/gallery/IMG_01.JPG" // Using an existing gallery image for high quality
                                    alt="Learning at T.I.M.E. Kids"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            {/* Floating Decorative Elements */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="parallax-element absolute -top-16 left-0 w-24 h-24 text-orange-200 opacity-40"
                            >
                                <Sparkles size={96} />
                            </motion.div>
                            <motion.div 
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="parallax-element absolute bottom-20 -right-12 w-20 h-20 bg-blue-100 rounded-3xl rotate-12 flex items-center justify-center text-blue-500 shadow-lg"
                            >
                                <span className="text-3xl font-black">A</span>
                            </motion.div>
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="parallax-element absolute -bottom-16 right-1/4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 shadow-lg"
                            >
                                <Heart fill="currentColor" size={32} />
                            </motion.div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Wave decoration to transition into next section */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </section>
    );
}

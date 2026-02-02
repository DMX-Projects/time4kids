'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { apiUrl } from '@/lib/api-client';

const CounterSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    const [dynamicStats, setDynamicStats] = useState({
        total_schools: 350,
        total_cities: 83,
        total_students: 50000
    });

    const stats = [
        { label: 'Schools', value: dynamicStats.total_schools, color: 'text-[#003366]' },
        { label: 'Cities', value: dynamicStats.total_cities, color: 'text-[#4DA6FF]' },
        { label: 'Smart Students Trained', value: dynamicStats.total_students, color: 'text-[#FF9933]' },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(apiUrl('/franchises/public/stats/'));
                if (res.ok) {
                    const data = await res.json();
                    setDynamicStats(data);
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <section ref={sectionRef} className="relative py-16 bg-[#E0F2FE] overflow-hidden">
            {/* Top Border - Scallop Pattern */}
            <div className="absolute top-0 left-0 w-full h-8 z-30 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-0 left-0 w-[200%] h-full"
                    animate={{ x: [-60, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                >
                    <svg className="w-full h-full block" preserveAspectRatio="none" viewBox="0 0 1200 24">
                        <defs>
                            <pattern id="scallopPatternTop" x="0" y="0" width="60" height="24" patternUnits="userSpaceOnUse">
                                <path d="M0 0 V12 Q15 24 30 12 T60 12 V0 H0 Z" fill="white" />
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width="100%" height="24" fill="url(#scallopPatternTop)" />
                    </svg>
                </motion.div>
            </div>

            {/* Background Bubbles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white/40 rounded-full border border-white/20"
                        style={{
                            width: `${Math.random() * 15 + 5}px`,
                            height: `${Math.random() * 15 + 5}px`,
                            left: `${Math.random() * 100}%`,
                            bottom: '-20px'
                        }}
                        animate={{ y: [-20, -150], opacity: [0.4, 0] }}
                        transition={{
                            duration: Math.random() * 3 + 4,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-wrap justify-center gap-6 md:gap-14 max-w-6xl mx-auto">
                    {stats.map((stat, index) => (
                        <CounterCard
                            key={index}
                            stat={stat}
                            isInView={isInView}
                            delay={index * 0.2}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Border - Scallop Pattern */}
            <div className="absolute bottom-0 left-0 w-full h-8 z-30 pointer-events-none rotate-180 overflow-hidden">
                <motion.div
                    className="absolute top-0 left-0 w-[200%] h-full"
                    animate={{ x: [-60, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                    <svg className="w-full h-full block" preserveAspectRatio="none" viewBox="0 0 1200 24">
                        <rect x="0" y="0" width="100%" height="24" fill="url(#scallopPatternTop)" />
                    </svg>
                </motion.div>
            </div>
        </section>
    );
};

const CounterCard = ({ stat, isInView, delay }: { stat: any, isInView: boolean, delay: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        let startTime: number | null = null;
        const duration = 2000; // 2 seconds
        const targetValue = stat.value;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime - (delay * 1000);

            if (elapsed < 0) {
                requestAnimationFrame(animate);
                return;
            }

            const progress = Math.min(elapsed / duration, 1);
            const easeOutProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            const currentCount = Math.floor(easeOutProgress * targetValue);
            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(targetValue);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, stat.value, delay]);

    return (
        <motion.div
            className="relative w-60 h-40 flex items-center justify-center group"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay }}
        >
            {/* Cloud SVG Background */}
            <motion.div
                className="absolute inset-0 z-0"
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <svg viewBox="0 0 500 300" className="w-full h-full text-white fill-current drop-shadow-xl" preserveAspectRatio="none">
                    <path d="M 400 200 Q 450 200 480 170 Q 500 140 480 110 Q 460 70 410 70 Q 390 30 340 30 Q 300 0 250 20 Q 200 0 160 30 Q 110 30 90 70 Q 40 70 20 110 Q 0 140 20 170 Q 50 200 100 200 Z" />
                </svg>
            </motion.div>

            {/* Text - High Contrast and Z-Index */}
            <div className="relative z-20 text-center select-none pt-2">
                <motion.span
                    className={`block font-fredoka font-bold text-4xl md:text-5xl ${stat.color} drop-shadow-sm`}
                    animate={isInView ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3, delay: delay + 2 }}
                >
                    {count.toLocaleString()}+
                </motion.span>
                <span className="block text-sm md:text-base text-[#003366] font-bold font-baloo uppercase tracking-widest mt-1">
                    {stat.label}
                </span>
            </div>
        </motion.div>
    );
};

export default CounterSection;
'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}



const CountUpSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const countersRef = useRef<HTMLDivElement>(null);

    const stats = [
        { label: 'Schools', value: 350, color: 'text-[#003366]' },
        { label: 'Cities', value: 83, color: 'text-[#4DA6FF]' },
        { label: 'Smart Students Trained', value: 50000, color: 'text-[#FF9933]' },
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate numbers
            if (countersRef.current) {
                const counters = countersRef.current.querySelectorAll('.counter-value');

                counters.forEach((counter) => {
                    const target = parseInt(counter.getAttribute('data-target') || '0');

                    gsap.to(counter, {
                        innerHTML: target,
                        duration: 4, // Reduced duration for better UX
                        snap: { innerHTML: 1 },
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: 'top 70%',
                            toggleActions: 'play none none reverse',
                        },
                        onUpdate: function () {
                            counter.innerHTML = Math.ceil(this.targets()[0].innerHTML).toString();
                        }
                    });
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative py-10 bg-sky-200 overflow-hidden">
            {/* Dynamic Cloud Background Elements (Optional decorative clouds) */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-10 left-[10%] w-32 h-16 bg-white rounded-full blur-xl"></div>
                <div className="absolute top-40 right-[20%] w-48 h-24 bg-white rounded-full blur-xl"></div>
                <div className="absolute bottom-20 left-[30%] w-40 h-20 bg-white rounded-full blur-xl"></div>
            </div>

            {/* Top Wave */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[50px] transform rotate-180">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff" fillOpacity="1"></path>
                </svg>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div ref={countersRef} className="grid md:grid-cols-3 gap-12 text-center max-w-6xl mx-auto">
                    {stats.map((stat, index) => (
                        <div key={index} className="relative flex items-center justify-center p-8 md:p-10 group hover:scale-105 transition-transform duration-300 h-48 md:h-56">
                            {/* Cloud Background Shape */}
                            <div className="absolute inset-0 z-0 scale-110 opacity-100">
                                {/* Using a custom SVG cloud path for the shape */}
                                <svg viewBox="0 0 500 300" className="w-full h-full drop-shadow-xl text-white fill-current" preserveAspectRatio="none">
                                    <path d="M 400 200 Q 450 200 480 170 Q 500 140 480 110 Q 460 70 410 70 Q 390 30 340 30 Q 300 0 250 20 Q 200 0 160 30 Q 110 30 90 70 Q 40 70 20 110 Q 0 140 20 170 Q 50 200 100 200 Z" />
                                </svg>
                            </div>

                            <div className="relative z-10 flex flex-col items-center -mt-4">
                                <span
                                    className={`counter-value font-fredoka font-bold text-5xl md:text-6xl mb-1 ${stat.color}`}
                                    data-target={stat.value}
                                >
                                    0
                                </span>
                                <span className="text-xl md:text-2xl text-[#003366] font-bold font-baloo mt-1">
                                    {stat.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[50px]">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff" fillOpacity="1"></path>
                </svg>
            </div>
        </section>
    );
};



export default CountUpSection;

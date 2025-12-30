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

    const scallopPath = "M0,0 V12 Q15,24 30,12 T60,12 T90,12 T120,12 T150,12 T180,12 T210,12 T240,12 T270,12 T300,12 T330,12 T360,12 T390,12 T420,12 T450,12 T480,12 T510,12 T540,12 T570,12 T600,12 T630,12 T660,12 T690,12 T720,12 T750,12 T780,12 T810,12 T840,12 T870,12 T900,12 T930,12 T960,12 T990,12 T1020,12 T1050,12 T1080,12 T1110,12 T1140,12 T1170,12 T1200,12 V0 Z";

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (!countersRef.current) return;
            
            // 1. Counter Animation with a "Pop" at the end
            const counters = countersRef.current.querySelectorAll('.counter-wrapper');
            
            counters.forEach((wrapper) => {
                const counterSpan = wrapper.querySelector('.counter-value');
                if (!counterSpan) return;
                
                const target = parseInt(counterSpan.getAttribute('data-target') || '0');
                
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 85%',
                    }
                });

                tl.fromTo(counterSpan, 
                    { innerHTML: 0 }, 
                    {
                        innerHTML: target,
                        duration: 2,
                        snap: { innerHTML: 1 },
                        ease: 'power2.out',
                        onUpdate: function () {
                            const val = Math.ceil(this.targets()[0].innerHTML);
                            counterSpan.innerHTML = val.toLocaleString() + (target > 100 ? '+' : '');
                        }
                    }
                )
                // The "Pop" effect
                .to(wrapper, { scale: 1.1, duration: 0.2, ease: "back.out(2)" })
                .to(wrapper, { scale: 1, duration: 0.2 });
            });

            // 2. Continuous Floating Clouds
            gsap.to(".floating-cloud", {
                y: -12,
                x: 5,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: { each: 0.4, from: "random" }
            });

            // 3. Bubbles floating up
            gsap.to(".bubble", {
                y: -150,
                opacity: 0,
                duration: "random(4, 7)",
                repeat: -1,
                ease: "none",
                stagger: 0.3
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative py-12 bg-[#E0F2FE] overflow-hidden">
            
            {/* Top Border */}
            <div className="absolute top-0 left-0 w-full z-30 pointer-events-none">
                <svg viewBox="0 0 1200 24" className="w-full h-8 block" preserveAspectRatio="none">
                    <path d={scallopPath} fill="white" />
                </svg>
            </div>

            {/* Background Bubbles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div 
                        key={i} 
                        className="bubble absolute bg-white/40 rounded-full border border-white/20"
                        style={{
                            width: `${Math.random() * 15 + 5}px`,
                            height: `${Math.random() * 15 + 5}px`,
                            left: `${Math.random() * 100}%`,
                            bottom: '-20px'
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div ref={countersRef} className="flex flex-wrap justify-center gap-6 md:gap-14 max-w-6xl mx-auto">
                    {stats.map((stat, index) => (
                        <div key={index} className="counter-wrapper relative w-60 h-40 flex items-center justify-center group">
                            
                            {/* Cloud SVG Background */}
                            <div className="floating-cloud absolute inset-0 z-0">
                                <svg viewBox="0 0 500 300" className="w-full h-full text-white fill-current drop-shadow-xl" preserveAspectRatio="none">
                                    <path d="M 400 200 Q 450 200 480 170 Q 500 140 480 110 Q 460 70 410 70 Q 390 30 340 30 Q 300 0 250 20 Q 200 0 160 30 Q 110 30 90 70 Q 40 70 20 110 Q 0 140 20 170 Q 50 200 100 200 Z" />
                                </svg>
                            </div>

                            {/* Text - High Contrast and Z-Index */}
                            <div className="relative z-20 text-center select-none pt-2">
                                <span
                                    className={`counter-value block font-fredoka font-bold text-4xl md:text-5xl ${stat.color} drop-shadow-sm`}
                                    data-target={stat.value}
                                >
                                    0
                                </span>
                                <span className="block text-sm md:text-base text-[#003366] font-bold font-baloo uppercase tracking-widest mt-1">
                                    {stat.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Border */}
            <div className="absolute bottom-0 left-0 w-full z-30 pointer-events-none rotate-180">
                <svg viewBox="0 0 1200 24" className="w-full h-8 block" preserveAspectRatio="none">
                    <path d={scallopPath} fill="white" />
                </svg>
            </div>
        </section>
    );
};

export default CountUpSection;
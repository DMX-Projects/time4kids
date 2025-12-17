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
        { label: 'Schools', value: 350 },
        { label: 'Cities', value: 83 },
        { label: 'Smart Students Trained', value: 50000 },
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
                        duration: 15,
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
        <section ref={sectionRef} className="relative py-24 bg-[#003366] text-white overflow-hidden">
            {/* Top Wave */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px] transform rotate-180">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff" fillOpacity="1"></path>
                </svg>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div ref={countersRef} className="grid md:grid-cols-3 gap-12 text-center">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <span
                                className="counter-value font-display font-bold text-5xl md:text-7xl mb-4"
                                data-target={stat.value}
                            >
                                0
                            </span>
                            <span className="text-xl md:text-2xl text-blue-100 font-medium">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px]">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff" fillOpacity="1"></path>
                </svg>
            </div>
        </section>
    );
};

export default CountUpSection;

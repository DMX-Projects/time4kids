'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const WhyChooseUs = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const pupilRefs = useRef<(HTMLDivElement | null)[]>([]);
    const waveRef = useRef<SVGSVGElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Entrance & Floating Animation
            cardRefs.current.forEach((card, index) => {
                if (!card) return;
                gsap.from(card, {
                    scrollTrigger: { trigger: card, start: 'top 90%' },
                    y: 60, opacity: 0, scale: 0.9,
                    duration: 1.2, ease: 'back.out(1.4)', delay: index * 0.1,
                });
            });

            // Wavy Background Animation
            if (waveRef.current) {
                gsap.to(waveRef.current, {
                    x: "-=50", y: "+=20",
                    duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut"
                });
            }
        }, sectionRef);

        const handleGlobalMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        return () => {
            ctx.revert();
            window.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, []);

    // Eye Tracking Logic
    useEffect(() => {
        pupilRefs.current.forEach((pupil) => {
            if (!pupil) return;
            const rect = pupil.parentElement?.getBoundingClientRect();
            if (rect) {
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const angle = Math.atan2(mousePos.y - centerY, mousePos.x - centerX);
                const distance = Math.min(8, Math.hypot(mousePos.x - centerX, mousePos.y - centerY) / 12);
                gsap.to(pupil, { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, duration: 0.2 });
            }
        });
    }, [mousePos]);

    const handleMouseMove = (e: React.MouseEvent, index: number) => {
        const card = cardRefs.current[index];
        if (card) {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - (rect.left + rect.width / 2)) * 0.12;
            const y = (e.clientY - (rect.top + rect.height / 2)) * 0.12;
            gsap.to(card, { x, y, rotate: x * 0.1, duration: 0.6 });
        }
    };

    const handleMouseLeave = (index: number) => {
        gsap.to(cardRefs.current[index], { x: 0, y: 0, rotate: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
    };

    const handlePop = (e: React.MouseEvent, color: string) => {
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            Object.assign(p.style, {
                position: 'fixed', left: `${e.clientX}px`, top: `${e.clientY}px`,
                width: '10px', height: '10px', backgroundColor: color, borderRadius: '3px',
                zIndex: '999', pointerEvents: 'none'
            });
            document.body.appendChild(p);
            gsap.to(p, {
                x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200,
                opacity: 0, scale: 0, duration: 0.8, onComplete: () => p.remove()
            });
        }
    };

    const features = [
        { image: '/infra.jpg', title: 'Safe Infrastructure', desc: 'Secure premises for complete peace of mind.', color: '#FEE2E2', accent: '#EF4444' },
        { image: '/11.png', title: 'Trained Teachers', desc: 'Experienced educators nurturing your child.', color: '#E0F2FE', accent: '#0EA5E9' },
        { image: '/4.png', title: 'NEP 2020 Curriculum', desc: 'Modern curriculum for holistic growth.', color: '#FFEDD5', accent: '#F97316' },
        { image: '/17.png', title: '17 Years Legacy', desc: 'Educational expertise since 2005.', color: '#DCFCE7', accent: '#22C55E' },
        { image: '/18.png', title: 'Caring Environment', desc: 'A second home for your little one.', color: '#FDF2F8', accent: '#EC4899' },
        { image: '/12.png', title: 'Fun Learning', desc: 'Hands-on activities and play.', color: '#F5F3FF', accent: '#8B5CF6' },
    ];

    return (
        <section ref={sectionRef} className="py-20 md:py-24 bg-[#FDFCFB] relative overflow-hidden select-none">

            {/* Animated Wave BG */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <svg ref={waveRef} className="absolute top-0 left-0 w-[200%] h-full" viewBox="0 0 1200 800" fill="none">
                    <path d="M1200 400C1050 300 900 500 750 400C600 300 450 500 300 400C150 300 0 500 0 400V800H1200V400Z" fill="#F3F4F6" fillOpacity="0.5" />
                </svg>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 md:mb-20">
                    <h2 className="font-fredoka font-bold text-4xl md:text-7xl text-[#003366]">
                        Why Choose <span className="text-[#E67E22]">T.I.M.E. Kids?</span>
                    </h2>
                </div>

                {/* UPDATED: grid-cols-1 for Mobile, lg:grid-cols-3 for Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            ref={(el) => { cardRefs.current[index] = el; }}
                            onMouseMove={(e) => handleMouseMove(e, index)}
                            onMouseLeave={() => handleMouseLeave(index)}
                            onClick={(e) => handlePop(e, feature.accent)}
                            className="relative flex flex-col items-center group cursor-pointer max-w-sm mx-auto w-full"
                        >
                            {/* Card Content */}
                            <div
                                className="relative w-full p-8 pb-16 transition-all duration-300"
                                style={{
                                    backgroundColor: feature.color,
                                    borderRadius: '50px 100px 50px 110px / 80px 50px 110px 50px'
                                }}
                            >
                                <div className="absolute inset-2 border-[2px] border-dashed rounded-[inherit] opacity-30" style={{ borderColor: feature.accent }} />

                                <h3 className="font-fredoka font-bold text-2xl text-center mb-6 relative z-10" style={{ color: feature.accent }}>
                                    {feature.title}
                                </h3>

                                <div
                                    className="relative w-full aspect-[4/3] bg-white overflow-hidden mb-6 border-4 border-white shadow-inner relative z-10"
                                    style={{ borderRadius: '70px 40px 80px 50px / 50px 70px 45px 85px' }}
                                >
                                    <Image src={feature.image} alt={feature.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700 p-1" />
                                </div>

                                <p className="text-gray-600 font-medium text-center text-lg leading-snug px-2 relative z-10">
                                    {feature.desc}
                                </p>

                                {/* Eye Icon */}
                                <div
                                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg border-[6px] z-20"
                                    style={{ borderColor: feature.accent }}
                                >
                                    <div ref={(el) => { pupilRefs.current[index] = el; }} className="w-4 h-4 rounded-full bg-[#111]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
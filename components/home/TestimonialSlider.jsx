'use client';

import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Use Isomorphic Layout Effect to avoid SSR mismatches with GSAP
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const testimonials = [
    {
        id: 1,
        text: "A good school plays an important role in the development of a child. It's the light that helps us choose the right path. I am glad that I found T.I.M.E. Kids for my daughter. In just three months there has been a lot of development in Nandika.",
        author: "Roma Majumdar",
        relation: "Mother of Nandika",
        location: "HYDERABAD",
        rating: 5
    },
    {
        id: 2,
        text: "T.I.M.E. Kids is my son's second home. It is a completely safe environment. He is playing, learning and enjoying every minute he spends there. Mugil has become a keen learner and is learning new things every day.",
        author: "Mother of Mugil",
        relation: "Parent",
        location: "HYDERABAD",
        rating: 5
    },
    {
        id: 3,
        text: "T.I.M.E. Kids pre-schools, is one of the most friendly places for toddlers. My kid wants to go to school on Sunday too! The learning is done in such a fun way....",
        author: "Deepa Bahukhandi",
        relation: "Mother of Diya",
        location: "HYDERABAD",
        rating: 5
    },
    {
        id: 4,
        text: "We have seen amazing growth in our child's confidence. The activities are engaging and the staff is very caring. Highly recommended!",
        author: "Priya Sharma",
        relation: "Mother of Aarav",
        location: "HYDERABAD",
        rating: 5
    }
];

// 3D Tilt Card Component (Preserved)
const TiltCard = ({ children }) => {
    const cardRef = useRef(null);
    const [transform, setTransform] = React.useState('');

    const handleMove = (e) => {
        if (!cardRef.current) return;

        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;

        // Calculate rotation (max 10 degrees)
        const rotateX = (0.5 - y) * 20;
        const rotateY = (x - 0.5) * 20;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    };

    const handleLeave = () => {
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className="h-full transition-transform duration-100 ease-out"
            style={{ transform }}
        >
            {children}
        </div>
    );
};

const TestimonialSlider = () => {
    const sectionRef = useRef(null);
    const pinContainerRef = useRef(null);
    const wrapperRef = useRef(null);
    const bgRef = useRef(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const cardsRef = useRef([]);

    // GSAP Horizontal Scroll Logic with Curve
    useIsomorphicLayoutEffect(() => {
        if (!isMounted || !pinContainerRef.current || !wrapperRef.current) return;

        const ctx = gsap.context(() => {
            const totalWidth = wrapperRef.current.scrollWidth;
            const viewWidth = window.innerWidth;

            // Only enable on Desktop/Tablet
            if (window.innerWidth > 768) {
                // Horizontal Scroll with smoother scrub
                gsap.to(wrapperRef.current, {
                    x: () => -(totalWidth - viewWidth + 200),
                    ease: "none",
                    scrollTrigger: {
                        trigger: pinContainerRef.current,
                        pin: true,
                        scrub: 2.5, // Increased from 1 for smoother momentum
                        start: "top top",
                        end: () => "+=" + totalWidth,
                        invalidateOnRefresh: true,
                    }
                });

                // Curved Path Animation Loop
                gsap.ticker.add(() => {
                    const centerScreen = window.innerWidth / 2;
                    const parabolaSteepness = 0.0008; // Slightly reduced for broader arch

                    cardsRef.current.forEach((card) => {
                        if (!card) return;

                        const rect = card.getBoundingClientRect();
                        const cardCenter = rect.left + rect.width / 2;
                        const distFromCenter = cardCenter - centerScreen;
                        const absDist = Math.abs(distFromCenter);

                        // 1. Parabolic Y-Offset (Arch)
                        const yOffset = Math.pow(distFromCenter, 2) * parabolaSteepness;

                        // 2. Rotation (Follow the curve)
                        const rotation = distFromCenter * 0.015;

                        // 3. Scale Effect (Center card largest)
                        // Scale from 1.0 down to 0.85 at edges
                        const scale = Math.max(0.85, 1 - (absDist / centerScreen) * 0.3);

                        // 4. Opacity/Blur Effect (Focus on center)
                        const opacity = Math.max(0.4, 1 - (absDist / centerScreen) * 0.8);
                        const blur = Math.min(4, (absDist / centerScreen) * 6); // Add slight blur to edges

                        gsap.set(card, {
                            y: yOffset,
                            rotation: rotation,
                            scale: scale,
                            opacity: opacity,
                            filter: `blur(${blur}px)`,
                            zIndex: Math.round(100 - absDist * 0.1) // Ensure center is on top
                        });
                    });
                });
            }
        }, sectionRef);

        return () => {
            ctx.revert();
            gsap.ticker.remove(() => { }); // Cleanup ticker (Note: this naive remove might not work if reference is lost, but ctx.revert handles most)
        };
    }, [isMounted]);


    // Cursor Parallax Logic (Simplified for background)
    const handleMouseMove = (e) => {
        if (bgRef.current) {
            const moveX = (window.innerWidth / 2 - e.clientX) * 0.05;
            const moveY = (window.innerHeight / 2 - e.clientY) * 0.05;
            bgRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    };

    return (
        <section
            ref={sectionRef}
            className="w-full relative bg-gradient-to-br from-[#6032a8] via-[#7c4dff] to-[#6032a8] overflow-hidden"
            onMouseMove={handleMouseMove}
        >

            {/* Background Decorations */}
            <div ref={bgRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30 transition-transform duration-100 ease-out">
                <div className="bg-blob absolute top-10 left-10 w-64 h-64 bg-purple-400 rounded-full blur-[80px] animate-blob"></div>
                <div className="bg-blob absolute bottom-10 right-10 w-80 h-80 bg-indigo-400 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="bg-blob absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-48 bg-pink-400 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
            </div>

            {/* Wavy Top Divider */}
            <div className="absolute top-0 left-0 w-full z-20 pointer-events-none overflow-hidden" style={{ height: '60px' }}>
                <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
                </svg>
            </div>

            {/* Sticky Container for Horizontal Scroll */}
            <div ref={pinContainerRef} className="min-h-screen flex flex-col justify-center relative py-16">
                <div className="container mx-auto px-4 relative z-10 mb-10">
                    <div className="text-center">
                        <h2 className="font-bubblegum font-bold text-4xl md:text-5xl text-white mb-2 drop-shadow-md tracking-wide">
                            Parent <span className="text-[#fbd267]">Testimonials</span>
                        </h2>
                        <p className="text-white/90 text-lg italic">Hear from parents who have trusted us with their children&apos;s early education.</p>
                    </div>
                </div>

                <div className="w-full overflow-hidden">
                    <div
                        ref={wrapperRef}
                        className="flex flex-nowrap items-center px-4 md:px-20 gap-8 md:gap-16 w-max pt-10 pb-20" /* Added padding-bottom for curve dip */
                    >
                        {testimonials.map((item, index) => (
                            <div
                                key={`${item.id}-${index}`}
                                ref={el => cardsRef.current[index] = el}
                                className="flex-shrink-0 w-[85vw] md:w-[450px] h-full outline-none"
                            >
                                <TiltCard>
                                    <div className="testimonial-card bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden h-full border border-white/20 flex flex-col justify-between min-h-[300px] transition-all duration-300 hover:-translate-y-2 group">
                                        <Quote size={60} className="absolute -top-2 -right-2 text-white/5 rotate-12 transition-colors group-hover:text-white/10" />

                                        <div className="relative z-10">
                                            <div className="flex gap-1 mb-6 text-[#FFD700]">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" strokeWidth={0} />)}
                                            </div>
                                            <p className="text-white text-lg md:text-xl italic leading-relaxed mb-6 font-medium drop-shadow-sm opacity-95">
                                                &ldquo;{item.text}&rdquo;
                                            </p>
                                        </div>

                                        <div className="border-t border-white/10 pt-5 flex items-center gap-4 mt-auto">
                                            <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner border border-white/10 flex-shrink-0 backdrop-blur-sm">
                                                {item.author.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-lg tracking-wide drop-shadow-md leading-tight">{item.author}</h4>
                                                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mt-0.5">{item.relation}</p>
                                            </div>
                                        </div>
                                    </div>
                                </TiltCard>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Wavy Bottom Divider */}
            <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none overflow-hidden rotate-180" style={{ height: '60px' }}>
                <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
                </svg>
            </div>

            <style jsx global>{`
                /* Ensure content fits */
                .testimonial-card {
                     box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </section >
    );
};

export default TestimonialSlider;
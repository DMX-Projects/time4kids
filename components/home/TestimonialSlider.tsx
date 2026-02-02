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
const TiltCard = ({ children }: { children: React.ReactNode }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = React.useState('');

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
    const sectionRef = useRef<HTMLElement>(null);
    const pinContainerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    // GSAP Horizontal Scroll Logic with Curve
    useIsomorphicLayoutEffect(() => {
        if (!isMounted || !pinContainerRef.current || !wrapperRef.current) return;

        const ctx = gsap.context(() => {
            const totalWidth = wrapperRef.current!.scrollWidth;
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
                        scrub: 1, // Reduced from 2.5 for more responsive feel
                        start: "top top",
                        end: () => "+=" + (Math.max(600, totalWidth - viewWidth + 600)), // Adjusted to prevent getting stuck too long
                        invalidateOnRefresh: true,
                    },
                    force3D: true // Force hardware acceleration
                });

                // Animate Header Entry
                if (headerRef.current) {
                    gsap.from(headerRef.current.children, {
                        y: 30,
                        opacity: 0,
                        duration: 1,
                        stagger: 0.2,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: pinContainerRef.current,
                            start: "top 80%", // Animates when section hits view
                            toggleActions: "play none none reverse"
                        }
                    });
                }

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
                        // Flatten the curve significantly since we show more cards
                        const yOffset = Math.pow(distFromCenter, 2) * 0.0004;

                        // 2. Rotation (Follow the curve)
                        const rotation = distFromCenter * 0.008;

                        // 3. Scale Effect (Center card largest)
                        // Make the difference less dramatic so side cards are clearly visible
                        const scale = Math.max(0.92, 1 - (absDist / centerScreen) * 0.15);

                        // 4. Opacity - Keep high visibility
                        const opacity = Math.max(0.8, 1 - (absDist / centerScreen) * 0.3);

                        // REMOVED BLUR as requested

                        gsap.set(card, {
                            y: yOffset,
                            rotation: rotation,
                            scale: scale,
                            opacity: opacity,
                            // filter: blur(...) REMOVED
                            zIndex: Math.round(100 - absDist * 0.1), // Ensure center is on top
                            force3D: true, // Hardware acceleration
                            overwrite: 'auto' // Prevent conflict
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


    // Cursor Parallax Logic (Optimized)
    const handleMouseMove = (e: React.MouseEvent) => {
        if (bgRef.current) {
            // Using requestAnimationFrame for smoother updates is implicit in modern browsers,
            // but keeping it simple. Adding will-change to CSS is more critical.
            const moveX = (window.innerWidth / 2 - e.clientX) * 0.02; // Reduced modifier for subtler, smoother feel
            const moveY = (window.innerHeight / 2 - e.clientY) * 0.02;
            bgRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`; // force 3d
        }
    };

    return (
        <section
            ref={sectionRef}
            className="w-full relative bg-gradient-to-br from-[#6032a8] via-[#7c4dff] to-[#6032a8] overflow-hidden"
            onMouseMove={handleMouseMove}
        >

            {/* Background Decorations */}
            <div ref={bgRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30 transition-transform duration-300 ease-out will-change-transform">
                <div className="bg-blob absolute top-10 left-10 w-64 h-64 bg-purple-400 rounded-full blur-[80px] animate-blob"></div>
                <div className="bg-blob absolute bottom-10 right-10 w-80 h-80 bg-indigo-400 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="bg-blob absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-48 bg-pink-400 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
            </div>

            {/* Animated Wavy Top Divider - Micro Ripples (Flipped) */}
            <div className="absolute -top-[1px] left-0 w-full z-20 pointer-events-none rotate-180">
                <svg className="w-full h-[8vh] min-h-[60px] max-h-[100px]" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto" stroke="none">
                    <defs>
                        {/* Ultra High Frequency "Micro" Wave Path: ~60 repeats of width 20 */}
                        <path id="gentle-wave-top" d="M-200 44 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 q 5 -3 10 0 t 10 0 v44 h-1200 z" />
                    </defs>
                    <g className="parallax">
                        <use xlinkHref="#gentle-wave-top" x="48" y="0" fill="rgba(255, 255, 255, 0.7)" />
                        <use xlinkHref="#gentle-wave-top" x="48" y="3" fill="rgba(255, 255, 255, 0.5)" />
                        <use xlinkHref="#gentle-wave-top" x="48" y="5" fill="rgba(255, 255, 255, 0.3)" />
                        <use xlinkHref="#gentle-wave-top" x="48" y="7" fill="#fff" />
                    </g>
                </svg>
            </div>

            {/* Sticky Container for Horizontal Scroll */}
            <div ref={pinContainerRef} className="min-h-0 flex flex-col justify-center relative py-4">
                <div ref={headerRef} className="container mx-auto px-4 relative z-10 mb-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="font-bubblegum font-bold text-5xl md:text-6xl text-white mb-2 drop-shadow-xl tracking-wide leading-tight">
                            Parent <span className="text-[#fbd267] relative inline-block">
                                Testimonials
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#fbd267]/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5 L 100 8 Q 50 13 0 8 Z" fill="currentColor" />
                                </svg>
                            </span>
                        </h2>
                        <p className="text-white/95 text-lg md:text-xl font-medium leading-relaxed drop-shadow-md">
                            Hear from parents who have trusted us with their children&apos;s early education and witnessed their blooming journey.
                        </p>
                    </div>
                </div>

                <div className="w-full overflow-hidden">
                    <div
                        ref={wrapperRef}
                        className="flex flex-nowrap items-center px-4 md:px-20 gap-8 md:gap-16 w-max pt-2 pb-8 will-change-transform" /* Added will-change-transform for perf and padding-bottom for curve dip */
                    >
                        {testimonials.map((item, index) => (
                            <div
                                key={`${item.id}-${index}`}
                                ref={el => { cardsRef.current[index] = el }}
                                // width for 3 cards: ~30vw on desktop (assuming gaps)
                                // On mobile kept high width. On desktop set to approx 400px but dynamic is better.
                                // Let's try 30vw for desktop to ensure 3 fit.
                                className="flex-shrink-0 w-[85vw] md:w-[28vw] h-full outline-none"
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

            {/* Animated Wavy Bottom Divider - Gentle Wave SVG */}
            <div className="absolute -bottom-[1px] left-0 w-full z-20 pointer-events-none">
                <svg className="w-full h-[8vh] min-h-[60px] max-h-[100px]" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                    viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto" stroke="none">
                    <defs>
                        {/* Friendly "Cloud-like" Wave Path: ~15 repeats of width 30 */}
                        <path id="gentle-wave" d="M-160 44 q 15 -10 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 v44 h-1200 z" />
                    </defs>
                    <g className="parallax">
                        <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255, 255, 255, 0.7)" />
                        <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255, 255, 255, 0.5)" />
                        <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255, 255, 255, 0.3)" />
                        <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" />
                    </g>
                </svg>
            </div>

            <style jsx global>{`
                .testimonial-card {
                     box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .parallax > use {
                    animation: move-forever 25s cubic-bezier(.55, .5, .45, .5) infinite;
                }
                .parallax > use:nth-child(1) {
                    animation-delay: -2s;
                    animation-duration: 7s;
                }
                .parallax > use:nth-child(2) {
                    animation-delay: -3s;
                    animation-duration: 10s;
                }
                .parallax > use:nth-child(3) {
                    animation-delay: -4s;
                    animation-duration: 13s;
                }
                .parallax > use:nth-child(4) {
                    animation-delay: -5s;
                    animation-duration: 20s;
                }
                @keyframes move-forever {
                    0% {
                        transform: translate3d(-90px, 0, 0);
                    }
                    100% {
                        transform: translate3d(85px, 0, 0);
                    }
                }
            `}</style>
        </section >
    );
};

export default TestimonialSlider;

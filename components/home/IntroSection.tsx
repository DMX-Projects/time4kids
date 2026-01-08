'use client';

import React from 'react';
import { motion } from 'framer-motion';

const RedBiplane = () => (
    <svg viewBox="0 0 500 200" className="w-full h-full drop-shadow-2xl filter" style={{ overflow: 'visible' }}>
        {/* Propeller - Animated */}
        <g transform="translate(480, 85)">
            <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 480 85"
                to="360 480 85"
                dur="0.1s"
                repeatCount="indefinite"
            />
            <rect x="-5" y="-35" width="10" height="70" fill="#e5e5e5" rx="2" />
            <circle cx="0" cy="0" r="5" fill="#333" />
        </g>

        {/* Plane Body */}
        <path d="M150,80 Q250,60 400,80 L480,90 L400,120 Q250,140 150,110 Z" fill="#dc2626" stroke="#b91c1c" strokeWidth="2" />

        {/* Wings */}
        <path d="M220,85 L380,85 L360,50 L240,50 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
        <path d="M220,95 L380,95 L390,120 L210,120 Z" fill="#b91c1c" />

        {/* Struts */}
        <line x1="250" y1="50" x2="250" y2="85" stroke="#333" strokeWidth="2" />
        <line x1="350" y1="50" x2="350" y2="85" stroke="#333" strokeWidth="2" />
        <line x1="250" y1="50" x2="350" y2="85" stroke="#333" strokeWidth="1" />
        <line x1="350" y1="50" x2="250" y2="85" stroke="#333" strokeWidth="1" />

        {/* Tail */}
        <path d="M150,80 L120,60 L100,60 L150,90" fill="#dc2626" stroke="#b91c1c" strokeWidth="2" />
        <path d="M150,110 L120,130 L160,115" fill="#dc2626" />

        {/* Cockpit / Pilot */}
        <path d="M300,80 Q320,60 340,80" fill="#333" opacity="0.5" />
        <circle cx="320" cy="75" r="8" fill="#333" />

        {/* Wheels */}
        <g transform="translate(300, 130)">
            <rect x="0" y="0" width="20" height="20" rx="10" fill="#111" />
            <rect x="50" y="0" width="20" height="20" rx="10" fill="#111" />
            <line x1="10" y1="0" x2="20" y2="-20" stroke="#333" strokeWidth="3" />
            <line x1="60" y1="0" x2="50" y2="-20" stroke="#333" strokeWidth="3" />
        </g>
    </svg>
);

export default function IntroSection() {
    return (
        <section className="relative w-full overflow-hidden bg-[#7DD3FC] py-20 min-h-[600px] flex flex-col items-center justify-center">
            {/* Syllabus Clouds - Optional subtle background decoration */}
            <div className="absolute top-10 left-10 opacity-60">
                <svg width="100" height="60" viewBox="0 0 100 60" fill="white">
                    <path d="M10 40 Q20 10 40 30 Q60 10 80 30 T90 40 Q100 60 80 60 H20 Q0 60 10 40" />
                </svg>
            </div>
            <div className="absolute top-20 right-20 opacity-40">
                <svg width="120" height="70" viewBox="0 0 100 60" fill="white">
                    <path d="M10 40 Q20 10 40 30 Q60 10 80 30 T90 40 Q100 60 80 60 H20 Q0 60 10 40" />
                </svg>
            </div>

            <div className="container mx-auto px-4 z-10 relative">
                <div className="text-center mb-0">
                    <h2 className="font-bubblegum text-5xl md:text-6xl text-white drop-shadow-lg mb-8 tracking-wide">
                        Our Magical Story
                    </h2>
                    <p className="font-fredoka text-xl text-white/90 mb-12">A journey of love, learning, and laughter!</p>
                </div>

                <div className="relative w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-0">

                    {/* The Banner Container */}
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5, type: 'spring' }}
                        className="relative z-10 w-full md:w-3/4"
                    >
                        {/* Banner Shape */}
                        <div className="relative bg-white text-gray-800 p-8 md:pl-16 md:pr-12 md:py-10 shadow-xl"
                            style={{
                                clipPath: 'polygon(5% 0%, 100% 1%, 100% 100%, 5% 99%, 0% 50%)', // Swallowtail left, flat right to connect to plane? No, usually plane pulls from front.
                                // Let's make it a banner shape: Plane is on the RIGHT or LEFT? Photo 1 shows plane on right, pulling banner on left.
                                // So banner needs to point to the right.
                                borderRadius: '10px',
                                maskImage: 'linear-gradient(to right, black 98%, transparent 100%)' // Soft edge?
                            }}
                        >
                            {/* Paper Ripple Effect CSS logic could go here, but simple white card is cleaner for text */}
                            <div className="font-quicksand text-lg md:text-xl leading-relaxed space-y-4 text-[#004aad]">
                                <p>
                                    <strong className="text-[#e11d48]">T.I.M.E. Kids pre-schools</strong> is a chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training. After its hugely successful beginning in Hyderabad, T.I.M.E. Kids with <span className="text-[#d97706] font-bold">350+ pre-schools</span> is now poised for major expansion across the country.
                                </p>
                                <p>
                                    The programme at T.I.M.E. Kids pre-schools aims at making the transition from home to school easy, by providing the <span className="text-[#059669] font-bold">warm, safe and caring learning environment</span> that young children have at home. Our play schools offer wholesome, fun-filled and memorable childhood education to our children.
                                </p>
                            </div>
                        </div>

                        {/* Rope connecting banner to plane */}
                        <div className="hidden md:block absolute top-1/2 -right-8 w-16 h-1 bg-white rotate-[-10deg] origin-left z-0"></div>
                        <svg className="hidden md:block absolute top-1/2 -right-20 w-24 h-24 z-0 overflow-visible" style={{ marginTop: '-45px' }}>
                            <path d="M0,50 Q20,50 40,40" stroke="white" strokeWidth="2" fill="none" />
                            <path d="M0,50 Q20,60 40,40" stroke="white" strokeWidth="2" fill="none" />
                        </svg>

                    </motion.div>

                    {/* The Plane */}
                    <motion.div
                        className="w-48 md:w-80 flex-shrink-0 z-20 md:-ml-4 mb-8 md:mb-0 order-first md:order-last"
                        initial={{ x: 200, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        animate={{
                            y: [0, -15, 0],
                        }}
                        transition={{
                            default: { duration: 1.2, type: "spring", bounce: 0.4 },
                            y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        }}
                    >
                        <div className="transform scale-x-[-1] md:scale-x-100"> {/* Flip plane if needed to face direction of pull */}
                            {/* Photo 1 shows plane flying RIGHT, pulling banner on LEFT. So Plane should be on Right. */}
                            <RedBiplane />
                        </div>
                    </motion.div>

                </div>
            </div>

            <style jsx>{`
               /* Wavy paper edges could be added here */
            `}</style>
        </section>
    );
}

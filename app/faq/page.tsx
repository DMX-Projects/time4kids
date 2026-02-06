'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PreschoolBackground, CuteSchoolBus, FloatingBalloon, PlayfulStar, PastelBlob } from '../../components/ui/PreschoolDecorations';

const faqsData = [
    {
        id: 1,
        question: "Why send your child to T.I.M.E. Kids?",
        answer: [
            "Your child learns to make friends and important social skills like caring and sharing.",
            "Our pre-schools provide a learning-through-play environment.",
            "We help children start learning important life skills early.",
            "Children feel comfortable among peers of the same age group."
        ]
    },
    {
        id: 2,
        question: "Do the children have an opportunity to be creative each day?",
        answer: [
            "Children get ample opportunities for artistic expression.",
            "Activities include painting, clay modelling, role play, etc."
        ]
    },
    {
        id: 3,
        question: "How does T.I.M.E. Kids pre-schools helps children acquire different skills?",
        answer: [
            "Our curriculum involves a blend of structural learning and free play.",
            "We focus on cognitive, physical, emotional, and social development through activities like puzzles, storytelling, group games, and interactive learning sessions."
        ]
    },
    {
        id: 4,
        question: "Isn't it too early for a child of one-and-a-half year to be attending play school?",
        answer: [
            "The first six years are critical for a child's brain development.",
            "Our program for this age group acts as a bridge between home and school, providing a secure and stimulating environment that encourages exploration and social interaction."
        ]
    },
    {
        id: 5,
        question: "Are basic maths, language and science concepts included in each day's program?",
        answer: [
            "Yes, we introduce fundamental concepts of numeracy, language, and environmental science through age-appropriate, play-based activities that make learning fun and engaging."
        ]
    },
    {
        id: 6,
        question: "What is the importance of experienced educationists?",
        answer: [
            "Experienced educationists ensure that the curriculum is developmentally appropriate, safe, and effective.",
            "They understand child psychology and can tailor learning experiences to meet the unique needs of every child."
        ]
    },
    {
        id: 7,
        question: "Are manners and etiquette also important as studies?",
        answer: [
            "Absolutely. We believe in holistic development.",
            "Along with academics, we emphasize value education, teaching children essential social manners, table etiquette, and respect for others."
        ]
    },
    {
        id: 8,
        question: "Are admissions to the programs open through out the year?",
        answer: [
            "Yes, admissions are generally open throughout the year, subject to the availability of seats in the respective program."
        ]
    },
    {
        id: 9,
        question: "What is the procedure for enrolment to T.I.M.E. Kids pre-schools?",
        answer: [
            "Parents can visit the nearest T.I.M.E. Kids centre to collect the admission kit.",
            "The process involves filling out an application form and interacting with the centre head. You can also enquire online through our website."
        ]
    },
    {
        id: 10,
        question: "Why should we enrol in T.I.M.E. Kids?",
        answer: [
            "T.I.M.E. Kids offers a proven curriculum, safe infrastructure, and trained facilitators.",
            "We focus on the all-round development of your child in a nurturing environment, backed by the trusted T.I.M.E. brand."
        ]
    },
    {
        id: 11,
        question: "Does T.I.M.E. Kids pre-schools offer transportation facilities?",
        answer: [
            "Most of our centres offer safe and reliable transportation facilities with female attendants.",
            "Please check with your specific centre for route availability."
        ]
    }
];

const AnimatedWave = ({ position = 'top', showObjects = false }: { position?: 'top' | 'bottom', showObjects?: boolean }) => {
    return (
        <div className={`wave-container ${position}`}>
            <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
                <defs>
                    <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                </defs>
                <g className="parallax">
                    <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
                    <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
                    <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
                    <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" />
                </g>
            </svg>

            {showObjects && (
                <div className="ocean-objects">
                    {/* Ship 1 */}
                    <div className="obj ship ship-1">
                        <Image src="/images/new_ship.png" alt="Ship" width={80} height={80} style={{ mixBlendMode: 'multiply' }} unoptimized />
                    </div>

                    {/* Ship 2 */}
                    <div className="obj ship ship-2">
                        <Image src="/images/new_ship.png" alt="Ship" width={60} height={60} style={{ mixBlendMode: 'multiply' }} unoptimized />
                    </div>

                    {/* Fish 1 - Jumping */}
                    <div className="obj fish fish-jumping">
                        <Image src="/images/fish.png" alt="Fish" width={40} height={30} style={{ mixBlendMode: 'multiply' }} unoptimized />
                    </div>

                    {/* Fish 2 - Swimming */}
                    <div className="obj fish fish-swimming">
                        <Image src="/images/fish.png" alt="Fish" width={30} height={20} style={{ mixBlendMode: 'multiply' }} unoptimized />
                    </div>
                    {/* Fish 3 - Small */}
                    <div className="obj fish fish-small">
                        <Image src="/images/fish.png" alt="Fish" width={25} height={18} style={{ mixBlendMode: 'multiply' }} unoptimized />
                    </div>
                </div>
            )}

            <style jsx>{`
                .wave-container {
                    width: 100%;
                    height: 120px;
                    overflow: hidden;
                    position: relative;
                    z-index: 10;
                    line-height: 0;
                }

                .wave-container.top {
                    transform: rotate(180deg);
                    margin-bottom: -119px; /* Overlap the section below */
                }

                .wave-container.bottom {
                    margin-top: -119px; /* Overlap the section above */
                }

                .waves {
                    width: 100%;
                    height: 100%;
                }

                /* Animation */
                .parallax > use {
                    animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
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

                /* Objects Styles */
                .ocean-objects {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 20;
                }

                .obj {
                    position: absolute;
                }

                .ship {
                    bottom: 30px; /* Adjust to sit on wave */
                    animation: bob 3s ease-in-out infinite, sail 10s ease-in-out infinite alternate;
                    mix-blend-mode: multiply;
                }

                .ship-1 {
                    left: 15%;
                    animation-delay: 0s, 0s;
                }

                .ship-2 {
                    right: 20%;
                    animation-delay: 1.5s, 2s;
                    transform: scale(0.8);
                }

                .fish-jumping {
                    left: 40%;
                    bottom: 25px;
                    animation: jump 5s infinite;
                    opacity: 0;
                }
                
                .fish-swimming {
                    left: 60%;
                    bottom: 15px;
                    animation: swim 8s linear infinite;
                }

                 .fish-small {
                    left: 75%;
                    bottom: 20px;
                    animation: swim 12s linear infinite reverse;
                }

                .obj img {
                    mix-blend-mode: multiply;
                }

                @keyframes bob {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-8px) rotate(3deg); }
                }

                @keyframes sail {
                    0% { margin-left: -20px; }
                    100% { margin-left: 20px; }
                }

                @keyframes jump {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    20% { opacity: 1; }
                    50% { transform: translateY(-40px) rotate(-20deg); opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(0) rotate(-40deg); opacity: 0; }
                }

                @keyframes swim {
                    0% { transform: translateX(0); }
                    50% { transform: translateX(20px) translateY(5px); }
                    100% { transform: translateX(0); }
                }

                @media (max-width: 768px) {
                   .wave-container {
                        height: 70px;
                   }
                   .wave-container.top {
                        margin-bottom: -69px;
                   }
                   .wave-container.bottom {
                        margin-top: -69px;
                   }
                   
                   .ship { bottom: 15px; transform: scale(0.6); }
                   .fish-jumping { bottom: 15px; transform: scale(0.6); }
                }
            `}</style>
        </div>
    );
};

const SchoolFrame = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="school-frame-container">
            {/* Outline Stars Background */}
            <div className="star-background">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`outline-star star-${i} ${i % 2 === 0 ? 'star-blue' : 'star-gold'}`}
                        animate={{
                            opacity: [0.3, 0.7, 0.3],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    >
                        ☆
                    </motion.div>
                ))}
            </div>

            {/* 🎈 Balloons Styling */}
            <div className="balloon-garden">
                <motion.div
                    className="mini-balloon bal-red"
                    animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ top: '10%', left: '5%' }}
                >
                    <div className="balloon-string"></div>
                </motion.div>
                <motion.div
                    className="mini-balloon bal-yellow"
                    animate={{ y: [0, -20, 0], rotate: [5, -5, 5] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    style={{ bottom: '15%', right: '5%' }}
                >
                    <div className="balloon-string"></div>
                </motion.div>
                <motion.div
                    className="mini-balloon bal-green"
                    animate={{ y: [0, -18, 0], rotate: [-3, 3, -3] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    style={{ top: '40%', right: '2%' }}
                >
                    <div className="balloon-string"></div>
                </motion.div>
            </div>

            {/* 🧱 Toy Blocks & Doodles */}
            <div className="playground-doodles">
                <div className="toy-block block-pink">A</div>
                <div className="toy-block block-mint">B</div>
                <div className="toy-block block-blue">C</div>

                <div className="doodle-item pencil-doodle">✏️</div>
                <div className="doodle-item apple-doodle">🍎</div>
                <div className="doodle-item music-note">🎵</div>
            </div>

            {/* Main Rounded Box */}
            <div className="main-frame-box colorful-border">
                <div className="inner-image-area">
                    {children}
                </div>

                {/* 🔔 School Bell at Top Right */}
                <motion.div
                    className="school-bell-mount"
                    whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="bell-dome school-yellow-bg">
                        <div className="bell-clapper-arm"></div>
                        <div className="bell-clapper-ball"></div>
                    </div>
                </motion.div>

                {/* 🚌 Side-view School Bus at Bottom Left */}
                <motion.div
                    className="illustrative-bus-side"
                    animate={{
                        x: [0, 10, 0],
                        y: [0, -2, 0]
                    }}
                    transition={{
                        x: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                        y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                    }}
                >
                    <div className="bus-side-body bus-red-primary">
                        <div className="bus-side-windows">
                            <div className="side-window window-blue"></div>
                            <div className="side-window window-blue"></div>
                        </div>
                        <div className="bus-side-front bus-red-primary">
                            <div className="bus-side-headlight"></div>
                        </div>
                        <div className="bus-side-wheel w-left"></div>
                        <div className="bus-side-wheel w-right"></div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default function FAQPage() {
    const [openAccordion, setOpenAccordion] = useState<number | null>(null);
    const [activeSlide, setActiveSlide] = useState(0);

    const bannerImages = ['/faq-banner-new-1.png', '/faq-banner-new-2.png'];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % bannerImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="faq-page">

            <AnimatedWave position="top" />

            {/* HERO / BANNER */}
            <section className="faq-banner relative overflow-hidden">
                {/* 1. LAYER: Classroom Background Image with Blur */}
                <div className="classroom-bg absolute inset-0 z-0"></div>

                {/* 2. LAYER: Strong White Overlay for Professional Look */}
                <div className="white-overlay absolute inset-0 z-1"></div>

                {/* 3. LAYER: Subtle Particles/Glows (kept for a touch of magic) */}
                <div className="absolute inset-0 z-2 pointer-events-none opacity-40">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="subtle-glow"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 5 + Math.random() * 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>

                <div className="banner-inner relative z-10">
                    <div className="logo-container relative">
                        {/* Clean Backdrop for Logo */}
                        <div className="logo-glass-backdrop"></div>

                        {/* Floating Decorative Elements */}
                        <div className="absolute inset-0 pointer-events-none overflow-visible">
                            <motion.span className="deco-icon star-1" animate={{ y: [-10, 10, -10], rotate: [0, 20, 0] }} transition={{ duration: 4, repeat: Infinity }}>⭐</motion.span>
                            <motion.span className="deco-icon star-2" animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }}>✨</motion.span>
                            <motion.span className="deco-icon bubble-1" animate={{ x: [-5, 5, -5] }} transition={{ duration: 5, repeat: Infinity }}>🫧</motion.span>
                            <motion.span className="deco-icon bubble-2" animate={{ y: [5, -5, 5] }} transition={{ duration: 6, repeat: Infinity }}>🎈</motion.span>
                        </div>

                        <motion.div
                            className="banner-text relative z-10"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "backOut" }}
                        >
                            <motion.h1
                                className="logo-title flex flex-wrap items-center gap-x-2 gap-y-1"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <span className="letter-t">T</span>
                                <span className="dot dot-red">.</span>
                                <span className="letter-i">I</span>
                                <span className="dot dot-yellow">.</span>
                                <span className="letter-m">M</span>
                                <span className="dot dot-blue">.</span>
                                <span className="letter-e">E</span>
                                <span className="kids-text ml-3">Kids</span>
                            </motion.h1>
                            <motion.p
                                className="logo-tagline italic mt-3 opacity-95 text-2xl font-semibold"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                            >
                                <span className="mr-2 text-rose-400">❀</span>
                                the pre-school that cares
                                <span className="ml-2 text-sky-400">❀</span>
                            </motion.p>
                        </motion.div>
                    </div>

                    {/* ☁️ CLOUD NAVIGATION REMOVED FROM HERE */}

                    {/* 🚌 REALISTIC FRONT-FACING SCHOOL BUS */}
                    <div className="banner-visual">
                        <SchoolFrame>
                            <div className="image-slides-container">
                                {bannerImages.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`slide ${index === activeSlide ? 'active' : ''}`}
                                    >
                                        <Image
                                            src={img}
                                            alt="FAQ Banner"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            priority
                                        />
                                    </div>
                                ))}
                            </div>
                        </SchoolFrame>
                    </div>

                </div>
            </section>

            {/* FAQ HEADER */}
            <div className="faqs-header">
                <h2>FAQs</h2>
            </div>

            {/* FAQ CONTENT */}
            <section className="faq-content relative">
                <div className="faq-layout relative z-10">

                    <PreschoolBackground className="rounded-3xl shadow-lg my-8 border border-white/50">
                        {/* Extra floated elements for more fun */}
                        <FloatingBalloon color="#FFCDD2" className="absolute left-[-20px] top-[10%] w-20 h-28 animate-bounce-slow opacity-90 hidden xl:block" style={{ animationDuration: '4s' }} />
                        <FloatingBalloon color="#C8E6C9" className="absolute right-[-20px] bottom-[20%] w-16 h-24 animate-bounce-slow opacity-90 hidden xl:block" style={{ animationDuration: '5s' }} />

                        <div className="hidden xl:block absolute right-[-50px] top-[40%]">
                            <PlayfulStar className="w-12 h-12 text-yellow-400 animate-spin-slow" style={{ animationDuration: '10s' }} />
                        </div>

                        {/* Background Low Opacity Bus */}
                        <div className="absolute left-[5%] bottom-[10%] opacity-5 pointer-events-none z-0 transform -rotate-12 scale-150 blur-[1px]">
                            <CuteSchoolBus className="w-64 h-48" />
                        </div>

                        {/* Main FAQ List */}
                        <div className="faq-wrapper mx-auto relative z-10 px-4 py-6">
                            {faqsData.map((faq, index) => (
                                <div key={faq.id} className={`faq-item faq-item-${index % 4} ${index === 1 ? 'featured-faq' : ''}`}>
                                    <button
                                        className="faq-question"
                                        onClick={() => setOpenAccordion(openAccordion === faq.id ? null : faq.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {index === 1 && <span className="text-xl animate-pulse">✨</span>}
                                            {faq.question}
                                        </div>
                                        <span className={`icon-star ${openAccordion === faq.id ? 'rotate-180' : ''}`}>
                                            {openAccordion === faq.id ? '★' : '☆'}
                                        </span>
                                    </button>

                                    {openAccordion === faq.id && (
                                        <div className="faq-answer">
                                            {faq.answer.map((line, i) => (
                                                <p key={i}>{line}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer decoration for the section */}
                        <div className="absolute bottom-4 right-4 z-20 opacity-90">
                            <CuteSchoolBus className="w-32 h-20 md:w-48 md:h-32 transform hover:scale-105 transition-transform duration-500" />
                        </div>
                    </PreschoolBackground>
                </div>
            </section>

            <AnimatedWave position="bottom" showObjects={true} />

            <style jsx global>{`
                .faq-page {
                    font-family: 'Dosis', sans-serif;
                    background: radial-gradient(circle at center, #ffffff 0%, #fff9f0 35%, #f3e5f5 100%);
                    min-height: 100vh;
                    overflow-x: hidden; /* Prevent horizontal scroll from absolute elements */
                }

                .faq-banner {
                    padding: 130px 20px 80px;
                    position: relative;
                    background: linear-gradient(135deg, #fffcf5 0%, #fff9f0 100%); /* Warm cream primary background */
                }
                
                /* ... (Keep existing banner styles if needed, or simplify) ... */
                /* Reducing banner complexity for focus, or keeping as is */
                .classroom-bg {
                    background-image: url('/school-banner.png');
                    background-size: cover;
                    background-position: center;
                    filter: blur(3.5px);
                    transform: scale(1.05);
                }

                .white-overlay {
                    background: rgba(255, 248, 225, 0.62); /* Warmer peach-cream overlay */
                    backdrop-filter: saturate(120%) blur(2px);
                }

                .btn-glow {
                    position: absolute;
                    inset: -10px;
                    background: radial-gradient(circle, rgba(255, 213, 79, 0.3) 0%, transparent 70%);
                    border-radius: 50%;
                    filter: blur(15px);
                    z-index: -1;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                }

                .logo-glass-backdrop {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 248, 225, 0.8) 50%, transparent 80%);
                    z-index: -1;
                    filter: blur(20px);
                }

                .banner-inner {
                    max-width: 1200px;
                    margin: auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 40px;
                    position: relative;
                    z-index: 10;
                }

                .banner-text {
                    flex: 1;
                    z-index: 11;
                }

                .banner-visual {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 450px;
                    z-index: 11;
                }

                .logo-container { padding: 40px; }
                 
                 /* Banner Text Styles */
                .banner-text h1.logo-title {
                    font-size: 5.5rem;
                    line-height: 1;
                    font-weight: 900;
                    margin: 0;
                    color: white;
                    text-transform: uppercase;
                }
                 .banner-text .logo-tagline {
                    font-size: 2.2rem;
                    color: #1f4fa3;
                    font-weight: 700;
                    letter-spacing: 1px;
                    margin-top: 10px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                
                .letter-t, .letter-i, .letter-m, .letter-e {
                    display: inline-block;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                    position: relative;
                }
                .letter-t { color: #ff4d4d; text-shadow: 0 1px 0 #cc0000, 0 2px 0 #b30000; }
                .letter-i { color: #5cb85c; text-shadow: 0 1px 0 #449d44, 0 2px 0 #398439; }
                .letter-m { color: #ff9933; text-shadow: 0 1px 0 #cc7a00, 0 2px 0 #b36b00; }
                .letter-e { color: #9933ff; text-shadow: 0 1px 0 #7a00cc, 0 2px 0 #6b00b3; }
                
                 .letter-t:hover, .letter-i:hover, .letter-m:hover, .letter-e:hover {
                    transform: translateY(-5px) scale(1.1) rotate(3deg);
                }
                .dot { font-size: 5rem; vertical-align: middle; line-height: 0.1; }
                .dot-red { color: #ff6b6b; } .dot-yellow { color: #feca57; } .dot-blue { color: #48dbfb; }
                
                .kids-text {
                    font-family: var(--font-fredoka), 'Fredoka', sans-serif;
                    background: linear-gradient(135deg, #1f4fa3 0%, #3498db 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: inline-block;
                    transform: rotate(-2deg);
                }
                
                /* Decorations */
                .deco-icon { position: absolute; font-size: 2rem; z-index: 5; }
                .star-1 { top: -20px; left: 10px; font-size: 2.5rem; }
                .star-2 { top: 40px; right: -30px; }
                .bubble-1 { bottom: -10px; left: -40px; font-size: 1.8rem; }
                .bubble-2 { top: 10px; right: 20px; font-size: 2.2rem; }

                 /* Banner Frame - Subtle Wave-Cut Asymmetric Style */
                 /* Removed .banner-frame, .blob-frame, @keyframes blob-wave-minimal, .banner-frame::before, .banner-frame::after */

                .slide { 
                    position: absolute; 
                    inset: 0; 
                    opacity: 0; 
                    transition: opacity 1s ease;
                    /* Ensure image follows the morphing shape - inheriting border-radius from parent (blob-frame) works best if overflow is hidden there, 
                       but slide needs to fill it. 
                       Actually, relying on overflow:hidden on .blob-frame is sufficient for the cropping. */
                     width: 100%;
                     height: 100%;
                }
                .slide.active { opacity: 1; }
                
                .slide img {
                    transform: scale(1.1); /* Slight zoom to cover edges dynamically */
                }

                /* Removed .paper-plane-scene, .plane-orbit-simple, .paper-plane-container, .paper-plane-svg, .plane-trail-simple, .bubbles-layer, .question-bubble */

                /* Story-like School Frame Styles */
                .school-frame-container {
                    position: relative;
                    width: 420px;
                    height: 330px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 30px;
                    background: #fff;
                    border-radius: 35px;
                    box-shadow: 0 15px 45px rgba(255, 100, 100, 0.08);
                }

                /* Background Stars */
                .star-background {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }
                .outline-star {
                    position: absolute;
                    font-size: 1.8rem;
                    user-select: none;
                }
                .star-blue { color: #4fc3f7; }
                .star-gold { color: #ffd54f; }
                
                .star-0 { top: 5%; left: 8%; }
                .star-1 { top: 12%; right: 12%; }
                .star-2 { bottom: 15%; left: 10%; }
                .star-3 { bottom: 8%; right: 8%; }
                .star-4 { top: 40%; left: 2%; }
                .star-5 { top: 60%; right: 2%; }
                .star-6 { top: 4%; left: 45%; }
                .star-7 { bottom: 4%; left: 55%; }
                .star-8 { top: 22%; left: 18%; font-size: 1rem; }
                .star-9 { bottom: 22%; right: 18%; font-size: 1rem; }

                /* 🎈 Balloons Styling */
                .balloon-garden {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 10;
                }
                .mini-balloon {
                    position: absolute;
                    width: 25px;
                    height: 30px;
                    border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
                }
                .bal-red { background: #ff5252; box-shadow: inset -5px -5px 0 rgba(0,0,0,0.1); }
                .bal-yellow { background: #ffd740; box-shadow: inset -5px -5px 0 rgba(0,0,0,0.1); }
                .bal-green { background: #69f0ae; box-shadow: inset -5px -5px 0 rgba(0,0,0,0.1); }
                
                .balloon-string {
                    position: absolute;
                    bottom: -15px;
                    left: 50%;
                    width: 1.5px;
                    height: 20px;
                    background: rgba(0,0,0,0.1);
                    transform: translateX(-50%);
                }

                /* 🧱 Toy Blocks & Doodles */
                .playground-doodles {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 11;
                }
                .toy-block {
                    position: absolute;
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    color: white;
                    font-size: 14px;
                    box-shadow: 2px 2px 0 rgba(0,0,0,0.15);
                }
                .block-pink { background: #ec407a; left: 10px; bottom: 80px; transform: rotate(-10deg); }
                .block-mint { background: #26a69a; left: 35px; bottom: 85px; transform: rotate(15deg); }
                .block-blue { background: #42a5f5; left: 22px; bottom: 110px; transform: rotate(-5deg); }

                .doodle-item {
                    position: absolute;
                    font-size: 1.5rem;
                    opacity: 0.8;
                }
                .pencil-doodle { top: 20px; left: 120px; transform: rotate(-45deg); }
                .apple-doodle { bottom: 30px; right: 120px; }
                .music-note { top: 80px; right: 25px; transform: rotate(20deg); }

                /* Main Box & Proportions - SHAPE SHIFTED TO ORGANIC BLOB */
                .main-frame-box {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #fff;
                    /* Organic asymmetric blob shape */
                    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
                    z-index: 5;
                    padding: 15px; /* Increased for better shape outline visibility */
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    transition: border-radius 0.5s ease; /* Smooth transition if shape ever morphs */
                }
                .colorful-border {
                    border: 5px solid #ff7043;
                    outline: 4px solid #fff;
                    /* Trace the same organic shape */
                    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
                    box-shadow: 0 0 0 8px #4fc3f7, 0 10px 40px rgba(0,0,0,0.1);
                }

                .inner-image-area {
                    width: 100%;
                    height: 100%;
                    /* Organic inner shape with slight offset for depth */
                    border-radius: 55% 45% 35% 65% / 55% 35% 65% 45%;
                    overflow: hidden;
                    position: relative;
                }

                /* 🔔 School Bell - Re-aligned to new curve */
                .school-bell-mount {
                    position: absolute;
                    top: -10px;
                    right: 15px; /* Pulled in to sit on the curve */
                    width: 75px;
                    height: 85px;
                    z-index: 12;
                    cursor: pointer;
                }
                .bell-dome {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 55px;
                    height: 55px;
                    border: 3.5px solid #333;
                    border-radius: 50%;
                    box-shadow: inset -5px -5px 0 rgba(0,0,0,0.05);
                }
                .school-yellow-bg { background: #ffd740; }
                
                .bell-dome::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 10px;
                    height: 10px;
                    background: #333;
                    border-radius: 50%;
                }
                .bell-clapper-arm {
                    position: absolute;
                    top: 40px;
                    right: -10px;
                    width: 22px;
                    height: 3.5px;
                    background: #333;
                    transform: rotate(30deg);
                }
                .bell-clapper-ball {
                    position: absolute;
                    top: 47px;
                    right: -18px;
                    width: 12px;
                    height: 12px;
                    background: #333;
                    border-radius: 50%;
                }

                /* 🚌 Red School Bus */
                .illustrative-bus-side {
                    position: absolute;
                    bottom: -10px; /* Adjusted from -22px to sit on the curve */
                    left: 20px;   /* Adjusted from -20px to sit inside the corner curve */
                    width: 95px;
                    height: 65px;
                    z-index: 12;
                }
                .bus-red-primary { background: #ff5252 !important; border-color: #333 !important; }
                
                .bus-side-body {
                    position: relative;
                    width: 85px;
                    height: 42px;
                    border: 3.5px solid #333;
                    border-radius: 10px 10px 5px 5px;
                    display: flex;
                    align-items: center;
                    padding-left: 8px;
                }
                .bus-side-windows {
                    display: flex;
                    gap: 5px;
                }
                .side-window {
                    width: 15px;
                    height: 13px;
                    border: 2.5px solid #333;
                    border-radius: 4px;
                }
                .window-blue { background: #b3e5fc; }

                .bus-side-front {
                    position: absolute;
                    right: -8px;
                    top: 7px;
                    width: 26px;
                    height: 30px;
                    border: 3.5px solid #333;
                    border-left: none;
                    border-radius: 0 12px 5px 0;
                }
                .bus-side-headlight {
                    position: absolute;
                    bottom: 6px;
                    right: 3px;
                    width: 6px;
                    height: 6px;
                    background: #ffd740;
                    border: 2px solid #333;
                    border-radius: 50%;
                }
                .bus-side-wheel {
                    position: absolute;
                    bottom: -12px;
                    width: 22px;
                    height: 22px;
                    background: #fff;
                    border: 3.5px solid #333;
                    border-radius: 50%;
                }
                .bus-side-wheel::after {
                    content: '';
                    position: absolute;
                    inset: 4.5px;
                    background: #333;
                    border-radius: 50%;
                }
                .w-left { left: 12px; }
                .w-right { right: 0px; }

                /* Responsive Primary Colors Redesign */
                @media (max-width: 1024px) {
                    .school-frame-container { width: 340px; height: 280px; padding: 20px; }
                    .illustrative-bus-side { scale: 0.8; bottom: -18px; left: -10px; }
                    .school-bell-mount { scale: 0.8; top: -12px; right: -12px; }
                    .doodle-item { scale: 0.75; }
                }

                @media (max-width: 768px) {
                    .school-frame-container { width: 280px; height: 220px; padding: 12px; }
                    .illustrative-bus-side { scale: 0.65; bottom: -12px; left: -8px; }
                    .school-bell-mount { scale: 0.65; top: -8px; right: -8px; }
                    .main-frame-box { border-radius: 30px; padding: 8px; }
                    .toy-block { scale: 0.8; left: 5px; }
                    .mini-balloon { scale: 0.7; }
                    .doodle-item { display: none; } /* Hide doodles on mobile to keep it clean */
                }




                .faqs-header {
                    text-align: center;
                    padding: 40px 0 20px;
                }

                .faqs-header h2 {
                    color: #ff6633;
                    font-size: 2.8rem;
                    font-weight: 800;
                    letter-spacing: 1px;
                    text-shadow: 2px 2px 0px rgba(255,200,150,0.5);
                }

                .faq-content {
                    padding: 20px 20px 100px;
                    min-height: 60vh;
                }

                .faq-layout {
                    max-width: 900px;
                    margin: 0 auto;
                    position: relative;
                }
                
                .faq-wrapper {
                    position: relative;
                    z-index: 10;
                }
                
                /* Removed sidebar styles */

                .faq-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    width: 100%;
                    max-width: 800px;
                }

                /* Bubble Card Styles */
                .faq-item {
                    border-radius: 16px;
                    overflow: hidden; /* Ensure content stays inside rounded corners */
                    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                    border: 2px solid rgba(255,255,255,0.6);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02); 
                    position: relative;
                    background: rgba(255,255,255,0.4);
                    backdrop-filter: blur(5px);
                }
                
                /* Featured Card Style */
                .featured-faq {
                    border: 2px solid #ffd700; /* Gold header */
                    background: rgba(255, 255, 240, 0.8);
                    transform: scale(1.02);
                    box-shadow: 0 8px 20px rgba(255, 215, 0, 0.15);
                    z-index: 10;
                }

                .faq-item-0 { background-color: rgba(255, 249, 240, 0.9); } /* Light Cream */
                .faq-item-1 { background-color: rgba(240, 255, 244, 0.9); } /* Light Mint */
                .faq-item-2 { background-color: rgba(255, 240, 245, 0.9); } /* Light Pink */
                .faq-item-3 { background-color: rgba(243, 229, 245, 0.9); } /* Light Purple */

                .faq-item:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.06);
                    z-index: 15;
                    border-color: #fff;
                }
                
                .featured-faq:hover {
                     transform: scale(1.03) translateY(-4px);
                     box-shadow: 0 15px 30px rgba(255, 215, 0, 0.2);
                }

                .faq-question {
                    background: transparent;
                    color: #444;
                    padding: 12px 20px;
                    font-size: 1.1rem;
                    border: none;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    width: 100%;
                    font-weight: 700;
                    letter-spacing: 0.3px;
                    text-align: left;
                }

                .faq-question:hover {
                    color: #000;
                }

                .icon-star {
                    font-size: 1.2rem;
                    color: #fb8c00;
                    transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                    line-height: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    background: #fff;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                
                .rotate-180 {
                    transform: rotate(180deg);
                    background: #fb8c00;
                    color: #fff;
                    box-shadow: 0 4px 8px rgba(251, 140, 0, 0.3);
                }
                
                .faq-question:hover .icon-star {
                     transform: rotate(90deg) scale(1.1);
                }

                .faq-answer {
                    padding: 0 20px 20px;
                    color: #555;
                    line-height: 1.6;
                    font-size: 1rem;
                    opacity: 0.95;
                }

                @media (max-width: 768px) {
                    .banner-inner { flex-direction: column; text-align: center; }
                    .banner-frame { width: 240px; height: 240px; }
                    .faq-item { border-radius: 20px; }
                    .faq-question { padding: 15px 20px; font-size: 1.1rem; }
                     /* Hide decorations on mobile */
                    .absolute.text-9xl, .absolute.text-8xl { display: none; }
                }
            `}</style>
        </div>
    );
}

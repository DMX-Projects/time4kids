'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

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

export default function FAQPage() {
    const [openAccordion, setOpenAccordion] = useState<number | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const bannerImages = ['/faq-banner-new-1.png', '/faq-banner-new-2.png'];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="faq-page">

            <AnimatedWave position="top" />

            {/* HERO / BANNER */}
            <section className="faq-banner">
                <div className="banner-inner">

                    <div className="banner-text">
                        <h1>T.I.M.E. Kids</h1>
                        <p>the pre-school that cares</p>
                    </div>

                    {/* ☁️ CLOUD NAVIGATION REMOVED FROM HERE */}

                    {/* 🔴 FIXED CIRCULAR FRAME */}
                    <div className="banner-frame">
                        <div className="circle-frame">
                            {bannerImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={`slide ${currentSlide === index ? 'active' : ''}`}
                                >
                                    <Image
                                        src={img}
                                        alt="Kids"
                                        fill
                                        priority={index === 0}
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* FAQ HEADER */}
            <div className="faqs-header">
                <h2>FAQs</h2>
            </div>

            {/* FAQ CONTENT */}
            <section className="faq-content">
                <div className="faq-layout">

                    <div className="faq-side-content">
                        <div className="designed-frame-container">
                            <div className="designed-frame">
                                <div className="frame-background"></div>
                                <div className="main-circle perfect-frame">
                                    <Image
                                        src="/faq-sidebar-teacher.png"
                                        alt="Kids learning"
                                        width={460}
                                        height={460}
                                        className="object-cover zoom-child-image"
                                    />
                                </div>
                                <div className="decorator top-left-pink">
                                    <div className="inner-icon">🪁</div>
                                </div>
                                <div className="decorator right-yellow">
                                    <div className="inner-icon">🎒</div>
                                </div>
                                <div className="decorator bottom-right-small">
                                    <Image src="/infra.jpg" alt="preview" width={60} height={60} className="rounded-full border-2 border-white shadow-md" />
                                </div>
                                <div className="star purple-star">✦</div>
                                <div className="dot pink-dot"></div>
                                <div className="dot yellow-dot"></div>
                                <div className="dot blue-dot"></div>
                            </div>
                        </div>
                        <div className="banner-clouds sidebar-clouds">
                            <a href="/franchise" className="cloud-btn green">
                                FRANCHISE <br /> OPPORTUNITY
                            </a>
                            <a href="/media" className="cloud-btn orange">
                                SCHOOL <br /> TOUR
                            </a>
                            <a href="/media" className="cloud-btn yellow">
                                PHOTO/ VIDEO <br /> GALLERY
                            </a>
                        </div>
                    </div>

                    <div className="faq-wrapper">
                        {faqsData.map((faq) => (
                            <div key={faq.id} className="faq-item">
                                <button
                                    className="faq-question"
                                    onClick={() => setOpenAccordion(openAccordion === faq.id ? null : faq.id)}
                                >
                                    {faq.question}
                                    <span>{openAccordion === faq.id ? '−' : '+'}</span>
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

                </div>
            </section>

            <AnimatedWave position="bottom" showObjects={true} />

            <style jsx global>{`
                .faq-page {
                    font-family: 'Dosis', sans-serif;
                    background: #f5f5f5;
                    min-height: 100vh;
                }

                .faq-banner {
                    background: linear-gradient(135deg, #cfefff, #fbe6ff);
                    padding: 120px 20px 70px;
                }

                .banner-inner {
                    max-width: 1200px;
                    margin: auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 40px;
                }

                .banner-text h1 {
                    font-size: 3.5rem;
                    color: #1f4fa3;
                    margin: 0;
                }

                .banner-text p {
                    font-size: 1.5rem;
                    color: #1f4fa3;
                    font-style: italic;
                    margin-top: 5px;
                }

                .banner-clouds {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    z-index: 30;
                }

                .sidebar-clouds {
                    margin-top: 40px;
                    margin-bottom: 30px;
                    align-items: center;
                }

                /* ORGANIC CLOUD BUTTONS WITH FLOATING ANIMATION */
                @keyframes float {
                    0%, 100% { 
                        transform: translateY(0px) rotate(0deg);
                    }
                    25% { 
                        transform: translateY(-8px) rotate(1deg);
                    }
                    50% { 
                        transform: translateY(-15px) rotate(-1deg);
                    }
                    75% { 
                        transform: translateY(-8px) rotate(1deg);
                    }
                }

                .cloud-btn {
                    width: 200px;
                    height: 110px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    font-weight: 800;
                    font-size: 0.95rem;
                    line-height: 1.2;
                    color: #1f4fa3;
                    text-decoration: none;
                    position: relative;
                    z-index: 10;
                    animation: float 4s ease-in-out infinite;
                    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.15));
                    transition: all 0.3s ease;
                }

                .cloud-btn:hover {
                    animation-play-state: paused;
                    transform: translateY(-5px) scale(1.05);
                    filter: drop-shadow(0 12px 24px rgba(0,0,0,0.2));
                }

                /* Main cloud body - organic irregular shape */
                .cloud-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: inherit;
                    border-radius: 45% 55% 52% 48% / 48% 45% 55% 52%;
                    z-index: -1;
                }

                /* Cloud puff - left side */
                .cloud-btn::after {
                    content: '';
                    position: absolute;
                    width: 70px;
                    height: 70px;
                    background: inherit;
                    border-radius: 50%;
                    top: -15px;
                    left: 15px;
                    z-index: -2;
                }

                /* GREEN BUTTON - Fluffy cloud with multiple puffs */
                .cloud-btn.green { 
                    background: #9bd35f;
                    animation-delay: 0s;
                }

                .cloud-btn.green::before {
                    border-radius: 48% 52% 55% 45% / 52% 48% 52% 48%;
                }

                .cloud-btn.green::after {
                    width: 80px;
                    height: 65px;
                    top: -20px;
                    left: 20px;
                    border-radius: 60% 40% 55% 45% / 50% 50% 50% 50%;
                }

                /* ORANGE BUTTON - Wide oval cloud */
                .cloud-btn.orange { 
                    background: #ff9933; 
                    color: #fff;
                    animation-delay: 1.3s;
                }

                .cloud-btn.orange::before {
                    border-radius: 42% 58% 50% 50% / 55% 52% 48% 45%;
                }

                .cloud-btn.orange::after {
                    width: 75px;
                    height: 75px;
                    top: -18px;
                    left: 12px;
                    border-radius: 52% 48% 60% 40% / 48% 52% 48% 52%;
                }

                /* YELLOW BUTTON - Rounded cloud with soft edges */
                .cloud-btn.yellow { 
                    background: #ffcc00;
                    animation-delay: 2.6s;
                }

                .cloud-btn.yellow::before {
                    border-radius: 50% 50% 48% 52% / 45% 55% 52% 48%;
                }

                .cloud-btn.yellow::after {
                    width: 85px;
                    height: 70px;
                    top: -22px;
                    left: 18px;
                    border-radius: 55% 45% 58% 42% / 52% 48% 55% 45%;
                }

                /* Circular Frame */
                .banner-frame {
                    width: 300px;
                    height: 300px;
                }

                .circle-frame {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #bfe7ff;
                    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
                }

                .slide {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    transition: opacity 1s ease;
                }

                .slide.active {
                    opacity: 1;
                }

                .faqs-header {
                    background: #fff;
                    text-align: center;
                    padding: 40px 0;
                }

                .faqs-header h2 {
                    color: #ff6633;
                    font-size: 2.4rem;
                }

                .faq-content {
                    padding: 60px 20px 150px;
                }

                .faq-layout {
                    max-width: 1100px;
                    margin: auto;
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 40px;
                }

                .designed-frame-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    padding: 40px 0;
                }

                .designed-frame {
                    position: relative;
                    width: 460px;
                    height: 460px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .frame-background {
                    position: absolute;
                    width: 420px;
                    height: 420px;
                    background: #ffedba; /* Light yellow background */
                    border-radius: 50%;
                    z-index: 1;
                    opacity: 0.8;
                }

                /* Removed outer white rings for a cleaner look */

                .main-circle {
                    position: relative;
                    width: 380px;
                    height: 380px;
                    border-radius: 50%;
                    overflow: hidden;
                    z-index: 2;
                    border: 15px solid #fff;
                    box-shadow: 0 15px 50px rgba(0,0,0,0.15), 0 0 30px rgba(255, 255, 255, 0.4); /* Premium outer glow */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fff;
                }

                .perfect-frame::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    box-shadow: inset 0 0 30px rgba(0,0,0,0.08); /* Enhanced inner shadow */
                    pointer-events: none;
                    z-index: 3;
                }

                .zoom-child-image {
                    width: 100% !important;
                    height: 100% !important;
                    transform: scale(1.0); /* Full view to show complete purple background */
                    transform-origin: center 48%; /* Adjusted down to prevent face cutoff at top */
                    object-fit: cover; /* Cover to fill circle */
                }

                .decorator {
                    position: absolute;
                    z-index: 5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    border: 2px solid #fff;
                }

                .top-left-pink {
                    width: 60px;
                    height: 60px;
                    background: #fbc6e3;
                    top: 5%;
                    left: 0%;
                }

                .right-yellow {
                    width: 70px;
                    height: 70px;
                    background: #fff;
                    top: 30%;
                    right: -5%;
                    overflow: hidden;
                }

                .bottom-right-small {
                    width: 70px;
                    height: 70px;
                    bottom: 15%;
                    left: -5%;
                    border: 4px solid #fff;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #fff;
                }

                .inner-icon {
                    font-size: 1.5rem;
                }

                .star {
                    position: absolute;
                    font-size: 24px;
                    z-index: 5;
                }

                .purple-star {
                    color: #7c4dff;
                    top: 15%;
                    right: 15%;
                }

                .dot {
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    z-index: 5;
                }

                .pink-dot { background: #ff5c8d; top: 30%; left: 5%; }
                .yellow-dot { background: #ffcd29; bottom: 15%; left: 20%; }
                .blue-dot { background: #29b6f6; bottom: 10%; right: 25%; }

                .faq-side-image img {
                    width: 220px !important;
                    height: auto !important;
                    border-radius: 16px;
                    margin-bottom: 20px;
                    display: inline-block;
                }

                .faq-item {
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                    border-radius: 50px;
                    overflow: visible;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                    transition: all 0.4s ease;
                    margin-bottom: 25px;
                    border: 2px solid transparent;
                }

                .faq-item:hover {
                    box-shadow: 0 12px 30px rgba(0,0,0,0.15);
                    transform: translateY(-3px);
                    border-color: rgba(92, 184, 92, 0.3);
                }

                .faq-question {
                    background: linear-gradient(135deg, #5cb85c 0%, #4ea34e 100%);
                    color: #fff;
                    padding: 22px 32px;
                    font-size: 1.1rem;
                    border: none;
                    display: flex;
                    justify-content: space-between;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.3s ease;
                    border-radius: 50px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }

                .faq-question:hover {
                    background: linear-gradient(135deg, #4ea34e 0%, #5cb85c 100%);
                    transform: scale(1.01);
                }

                .faq-question span {
                    font-size: 1.5rem;
                    font-weight: bold;
                    transition: transform 0.3s ease;
                }

                .faq-answer {
                    padding: 28px 32px;
                    background: linear-gradient(to bottom, #f9f9f9 0%, #ffffff 100%);
                    animation: fadeIn 0.4s ease;
                    border-radius: 0 0 50px 50px;
                    margin-top: -10px;
                }

                .faq-answer p {
                    margin: 0 0 10px;
                    color: #555;
                    line-height: 1.6;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .banner-inner {
                        flex-direction: column;
                        text-align: center;
                    }

                    .faq-layout {
                        grid-template-columns: 1fr;
                    }

                    .banner-frame {
                        width: 240px;
                        height: 240px;
                    }
                }
            `}</style>
        </div>
    );
}

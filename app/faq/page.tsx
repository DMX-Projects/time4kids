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
        question: "Is play school too early for a child of one-and-a-half year?",
        answer: [
            "The first six years are critical for development. Our play schools provide the right environment for growth."
        ]
    },
    {
        id: 4,
        question: "Are admissions open throughout the year?",
        answer: [
            "Admissions are open throughout the year, subject to availability."
        ]
    }
];

const AnimatedWave = ({ position = 'top' }: { position?: 'top' | 'bottom' }) => {
    return (
        <div className={`wave-section ${position === 'bottom' ? 'wave-bottom' : 'wave-top'}`}>
            <svg className="wave-svg wave1" viewBox="0 0 1200 40" preserveAspectRatio="none">
                <path d="M0,34C80,34,120,0,200,0C280,0,320,34,400,34C480,34,520,0,600,0C680,0,720,34,800,34C880,34,920,0,1000,0C1080,0,1120,34,1200,34V40H0Z"
                    fill="#035392" opacity="0.3" />
            </svg>
            <svg className="wave-svg wave2" viewBox="0 0 1200 40" preserveAspectRatio="none">
                <path d="M0,34C80,34,120,0,200,0C280,0,320,34,400,34C480,34,520,0,600,0C680,0,720,34,800,34C880,34,920,0,1000,0C1080,0,1120,34,1200,34V40H0Z"
                    fill="#035392" opacity="0.5" />
            </svg>
            <svg className="wave-svg wave3" viewBox="0 0 1200 40" preserveAspectRatio="none">
                <path d="M0,34C80,34,120,0,200,0C280,0,320,34,400,34C480,34,520,0,600,0C680,0,720,34,800,34C880,34,920,0,1000,0C1080,0,1120,34,1200,34V40H0Z"
                    fill="#035392" opacity="1" />
            </svg>

            <style jsx>{`
                .wave-section {
                    width: 100%;
                    height: 30px;
                    position: relative;
                    overflow: hidden;
                    z-index: 5;
                }

                .wave-bottom {
                    transform: rotate(180deg);
                }

                .wave-svg {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    left: 0;
                    top: 0;
                }

                .wave1 {
                    animation: wave-shift 20s linear infinite;
                }

                .wave2 {
                    animation: wave-shift 15s linear infinite reverse;
                }

                .wave3 {
                    animation: wave-shift 10s linear infinite;
                }

                @keyframes wave-shift {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-200px);
                    }
                }
            `}</style>
        </div>
    );
};

export default function FAQPage() {
    const [openAccordion, setOpenAccordion] = useState<number | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const bannerImages = ['/faq1.jpeg', '/faq2.jpeg'];

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

                    <div className="faq-side-image">
                        <Image
                            src="/faq2.jpeg"
                            alt="Kids learning"
                            width={300}
                            height={350}
                        />
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

            <AnimatedWave position="bottom" />

            <style jsx global>{`
                .faq-page {
                    font-family: 'Dosis', sans-serif;
                    background: #f5f5f5;
                    min-height: 100vh;
                }

                .faq-banner {
                    background: linear-gradient(135deg, #cfefff, #fbe6ff);
                    padding: 70px 20px;
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
                    font-size: 2.8rem;
                    color: #1f4fa3;
                    margin: 0;
                }

                .banner-text p {
                    font-size: 1.2rem;
                    color: #1f4fa3;
                    font-style: italic;
                }

                /* ✅ CIRCULAR FRAME */
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
                    padding: 60px 20px;
                }

                .faq-layout {
                    max-width: 1100px;
                    margin: auto;
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 40px;
                }

                .faq-side-image img {
                    width: 100%;
                    border-radius: 16px;
                }

                .faq-item {
                    background: #fff;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    transition: all 0.3s ease;
                }

                .faq-item:hover {
                    box-shadow: 0 6px 20px rgba(0,0,0,0.12);
                    transform: translateY(-2px);
                }

                .faq-question {
                    background: #5cb85c;
                    color: #fff;
                    padding: 18px 22px;
                    font-size: 1.1rem;
                    border: none;
                    display: flex;
                    justify-content: space-between;
                    cursor: pointer;
                    width: 100%;
                    transition: background 0.3s ease;
                }

                .faq-question:hover {
                    background: #4ea34e;
                }

                .faq-question span {
                    font-size: 1.5rem;
                    font-weight: bold;
                    transition: transform 0.3s ease;
                }

                .faq-answer {
                    padding: 22px;
                    background: #f9f9f9;
                    animation: fadeIn 0.3s ease;
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

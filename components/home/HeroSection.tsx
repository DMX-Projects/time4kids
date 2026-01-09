'use client';

import React, { useState, useEffect } from 'react';

import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { mediaUrl, apiUrl } from '@/lib/api-client';
import Modal from '@/components/ui/Modal';
import AdmissionForm from '@/components/admission/AdmissionForm';

// Define the HeroSlide interface
interface HeroSlide {
    id: number;
    image: string;
    alt_text: string;
    link: string;
    order: number;
}

export default function HeroSection() {
    const [showAdmissionModal, setShowAdmissionModal] = useState(false);
    // Define slides state
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [particles, setParticles] = useState<Array<{ x: string, y: string, anim: string, top: string, left: string }>>([]);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await fetch(apiUrl('/common/hero-slides/'));
                if (response.ok) {
                    const data = await response.json();
                    // The viewset returns a list directly or a paginated result? 
                    // Views.py says pagination_class = None, so it returns a list.
                    const results = Array.isArray(data) ? data : data.results || [];

                    if (results.length > 0) {
                        setSlides(results);
                    } else {
                        setSlides([]);
                    }
                } else {
                    console.error('Failed to fetch slides');
                }
            } catch (error) {
                console.error('Error fetching slides:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSlides();

        // Generate particles for magnetic button
        const newParticles = Array.from({ length: 50 }).map(() => ({
            x: `${Math.random() * 200 - 100}px`,
            y: `${Math.random() * 200 - 100}px`,
            anim: `${1 + Math.random() * 2}s`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
        }));
        setParticles(newParticles);
    }, []);

    const settings = {
        dots: false,
        infinite: true,
        fade: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        speed: 500,
        arrows: true,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
    };

    // If loading or no slides found, do NOT return null. We want to show the black background.
    // Logic moved to JSX


    // Use slides if available, otherwise it would have returned null above.
    // We REMOVED the static fallback.
    const heroSlides = slides;

    return (
        <>
            {/* Banner Slider Section */}
            <section className="banner-section">
                <div className="banner-slider">
                    {heroSlides.length > 0 ? (
                        <Slider {...settings}>
                            {heroSlides.map((slide: any, index: number) => {
                                const SlideContent = () => (
                                    <div className="slide-content relative h-full w-full">
                                        <Image
                                            src={mediaUrl(slide.image)}
                                            alt={slide.alt_text || "T.I.M.E. Kids Slide"}
                                            fill
                                            sizes="100vw"
                                            priority={index === 0}
                                            className="slide-image"
                                        />
                                        {slide.alt_text && slide.alt_text.trim() && (
                                            <div className="absolute bottom-24 right-4 md:right-10 flex justify-end pointer-events-none">
                                                <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-lg text-white border-l-4 border-orange-500 shadow-lg max-w-xl mx-4 transform transition-all hover:scale-105">
                                                    <h2 className="text-xl md:text-3xl font-bold font-display drop-shadow-md leading-tight">
                                                        {slide.alt_text}
                                                    </h2>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );

                                // Determine if link is external
                                const isExternalLink = slide.link && (slide.link.startsWith('http://') || slide.link.startsWith('https://'));

                                return (
                                    <div className="slide" key={slide.id}>
                                        {slide.link ? (
                                            <a
                                                href={slide.link}
                                                className="block w-full h-full cursor-pointer"
                                                {...(isExternalLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                            >
                                                <SlideContent />
                                            </a>
                                        ) : (
                                            <SlideContent />
                                        )}
                                    </div>
                                );
                            })}
                        </Slider>
                    ) : (
                        <div className="slide" style={{ backgroundColor: '#000' }}></div>
                    )}
                </div>

                <div className="banner-content">
                    <div className="container mx-auto px-4">
                        <div className="banner-content-inner">
                            <p className="banner-text">
                                From T.I.M.E., the institute with experience in training over{' '}
                                <span>16,00,000</span> + Students
                            </p>
                            <button
                                className="btn-enquiry magnetic-button"
                                onClick={() => setShowAdmissionModal(true)}
                            >
                                <span className="relative z-10">ADMISSION ENQUIRY</span>
                                <div className="particle-field">
                                    {particles.map((p, i) => (
                                        <div key={i} className="particle" style={{
                                            '--x': p.x,
                                            '--y': p.y,
                                            animationDuration: p.anim,
                                            left: p.left,
                                            top: p.top
                                        } as React.CSSProperties} />
                                    ))}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Modal
                isOpen={showAdmissionModal}
                onClose={() => setShowAdmissionModal(false)}
                title="Admission Enquiry"
                size="lg"
            >
                <AdmissionForm />
            </Modal>

            <style jsx global>{`
                .banner-section {
                    position: relative;
                    width: 100%;
                }

                .banner-slider {
                    position: relative;
                }

                .slide {
                    position: relative;
                    width: 100%;
                    height: 600px;
                }

                .slide-image {
                    width: 100%;
                    height: 600px;
                    object-fit: cover;
                    display: block;
                }

                /* Custom Slick Arrows */
                .banner-slider :global(.slick-prev),
                .banner-slider :global(.slick-next) {
                    width: 50px;
                    height: 222px;
                    background: url(/slider-arrows.png) no-repeat left top;
                    z-index: 22;
                    transition: all 0.5s ease-in-out;
                }

                .banner-slider :global(.slick-prev) {
                    left: 0;
                }

                .banner-slider :global(.slick-next) {
                    right: 0;
                    background-position: -50px 0;
                }

                .banner-slider :global(.slick-prev:before),
                .banner-slider :global(.slick-next:before) {
                    display: none;
                }

                .banner-slider :global(.slick-prev:hover),
                .banner-slider :global(.slick-next:hover) {
                    opacity: 0.8;
                }

                .banner-slider :global(.slick-slide img) {
                    width: 100%;
                }

                /* Banner Content Overlay */
                .banner-content {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    z-index: 22;
                    width: 100%;
                    min-height: 75px;
                    line-height: 65px;
                    background: rgba(0, 0, 0, 0.5);
                    font-size: 25px;
                    font-weight: 600;
                    color: #fff;
                }

                .banner-content-inner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .banner-text {
                    margin: 0;
                    padding: 0;
                    flex: 1;
                }

                .banner-text span {
                    font-weight: 600;
                    color: #d3e538;
                }

                .btn-enquiry {
                    float: right;
                    background: url(/icon-hand.png) no-repeat left top;
                    color: #f9d71c;
                    font-size: 22px;
                    line-height: 40px;
                    padding: 0 0 0 50px;
                    margin: 15px 0;
                    border: none;
                    cursor: pointer;
                    font-family: 'Dosis', sans-serif;
                    font-weight: 700;
                    transition: all 0.3s ease;
                }

                .btn-enquiry:hover {
                    text-decoration: none;
                    color: #fff;
                }

                /* Magnetic Button Particles */
                .magnetic-button {
                    position: relative;
                    overflow: visible !important;
                }

                .particle-field {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 100%;
                    height: 100%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s;
                    z-index: 0;
                }

                .magnetic-button:hover .particle-field {
                    opacity: 1;
                }

                .particle {
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    background: #f9d71c;
                    border-radius: 50%;
                    animation: particleFloat infinite ease-in-out;
                    box-shadow: 0 0 4px rgba(249, 215, 28, 0.6);
                }

                @keyframes particleFloat {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(var(--x), var(--y)); }
                }

                /* Mobile Responsive */
                @media (max-width: 998px) {
                    .banner-slider :global(.slick-prev),
                    .banner-slider :global(.slick-next) {
                        width: 25px;
                        height: 111px;
                        background: url(/slider-arrows-mobile.png) no-repeat left top;
                    }

                    .banner-slider :global(.slick-next) {
                        background-position: right 0;
                    }

                    .banner-content {
                        position: relative;
                        min-height: auto;
                        line-height: 30px;
                        padding: 15px 0;
                        background: #826b32;
                        text-align: center;
                    }

                    .banner-content-inner {
                        display: block;
                    }

                    .banner-text {
                        font-size: 18px;
                        line-height: 1.4;
                    }

                    .btn-enquiry {
                        float: none;
                        display: inline-block;
                        margin: 15px 0;
                        font-size: 18px;
                    }

                    .slide {
                        height: 300px;
                    }
                }
            `}</style>
        </>
    );
}

// Custom Arrow Components
function PrevArrow(props: any) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{ ...style, display: 'block' }}
            onClick={onClick}
        />
    );
}

function NextArrow(props: any) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{ ...style, display: 'block' }}
            onClick={onClick}
        />
    );
}

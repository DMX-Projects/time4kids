'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Modal from '@/components/ui/Modal';
import AdmissionForm from '@/components/admission/AdmissionForm';

import { mediaUrl } from '@/lib/api-client';

interface HeroSlide {
    id: number;
    image: string;
    alt_text: string;
    link?: string;
}

interface SchoolHeroSectionProps {
    schoolName: string;
    slides?: HeroSlide[];
}

export default function SchoolHeroSection({ schoolName, slides }: SchoolHeroSectionProps) {
    console.log('DEBUG SLIDES:', slides);
    const [showAdmissionModal, setShowAdmissionModal] = useState(false);
    const [particles, setParticles] = useState<Array<{ x: string, y: string, anim: string, top: string, left: string }>>([]);

    useEffect(() => {
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
        autoplaySpeed: 3000,
        speed: 500,
        arrows: true,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
    };

    // Use dynamic slides if available, otherwise use static defaults
    const heroSlides = (slides && slides.length > 0) ? slides.map(s => ({
        ...s,
        image: mediaUrl(s.image)
    })) : [
        {
            id: 1,
            image: '/images/landing-banner.jpg',
            alt_text: `Welcome to ${schoolName}`,
        },
        {
            id: 2,
            image: '/1.png',
            alt_text: "Nurturing Young Minds",
        }
    ];

    return (
        <>
            <section className="banner-section">
                <div className="banner-slider">
                    <Slider {...settings}>
                        {heroSlides.map((slide, index) => (
                            <div className="slide" key={slide.id}>
                                <div className="slide-content relative h-full w-full">
                                    <Image
                                        src={slide.image}
                                        alt={slide.alt_text}
                                        fill
                                        sizes="100vw"
                                        priority={index === 0}
                                        className="slide-image"
                                    />
                                    {/* Text Overlay Removed as per request */}
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>

                <div className="banner-content">
                    <div className="container mx-auto px-4">
                        <div className="banner-content-inner">
                            <p className="banner-text font-fredoka">
                                Admissions Open at <span className="text-yellow-400">{schoolName}</span>
                            </p>
                            <button
                                className="btn-enquiry magnetic-button"
                                onClick={() => setShowAdmissionModal(true)}
                            >
                                <span className="relative z-10 font-fredoka tracking-wide">ADMISSION ENQUIRY</span>
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
                title={`Admission Enquiry - ${schoolName}`}
                size="lg"
            >
                <AdmissionForm />
            </Modal>

            <style jsx global>{`
                .banner-section { position: relative; width: 100%; }
                .banner-slider { position: relative; }
                .slide { position: relative; width: 100%; height: 600px; }
                .slide-image { width: 100%; height: 600px; object-fit: cover; display: block; }
                
                .banner-slider :global(.slick-prev),
                .banner-slider :global(.slick-next) {
                    width: 50px; height: 222px; background: url(/slider-arrows.png) no-repeat left top; z-index: 22; transition: all 0.5s ease-in-out;
                }
                .banner-slider :global(.slick-prev) { left: 0; }
                .banner-slider :global(.slick-next) { right: 0; background-position: -50px 0; }
                .banner-slider :global(.slick-prev:before), .banner-slider :global(.slick-next:before) { display: none; }
                .banner-slider :global(.slick-prev:hover), .banner-slider :global(.slick-next:hover) { opacity: 0.8; }
                
                .banner-content {
                    position: absolute; left: 0; bottom: 0; z-index: 22; width: 100%; min-height: 90px;
                    display: flex; align-items: center;
                    background: rgba(0, 0, 0, 0.75); 
                    backdrop-filter: blur(12px);
                    border-top: 1px solid rgba(255,255,255,0.1);
                    font-size: 28px; font-weight: 600; color: #fff;
                }
                .banner-content-inner { display: flex; align-items: center; justify-content: space-between; width: 100%; }
                .banner-text { margin: 0; padding: 0; flex: 1; letter-spacing: 0.5px; }
                .banner-text span { font-weight: 700; color: #fbbf24; }
                
                .btn-enquiry {
                    background: url(/icon-hand.png) no-repeat left center; 
                    background-size: 40px;
                    color: #fff;
                    font-size: 20px; line-height: 50px; padding: 0 30px 0 60px; 
                    margin: 0; border: none; cursor: pointer;
                    font-family: inherit; font-weight: 700; transition: all 0.3s ease;
                    border-radius: 50px;
                    background-color: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .btn-enquiry:hover { 
                    transform: translateY(-2px); 
                    background-color: rgba(255, 255, 255, 0.2);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                }
                
                .magnetic-button { position: relative; overflow: visible !important; }
                .particle-field { position: absolute; top: 50%; left: 50%; width: 100%; height: 100%; transform: translate(-50%, -50%); pointer-events: none; opacity: 0; transition: opacity 0.3s; z-index: 0; }
                .magnetic-button:hover .particle-field { opacity: 1; }
                .particle { position: absolute; width: 6px; height: 6px; background: #f9d71c; border-radius: 50%; animation: particleFloat infinite ease-in-out; box-shadow: 0 0 4px rgba(249, 215, 28, 0.6); }
                @keyframes particleFloat { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(var(--x), var(--y)); } }

                @media (max-width: 998px) {
                    .banner-slider :global(.slick-prev), .banner-slider :global(.slick-next) { width: 25px; height: 111px; background: url(/slider-arrows-mobile.png) no-repeat left top; }
                    .banner-slider :global(.slick-next) { background-position: right 0; }
                    
                    .banner-content { 
                        position: relative; min-height: auto; 
                        padding: 24px 0; 
                        background: #1a1a1a; 
                        text-align: center;
                        border-top: none;
                    }
                    .banner-content-inner { display: flex; flex-direction: column; gap: 16px; }
                    .banner-text { font-size: 20px; line-height: 1.4; }
                    
                    .btn-enquiry { 
                        float: none; display: inline-block; 
                        font-size: 18px; line-height: 44px;
                        background-position: 20px center;
                        padding-left: 70px;
                        padding-right: 30px;
                    }
                    
                    .slide { height: 300px; }
                    .slide-image { height: 300px; }
                }
            `}</style>
        </>
    );
}

function PrevArrow(props: any) {
    const { className, style, onClick } = props;
    return <div className={className} style={{ ...style, display: 'block' }} onClick={onClick} />;
}

function NextArrow(props: any) {
    const { className, style, onClick } = props;
    return <div className={className} style={{ ...style, display: 'block' }} onClick={onClick} />;
}

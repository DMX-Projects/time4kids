'use client';

import React, { useState, useEffect } from 'react';

import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Define the HeroSlide interface
interface HeroSlide {
    id: number;
    image: string;
    alt_text: string;
    order: number;
}

export default function HeroSection() {
    const [showAdmissionModal, setShowAdmissionModal] = useState(false);
    const [slides, setSlides] = useState<HeroSlide[]>([]);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/common/hero-slides/');
                if (response.ok) {
                    const data = await response.json();
                    setSlides(data);
                } else {
                    console.error('Failed to fetch slides');
                }
            } catch (error) {
                console.error('Error fetching slides:', error);
            }
        };

        fetchSlides();
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

    // Fallback static slides if no dynamic slides are available
    const heroSlides = slides.length > 0 ? slides : [
        { id: 's1', image: "/slide1.jpg", alt_text: "T.I.M.E. Kids Slide 1" },
        { id: 's2', image: "/images/center-images/center-slide-1.jpg", alt_text: "T.I.M.E. Kids Slide 2" },
        { id: 's3', image: "/images/center-images/center-slide-2.jpg", alt_text: "T.I.M.E. Kids Slide 3" }
    ];

    return (
        <>
            {/* Banner Slider Section */}
            <section className="banner-section">
                <div className="banner-slider">
                    <Slider {...settings}>
                        {heroSlides.map((slide: any, index: number) => (
                            <div className="slide" key={slide.id}>
                                <Image
                                    src={slide.image}
                                    alt={slide.alt_text || "T.I.M.E. Kids Slide"}
                                    width={1920}
                                    height={600}
                                    priority={index === 0}
                                    className="slide-image"
                                />
                            </div>
                        ))}
                    </Slider>
                </div>

                <div className="banner-content">
                    <div className="container mx-auto px-4">
                        <div className="banner-content-inner">
                            <p className="banner-text">
                                From T.I.M.E., the institute with experience in training over{' '}
                                <span>16,00,000</span> + Students
                            </p>
                            <button
                                className="btn-enquiry"
                                onClick={() => setShowAdmissionModal(true)}
                            >
                                ADMISSION ENQUIRY
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <style jsx global>{`
                .banner-section {
                    position: relative;
                    width: 100%;
                }

                .banner-slider {
                    position: relative;
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

                    .slide-image {
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

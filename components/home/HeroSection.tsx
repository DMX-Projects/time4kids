'use client';

import React, { useState, useEffect } from 'react';

import Image from 'next/image';
import Slider from 'react-slick';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [currentSlide, setCurrentSlide] = useState(0);
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
        autoplaySpeed: 5000,
        speed: 1500,
        cssEase: "cubic-bezier(0.7, 0, 0.3, 1)",
        pauseOnHover: false,
        arrows: true,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        afterChange: (current: number) => setCurrentSlide(current),
    };

    const BLOB_CONTENT = [
        {
            title: "Most attractive",
            subtitle: "Franchising terms amongst all Pre-schools",
            highlights: ["End to End Support", "20 Years of Franchise Expertise"],
        },
        {
            title: "Start your own Preschool",
            subtitle: "as a Franchise of T.I.M.E. Kids",
            highlight: "Low Investment & High returns!"
        },
        {
            title: "Home away\nfrom Home",
            subtitle: "for your Child",
            stats: [
                { val: "250+", label: "Pre-schools" },
                { val: "50,000+", label: "Students Trained" }
            ],
            cta: "Admissions Open"
        },
        {
            title: "Holistic development",
            subtitle: "of your Child",
            stats: [
                { val: "250+", label: "Pre-schools" },
                { val: "50,000+", label: "Students Trained" }
            ]
        }
    ];

    const BlobOverlay = ({ index, isActive }: { index: number, isActive: boolean }) => {
        const content = BLOB_CONTENT[index % BLOB_CONTENT.length];

        return (
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ y: 200, opacity: 0, scale: 0.8 }}
                        animate={{
                            y: 0,
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{ y: 200, opacity: 0, transition: { duration: 0.8, ease: [0.32, 0, 0.67, 0] } }}
                        transition={{
                            duration: 1.2,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.3
                        }}
                        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                    >
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                rotate: [-1, 1, -1]
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative w-[320px] h-[320px] md:w-[500px] md:h-[500px] flex items-center justify-center"
                        >
                            {/* SVG Blob from Image 5 Shape - Made semi-transparent */}
                            <svg viewBox="0 0 200 200" className="absolute top-0 left-0 w-full h-full drop-shadow-3xl filter blur-[1px] opacity-80">
                                <path
                                    fill="rgba(241, 90, 41, 0.85)"
                                    d="M45.7,-77.6C58.9,-70.5,69.1,-58.1,76.4,-44.2C83.7,-30.3,88.1,-15.1,87.4,-0.4C86.7,14.3,80.8,28.7,71.2,40.9C61.5,53.2,48.1,63.4,33.5,70.1C18.9,76.8,3,80.1,-13.4,77.9C-29.8,75.7,-46.8,68.1,-59.6,56.1C-72.4,44.1,-81,27.7,-84.3,10.6C-87.6,-6.6,-85.7,-24.5,-77.3,-39.2C-68.9,-53.9,-54.1,-65.4,-39.1,-71.4C-24.1,-77.4,-8.9,-77.9,3.4,-83.8C15.7,-89.6,32.5,-84.7,45.7,-77.6Z"
                                    transform="translate(100 100)"
                                />
                                {/* Decorative elements from Image 5 */}
                                <circle cx="45" cy="155" r="12" fill="none" stroke="#8AC43F" strokeWidth="6" opacity="0.8" />
                                <path d="M150,150 Q165,130 155,110" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
                                <circle cx="170" cy="80" r="4" fill="#FFD700" />
                            </svg>

                            <div className="relative z-30 flex flex-col items-center justify-center p-8 md:p-12 text-white text-center">
                                <h3 className="text-2xl md:text-4xl font-luckiest leading-tight drop-shadow-lg mb-2 whitespace-pre-line">
                                    {content.title}
                                </h3>
                                <p className="text-lg md:text-2xl font-fredoka font-medium leading-tight opacity-95 mb-4">
                                    {content.subtitle}
                                </p>

                                {content.highlights && (
                                    <div className="flex flex-col gap-2 mt-2">
                                        {content.highlights.map((h, i) => (
                                            <div key={i} className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-sm md:text-base font-semibold flex items-center gap-2">
                                                <span className="text-yellow-300">✓</span> {h}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {content.highlight && (
                                    <div className="bg-white text-[#F15A29] px-6 py-2 rounded-full font-bold text-lg md:text-xl shadow-xl mt-4 border-2 border-orange-200">
                                        {content.highlight}
                                    </div>
                                )}

                                {content.stats && (
                                    <div className="flex gap-4 mt-6">
                                        {content.stats.map((stat, i) => (
                                            <div key={i} className="flex flex-col items-center bg-white/20 backdrop-blur-md p-3 md:p-4 rounded-3xl border border-white/10 min-w-[100px] md:min-w-[140px]">
                                                <span className="text-xl md:text-3xl font-luckiest text-yellow-300">{stat.val}</span>
                                                <span className="text-[10px] md:text-xs uppercase font-bold tracking-widest">{stat.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {content.cta && (
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="mt-6 text-xl md:text-3xl font-luckiest text-yellow-300 drop-shadow-md tracking-wide"
                                    >
                                        {content.cta}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
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
                                    <div className="slide-content relative h-full w-full overflow-hidden">
                                        <Image
                                            src={mediaUrl(slide.image)}
                                            alt={slide.alt_text || "T.I.M.E. Kids Slide"}
                                            fill
                                            sizes="100vw"
                                            priority={index === 0}
                                            className="slide-image"
                                        />

                                        {/* New Blob Overlay */}
                                        <BlobOverlay index={index} isActive={index === currentSlide} />

                                        {/* Original fallback text (only show if no blob content or for extra slides) */}
                                        {(index >= 4 || (!slide.alt_text && index >= 4)) && slide.alt_text && slide.alt_text.trim() && slide.alt_text.toLowerCase() !== 'img' && (
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
                        <div className="flex justify-end">
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
                    bottom: 20px;
                    z-index: 22;
                    width: 100%;
                }

                .btn-enquiry {
                    float: right;
                    background: url(/icon-hand.png) no-repeat left top;
                    color: #f9d71c;
                    font-size: 22px;
                    line-height: 40px;
                    padding: 0 0 0 50px;
                    margin: 0;
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

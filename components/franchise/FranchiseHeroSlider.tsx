'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { mediaUrl, apiUrl } from '@/lib/api-client';

interface HeroSlide {
    id: number;
    image: string;
    alt_text: string;
    link: string;
    order: number;
}

interface FranchiseHeroSliderProps {
    franchiseSlug?: string; // If provided, fetches public slides
    slides?: HeroSlide[]; // If provided, uses these slides (e.g. preview)
}

export default function FranchiseHeroSlider({ franchiseSlug, slides: initialSlides }: FranchiseHeroSliderProps) {
    const [slides, setSlides] = useState<HeroSlide[]>(initialSlides || []);
    const [dSlides, setDSlides] = useState<HeroSlide[]>(initialSlides || []);
    const [loading, setLoading] = useState(!initialSlides);

    useEffect(() => {
        if (initialSlides) {
            setDSlides(initialSlides);
            setLoading(false);
            return;
        }

        if (franchiseSlug) {
            const fetchSlides = async () => {
                try {
                    const response = await fetch(apiUrl(`/franchises/public/franchise-hero-slides/?franchise_slug=${franchiseSlug}`));
                    if (response.ok) {
                        const data = await response.json();
                        setDSlides(data.results || data);
                    }
                } catch (error) {
                    console.error('Error fetching slides:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchSlides();
        } else {
            setLoading(false);
        }
    }, [franchiseSlug, initialSlides]);

    const settings = {
        dots: true,
        infinite: true,
        fade: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 500,
        arrows: false,
    };

    if (loading) {
        return <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl"></div>;
    }

    // Default Fallback
    if (dSlides.length === 0) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white p-6 text-center">
                <div>
                    <h3 className="text-2xl font-bold mb-2">Welcome to T.I.M.E. Kids</h3>
                    <p>Empowering young minds.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-xl">
            <Slider {...settings} className="h-full">
                {dSlides.map((slide) => {
                    const SlideContent = () => (
                        <div className="relative w-full h-full min-h-[400px] md:min-h-[500px]">
                            <Image
                                src={mediaUrl(slide.image)}
                                alt={slide.alt_text || "Franchise Slide"}
                                fill
                                sizes="100vw"
                                className="object-cover"
                            />
                            {slide.alt_text && (
                                <div className="absolute bottom-10 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                    <h3 className="text-white text-xl md:text-2xl font-bold text-center drop-shadow-md">
                                        {slide.alt_text}
                                    </h3>
                                </div>
                            )}
                        </div>
                    );

                    if (slide.link) {
                        return (
                            <a
                                key={slide.id}
                                href={slide.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block h-full w-full"
                            >
                                <SlideContent />
                            </a>
                        );
                    }

                    return (
                        <div key={slide.id} className="h-full w-full">
                            <SlideContent />
                        </div>
                    );
                })}
            </Slider>

            {/* Custom Dots Style Override */}
            <style jsx global>{`
                .slick-dots {
                    bottom: 20px;
                }
                .slick-dots li button:before {
                    color: white;
                    font-size: 10px;
                    opacity: 0.5;
                }
                .slick-dots li.slick-active button:before {
                    color: #fff;
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}

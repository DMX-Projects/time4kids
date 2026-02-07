'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { mediaUrl } from '@/lib/api-client';

interface SchoolHeroSectionProps {
    schoolName: string;
    slides: Array<{
        id: number;
        image: string;
        alt_text?: string;
    }>;
}

export default function SchoolHeroSection({ schoolName, slides }: SchoolHeroSectionProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const settings = {
        dots: false,
        infinite: true,
        fade: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 1000,
        arrows: true,
        afterChange: (current: number) => setCurrentSlide(current),
    };

    return (
        <section className="relative w-full h-[500px] md:h-[650px] overflow-hidden">
            {slides && slides.length > 0 ? (
                <Slider {...settings} className="h-full">
                    {slides.map((slide, index) => (
                        <div key={slide.id} className="relative h-[500px] md:h-[650px]">
                            <Image
                                src={mediaUrl(slide.image)}
                                alt={slide.alt_text || schoolName}
                                fill
                                priority={index === 0}
                                className="object-cover"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/20" />
                        </div>
                    ))}
                </Slider>
            ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <h1 className="text-4xl font-bold text-slate-400">{schoolName}</h1>
                </div>
            )}



            <style jsx global>{`
                .slick-prev, .slick-next {
                    z-index: 10;
                    width: 40px;
                    height: 40px;
                }
                .slick-prev { left: 20px; }
                .slick-next { right: 20px; }
            `}</style>
        </section>
    );
}

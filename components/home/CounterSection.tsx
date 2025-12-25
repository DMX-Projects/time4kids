'use client';

import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import Image from 'next/image';

export default function CounterSection() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <div className="count-results" ref={sectionRef}>
            <div className="wave-gray-top" />

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 300 Schools */}
                    <div className="result1">
                        <span className="bird1">
                            <Image src="/icon-bird1.png" alt="Bird" width={80} height={60} />
                        </span>
                        <strong className="counter-value">
                            {isVisible ? <CountUp end={300} duration={3} /> : 0}
                        </strong>
                        Schools
                    </div>

                    {/* 72000 Students */}
                    <div className="result1">
                        <strong className="counter-value">
                            {isVisible ? <CountUp end={72000} duration={3} separator="," /> : 0}
                        </strong>
                        Smart Students Trained
                    </div>

                    {/* 80 Cities */}
                    <div className="result1">
                        <span className="bird2">
                            <Image src="/icon-bird2.png" alt="Bird" width={80} height={60} />
                        </span>
                        <strong className="counter-value">
                            {isVisible ? <CountUp end={80} duration={3} /> : 0}
                        </strong>
                        Cities
                    </div>
                </div>
            </div>

            <div className="wave-gray-bottom" />

            <style jsx>{`
                .count-results {
                    float: left;
                    width: 100%;
                    padding: 50px 0;
                    background-color: #f5f1dd;
                    position: relative;
                    clear: both;
                }

                .wave-gray-top {
                    position: absolute;
                    left: 0;
                    top: -28px;
                    width: 100%;
                    height: 28px;
                    background: url(/wave-gray.png) repeat-x left top;
                    animation: slide 60s linear infinite;
                }

                .wave-gray-bottom {
                    position: absolute;
                    left: 0;
                    bottom: -28px;
                    width: 100%;
                    height: 28px;
                    background: url(/wave-gray2.png) repeat-x left top;
                }

                @keyframes slide {
                    from {
                        background-position: 0 0;
                    }
                    to {
                        background-position: -4000px 0;
                    }
                }

                .result1 {
                    background: #fff;
                    border: 1px solid #dcd5af;
                    border-radius: 100px;
                    padding: 30px;
                    text-align: center;
                    color: #333;
                    font-size: 26px;
                    line-height: 43px;
                    font-weight: 600;
                    position: relative;
                    margin-top: 45px;
                }

                .result1 strong {
                    display: block;
                    color: #c94a36;
                    font-size: 34px;
                    font-weight: 800;
                }

                .result1 .bird1 {
                    position: absolute;
                    top: -45px;
                    left: 40px;
                    z-index: 22;
                }

                .result1 .bird2 {
                    position: absolute;
                    top: -45px;
                    right: 40px;
                    z-index: 22;
                }

                @media (max-width: 768px) {
                    .count-results {
                        padding: 25px 0;
                    }

                    .result1 {
                        font-size: 22px;
                        line-height: 35px;
                        margin-bottom: 20px;
                    }

                    .result1 strong {
                        font-size: 28px;
                    }
                }
            `}</style>
        </div>
    );
}

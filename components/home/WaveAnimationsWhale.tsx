'use client';

import React from 'react';
import Image from 'next/image';

export default function WaveAnimationsWhale() {
    return (
        <div className="block1-section">
            {/* Top Waves */}
            <div className="wave-horizontals">
                <div className="wave-horizontal wave1"></div>
                <div className="wave-horizontal wave2"></div>
                <div className="wave-horizontal wave3"></div>
            </div>

            {/* Floating Whale */}
            <Image
                src="/whale.png"
                alt="Whale"
                width={150}
                height={100}
                className="floating-whale"
            />

            <style jsx global>{`
                .block1-section {
                    position: relative;
                    margin: 0 0 -20px 0;
                }

                .wave-horizontals {
                    width: 100%;
                    height: 20px;
                    position: relative;
                    bottom: 0;
                    z-index: 9;
                    float: left;
                }

                .wave-horizontals-bottom {
                    transform: rotate(-180deg);
                }

                .wave-horizontal {
                    width: 100%;
                    height: 100%;
                    display: block;
                    position: absolute;
                    background-repeat: repeat-x;
                    animation: move 12s linear infinite;
                }

                @keyframes move {
                    0% {
                        background-position: left 0px bottom 0;
                    }
                    100% {
                        background-position: left 350px bottom 0;
                    }
                }

                .wave1,
                .wave2,
                .wave3 {
                    background: url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' width='350px' height='20px' viewBox='0 0 350 20'%3E%3Cpath fill='%23035392' d='M0,17.1C29.9,17.1,57.8,0,87.5,0c30.2,0,58.1,17.1,87.1,17.1c29.9,0,57.8-17.1,87.7-17.1 s57.8,17.1,87.7,17.1V20H0V17.1z'/%3E%3C/svg%3E");
                }

                .wave1 {
                    background-size: 100px 100px;
                    opacity: 0.3;
                    animation-delay: 0s;
                }

                .wave2 {
                    animation-delay: -2s;
                    animation-duration: 12s;
                    opacity: 0.5;
                }

                .wave3 {
                    animation-delay: -4s;
                    animation-duration: 8s;
                }

                .floating-whale {
                    position: absolute;
                    left: 50%;
                    z-index: 0;
                    animation: float 3s ease-in-out infinite;
                    margin-bottom: -30px;
                    margin-left: 120px;
                }

                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                @media (max-width: 768px) {
                    .floating-whale {
                        margin-left: 0;
                        left: 30%;
                    }
                }
            `}</style>
        </div>
    );
}

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MethodologySection() {
    const methodologyItems = [
        { icon: '/methodology-icon1.png', label: 'Modular Furniture', class: 'nav-item1' },
        { icon: '/methodology-icon2.png', label: 'Play-Learn methods', class: 'nav-item2' },
        { icon: '/methodology-icon3.png', label: 'After School fun', class: 'nav-item3' },
        { icon: '/methodology-icon4.png', label: 'Prioritizing Hygiene', class: 'nav-item4' },
        { icon: '/methodology-icon5.png', label: 'Teaching Aids', class: 'nav-item5' },
        { icon: '/methodology-icon6.png', label: 'Health Check-up', class: 'nav-item6' },
    ];

    return (
        <section className="methodology-block">
            <div className="container mx-auto px-4">
                <h3>Value based methodology</h3>
                <ul className="methodology-nav">
                    {methodologyItems.map((item, index) => (
                        <li key={index} className={item.class}>
                            <Link href="#">
                                <span>
                                    <Image src={item.icon} alt={item.label} width={60} height={60} style={{ height: 'auto' }} />
                                </span>
                                <strong>{item.label}</strong>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <style jsx>{`
                .methodology-block {
                    background: #bde2f4 url(/bg1.png) no-repeat center bottom;
                    background-size: cover;
                    text-align: center;
                    padding: 50px 0;
                }

                .methodology-block h3 {
                    font-family: 'Schoolbell', cursive;
                    color: #085390;
                    font-size: 28px;
                    line-height: 30px;
                    font-weight: 600;
                    margin: 30px 0;
                }

                .methodology-nav {
                    display: flex;
                    padding: 30px 0 50px 0;
                    margin: 0;
                    justify-content: space-between;
                    list-style: none;
                }

                .methodology-nav li {
                    text-align: center;
                    flex-basis: 16%;
                    font-weight: 500;
                    font-size: 18px;
                    line-height: 22px;
                    color: #fff;
                    padding: 30px 16px;
                    transition: all 0.8s ease-in-out;
                    box-shadow: 0px 0px 32px -3px rgba(0, 0, 0, 0.5);
                }

                .methodology-nav li span {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 70px;
                    position: relative;
                    transition: all 0.8s ease-in-out;
                }

                .methodology-nav li strong {
                    font-weight: 500;
                    display: block;
                    padding: 8px 25px 0;
                    position: relative;
                    transition: all 0.8s ease-in-out;
                }

                .methodology-nav li :global(a) {
                    color: #fff;
                    text-decoration: none;
                }

                .methodology-nav li :global(a:hover) {
                    color: #e0f6ff;
                }

                .methodology-nav .nav-item1 {
                    background: #e6952e;
                    border-radius: 65% 35% 28% 72% / 42% 49% 51% 58%;
                }

                .methodology-nav .nav-item2 {
                    background: #94b64f;
                    border-radius: 41% 59% 44% 56% / 67% 66% 34% 33%;
                }

                .methodology-nav .nav-item3 {
                    background: #c94a36;
                    border-radius: 30% 70% 64% 36% / 30% 30% 70% 70%;
                }

                .methodology-nav .nav-item4 {
                    background: #e6952e;
                    border-radius: 65% 35% 28% 72% / 42% 49% 51% 58%;
                }

                .methodology-nav .nav-item5 {
                    background: #94b64f;
                    border-radius: 41% 59% 44% 56% / 67% 66% 34% 33%;
                }

                .methodology-nav .nav-item6 {
                    background: #c94a36;
                    border-radius: 41% 59% 44% 56% / 67% 66% 34% 33%;
                }

                .methodology-nav li:hover {
                    transform: rotate(-20deg);
                    border-radius: 50%;
                }

                .methodology-nav li:hover strong {
                    transform: rotate(20deg);
                }

                .methodology-nav li:hover span {
                    transform: rotate(10deg);
                }

                /* Responsive */
                @media (max-width: 998px) {
                    .methodology-nav {
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .methodology-nav li {
                        flex-basis: 28%;
                        margin: 15px;
                    }
                }

                @media (max-width: 768px) {
                    .methodology-nav li {
                        flex-basis: 45%; /* 2 items per row */
                        margin: 10px 0;
                    }
                }

                @media (max-width: 480px) {
                    .methodology-nav li {
                        flex-basis: 100%; /* 1 item per row on very small screens */
                    }
                }
            `}</style>
        </section>
    );
}

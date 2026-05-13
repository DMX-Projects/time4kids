'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { gsap } from 'gsap';
import QRCode from '@/components/ui/QRCode';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const footerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Same school bus drive animation used in ProgramsPreview.
            gsap.fromTo(
                '.footer-school-bus',
                { x: 0 },
                {
                    x: '-150vw',
                    duration: 15,
                    repeat: -1,
                    ease: 'none',
                },
            );

            gsap.to('.footer-school-bus', {
                y: -2,
                duration: 0.6,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        }, footerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={footerRef}>
            <footer
                className="relative overflow-hidden font-sans text-gray-800 bg-[url('/footer.jpg.jpeg')] bg-cover bg-no-repeat bg-[center_bottom] pb-[150px]"
            >
                <Image
                    src="/footer-img1.png"
                    alt=""
                    width={1398}
                    height={121}
                    className="block h-auto w-full select-none object-cover"
                    priority={false}
                />

                {/* Main Footer Content */}
                <div className="relative z-10 container mx-auto px-8 md:px-16 lg:px-24 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Column 1: Logo & Description */}
                    <div className="space-y-4">
                        <div className="relative w-40 h-16">
                            <Image
                                src="/time-kids-logo-new.png"
                                alt="Time Kids Logo"
                                fill
                                sizes="160px"
                                className="object-contain object-left"
                            />
                        </div>
                        <p className="text-gray-900 text-sm leading-relaxed font-medium">
                            17 Years of Legacy in Early Education. 250+ preschools across India providing quality education with NEP 2020 updated curriculum.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-gray-900">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-gray-800 hover:text-blue-600 transition-colors text-sm font-medium">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/programs" className="text-gray-800 hover:text-blue-600 transition-colors text-sm font-medium">
                                    Our Programs
                                </Link>
                            </li>
                            <li>
                                <Link href="/admission" className="text-gray-800 hover:text-blue-600 transition-colors text-sm font-medium">
                                    Admission
                                </Link>
                            </li>
                            <li>
                                <Link href="/franchise" className="text-gray-800 hover:text-blue-600 transition-colors text-sm font-medium">
                                    Franchise
                                </Link>
                            </li>
                            <li>
                                <Link href="/locate-centre" className="text-gray-800 hover:text-blue-600 transition-colors text-sm font-medium">
                                    Locate Centre
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-800 hover:text-blue-600 transition-colors text-sm font-medium">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-gray-800 hover:text-blue-600 transition-colors text-sm font-medium">
                                    Careers
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Us */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-gray-900">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                                <a href="mailto:info@timekids.com" className="text-gray-800 hover:text-blue-600 transition-colors text-sm font-medium">
                                    info@timekids.com
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Phone className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                                <a href="tel:+917019124852" className="text-gray-800 hover:text-blue-600 transition-colors text-sm font-medium">
                                    +91 7019124852
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-800 text-sm font-medium">
                                    Hyderabad, India
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Connect With Us */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-gray-900">Connect With Us</h3>
                        <div className="flex space-x-3 mb-6">
                            <a
                                href="https://www.facebook.com/pages/TIME-Kids/187099544682886"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-600 hover:bg-blue-600 text-white rounded flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a
                                href="https://www.instagram.com/timekidspreschools"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-600 hover:bg-pink-600 text-white rounded flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a
                                href="https://www.youtube.com/@t.i.m.e.kidspreschoolstkps9493"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-gray-600 hover:bg-red-600 text-white rounded flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>
                        <p className="text-sm text-gray-800 mb-3 font-medium">Scan to connect:</p>
                        <div className="bg-white p-2 inline-block rounded-lg shadow-sm hover:scale-105 transition-transform duration-300">
                            <QRCode
                                value="https://www.timekidspreschools.in"
                                size={100}
                                includeMargin={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
            </footer>

            {/* Copyright — outside <footer> (sibling); wrapped in fragment for valid JSX */}
            <div className="relative border-t border-gray-300 bg-gradient-to-r from-blue-50 to-green-50 py-4">
                <Image
                    src="/images/school-bus.png"
                    alt=""
                    width={90}
                    height={90}
                    className="footer-school-bus pointer-events-none absolute -top-[44px] opacity-100 saturate-200 brightness-100 contrast-110 drop-shadow-[0_10px_14px_rgba(120,72,20,0.35)]"
                    style={{ left: '100%' }}
                />
                
                <div className="container mx-auto px-8 text-center">
                    <p className="text-sm font-medium text-gray-800">
                        © {currentYear} All Rights Reserved. T.I.M.E. Kids Preschools.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Footer;

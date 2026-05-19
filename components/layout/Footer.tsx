'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail } from 'lucide-react';
import { SocialBrandLink } from '@/components/ui/SocialBrandIcons';
import { gsap } from 'gsap';
import { useFooterContent } from '@/components/layout/FooterContentProvider';

const Footer = () => {
    const footer = useFooterContent();
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const footerPhone = isHomePage ? footer.homepage_phone : footer.contact.phone;
    const footerPhoneTel = isHomePage ? footer.homepage_phone_tel : footer.contact.phone_tel;
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
                className="relative overflow-hidden font-sans text-gray-800 bg-[url('/footer.jpg.jpeg')] bg-cover bg-no-repeat bg-[center_top] pb-8 md:bg-[center_bottom] md:pb-[150px]"
            >
                <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/95 md:from-transparent md:via-transparent md:to-transparent"
                    aria-hidden
                />
                <Image
                    src="/footer-img1.png"
                    alt=""
                    width={1398}
                    height={121}
                    className="relative z-[1] block h-auto w-full select-none object-cover"
                    priority={false}
                />

                {/* Main Footer Content */}
                <div className="relative z-10 container mx-auto px-4 py-10 sm:px-8 md:px-16 md:py-12 lg:px-24">
                    <div className="mx-auto grid max-w-lg grid-cols-1 gap-10 text-center md:max-w-none md:grid-cols-2 md:gap-8 md:text-left lg:grid-cols-4">
                    {/* Column 1: Logo & Description */}
                    <div className="space-y-4">
                        <div className="relative mx-auto h-16 w-40 md:mx-0">
                            <Image
                                src="/time-kids-logo-new.png"
                                alt="Time Kids Logo"
                                fill
                                sizes="160px"
                                className="object-contain object-center md:object-left"
                            />
                        </div>
                        <p className="text-gray-900 text-sm leading-relaxed font-medium">{footer.about_text}</p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-gray-900 md:mb-6">Quick Links</h3>
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
                        <h3 className="mb-4 text-lg font-bold text-gray-900 md:mb-6">Contact Us</h3>
                        <ul className="mx-auto flex w-fit max-w-full flex-col gap-3 text-left md:mx-0 md:w-full md:gap-4">
                            <li className="flex items-start gap-3">
                                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gray-900" aria-hidden />
                                <a
                                    href={`mailto:${footer.contact.email}`}
                                    className="min-w-0 break-all text-sm font-medium text-gray-800 transition-colors hover:text-blue-600"
                                >
                                    {footer.contact.email}
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-gray-900" aria-hidden />
                                <a
                                    href={footerPhoneTel}
                                    className="text-sm font-medium text-gray-800 transition-colors hover:text-blue-600"
                                >
                                    {footerPhone}
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gray-900" aria-hidden />
                                <span className="text-sm font-medium text-gray-800">
                                    {footer.contact.location_label}
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Connect With Us */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-gray-900 md:mb-6">Connect With Us</h3>
                        <div className="flex justify-center gap-3 md:justify-start">
                            <SocialBrandLink platform="facebook" href={footer.social.facebook} size="sm" />
                            <SocialBrandLink platform="instagram" href={footer.social.instagram} size="sm" />
                            <SocialBrandLink platform="youtube" href={footer.social.youtube} size="sm" />
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

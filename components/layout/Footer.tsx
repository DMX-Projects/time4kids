'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import QRCode from '@/components/ui/QRCode';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="relative w-40 h-12">
                                <Image
                                    src="/logo.jpg"
                                    alt="T.I.M.E. Kids Logo"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            17 Years of Legacy in Early Education. 250+ preschools across India providing quality education with NEP 2020 updated curriculum.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-display font-bold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-gray-300 hover:text-primary-400 transition-colors">About Us</Link></li>
                            <li><Link href="/programs" className="text-gray-300 hover:text-primary-400 transition-colors">Our Programs</Link></li>
                            <li><Link href="/admission" className="text-gray-300 hover:text-primary-400 transition-colors">Admission</Link></li>
                            <li><Link href="/franchise" className="text-gray-300 hover:text-primary-400 transition-colors">Franchise</Link></li>
                            <li><Link href="/locate-centre" className="text-gray-300 hover:text-primary-400 transition-colors">Locate Centre</Link></li>
                            <li><Link href="/contact" className="text-gray-300 hover:text-primary-400 transition-colors">Contact Us</Link></li>
                            <li><Link href="/contact#careers" className="text-gray-300 hover:text-primary-400 transition-colors">Careers</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-display font-bold text-lg mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                                <a href="mailto:info@timekids.com" className="text-gray-300 hover:text-primary-400 transition-colors">
                                    info@timekids.com
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Phone className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                                <a href="tel:+911234567890" className="text-gray-300 hover:text-primary-400 transition-colors">
                                    +91 123 456 7890
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">
                                    Hyderabad, India
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media & QR Codes */}
                    <div>
                        <h3 className="font-display font-bold text-lg mb-4">Connect With Us</h3>
                        <div className="flex space-x-4 mb-6">
                            <a
                                href="https://www.facebook.com/pages/TIME-Kids/187099544682886"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.instagram.com/timekidspreschools"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.youtube.com/@t.i.m.e.kidspreschoolstkps9493"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/10 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-gray-400">Scan to connect:</p>
                            <div className="flex space-x-2">
                                <div className="transform scale-50 origin-top-left">
                                    <QRCode value="https://www.timekidspreschools.in" size={100} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        © {currentYear} T.I.M.E. Kids Preschools. All rights reserved.
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                        A proud initiative of T.I.M.E. Group
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

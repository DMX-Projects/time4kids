'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, User, Building2 } from 'lucide-react';
import Button from '@/components/ui/Button';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isParentLoginOpen, setIsParentLoginOpen] = useState(false);
    const [isFranchiseLoginOpen, setIsFranchiseLoginOpen] = useState(false);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'About Us', href: '/about' },
        { name: 'Programs', href: '/programs' },
        { name: 'Admission', href: '/admission' },
        { name: 'Locate Centre', href: '/locate-centre' },
        { name: 'Franchise', href: '/franchise' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                            TK
                        </div>
                        <div className="hidden md:block">
                            <div className="font-display font-bold text-xl gradient-text">T.I.M.E. Kids</div>
                            <div className="text-xs text-gray-600">The Preschool That Cares</div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors rounded-lg hover:bg-primary-50"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Login Buttons */}
                    <div className="hidden lg:flex items-center space-x-3">
                        {/* Parent Login Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsParentLoginOpen(!isParentLoginOpen)}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors rounded-lg hover:bg-primary-50"
                            >
                                <User className="w-4 h-4" />
                                <span>Parents</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {isParentLoginOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 animate-slide-down">
                                    <Link
                                        href="/login/parents"
                                        className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                                        onClick={() => setIsParentLoginOpen(false)}
                                    >
                                        Login
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Franchise Login Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsFranchiseLoginOpen(!isFranchiseLoginOpen)}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors rounded-lg hover:bg-primary-50"
                            >
                                <Building2 className="w-4 h-4" />
                                <span>Franchise</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {isFranchiseLoginOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 animate-slide-down">
                                    <Link
                                        href="/login/franchise"
                                        className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                                        onClick={() => setIsFranchiseLoginOpen(false)}
                                    >
                                        Login
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Link href="/admission">
                            <Button size="sm">Enquire Now</Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-gray-200 animate-slide-down">
                        <nav className="flex flex-col space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                href="/login/parents"
                                className="px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg flex items-center space-x-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <User className="w-4 h-4" />
                                <span>Parent Login</span>
                            </Link>
                            <Link
                                href="/login/franchise"
                                className="px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg flex items-center space-x-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Building2 className="w-4 h-4" />
                                <span>Franchise Login</span>
                            </Link>
                            <div className="px-4 pt-2">
                                <Link href="/admission">
                                    <Button size="sm" className="w-full">Enquire Now</Button>
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;

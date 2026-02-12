'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Building2, BookOpen, Handshake, MapPin, Backpack, Camera, HelpCircle, Briefcase, Phone } from 'lucide-react';
import AnimatedNavBar from './AnimatedNavBar';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    useEffect(() => {
        // Use Lenis scroll event if available for better performance
        const lenis = (window as any).lenis;

        let rafId: number | null = null;
        const handleScroll = () => {
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    const scrollY = lenis ? lenis.scroll : window.scrollY;
                    setIsSticky(scrollY >= 35);
                    rafId = null;
                });
            }
        };

        if (lenis) {
            lenis.on('scroll', handleScroll);
            handleScroll(); // Initial call
        } else {
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll(); // Initial call
        }

        return () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
            if (lenis) {
                lenis.off('scroll', handleScroll);
            } else {
                window.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <>
            {/* HEADER TOP */}
            <div className="header-top">
                <div className="container mx-auto px-4">
                    <div className="header-top-content">
                        <p>T.I.M.E. Kids pre-schools is a chain of pre-schools launched by T.I.M.E.</p>
                        <ul className="header-top-nav">
                            <li><Link href="/"><Home className="inline-block w-5 h-5 mr-1" />HOME</Link></li>
                            <li><Link href="/careers"><Briefcase className="inline-block w-5 h-5 mr-1" />CAREERS</Link></li>
                            <li><Link href="/contact"><Phone className="inline-block w-5 h-5 mr-1" />CONTACT US</Link></li>
                            <li>

                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* HEADER */}
            <header className={`header ${isSticky ? 'header-sticky' : ''}`}>
                <div className="container-fluid mx-auto px-4 max-w-[1550px]">
                    <div className="header-inner">
                        {/* Logo - Left Side */}
                        {/* Logo - Left Side */}
                        <div className="logo flex-shrink-0">
                            <Link href="/">
                                <Image
                                    src="/time-kids-logo-new.png"
                                    alt="T.I.M.E. Kids Logo"
                                    width={200}
                                    height={80}
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Right Side - Navigation & Mobile Menu */}
                        <div className="flex items-center justify-end gap-4">
                            {/* Desktop Navigation */}
                            <div className="hidden lg:flex">
                                <AnimatedNavBar />
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                className="nav-button lg:hidden"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                <i className="fas fa-bars"></i>
                            </button>
                        </div>

                        {/* Mobile Navigation Drawer */}
                        {isMenuOpen && (
                            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-xl z-[2000] p-6 border-t border-gray-100 flex flex-col items-center gap-6 animate-in slide-in-from-top duration-300">
                                <AnimatedNavBar mobile={true} />
                                <Link href="/login" className="btn-login w-full text-center py-3">
                                    LOGIN
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <style jsx>{`
                /* HEADER TOP */
                .header-top {
                    background-image: linear-gradient(to right, #fd5e60, #f77542, #e78e29, #cfa51a, #b0b929, #89c249, #5dc86c, #00cc90, #00c5b4, #00bbcf, #00afde, #19a0df);
                }

                .header-top-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: relative;
                    z-index: 999;
                }

                .header-top p {
                    margin: 0;
                    padding: 0;
                    color: #fff;
                    line-height: 28px;
                    font-size: 13px;
                }

                .header-top-nav {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    line-height: 28px;
                }

                .header-top-nav li {
                    display: inline-block;
                    padding-left: 15px;
                    position: relative;
                }

                .header-top-nav li::before {
                    content: '|';
                    color: #fff;
                    padding-right: 15px;
                }

                .header-top-nav li:first-child::before {
                    display: none;
                }

                .header-top-nav li :global(a) {
                    color: #fff;
                    text-decoration: none;
                    transition: all 0.5s ease;
                }

                .header-top-nav li :global(a:hover) {
                    color: #fee52c;
                }

                .header-top-nav li span {
                    font-weight: 700;
                }

                .header-top-nav li span i {
                    font-size: 22px;
                    margin-right: 10px;
                }

                .header {
                    /* background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1); */
                    padding: 5px 0;
                    position: fixed;
                    width: 100%;
                    top: 28px; /* Offset for header-top */
                    z-index: 1001;
                    transition: all 0.4s ease;
                }

                .header-sticky {
                    top: 0;
                    /* background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(25px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); */
                }



                @keyframes smoothScroll {
                    0% {
                        transform: translateY(-40px);
                    }
                    100% {
                        transform: translateY(0px);
                    }
                }

                .header-inner {
                    position: relative;
                    min-height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 40px;
                }

                /* Logo - Left aligned */
                .logo {
                    position: relative;
                    display: inline-block;
                    z-index: 999;
                }

                .logo :global(a) {
                    display: block;
                }

                /* Mobile Menu Button */
                .nav-button {
                    background: rgba(228, 110, 26, 0.9);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    width: 45px;
                    height: 45px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-size: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .nav-button:hover {
                    background: rgba(209, 95, 20, 0.95);
                    transform: scale(1.05);
                    box-shadow: 0 4px 15px rgba(228, 110, 26, 0.4);
                }

                /* Standard Navigation Fallback (if needed) */
                .nav-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    gap: 10px;
                }

                .nav-list-right {
                    margin-left: auto;
                    margin-right: 20px;
                }

                .nav-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    position: relative;
                    z-index: 999;
                    line-height: 40px;
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .nav-list-right {
                    margin-left: auto;
                    margin-right: 20px;
                }

                .nav-item {
                    padding-right: 10px;
                    position: relative;
                }

                .nav-item :global(a) {
                    color: #333;
                    display: block;
                    padding: 0 8px;
                    border-radius: 0;
                    border-top-left-radius: 14px;
                    border-bottom-right-radius: 14px;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                .nav-item :global(a:hover),
                .nav-item.nav-active > :global(a) {
                    background: rgba(243, 196, 67, 0.9);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    color: #0d538e;
                    border: 1px solid rgba(243, 196, 67, 0.5);
                }

                /* Dropdown */
                .dropdown-menu {
                    position: absolute;
                    left: 0;
                    top: 42px;
                    display: none;
                    min-width: 200px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 5px;
                    overflow: hidden;
                    padding: 0;
                    list-style: none;
                    margin: 0;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    z-index: 9999;
                }

                .nav-submenu:hover .dropdown-menu,
                .nav-submenu.nav-active .dropdown-menu {
                    display: block;
                }

                .dropdown-menu li {
                    padding: 0;
                }

                .dropdown-menu li :global(a) {
                    background: none;
                    border-radius: 0;
                    font-size: 15px;
                    font-weight: 600;
                    text-transform: none;
                    padding: 8px 15px;
                    border: none;
                }

                .dropdown-menu li :global(a:hover) {
                    background: rgba(243, 196, 67, 0.3);
                    color: #0d538e;
                }

                /* LOGIN Button */
                .btn-login {
                    background: linear-gradient(135deg, rgba(255, 153, 51, 0.9) 0%, rgba(255, 102, 51, 0.9) 100%);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    color: #fff;
                    padding: 8px 24px;
                    border-radius: 20px;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 14px;
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                    box-shadow: 0 4px 15px rgba(255, 102, 51, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .btn-login:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 102, 51, 0.4);
                    background: linear-gradient(135deg, rgba(255, 153, 51, 1) 0%, rgba(255, 102, 51, 1) 100%);
                }

                /* Responsive Mobile */
                @media (max-width: 1023px) {
                    .header-inner {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px 0;
                    }

                    .logo {
                        width: 160px;
                    }

                    .header-top {
                        display: none;
                    }
                }

                @media (max-width: 768px) {
                    .logo {
                        width: 140px;
                    }
                }
            `}</style>
        </>
    );
}
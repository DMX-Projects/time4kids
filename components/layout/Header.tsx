'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
                            <li><Link href="/">HOME</Link></li>
                            <li><Link href="/careers">CAREERS</Link></li>
                            <li><Link href="/contact">CONTACT US</Link></li>
                            <li>

                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* HEADER */}
            <header className={`header ${isSticky ? 'header-sticky' : ''}`}>
                <div className="container mx-auto px-4">
                    <div className="header-inner">
                        {/* Logo - Centered with curves */}
                        <div className="logo">
                            <Link href="/">
                                <Image
                                    src="/logo.jpg"
                                    alt="T.I.M.E. Kids Logo"
                                    width={200}
                                    height={80}
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Navigation */}
                        <div className="header-nav">
                            {/* Mobile Menu Button */}
                            <button
                                className="nav-button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                <i className="fas fa-bars"></i>
                            </button>

                            {/* Main Navigation */}
                            <nav className={`main-nav ${isMenuOpen ? 'nav-open' : ''}`}>
                                <ul className="nav-list">
                                    <li
                                        className={`nav-item nav-submenu ${openDropdown === 'about' ? 'nav-active' : ''}`}
                                        onMouseEnter={() => setOpenDropdown('about')}
                                        onMouseLeave={() => setOpenDropdown(null)}
                                    >
                                        <Link href="/about">About Us</Link>
                                        <ul className="dropdown-menu">
                                            <li><Link href="/about/programme">Our Programme</Link></li>
                                            <li><Link href="/about/infrastructure">Our Infrastructure</Link></li>
                                            <li><Link href="/about/teachers">Our Teachers</Link></li>
                                            <li><Link href="/about/curriculum">Our Curriculum</Link></li>
                                            <li><Link href="/about/strengths">Our Strengths</Link></li>
                                            <li><Link href="/about/franchise-network">Franchise Network</Link></li>
                                            <li><Link href="/about/time">About T.I.M.E.</Link></li>
                                        </ul>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/programs">our Programs</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/franchise">Franchise Opportunity</Link>
                                    </li>
                                </ul>

                                <ul className="nav-list nav-list-right">
                                    <li className="nav-item">
                                        <Link href="/admission">Admissions</Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link href="/media">Media</Link>
                                    </li>


                                    <li className="nav-item">
                                        <Link href="/faq">Faq's</Link>
                                    </li>
                                    <li className="nav-item">
                                        {/* <Link href="/parents">Parent's Corner</Link> */}
                                    </li>
                                </ul>

                                <Link href="/login" className="btn-login">
                                    LOGIN
                                </Link>
                            </nav>
                        </div>
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

                /* HEADER */
                .header {
                    background-color: #fff;
                    padding: 10px 0;
                    position: relative;
                    z-index: 1001;
                    transition: all 0.4s ease;
                }

                .header-sticky {
                    position: fixed;
                    width: 100%;
                    top: 0;
                    animation: smoothScroll 1s forwards;
                    box-shadow: 0px -1px 15px rgb(32 43 42 / 40%);
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
                }

                /* Logo - Centered with curves */
                .logo {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 0;
                    width: 100%;
                    text-align: center;
                    z-index: 999;
                    pointer-events: none;
                }

                .logo::before,
                .logo::after {
                    content: '';
                    display: block;
                    width: 100%;
                    height: 70px;
                    margin: 0 auto;
                    position: absolute;
                    left: 0;
                    right: 0;
                    transition: 0.4s;
                    background-size: auto 70px;
                }

                .logo::before {
                    top: -40px;
                    background: url(/images/top-courve.png) no-repeat center top;
                }

                .logo::after {
                    bottom: -70px;
                    background: url(/images/bottom-courve.png) no-repeat center top;
                }

                .header-sticky .logo::before,
                .header-sticky .logo::after {
                    display: none;
                }

                .logo :global(a) {
                    position: relative;
                    z-index: 9999;
                    display: inline-block;
                    pointer-events: auto;
                }

                /* Navigation */
                .header-nav {
                    padding-top: 20px;
                    width: 100%;
                }

                .main-nav {
                    display: flex;
                    width: 100%;
                    align-items: center;
                    justify-content: space-between;
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
                    background: #fff;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                .nav-item :global(a:hover),
                .nav-item.nav-active > :global(a) {
                    background: #f3c443;
                    color: #0d538e;
                }

                /* Dropdown */
                .dropdown-menu {
                    position: absolute;
                    left: 0;
                    top: 42px;
                    display: none;
                    min-width: 200px;
                    background: #fff;
                    border-radius: 5px;
                    overflow: hidden;
                    padding: 0;
                    list-style: none;
                    margin: 0;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
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
                }

                .dropdown-menu li :global(a:hover) {
                    background: #f3c443;
                    color: #fff;
                }

                /* Mobile Menu Button */
                .nav-button {
                    display: none;
                    float: right;
                    background: #e46e1a;
                    width: 50px;
                    height: 50px;
                    border-radius: 100%;
                    text-align: center;
                    line-height: 50px;
                    margin: 5px 15px 0 0;
                    color: #fff;
                    font-size: 18px;
                    border: none;
                    cursor: pointer;
                    position: absolute;
                    right: 0;
                    top: 10px;
                    z-index: 999;
                }

                /* Responsive */
                @media (max-width: 998px) {
                    .header-top-content {
                        display: block;
                        text-align: center;
                    }

                    .header-top p {
                        line-height: 22px;
                        padding: 10px 0;
                    }

                    .header-top-nav {
                        width: 100%;
                        line-height: 30px;
                        justify-content: center;
                    }

                    .nav-button {
                        display: block;
                    }

                    .main-nav {
                        display: none;
                        margin-top: 20px;
                        flex-direction: column;
                    }

                    .main-nav.nav-open {
                        display: flex;
                    }

                    .nav-list {
                        display: block;
                        width: 100%;
                    }

                    .nav-item {
                        width: 100%;
                        margin-top: 1px;
                    }

                    .dropdown-menu {
                        position: relative;
                        top: 0;
                        border-radius: 0;
                        box-shadow: none;
                    }

                    .logo {
                        position: relative;
                        text-align: left;
                        width: 60%;
                    }

                    .logo::before,
                    .logo::after {
                        display: none;
                    }

                    .header-nav {
                        padding-top: 0;
                    }

                    .btn-login {
                        width: 100%;
                        margin-top: 10px;
                    }
                }

                @media (max-width: 768px) {
                    .header-top p {
                        font-size: 14px;
                    }

                    .header-top-nav {
                        font-size: 14px;
                    }
                }
            `}</style>
        </>
    );
}
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Phone, Menu, X } from 'lucide-react';
import AnimatedNavBar from './AnimatedNavBar';
import PublicPageBackLink, { shouldShowPublicBack } from './PublicPageBackLink';
import { useFooterContent } from '@/components/layout/FooterContentProvider';
import { SocialBrandLink } from '@/components/ui/SocialBrandIcons';

export default function Header() {
    const footer = useFooterContent();
    const pathname = usePathname();
    const [isSticky, setIsSticky] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const lenis = (window as unknown as { lenis?: { scroll: number; on: (e: string, fn: () => void) => void; off: (e: string, fn: () => void) => void } }).lenis;

        let rafId: number | null = null;
        const handleScroll = () => {
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    const scrollY = lenis ? lenis.scroll : window.scrollY;
                    setIsSticky(scrollY >= 40);
                    rafId = null;
                });
            }
        };

        if (lenis) {
            lenis.on('scroll', handleScroll);
            handleScroll();
        } else {
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();
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

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!mobileMenuOpen) return;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileMenuOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [mobileMenuOpen]);

    const showPublicBack = shouldShowPublicBack(pathname ?? '');

    return (
        <>
            {/* HEADER TOP */}
            <div className="header-top">
                <div className="container mx-auto px-4">
                    <div className="header-top-content">
                        <p>T.I.M.E. Kids pre-schools is a chain of pre-schools launched by T.I.M.E.</p>
                        <ul className="header-top-nav">
                            <li><Link href="/"><Home className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />HOME</Link></li>
                            <li><Link href="/careers"><Briefcase className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />CAREERS</Link></li>
                            <li className="header-top-contact-social">
                                <Link href="/contact"><Phone className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />CONTACT US</Link>
                                <span className="header-top-social-icons" aria-label="Social media">
                                    <SocialBrandLink platform="facebook" href={footer.social.facebook} size="sm" />
                                    <SocialBrandLink platform="instagram" href={footer.social.instagram} size="sm" />
                                    <SocialBrandLink platform="youtube" href={footer.social.youtube} size="sm" />
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* HEADER */}
            <header className={`header ${isSticky ? 'header-sticky' : ''}`}>
                <div className="container-fluid mx-auto px-4 max-w-[1550px]">
                    <div className="header-inner">
                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            {showPublicBack ? <PublicPageBackLink /> : null}
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
                        </div>

                        {/* Desktop: horizontal nav */}
                        <div className="ml-auto hidden min-w-0 shrink items-center pl-4 lg:flex">
                            <AnimatedNavBar />
                        </div>

                        {/* Mobile / tablet: hamburger + drawer (all links + login without horizontal scroll) */}
                        <div className="flex flex-shrink-0 items-center gap-2 lg:hidden">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(true)}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-95"
                                aria-expanded={mobileMenuOpen}
                                aria-controls="site-mobile-menu"
                                aria-label="Open menu"
                            >
                                <Menu className="h-6 w-6" strokeWidth={2.25} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>


            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div
                    id="site-mobile-menu"
                    className="fixed inset-0 z-[2500] lg:hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Site navigation"
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        aria-label="Close menu"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-0 flex h-full w-[min(100%,22rem)] flex-col border-l-4 border-l-orange-400 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-orange-50/40 px-4 py-3.5">
                            <span className="font-display text-base font-semibold tracking-tight text-slate-800">Menu</span>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" strokeWidth={2.25} />
                            </button>
                        </div>
                        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3">
                            <AnimatedNavBar mobile onLinkClick={() => setMobileMenuOpen(false)} />
                        </nav>
                    </div>
                </div>
            )}

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
                    padding: 8px 0;
                    min-height: 48px;
                }

                .header-top p {
                    margin: 0;
                    padding: 0;
                    color: #fff;
                    line-height: 1.4;
                    font-size: 15px;
                    font-weight: 500;
                }

                .header-top-nav {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0;
                    line-height: 1.4;
                    font-size: 14px;
                    font-weight: 700;
                }

                .header-top-nav li {
                    display: inline-flex;
                    align-items: center;
                    position: relative;
                }

                .header-top-nav li:not(:first-child) {
                    margin-left: 16px;
                    padding-left: 16px;
                    border-left: 1px solid rgba(255, 255, 255, 0.85);
                }

                .header-top-nav li::before {
                    display: none;
                }

                .header-top-contact-social {
                    display: inline-flex;
                    align-items: center;
                    gap: 14px;
                }

                .header-top-contact-social :global(a:first-of-type) {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    white-space: nowrap;
                    line-height: 1;
                }

                .header-top-nav li :global(a) {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    line-height: 1;
                    color: #fff;
                    text-decoration: none;
                    transition: all 0.5s ease;
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 0.02em;
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

                :global(.header-top-social-icons) {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    flex-shrink: 0;
                }

                .header {
                    background: #fff;
                    box-shadow: 0 2px 15px rgba(0,0,0,0.05);
                    border-bottom: 1px solid #eee;
                    padding: 8px 0;
                    position: fixed;
                    width: 100%;
                    top: 48px; /* Offset for header-top */
                    z-index: 1001;
                    transition: all 0.4s ease;
                }

                .header-sticky {
                    top: 0;
                    background: #fff;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    border-bottom: 1px solid #eee;
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
                    min-height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
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

                    .header {
                        top: 0;
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

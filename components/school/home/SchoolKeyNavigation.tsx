'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import VirtualTourModal from '@/components/home/VirtualTourModal';

export default function SchoolKeyNavigation() {
    const [virtualTourOpen, setVirtualTourOpen] = useState(false);

    return (
        <section className="key-nav-section relative z-10 bg-white">
            <div className="container mx-auto min-w-0 px-4">
                <p className="pt-6 text-center text-xs font-semibold tracking-wide text-slate-400 md:hidden">
                    Swipe sideways to see all shortcuts →
                </p>
                <div className="key-nav-scroll relative -mx-4 px-4 md:mx-0 md:px-0">
                    <div
                        className="pointer-events-none absolute right-0 top-8 bottom-4 z-10 w-14 bg-gradient-to-l from-white via-white/95 to-transparent md:hidden"
                        aria-hidden
                    />
                    <div
                        role="region"
                        aria-label="Quick links"
                        className="key-nav-track no-scrollbar overflow-x-auto overflow-y-visible overscroll-x-contain scroll-smooth touch-pan-x snap-x snap-mandatory scroll-px-4 pb-6 pt-4 md:overflow-visible md:snap-none md:pb-8 md:pt-10"
                    >
                        <ul className="key-nav key-nav--scroll-row">
                            <li className="nav-link3">
                                <figure>
                                    <span>
                                        <Image src="/icon-nearstcenter.png" alt="Find your Nearest Centre" width={38} height={38} className="key-nav-icon" />
                                    </span>
                                </figure>
                                <a href="/locate-centre">Find your Nearest Centre</a>
                            </li>
                            <li className="nav-link1">
                                <figure>
                                    <span>
                                        <Image src="/icon-franchise.png" alt="Become a Franchisee" width={38} height={38} className="key-nav-icon" />
                                    </span>
                                </figure>
                                <a href="/franchise">Become a Franchisee</a>
                            </li>
                            <li className="nav-link1">
                                <figure>
                                    <span>
                                        <Image src="/icon-tour.png" alt="Virtual Tour" width={38} height={38} className="key-nav-icon" />
                                    </span>
                                </figure>
                                <button
                                    type="button"
                                    className="virtual-tour-trigger"
                                    onClick={() => setVirtualTourOpen(true)}
                                >
                                    Virtual <br />
                                    Tour
                                </button>
                            </li>
                            <li className="nav-link2">
                                <figure>
                                    <span>
                                        <Image src="/icon-gallery.png" alt="Photo / Video Gallery" width={38} height={38} className="key-nav-icon" />
                                    </span>
                                </figure>
                                <a href="/gallery">Photo / Video Gallery</a>
                            </li>
                            <li className="nav-link2">
                                <figure>
                                    <span>
                                        <Image src="/icon-brochure.png" alt="Download Brochure" width={38} height={38} className="key-nav-icon" />
                                    </span>
                                </figure>
                                <a
                                    href="https://www.timekidspreschools.in/uploads/pc/TIME-Kids-Franchise%20Brochure.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Download Brochure
                                </a>
                            </li>
                            <li className="nav-link3">
                                <figure>
                                    <span>
                                        <Image src="/icon-media.svg" alt="Media" width={38} height={38} className="key-nav-icon" />
                                    </span>
                                </figure>
                                <a href="/gallery">Media</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <VirtualTourModal isOpen={virtualTourOpen} onClose={() => setVirtualTourOpen(false)} />

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .virtual-tour-trigger {
                    background: none;
                    border: none;
                    padding: 0;
                    font: inherit;
                    color: inherit;
                    cursor: pointer;
                    text-align: inherit;
                }
            `}</style>
        </section>
    );
}

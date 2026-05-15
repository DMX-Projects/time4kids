'use client';

import React, { useState } from 'react';
import Image from "next/image";
import VirtualTourModal from '@/components/home/VirtualTourModal';

export default function SchoolKeyNavigation() {
    const [virtualTourOpen, setVirtualTourOpen] = useState(false);

    return (
        <section className="key-nav-section">
            <div className="container mx-auto px-4">
                <ul className="key-nav">
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
                            Virtual <br />Tour
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
                    <li className="nav-link3">
                        <figure>
                            <span>
                                <Image src="/icon-nearstcenter.png" alt="Find your Nearest Centre" width={38} height={38} className="key-nav-icon" />
                            </span>
                        </figure>
                        <a href="/locate-centre">Find your Nearest  Centre</a>
                    </li>
                    <li className="nav-link1">
                        <figure>
                            <span>
                                <Image src="/icon-franchise.png" alt="Become a Franchise" width={38} height={38} className="key-nav-icon" />
                            </span>
                        </figure>
                        <a href="/franchise">Become a Franchise</a>
                    </li>
                    <li className="nav-link2">
                        <figure>
                            <span>
                                <Image src="/icon-brochure.png" alt="Download Brochure" width={38} height={38} className="key-nav-icon" />
                            </span>
                        </figure>
                        <a href="https://www.timekidspreschools.in/uploads/pc/TIME-Kids-Franchise%20Brochure.pdf" target="_blank" rel="noopener noreferrer">Download Brochure</a>
                    </li>
                    <li className="nav-link3">
                        <figure>
                            <span>
                                <Image src="/icon-television.png" alt="TV Commercial" width={38} height={38} className="key-nav-icon" />
                            </span>
                        </figure>
                        <a href="/tv-commercial">
                            TV<br />Commercial
                        </a>
                    </li>
                </ul>
            </div>

            <VirtualTourModal isOpen={virtualTourOpen} onClose={() => setVirtualTourOpen(false)} />

            <style jsx>{`
                .key-nav-section {
                    background: #fff;
                    width: 100%;
                    position: relative;
                    z-index: 10;
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

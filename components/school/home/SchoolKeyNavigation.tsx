'use client';

import React from 'react';
import Image from 'next/image';

export default function SchoolKeyNavigation() {
    return (
        <section className="key-nav-section">
            <div className="container mx-auto px-4">
                <ul className="key-nav">
                    <li className="nav-link1">
                        <figure>
                            <span>
                                <Image src="/icon-tour.png" alt="Virtual Tour" fill className="object-contain" />
                            </span>
                        </figure>
                        <a href="/media">
                            Virtual <br />Tour
                        </a>
                    </li>
                    <li className="nav-link2">
                        <figure>
                            <span>
                                <Image src="/icon-gallery.png" alt="Photo / Video Gallery" fill className="object-contain" />
                            </span>
                        </figure>
                        <a href="/media">Photo / Video Gallery</a>
                    </li>
                    <li className="nav-link3">
                        <figure>
                            <span>
                                <Image src="/icon-nearstcenter.png" alt="Find your Nearest Centre" fill className="object-contain" />
                            </span>
                        </figure>
                        <a href="/locate-centre">Find your Nearest  Centre</a>
                    </li>
                    <li className="nav-link1">
                        <figure>
                            <span>
                                <Image src="/icon-franchise.png" alt="Become a Franchise" fill className="object-contain" />
                            </span>
                        </figure>
                        <a href="/franchise">Become a Franchise</a>
                    </li>
                    <li className="nav-link2">
                        <figure>
                            <span>
                                <Image src="/icon-brochure.png" alt="Download Brochure" fill className="object-contain" />
                            </span>
                        </figure>
                        <a href="https://www.timekidspreschools.in/uploads/pc/TIME-Kids-Franchise%20Brochure.pdf" target="_blank" rel="noopener noreferrer">Download Brochure</a>
                    </li>
                    <li className="nav-link3">
                        <figure>
                            <span>
                                <Image src="/icon-television.png" alt="TV Commercial" fill className="object-contain" />
                            </span>
                        </figure>
                        <a href="/tv-commercial">
                            TV<br />Commercial
                        </a>
                    </li>
                </ul>
            </div>

            {/* Wave divider below icons */}


            <style jsx>{`
                .key-nav-section {
                    background: #fff;
                    width: 100%;
                    position: relative;
                    z-index: 10;
                }


            `}</style>
        </section>
    );
}

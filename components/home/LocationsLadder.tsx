'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { OUR_PRESENCE_CITY_TILES } from '@/config/our-presence-cities';

const slatColors = ['bg-[#38c1ed]', 'bg-[#dbbe3e]', 'bg-[#6cc3ba]'];

const LocationsLadder = () => {
    return (
        <section className="locations-ladder-section section-gap bg-gradient-to-b from-[#ffffff] to-[#dbf5ff]">
            <style jsx>{`
                .locations-ladder-section {
                    position: relative;
                    overflow: hidden;
                    padding: 0;
                    width: 100%;
                }
            `}</style>

            <div className="container relative z-10 mx-auto w-full max-w-[1600px] px-4">
                <div className="mx-auto mb-10 max-w-4xl text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-5 py-2.5 shadow-[0_16px_45px_rgba(14,165,233,0.12)] backdrop-blur-xl">
                        <Sparkles size={16} className="text-orange-500" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">Centres Near You</span>
                    </div>
                    <h2
                        className="font-display text-4xl font-black leading-tight tracking-[-0.02em] text-[#253247] md:text-6xl"
                        style={{
                            fontFamily:
                                "'Clash Display', 'Satoshi', 'Plus Jakarta Sans', var(--font-poppins), system-ui, sans-serif",
                        }}
                    >
                        Our{' '}
                        <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                            Presence
                        </span>
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                        Tap a <strong className="font-semibold text-slate-800">city</strong> to see centres there, then open a
                        preschool&apos;s page.
                    </p>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                        Same city footprint as the classic T.I.M.E. Kids site. If a city has no centres yet, we will show an
                        enquiry option on the next page.
                    </p>
                    <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-[#fed509] shadow-sm" />
                </div>

                <div
                    role="navigation"
                    aria-label="T.I.M.E. Kids cities"
                    className="mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-2 pb-6 sm:gap-2.5 md:gap-3 md:pb-10"
                >
                    {OUR_PRESENCE_CITY_TILES.map((city, idx) => {
                        const colorClass = slatColors[idx % slatColors.length];
                        const href = `/locations/${encodeURIComponent(city.hrefCity)}/`;
                        return (
                            <Link
                                key={city.hrefCity}
                                href={href}
                                className={`${colorClass} inline-flex max-w-full items-center rounded-full border border-white/60 px-3 py-2 shadow-[0_12px_28px_rgba(15,23,42,0.10)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98] sm:px-4 sm:py-2.5 md:px-5 md:py-3`}
                            >
                                <span className="block max-w-[14rem] text-center font-display text-xs font-black leading-tight text-slate-900 sm:text-sm md:max-w-[16rem]">
                                    {city.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default LocationsLadder;

'use client';

import React, { useEffect, useState } from 'react';
import FranchiseForm from '@/components/franchise/FranchiseForm';
import {
    FranchiseNarrativeLeftAside,
    FranchiseNarrativeMain,
    FranchiseQuickHighlightsSection,
} from '@/components/franchise/FranchiseNarrativePanel';
import TestimonialVideo from '@/components/shared/TestimonialVideo';
import Card from '@/components/ui/Card';
import AnimatedNumbers from '@/components/animations/AnimatedNumbers';
import TwinklingStars from '@/components/animations/TwinklingStars';
import { Download } from 'lucide-react';
import { apiUrl } from '@/lib/api-client';
import { findMarketingAsset, marketingAssetHref } from '@/lib/marketing-assets';
import { mediaUrl } from '@/lib/api-client';
import { DEFAULT_FRANCHISE_PAGE_DATA, mergeFranchisePageData, type FranchisePageData } from '@/config/franchise-page-defaults';

export default function FranchisePage() {
    const [pageData, setPageData] = useState<FranchisePageData>(DEFAULT_FRANCHISE_PAGE_DATA);
    const [assets, setAssets] = useState<any[]>([]);
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contentRes, assetsRes] = await Promise.all([
                    fetch(apiUrl('/common/page-content/franchise-opportunity/')),
                    fetch(apiUrl('/common/marketing-assets/'))
                ]);

                if (contentRes.ok) {
                    const data = await contentRes.json();
                    setPageData(mergeFranchisePageData(data));
                }

                if (assetsRes.ok) {
                    const assetsData = await assetsRes.json();
                    setAssets(assetsData);
                }
            } catch (err) {
                console.error("Failed to fetch franchise opportunity content", err);
            }
        };
        void fetchData();
    }, []);

    const franchiseBrochure = findMarketingAsset(assets, 'franchise-brochure');

    const hero = pageData?.hero || DEFAULT_FRANCHISE_PAGE_DATA.hero;
    const testimonials = pageData?.testimonials || DEFAULT_FRANCHISE_PAGE_DATA.testimonials;
    const mainBranch = pageData?.main_branch || DEFAULT_FRANCHISE_PAGE_DATA.main_branch;
    const brochure = pageData?.brochure || DEFAULT_FRANCHISE_PAGE_DATA.brochure;

    const brochureAssetSlug = (brochure?.marketing_asset_slug || 'franchise-brochure').trim();
    const brochureAsset = findMarketingAsset(assets, brochureAssetSlug);
    const brochureHref = marketingAssetHref(
        brochureAsset || franchiseBrochure,
        brochure?.fallback_url || mediaUrl('pc/franchise-brochure/franchise-brochure.pdf'),
    );
    const brochureLabel = brochureAsset?.title || brochure?.button_label || franchiseBrochure?.title || "Download Brochure (PDF)";

    return (
        <div className="min-h-screen">
            {/* Hero Section - Cloud Theme */}
            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 section-gap relative overflow-hidden pt-24 md:pt-32">
                {/* Kid-Friendly Animations - Business Dreams */}
                <AnimatedNumbers />

                <TwinklingStars count={15} />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-luckiest text-5xl md:text-6xl mb-6 text-[#003366] tracking-wider">
                            <span className="text-[#E67E22]">{hero.title_prefix}</span> {hero.title_accent}
                        </h1>
                    </div>
                </div>
            </section>

            {/* Franchise form + narrative: equal halves on large screens */}
            <section className="section-gap bg-white">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 xl:max-w-[90rem]">
                    <div className="grid items-start gap-8 md:gap-10 lg:grid-cols-2 lg:gap-10 xl:gap-12">
                        <div className="min-w-0 space-y-8 lg:space-y-10">
                            <FranchiseForm compact className="lg:sticky lg:top-24 xl:top-28" />
                            <FranchiseNarrativeLeftAside data={pageData} />
                        </div>
                        <div className="min-h-0 min-w-0">
                            <FranchiseNarrativeMain data={pageData} />
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-slate-200/80 bg-gradient-to-b from-slate-50 to-white py-12 md:py-16">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 xl:max-w-[90rem]">
                    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm md:p-10">
                        <FranchiseQuickHighlightsSection data={pageData} />
                    </div>
                </div>
            </section>

            <section className="section-gap bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-bubblegum text-4xl mb-4 text-[#003366] tracking-wide">
                            Franchisee <span className="text-[#ef5f5f]">Success Stories</span>
                        </h2>
                        <p className="text-lg text-gray-600">Hear from our successful franchise partners</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {testimonials.slice(0, 6).map((t: any, idx: number) => (
                            <TestimonialVideo
                                key={idx}
                                title={t.title}
                                author={t.author}
                                location={t.location}
                                videoUrl={(t.video_url || "").trim() || undefined}
                                thumbnailUrl={(t.thumbnail_url || "").trim() || undefined}
                                isPlaying={playingIndex === idx}
                                onPlay={() => setPlayingIndex(idx)}
                                onStop={() => setPlayingIndex(null)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Branch Location */}
            <section className="section-gap bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-bubblegum text-4xl mb-4 text-[#003366] tracking-wide">
                            {mainBranch.heading_prefix} <span className="text-[#E67E22]">{mainBranch.heading_accent}</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {mainBranch.subtitle}
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Map */}
                            <div className="rounded-3xl overflow-hidden shadow-xl h-[400px] md:h-[500px]">
                                <iframe
                                    src={mainBranch.map_embed_url}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="T.I.M.E. Kids Corporate Office Location"
                                ></iframe>
                            </div>

                            {/* Contact Details */}
                            <Card className="flex flex-col justify-center">
                                <h3 className="font-bubblegum text-2xl mb-6 text-gray-900 tracking-wide">
                                    {mainBranch.office_title}
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 mb-1">Address</p>
                                            <p
                                                className="text-gray-600 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: mainBranch.address_html }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 mb-1">Phone</p>
                                            <p className="text-gray-600">{mainBranch.phone}</p>
                                            <p className="text-sm text-gray-500 mt-1">Fax: {mainBranch.fax}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 mb-1">Email</p>
                                            <p className="text-gray-600">{mainBranch.email}</p>
                                            <p className="text-sm text-gray-500 mt-1">Franchise: {mainBranch.franchise_email}</p>
                                            <p className="text-sm text-gray-500">Cell: {mainBranch.cell}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <a
                                            href={mainBranch.directions_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                            <span>{mainBranch.directions_label}</span>
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Download Brochure */}
            <section className="section-gap bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <Download className="w-16 h-16 mx-auto mb-6" />
                        <h2 className="font-bubblegum text-4xl mb-6 tracking-wide">{brochure.heading}</h2>
                        <p className="text-xl text-white/90 mb-8">{brochure.subtitle}</p>
                        <a
                            href={brochureHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl"
                        >
                            {brochureLabel}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}

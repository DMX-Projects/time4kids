'use client';

import React, { useEffect, useState } from 'react';
import FranchiseForm from '@/components/franchise/FranchiseForm';
import {
    FranchiseNarrativeLeftAside,
    FranchiseNarrativeMain,
    FranchiseQuickHighlightsSection,
} from '@/components/franchise/FranchiseNarrativePanel';
import FranchiseSuccessStoriesSection from '@/components/franchise/FranchiseSuccessStoriesSection';
import FranchiseMainBranchContactCard from '@/components/franchise/FranchiseMainBranchContactCard';
import AnimatedNumbers from '@/components/animations/AnimatedNumbers';
import TwinklingStars from '@/components/animations/TwinklingStars';
import { Download } from 'lucide-react';
import { apiUrl } from '@/lib/api-client';
import { findMarketingAsset, marketingAssetHref } from '@/lib/marketing-assets';
import { mediaUrl } from '@/lib/api-client';
import { DEFAULT_FRANCHISE_PAGE_DATA, mergeFranchisePageData, type FranchisePageData } from '@/config/franchise-page-defaults';
import { FRANCHISE_BROCHURE_PDF_URL } from '@/config/site-public';

export default function FranchisePage() {
    const [pageData, setPageData] = useState<FranchisePageData>(DEFAULT_FRANCHISE_PAGE_DATA);
    const [assets, setAssets] = useState<any[]>([]);
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
        brochure?.fallback_url || mediaUrl('pc/franchise-brochure/franchise-brochure.pdf') || FRANCHISE_BROCHURE_PDF_URL,
    );
    const brochureLabel = brochureAsset?.title || brochure?.button_label || franchiseBrochure?.title || "Download Brochure (PDF)";

    return (
        <div className="min-h-screen">
            {/* Hero Section - Cloud Theme */}
            <section className="relative overflow-visible bg-gradient-to-br from-primary-50 to-secondary-50 pb-8 pt-[7.5rem] md:pb-12 md:pt-36">
                {/* Kid-Friendly Animations - Business Dreams */}
                <AnimatedNumbers />

                <TwinklingStars count={15} />

                <div className="container relative z-20 mx-auto px-4 sm:px-6">
                    <div className="mx-auto w-full max-w-4xl px-1 text-center">
                        <h1 className="font-luckiest mx-auto mb-6 flex w-full max-w-full flex-col items-center gap-0.5 text-[1.75rem] leading-tight tracking-normal text-[#003366] sm:block sm:max-w-3xl sm:text-4xl sm:leading-snug md:text-6xl md:leading-tight md:tracking-wider">
                            <span className="block text-[#E67E22] sm:inline">{hero.title_prefix}</span>
                            <span className="block sm:inline">{hero.title_accent}</span>
                        </h1>
                    </div>
                </div>
            </section>

            {/* Franchise form + narrative: equal halves on large screens */}
            <section className="section-gap bg-white">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 xl:max-w-[90rem]">
                    <div className="grid items-start gap-8 md:gap-10 lg:grid-cols-2 lg:gap-10 xl:gap-12">
                        <div className="min-w-0">
                            <FranchiseNarrativeMain data={pageData} />
                        </div>
                        <div className="min-h-0 min-w-0 space-y-8 lg:space-y-10">
                            <FranchiseForm compact className="lg:sticky lg:top-24 xl:top-28" />
                            <FranchiseNarrativeLeftAside data={pageData} />
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

            <FranchiseSuccessStoriesSection testimonials={testimonials} />

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

                    <div className="mx-auto max-w-6xl space-y-8">
                        <div className="grid items-stretch gap-8 md:grid-cols-2">
                            <FranchiseMainBranchContactCard branch={mainBranch} />
                            <FranchiseMainBranchContactCard
                                branch={mainBranch}
                                officeTitle={mainBranch.regional_office_title}
                                addressHtml={mainBranch.regional_address_html}
                                addressLabel="Connect with the Team In Your Region"
                                showAdmissionEmail={false}
                                showPhone={false}
                                isRegionalOffices
                            />
                        </div>

                        <div className="h-[400px] w-full overflow-hidden rounded-3xl shadow-xl md:h-[500px]">
                            <iframe
                                src={mainBranch.map_embed_url}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="T.I.M.E. Kids Corporate Office Location"
                            />
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

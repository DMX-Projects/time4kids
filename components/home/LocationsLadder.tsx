'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { apiUrl } from '@/lib/api-client';
import { matchesHyderabadMetroCity, OUR_PRESENCE_HYDERABAD_CENTRE_LIMIT } from '@/lib/site-location-presence';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const slatColors = [
    'bg-[#38c1ed]',
    'bg-[#dbbe3e]',
    'bg-[#6cc3ba]',
];

/** Active preschool row from /franchises/public/ */
export interface PresenceCentreItem {
    id: number;
    name: string;
    city: string;
    slug: string;
}

const QUERY_CITIES = ['Hyderabad', 'Secunderabad'] as const;

async function fetchHyderabadMetroCentres(): Promise<PresenceCentreItem[]> {
    const byId = new Map<number, PresenceCentreItem>();

    for (const qCity of QUERY_CITIES) {
        const res = await fetch(apiUrl(`/franchises/public/?city=${encodeURIComponent(qCity)}`));
        if (!res.ok) continue;
        const json = await res.json();
        const rows: any[] = Array.isArray(json) ? json : json.results || [];

        for (const row of rows) {
            if (!row?.id || !row.slug) continue;
            const city = String(row.city || qCity).trim();
            if (!matchesHyderabadMetroCity(city)) continue;
            byId.set(row.id, {
                id: row.id,
                name: String(row.name || 'T.I.M.E. Kids').trim(),
                city,
                slug: String(row.slug).trim(),
            });
        }
    }

    return Array.from(byId.values())
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
        .slice(0, OUR_PRESENCE_HYDERABAD_CENTRE_LIMIT);
}

const LocationsLadder = () => {
    const router = useRouter();
    const [centres, setCentres] = useState<PresenceCentreItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const list = await fetchHyderabadMetroCentres();
            setCentres(list);
        } catch (err) {
            console.error('Our Presence fetch failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to load centres');
            setCentres([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleSelect = (item: PresenceCentreItem) => {
        router.push(`/locations/${encodeURIComponent(item.city)}/${encodeURIComponent(item.slug)}`);
    };

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

            <div className="container mx-auto px-4 relative z-10 w-full max-w-[1600px]">
                <div className="mx-auto mb-12 max-w-4xl text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-5 py-2.5 shadow-[0_16px_45px_rgba(14,165,233,0.12)] backdrop-blur-xl">
                        <Sparkles size={16} className="text-orange-500" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">
                            Centres Near You
                        </span>
                    </div>
                    <h2
                        className="font-display text-4xl font-black leading-tight tracking-[-0.02em] text-[#253247] md:text-6xl"
                        style={{ fontFamily: "'Clash Display', 'Satoshi', 'Plus Jakarta Sans', var(--font-poppins), system-ui, sans-serif" }}
                    >
                        Our{' '}
                        <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                            Presence
                        </span>
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                        T.I.M.E. Kids preschools in{' '}
                        <strong className="font-semibold text-slate-800">Hyderabad</strong> and{' '}
                        <strong className="font-semibold text-slate-800">Secunderabad</strong>. Tap a centre to open its page.
                    </p>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
                        Showing up to {OUR_PRESENCE_HYDERABAD_CENTRE_LIMIT} centres from active franchise listings in these cities.
                    </p>
                    <div className="h-1.5 w-24 bg-[#fed509] mx-auto mt-4 rounded-full shadow-sm"></div>
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        <p className="mt-4 text-base text-slate-600">Loading Hyderabad centres…</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="text-center py-12">
                        <p className="mb-2 text-base text-red-600">⚠️ {error}</p>
                        <p className="text-sm text-slate-600">Could not load centres. Try again later.</p>
                    </div>
                )}

                {!loading && centres.length === 0 && !error && (
                    <div className="mx-auto max-w-lg py-12 text-center text-slate-600">
                        <p className="text-base leading-8 md:text-lg">
                            No active preschools found in Hyderabad or Secunderabad. Add franchises with city set to Hyderabad or Secunderabad (Admin).
                        </p>
                    </div>
                )}

                {!loading && centres.length > 0 && (
                    <div className="w-full min-w-0">
                        <div
                            role="list"
                            aria-label="Hyderabad and Secunderabad centres"
                            className="flex w-full min-w-0 flex-nowrap items-center justify-start gap-2 overflow-x-auto overflow-y-visible overscroll-x-contain scroll-px-3 pb-3 pt-1 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:thin] sm:gap-2.5 sm:scroll-px-4 md:gap-3 md:pb-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sky-300/80 [&::-webkit-scrollbar-track]:bg-sky-100/50"
                        >
                            {centres.map((data, idx) => {
                                const colorClass = slatColors[idx % slatColors.length];
                                return (
                                    <button
                                        key={data.id}
                                        type="button"
                                        role="listitem"
                                        onClick={() => handleSelect(data)}
                                        className={`${colorClass} shrink-0 rounded-full border border-white/60 px-3 py-2 shadow-[0_12px_28px_rgba(15,23,42,0.10)] backdrop-blur-sm transition-all duration-200 hover:brightness-105 hover:-translate-y-0.5 active:scale-95 group sm:px-4 sm:py-2.5 md:px-5 md:py-3`}
                                    >
                                        <span className="block max-w-[10.5rem] truncate font-display text-xs font-black leading-tight text-slate-900 transition-colors group-hover:text-white sm:max-w-[12rem] sm:text-sm md:max-w-[14rem]">
                                            {data.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default LocationsLadder;

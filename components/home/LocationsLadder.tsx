'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { apiUrl } from '@/lib/api-client';
import { matchesHyderabadMetroCity, OUR_PRESENCE_HYDERABAD_CENTRE_LIMIT } from '@/lib/site-location-presence';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const slatColors = [
    'bg-purple-300',
    'bg-yellow-200',
    'bg-red-300',
    'bg-green-300',
    'bg-pink-300',
    'bg-blue-300',
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

interface LadderColumnProps {
    items: PresenceCentreItem[];
    columnIndex: number;
    onSelect: (item: PresenceCentreItem) => void;
}

const LadderColumn = ({ items, columnIndex, onSelect }: LadderColumnProps) => {
    return (
        <div className="relative mx-auto w-full max-w-[280px] pt-8 pb-8">
            <div className="absolute top-0 bottom-0 left-[10%] w-3 bg-[#D2691E] rounded-full shadow-inner border-l border-[#8B4513]"></div>
            <div className="absolute top-0 bottom-0 right-[10%] w-3 bg-[#D2691E] rounded-full shadow-inner border-r border-[#8B4513]"></div>

            <div className="relative z-10 flex flex-col gap-5 items-center">
                {items.map((data, idx) => {
                    const colorClass = slatColors[(idx + columnIndex * 3) % slatColors.length];

                    return (
                        <button
                            key={data.id}
                            type="button"
                            onClick={() => onSelect(data)}
                            className={`${colorClass} w-full py-2 px-3 rounded-full shadow-lg transform transition-all duration-200 
                            border-b-4 border-black/10 cursor-pointer flex items-center gap-3 text-left
                            hover:brightness-105 hover:scale-105 active:scale-95 group`}
                        >
                            <div className="shrink-0 transition-transform group-hover:scale-110 bg-white/40 rounded-full w-10 h-10 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-gray-900" aria-hidden />
                            </div>
                            <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center">
                                <span className="font-display truncate text-sm font-black leading-tight text-slate-900 transition-colors group-hover:text-[#D2691E]">
                                    {data.name}
                                </span>
                                <span className="truncate text-[11px] font-semibold leading-snug text-slate-600">
                                    {data.city}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

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

    const columnsCount = 5;
    const itemsPerColumn = Math.ceil(Math.max(centres.length, 1) / columnsCount);
    const columns = Array.from({ length: columnsCount }, (_, i) =>
        centres.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn)
    );

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
                    float: left;
                    width: 100%;
                    clear: both;
                }
            `}</style>

            <div className="container mx-auto px-4 relative z-10 w-full max-w-[1600px]">
                <div className="text-center mb-12">
                    <h2 className="font-display text-4xl font-black leading-tight tracking-[-0.02em] text-slate-800 md:text-6xl">
                        Our Presence
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-4 justify-items-center">
                        {columns.map((colItems, idx) => (
                            <LadderColumn
                                key={idx}
                                items={colItems}
                                columnIndex={idx}
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default LocationsLadder;

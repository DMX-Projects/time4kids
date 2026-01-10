'use client';

import React from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cityLandmarks, CityData, LandmarkIcon } from './CityLandmarks';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const slatColors = [
    'bg-purple-300',
    'bg-yellow-200',
    'bg-red-300',
    'bg-green-300',
    'bg-pink-300',
    'bg-blue-300'
];

interface LadderColumnProps {
    items: CityData[];
    columnIndex: number;
    onCityClick: (city: string) => void;
}

const LadderColumn = ({ items, columnIndex, onCityClick }: LadderColumnProps) => {
    return (
        <div className="relative mx-auto w-full max-w-[280px] pt-8 pb-8">
            {/* Vertical Rails */}
            <div className="absolute top-0 bottom-0 left-[10%] w-3 bg-[#D2691E] rounded-full shadow-inner border-l border-[#8B4513]"></div>
            <div className="absolute top-0 bottom-0 right-[10%] w-3 bg-[#D2691E] rounded-full shadow-inner border-r border-[#8B4513]"></div>

            {/* Slats */}
            <div className="relative z-10 flex flex-col gap-5 items-center">
                {items.map((data, idx) => {
                    // Determine color cyclically based on global index or local index
                    const colorClass = slatColors[(idx + columnIndex * 3) % slatColors.length];

                    return (
                        <button
                            key={data.name}
                            onClick={() => onCityClick(data.name)}
                            className={`${colorClass} w-full py-2 px-3 rounded-full shadow-lg transform transition-all duration-200 
                            border-b-4 border-black/10 cursor-pointer flex items-center gap-3 text-left
                            hover:brightness-105 hover:scale-105 active:scale-95 group`}
                        >
                            <div className="shrink-0 transition-transform group-hover:scale-110 bg-white/40 rounded-full w-10 h-10 flex items-center justify-center">
                                <LandmarkIcon type={data.type} className="w-6 h-6 text-black" />
                            </div>
                            <div className="flex flex-col min-w-0 justify-center h-full">
                                <span className="text-sm font-bold text-gray-900 leading-tight truncate w-full group-hover:text-[#D2691E] transition-colors">
                                    {data.name}
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

    // Sort cities alphabetically
    const sortedCities = [...cityLandmarks].sort((a, b) => a.name.localeCompare(b.name));

    // Split cities into 5 columns
    const columnsCount = 5;
    const itemsPerColumn = Math.ceil(sortedCities.length / columnsCount);

    // Create chunks dynamically
    const columns = Array.from({ length: columnsCount }, (_, i) =>
        sortedCities.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn)
    );

    const handleCityClick = (city: string) => {
        router.push(`/locations/${encodeURIComponent(city)}`);
    };

    return (
        <section className="locations-ladder-section">
            <style jsx>{`
                .locations-ladder-section {
                    position: relative;
                    overflow: hidden;
                    padding: 40px 0;
                    float: left;
                    width: 100%;
                    clear: both;
                }
            `}</style>
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/bg-footer.jpg"
                    alt="Locations Background"
                    fill
                    className="object-cover object-center"
                    priority={false}
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 w-full max-w-[1600px]">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bubblegum text-[#085390] mb-4 tracking-wide drop-shadow-sm">
                        Our Presence
                    </h2>
                    <p className="text-xl text-gray-700 font-baloo font-medium max-w-2xl mx-auto">
                        Spreading happiness across India. Find your nearest T.I.M.E. Kids preschool!
                    </p>
                    <div className="h-1.5 w-24 bg-[#fed509] mx-auto mt-4 rounded-full shadow-sm"></div>
                </div>

                {/* Responsive Grid for Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-4 justify-items-center">
                    {columns.map((colItems, idx) => (
                        <LadderColumn
                            key={idx}
                            items={colItems}
                            columnIndex={idx}
                            onCityClick={handleCityClick}
                        />
                    ))}
                </div>
            </div>

            <style jsx>{`
                :global(.font-bubblegum) {
                    font-family: var(--font-bubblegum);
                }
                :global(.font-baloo) {
                    font-family: var(--font-baloo);
                }
            `}</style>
        </section>
    );
};

export default LocationsLadder;
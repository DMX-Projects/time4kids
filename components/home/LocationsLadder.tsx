'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const cities = [
    "Alleppey", "Arcot", "Barasat", "Belgaum", "Bengaluru (Bangalore)",
    "Bhadohi", "Bhadrak", "Bhubaneswar", "Chennai", "Chengalpattu",
    "Coimbatore", "Ernakulam", "Hooghly", "Hosur", "Howrah",
    "Hyderabad", "Idukki", "Jamnagar", "Kanchipuram", "Kasargod",
    "Keeranur", "Kolkata", "Kollam", "Kottayam", "Kozhikode",
    "Lucknow", "Malappuram", "Mumbai", "Namakkal", "Nizamabad",
    "Palakkad", "Paramakudi", "Pathanamthitta", "Patna", "Pudukkottai",
    "Pune", "Rajapalayam", "Ramanathapuram", "Rangareddy District",
    "Ranipet District", "Ratlam", "Salem", "Sethumadai", "Sivagangai",
    "Thiruninravur", "Thiruthangal", "Thrissur", "Trichy", "Trivandrum",
    "Vallioor", "Vellore", "Visakhapatnam", "Walajabad", "Wanaparthy",
    "Zirakpur"
];

const slatColors = [
    'bg-purple-300',
    'bg-yellow-200 text-black',
    'bg-red-300',
    'bg-green-300',
    'bg-pink-300',
    'bg-blue-300'
];

interface LadderColumnProps {
    items: string[];
    columnIndex: number;
    onCityClick: (city: string) => void;
}

const LadderColumn = ({ items, columnIndex, onCityClick }: LadderColumnProps) => {
    return (
        <div className="relative mx-auto w-full max-w-xs pt-8 pb-8">
            {/* Vertical Rails */}
            <div className="absolute top-0 bottom-0 left-[15%] w-4 bg-[#D2691E] rounded-full shadow-inner border-l border-[#8B4513]"></div>
            <div className="absolute top-0 bottom-0 right-[15%] w-4 bg-[#D2691E] rounded-full shadow-inner border-r border-[#8B4513]"></div>

            {/* Slats */}
            <div className="relative z-10 flex flex-col gap-4 items-center">
                {items.map((city, idx) => {
                    // Determine color cyclically based on global index or local index
                    const colorClass = slatColors[(idx + columnIndex * 3) % slatColors.length];

                    return (
                        <button
                            key={idx}
                            onClick={() => onCityClick(city)}
                            className={`${colorClass} w-full py-3 px-6 rounded-full shadow-lg transform transition-all duration-200 text-center font-bold text-lg 
                            ${colorClass.includes('text-black') ? 'text-black' : 'text-black'} 
                            border-b-4 border-black/20 cursor-pointer block 
                            hover:brightness-110 hover:scale-105 active:scale-95`}
                        >
                            {city}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const LocationsLadder = () => {
    const router = useRouter();

    // Split cities into 5 columns
    const columnsCount = 5;
    const itemsPerColumn = Math.ceil(cities.length / columnsCount);

    // Create chunks dynamically
    const columns = Array.from({ length: columnsCount }, (_, i) =>
        cities.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn)
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
                />
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-bubblegum text-[#085390] mb-6 tracking-wide drop-shadow-md">
                        Our Presence
                    </h2>
                    <p className="text-2xl text-gray-800 font-baloo font-semibold max-w-2xl mx-auto">
                        Spreading happiness in {cities.length}+ locations across India.
                        Find a T.I.M.E. Kids preschool near you!
                    </p>
                    <div className="h-1.5 w-32 bg-[#fed509] mx-auto mt-6 rounded-full shadow-sm"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-12 gap-x-8">
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

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from 'next/navigation';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const cities = [
    "Bengaluru (Bangalore)", "Belgaum", "Barasat", "Arcot", "Alleppey",
    "Chennai", "Chengalpattu", "Bhubaneswar", "Bhadrak", "Bhadohi",
    "Hosur", "Hooghly", "Ernakulam", "Coimbatore",
    "Kanchipuram", "Jamnagar", "Idukki", "Hyderabad", "Howrah",
    "Kozhikode", "Kottayam", "Kollam", "Kolkata", "Keeranur", "Kasargod",
    "Mumbai", "Malappuram", "Lucknow",
    "Namakkal", "Nizamabad", "Palakkad", "Paramakudi", "Pathanamthitta",
    "Patna", "Pudukkottai", "Pune", "Rajapalayam", "Ramanathapuram",
    "Rangareddy District", "Ranipet District", "Ratlam", "Salem", "Sethumadai",
    "Sivagangai", "Thiruninravur", "Thiruthangal", "Thrissur",
    "Trichy", "Trivandrum", "Vallioor", "Vellore", "Visakhapatnam",
    "Walajabad", "Wanaparthy", "Zirakpur"
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
        <section className="pb-10 bg-[#F0F8FF] relative overflow-hidden min-h-screen">
            {/* Top Banner GIF */}
            {/* Top Banner GIF */}
            <div className="w-full mb-6">
                <img
                    src="/about2.gif"
                    alt="About T.I.M.E. Kids"
                    className="w-full h-[300px] md:h-[500px] object-cover object-bottom"
                />
            </div>

            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-[#003366] mb-4">Our Presence</h2>
                    <p className="text-xl text-gray-700 font-baloo">Spreading happiness in {cities.length}+ locations across India</p>
                    <p className="text-sm text-gray-500 mt-2">Click on a city to view our centres</p>
                </div>

                {/* About GIF is above */}

                {/* Selected City Results Section - REMOVED (Navigates to new page now) */}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 md:gap-8 justify-center mb-8">
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
        </section>
    );
};

export default LocationsLadder;

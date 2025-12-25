'use client';

import React from 'react';

const TeachingTools = () => {
    const tools = [
        {
            bgColor: 'bg-[#f39c12]', // Orange
            title: 'Heading one',
            text: 'At Time Kids, children under the age group of 2 to 5 years learn through live examples, virtually. This is enchanting indeed! Traveling to places sitting in a classroom is possible with the VR head gears. The 3D viewing experience & the practicality associated to theoretical places make concepts easy to understand.'
        },
        {
            bgColor: 'bg-[#8dc53e]', // Green
            title: 'Heading one',
            text: 'At Time Kids, children under the age group of 2 to 5 years learn through live examples, virtually. This is enchanting indeed! Traveling to places sitting in a classroom is possible with the VR head gears. The 3D viewing experience & the practicality associated to theoretical places make concepts easy to understand.'
        },
        {
            bgColor: 'bg-[#e74c3c]', // Red
            title: 'Heading one',
            text: 'At Time Kids, children under the age group of 2 to 5 years learn through live examples, virtually. This is enchanting indeed! Traveling to places sitting in a classroom is possible with the VR head gears. The 3D viewing experience & the practicality associated to theoretical places make concepts easy to understand.'
        },
        {
            bgColor: 'bg-[#2980b9]', // Blue
            title: 'Heading one',
            text: 'At Time Kids, children under the age group of 2 to 5 years learn through live examples, virtually. This is enchanting indeed! Traveling to places sitting in a classroom is possible with the VR head gears. The 3D viewing experience & the practicality associated to theoretical places make concepts easy to understand.'
        }
    ];

    return (
        <section className="py-16 px-4 bg-[#fdfaf1]">
            <div className="container mx-auto max-w-7xl">
                <h2 className="text-3xl md:text-4xl font-bold font-fredoka text-[#e74c3c] text-center mb-12">
                    Teaching & Learning Tools
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tools.map((tool, index) => (
                        <div
                            key={index}
                            className={`${tool.bgColor} p-8 rounded-lg shadow-lg text-white text-center space-y-4 flex flex-col items-center transform hover:-translate-y-2 transition-transform duration-300`}
                        >
                            <h3 className="text-2xl font-bold font-fredoka uppercase tracking-wide border-b border-white/30 pb-2 w-full">
                                {tool.title}
                            </h3>
                            <p className="text-sm md:text-base leading-relaxed font-medium">
                                {tool.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TeachingTools;

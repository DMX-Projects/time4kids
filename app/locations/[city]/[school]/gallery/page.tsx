"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Search, Hand } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data
const YEARS = ['2023-24', '2022-23', '2021-22', '2020-21', '2019-20'];
const EVENTS = ['Annual Day', 'Sports Day', 'Green Color Day', 'Graduation Day', 'Festival Celebrations'];

const PHOTOS = [
    { id: 1, src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b', title: 'Classroom Fun' },
    { id: 2, src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7', title: 'Art & Craft' },
    { id: 3, src: 'https://images.unsplash.com/photo-1574515644163-f24e93094cba', title: 'Playtime' },
    { id: 4, src: 'https://images.unsplash.com/photo-1564424223910-401de909a27b', title: 'Group Activity' },
    { id: 5, src: 'https://images.unsplash.com/photo-1507537362145-590e38a59301', title: 'Learning Session' },
    { id: 6, src: 'https://images.unsplash.com/photo-1453749024858-4bca89bd9edc', title: 'Outdoor Games' },
    { id: 7, src: 'https://images.unsplash.com/photo-1544367563-12123d832d61', title: 'Story Time' },
    { id: 8, src: 'https://images.unsplash.com/photo-1510537253858-b755a1ad0e91', title: 'Science Experiments' },
    { id: 9, src: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902', title: 'Festival Decor' },
    { id: 10, src: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9', title: 'Morning Assembly' },
    { id: 11, src: 'https://images.unsplash.com/photo-1517415849887-2f3b3e34b5c7', title: 'Drawing Competition' },
    { id: 12, src: 'https://images.unsplash.com/photo-1596464716127-f9a1659249f5', title: 'Music Class' },
    { id: 13, src: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634', title: 'Face Painting' },
    { id: 14, src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9', title: 'Relay Race' },
    { id: 15, src: 'https://images.unsplash.com/photo-1704620067644-8898118002a2', title: 'School Trip' },
];

const VIDEOS = [
    { id: 1, thumbnail: 'https://images.unsplash.com/photo-1587588354456-ae376af71a25', title: 'Annual Day Celebrations 2020', duration: '5:20' },
    { id: 2, thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', title: 'Green Color Day Highlights', duration: '3:15' },
    { id: 3, thumbnail: 'https://images.unsplash.com/photo-1588072432836-e10032774350', title: 'Sports Day Finals', duration: '8:45' },
    { id: 4, thumbnail: 'https://images.unsplash.com/photo-1628258334105-2a0b3d6efee1', title: 'Christmas Celebration', duration: '4:10' },
];

export default function SchoolGalleryPage({ params }: { params: { school: string, city: string } }) {
    const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('videos'); // Default to videos as per image
    const [selectedYear, setSelectedYear] = useState('2019-20');
    const [selectedEvent, setSelectedEvent] = useState('Green Color Day');

    // Decode params for display
    const schoolName = decodeURIComponent(params.school || 'School Name');
    const cityName = decodeURIComponent(params.city || 'City');

    return (
        <div className="min-h-screen bg-[#fcf8e3]">
            {/* Gallery Header Section */}
            <div className="container mx-auto px-4 pt-12 pb-8">
                {/* Title */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <Hand className="w-8 h-8 text-yellow-500 rotate-12" fill="currentColor" />
                    <h1 className="text-2xl md:text-3xl font-fredoka font-bold text-[#ec2024] tracking-wide text-center">
                        <span className="text-[#ec2024]">T.I.M.E. Kids, </span>
                        <span className="text-[#00a651]">{schoolName}, </span>
                        <span className="text-[#0066cc]">{cityName}</span>
                    </h1>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto mb-6">
                    {/* Date/Year Select */}
                    <div className="relative w-full md:w-64">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                        >
                            <option value="">Choose Date</option>
                            {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>

                    {/* Event Select */}
                    <div className="relative w-full md:w-80">
                        <select
                            value={selectedEvent}
                            onChange={(e) => setSelectedEvent(e.target.value)}
                            className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                        >
                            {EVENTS.map(event => <option key={event} value={event}>{event} - {selectedYear.split('-')[0]}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>

                    {/* Search Button */}
                    <button className="w-full md:w-auto bg-[#00a651] hover:bg-green-600 text-white font-bold py-2.5 px-8 rounded shadow-sm transition-colors flex items-center justify-center gap-2">
                        Search
                    </button>
                </div>

                {/* Filter Result Text */}
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-fredoka font-bold">
                        <span className="text-[#ec2024]">{selectedYear}, </span>
                        <span className="text-[#00a651]">{selectedEvent}</span>
                    </h2>
                </div>

                {/* Main Content Area */}
                <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-orange-100 overflow-hidden min-h-[500px]">
                    {/* Tabs */}
                    <div className="flex w-full">
                        <button
                            onClick={() => setActiveTab('photos')}
                            className={`flex-1 py-3 text-center font-bold text-lg flex items-center justify-center gap-2 transition-colors ${activeTab === 'photos'
                                ? 'bg-[#999999] text-white'
                                : 'bg-[#cccccc] text-white hover:bg-gray-400'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Photos
                        </button>
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`flex-1 py-3 text-center font-bold text-lg flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'videos'
                                ? 'bg-[#ec2024] text-white'
                                : 'bg-[#ff6b6b] text-white hover:bg-red-400'
                                }`}
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Videos
                            {activeTab === 'videos' && (
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#ec2024] rotate-45"></div>
                            )}
                        </button>
                    </div>

                    {/* Grid Content */}
                    <div className="p-4 md:p-8 bg-[#fdfbf7]">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {activeTab === 'videos' ? (
                                // Video Grid
                                VIDEOS.map((video) => (
                                    <div key={video.id} className="group relative aspect-video bg-black rounded-lg overflow-hidden shadow-md border-4 border-white cursor-pointer hover:shadow-xl transition-shadow">
                                        <Image
                                            src={video.thumbnail}
                                            alt={video.title}
                                            fill
                                            className="object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-[#ec2024] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <Play className="w-8 h-8 text-white ml-1 fill-white" />
                                            </div>
                                        </div>
                                        {/* Title Badge */}
                                        <div className="absolute top-4 left-0 right-0 text-center">
                                            <span className="bg-[#0054a6] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                                Time Kids
                                            </span>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                            <p className="text-white font-fredoka font-bold text-lg text-center drop-shadow-md">
                                                {video.title}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // Photos Grid
                                PHOTOS.map((photo) => (
                                    <div key={photo.id} className="group relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden shadow-md border-4 border-white cursor-pointer">
                                        <Image
                                            src={photo.src}
                                            alt={photo.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                                            <span className="bg-white text-gray-800 px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                                                {photo.title}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

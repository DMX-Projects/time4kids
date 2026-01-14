"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Hand, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data - In a real app, this might come from props or API
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
];

const VIDEOS = [
    { id: 1, thumbnail: 'https://images.unsplash.com/photo-1587588354456-ae376af71a25', title: 'Annual Day Celebrations 2020', duration: '5:20' },
    { id: 2, thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', title: 'Green Color Day Highlights', duration: '3:15' },
    { id: 3, thumbnail: 'https://images.unsplash.com/photo-1588072432836-e10032774350', title: 'Sports Day Finals', duration: '8:45' },
];

export default function GallerySection({ schoolName, city }: { schoolName: string, city: string }) {
    const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('videos');
    const [selectedYear, setSelectedYear] = useState('2023-24');
    const [selectedEvent, setSelectedEvent] = useState('Annual Day');

    return (
        <section id="gallery" className="py-24 bg-white scroll-mt-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Hand className="w-8 h-8 text-yellow-400 -rotate-12 animate-wave" fill="currentColor" />
                        <span className="inline-block py-2 px-6 rounded-full bg-pink-50 text-pink-500 font-bold text-sm uppercase tracking-widest border border-pink-100">
                            Gallery
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-fredoka font-bold text-gray-900 mb-6">Life at T.I.M.E. Kids</h2>

                    {/* Filters Row */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto mb-10 mt-8">
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
                                {EVENTS.map(event => <option key={event} value={event}>{event}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>

                        <button className="w-full md:w-auto bg-[#00a651] hover:bg-green-600 text-white font-bold py-2.5 px-8 rounded shadow-sm transition-colors flex items-center justify-center gap-2">
                            Search
                        </button>
                    </div>

                    {/* Gallery Tabs */}
                    <div className="flex justify-center gap-4 mt-10">
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`px-10 py-4 rounded-full font-black text-lg transition-all shadow-lg hover:translate-y-[-2px] ${activeTab === 'videos' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-200' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                        >
                            <div className="flex items-center gap-3"><Play size={20} fill="currentColor" /> Videos</div>
                        </button>
                        <button
                            onClick={() => setActiveTab('photos')}
                            className={`px-10 py-4 rounded-full font-black text-lg transition-all shadow-lg hover:translate-y-[-2px] ${activeTab === 'photos' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-200' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                        >
                            <div className="flex items-center gap-3"><Image size={20} className="w-5 h-5" /> Photos</div>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {activeTab === 'videos' ? (
                        VIDEOS.map((video) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={video.id}
                                className="group relative aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-xl border-4 border-white hover:shadow-2xl transition-all cursor-pointer"
                            >
                                <Image src={video.thumbnail} alt={video.title} fill className="object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-500" unoptimized />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform duration-300 border border-white/50">
                                        <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                            <Play size={28} className="text-white ml-1 fill-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                    <h4 className="text-white font-black text-xl mb-1">{video.title}</h4>
                                    <span className="text-gray-300 font-medium text-sm flex items-center gap-2">
                                        <Clock size={14} /> {video.duration}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        PHOTOS.map((photo) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={photo.id}
                                className="group relative aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden shadow-xl border-4 border-white hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer"
                            >
                                <Image src={photo.src} alt={photo.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                    <span className="text-white font-bold text-lg bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">{photo.title}</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

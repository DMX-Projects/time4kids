'use client';

import React from 'react';
import Button from '@/components/ui/Button';

const AdmissionBar = () => {
    return (
        <div className="w-full bg-[#fffcf5] py-12 px-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl" />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Title Section */}
                <div className="text-center mb-8 space-y-3">
                    <div className="flex flex-wrap justify-center items-center gap-x-3 text-xl md:text-2xl font-bold font-fredoka uppercase tracking-wider">
                        <span className="text-[#ff6b6b]">Home Away</span>
                        <span className="text-gray-300 transform rotate-12">/</span>
                        <span className="text-[#4ecdc4]">From Home</span>
                        <span className="text-gray-300 transform -rotate-12">/</span>
                        <span className="text-[#45b7d1]">For Your Child</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-[#2d3436] font-fredoka drop-shadow-sm">
                        Admission Enquiry
                    </h3>
                    <div className="w-24 h-1 bg-orange-400 mx-auto rounded-full opacity-80" />
                </div>

                {/* Form Container */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-orange-100/50 border border-orange-50">
                    <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Child's Name"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 group-hover:bg-white"
                            />
                        </div>

                        <div className="relative group">
                            <select className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 text-gray-600 appearance-none group-hover:bg-white cursor-pointer">
                                <option value="" disabled selected>Select Class</option>
                                <option value="playgroup">Play Group</option>
                                <option value="nursery">Nursery</option>
                                <option value="pp1">PP-1</option>
                                <option value="pp2">PP-2</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                ▼
                            </div>
                        </div>

                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="City / Area"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 group-hover:bg-white"
                            />
                        </div>

                        <div className="relative group">
                            <input
                                type="tel"
                                placeholder="Parent's Mobile"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 group-hover:bg-white"
                            />
                        </div>

                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Parent's Email"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 group-hover:bg-white"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3.5 rounded-xl font-bold border-0 shadow-lg shadow-orange-200 transform transition-all duration-200 hover:-translate-y-0.5 active:scale-95 uppercase tracking-wider text-sm"
                        >
                            Enquire Now
                        </Button>
                    </form>
                </div>

                {/* Stats Footer */}
                <div className="mt-8 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-gray-600 font-medium text-sm md:text-base">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span>300+ Schools</span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-gray-300" />
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>72000+ Smart Students</span>
                    </div>
                    <div className="hidden md:block w-px h-4 bg-gray-300" />
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span>80+ Cities</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionBar;

'use client';

import React from 'react';
import Button from '@/components/ui/Button';

const AdmissionBar = () => {
    return (
        <div className="w-full bg-[#fdfaf1] py-10 px-4 rounded-3xl shadow-sm border border-orange-100/50">
            <div className="max-w-7xl mx-auto text-center space-y-6">
                {/* Colorful Title */}
                <div className="flex flex-wrap justify-center items-center gap-x-2 text-2xl md:text-3xl font-bold font-fredoka uppercase tracking-wider">
                    <span className="text-[#f44336]">Home Away</span>
                    <span className="text-[#4caf50]">Form Home</span>
                    <span className="text-[#2196f3]">For Your Child</span>
                </div>

                {/* Subtitle */}
                <h3 className="text-3xl md:text-4xl font-bold text-[#333333] font-fredoka">
                    Admission Enquiry
                </h3>

                {/* Horizontal Form */}
                <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100 max-w-6xl mx-auto">
                    <form className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-2 items-center">
                        <input
                            type="text"
                            placeholder="Name"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                        />
                        <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm text-gray-500">
                            <option value="">Admission for</option>
                            <option value="playgroup">Play Group</option>
                            <option value="nursery">Nursery</option>
                            <option value="pp1">PP-1</option>
                            <option value="pp2">PP-2</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Address"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                        />
                        <input
                            type="tel"
                            placeholder="Mobile"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                        />
                        <Button
                            type="submit"
                            className="w-full bg-[#00c853] hover:bg-[#00a344] text-white py-3 rounded-lg font-bold border-0 shadow-md uppercase tracking-widest text-sm"
                        >
                            Submit
                        </Button>
                    </form>
                </div>

                {/* Stats Footer */}
                <div className="pt-4 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-gray-700 font-bold text-base md:text-lg">
                    <span>300+ Schools</span>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <span>72000+ Smart Students</span>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <span>80+ Cities</span>
                </div>
            </div>
        </div>
    );
};

export default AdmissionBar;

'use client';

import React from 'react';

interface TestimonialVideoProps {
    videoUrl?: string;
    thumbnailUrl?: string;
    title: string;
    author: string;
    location?: string;
}

const TestimonialVideo: React.FC<TestimonialVideoProps> = ({
    videoUrl,
    thumbnailUrl,
    title,
    author,
    location,
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
            {/* Video/Thumbnail */}
            <div className="relative aspect-video bg-gray-200">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                                <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600">Video Testimonial</p>
                        </div>
                    </div>
                )}
                {videoUrl && (
                    <button className="absolute inset-0 flex items-center justify-center group">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                        </div>
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">{title}</h3>
                <p className="text-primary-600 font-medium">{author}</p>
                {location && <p className="text-gray-500 text-sm">{location}</p>}
            </div>
        </div>
    );
};

export default TestimonialVideo;

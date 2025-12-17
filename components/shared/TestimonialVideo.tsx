'use client';

import React, { useRef, useEffect } from 'react';

interface TestimonialVideoProps {
    videoUrl?: string;
    thumbnailUrl?: string;
    title: string;
    author: string;
    location?: string;
    isPlaying?: boolean;
    onPlay?: () => void;
}

const TestimonialVideo: React.FC<TestimonialVideoProps> = ({
    videoUrl,
    thumbnailUrl,
    title,
    author,
    location,
    isPlaying = false,
    onPlay,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Pause video when isPlaying becomes false
    useEffect(() => {
        if (!isPlaying && videoRef.current) {
            videoRef.current.pause();
        }
    }, [isPlaying]);

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
            {/* Video/Thumbnail */}
            <div className="relative aspect-video bg-gray-900 border-b border-gray-100">
                {isPlaying && videoUrl ? (
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        autoPlay
                    />
                ) : (
                    <>
                        {thumbnailUrl ? (
                            <img
                                src={thumbnailUrl}
                                alt={title}
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                <div className="text-center opacity-70">
                                    <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}
                        {videoUrl && (
                            <button
                                onClick={onPlay}
                                className="absolute inset-0 flex items-center justify-center group bg-black/20 hover:bg-black/10 transition-colors"
                            >
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                </div>
                            </button>
                        )}
                    </>
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

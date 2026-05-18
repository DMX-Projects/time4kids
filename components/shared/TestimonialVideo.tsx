'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getFranchiseVideoEmbedSrc } from '@/lib/franchise-embed-url';

interface TestimonialVideoProps {
    videoUrl?: string;
    videoUrls?: string[];
    thumbnailUrl?: string;
    title: string;
    author: string;
    location?: string;
    isPlaying?: boolean;
    onPlay?: () => void;
    onStop?: () => void;
}

const TestimonialVideo: React.FC<TestimonialVideoProps> = ({
    videoUrl,
    videoUrls,
    thumbnailUrl,
    title,
    author,
    location,
    isPlaying = false,
    onPlay,
    onStop,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const sources = useMemo(() => {
        const raw = videoUrls?.length ? videoUrls : videoUrl ? [videoUrl] : [];
        return raw.map((url) => url.trim()).filter(Boolean);
    }, [videoUrl, videoUrls]);

    const embedSources = useMemo(
        () =>
            sources
                .map((url) => ({ url, embed: getFranchiseVideoEmbedSrc(url) }))
                .filter((s): s is { url: string; embed: string } => Boolean(s.embed)),
        [sources],
    );

    const fileSources = useMemo(
        () => sources.filter((url) => !getFranchiseVideoEmbedSrc(url)),
        [sources],
    );

    const hasEmbeds = embedSources.length > 0;
    const activeEmbed = embedSources[activeIndex]?.embed ?? embedSources[0]?.embed ?? null;
    const activeFile = !hasEmbeds ? (fileSources[activeIndex] ?? fileSources[0] ?? null) : null;
    const canPlay = hasEmbeds || fileSources.length > 0;
    const slideCount = hasEmbeds ? embedSources.length : fileSources.length;

    useEffect(() => {
        if (!isPlaying) {
            setActiveIndex(0);
            videoRef.current?.pause();
        }
    }, [isPlaying]);

    const goPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (slideCount < 2) return;
        setActiveIndex((i) => (i - 1 + slideCount) % slideCount);
    };

    const goNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (slideCount < 2) return;
        setActiveIndex((i) => (i + 1) % slideCount);
    };

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow hover:shadow-2xl">
            <div className="relative aspect-video border-b border-gray-100 bg-gray-900">
                {isPlaying && activeEmbed ? (
                    <>
                        <iframe
                            key={activeEmbed}
                            src={activeEmbed}
                            title={`${title} — video ${activeIndex + 1}`}
                            className="absolute inset-0 h-full w-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                        {slideCount > 1 ? (
                            <>
                                <button
                                    type="button"
                                    onClick={goPrev}
                                    className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-md backdrop-blur-sm transition hover:bg-black/75"
                                    aria-label="Previous video"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={goNext}
                                    className="absolute right-10 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-md backdrop-blur-sm transition hover:bg-black/75"
                                    aria-label="Next video"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                                <div
                                    className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5"
                                    role="tablist"
                                >
                                    {embedSources.map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveIndex(idx);
                                            }}
                                            className={`h-2 w-2 rounded-full transition ${
                                                idx === activeIndex
                                                    ? 'bg-white'
                                                    : 'bg-white/45 hover:bg-white/70'
                                            }`}
                                            aria-label={`Show video ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : null}
                        {onStop ? (
                            <button
                                type="button"
                                onClick={onStop}
                                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-lg font-bold text-white shadow-md backdrop-blur-sm transition hover:bg-black/80"
                                aria-label="Close video"
                            >
                                ×
                            </button>
                        ) : null}
                    </>
                ) : isPlaying && activeFile ? (
                    <>
                        <video
                            key={activeFile}
                            ref={videoRef}
                            src={activeFile}
                            className="h-full w-full object-cover"
                            controls
                            autoPlay
                            playsInline
                        />
                        {onStop ? (
                            <button
                                type="button"
                                onClick={onStop}
                                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-lg font-bold text-white shadow-md backdrop-blur-sm transition hover:bg-black/80"
                                aria-label="Close video"
                            >
                                ×
                            </button>
                        ) : null}
                    </>
                ) : (
                    <>
                        {thumbnailUrl ? (
                            <Image
                                src={thumbnailUrl}
                                alt={title}
                                fill
                                className="object-cover opacity-90 transition-opacity"
                                unoptimized
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                                    <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                </div>
                            </div>
                        )}
                        {canPlay && onPlay ? (
                            <button
                                type="button"
                                onClick={onPlay}
                                className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/10"
                            >
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl transition-transform hover:scale-110">
                                    <svg
                                        className="ml-1 h-8 w-8 text-primary-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                </div>
                            </button>
                        ) : null}
                    </>
                )}
            </div>

            <div className="p-6">
                <h3 className="mb-2 font-display text-lg font-semibold text-gray-900">{title}</h3>
                <p className="font-medium text-primary-600">{author}</p>
                {location ? <p className="text-sm text-gray-500">{location}</p> : null}
            </div>
        </div>
    );
};

export default TestimonialVideo;

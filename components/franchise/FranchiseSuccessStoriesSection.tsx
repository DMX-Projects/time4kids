'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Film, Play } from 'lucide-react';
import type { FranchiseTestimonial } from '@/config/franchise-page-defaults';
import FranchiseBlobCarousel from '@/components/franchise/FranchiseBlobCarousel';
import SuccessStoriesVideoModal, {
    resolveSuccessStories,
    type ResolvedSuccessStory,
} from '@/components/franchise/SuccessStoriesVideoModal';

type Props = {
    testimonials: FranchiseTestimonial[];
};

function SuccessStoryRectCard({
    story,
    index,
    onPlay,
}: {
    story: ResolvedSuccessStory;
    index: number;
    onPlay: (index: number) => void;
}) {
    const canPlay = Boolean(story.embedSrc || story.fileSrc);
    const isEmbed = Boolean(story.embedSrc);
    const hasPoster = Boolean(story.posterSrc?.trim());

    return (
        <button
            type="button"
            onClick={() => onPlay(index)}
            disabled={!canPlay}
            className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={canPlay ? `Play ${story.title || `video ${index + 1}`}` : story.title || `Video ${index + 1}`}
        >
            {hasPoster ? (
                <Image
                    src={story.posterSrc}
                    alt={story.title || `Success story ${index + 1}`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    unoptimized
                />
            ) : isEmbed ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-white">
                    <Film className="h-10 w-10 opacity-90" />
                    <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
                        Iframe video
                    </span>
                </div>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
            )}
            <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/35" aria-hidden />
            {canPlay ? (
                <span
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    aria-hidden
                >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-orange-600 shadow-lg ring-2 ring-white/80 transition group-hover:scale-105 sm:h-[4.25rem] sm:w-[4.25rem]">
                        <Play className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={2} fill="currentColor" />
                    </span>
                </span>
            ) : null}
        </button>
    );
}

/** Franchise page: rectangular video carousel; tap opens full-screen modal player. */
export default function FranchiseSuccessStoriesSection({ testimonials }: Props) {
    const stories = useMemo(() => resolveSuccessStories(testimonials), [testimonials]);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [modalIndex, setModalIndex] = useState<number | null>(null);

    useEffect(() => {
        setCarouselIndex((i) => Math.min(Math.max(0, i), Math.max(0, stories.length - 1)));
    }, [stories.length]);

    const slideCount = stories.length;
    const openModal = (index: number) => {
        const story = stories[index];
        if (!story?.embedSrc && !story?.fileSrc) return;
        setCarouselIndex(index);
        setModalIndex(index);
    };

    return (
        <section className="section-gap bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h2 className="font-bubblegum mb-4 text-4xl tracking-wide text-[#003366]">
                        Franchisee <span className="text-[#ef5f5f]">Success Stories</span>
                    </h2>
                    <p className="text-lg text-gray-600">Hear from our successful franchise partners</p>
                </div>

                {slideCount > 0 ? (
                    <div className="mx-auto w-full max-w-3xl">
                        {slideCount === 1 ? (
                            <SuccessStoryRectCard story={stories[0]} index={0} onPlay={openModal} />
                        ) : (
                            <FranchiseBlobCarousel
                                slideCount={slideCount}
                                activeIndex={carouselIndex}
                                onPrev={() =>
                                    setCarouselIndex((idx) => (idx - 1 + slideCount) % slideCount)
                                }
                                onNext={() =>
                                    setCarouselIndex((idx) => (idx + 1) % slideCount)
                                }
                                onSelect={setCarouselIndex}
                                prevLabel="Previous success story"
                                nextLabel="Next success story"
                                dotsLabel="Success story videos"
                            >
                                {stories.map((story, i) => (
                                    <div key={`${story.title}-${i}`} className="w-full shrink-0 basis-full px-0.5">
                                        <SuccessStoryRectCard story={story} index={i} onPlay={openModal} />
                                    </div>
                                ))}
                            </FranchiseBlobCarousel>
                        )}
                    </div>
                ) : (
                    <p className="mx-auto max-w-lg text-center text-sm text-gray-500">
                        Upload videos in Admin → Franchise page content → Success stories, then click Save.
                    </p>
                )}
            </div>

            <SuccessStoriesVideoModal
                stories={stories}
                activeIndex={modalIndex}
                onClose={() => setModalIndex(null)}
                onIndexChange={(index) => {
                    setModalIndex(index);
                    setCarouselIndex(index);
                }}
            />
        </section>
    );
}

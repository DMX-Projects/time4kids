'use client';

import { useMemo, useState } from 'react';
import TestimonialVideo from '@/components/shared/TestimonialVideo';
import type { FranchiseTestimonial } from '@/config/franchise-page-defaults';
import SuccessStoriesVideoModal, { resolveSuccessStories } from '@/components/franchise/SuccessStoriesVideoModal';

type Props = {
    testimonials: FranchiseTestimonial[];
};

/** Franchise page shows one success-story card (upload thumbnail + video in Admin). */
export default function FranchiseSuccessStoriesSection({ testimonials }: Props) {
    const stories = useMemo(() => resolveSuccessStories(testimonials), [testimonials]);
    const story = stories[0] ?? null;
    const [modalOpen, setModalOpen] = useState(false);

    const canPlay = Boolean(story?.embedSrc || story?.fileSrc);

    return (
        <section className="section-gap bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h2 className="font-bubblegum mb-4 text-4xl tracking-wide text-[#003366]">
                        Franchisee <span className="text-[#ef5f5f]">Success Stories</span>
                    </h2>
                    <p className="text-lg text-gray-600">Hear from our successful franchise partners</p>
                </div>

                {story ? (
                    <div className="mx-auto max-w-md">
                        <TestimonialVideo
                            title={story.title || 'Success story'}
                            author={story.author || 'T.I.M.E. Kids'}
                            location={story.location || undefined}
                            videoUrl={story.video_url}
                            thumbnailUrl={story.posterSrc}
                            isPlaying={false}
                            onPlay={canPlay ? () => setModalOpen(true) : undefined}
                        />
                        {!canPlay ? (
                            <p className="mt-3 text-center text-xs text-gray-500">
                                Add a video URL in Admin → Franchise page content to enable playback.
                            </p>
                        ) : null}
                    </div>
                ) : (
                    <p className="mx-auto max-w-lg text-center text-sm text-gray-500">
                        Upload a thumbnail (and optional video) in Admin → Franchise page content → Success
                        story, then click Save.
                    </p>
                )}
            </div>

            <SuccessStoriesVideoModal
                stories={story ? [story] : []}
                activeIndex={modalOpen ? 0 : null}
                onClose={() => setModalOpen(false)}
                onIndexChange={() => {}}
            />
        </section>
    );
}

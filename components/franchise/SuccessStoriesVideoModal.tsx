'use client';

import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mediaUrl, resolveCmsMediaUrl, resolveHomeMediaAssetUrl } from '@/lib/api-client';
import { buildModalEmbedSrc, parseEmbedInput, resolveFranchiseEmbedSrc } from '@/lib/franchise-embed-url';
import type { FranchiseTestimonial } from '@/config/franchise-page-defaults';

export type ResolvedSuccessStory = FranchiseTestimonial & {
    embedSrc: string | null;
    fileSrc: string | null;
    posterSrc: string;
};

export function resolveSuccessStories(items: FranchiseTestimonial[]): ResolvedSuccessStory[] {
    return items
        .map((item) => {
            const raw = (item.video_url || '').trim();
            const embedSrc = resolveFranchiseEmbedSrc(parseEmbedInput(raw));
            const fileSrc = embedSrc ? null : raw ? mediaUrl(raw) || raw : null;
            const thumb = (item.thumbnail_url || '').trim();
            const posterSrc =
                resolveCmsMediaUrl(thumb) || resolveHomeMediaAssetUrl(thumb) || thumb || '';
            return { ...item, embedSrc, fileSrc, posterSrc };
        })
        .filter((s) => Boolean(s.embedSrc || s.fileSrc || s.posterSrc));
}

type Props = {
    stories: ResolvedSuccessStory[];
    activeIndex: number | null;
    onClose: () => void;
    onIndexChange: (index: number) => void;
};

export default function SuccessStoriesVideoModal({ stories, activeIndex, onClose, onIndexChange }: Props) {
    const isOpen = activeIndex !== null && stories.length > 0;
    const index = activeIndex ?? 0;
    const count = stories.length;
    const current = stories[index];
    const playable = Boolean(current?.embedSrc || current?.fileSrc);

    const goPrev = useCallback(() => {
        onIndexChange((index - 1 + count) % count);
    }, [count, index, onIndexChange]);

    const goNext = useCallback(() => {
        onIndexChange((index + 1) % count);
    }, [count, index, onIndexChange]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && count > 1) goPrev();
            if (e.key === 'ArrowRight' && count > 1) goNext();
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose, goPrev, goNext, count]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && current ? (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="success-story-modal-title"
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                        aria-label="Close success story"
                        onClick={onClose}
                    />

                    {count > 1 ? (
                        <>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goPrev();
                                }}
                                className="absolute left-2 top-1/2 z-[10001] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-white/95 text-slate-800 shadow-xl transition hover:scale-105 hover:bg-orange-50 sm:left-4 sm:h-14 sm:w-14 md:left-8"
                                aria-label="Previous story"
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goNext();
                                }}
                                className="absolute right-2 top-1/2 z-[10001] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-white/95 text-slate-800 shadow-xl transition hover:scale-105 hover:bg-orange-50 sm:right-4 sm:h-14 sm:w-14 md:right-8"
                                aria-label="Next story"
                            >
                                <ChevronRight className="h-8 w-8" />
                            </button>
                        </>
                    ) : null}

                    <motion.div
                        className="relative z-10 flex w-[min(92vw,56rem)] max-w-none flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-950 shadow-[0_32px_80px_rgba(15,23,42,0.45)]"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 12 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white text-slate-900 shadow-lg transition hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef5f5f]"
                            aria-label="Close video"
                        >
                            <X className="h-5 w-5" aria-hidden />
                        </button>

                        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-slate-900/95 px-5 py-4 pr-14">
                            <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef5f5f]">
                                    Franchisee success story
                                </p>
                                <h2
                                    id="success-story-modal-title"
                                    className="mt-0.5 truncate font-display text-lg font-black text-white sm:text-xl"
                                >
                                    {current.title || `Story ${index + 1}`}
                                </h2>
                                <p className="text-sm text-slate-400">
                                    {current.author}
                                    {count > 1 ? ` · ${index + 1} / ${count}` : ''}
                                </p>
                            </div>
                        </div>

                        <div className="relative aspect-video w-full bg-black">
                            {playable && current.embedSrc ? (
                                <iframe
                                    key={`${current.embedSrc}-${index}`}
                                    src={buildModalEmbedSrc(current.embedSrc)}
                                    title={current.title || `Success story ${index + 1}`}
                                    className="absolute inset-0 h-full w-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            ) : playable && current.fileSrc ? (
                                <video
                                    key={current.fileSrc}
                                    src={current.fileSrc}
                                    controls
                                    autoPlay
                                    playsInline
                                    className="absolute inset-0 h-full w-full object-contain"
                                />
                            ) : (
                                <div className="flex h-full min-h-[240px] items-center justify-center p-8 text-center text-slate-400">
                                    Video is not configured for this story.
                                </div>
                            )}

                        </div>

                        {count > 1 ? (
                            <div
                                className="flex shrink-0 justify-center gap-2 border-t border-white/10 bg-slate-900/90 px-4 py-4"
                                role="tablist"
                                aria-label="Success story slides"
                            >
                                {stories.map((story, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        role="tab"
                                        aria-selected={i === index}
                                        onClick={() => onIndexChange(i)}
                                        className={`h-2.5 rounded-full transition-all ${
                                            i === index ? 'w-8 bg-[#ef5f5f]' : 'w-2.5 bg-slate-500 hover:bg-slate-400'
                                        }`}
                                        aria-label={`View story ${i + 1}: ${story.title}`}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>,
        document.body,
    );
}

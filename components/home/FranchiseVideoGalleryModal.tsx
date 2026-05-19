import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mediaUrl, resolveCmsMediaUrl, resolveHomeMediaAssetUrl } from '@/lib/api-client';
import { useFranchiseVideoGallery } from '@/components/home/franchise-video-open-context';
import { buildModalEmbedSrc, getFranchiseVideoEmbedSrc } from '@/lib/franchise-embed-url';

export type FranchiseGalleryVideo = {
    poster?: string;
    src: string;
    alt?: string;
};

type ResolvedVideo = FranchiseGalleryVideo & {
    embedSrc: string | null;
    fileSrc: string | null;
    posterSrc: string;
};

const SWIPE_THRESHOLD_PX = 48;

function resolveVideos(videos: FranchiseGalleryVideo[]): ResolvedVideo[] {
    return videos.map((v) => {
        const sr = (v.src || '').trim();
        const embedSrc = getFranchiseVideoEmbedSrc(sr);
        const fileSrc = embedSrc ? null : sr ? mediaUrl(sr) || sr : null;
        const pr = (v.poster || '').trim();
        const posterSrc =
            resolveCmsMediaUrl(pr) || resolveHomeMediaAssetUrl(pr) || pr || '/icon-media.svg';
        return { ...v, embedSrc, fileSrc, posterSrc };
    });
}

type FranchiseVideoGalleryModalProps = {
    videos: FranchiseGalleryVideo[];
};

export default function FranchiseVideoGalleryModal({ videos }: FranchiseVideoGalleryModalProps) {
    const gallery = useFranchiseVideoGallery();
    const activeIndex = gallery?.activeIndex ?? null;
    const touchStart = useRef<{ x: number; y: number } | null>(null);

    const onClose = useCallback(() => {
        gallery?.closeGallery();
    }, [gallery]);

    const resolved = resolveVideos(videos);
    const isOpen = activeIndex !== null && resolved.length > 0;
    const index = activeIndex ?? 0;
    const count = resolved.length;
    const current = resolved[index];

    const goToIndex = useCallback(
        (next: number) => {
            if (!gallery || count <= 0) return;
            const wrapped = ((next % count) + count) % count;
            gallery.setGalleryIndex(wrapped);
        },
        [gallery, count],
    );

    const goPrev = useCallback(() => {
        goToIndex(index - 1);
    }, [goToIndex, index]);

    const goNext = useCallback(() => {
        goToIndex(index + 1);
    }, [goToIndex, index]);

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

    const onTouchStart = (e: React.TouchEvent) => {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (!touchStart.current || count <= 1) return;
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;
        touchStart.current = null;
        if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
        if (dx > 0) goPrev();
        else goNext();
    };

    if (!gallery || typeof document === 'undefined') return null;

    const playable = Boolean(current?.embedSrc || current?.fileSrc);

    const navButtonClass =
        'pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition active:scale-90 sm:h-12 sm:w-12';

    return createPortal(
        <AnimatePresence>
            {isOpen && current ? (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-stretch justify-center p-0 sm:items-center sm:p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Franchise video player"
                >
                    <button
                        type="button"
                        className="absolute inset-0 hidden bg-slate-900/80 backdrop-blur-sm sm:block"
                        aria-label="Close video"
                        onClick={onClose}
                    />

                    <motion.div
                        className="relative z-10 flex h-[100dvh] w-full max-w-none flex-col overflow-hidden rounded-none border-0 bg-slate-950 shadow-none sm:h-auto sm:max-h-[92vh] sm:w-[min(92vw,56rem)] sm:rounded-2xl sm:border sm:border-white/20 sm:shadow-[0_32px_80px_rgba(15,23,42,0.45)]"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition active:scale-95 sm:right-3 sm:top-3"
                            aria-label="Close video"
                        >
                            <X className="h-5 w-5" aria-hidden />
                        </button>

                        <div className="hidden shrink-0 items-center gap-3 border-b border-white/10 bg-slate-900/95 px-5 py-4 pr-14 sm:flex">
                            <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">
                                    Franchise video
                                </p>
                                <p className="mt-0.5 truncate font-display text-lg font-black text-white sm:text-xl">
                                    {current.alt || `Video ${index + 1}`}
                                </p>
                            </div>
                        </div>

                        <div className="relative min-h-0 flex-1 bg-black sm:aspect-video sm:flex-none">
                            {playable && current.embedSrc ? (
                                <iframe
                                    key={`${current.embedSrc}-${index}`}
                                    src={buildModalEmbedSrc(current.embedSrc)}
                                    title={current.alt || `Franchise video ${index + 1}`}
                                    className="pointer-events-auto absolute inset-0 z-0 h-full w-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            ) : playable && current.fileSrc ? (
                                <video
                                    key={`${current.fileSrc}-${index}`}
                                    src={current.fileSrc}
                                    controls
                                    autoPlay
                                    playsInline
                                    className="pointer-events-auto absolute inset-0 z-0 h-full w-full object-contain sm:object-contain"
                                />
                            ) : (
                                <div className="flex h-full min-h-[240px] items-center justify-center p-8 text-center text-slate-400">
                                    Video source is not configured for this slide.
                                </div>
                            )}

                            {!playable && current.posterSrc ? (
                                <img
                                    src={current.posterSrc}
                                    alt={current.alt || ''}
                                    className="absolute inset-0 z-0 h-full w-full object-cover object-center"
                                />
                            ) : null}

                            {count > 1 ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            goPrev();
                                        }}
                                        className={`absolute left-2 top-1/2 z-40 -translate-y-1/2 sm:left-3 ${navButtonClass}`}
                                        aria-label="Previous video"
                                    >
                                        <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            goNext();
                                        }}
                                        className={`absolute right-2 top-1/2 z-40 -translate-y-1/2 sm:right-3 ${navButtonClass}`}
                                        aria-label="Next video"
                                    >
                                        <ChevronRight className="h-6 w-6" strokeWidth={2.25} />
                                    </button>
                                </>
                            ) : null}
                        </div>

                        {count > 1 ? (
                            <div
                                className="flex shrink-0 justify-center gap-2 border-t border-white/10 bg-slate-900/90 px-4 py-3 sm:py-4"
                                role="tablist"
                                aria-label="Video slides"
                            >
                                {resolved.map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        role="tab"
                                        aria-selected={i === index}
                                        onClick={() => goToIndex(i)}
                                        className={`h-2 rounded-full transition-all ${
                                            i === index ? 'w-7 bg-orange-500' : 'w-2 bg-slate-500'
                                        }`}
                                        aria-label={`View video ${i + 1}`}
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

import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { resolveHomeMediaAssetUrl } from '@/lib/api-client';

export type FranchiseGalleryPhoto = { src: string; alt?: string };

type FranchisePhotoGalleryModalProps = {
    photos: FranchiseGalleryPhoto[];
    activeIndex: number | null;
    onClose: () => void;
    onIndexChange: (index: number) => void;
};

function resolvePhotoSrc(raw: string): string {
    const trimmed = raw.trim();
    return resolveHomeMediaAssetUrl(trimmed) || trimmed;
}

export default function FranchisePhotoGalleryModal({
    photos,
    activeIndex,
    onClose,
    onIndexChange,
}: FranchisePhotoGalleryModalProps) {
    const isOpen = activeIndex !== null && photos.length > 0;
    const index = activeIndex ?? 0;
    const count = photos.length;

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
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose, goPrev, goNext]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen ? (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Franchise photo gallery"
                >
                    <motion.button
                        type="button"
                        className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm"
                        aria-label="Close gallery"
                        onClick={onClose}
                    />

                    <motion.div
                        className="relative z-10 flex h-[min(92vh,880px)] w-[min(96vw,56rem)] max-w-none flex-col overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white via-[#fff8ec] to-orange-50/95 shadow-[0_32px_80px_rgba(15,23,42,0.35)]"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 12 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <motion.div className="flex shrink-0 items-center justify-between gap-3 border-b border-orange-100/80 bg-white/90 px-5 py-4 backdrop-blur-sm">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                                    Franchise gallery
                                </p>
                                <p className="mt-0.5 font-display text-xl font-black text-slate-900">
                                    {index + 1} <span className="text-slate-400">/</span> {count}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                                aria-label="Close gallery"
                            >
                                <X className="h-5 w-5" aria-hidden />
                                Close
                            </button>
                        </motion.div>

                        <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 py-4 sm:px-20 sm:py-6">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 32 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -32 }}
                                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                    className="relative h-full w-full min-h-[280px]"
                                >
                                    {/* Plain img — same as homepage blobs; avoids Next image URL issues on live */}
                                    <img
                                        src={resolvePhotoSrc(photos[index]?.src ?? '')}
                                        alt={photos[index]?.alt || `Franchise photo ${index + 1}`}
                                        className="absolute inset-0 h-full w-full object-contain object-center"
                                        decoding="async"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {count > 1 ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={goPrev}
                                        className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/95 text-slate-800 shadow-lg transition hover:bg-orange-50 sm:left-5 sm:h-14 sm:w-14"
                                        aria-label="Previous photo"
                                    >
                                        <ChevronLeft className="h-7 w-7" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={goNext}
                                        className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/95 text-slate-800 shadow-lg transition hover:bg-orange-50 sm:right-5 sm:h-14 sm:w-14"
                                        aria-label="Next photo"
                                    >
                                        <ChevronRight className="h-7 w-7" />
                                    </button>
                                </>
                            ) : null}
                        </div>

                        {count > 1 ? (
                            <div
                                className="flex shrink-0 justify-center gap-2 border-t border-orange-100/60 bg-white/60 px-4 py-4"
                                role="tablist"
                                aria-label="Gallery thumbnails"
                            >
                                {photos.map((photo, i) => (
                                    <button
                                        key={`${photo.src}-${i}`}
                                        type="button"
                                        role="tab"
                                        aria-selected={i === index}
                                        onClick={() => onIndexChange(i)}
                                        className={`h-2.5 rounded-full transition-all ${
                                            i === index ? 'w-8 bg-orange-500' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                                        }`}
                                        aria-label={`View photo ${i + 1}`}
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

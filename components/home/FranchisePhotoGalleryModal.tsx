import { useCallback, useEffect, useRef } from 'react';
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

const SWIPE_THRESHOLD_PX = 48;

export default function FranchisePhotoGalleryModal({
    photos,
    activeIndex,
    onClose,
    onIndexChange,
}: FranchisePhotoGalleryModalProps) {
    const isOpen = activeIndex !== null && photos.length > 0;
    const index = activeIndex ?? 0;
    const count = photos.length;
    const currentSrc = resolvePhotoSrc(photos[index]?.src ?? '');
    const currentAlt = photos[index]?.alt || `Franchise photo ${index + 1}`;
    const touchStart = useRef<{ x: number; y: number } | null>(null);

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

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen ? (
                <motion.div
                    className="fixed inset-0 z-[9999]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Franchise photo gallery"
                >
                    {/* Mobile: sharp full flyer + blurred same image fills empty areas (no black bars) */}
                    <motion.div
                        className="relative h-[100dvh] w-full overflow-hidden bg-[#fff8ec] sm:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.img
                                key={`bg-${index}`}
                                src={currentSrc}
                                alt=""
                                aria-hidden
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.22 }}
                                className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl"
                                decoding="async"
                                draggable={false}
                            />
                        </AnimatePresence>
                        <div className="pointer-events-none absolute inset-0 bg-white/25" aria-hidden />

                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/55 text-white shadow-lg backdrop-blur-md transition active:scale-95"
                            aria-label="Close gallery"
                        >
                            <X className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                        </button>

                        <div
                            className="no-scrollbar absolute inset-0 z-10 overflow-x-hidden overflow-y-auto overscroll-contain px-2 py-10"
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                        >
                            <div className="flex min-h-full w-full items-center justify-center">
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.img
                                        key={index}
                                        src={currentSrc}
                                        alt={currentAlt}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.22 }}
                                        className="relative z-10 mx-auto block h-[min(90dvh,calc(100vw-1rem))] w-auto max-w-[calc(100vw-1rem)] select-none object-contain object-center shadow-[0_8px_40px_rgba(15,23,42,0.2)]"
                                        decoding="async"
                                        draggable={false}
                                    />
                                </AnimatePresence>
                            </div>
                        </div>

                        {count > 1 ? (
                            <>
                                <button
                                    type="button"
                                    onClick={goPrev}
                                    className="absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-[0_4px_24px_rgba(15,23,42,0.18)] backdrop-blur-sm transition active:scale-90"
                                    aria-label="Previous photo"
                                >
                                    <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
                                </button>
                                <button
                                    type="button"
                                    onClick={goNext}
                                    className="absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-[0_4px_24px_rgba(15,23,42,0.18)] backdrop-blur-sm transition active:scale-90"
                                    aria-label="Next photo"
                                >
                                    <ChevronRight className="h-6 w-6" strokeWidth={2.25} />
                                </button>
                            </>
                        ) : null}
                    </motion.div>

                    {/* Desktop: card layout */}
                    <motion.div
                        className="hidden h-full w-full items-center justify-center p-6 sm:flex"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <button
                            type="button"
                            className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm"
                            aria-label="Close gallery"
                            onClick={onClose}
                        />

                        <motion.div
                            className="relative z-10 flex h-[min(96vh,960px)] w-[min(96vw,56rem)] max-w-none flex-col overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white via-[#fff8ec] to-orange-50/95 shadow-[0_32px_80px_rgba(15,23,42,0.35)]"
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: 12 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-orange-100/80 bg-white/90 px-5 py-4 backdrop-blur-sm">
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
                                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-700"
                                    aria-label="Close gallery"
                                >
                                    <X className="h-5 w-5" aria-hidden />
                                    Close
                                </button>
                            </div>

                            <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 py-3 md:px-20">
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.img
                                        key={index}
                                        src={currentSrc}
                                        alt={currentAlt}
                                        initial={{ opacity: 0, x: 24 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -24 }}
                                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                        className="mx-auto block h-[min(72vh,calc(96vw-6rem))] w-auto max-w-[calc(100%-2rem)] object-contain object-center"
                                        decoding="async"
                                    />
                                </AnimatePresence>

                                {count > 1 ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={goPrev}
                                            className="absolute left-5 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/95 text-slate-800 shadow-lg transition hover:bg-orange-50"
                                            aria-label="Previous photo"
                                        >
                                            <ChevronLeft className="h-7 w-7" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={goNext}
                                            className="absolute right-5 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/95 text-slate-800 shadow-lg transition hover:bg-orange-50"
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
                </motion.div>
            ) : null}
        </AnimatePresence>,
        document.body,
    );
}

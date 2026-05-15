'use client';

import { useCallback, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mediaUrl } from '@/lib/api-client';
import { FranchiseBlobShell } from '@/components/home/franchise-blob';
import { franchiseBlobThumbnailImageClass } from '@/components/home/FranchiseVideoBlob';

export type FranchiseGalleryPhoto = { src: string; alt?: string };

type FranchisePhotoGalleryModalProps = {
    photos: FranchiseGalleryPhoto[];
    activeIndex: number | null;
    onClose: () => void;
    onIndexChange: (index: number) => void;
};

function resolvePhotoSrc(raw: string): string {
    const trimmed = raw.trim();
    return mediaUrl(trimmed) || trimmed;
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

    return (
        <AnimatePresence>
            {isOpen ? (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Franchise photo gallery"
                >
                    <motion.button
                        type="button"
                        className="absolute inset-0 bg-slate-900/75 backdrop-blur-md"
                        aria-label="Close gallery"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    <motion.div
                        className="relative z-10 w-full max-w-2xl"
                        initial={{ opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <motion.div
                            className="overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white via-[#fff8ec] to-orange-50/90 shadow-[0_32px_80px_rgba(15,23,42,0.35)]"
                            layout
                        >
                            <motion.div
                                className="flex items-center justify-between border-b border-orange-100/80 bg-white/80 px-5 py-4 backdrop-blur-sm"
                                layout
                            >
                                <motion.div layout>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                                        Franchise gallery
                                    </p>
                                    <p className="mt-0.5 font-display text-lg font-black text-slate-900">
                                        {index + 1} <span className="text-slate-400">/</span> {count}
                                    </p>
                                </motion.div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-orange-100 hover:text-orange-700"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </motion.div>

                            <div className="relative px-4 py-8 sm:px-8 sm:py-10">
                                <div className="relative mx-auto max-w-md">
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 28 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -28 }}
                                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            <FranchiseBlobShell
                                                variant={index}
                                                className="relative isolate mx-auto aspect-square w-full max-w-[min(100%,18rem)] sm:max-w-[20rem]"
                                            >
                                                <span className="absolute inset-0 overflow-hidden bg-[#f3ebe0] [border-radius:inherit]">
                                                    <Image
                                                        src={resolvePhotoSrc(photos[index]?.src ?? '')}
                                                        alt={photos[index]?.alt || `Franchise photo ${index + 1}`}
                                                        fill
                                                        className={franchiseBlobThumbnailImageClass}
                                                        sizes="(max-width: 640px) 85vw, 400px"
                                                        unoptimized
                                                        priority
                                                    />
                                                </span>
                                            </FranchiseBlobShell>
                                        </motion.div>
                                    </AnimatePresence>

                                    {count > 1 ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={goPrev}
                                                className="absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/95 text-slate-800 shadow-lg transition hover:bg-orange-50 sm:-left-2"
                                                aria-label="Previous photo"
                                            >
                                                <ChevronLeft className="h-6 w-6" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={goNext}
                                                className="absolute right-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/95 text-slate-800 shadow-lg transition hover:bg-orange-50 sm:-right-2"
                                                aria-label="Next photo"
                                            >
                                                <ChevronRight className="h-6 w-6" />
                                            </button>
                                        </>
                                    ) : null}
                                </div>

                                {count > 1 ? (
                                    <motion.div
                                        className="mt-6 flex max-w-full flex-wrap justify-center gap-2 px-2"
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
                                                className={`h-2.5 shrink-0 rounded-full transition-all ${
                                                    i === index
                                                        ? 'w-8 bg-orange-500'
                                                        : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                                                }`}
                                                aria-label={`View photo ${i + 1}`}
                                            />
                                        ))}
                                    </motion.div>
                                ) : null}
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}

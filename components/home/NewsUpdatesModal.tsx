'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Newspaper, X } from 'lucide-react';
import type { NewsTickerItem } from '@/config/home-page-defaults';

type NewsUpdatesModalProps = {
    items: NewsTickerItem[];
    emptyMessage?: string;
    isOpen: boolean;
    onClose: () => void;
};

export default function NewsUpdatesModal({ items, emptyMessage, isOpen, onClose }: NewsUpdatesModalProps) {
    const lines = items.map((item) => item.text.trim()).filter(Boolean);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

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
                    aria-labelledby="news-updates-modal-title"
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm"
                        aria-label="Close news updates"
                        onClick={onClose}
                    />

                    <motion.div
                        className="relative z-10 flex max-h-[min(92vh,820px)] w-[min(96vw,42rem)] flex-col overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white via-[#fff8ec] to-sky-50/90 shadow-[0_32px_80px_rgba(15,23,42,0.35)]"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 12 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-orange-100/80 bg-white/95 px-5 py-4 backdrop-blur-sm">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                                    <Newspaper className="h-5 w-5" aria-hidden />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                                        Live updates
                                    </p>
                                    <h2
                                        id="news-updates-modal-title"
                                        className="font-display text-xl font-black text-slate-900 sm:text-2xl"
                                    >
                                        Latest News & Updates
                                    </h2>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" aria-hidden />
                                Close
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                            {lines.length === 0 ? (
                                <p className="text-base leading-relaxed text-slate-600">
                                    {(emptyMessage || 'News updates and announcements will appear here.').trim()}
                                </p>
                            ) : (
                                <ul className="space-y-4">
                                    {lines.map((text, i) => (
                                        <li
                                            key={i}
                                            className="rounded-xl border border-orange-100/90 bg-white/90 px-4 py-4 shadow-sm sm:px-5 sm:py-5"
                                        >
                                            {lines.length > 1 ? (
                                                <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                                                    Update {i + 1}
                                                </p>
                                            ) : null}
                                            <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-800">
                                                {text}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>,
        document.body,
    );
}

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { FranchiseBlobShell } from '@/components/home/franchise-blob';

export const FRANCHISE_ADVANTAGE_VIDEO_EMBED =
    'https://iframe.mediadelivery.net/embed/117208/9005f10d-a5c3-4cd7-831e-fac0c2b5334f?autoplay=true';

/** Bunny / mediadelivery iframe, YouTube, or null for direct MP4/file URLs. */
export function getFranchiseVideoEmbedSrc(raw: string): string | null {
    const u = raw.trim();
    if (!u) return null;
    if (/iframe\.mediadelivery\.net\/embed/i.test(u) || /player\.mediadelivery\.net\/embed/i.test(u)) {
        const base = u.replace(/player\.mediadelivery\.net/i, 'iframe.mediadelivery.net');
        const params = new URLSearchParams(base.includes('?') ? base.split('?')[1] : '');
        if (!params.has('autoplay')) params.set('autoplay', 'true');
        if (!params.has('preload')) params.set('preload', 'true');
        if (!params.has('responsive')) params.set('responsive', 'true');
        return `${base.split('?')[0]}?${params.toString()}`;
    }
    return getYoutubeEmbedSrc(u);
}

function getYoutubeEmbedSrc(raw: string): string | null {
    const u = raw.trim();
    if (!u) return null;
    try {
        const url = new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`);
        const h = url.hostname.replace(/^www\./i, '');
        if (h === 'youtu.be') {
            const id = url.pathname.replace(/^\//, '').split('/')[0];
            return id ? `https://www.youtube.com/embed/${id}` : null;
        }
        if (h.includes('youtube.com')) {
            const v = url.searchParams.get('v');
            if (v) return `https://www.youtube.com/embed/${v}`;
            const m = url.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/);
            if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;
        }
    } catch {
        /* ignore */
    }
    return null;
}

/** Promo posters & portraits — fit inside organic blob without harsh edge crop. */
export const franchiseBlobThumbnailImageClass =
    'object-contain object-center !left-1/2 !top-1/2 !h-[94%] !w-[94%] !max-w-none -translate-x-1/2 -translate-y-1/2';

const franchiseVideoPosterImageClass =
    'object-cover object-[50%_28%] !left-1/2 !top-1/2 !h-full !w-full !max-w-none -translate-x-1/2 -translate-y-1/2';

type FranchiseBlobThumbnailProps = {
    src: string;
    alt: string;
};

export function FranchiseBlobThumbnail({ src, alt }: FranchiseBlobThumbnailProps) {
    return (
        <span className="absolute inset-0 overflow-hidden bg-[#f3ebe0] [border-radius:inherit]">
            <Image
                src={src}
                alt={alt}
                fill
                className={franchiseBlobThumbnailImageClass}
                sizes="(max-width: 640px) 90vw, 360px"
                unoptimized={/^https?:\/\//i.test(src)}
            />
        </span>
    );
}

type FranchiseVideoBlobProps = {
    variant: number;
    surfaceSrc: string;
    surfaceAlt: string;
    embedSrc: string | null;
    fileSrc: string | null;
    isPlaying: boolean;
    onPlay: () => void;
    onStop: () => void;
    videoReady: boolean;
    /** Only the active carousel slide shows the play overlay (avoids double buttons). */
    showPlayOverlay?: boolean;
};

export default function FranchiseVideoBlob({
    variant,
    surfaceSrc,
    surfaceAlt,
    embedSrc,
    fileSrc,
    isPlaying,
    onPlay,
    onStop,
    videoReady,
    showPlayOverlay = true,
}: FranchiseVideoBlobProps) {
    return (
        <motion.div className="group relative mx-auto w-full max-w-[min(100%,20rem)] sm:max-w-[22rem] lg:max-w-[24rem]">
            <FranchiseBlobShell
                variant={variant}
                borderClassName="overflow-hidden border-[7px] border-white bg-slate-900 shadow-[0_24px_56px_rgba(15,23,42,0.16)] sm:border-[8px] lg:border-[9px]"
            >
                {isPlaying && embedSrc ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 overflow-hidden [border-radius:inherit]"
                    >
                        <iframe
                            src={embedSrc}
                            title={surfaceAlt}
                            className="absolute left-1/2 top-1/2 h-full min-h-full w-[178%] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </motion.div>
                ) : isPlaying && fileSrc ? (
                    <motion.div className="absolute inset-0 overflow-hidden [border-radius:inherit]">
                        <video
                            key={fileSrc}
                            src={fileSrc}
                            controls
                            autoPlay
                            playsInline
                            className="h-full w-full object-cover object-center"
                        />
                    </motion.div>
                ) : (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onPlay();
                        }}
                        disabled={!videoReady}
                        className="absolute inset-0 overflow-hidden text-left [border-radius:inherit] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8ec] disabled:pointer-events-none disabled:opacity-55"
                        aria-label={videoReady ? 'Play franchise video' : 'Video not configured yet'}
                    >
                        <span className="absolute inset-0 overflow-hidden bg-[#f3ebe0] [border-radius:inherit]">
                            <Image
                                src={surfaceSrc}
                                alt={surfaceAlt}
                                fill
                                className={franchiseVideoPosterImageClass}
                                sizes="(max-width: 640px) 90vw, 360px"
                                unoptimized={/^https?:\/\//i.test(surfaceSrc)}
                            />
                        </span>
                        {showPlayOverlay ? (
                            <span
                                className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30"
                                aria-hidden
                            >
                                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-orange-600 shadow-lg ring-2 ring-white/80 sm:h-[4.25rem] sm:w-[4.25rem]">
                                    <Play className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={2} fill="currentColor" />
                                </span>
                            </span>
                        ) : null}
                    </button>
                )}
                {isPlaying ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onStop();
                        }}
                        className="absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-base font-bold text-white shadow-md backdrop-blur-sm transition hover:bg-black/80"
                        aria-label="Close video"
                    >
                        ×
                    </button>
                ) : null}
            </FranchiseBlobShell>
        </motion.div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { resolveCmsMediaUrl, resolveHomeMediaAssetUrl } from '@/lib/api-client';
import { getFranchiseVideoEmbedSrc } from '@/lib/franchise-embed-url';
import { FranchiseBlobShell } from '@/components/home/franchise-blob';
import { useFranchiseVideoOpen } from '@/components/home/franchise-video-open-context';

export { getFranchiseVideoEmbedSrc } from '@/lib/franchise-embed-url';

export const FRANCHISE_ADVANTAGE_VIDEO_EMBED =
    'https://iframe.mediadelivery.net/embed/117208/9005f10d-a5c3-4cd7-831e-fac0c2b5334f?autoplay=true';

/** Promo posters & portraits — fit inside organic blob without harsh edge crop. */
export const franchiseBlobThumbnailImageClass =
    'object-contain object-center !left-1/2 !top-1/2 !h-[94%] !w-[94%] !max-w-none -translate-x-1/2 -translate-y-1/2';

const franchiseVideoPosterImageClass =
    'object-cover object-[50%_28%] !left-1/2 !top-1/2 !h-full !w-full !max-w-none -translate-x-1/2 -translate-y-1/2';

type FranchiseBlobThumbnailProps = {
    src: string;
    alt: string;
    fallbackSrc?: string;
};

function BlobFillImage({
    src,
    alt,
    className,
    fallbackSrc = '/icon-media.svg',
}: {
    src: string;
    alt: string;
    className: string;
    fallbackSrc?: string;
}) {
    const primary = resolveCmsMediaUrl(src) || resolveHomeMediaAssetUrl(src);
    const fallback = resolveCmsMediaUrl(fallbackSrc) || resolveHomeMediaAssetUrl(fallbackSrc);
    const [activeSrc, setActiveSrc] = useState(primary || fallback);

    useEffect(() => {
        setActiveSrc(primary || fallback);
    }, [primary, fallback]);

    if (!activeSrc) return null;

    return (
        <img
            src={activeSrc}
            alt={alt}
            className={`absolute inset-0 h-full w-full ${className}`}
            decoding="async"
            onError={() => {
                if (fallback && activeSrc !== fallback) setActiveSrc(fallback);
            }}
        />
    );
}

export function FranchiseBlobThumbnail({ src, alt, fallbackSrc }: FranchiseBlobThumbnailProps) {
    return (
        <span className="absolute inset-0 overflow-hidden bg-[#f3ebe0] [border-radius:inherit]">
            <BlobFillImage src={src} alt={alt} fallbackSrc={fallbackSrc} className={franchiseBlobThumbnailImageClass} />
        </span>
    );
}

type FranchiseVideoBlobProps = {
    variant: number;
    surfaceSrc: string;
    surfaceAlt: string;
    videoReady: boolean;
    videoIndex: number;
};

export function FranchiseVideoBlob({
    variant,
    surfaceSrc,
    surfaceAlt,
    videoReady,
    videoIndex,
}: FranchiseVideoBlobProps) {
    const videoOpen = useFranchiseVideoOpen();
    return (
        <div className="group relative mx-auto w-full max-w-[min(100%,20rem)] sm:max-w-[22rem] lg:max-w-[24rem]">
            <FranchiseBlobShell
                variant={variant}
                borderClassName="overflow-hidden border-[7px] border-white bg-slate-900 shadow-[0_24px_56px_rgba(15,23,42,0.16)] sm:border-[8px] lg:border-[9px]"
            >
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (videoReady) videoOpen?.openVideo(videoIndex);
                    }}
                    disabled={!videoReady}
                    className="absolute inset-0 overflow-hidden text-left [border-radius:inherit] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8ec] disabled:pointer-events-none disabled:opacity-55"
                    aria-label={videoReady ? 'Play franchise video in full screen' : 'Video not configured yet'}
                >
                    <span className="absolute inset-0 overflow-hidden bg-[#f3ebe0] [border-radius:inherit]">
                        <BlobFillImage src={surfaceSrc} alt={surfaceAlt} className={franchiseVideoPosterImageClass} />
                    </span>
                    <span
                        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30"
                        aria-hidden
                    >
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-orange-600 shadow-lg ring-2 ring-white/80 sm:h-[4.25rem] sm:w-[4.25rem]">
                            <Play className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={2} fill="currentColor" />
                        </span>
                    </span>
                </button>
            </FranchiseBlobShell>
        </div>
    );
}

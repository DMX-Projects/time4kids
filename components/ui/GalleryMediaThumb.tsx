"use client";

import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Play } from "lucide-react";
import { galleryMediaCandidates } from "@/lib/gallery-media-url";

type GalleryThumbItem = {
    file?: string;
    media_type: "image" | "video" | "embed";
};

const fillClass = (extra?: string) =>
    `absolute inset-0 h-full w-full object-cover${extra ? ` ${extra}` : ""}`;

function ThumbPlaceholder({ className = "" }: { className?: string }) {
    return (
        <div
            className={`absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300 ${className}`}
            aria-hidden
        >
            <ImageIcon className="h-10 w-10" />
        </div>
    );
}

/**
 * Gallery grid / album cover thumbnail.
 * Tries `/cms-media/`, `/api/cms-files/`, then `/media/` — eager load (no lazy + opacity trap).
 */
export function GalleryMediaThumb({
    item,
    alt,
    className = "",
    showVideoPlay = true,
}: {
    item: GalleryThumbItem;
    alt: string;
    className?: string;
    showVideoPlay?: boolean;
}) {
    const candidates = useMemo(() => galleryMediaCandidates(item.file), [item.file]);
    const [srcIndex, setSrcIndex] = useState(0);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setSrcIndex(0);
        setFailed(false);
    }, [item.file, item.media_type]);

    const src = candidates[srcIndex] || "";

    if (item.media_type === "embed") {
        return (
            <div className={`absolute inset-0 flex items-center justify-center bg-slate-800 text-white ${className}`}>
                <Play className="h-10 w-10 opacity-90" />
            </div>
        );
    }

    if (item.media_type === "video") {
        if (!src || failed) return <ThumbPlaceholder className={className} />;
        const videoSrc = src.includes("#") ? src : `${src}#t=0.5`;
        return (
            <>
                <video
                    src={videoSrc}
                    className={fillClass(className)}
                    muted
                    playsInline
                    preload="auto"
                    onError={() => {
                        if (srcIndex + 1 < candidates.length) {
                            setSrcIndex((i) => i + 1);
                            return;
                        }
                        setFailed(true);
                    }}
                />
                {showVideoPlay ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                            <Play className="h-5 w-5 translate-x-0.5 fill-current text-red-600" />
                        </div>
                    </div>
                ) : null}
            </>
        );
    }

    if (!src) return <ThumbPlaceholder className={className} />;

    if (failed) return <ThumbPlaceholder className={className} />;

    return (
        // eslint-disable-next-line @next/next/no-img-element -- Django gallery files; multi-URL fallback
        <img
            src={src}
            alt={alt}
            className={fillClass(className)}
            loading="eager"
            decoding="sync"
            onError={() => {
                if (srcIndex + 1 < candidates.length) {
                    setSrcIndex((i) => i + 1);
                    return;
                }
                setFailed(true);
            }}
        />
    );
}

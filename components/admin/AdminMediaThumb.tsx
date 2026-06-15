"use client";

import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { galleryMediaCandidates } from "@/lib/gallery-media-url";

type Props = {
    src?: string | null;
    alt: string;
    className?: string;
    /** Default `h-10 w-10` square chip beside upload fields. */
    size?: "sm" | "md" | "fill";
};

/**
 * Admin CMS thumbnail — tries `/api/cms-files/`, `/media/`, then `/cms-media/` (same as public gallery).
 */
export function AdminMediaThumb({ src, alt, className = "", size = "sm" }: Props) {
    const candidates = useMemo(() => galleryMediaCandidates(src), [src]);
    const [index, setIndex] = useState(0);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setIndex(0);
        setFailed(false);
    }, [src]);

    const url = candidates[index] || "";

    if (!url || failed) {
        if (size === "fill") {
            return (
                <div className={`flex items-center justify-center bg-slate-100 text-slate-300 ${className}`} aria-hidden>
                    <ImageIcon className="h-8 w-8" />
                </div>
            );
        }
        return (
            <div
                className={`rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 ${size === "md" ? "h-16 w-16" : "h-10 w-10"} ${className}`}
                aria-hidden
            >
                <ImageIcon className={size === "md" ? "h-6 w-6" : "h-4 w-4"} />
            </div>
        );
    }

    if (size === "fill") {
        return (
            // eslint-disable-next-line @next/next/no-img-element -- Django uploads; multi-URL fallback
            <img
                src={url}
                alt={alt}
                className={`absolute inset-0 h-full w-full ${className || "object-cover"}`}
                loading="eager"
                decoding="async"
                onError={() => {
                    if (index + 1 < candidates.length) setIndex((i) => i + 1);
                    else setFailed(true);
                }}
            />
        );
    }

    const box = size === "md" ? "h-16 w-16 rounded-xl" : "h-10 w-10 rounded-lg";

    return (
        <div className={`${box} border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0 ${className}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={url}
                alt={alt}
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
                onError={() => {
                    if (index + 1 < candidates.length) setIndex((i) => i + 1);
                    else setFailed(true);
                }}
            />
        </div>
    );
}

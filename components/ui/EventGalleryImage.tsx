"use client";

import { useEffect, useState } from "react";
import { nextImageSrc, publicStaticFallbackForMediaPath, resolveCentrePageImageSrc } from "@/lib/api-client";
import { buildEventMediaFileViewUrl, buildPublicEventMediaFileUrl } from "@/lib/event-media-url";

type EventGalleryImageProps = {
    file?: string | null;
    /** When set with `mediaId`, loads via Django stream API (works when `/cms-media` 404s). */
    centreSlug?: string;
    mediaId?: number;
    accessToken?: string | null;
    caption?: string;
    alt?: string;
    className?: string;
    /** When true, fills the parent (`position: relative` + defined height required). */
    fill?: boolean;
};

/**
 * Event / centre gallery photos from Django (`/cms-media/…`).
 * Uses a native `<img>` so we never hit `/_next/image` 400s or the default SVG placeholder.
 */
export function EventGalleryImage({
    file,
    centreSlug,
    mediaId,
    accessToken,
    caption,
    alt = "",
    className = "",
    fill,
}: EventGalleryImageProps) {
    const [src, setSrc] = useState("");
    const [fallbackSrc, setFallbackSrc] = useState("");
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const path = (file || "").trim();
        const slug = (centreSlug || "").trim();
        const token = (accessToken || "").trim();
        if (token && mediaId != null && Number.isFinite(mediaId)) {
            const signed = buildEventMediaFileViewUrl(token, mediaId, { caption: caption || "", filePath: path });
            if (signed) {
                setFailed(false);
                setSrc(signed);
                setFallbackSrc(publicStaticFallbackForMediaPath(path) || "");
                return;
            }
        }
        if (slug && mediaId != null && Number.isFinite(mediaId)) {
            setFailed(false);
            setSrc(buildPublicEventMediaFileUrl(slug, mediaId));
            setFallbackSrc(publicStaticFallbackForMediaPath(path) || "");
            return;
        }
        if (!path) {
            setSrc("");
            setFallbackSrc("");
            setFailed(true);
            return;
        }
        setFailed(false);
        const primary = nextImageSrc(path) || resolveCentrePageImageSrc(path);
        setSrc(primary);
        const staticFb = publicStaticFallbackForMediaPath(path);
        setFallbackSrc(staticFb && staticFb !== primary ? staticFb : "");
    }, [file, centreSlug, mediaId, accessToken, caption]);

    if (!src || failed) {
        return (
            <div
                className={fill ? `absolute inset-0 bg-gray-100 ${className}` : `bg-gray-100 ${className}`}
                aria-hidden
            />
        );
    }

    if (fill) {
        return (
            // eslint-disable-next-line @next/next/no-img-element -- Django media; avoid next/image optimizer
            <img
                src={src}
                alt={alt}
                className={`absolute inset-0 h-full w-full object-cover ${className}`}
                loading="lazy"
                decoding="async"
                onError={() => {
                    if (fallbackSrc) {
                        setSrc(fallbackSrc);
                        setFallbackSrc("");
                        return;
                    }
                    setFailed(true);
                }}
            />
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            className={className}
            loading="lazy"
            decoding="async"
            onError={() => {
                if (fallbackSrc) {
                    setSrc(fallbackSrc);
                    setFallbackSrc("");
                    return;
                }
                setFailed(true);
            }}
        />
    );
}

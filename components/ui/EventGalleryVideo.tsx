"use client";

import { useEffect, useState } from "react";
import { EventGalleryEmbed } from "@/components/ui/EventGalleryEmbed";
import { isFranchiseEmbedUrl } from "@/lib/franchise-embed-url";
import { resolveEventMediaPlaybackSources } from "@/lib/event-media-url";

type EventGalleryVideoProps = {
    filePath: string;
    mediaId?: number;
    centreSlug?: string;
    accessToken?: string | null;
    caption?: string;
    className?: string;
    controls?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
    playsInline?: boolean;
    preload?: "none" | "metadata" | "auto";
    "aria-label"?: string;
};

/**
 * Event gallery video — YouTube/Bunny iframe, direct MP4 URL, Django stream API,
 * then `/public` marketing files, then `/cms-media`.
 */
export function EventGalleryVideo({
    filePath,
    mediaId,
    centreSlug,
    accessToken,
    caption,
    className = "",
    controls = true,
    autoPlay,
    muted,
    playsInline = true,
    preload = "metadata",
    "aria-label": ariaLabel,
}: EventGalleryVideoProps) {
    const [sources, setSources] = useState<string[]>([]);
    const [index, setIndex] = useState(0);
    const [failed, setFailed] = useState(false);

    const embed = isFranchiseEmbedUrl(filePath);

    useEffect(() => {
        if (embed) return;
        const list = resolveEventMediaPlaybackSources({
            filePath,
            mediaId,
            centreSlug,
            accessToken,
            caption,
        });
        setSources(list);
        setIndex(0);
        setFailed(list.length === 0);
    }, [filePath, mediaId, centreSlug, accessToken, caption, embed]);

    if (embed) {
        return (
            <EventGalleryEmbed
                embedUrl={filePath}
                title={caption || ariaLabel || "Event video"}
                className={className}
            />
        );
    }

    const src = sources[index];

    if (!src || failed) {
        return <div className={`bg-gray-900 ${className}`} aria-hidden />;
    }

    return (
        <video
            key={src}
            src={src}
            className={className}
            controls={controls}
            autoPlay={autoPlay}
            muted={muted}
            playsInline={playsInline}
            preload={preload}
            aria-label={ariaLabel}
            onError={() => {
                if (index + 1 < sources.length) {
                    setIndex((i) => i + 1);
                    return;
                }
                setFailed(true);
            }}
        />
    );
}

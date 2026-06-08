"use client";

import { resolveFranchiseEmbedSrc } from "@/lib/franchise-embed-url";

type EventGalleryEmbedProps = {
    embedUrl: string;
    title?: string;
    className?: string;
    allowFullScreen?: boolean;
};

/** YouTube / Bunny (MediaDelivery) iframe for Event Gallery link videos. */
export function EventGalleryEmbed({
    embedUrl,
    title = "Event video",
    className = "",
    allowFullScreen = true,
}: EventGalleryEmbedProps) {
    const src = resolveFranchiseEmbedSrc(embedUrl);
    if (!src) {
        return <div className={`bg-gray-900 ${className}`} aria-hidden />;
    }
    return (
        <iframe
            src={src}
            title={title}
            className={className}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={allowFullScreen}
            loading="lazy"
        />
    );
}

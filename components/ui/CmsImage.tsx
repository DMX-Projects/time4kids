'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { nextImageSrc, publicStaticFallbackForMediaPath } from '@/lib/api-client';

type CmsImageProps = Omit<ImageProps, 'src'> & {
    src?: string | null;
};

/**
 * CMS uploads (hero slider, etc.) — served via `/api/cms-files/…` on live.
 */
export default function CmsImage({ src, alt = '', className, fill, sizes, priority, ...props }: CmsImageProps) {
    const [failed, setFailed] = useState(false);
    const [errorFallback, setErrorFallback] = useState<string | null>(null);
    const resolved = errorFallback || nextImageSrc(src);

    useEffect(() => {
        setFailed(false);
        setErrorFallback(null);
    }, [src]);

    if (!resolved) return null;

    if (fill) {
        return (
            <img
                src={resolved}
                alt={alt}
                className={typeof className === 'string' ? className : 'absolute inset-0 h-full w-full object-cover'}
                decoding="async"
                onError={() => {
                    const fb = publicStaticFallbackForMediaPath(src);
                    if (fb && errorFallback !== fb) setErrorFallback(fb);
                    else setFailed(true);
                }}
                style={failed ? { display: 'none' } : undefined}
                {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
            />
        );
    }

    return (
        <Image
            src={resolved}
            alt={alt}
            className={className}
            sizes={sizes}
            priority={priority}
            unoptimized
            onError={() => {
                const fb = publicStaticFallbackForMediaPath(src);
                if (fb && errorFallback !== fb) setErrorFallback(fb);
                else setFailed(true);
            }}
            {...props}
        />
    );
}

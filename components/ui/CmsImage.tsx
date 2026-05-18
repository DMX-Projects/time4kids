'use client';

import Image, { type ImageProps } from 'next/image';
import { nextImageSrc } from '@/lib/api-client';

type CmsImageProps = Omit<ImageProps, 'src'> & {
    src?: string | null;
};

/**
 * CMS / Django uploads (`/media/…` → `/cms-media/…`).
 * Uses `unoptimized` so the browser loads the file directly (no `/_next/image` proxy).
 * Fixes broken photos in incognito and when nginx does not serve `/media/`.
 */
export default function CmsImage({ src, alt = '', ...props }: CmsImageProps) {
    const resolved = nextImageSrc(src);
    if (!resolved) return null;
    return <Image src={resolved} alt={alt} unoptimized {...props} />;
}

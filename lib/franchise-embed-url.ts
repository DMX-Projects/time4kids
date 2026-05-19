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

/** Extract `src` from a pasted `<iframe …>` snippet or return trimmed URL. */
export function parseEmbedInput(raw: string): string {
    const u = raw.trim();
    if (!u) return '';
    const iframeMatch = u.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch?.[1]) return iframeMatch[1].trim();
    const srcAttr = u.match(/src=["']([^"']+)["']/i);
    if (srcAttr?.[1] && u.includes('iframe')) return srcAttr[1].trim();
    return u;
}

/** Normalized URL suitable for `<iframe src="…">` (YouTube, MediaDelivery, or direct embed URL). */
export function resolveFranchiseEmbedSrc(raw: string): string | null {
    const candidate = parseEmbedInput(raw);
    if (!candidate) return null;
    const fromVideoHelper = getFranchiseVideoEmbedSrc(candidate);
    if (fromVideoHelper) return fromVideoHelper;
    if (/^https?:\/\//i.test(candidate)) return candidate;
    return null;
}

export function isFranchiseEmbedUrl(raw: string | null | undefined): boolean {
    return Boolean(resolveFranchiseEmbedSrc(raw || ''));
}

/** Embed URL for full-screen modals (visible controls; optional autoplay). */
export function buildModalEmbedSrc(src: string, options?: { autoplay?: boolean }): string {
    if (!src) return src;
    const autoplay = options?.autoplay ?? true;
    try {
        const url = new URL(src);
        url.searchParams.set('autoplay', autoplay ? 'true' : 'false');
        if (/mediadelivery\.net/i.test(url.hostname)) {
            url.searchParams.set('compactControls', 'false');
            url.searchParams.set('controls', 'true');
            url.searchParams.set('responsive', 'true');
            url.searchParams.set('preload', 'true');
        }
        if (url.hostname.includes('youtube.com')) {
            url.searchParams.set('rel', '0');
            url.searchParams.set('modestbranding', '1');
            url.searchParams.set('controls', '1');
        }
        return url.toString();
    } catch {
        const join = src.includes('?') ? '&' : '?';
        return `${src}${join}autoplay=${autoplay ? 'true' : 'false'}`;
    }
}

'use client';

import { useEffect } from 'react';

const NOPAPERFORMS_WIDGET_SCRIPT = 'https://widgets.in6.nopaperforms.com/emwgts.js';
const NOPAPERFORMS_TRACK_SCRIPT = 'https://track.nopaperforms.com/js/track.js';
const NOPAPERFORMS_WIDGET_ID = '0d11ace91eda0a504dbaeba8e27fcf83';
const NOPAPERFORMS_TRACK_DOMAIN = 'https://timekidspreschools.in6.nopaperforms.com';
const NOPAPERFORMS_TRACK_CLIENT = '6340';
const NOPAPERFORMS_TRACK_MODE = '1';

function appendScriptOnce(src: string) {
    if (typeof document === 'undefined') return;
    if (document.querySelector(`script[src="${src}"]`)) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = src;
    document.body.appendChild(script);
}

function loadNopaperFormsEmbed() {
    appendScriptOnce(NOPAPERFORMS_WIDGET_SCRIPT);
}

function loadNopaperFormsTracking() {
    if (typeof window === 'undefined') return;

    const win = window as Window & {
        npf_d?: string;
        npf_c?: string;
        npf_m?: string;
    };
    win.npf_d = NOPAPERFORMS_TRACK_DOMAIN;
    win.npf_c = NOPAPERFORMS_TRACK_CLIENT;
    win.npf_m = NOPAPERFORMS_TRACK_MODE;

    appendScriptOnce(NOPAPERFORMS_TRACK_SCRIPT);
}

type FranchiseNopaperFormEmbedProps = {
    height?: string;
    className?: string;
};

/** Official NoPaperForms franchise enquiry widget (same embed as legacy timekidspreschools site). */
export default function FranchiseNopaperFormEmbed({
    height = '600px',
    className = '',
}: FranchiseNopaperFormEmbedProps) {
    useEffect(() => {
        loadNopaperFormsEmbed();
        loadNopaperFormsTracking();
    }, []);

    return (
        <div
            className={`npf_wgts w-full overflow-hidden rounded-lg ${className}`.trim()}
            data-height={height}
            data-w={NOPAPERFORMS_WIDGET_ID}
            style={{ minHeight: height }}
        />
    );
}

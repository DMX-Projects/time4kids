'use client';

import { useEffect } from 'react';

const NOPAPERFORMS_SCRIPT_SRC = 'https://widgets.in6.nopaperforms.com/emwgts.js';
const NOPAPERFORMS_WIDGET_ID = '0d11ace91eda0a504dbaeba8e27fcf83';

function loadNopaperFormsScript() {
    if (typeof document === 'undefined') return;
    if (document.querySelector(`script[src="${NOPAPERFORMS_SCRIPT_SRC}"]`)) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = NOPAPERFORMS_SCRIPT_SRC;
    document.body.appendChild(script);
}

type FranchiseNopaperFormEmbedProps = {
    height?: string;
    className?: string;
};

export default function FranchiseNopaperFormEmbed({
    height = '600px',
    className = '',
}: FranchiseNopaperFormEmbedProps) {
    useEffect(() => {
        loadNopaperFormsScript();
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

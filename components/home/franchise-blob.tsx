'use client';

import type { ReactNode } from 'react';

export function franchiseBlobBorderRadius(variant: number): string {
    return variant % 2 === 0
        ? '60% 40% 30% 70% / 60% 30% 70% 40%'
        : '30% 70% 70% 30% / 30% 30% 70% 70%';
}

type FranchiseBlobShellProps = {
    variant: number;
    children: ReactNode;
    className?: string;
    borderClassName?: string;
};

/** Organic oval frame — shared by slider thumbnails and gallery popup. */
export function FranchiseBlobShell({
    variant,
    children,
    className = 'relative isolate mx-auto aspect-square w-full max-w-[min(100%,20rem)] sm:max-w-[22rem] lg:max-w-[24rem]',
    borderClassName = 'overflow-hidden border-[7px] border-white shadow-[0_24px_56px_rgba(15,23,42,0.16)] sm:border-[8px] lg:border-[9px]',
}: FranchiseBlobShellProps) {
    const borderRadius = franchiseBlobBorderRadius(variant);

    return (
        <div className={className} style={{ borderRadius }}>
            <div className={`relative h-full w-full ${borderClassName}`} style={{ borderRadius }}>
                {children}
            </div>
        </div>
    );
}

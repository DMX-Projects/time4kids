'use client';

import { createContext, useContext } from 'react';

export type FranchiseVideoGalleryContextValue = {
    activeIndex: number | null;
    openVideo: (index: number) => void;
    closeGallery: () => void;
    setGalleryIndex: (index: number) => void;
};

export const FranchiseVideoGalleryContext = createContext<FranchiseVideoGalleryContextValue | null>(
    null,
);

export const FranchiseVideoOpenContext = FranchiseVideoGalleryContext;

export function useFranchiseVideoGallery() {
    return useContext(FranchiseVideoGalleryContext);
}

export function useFranchiseVideoOpen() {
    const gallery = useFranchiseVideoGallery();
    return gallery ? { openVideo: gallery.openVideo } : null;
}

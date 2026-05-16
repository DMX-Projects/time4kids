'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type FranchiseVideoPlaybackContextValue = {
    playingIndex: number | null;
    play: (index: number) => void;
    stop: () => void;
};

const FranchiseVideoPlaybackContext = createContext<FranchiseVideoPlaybackContextValue | null>(null);

type FranchiseVideoPlaybackProviderProps = {
    children: ReactNode;
    /** When this changes (e.g. carousel slide), any playing video is stopped. */
    resetKey?: number;
};

export function FranchiseVideoPlaybackProvider({ children, resetKey }: FranchiseVideoPlaybackProviderProps) {
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);

    useEffect(() => {
        setPlayingIndex(null);
    }, [resetKey]);

    const play = useCallback((index: number) => {
        setPlayingIndex(index);
    }, []);

    const stop = useCallback(() => {
        setPlayingIndex(null);
    }, []);

    const value = useMemo(
        () => ({ playingIndex, play, stop }),
        [playingIndex, play, stop],
    );

    return (
        <FranchiseVideoPlaybackContext.Provider value={value}>{children}</FranchiseVideoPlaybackContext.Provider>
    );
}

export function useFranchiseVideoPlayback() {
    const ctx = useContext(FranchiseVideoPlaybackContext);
    if (!ctx) {
        throw new Error('useFranchiseVideoPlayback must be used within FranchiseVideoPlaybackProvider');
    }
    return ctx;
}

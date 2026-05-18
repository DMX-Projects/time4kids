'use client';

import { createContext, useContext } from 'react';

type FranchiseVideoOpenContextValue = {
    openVideo: (index: number) => void;
};

export const FranchiseVideoOpenContext = createContext<FranchiseVideoOpenContextValue | null>(null);

export function useFranchiseVideoOpen() {
    return useContext(FranchiseVideoOpenContext);
}

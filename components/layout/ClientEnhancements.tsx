"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SmoothScroll = dynamic(() => import("@/components/shared/SmoothScroll"), { ssr: false });
const BlobBackground = dynamic(() => import("@/components/animations/BlobBackground"), { ssr: false });
const ScrollProgress = dynamic(() => import("@/components/animations/ScrollProgress"), { ssr: false });
const Chatbot = dynamic(() => import("@/components/shared/Chatbot"), { ssr: false });

const ClientEnhancements = () => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const schedule =
            typeof window !== "undefined" && "requestIdleCallback" in window
                ? (window as any).requestIdleCallback
                : (cb: () => void) => window.setTimeout(cb, 300);

        const cancel =
            typeof window !== "undefined" && "cancelIdleCallback" in window
                ? (window as any).cancelIdleCallback
                : (id: number) => window.clearTimeout(id);

        const handle = schedule(() => setReady(true));
        return () => cancel(handle);
    }, []);

    if (!ready) return null;

    return (
        <>
            <SmoothScroll />
            <BlobBackground />
            <ScrollProgress />
            <Chatbot />
        </>
    );
};

export default ClientEnhancements;

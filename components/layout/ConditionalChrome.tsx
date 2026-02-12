"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

// Renders children unless the current route is a dashboard view or a specific school page.
export default function ConditionalChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // During hydration, render everything to match the server HTML
    // even if it will be hidden immediately after mount.
    // Or, more stably, only render Chrome if it's supposed to be there on both.

    const pathSegments = pathname.split('/').filter(Boolean);
    const isDashboard = pathname.startsWith("/dashboard");
    const isSchoolPage = pathSegments[0] === 'locations' && pathSegments.length > 2;

    const hideChrome = isDashboard || isSchoolPage;

    if (!isMounted) {
        // On server and first client render, use the logic to match SSR
        if (hideChrome) return null;
        return <>{children}</>;
    }

    if (hideChrome) return null;
    return <>{children}</>;
}

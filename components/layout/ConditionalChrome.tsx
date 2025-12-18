"use client";

import { usePathname } from "next/navigation";
import React from "react";

// Renders children unless the current route is a dashboard view.
export default function ConditionalChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideChrome = pathname.startsWith("/dashboard");

    if (hideChrome) return null;
    return <>{children}</>;
}

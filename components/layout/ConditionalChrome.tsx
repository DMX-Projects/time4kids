"use client";

import { usePathname } from "next/navigation";
import React from "react";

// Renders children unless the current route is a dashboard view or a specific school page.
export default function ConditionalChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() ?? "";

    const pathSegments = pathname.split("/").filter(Boolean);
    const isDashboard = pathname.startsWith("/dashboard");
    const isDriverPage = pathname.startsWith("/driver");
    const isLeadsReport = pathname.startsWith("/leads");
    const isSchoolPage = pathSegments[0] === "locations" && pathSegments.length > 2;

    const hideChrome = isDashboard || isDriverPage || isLeadsReport || isSchoolPage;

    if (hideChrome) return null;
    return <>{children}</>;
}

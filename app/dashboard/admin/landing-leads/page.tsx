"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LandingLeadsReport from "@/components/leads/LandingLeadsReport";

function AdminLandingLeadsInner() {
    const searchParams = useSearchParams();
    const citySlug = searchParams.get("city")?.trim() || undefined;

    return (
        <LandingLeadsReport
            title="Landing page leads"
            citySlug={citySlug}
            embedded
            basePath="/dashboard/admin/landing-leads/"
        />
    );
}

export default function AdminLandingLeadsPage() {
    return (
        <Suspense
            fallback={
                <div className="py-12 text-center text-sm text-slate-500">Loading landing leads…</div>
            }
        >
            <AdminLandingLeadsInner />
        </Suspense>
    );
}

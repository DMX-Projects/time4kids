"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

/** Showcase shares the event gallery; client redirect avoids a blank frame during SPA navigation. */
export default function ShowcasePage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/parent/event-gallery");
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[45vh] gap-4 text-center px-4 rounded-2xl border border-orange-100 bg-white shadow-sm p-8">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md">
                <h1 className="text-lg font-semibold text-orange-900">Showcase</h1>
                <p className="text-sm text-orange-700">
                    Taking you to photos and videos from school events. If this screen stays here, tap{" "}
                    <strong>Event gallery</strong> in the menu.
                </p>
            </div>
            <p className="text-xs text-orange-600">Redirecting…</p>
        </div>
    );
}

"use client";

import { Clock } from "lucide-react";

/** Clock spinner only (no caption). Use `ariaLabel` for screen readers. */
export function AccessLoading({ ariaLabel = "Loading" }: { ariaLabel?: string }) {
    return (
        <div
            className="flex min-h-[60vh] flex-col items-center justify-center px-4"
            role="status"
            aria-live="polite"
            aria-label={ariaLabel}
        >
            <Clock className="h-12 w-12 animate-spin text-orange-500" strokeWidth={1.5} aria-hidden />
        </div>
    );
}

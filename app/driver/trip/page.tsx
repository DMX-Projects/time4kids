"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/AuthProvider";
import { DriverTripContent } from "@/components/dashboard/driver/DriverTripContent";

export default function DriverTripPage() {
    // Build ID: 2026-05-04-10-48-Refactored
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FFF8ED] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-orange-950 font-medium">Loading Dashboard...</p>
                </div>
            </div>
        }>
            <RoleGuard allowedRole="driver">
                <DriverTripContent />
            </RoleGuard>
        </Suspense>
    );
}

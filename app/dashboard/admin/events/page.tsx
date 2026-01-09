"use client";

import { CalendarDays } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function AdminEventsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="bg-orange-100 p-4 rounded-full">
                <CalendarDays className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Events Moved</h1>
            <p className="max-w-md text-slate-600">
                Event management is now handled through the Media Files section. Please use the Media Files tab to manage your event photos and details.
            </p>
            <Link href="/dashboard/admin/media">
                <Button>Go to Media Files</Button>
            </Link>
        </div>
    );
}

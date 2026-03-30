"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

export default function FranchiseEventSchedulePage() {
    const { events } = useSchoolData();

    const sorted = useMemo(() => {
        return [...events].sort((a, b) => {
            const da = a.date || "";
            const db = b.date || "";
            return da.localeCompare(db);
        });
    }, [events]);

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Event schedule</h1>
                        <p className="text-sm text-orange-700">
                            Centre events in date order. Parents see published events on their portal; edit them on{" "}
                            <Link href="/dashboard/franchise/events" className="font-medium text-orange-800 underline underline-offset-2">
                                Events
                            </Link>
                            .
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 text-sm text-orange-800 pt-2">
                    {sorted.map((ev) => (
                        <div
                            key={ev.id}
                            className="flex flex-wrap items-center justify-between gap-2 bg-white border border-orange-100 rounded-lg px-3 py-2 shadow-sm"
                        >
                            <div>
                                <p className="font-semibold text-orange-900">{ev.title}</p>
                                <p className="text-xs text-orange-700">{ev.venue || "Venue TBD"}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs px-2 py-1 bg-orange-50 border border-orange-100 rounded-full">
                                    {ev.date || "TBD"}
                                </span>
                            </div>
                        </div>
                    ))}
                    {sorted.length === 0 && (
                        <p className="text-sm text-orange-700">
                            No events yet.{" "}
                            <Link href="/dashboard/franchise/events" className="font-medium text-orange-800 underline">
                                Add events
                            </Link>{" "}
                            for your centre.
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}

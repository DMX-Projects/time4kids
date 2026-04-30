"use client";

import { useEffect, useState } from "react";
import { Bus, ExternalLink, MapPin, Navigation, Radio } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const LiveBusMap = dynamic(() => import("@/components/dashboard/parent/LiveBusMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-orange-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
        </div>
    )
});

type Row = {
    id: number;
    route_name: string;
    description?: string;
    map_url?: string;
    tracking_note?: string;
};

type LiveLocation = {
    latitude: string;
    longitude: string;
    speed?: number | null;
    heading?: number | null;
    accuracy?: number | null;
    recorded_at: string;
};

type LiveTripPayload = {
    live: boolean;
    route?: (Row & { vehicle_number?: string; driver_name?: string; driver_phone?: string }) | null;
    trip?: { id: number; trip_type: string; status: string; started_at?: string | null } | null;
    latest_location?: LiveLocation | null;
    student_status?: { student_name: string; status: string; note?: string; updated_at: string } | null;
};

export default function TransportPage() {
    const { authFetch } = useAuth();
    const [rows, setRows] = useState<Row[]>([]);
    const [liveTrip, setLiveTrip] = useState<LiveTripPayload | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await authFetch<Row[]>("/students/parent/transport/");
                if (!cancelled) setRows(Array.isArray(data) ? data : []);
            } catch {
                if (!cancelled) setRows([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [authFetch]);

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setInterval> | null = null;
        const loadLive = async () => {
            try {
                const data = await authFetch<LiveTripPayload>("/students/parent/transport/live/");
                if (!cancelled) setLiveTrip(data);
            } catch {
                if (!cancelled) setLiveTrip(null);
            }
        };
        void loadLive();
        timer = setInterval(loadLive, 5000); // Poll every 5 seconds for a smoother feel
        return () => {
            cancelled = true;
            if (timer) clearInterval(timer);
        };
    }, [authFetch]);

    const lat = liveTrip?.latest_location ? Number(liveTrip.latest_location.latitude) : null;
    const lng = liveTrip?.latest_location ? Number(liveTrip.latest_location.longitude) : null;
    const heading = liveTrip?.latest_location ? Number(liveTrip.latest_location.heading) : 0;
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
    const lastUpdated = liveTrip?.latest_location?.recorded_at
        ? new Date(liveTrip.latest_location.recorded_at).toLocaleString()
        : "";

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Bus className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Transport</h1>
                        <p className="text-sm text-orange-700">
                            Bus routes, maps, and live location when your centre starts a trip.
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
                            <Radio className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-orange-950">Live tracking</h2>
                            <p className="text-sm text-orange-700">
                                {liveTrip?.live ? "Your centre bus is sharing live location." : "No live bus location is active right now."}
                            </p>
                        </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${liveTrip?.live ? "bg-green-100 text-green-800" : "bg-orange-50 text-orange-800"}`}>
                        {liveTrip?.live ? "LIVE" : "OFFLINE"}
                    </span>
                </div>

                {liveTrip?.route && (
                    <div className="grid gap-3 md:grid-cols-3 text-sm">
                        <Info label="Route" value={liveTrip.route.route_name} />
                        <Info label="Vehicle" value={liveTrip.route.vehicle_number || "Not added"} />
                        <Info label="Driver" value={liveTrip.route.driver_info?.full_name || liveTrip.route.driver_name || "Not added"} />
                    </div>
                )}

                {liveTrip?.student_status && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                        {liveTrip.student_status.student_name}: {formatStatus(liveTrip.student_status.status)}
                    </div>
                )}

                {hasCoords ? (
                    <div className="space-y-2">
                        <div className="overflow-hidden rounded-2xl border border-orange-100 h-80 bg-orange-50 relative">
                            <LiveBusMap lat={lat!} lng={lng!} heading={heading} isLive={!!liveTrip?.live} />
                        </div>
                        <p className="flex items-center gap-2 text-xs text-orange-700">
                            <MapPin className="w-3.5 h-3.5" />
                            Last updated: {lastUpdated || "just now"}
                        </p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 px-4 py-8 text-center text-sm text-orange-800">
                        <Navigation className="w-8 h-8 mx-auto mb-2" />
                        Waiting for the driver app to start sending GPS.
                    </div>
                )}
            </section>

            {loading && <p className="text-sm text-orange-700">Loading...</p>}
            {!loading && rows.length === 0 && (
                <p className="text-sm text-orange-700">No transport info published yet. Contact your centre for route details.</p>
            )}

            <ul className="space-y-4">
                {rows.map((r) => (
                    <li key={r.id} className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm space-y-2">
                        <h2 className="font-semibold text-orange-900">{r.route_name}</h2>
                        {r.description && <p className="text-sm text-orange-800 whitespace-pre-wrap">{r.description}</p>}
                        {r.tracking_note && <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-2">{r.tracking_note}</p>}
                        {r.map_url && (
                            <a
                                href={r.map_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline"
                            >
                                Open map <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-orange-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">{label}</p>
            <p className="font-semibold text-orange-950">{value}</p>
        </div>
    );
}

function formatStatus(value: string) {
    return value
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

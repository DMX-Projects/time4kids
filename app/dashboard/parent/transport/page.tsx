"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Bus,
    ChevronRight,
    MapPin,
    Navigation,
    Phone,
    Radio,
    User,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const LiveBusMap = dynamic(() => import("@/components/dashboard/parent/LiveBusMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-orange-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
        </div>
    ),
});

type DriverInfo = {
    id?: number;
    full_name: string;
    email?: string;
    phone?: string;
    service_number?: string;
};

type MyStudentOnRoute = {
    student_id: number;
    student_name: string;
    class_name?: string;
    pickup_stop?: string;
    drop_stop?: string;
    pickup_time?: string | null;
    drop_time?: string | null;
};

type RouteRow = {
    id: number;
    route_name: string;
    driver_info?: DriverInfo | null;
    my_students?: MyStudentOnRoute[];
};

type LiveLocation = {
    latitude: number;
    longitude: number;
    heading?: number | null;
    recorded_at: string;
};

type LiveTripEntry = {
    live: boolean;
    route: RouteRow;
    trip: {
        id: number;
        trip_type: string;
        status: string;
        started_at?: string | null;
        recent_locations?: Array<{ latitude: number; longitude: number }>;
    };
    latest_location?: LiveLocation | null;
    student_status?: {
        student_id: number;
        student_name: string;
        status: string;
        note?: string;
        updated_at: string;
    };
};

type LiveTripPayload = {
    live: boolean;
    trips: LiveTripEntry[];
    school_location?: { latitude: number; longitude: number } | null;
};

function driverName(route: RouteRow): string {
    const name = route.driver_info?.full_name || "";
    return name.trim() || "Driver not assigned";
}

function driverPhone(route: RouteRow): string {
    return (route.driver_info?.phone || "").trim();
}

function driverServiceNumber(route: RouteRow): string {
    return (route.driver_info?.service_number || "").trim();
}

function formatStatus(value: string) {
    return value
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export default function TransportPage() {
    const { authFetch } = useAuth();
    const [rows, setRows] = useState<RouteRow[]>([]);
    const [liveTrip, setLiveTrip] = useState<LiveTripPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await authFetch<RouteRow[]>("/students/parent/transport/");
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

    // Live GPS: one check on open; poll only when a trip is live or parent is watching a route.
    useEffect(() => {
        let cancelled = false;

        const loadLive = async () => {
            if (typeof document !== "undefined" && document.visibilityState === "hidden") {
                return;
            }
            try {
                const data = await authFetch<LiveTripPayload>("/students/parent/transport/live/");
                if (!cancelled) setLiveTrip(data);
            } catch {
                if (!cancelled) setLiveTrip(null);
            }
        };

        void loadLive();
        return () => {
            cancelled = true;
        };
    }, [authFetch]);

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setInterval> | null = null;

        const loadLive = async () => {
            if (typeof document !== "undefined" && document.visibilityState === "hidden") {
                return;
            }
            try {
                const data = await authFetch<LiveTripPayload>("/students/parent/transport/live/");
                if (!cancelled) setLiveTrip(data);
            } catch {
                if (!cancelled) setLiveTrip(null);
            }
        };

        const intervalMs = liveTrip?.live
            ? 3000
            : selectedRouteId != null
              ? 15000
              : 0;

        if (intervalMs > 0) {
            timer = setInterval(() => void loadLive(), intervalMs);
        }

        return () => {
            cancelled = true;
            if (timer) clearInterval(timer);
        };
    }, [authFetch, selectedRouteId, liveTrip?.live]);

    const liveByRouteId = useMemo(() => {
        const map = new Map<number, LiveTripEntry>();
        for (const entry of liveTrip?.trips ?? []) {
            map.set(Number(entry.route.id), entry);
        }
        return map;
    }, [liveTrip?.trips]);

    const selectedRoute = rows.find((r) => r.id === selectedRouteId) ?? null;
    const selectedLive =
        selectedRouteId != null ? liveByRouteId.get(Number(selectedRouteId)) : undefined;
    const tripIsLive = selectedLive?.trip?.status === "LIVE" || selectedLive?.live === true;
    const hasLiveGps =
        selectedLive?.latest_location != null &&
        Number.isFinite(Number(selectedLive.latest_location.latitude)) &&
        Number.isFinite(Number(selectedLive.latest_location.longitude));

    const handleSelectRoute = (routeId: number) => {
        setSelectedRouteId((prev) => (prev === routeId ? null : routeId));
    };

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
                            All buses at your centre are listed below. Tap a route to track it when the driver has started the trip.
                        </p>
                    </div>
                </div>
            </section>

            {loading && (
                <p className="text-sm text-orange-700 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading routes…
                </p>
            )}

            {!loading && rows.length === 0 && (
                <p className="text-sm text-orange-700 rounded-xl border border-orange-100 bg-white p-4">
                    No transport routes published by your centre yet.
                </p>
            )}

            {!loading && rows.length > 0 && (
                <>
                    <section className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-base font-semibold text-orange-950">Select route</h2>
                            <span className="text-xs text-orange-600 font-medium">{rows.length} route{rows.length === 1 ? "" : "s"}</span>
                        </div>

                        <div className="-mx-1 px-1 overflow-x-auto pb-1 scrollbar-thin">
                            <div className="flex gap-3 min-w-min">
                                {rows.map((r) => {
                                    const isSelected = selectedRouteId === r.id;
                                    const isLive = liveByRouteId.has(Number(r.id));
                                    const driverShort =
                                        r.driver_info?.full_name?.split(" ")[0] || "No driver";
                                    const hasMyChild = (r.my_students?.length ?? 0) > 0;

                                    return (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => handleSelectRoute(r.id)}
                                            className={`relative flex-shrink-0 w-[148px] sm:w-[168px] text-left rounded-2xl border-2 p-4 transition-all duration-200 shadow-sm ${
                                                isSelected
                                                    ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200 scale-[1.02]"
                                                    : "border-orange-100 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                                            }`}
                                        >
                                            {hasMyChild && (
                                                <span className="absolute -top-2 left-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                                                    Your child
                                                </span>
                                            )}
                                            {isLive && (
                                                <span className="absolute -top-2 right-2 flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                    LIVE
                                                </span>
                                            )}
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 mb-1">
                                                Route
                                            </p>
                                            <p className="font-bold text-orange-950 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                                                {r.route_name}
                                            </p>
                                            <p className="mt-2 text-xs text-gray-600 truncate">{driverShort}</p>
                                            {driverServiceNumber(r) && (
                                                <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                                                    {driverServiceNumber(r)}
                                                </p>
                                            )}
                                            {isSelected && (
                                                <ChevronRight className="absolute bottom-3 right-3 w-4 h-4 text-orange-500" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {!selectedRouteId && (
                            <p className="text-sm text-center text-orange-700 bg-orange-50/80 border border-dashed border-orange-200 rounded-xl py-6 px-4">
                                Select a route slot above to open the map and full details.
                            </p>
                        )}
                    </section>

                    {selectedRoute && (
                        <section className="rounded-2xl border-2 border-orange-200 bg-white shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 text-white">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-100">Selected route</p>
                                        <h3 className="text-lg font-bold">{selectedRoute.route_name}</h3>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                                            selectedLive ? "bg-green-500 text-white" : "bg-white/20 text-white"
                                        }`}
                                    >
                                        {tripIsLive ? (hasLiveGps ? "TRIP LIVE" : "GPS STARTING") : "OFFLINE"}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                <div
                                    className={`grid gap-3 text-sm ${
                                        driverServiceNumber(selectedRoute) ? "sm:grid-cols-2" : ""
                                    }`}
                                >
                                    <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 flex items-start gap-3">
                                        <User className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-orange-700">Driver</p>
                                            <p className="font-semibold text-orange-950">{driverName(selectedRoute)}</p>
                                            {driverPhone(selectedRoute) && (
                                                <p className="flex items-center gap-1 text-xs text-orange-800 mt-1">
                                                    <Phone className="w-3 h-3" />
                                                    {driverPhone(selectedRoute)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {driverServiceNumber(selectedRoute) ? (
                                        <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                                            <p className="text-xs font-semibold uppercase text-gray-600">Service number</p>
                                            <p className="font-semibold text-gray-900">
                                                {driverServiceNumber(selectedRoute)}
                                            </p>
                                        </div>
                                    ) : null}
                                </div>

                                {selectedRoute.my_students && selectedRoute.my_students.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                                            Your child on this route
                                        </p>
                                        {selectedRoute.my_students.map((s) => (
                                            <div
                                                key={s.student_id}
                                                className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-950"
                                            >
                                                <p className="font-semibold">
                                                    {s.student_name}
                                                    {s.class_name ? ` · ${s.class_name}` : ""}
                                                </p>
                                                {s.pickup_stop && (
                                                    <p className="text-xs mt-1">
                                                        <span className="font-medium">Pickup:</span> {s.pickup_stop}
                                                    </p>
                                                )}
                                                {s.drop_stop && (
                                                    <p className="text-xs mt-0.5">
                                                        <span className="font-medium">Drop:</span> {s.drop_stop}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedLive?.student_status && (
                                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                                        <span className="font-bold">{selectedLive.student_status.student_name}:</span>{" "}
                                        {formatStatus(selectedLive.student_status.status)}
                                        {selectedLive.student_status.note && (
                                            <span className="ml-2 italic opacity-75">({selectedLive.student_status.note})</span>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Radio className="w-4 h-4 text-green-700" />
                                        <h4 className="font-semibold text-orange-950">Live map</h4>
                                    </div>

                                    {hasLiveGps && selectedLive ? (
                                        <>
                                            <div className="overflow-hidden rounded-2xl border border-orange-100 h-80 bg-orange-50 relative">
                                                <LiveBusMap
                                                    lat={selectedLive.latest_location!.latitude}
                                                    lng={selectedLive.latest_location!.longitude}
                                                    heading={selectedLive.latest_location!.heading}
                                                    isLive={true}
                                                    schoolLat={liveTrip?.school_location?.latitude}
                                                    schoolLng={liveTrip?.school_location?.longitude}
                                                    recentLocations={selectedLive.trip.recent_locations}
                                                />
                                            </div>
                                            <p className="flex items-center gap-2 text-xs text-orange-700">
                                                <MapPin className="w-3.5 h-3.5" />
                                                Last updated:{" "}
                                                {selectedLive.latest_location?.recorded_at
                                                    ? new Date(selectedLive.latest_location.recorded_at).toLocaleTimeString()
                                                    : "Just now"}
                                            </p>
                                        </>
                                    ) : tripIsLive ? (
                                        <div className="rounded-2xl border border-dashed border-green-200 bg-green-50 px-4 py-12 text-center text-sm text-green-900">
                                            <Loader2 className="w-10 h-10 mx-auto mb-3 text-green-600 animate-spin" />
                                            <p className="font-semibold">Trip is live — waiting for GPS</p>
                                            <p className="text-xs mt-2 text-green-800 max-w-xs mx-auto">
                                                The driver has started <span className="font-medium">{selectedRoute.route_name}</span>.
                                                The map will appear when the phone shares location (allow GPS in the browser).
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 px-4 py-12 text-center text-sm text-orange-800">
                                            <Navigation className="w-10 h-10 mx-auto mb-3 text-orange-400" />
                                            <p className="font-semibold">No live GPS on this route yet</p>
                                            <p className="text-xs mt-2 text-orange-700 max-w-xs mx-auto">
                                                Ask the driver to tap <span className="font-medium">Start</span> on{" "}
                                                <span className="font-medium">{selectedRoute.route_name}</span> in the driver app.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedRouteId(null)}
                                    className="w-full text-sm font-semibold text-orange-700 py-2 rounded-xl border border-orange-200 hover:bg-orange-50"
                                >
                                    Close route details
                                </button>
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}

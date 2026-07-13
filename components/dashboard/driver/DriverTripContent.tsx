"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Bus, ChevronDown, Loader2, LogOut, MapPin, Play, Square } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { apiUrl, jsonHeaders } from "@/lib/api-client";
import { RouteInfo, ActiveTrip, AssignedStudent } from "./types";
import { StudentList } from "./StudentList";

const TOKEN_KEY = "tk-driver-route-token";

const GPS_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 25000,
};

function gpsErrorMessage(err: GeolocationPositionError): string {
    if (err.code === err.PERMISSION_DENIED) {
        return "Location permission is required. Allow GPS for this site, then tap Start again.";
    }
    if (err.code === err.POSITION_UNAVAILABLE) {
        return "GPS signal not available. Turn on location services and try again.";
    }
    if (err.code === err.TIMEOUT) {
        return "GPS took too long. Move to an open area and tap Start again.";
    }
    return err.message || "Could not get GPS location";
}

/** Driver: Start = begin trip + share GPS immediately for parents. */
export function DriverTripContent() {
    const router = useRouter();
    const { user, loading: authLoading, authFetch, logout: authLogout } = useAuth();
    const searchParams = useSearchParams();
    const [route, setRoute] = useState<RouteInfo | null>(null);
    const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
    const [students, setStudents] = useState<AssignedStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [startingTrip, setStartingTrip] = useState(false);
    const { showToast } = useToast();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isStopModalOpen, setIsStopModalOpen] = useState(false);
    const [allRoutes, setAllRoutes] = useState<any[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string>("");
    const [isRouteDrawerOpen, setIsRouteDrawerOpen] = useState(false);
    const watchIdRef = useRef<number | null>(null);
    const wakeLockRef = useRef<any>(null);
    const tripActiveRef = useRef(false);
    const startingTripRef = useRef(false);

    const cleanToken = (value: string) => value.trim();

    const resolveRouteId = useCallback(
        (routeData?: RouteInfo | null) =>
            selectedRouteId || (routeData?.id != null ? String(routeData.id) : route?.id != null ? String(route.id) : ""),
        [selectedRouteId, route?.id],
    );

    const endGpsWatch = useCallback(() => {
        if (watchIdRef.current != null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        tripActiveRef.current = false;
    }, []);

    const postLocation = useCallback(
        async (routeId: string, latitude: number, longitude: number, speed = 0) => {
            await authFetch("/students/driver/me/trip/location/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    latitude,
                    longitude,
                    speed,
                    route_id: routeId,
                }),
            });
        },
        [authFetch],
    );

    const enableServerGps = useCallback(
        async (routeId: string) => {
            await authFetch("/students/driver/me/trip/toggle-gps/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ active: true, route_id: routeId }),
            });
        },
        [authFetch],
    );

    const acquireGpsFix = useCallback((): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, GPS_OPTIONS);
        });
    }, []);

    const attachGpsWatch = useCallback(
        (routeId: string) => {
            if (!navigator.geolocation || watchIdRef.current != null) return;

            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    if (!tripActiveRef.current) return;
                    void postLocation(
                        routeId,
                        pos.coords.latitude,
                        pos.coords.longitude,
                        pos.coords.speed || 0,
                    ).catch((e) => console.error(e));
                },
                (err) => {
                    showToast(gpsErrorMessage(err), "error");
                },
                { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
            );
        },
        [postLocation, showToast],
    );

    const shareLocationNow = useCallback(
        async (routeId: string, firstPos?: GeolocationPosition) => {
            if (!navigator.geolocation) {
                showToast("GPS is not supported on this device", "error");
                return false;
            }

            let pos = firstPos;
            if (!pos) {
                try {
                    pos = await acquireGpsFix();
                } catch (err) {
                    showToast(gpsErrorMessage(err as GeolocationPositionError), "error");
                    return false;
                }
            }

            tripActiveRef.current = true;

            try {
                await enableServerGps(routeId);
                await postLocation(routeId, pos.coords.latitude, pos.coords.longitude, pos.coords.speed || 0);
            } catch {
                showToast("Could not send location to server", "error");
                endGpsWatch();
                return false;
            }

            attachGpsWatch(routeId);
            return true;
        },
        [acquireGpsFix, attachGpsWatch, enableServerGps, endGpsWatch, postLocation, showToast],
    );

    const loadRoute = useCallback(
        async (value?: string, options?: { silent?: boolean }) => {
            const silent = options?.silent === true;
            const nextToken = value ? cleanToken(value) : "";

            if (!silent && !startingTripRef.current) {
                setLoading(true);
            }

            try {
                let data: any;
                if (user?.role === "driver") {
                    data = await authFetch(
                        `/students/driver/me/trip/${selectedRouteId ? `?route_id=${selectedRouteId}` : ""}`,
                        { cache: "no-store" },
                    );
                } else {
                    if (!nextToken) return;
                    const res = await fetch(apiUrl(`/students/driver/transport/${nextToken}/`), {
                        cache: "no-store",
                    });
                    if (!res.ok) throw new Error("Invalid driver link");
                    data = await res.json();
                    localStorage.setItem(TOKEN_KEY, nextToken);
                }

                setRoute(data.route);
                const trip = data.active_trip;
                const isLive = trip?.status === "LIVE";
                const routeId = resolveRouteId(data.route);

                if (isLive) {
                    setActiveTrip(trip);
                    tripActiveRef.current = true;
                    if (!watchIdRef.current && routeId && !startingTripRef.current) {
                        void shareLocationNow(routeId);
                    }
                } else if (!tripActiveRef.current && !startingTripRef.current) {
                    setActiveTrip(null);
                    endGpsWatch();
                }

                if (data.all_routes) setAllRoutes(data.all_routes);
                if (data.students) setStudents(data.students);
                if (data.route && !selectedRouteId) {
                    setSelectedRouteId(String(data.route.id));
                }
            } catch (err) {
                if (!tripActiveRef.current && !startingTripRef.current) {
                    setRoute(null);
                    setActiveTrip(null);
                    endGpsWatch();
                }
                if (!silent) {
                    showToast(err instanceof Error ? err.message : "Could not load route", "error");
                }
            } finally {
                if (!silent && !startingTripRef.current) {
                    setLoading(false);
                }
            }
        },
        [user, authFetch, selectedRouteId, showToast, endGpsWatch, shareLocationNow, resolveRouteId],
    );

    const handleStatusChange = async (studentId: number, status: string) => {
        try {
            let res;
            const payload = { route_id: resolveRouteId(), student_id: studentId, status };
            if (user?.role === "driver") {
                res = await authFetch("/students/driver/me/trip/student-status/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify(payload),
                });
            } else {
                const token = localStorage.getItem(TOKEN_KEY);
                res = await fetch(apiUrl(`/students/driver/transport/${token}/student-status/`), {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error();
            }
            
            const newStudents = students.map((s) => (s.student_id === studentId ? { ...s, status: status as any } : s));
            setStudents(newStudents);
            showToast("Student status updated", "success");
        } catch (err) {
            showToast("Failed to update status", "error");
        }
    };

    useEffect(() => {
        if (authLoading) return;

        const urlToken = searchParams.get("token");
        const saved = localStorage.getItem(TOKEN_KEY);

        if (user?.role === "driver") {
            void loadRoute();
        } else {
            const effectiveToken = urlToken || saved;
            if (effectiveToken) {
                void loadRoute(effectiveToken);
            } else {
                router.push("/login?next=%2Fdriver%2Ftrip");
            }
        }
    }, [authLoading, user?.role, searchParams, loadRoute, router]);

    useEffect(() => {
        if (authLoading || user?.role !== "driver") return;

        const timer = setInterval(() => {
            void loadRoute(undefined, { silent: true });
        }, 8000);

        return () => clearInterval(timer);
    }, [authLoading, user?.role, loadRoute]);

    useEffect(() => {
        return () => {
            endGpsWatch();
        };
    }, [endGpsWatch]);

    const requestWakeLock = async () => {
        if ("wakeLock" in navigator) {
            try {
                wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
            } catch (err) {
                console.error(err);
            }
        }
    };

    const releaseWakeLock = async () => {
        if (wakeLockRef.current) {
            try {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
            } catch (err) {
                console.error(err);
            }
        }
    };

    const startTrip = async () => {
        const routeId = resolveRouteId();
        if (!routeId) {
            showToast("No route selected", "error");
            return;
        }
        if (!navigator.geolocation) {
            showToast("GPS is not supported on this device", "error");
            return;
        }

        startingTripRef.current = true;
        setStartingTrip(true);

        try {
            const firstPos = await acquireGpsFix();

            const data = await authFetch<ActiveTrip>("/students/driver/me/trip/start/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ trip_type: "PICKUP", route_id: routeId }),
            });

            tripActiveRef.current = true;
            setActiveTrip(data);

            const shared = await shareLocationNow(routeId, firstPos);
            if (!shared) {
                try {
                    await authFetch("/students/driver/me/trip/complete/", {
                        method: "POST",
                        headers: jsonHeaders(),
                        body: JSON.stringify({ route_id: routeId }),
                    });
                } catch {
                    /* ignore */
                }
                setActiveTrip(null);
                tripActiveRef.current = false;
                return;
            }

            void requestWakeLock();
            showToast("Sharing live location with parents", "success");
        } catch (err) {
            endGpsWatch();
            setActiveTrip(null);
            if (err instanceof GeolocationPositionError || (err as GeolocationPositionError)?.code != null) {
                showToast(gpsErrorMessage(err as GeolocationPositionError), "error");
            } else {
                showToast("Could not start trip", "error");
            }
        } finally {
            startingTripRef.current = false;
            setStartingTrip(false);
        }
    };

    const stopTrip = async () => {
        endGpsWatch();
        void releaseWakeLock();
        setLoading(true);
        try {
            await authFetch("/students/driver/me/trip/complete/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ route_id: resolveRouteId() }),
            });
            setActiveTrip(null);
            showToast("Trip stopped — GPS off for parents", "success");
            await loadRoute(undefined, { silent: true });
        } catch {
            showToast("Could not stop trip", "error");
        } finally {
            setLoading(false);
            setIsStopModalOpen(false);
        }
    };

    const tripLive = activeTrip?.status === "LIVE";

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-4 py-4">
            <div className="mx-auto max-w-md space-y-4 pb-10">
                <div className="flex items-center justify-between px-1">
                    <Link href="/">
                        <Image
                            src="/time-kids-logo-new.png"
                            alt="T.I.M.E. Kids Logo"
                            width={120}
                            height={48}
                            className="h-10 w-auto object-contain"
                            priority
                        />
                    </Link>
                    {user && (
                        <button
                            type="button"
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-orange-100 text-[11px] font-bold text-red-600 shadow-sm hover:bg-red-50"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Logout
                        </button>
                    )}
                </div>

                <section className="rounded-2xl bg-white border border-orange-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                            <Bus className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-orange-950">Driver</h1>
                            {allRoutes.length > 1 && (
                                <button
                                    type="button"
                                    disabled={tripLive || startingTrip}
                                    onClick={() => setIsRouteDrawerOpen(true)}
                                    className="mt-1 bg-orange-50 border border-orange-100 text-orange-900 text-[11px] font-bold rounded-full px-3 py-1 flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {allRoutes.find((r) => String(r.id) === selectedRouteId)?.route_name ||
                                        "Select route"}
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                            )}
                            <p className="text-sm text-orange-700 mt-1">
                                Tap <strong>Start</strong> — trip begins and GPS is shared with parents automatically.
                            </p>
                        </div>
                    </div>
                </section>

                {route && (
                    <section className="rounded-2xl bg-white border border-orange-100 p-5 shadow-sm space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 uppercase leading-tight">
                                {route.route_name}
                            </h2>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {route.vehicle_number && (
                                    <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                                        🚌 {route.vehicle_number}
                                    </span>
                                )}
                                
                            </div>
                        </div>

                        {!tripLive ? (
                            <Button
                                onClick={startTrip}
                                disabled={startingTrip || loading}
                                className="w-full text-white py-4 rounded-xl font-bold text-lg min-h-[52px]"
                            >
                                {startingTrip ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin shrink-0" />
                                        Starting…
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 mr-2 shrink-0" /> Start
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setIsStopModalOpen(true)}
                                disabled={loading}
                                className="w-full text-white py-4 rounded-xl font-bold text-lg min-h-[52px]"
                            >
                                <Square className="w-5 h-5 mr-2 shrink-0" /> Stop
                            </Button>
                        )}

                        {tripLive && (
                            <p className="text-center text-sm font-semibold text-green-700 flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                                Sharing live location with parents
                            </p>
                        )}


                    </section>
                )}

                {!route && !loading && !startingTrip && (
                    <p className="text-sm text-orange-800 bg-orange-50 border border-orange-100 rounded-xl p-4">
                        No route assigned yet. Ask your centre to link you to a transport route.
                    </p>
                )}
            </div>

            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                title="Logout"
                size="sm"
                placement="center"
            >
                <p className="text-gray-600 text-sm">Log out of the driver app?</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-red-600 text-white"
                        onClick={() => {
                            authLogout();
                            router.push("/login");
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={isStopModalOpen}
                onClose={() => setIsStopModalOpen(false)}
                title="Last Drop Completed"
                size="sm"
                placement="center"
            >
                <p className="text-gray-600 text-sm">Are you sure you want to complete this trip? Parents will no longer see live tracking.</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setIsStopModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button className="bg-red-600 text-white" onClick={stopTrip}>
                        Complete
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={isRouteDrawerOpen}
                onClose={() => setIsRouteDrawerOpen(false)}
                title="Select route"
                size="sm"
                placement="center"
            >
                <div className="space-y-3 p-2">
                    {allRoutes.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                                setSelectedRouteId(String(r.id));
                                setIsRouteDrawerOpen(false);
                                void loadRoute();
                            }}
                            className={`w-full text-left p-4 rounded-xl border ${
                                selectedRouteId === String(r.id)
                                    ? "bg-orange-50 border-orange-200"
                                    : "bg-white border-gray-100"
                            }`}
                        >
                            <p className="font-bold text-gray-900">{r.route_name}</p>
                        </button>
                    ))}
                </div>
            </Modal>
        </main>
    );
}

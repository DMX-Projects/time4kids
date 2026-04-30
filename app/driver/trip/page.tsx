"use client";

import { FormEvent, useCallback, useEffect, useRef, useState, Suspense } from "react";
import { Bus, CheckCircle2, Crosshair, Loader2, LogOut, MapPin, Play, Square, UserCheck, UserX } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiUrl, jsonHeaders } from "@/lib/api-client";

type RouteInfo = {
    id: number;
    route_name: string;
    description?: string;
    vehicle_number?: string;
    driver_name?: string;
    driver_phone?: string;
};

type ActiveTrip = {
    id: number;
    trip_type: string;
    status: string;
    started_at?: string | null;
    latest_location?: {
        latitude: string;
        longitude: string;
        recorded_at: string;
    } | null;
};

type AssignedStudent = {
    assignment_id: number;
    student_id: number;
    student_name: string;
    class_name?: string;
    pickup_stop?: string;
    drop_stop?: string;
    pickup_time?: string | null;
    drop_time?: string | null;
    status: "WAITING" | "PICKED_UP" | "DROPPED" | "ABSENT";
    status_note?: string;
};

const TOKEN_KEY = "tk-driver-route-token";

function DriverTripContent() {
    const router = useRouter();
    const { user, authFetch, logout: authLogout } = useAuth();
    const searchParams = useSearchParams();
    const [token, setToken] = useState("");
    const [route, setRoute] = useState<RouteInfo | null>(null);
    const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
    const [students, setStudents] = useState<AssignedStudent[]>([]);
    const [tripType, setTripType] = useState<"PICKUP" | "DROP">("PICKUP");
    const [loading, setLoading] = useState(false);
    const [tracking, setTracking] = useState(false);
    const [message, setMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [summary, setSummary] = useState<any | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const wakeLockRef = useRef<any>(null);
    // Guard: prevents stale GPS callbacks from posting after the trip ends
    const tripActiveRef = useRef(false);

    const cleanToken = (value: string) => value.trim();

    const loadRoute = useCallback(async (value?: string) => {
        const nextToken = value ? cleanToken(value) : "";
        
        setLoading(true);
        setMessage("");
        try {
            let data: any;
            if (user?.role === "driver") {
                data = await authFetch("/students/driver/me/trip/");
            } else {
                if (!nextToken) return;
                const res = await fetch(apiUrl(`/students/driver/transport/${nextToken}/`), { cache: "no-store" });
                if (!res.ok) throw new Error("Invalid driver link");
                data = await res.json();
                localStorage.setItem(TOKEN_KEY, nextToken);
                setToken(nextToken);
            }
            
            setRoute(data.route);
            setActiveTrip(data.active_trip);
            setStudents(Array.isArray(data.students) ? data.students : (Array.isArray(data.assigned_students) ? data.assigned_students : []));
        } catch (err) {
            setRoute(null);
            setActiveTrip(null);
            setStudents([]);
            setMessage(err instanceof Error ? err.message : "Could not load route");
        } finally {
            setLoading(false);
        }
    }, [user, authFetch]);

    useEffect(() => {
        const urlToken = searchParams.get("token");
        const saved = localStorage.getItem(TOKEN_KEY);
        let timer: ReturnType<typeof setInterval> | null = null;

        if (user?.role === "driver") {
            void loadRoute();
            timer = setInterval(() => {
                void loadRoute();
            }, 5000);
        } else {
            const effectiveToken = urlToken || saved;
            if (effectiveToken) {
                setToken(effectiveToken);
                void loadRoute(effectiveToken);
                timer = setInterval(() => {
                    void loadRoute(effectiveToken);
                }, 5000);
            } else if (!loading) {
                // No token and not logged in as driver -> redirect to dedicated driver login
                router.push("/driver/login");
            }
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [loadRoute, searchParams]);

    useEffect(() => {
        return () => {
            stopWatching();
            void releaseWakeLock();
        };
    }, []);

    const requestWakeLock = async () => {
        if ("wakeLock" in navigator) {
            try {
                wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
                console.log("Wake Lock is active");
            } catch (err) {
                console.error(`${(err as Error).name}, ${(err as Error).message}`);
            }
        }
    };

    const releaseWakeLock = async () => {
        if (wakeLockRef.current) {
            try {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
                console.log("Wake Lock released");
            } catch (err) {
                console.error(err);
            }
        }
    };

    const submitToken = async (event: FormEvent) => {
        event.preventDefault();
        await loadRoute(token);
    };

    const startTrip = async () => {
        console.log("DEBUG: startTrip called", { token, role: user?.role });
        if (!token && user?.role !== "driver") {
            console.log("DEBUG: startTrip BLOCKED - no token and not driver");
            return;
        }
        
        if (activeTrip && activeTrip.status === "LIVE") {
            if (!confirm("A trip is already active. Starting a new one will complete the current trip. Continue?")) {
                return;
            }
        }

        setLoading(true);
        setMessage("");
        try {
            let data: any;
            if (user?.role === "driver") {
                data = await authFetch("/students/driver/me/trip/start/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify({ trip_type: tripType }),
                });
            } else {
                const res = await fetch(apiUrl(`/students/driver/transport/${cleanToken(token)}/start/`), {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify({ trip_type: tripType }),
                });
                if (!res.ok) throw new Error("Could not start trip");
                data = await res.json();
            }
            tripActiveRef.current = true;
            setActiveTrip(data);
            setSummary(null);
            setMessage("Trip started. GPS sharing active.");
            void requestWakeLock();
            startWatching(data);
            await loadRoute(token);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Could not start trip");
        } finally {
            setLoading(false);
        }
    };

    const postLocation = async (position: GeolocationPosition) => {
        // Guard: if trip has ended, discard any queued GPS callbacks
        if (!tripActiveRef.current) {
            console.log("DEBUG: postLocation skipped — trip no longer active");
            return;
        }
        const coords = position.coords;
        let saved: any;
        
        const payload = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            speed: coords.speed ?? 0,
            heading: coords.heading ?? 0,
            accuracy: coords.accuracy ?? 0,
        };

        try {
            if (user?.role === "driver") {
                saved = await authFetch("/students/driver/me/trip/location/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify(payload),
                });
            } else {
                const res = await fetch(apiUrl(`/students/driver/transport/${cleanToken(token)}/location/`), {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    console.error("Location upload failed:", errData);
                    throw new Error("Location upload failed");
                }
                saved = await res.json();
            }
            
            // Check again after await in case trip ended while request was in-flight
            if (!tripActiveRef.current) return;

            setActiveTrip((prev) =>
                prev
                    ? {
                        ...prev,
                        latest_location: saved,
                    }
                    : prev,
            );
            const timestamp = saved.recorded_at ? new Date(saved.recorded_at).toLocaleTimeString() : new Date().toLocaleTimeString();
            setMessage(`Location sent at ${timestamp}`);
        } catch (err) {
            console.error("Location update error:", err);
            // Don't show error message to user for every background location fail to avoid annoyance
        }
    };

    const startWatching = (currentTripOverride?: any) => {
        console.log("DEBUG: startWatching called");
        if (!navigator.geolocation) {
            setMessage("GPS is not available in this browser.");
            return;
        }
        const currentTrip = currentTripOverride || activeTrip;
        if (!currentTrip) {
            setMessage("Start the trip before GPS sharing.");
            return;
        }
        stopWatching();
        setTracking(true);
        console.log("DEBUG: tracking set to TRUE");

        // Notify server that GPS is active
        if (user?.role === "driver") {
            void authFetch("/students/driver/me/trip/toggle-gps/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ active: true }),
            }).catch(console.error);
        }
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                void postLocation(position).catch((err) => {
                    setMessage(err instanceof Error ? err.message : "Location upload failed");
                });
            },
            (error) => {
                setTracking(false);
                setMessage(error.message || "Location permission failed");
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
        );
    };

    const stopWatching = () => {
        console.log("DEBUG: stopWatching called");
        if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setTracking(false);
        console.log("DEBUG: tracking set to FALSE");

        // Notify server that GPS is stopped
        if (user?.role === "driver") {
            void authFetch("/students/driver/me/trip/toggle-gps/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ active: false }),
            }).catch(console.error);
        }

        setMessage("GPS sharing stopped.");
    };

    const completeTrip = async () => {
        console.log("DEBUG: completeTrip called", { token, role: user?.role, activeTrip });
        // Proceed if we have a token OR we are a logged-in driver
        const canProceed = token.trim() !== "" || user?.role === "driver";
        if (!canProceed) {
            console.log("DEBUG: completeTrip BLOCKED - no token and not driver");
            setMessage("Please login as a driver to complete the trip.");
            return;
        }
        // Immediately mark trip as inactive so any in-flight GPS callbacks are discarded
        tripActiveRef.current = false;
        stopWatching();
        void releaseWakeLock();
        setLoading(true);
        try {
            let data: any;
            if (user?.role === "driver") {
                data = await authFetch("/students/driver/me/trip/complete/", {
                    method: "POST",
                    headers: jsonHeaders(),
                });
            } else {
                const res = await fetch(apiUrl(`/students/driver/transport/${cleanToken(token)}/complete/`), {
                    method: "POST",
                    headers: jsonHeaders(),
                });
                if (!res.ok) throw new Error("Could not complete trip");
                data = await res.json();
            }
            
            // Calculate summary
            const stats = {
                type: data.trip_type,
                picked: students.filter(s => s.status === "PICKED_UP").length,
                dropped: students.filter(s => s.status === "DROPPED").length,
                absent: students.filter(s => s.status === "ABSENT").length,
                total: students.length
            };
            setSummary(stats);
            setActiveTrip(null);
            setMessage("Trip completed.");
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Could not complete trip");
        } finally {
            // Safety net: ensure GPS is always stopped even if API call errored
            stopWatching();
            setLoading(false);
        }
    };

    const updateStudentStatus = async (studentId: number, status: AssignedStudent["status"]) => {
        console.log("DEBUG: updateStudentStatus called", { studentId, status, role: user?.role, activeTrip });
        if (!token && user?.role !== "driver") {
            console.log("DEBUG: updateStudentStatus BLOCKED - no token and not driver");
            return;
        }
        if (!activeTrip || activeTrip.status !== "LIVE") {
            console.log("DEBUG: updateStudentStatus BLOCKED - no live trip", activeTrip);
            setMessage("Start the trip before marking students.");
            return;
        }
        setMessage("");
        try {
            let data: any;
            if (user?.role === "driver") {
                data = await authFetch("/students/driver/me/trip/student-status/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify({ student_id: studentId, status }),
                });
            } else {
                const res = await fetch(apiUrl(`/students/driver/transport/${cleanToken(token)}/student-status/`), {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify({ student_id: studentId, status }),
                });
                if (!res.ok) throw new Error("Could not update student status");
                data = await res.json();
            }
            
            // Haptic feedback
            if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate(50);
            }

            setStudents((prev) =>
                prev.map((student) =>
                    student.student_id === studentId
                        ? { ...student, status: data.status, status_note: data.note || "" }
                        : student,
                ),
            );
            setMessage(`${data.student_name}: ${formatStatus(data.status)}`);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Could not update student status");
        }
    };

    const filteredStudents = students.filter((s) => {
        const query = searchQuery.toLowerCase();
        return (
            s.student_name.toLowerCase().includes(query) ||
            (s.pickup_stop || "").toLowerCase().includes(query) ||
            (s.drop_stop || "").toLowerCase().includes(query) ||
            (s.class_name || "").toLowerCase().includes(query)
        );
    });

    const openNavigation = (stopName?: string) => {
        if (!stopName) return;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stopName)}`;
        window.open(url, "_blank");
    };

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-4 py-4">
            <div className="mx-auto max-w-md space-y-4">
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
                </div>

                <section className="rounded-2xl bg-white border border-orange-100 p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                                <Bus className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-orange-950">Driver Trip</h1>
                                <p className="text-sm text-orange-700">Start route & share GPS.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {user && (
                                <button
                                    onClick={() => {
                                        if (confirm("Are you sure you want to logout?")) {
                                            authLogout();
                                            router.push("/driver/login");
                                        }
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-orange-100 text-[11px] font-bold text-red-600 shadow-sm hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    LOGOUT
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {summary && (
                    <section className="rounded-2xl bg-green-50 border border-green-100 p-5 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle2 className="w-5 h-5" />
                            <h2 className="font-bold">Trip Summary ({summary.type})</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white/60 p-3 rounded-xl text-center">
                                <p className="text-[10px] font-bold text-green-700 uppercase">Picked</p>
                                <p className="text-xl font-bold text-green-900">{summary.picked}</p>
                            </div>
                            <div className="bg-white/60 p-3 rounded-xl text-center">
                                <p className="text-[10px] font-bold text-blue-700 uppercase">Dropped</p>
                                <p className="text-xl font-bold text-blue-900">{summary.dropped}</p>
                            </div>
                            <div className="bg-white/60 p-3 rounded-xl text-center">
                                <p className="text-[10px] font-bold text-gray-600 uppercase">Absent</p>
                                <p className="text-xl font-bold text-gray-900">{summary.absent}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSummary(null)}
                            className="w-full py-2 text-sm font-semibold text-green-800 hover:underline"
                        >
                            Dismiss
                        </button>
                    </section>
                )}

                {!route && !loading && (
                    <section className="rounded-2xl bg-white border border-orange-100 p-8 shadow-sm text-center space-y-4">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                            <Bus className="w-8 h-8 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-orange-950">No Active Route</h2>
                            <p className="text-sm text-orange-700 mt-1">Please login to your driver account to start a trip.</p>
                        </div>
                        <Link 
                            href="/driver/login" 
                            className="block w-full py-3 px-4 bg-[#FF922B] text-white rounded-xl font-bold shadow-sm hover:bg-orange-600 transition-colors"
                        >
                            GO TO LOGIN
                        </Link>
                    </section>
                )}

                {route && (
                    <section className="rounded-2xl bg-white border border-orange-100 p-5 shadow-sm space-y-4">
                        <div>
                            <h2 className="font-bold text-orange-950">{route.route_name}</h2>
                            <p className="text-sm text-orange-700">{route.vehicle_number || "Vehicle not added"}</p>
                            {route.driver_name && <p className="text-sm text-orange-700">Driver: {route.driver_name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setTripType("PICKUP")}
                                className={`rounded-xl px-3 py-2 text-sm font-semibold ${tripType === "PICKUP" ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-800"}`}
                            >
                                Pickup
                            </button>
                            <button
                                type="button"
                                onClick={() => setTripType("DROP")}
                                className={`rounded-xl px-3 py-2 text-sm font-semibold ${tripType === "DROP" ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-800"}`}
                            >
                                Drop
                            </button>
                        </div>

                        <Button onClick={startTrip} disabled={loading} className="w-full bg-green-600 text-white">
                            <Play className="w-4 h-4 mr-2" />
                            Start Trip
                        </Button>

                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={startWatching} disabled={!activeTrip || tracking} className="bg-blue-600 text-white">
                                <Crosshair className="w-4 h-4 mr-2" />
                                Share GPS
                            </Button>
                            <Button onClick={stopWatching} disabled={!tracking} className="bg-gray-700 text-white">
                                <Square className="w-4 h-4 mr-2" />
                                Stop GPS
                            </Button>
                        </div>

                        <Button onClick={completeTrip} disabled={!activeTrip || loading} className="w-full bg-orange-100 text-orange-950">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Complete Trip
                        </Button>
                    </section>
                )}

                {route && (
                    <section className="rounded-2xl bg-white border border-orange-100 p-5 shadow-sm space-y-3">
                        <div>
                            <h2 className="font-bold text-orange-950">Students on this route</h2>
                            <p className="text-sm text-orange-700">Mark status during a live trip.</p>
                        </div>

                        {students.length > 5 && (
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search students or stops..."
                                className="w-full rounded-xl border border-orange-100 bg-orange-50/50 px-3 py-2 text-sm text-orange-950 outline-none focus:border-orange-400"
                            />
                        )}

                        {students.length === 0 && (
                            <p className="rounded-xl bg-orange-50 p-3 text-sm text-orange-800">
                                No students assigned yet. Ask the centre to assign students in Franchise &gt; Parent portal &gt; Transport.
                            </p>
                        )}
                        <ul className="space-y-3">
                            {filteredStudents.map((student) => (
                                <li key={student.assignment_id} className="rounded-xl border border-orange-100 p-3 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-orange-950 truncate">{student.student_name}</p>
                                            <div className="space-y-1">
                                                <p className="text-xs text-orange-700">
                                                    {student.class_name || "Class not set"}
                                                </p>
                                                {tripType === "PICKUP" && student.pickup_stop && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openNavigation(student.pickup_stop)}
                                                        className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline"
                                                    >
                                                        <MapPin className="w-3 h-3" />
                                                        Pickup: {student.pickup_stop}
                                                    </button>
                                                )}
                                                {tripType === "DROP" && student.drop_stop && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openNavigation(student.drop_stop)}
                                                        className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline"
                                                    >
                                                        <MapPin className="w-3 h-3" />
                                                        Drop: {student.drop_stop}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClass(student.status)}`}>
                                            {formatStatus(student.status)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => void updateStudentStatus(student.student_id, "PICKED_UP")}
                                            className="inline-flex items-center justify-center gap-1 rounded-lg bg-green-600 px-2 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                            disabled={!activeTrip || activeTrip.status !== "LIVE"}
                                        >
                                            <UserCheck className="w-3.5 h-3.5" />
                                            Picked
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void updateStudentStatus(student.student_id, "DROPPED")}
                                            className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                            disabled={!activeTrip || activeTrip.status !== "LIVE"}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Dropped
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void updateStudentStatus(student.student_id, "ABSENT")}
                                            className="inline-flex items-center justify-center gap-1 rounded-lg bg-gray-700 px-2 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                            disabled={!activeTrip || activeTrip.status !== "LIVE"}
                                        >
                                            <UserX className="w-3.5 h-3.5" />
                                            Absent
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="rounded-2xl bg-white border border-orange-100 p-4 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-orange-950">GPS status</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tracking ? "bg-green-100 text-green-800" : "bg-orange-50 text-orange-800"}`}>
                            {tracking ? "Sharing" : "Stopped"}
                        </span>
                    </div>
                    {activeTrip?.latest_location ? (
                        <p className="flex items-center gap-2 text-xs text-orange-700">
                            <MapPin className="w-3.5 h-3.5" />
                            Last sent: {activeTrip.latest_location.recorded_at ? new Date(activeTrip.latest_location.recorded_at).toLocaleString() : "Just now"}
                        </p>
                    ) : (
                        <p className="text-xs text-orange-700">No location sent yet.</p>
                    )}
                    {loading && (
                        <p className="flex items-center gap-2 text-xs text-orange-700">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Working...
                        </p>
                    )}
                    {message && <p className="text-sm text-orange-800">{message}</p>}
                </section>
            </div>
        </main>
    );
}

export default function DriverTripPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FFF8ED] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        }>
            <DriverTripContent />
        </Suspense>
    );
}

function formatStatus(value: string) {
    return value
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function statusClass(value: string) {
    if (value === "PICKED_UP") return "bg-green-100 text-green-800";
    if (value === "DROPPED") return "bg-blue-100 text-blue-800";
    if (value === "ABSENT") return "bg-gray-100 text-gray-800";
    return "bg-orange-100 text-orange-800";
}

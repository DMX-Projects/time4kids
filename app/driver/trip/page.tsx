"use client";

import { FormEvent, useCallback, useEffect, useRef, useState, Suspense } from "react";
import { Bus, CheckCircle2, Crosshair, Loader2, MapPin, Play, Square, UserCheck, UserX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
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

    const cleanToken = (value: string) => value.trim();

    const loadRoute = useCallback(async (value: string) => {
        const nextToken = cleanToken(value);
        if (!nextToken) return;
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch(apiUrl(`/students/driver/transport/${nextToken}/`), { cache: "no-store" });
            if (!res.ok) throw new Error("Invalid driver link");
            const data = await res.json();
            setRoute(data.route);
            setActiveTrip(data.active_trip);
            setStudents(Array.isArray(data.assigned_students) ? data.assigned_students : []);
            localStorage.setItem(TOKEN_KEY, nextToken);
            setToken(nextToken);
        } catch (err) {
            setRoute(null);
            setActiveTrip(null);
            setStudents([]);
            setMessage(err instanceof Error ? err.message : "Could not load route");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const urlToken = searchParams.get("token");
        const saved = localStorage.getItem(TOKEN_KEY);
        let timer: ReturnType<typeof setInterval> | null = null;

        const effectiveToken = urlToken || saved;

        if (effectiveToken) {
            setToken(effectiveToken);
            void loadRoute(effectiveToken);
            // Auto refresh student list every 30 seconds
            timer = setInterval(() => {
                void loadRoute(effectiveToken);
            }, 30000);
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
        if (!token) return;
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch(apiUrl(`/students/driver/transport/${cleanToken(token)}/start/`), {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ trip_type: tripType }),
            });
            if (!res.ok) throw new Error("Could not start trip");
            const data = await res.json();
            setActiveTrip(data);
            setSummary(null);
            setMessage("Trip started. GPS sharing active.");
            void requestWakeLock();
            startWatching();
            await loadRoute(token);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : "Could not start trip");
        } finally {
            setLoading(false);
        }
    };

    const postLocation = async (position: GeolocationPosition) => {
        const coords = position.coords;
        const res = await fetch(apiUrl(`/students/driver/transport/${cleanToken(token)}/location/`), {
            method: "POST",
            headers: jsonHeaders(),
            body: JSON.stringify({
                latitude: coords.latitude,
                longitude: coords.longitude,
                speed: coords.speed,
                heading: coords.heading,
                accuracy: coords.accuracy,
            }),
        });
        if (!res.ok) throw new Error("Location upload failed");
        const saved = await res.json();
        setActiveTrip((prev) =>
            prev
                ? {
                      ...prev,
                      latest_location: saved,
                  }
                : prev,
        );
        setMessage(`Location sent at ${new Date(saved.recorded_at).toLocaleTimeString()}`);
    };

    const startWatching = () => {
        if (!navigator.geolocation) {
            setMessage("GPS is not available in this browser.");
            return;
        }
        if (!activeTrip) {
            setMessage("Start the trip before GPS sharing.");
            return;
        }
        stopWatching();
        setTracking(true);
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
        if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setTracking(false);
    };

    const completeTrip = async () => {
        if (!token) return;
        setLoading(true);
        try {
            stopWatching();
            void releaseWakeLock();
            const res = await fetch(apiUrl(`/students/driver/transport/${cleanToken(token)}/complete/`), {
                method: "POST",
                headers: jsonHeaders(),
            });
            if (!res.ok) throw new Error("Could not complete trip");
            const data = await res.json();
            
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
            setLoading(false);
        }
    };

    const updateStudentStatus = async (studentId: number, status: AssignedStudent["status"]) => {
        if (!token) return;
        if (!activeTrip || activeTrip.status !== "LIVE") {
            setMessage("Start the trip before marking students.");
            return;
        }
        setMessage("");
        try {
            const res = await fetch(apiUrl(`/students/driver/transport/${cleanToken(token)}/student-status/`), {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ student_id: studentId, status }),
            });
            if (!res.ok) throw new Error("Could not update student status");
            const data = await res.json();
            
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
        <main className="min-h-screen bg-[#FFF8ED] px-4 py-6">
            <div className="mx-auto max-w-md space-y-5">
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
                        {route && (
                            <button 
                                onClick={() => void loadRoute(token)}
                                className="p-2 rounded-full hover:bg-orange-50 text-orange-600 transition-colors"
                                title="Refresh data"
                            >
                                <Loader2 className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                            </button>
                        )}
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

                <form onSubmit={submitToken} className="rounded-2xl bg-white border border-orange-100 p-4 shadow-sm space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wide text-orange-800">
                        Driver token
                        <input
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste route driver token"
                            className="mt-1 w-full rounded-xl border border-orange-100 px-3 py-3 text-sm text-orange-950 outline-none focus:border-orange-400"
                        />
                    </label>
                    <Button type="submit" disabled={loading || !token.trim()} className="w-full bg-[#FF922B] text-white">
                        {loading ? "Loading..." : "Load route"}
                    </Button>
                </form>

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
                            Last sent: {new Date(activeTrip.latest_location.recorded_at).toLocaleString()}
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

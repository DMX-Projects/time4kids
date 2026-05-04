"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Bus, CheckCircle2, ChevronDown, Crosshair, Loader2, LogOut, MapPin, Play, Square, UserCheck, UserX } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import { apiUrl, jsonHeaders } from "@/lib/api-client";
import { StudentList } from "./StudentList";
import { RouteInfo, ActiveTrip, AssignedStudent } from "./types";

const TOKEN_KEY = "tk-driver-route-token";

export function DriverTripContent() {
    const router = useRouter();
    const { user, loading: authLoading, authFetch, logout: authLogout } = useAuth();
    const searchParams = useSearchParams();
    const [token, setToken] = useState("");
    const [route, setRoute] = useState<RouteInfo | null>(null);
    const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
    const [students, setStudents] = useState<AssignedStudent[]>([]);
    const [tripType, setTripType] = useState<"PICKUP" | "DROP">("PICKUP");
    const [loading, setLoading] = useState(false);
    const [tracking, setTracking] = useState(false);
    const { showToast } = useToast();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isCompleteTripModalOpen, setIsCompleteTripModalOpen] = useState(false);
    const [allRoutes, setAllRoutes] = useState<any[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string>("");
    const [isRouteDrawerOpen, setIsRouteDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [summary, setSummary] = useState<any | null>(null);
    const [message, setMessage] = useState("");
    const watchIdRef = useRef<number | null>(null);
    const wakeLockRef = useRef<any>(null);
    const tripActiveRef = useRef(false);

    const cleanToken = (value: string) => value.trim();

    const loadRoute = useCallback(async (value?: string) => {
        const nextToken = value ? cleanToken(value) : "";
        setLoading(true);
        try {
            let data: any;
            if (user?.role === "driver") {
                data = await authFetch(`/students/driver/me/trip/${selectedRouteId ? `?route_id=${selectedRouteId}` : ""}`, { cache: "no-store" });
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
            if (data.all_routes) setAllRoutes(data.all_routes);
            if (data.route && !selectedRouteId) setSelectedRouteId(String(data.route.id));
        } catch (err) {
            setRoute(null);
            setActiveTrip(null);
            setStudents([]);
            showToast(err instanceof Error ? err.message : "Could not load route", "error");
        } finally {
            setLoading(false);
        }
    }, [user, authFetch, selectedRouteId, showToast]);

    useEffect(() => {
        const urlToken = searchParams.get("token");
        const saved = localStorage.getItem(TOKEN_KEY);
        let timer: ReturnType<typeof setInterval> | null = null;

        if (authLoading) return;

        if (user?.role === "driver") {
            void loadRoute();
            timer = setInterval(() => { void loadRoute(); }, 5000);
        } else {
            const effectiveToken = urlToken || saved;
            if (effectiveToken) {
                setToken(effectiveToken);
                void loadRoute(effectiveToken);
                timer = setInterval(() => { void loadRoute(effectiveToken); }, 5000);
            } else if (!loading && !authLoading) {
                router.push("/driver/login");
            }
        }
        return () => { if (timer) clearInterval(timer); };
    }, [loadRoute, searchParams, authLoading, user, loading, router]);

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

    const startWatching = (currentTripOverride?: any) => {
        if (!navigator.geolocation) {
            setMessage("GPS not available.");
            return;
        }
        const currentTrip = currentTripOverride || activeTrip;
        if (!currentTrip) {
            setMessage("Start the trip first.");
            return;
        }
        if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        setTracking(true);
        
        const togglePayload = { active: true, route_id: selectedRouteId || route?.id };
        if (user?.role === "driver") {
            void authFetch("/students/driver/me/trip/toggle-gps/", { method: "POST", headers: jsonHeaders(), body: JSON.stringify(togglePayload) });
        }
        
        watchIdRef.current = navigator.geolocation.watchPosition(
            async (pos) => {
                if (!tripActiveRef.current) return;
                const payload = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, speed: pos.coords.speed || 0, route_id: selectedRouteId || route?.id };
                try {
                    const saved = await authFetch<any>("/students/driver/me/trip/location/", { method: "POST", headers: jsonHeaders(), body: JSON.stringify(payload) });
                    setActiveTrip(prev => prev ? { ...prev, latest_location: saved } : prev);
                    setMessage(`Location sent at ${new Date().toLocaleTimeString()}`);
                } catch (e) { console.error(e); }
            },
            (err) => { setTracking(false); showToast(err.message, "error"); },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        );
    };

    const stopWatching = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setTracking(false);
        const togglePayload = { active: false, route_id: selectedRouteId || route?.id };
        if (user?.role === "driver") {
            void authFetch("/students/driver/me/trip/toggle-gps/", { method: "POST", headers: jsonHeaders(), body: JSON.stringify(togglePayload) });
        }
    };

    const startTrip = async () => {
        setLoading(true);
        try {
            const data = await authFetch<ActiveTrip>("/students/driver/me/trip/start/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ trip_type: tripType, route_id: selectedRouteId || route?.id }),
            });
            tripActiveRef.current = true;
            setActiveTrip(data);
            setSummary(null);
            showToast("Trip started", "success");
            void requestWakeLock();
            startWatching(data);
            await loadRoute();
        } catch (err) {
            showToast("Could not start trip", "error");
        } finally {
            setLoading(false);
        }
    };

    const completeTrip = async () => {
        tripActiveRef.current = false;
        stopWatching();
        void releaseWakeLock();
        setLoading(true);
        try {
            const data = await authFetch<any>("/students/driver/me/trip/complete/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ route_id: selectedRouteId || route?.id })
            });
            setSummary({ type: data.trip_type, picked: students.filter(s => s.status === "PICKED_UP").length, total: students.length });
            setActiveTrip(null);
            showToast("Trip completed", "success");
        } catch (err) {
            showToast("Could not complete trip", "error");
        } finally {
            setLoading(false);
            setIsCompleteTripModalOpen(false);
        }
    };

    const updateStudentStatus = async (studentId: number, status: string) => {
        if (!activeTrip) return showToast("Start trip first", "error");
        try {
            const data = await authFetch<any>("/students/driver/me/trip/student-status/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ student_id: studentId, status, route_id: selectedRouteId || route?.id }),
            });
            setStudents(prev => prev.map(s => s.student_id === studentId ? { ...s, status: data.status as AssignedStudent["status"] } : s));
            showToast(`Updated: ${data.status}`, "info");
        } catch (e) { showToast("Update failed", "error"); }
    };

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-4 py-4">
            <div className="mx-auto max-w-md space-y-4 pb-10">
                <div className="flex items-center justify-between px-1">
                    <Link href="/">
                        <Image src="/time-kids-logo-new.png" alt="T.I.M.E. Kids Logo" width={120} height={48} className="h-10 w-auto object-contain" priority />
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
                                {allRoutes.length > 1 && (
                                    <div className="mt-1">
                                        <button
                                            disabled={tracking || activeTrip?.status === "LIVE"}
                                            onClick={() => setIsRouteDrawerOpen(true)}
                                            className="bg-orange-50 border border-orange-100 text-orange-900 text-[11px] font-bold rounded-full px-3 py-1 flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
                                        >
                                            <Bus className="w-3 h-3" />
                                            {allRoutes.find(r => String(r.id) === selectedRouteId)?.route_name || "Select Route"}
                                            <ChevronDown className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                                <p className="text-sm text-orange-700">Start route & share GPS.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {user && (
                                <button
                                    onClick={() => setIsLogoutModalOpen(true)}
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
                            <h2 className="font-bold">Trip Summary</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/60 p-3 rounded-xl text-center">
                                <p className="text-[10px] font-bold text-green-700 uppercase">Picked</p>
                                <p className="text-xl font-bold text-green-900">{summary.picked}/{summary.total}</p>
                            </div>
                            <button onClick={() => setSummary(null)} className="w-full py-2 text-sm font-semibold text-green-800 hover:underline">Dismiss</button>
                        </div>
                    </section>
                )}

                {route && (
                    <section className="rounded-2xl bg-white border border-orange-100 p-5 shadow-sm space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight uppercase">{route.route_name}</h2>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded-md">🚌 {route.vehicle_number || "No Vehicle"}</p>
                                {route.destination && (
                                    <p className="text-sm font-bold text-orange-600 uppercase flex items-center gap-1.5 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                                        <MapPin className="w-4 h-4" /> To: {route.destination}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setTripType("PICKUP")} className={`rounded-xl px-3 py-2 text-sm font-semibold ${tripType === "PICKUP" ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-800"}`}>Pickup</button>
                            <button onClick={() => setTripType("DROP")} className={`rounded-xl px-3 py-2 text-sm font-semibold ${tripType === "DROP" ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-800"}`}>Drop</button>
                        </div>

                        {!activeTrip ? (
                            <Button onClick={startTrip} disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold">
                                <Play className="w-4 h-4 mr-2" /> Start Trip
                            </Button>
                        ) : (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={tracking ? stopWatching : () => startWatching()} className={`flex-1 ${tracking ? "bg-red-500" : "bg-blue-600"} text-white`}>
                                        {tracking ? <><Square className="w-4 h-4 mr-2" /> Stop GPS</> : <><Crosshair className="w-4 h-4 mr-2" /> Share GPS</>}
                                    </Button>
                                    <Button onClick={() => setIsCompleteTripModalOpen(true)} className="bg-orange-100 text-orange-950">
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> End Trip
                                    </Button>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                <div className="px-1"><h2 className="font-bold text-orange-950">Students on this route</h2></div>
                <StudentList students={students} onStatusChange={updateStudentStatus} activeTrip={activeTrip} tripType={tripType} />
                
                <section className="rounded-2xl bg-white border border-orange-100 p-4 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-orange-950">GPS status</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tracking ? "bg-green-100 text-green-800" : "bg-orange-50 text-orange-800"}`}>
                            {tracking ? "Sharing" : "Stopped"}
                        </span>
                    </div>
                    {message && <p className="text-[10px] text-orange-600 font-medium">{message}</p>}
                </section>
            </div>

            <Drawer isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Logout">
                <div className="p-4 space-y-4">
                    <p className="text-gray-600 text-sm">Are you sure you want to logout? You will need to login again to start your next trip.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 text-white" onClick={() => { authLogout(); router.push("/driver/login"); }}>Logout</Button>
                    </div>
                </div>
            </Drawer>

            <Drawer isOpen={isCompleteTripModalOpen} onClose={() => setIsCompleteTripModalOpen(false)} title="End Trip">
                <div className="p-4 space-y-4">
                    <p className="text-gray-600 text-sm">Finishing the route will stop GPS sharing and notify the centre. Complete now?</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={() => setIsCompleteTripModalOpen(false)}>Not yet</Button>
                        <Button className="bg-[#FF922B] text-white" onClick={completeTrip}>Yes, Complete</Button>
                    </div>
                </div>
            </Drawer>

            <Modal isOpen={isRouteDrawerOpen} onClose={() => setIsRouteDrawerOpen(false)} title="Select Route" size="sm">
                <div className="space-y-3 p-2">
                    {allRoutes.map((r) => (
                        <button key={r.id} onClick={() => { setSelectedRouteId(String(r.id)); setIsRouteDrawerOpen(false); void loadRoute(); }}
                            className={`w-full text-left p-4 rounded-xl border ${selectedRouteId === String(r.id) ? "bg-orange-50 border-orange-200" : "bg-white border-gray-100"}`}>
                            <p className="font-bold text-gray-900">{r.route_name}</p>
                            <p className="text-xs text-gray-500">{r.vehicle_number}</p>
                        </button>
                    ))}
                </div>
            </Modal>
        </main>
    );
}

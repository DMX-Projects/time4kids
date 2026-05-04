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

    const formatStatus = (s: string) => s.replace("_", " ");
    const statusClass = (s: string) => s === "WAITING" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800";

    return (
        <main className="min-h-screen bg-[#FFF8ED] px-4 py-4">
            <div className="mx-auto max-w-md space-y-4 pb-20">
                <div className="flex items-center justify-between">
                    <Link href="/"><Image src="/time-kids-logo-new.png" alt="Logo" width={100} height={40} className="h-8 w-auto" priority /></Link>
                </div>

                <section className="rounded-2xl bg-white border border-orange-100 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Bus className="w-5 h-5" /></div>
                            <div>
                                <h1 className="font-bold text-gray-900">{route?.route_name || "Loading..."}</h1>
                                <button onClick={() => setIsRouteDrawerOpen(true)} className="text-xs font-bold text-orange-600 uppercase flex items-center gap-1">Change Route <ChevronDown className="w-3 h-3" /></button>
                            </div>
                        </div>
                        <button onClick={() => setIsLogoutModalOpen(true)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><LogOut className="w-5 h-5" /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setTripType("PICKUP")} className={`py-2 rounded-xl text-sm font-bold ${tripType === "PICKUP" ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-950"}`}>Pickup</button>
                        <button onClick={() => setTripType("DROP")} className={`py-2 rounded-xl text-sm font-bold ${tripType === "DROP" ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-950"}`}>Drop</button>
                    </div>

                    {!activeTrip ? (
                        <Button onClick={startTrip} disabled={loading} className="w-full h-12 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-100">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Play className="w-5 h-5 mr-2" /> Start Trip</>}
                        </Button>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Button onClick={tracking ? stopWatching : () => startWatching()} className={`flex-1 h-12 rounded-xl font-bold ${tracking ? "bg-red-500 text-white" : "bg-blue-600 text-white"}`}>
                                    {tracking ? <><Square className="w-5 h-5 mr-2" /> Stop GPS</> : <><Crosshair className="w-5 h-5 mr-2" /> Share GPS</>}
                                </Button>
                            </div>
                            <Button onClick={() => setIsCompleteTripModalOpen(true)} variant="outline" className="w-full h-12 rounded-xl font-bold border-orange-200 text-orange-900 bg-orange-50">
                                <CheckCircle2 className="w-5 h-5 mr-2" /> Complete Trip
                            </Button>
                        </div>
                    )}
                </section>

                {summary && (
                    <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center justify-between">
                        <p className="text-green-800 text-sm font-bold">Trip completed! Picked: {summary.picked}/{summary.total}</p>
                        <button onClick={() => setSummary(null)} className="text-green-900 text-xs font-bold underline">Close</button>
                    </div>
                )}

                <div className="px-1"><h2 className="font-bold text-gray-900">Student List</h2></div>
                <StudentList students={students} onStatusChange={updateStudentStatus} />
            </div>

            <Drawer isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Logout">
                <div className="p-4 space-y-4">
                    <p className="text-gray-600">Are you sure you want to logout from the driver portal?</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 text-white" onClick={() => { authLogout(); router.push("/driver/login"); }}>Logout</Button>
                    </div>
                </div>
            </Drawer>

            <Drawer isOpen={isCompleteTripModalOpen} onClose={() => setIsCompleteTripModalOpen(false)} title="End Trip">
                <div className="p-4 space-y-4">
                    <p className="text-gray-600">Are you sure you want to complete this trip? This will stop GPS sharing.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={() => setIsCompleteTripModalOpen(false)}>Not yet</Button>
                        <Button className="bg-orange-500 text-white" onClick={completeTrip}>Yes, End Trip</Button>
                    </div>
                </div>
            </Drawer>

            <Modal isOpen={isRouteDrawerOpen} onClose={() => setIsRouteDrawerOpen(false)} title="Switch Route">
                <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                    {allRoutes.map(r => (
                        <button key={r.id} onClick={() => { setSelectedRouteId(String(r.id)); setIsRouteDrawerOpen(false); void loadRoute(); }} 
                            className={`w-full p-4 rounded-xl text-left border transition-all ${selectedRouteId === String(r.id) ? "bg-orange-50 border-orange-200" : "bg-white border-gray-100"}`}>
                            <p className="font-bold text-gray-900">{r.route_name}</p>
                            <p className="text-xs text-gray-500">{r.vehicle_number}</p>
                        </button>
                    ))}
                </div>
            </Modal>
        </main>
    );
}

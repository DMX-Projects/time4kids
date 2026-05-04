"use client";

import { CheckCircle2, MapPin, UserCheck, UserX } from "lucide-react";
import { AssignedStudent, ActiveTrip } from "./types";

interface StudentListProps {
    students: AssignedStudent[];
    onStatusChange: (studentId: number, status: string) => void;
    activeTrip: ActiveTrip | null;
    tripType: "PICKUP" | "DROP";
}

export function StudentList({ students, onStatusChange, activeTrip, tripType }: StudentListProps) {
    if (students.length === 0) {
        return (
            <p className="rounded-xl bg-orange-50 p-4 text-sm text-orange-800 border border-orange-100">
                No students assigned yet. Ask the centre to assign students in Franchise &gt; Parent portal &gt; Transport.
            </p>
        );
    }

    const formatStatus = (s: string) => s.replace("_", " ");
    const statusClass = (s: string) => {
        if (s === "PICKED_UP") return "bg-green-100 text-green-800";
        if (s === "DROPPED") return "bg-blue-100 text-blue-800";
        if (s === "ABSENT") return "bg-gray-100 text-gray-800";
        return "bg-orange-100 text-orange-800";
    };

    const openNavigation = (stopName?: string) => {
        if (!stopName) return;
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stopName)}`, "_blank");
    };

    return (
        <ul className="space-y-3">
            {students.map((student) => (
                <li key={student.assignment_id} className="rounded-xl bg-white border border-orange-100 p-4 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-orange-950 truncate">{student.student_name}</p>
                            <div className="space-y-1 mt-1">
                                <p className="text-xs text-orange-700">{student.class_name || "Class not set"}</p>
                                {tripType === "PICKUP" && student.pickup_stop && (
                                    <button onClick={() => openNavigation(student.pickup_stop)} className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline text-left">
                                        <MapPin className="w-3 h-3" /> Pickup: {student.pickup_stop}
                                    </button>
                                )}
                                {tripType === "DROP" && student.drop_stop && (
                                    <button onClick={() => openNavigation(student.drop_stop)} className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline text-left">
                                        <MapPin className="w-3 h-3" /> Drop: {student.drop_stop}
                                    </button>
                                )}
                            </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClass(student.status)}`}>
                            {formatStatus(student.status)}
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => onStatusChange(student.student_id, "PICKED_UP")} disabled={!activeTrip}
                            className="flex items-center justify-center gap-1 rounded-lg bg-green-600 px-2 py-2 text-xs font-semibold text-white disabled:opacity-50 active:scale-95 transition-transform">
                            <UserCheck className="w-3.5 h-3.5" /> Picked
                        </button>
                        <button onClick={() => onStatusChange(student.student_id, "DROPPED")} disabled={!activeTrip}
                            className="flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white disabled:opacity-50 active:scale-95 transition-transform">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Dropped
                        </button>
                        <button onClick={() => onStatusChange(student.student_id, "ABSENT")} disabled={!activeTrip}
                            className="flex items-center justify-center gap-1 rounded-lg bg-gray-700 px-2 py-2 text-xs font-semibold text-white disabled:opacity-50 active:scale-95 transition-transform">
                            <UserX className="w-3.5 h-3.5" /> Absent
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}

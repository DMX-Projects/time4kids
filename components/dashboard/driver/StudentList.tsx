"use client";

import { CheckCircle2 } from "lucide-react";
import { AssignedStudent } from "./types";

interface StudentListProps {
    students: AssignedStudent[];
    onStatusChange: (studentId: number, status: string) => void;
}

export function StudentList({ students, onStatusChange }: StudentListProps) {
    if (students.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-orange-100/50">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👥</span>
                </div>
                <p className="text-gray-500 font-medium">No students assigned to this route.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-24">
            {students.map((student) => (
                <div
                    key={student.assignment_id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-orange-200 transition-all"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                {student.student_name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 leading-tight">{student.student_name}</h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    {student.class_name || "No Class"} • {student.pickup_stop || "No Stop"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {student.status === "WAITING" ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onStatusChange(student.assignment_id, "PICKED_UP")}
                                        className="bg-green-50 text-green-700 p-2 rounded-xl hover:bg-green-100 transition-colors border border-green-100"
                                        title="Mark Picked Up"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => onStatusChange(student.assignment_id, "ABSENT")}
                                        className="bg-red-50 text-red-700 p-2 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                                        title="Mark Absent"
                                    >
                                        <span className="text-lg font-bold leading-none">×</span>
                                    </button>
                                </div>
                            ) : (
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClass(student.status)}`}>
                                    {student.status}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function statusClass(value: string) {
    if (value === "PICKED_UP") return "bg-green-100 text-green-800";
    if (value === "DROPPED") return "bg-blue-100 text-blue-800";
    if (value === "ABSENT") return "bg-gray-100 text-gray-800";
    return "bg-orange-100 text-orange-800";
}

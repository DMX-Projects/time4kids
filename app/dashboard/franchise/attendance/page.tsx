"use client";

import { useEffect, useState } from "react";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";
import { CalendarDays, Save, CheckCircle, AlertCircle } from "lucide-react";

const toLocalYYYYMMDD = (d: Date) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
};

export default function FranchiseAttendancePage() {
    const { students, attendance, loadAttendance, markAttendance } = useSchoolData();
    const [selectedDate, setSelectedDate] = useState(toLocalYYYYMMDD(new Date()));
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // local state to hold attendance edits before saving
    // key is studentId
    const [edits, setEdits] = useState<Record<string, { status: string, note: string }>>({});
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

    useEffect(() => {
        const fetchAtt = async () => {
            setLoading(true);
            await loadAttendance(selectedDate);
            setLoading(false);
        };
        fetchAtt();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    useEffect(() => {
        // Initialize edits from fetched attendance
        const initialEdits: Record<string, { status: string, note: string }> = {};
        for (const record of attendance) {
            initialEdits[record.studentId] = {
                status: record.status,
                note: record.note || "",
            };
        }
        setEdits(initialEdits);
        setMessage(null);
    }, [attendance, selectedDate]);

    const handleStatusChange = (studentId: string, status: string) => {
        setEdits(prev => ({
            ...prev,
            [studentId]: {
                status,
                note: prev[studentId]?.note || ""
            }
        }));
    };

    const handleNoteChange = (studentId: string, note: string) => {
        setEdits(prev => ({
            ...prev,
            [studentId]: {
                status: prev[studentId]?.status || "PRESENT",
                note
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            // only save those that are edited
            const toSave = Object.entries(edits).map(([studentId, data]) => ({
                studentId,
                date: selectedDate,
                status: data.status as any,
                note: data.note
            }));
            
            await markAttendance(toSave);
            setMessage({ type: "success", text: "Attendance saved successfully." });
        } catch (err) {
            setMessage({ type: "error", text: "Failed to save attendance." });
        } finally {
            setSaving(false);
        }
    };

    const markAllPresent = () => {
        const next = { ...edits };
        students.forEach(s => {
            if (!next[s.id]) {
                 next[s.id] = { status: "PRESENT", note: "" };
            } else {
                 next[s.id].status = "PRESENT";
            }
        });
        setEdits(next);
    };

    const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="space-y-6">
            <section className="bg-white border text-black border-orange-100 rounded-2xl shadow-sm p-6 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Mark Attendance</h1>
                        <p className="text-sm text-gray-500">Record daily attendance for students at your centre.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end gap-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Select Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="block w-full sm:w-48 px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                         <button 
                             onClick={markAllPresent} 
                             className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                         >
                             Mark All Present
                         </button>
                         <button 
                             onClick={handleSave} 
                             disabled={saving || sortedStudents.length === 0}
                             className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                         >
                             <Save className="w-4 h-4" />
                             {saving ? "Saving..." : "Save Attendance"}
                         </button>
                    </div>
                </div>
            </section>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="bg-white border border-orange-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-orange-50 text-orange-900 border-b border-orange-100">
                            <tr>
                                <th className="p-4 font-semibold shrink-0">Roll No</th>
                                <th className="p-4 font-semibold min-w-[200px]">Student Name</th>
                                <th className="p-4 font-semibold shrink-0">Grade</th>
                                <th className="p-4 font-semibold min-w-[170px]">Status</th>
                                <th className="p-4 font-semibold w-full">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500 py-8">Loading students and attendance...</td>
                                </tr>
                            ) : sortedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500 py-8">No students found. Add students first.</td>
                                </tr>
                            ) : (
                                sortedStudents.map((s) => {
                                    const edit = edits[s.id] || {};
                                    const status = edit.status || "PRESENT";
                                    return (
                                        <tr key={s.id} className="hover:bg-orange-50/50 transition-colors">
                                            <td className="p-4 text-gray-900 font-medium">{s.rollNumber}</td>
                                            <td className="p-4 text-gray-900">{s.name}</td>
                                            <td className="p-4 text-gray-600">{s.grade}</td>
                                            <td className="p-4">
                                                <select
                                                    value={status}
                                                    onChange={(e) => handleStatusChange(s.id, e.target.value)}
                                                    className={`px-3 border py-2 rounded-lg text-sm font-semibold w-full max-w-[150px] outline-none transition-colors
                                                        ${status === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                          status === 'ABSENT' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                          status === 'LATE' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                                          'bg-gray-50 text-gray-700 border-gray-200'}`}
                                                >
                                                    <option value="PRESENT">Present</option>
                                                    <option value="ABSENT">Absent</option>
                                                    <option value="LATE">Late</option>
                                                    <option value="EXCUSED">Excused</option>
                                                    <option value="HOLIDAY">Holiday</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="text"
                                                    value={edit.note || ""}
                                                    onChange={(e) => handleNoteChange(s.id, e.target.value)}
                                                    placeholder="Optional note..."
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-black text-sm outline-none transition-colors"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

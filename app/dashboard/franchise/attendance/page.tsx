"use client";

import { useEffect, useMemo, useState } from "react";
import {
    useSchoolData,
    type AttendanceRecord,
    type SchoolStudent,
} from "@/components/dashboard/shared/SchoolDataProvider";
import { CalendarDays, Save, CheckCircle, AlertCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";

const ATTENDANCE_PAGE_SIZE = 100;

type AttendanceStatus = AttendanceRecord["status"];

const ATTENDANCE_STATUSES: readonly AttendanceStatus[] = [
    "PRESENT",
    "ABSENT",
    "LATE",
    "EXCUSED",
    "HOLIDAY",
];

function isAttendanceStatus(value: string): value is AttendanceStatus {
    return (ATTENDANCE_STATUSES as readonly string[]).includes(value);
}

type AttendanceEdit = { status: AttendanceStatus | ""; note: string };

const toLocalYYYYMMDD = (d: Date) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
};

const STATUS_LABELS: Record<AttendanceStatus, string> = {
    PRESENT: "Present",
    ABSENT: "Absent",
    LATE: "Late",
    EXCUSED: "Excused",
    HOLIDAY: "Holiday",
};

const csvCell = (value: string) => `"${String(value).replace(/"/g, '""')}"`;

function downloadAttendanceCsv(
    records: Omit<AttendanceRecord, "id">[],
    students: SchoolStudent[],
    date: string,
) {
    const byId = new Map(students.map((s) => [s.id, s]));
    const header = ["Date", "Roll No", "Student Name", "Class", "Status", "Note"];
    const rows = records.map((r) => {
        const student = byId.get(r.studentId);
        const status = isAttendanceStatus(r.status) ? STATUS_LABELS[r.status] : r.status;
        return [
            r.date || date,
            student?.rollNumber ?? "",
            student?.name ?? "",
            student?.grade ?? "",
            status,
            r.note ?? "",
        ];
    });
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${date}-${records.length}-students.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

export default function FranchiseAttendancePage() {
    const { students, attendance, loadAttendance, markAttendance } = useSchoolData();
    const [selectedDate, setSelectedDate] = useState(toLocalYYYYMMDD(new Date()));
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // local state to hold attendance edits before saving
    // key is studentId
    const [edits, setEdits] = useState<Record<string, AttendanceEdit>>({});
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
    const [currentPage, setCurrentPage] = useState(1);

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
        const byStudent = new Map(attendance.map((r) => [r.studentId, r]));
        const initialEdits: Record<string, AttendanceEdit> = {};
        for (const s of students) {
            const existing = byStudent.get(s.id);
            initialEdits[s.id] = {
                status: existing?.status ?? "",
                note: existing?.note ?? "",
            };
        }
        setEdits(initialEdits);
        setDirtyIds(new Set());
        setMessage(null);
    }, [attendance, selectedDate, students]);

    const markDirty = (studentId: string) => {
        setDirtyIds((prev) => {
            const next = new Set(prev);
            next.add(studentId);
            return next;
        });
    };

    const handleStatusChange = (studentId: string, status: AttendanceStatus | "") => {
        markDirty(studentId);
        setEdits((prev) => ({
            ...prev,
            [studentId]: {
                status,
                note: prev[studentId]?.note || "",
            },
        }));
    };

    const handleNoteChange = (studentId: string, note: string) => {
        markDirty(studentId);
        setEdits((prev) => ({
            ...prev,
            [studentId]: {
                status: prev[studentId]?.status ?? "",
                note,
            },
        }));
    };

    const sortedStudents = useMemo(
        () => [...students].sort((a, b) => a.name.localeCompare(b.name)),
        [students],
    );

    const classOptions = useMemo(() => {
        const grades = new Set(sortedStudents.map((s) => s.grade.trim()).filter(Boolean));
        return Array.from(grades).sort((a, b) => a.localeCompare(b));
    }, [sortedStudents]);

    const isFiltered = searchQuery.trim() !== "" || classFilter !== "";

    const displayStudents = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return sortedStudents.filter((s) => {
            if (classFilter && s.grade !== classFilter) return false;
            if (!q) return true;
            return (
                s.name.toLowerCase().includes(q) ||
                s.rollNumber.toLowerCase().includes(q) ||
                s.grade.toLowerCase().includes(q)
            );
        });
    }, [sortedStudents, searchQuery, classFilter]);

    const totalPages = Math.max(1, Math.ceil(displayStudents.length / ATTENDANCE_PAGE_SIZE));

    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * ATTENDANCE_PAGE_SIZE;
        return displayStudents.slice(start, start + ATTENDANCE_PAGE_SIZE);
    }, [displayStudents, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, classFilter, selectedDate]);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const pageRangeLabel = useMemo(() => {
        if (displayStudents.length === 0) return "0 students";
        const start = (currentPage - 1) * ATTENDANCE_PAGE_SIZE + 1;
        const end = Math.min(currentPage * ATTENDANCE_PAGE_SIZE, displayStudents.length);
        return `${start}–${end} of ${displayStudents.length}`;
    }, [currentPage, displayStudents.length]);

    const saveTargets = isFiltered ? displayStudents : sortedStudents;

    const markedOnDateCount = useMemo(
        () => sortedStudents.filter((s) => (edits[s.id]?.status || "") !== "").length,
        [sortedStudents, edits],
    );

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const toSave: Omit<AttendanceRecord, "id">[] = saveTargets.flatMap((s) => {
                if (!dirtyIds.has(s.id)) return [];
                const status = edits[s.id]?.status;
                if (!status || !isAttendanceStatus(status)) return [];
                return [
                    {
                        studentId: s.id,
                        date: selectedDate,
                        status,
                        note: edits[s.id]?.note ?? "",
                    },
                ];
            });

            if (toSave.length === 0) {
                setMessage({
                    type: "error",
                    text: isFiltered
                        ? "No changes to save. Search a student, pick a status, then click Save Attendance."
                        : "No changes to save. Update at least one student status (or use Mark All Present first).",
                });
                return;
            }

            await markAttendance(toSave, selectedDate);
            downloadAttendanceCsv(toSave, students, selectedDate);
            setDirtyIds((prev) => {
                const next = new Set(prev);
                toSave.forEach((row) => next.delete(row.studentId));
                return next;
            });
            setMessage({
                type: "success",
                text: `Saved ${toSave.length} student(s) for ${selectedDate}. A CSV file was downloaded. Parents can see this in the Parent App under Attendance.`,
            });
        } catch {
            setMessage({ type: "error", text: "Failed to save attendance. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    const markAllPresent = () => {
        const next: Record<string, AttendanceEdit> = { ...edits };
        const nextDirty = new Set(dirtyIds);
        const targets = isFiltered ? displayStudents : students;
        targets.forEach((s) => {
            next[s.id] = { status: "PRESENT", note: next[s.id]?.note ?? "" };
            nextDirty.add(s.id);
        });
        setEdits(next);
        setDirtyIds(nextDirty);
    };

    return (
        <div className="space-y-6">
            <section className="bg-white border text-black border-orange-100 rounded-2xl shadow-sm p-6 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Mark Attendance</h1>
                        <p className="text-sm text-gray-500">
                            Saved records go to your centre database for the selected date. Parents see them in the Parent App → Attendance and Notifications.
                        </p>
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
                    <div className="flex flex-wrap gap-2">
                         <button 
                             onClick={markAllPresent} 
                             className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                         >
                             {isFiltered ? "Mark shown Present" : "Mark All Present"}
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

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="flex-1 space-y-1">
                        <span className="text-sm font-medium text-gray-700">Search student</span>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Name or roll number"
                                className="block w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-black outline-none focus:border-orange-500 focus:ring-orange-500"
                            />
                        </div>
                    </label>
                    <label className="space-y-1 sm:w-56">
                        <span className="text-sm font-medium text-gray-700">Class</span>
                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-orange-500 focus:ring-orange-500"
                        >
                            <option value="">All classes</option>
                            {classOptions.map((grade) => (
                                <option key={grade} value={grade}>
                                    {grade}
                                </option>
                            ))}
                        </select>
                    </label>
                    {isFiltered ? (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery("");
                                setClassFilter("");
                            }}
                            className="px-3 py-2 text-sm font-semibold text-orange-700 hover:underline"
                        >
                            Clear filters
                        </button>
                    ) : null}
                </div>
                <p className="text-xs text-gray-500">
                    {isFiltered
                        ? `Showing ${displayStudents.length} of ${sortedStudents.length} students. Save only writes students you changed in this list.`
                        : `${sortedStudents.length} students total · ${ATTENDANCE_PAGE_SIZE} per page · ${markedOnDateCount} already saved on ${selectedDate}. Use search or Next/Previous to move through pages.`}
                    {" "}
                    <span className="text-gray-600">Select status</span> means not marked yet for this date.{" "}
                    <span className="text-green-700">Present</span> (or other status) means it was saved earlier or you just picked it.
                </p>
            </section>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="bg-white border border-orange-100 rounded-2xl shadow-sm overflow-hidden">
                {!loading && displayStudents.length > 0 ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 bg-orange-50/60 px-4 py-3">
                        <p className="text-sm text-gray-700">
                            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                            <span className="text-gray-500"> · showing {pageRangeLabel}</span>
                            {!isFiltered && sortedStudents.length > displayStudents.length ? null : (
                                <span className="text-gray-500"> · {sortedStudents.length} at centre</span>
                            )}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage <= 1}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ) : null}
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
                            ) : displayStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500 py-8">
                                        No students match your search. Try another name, roll number, or class.
                                    </td>
                                </tr>
                            ) : (
                                paginatedStudents.map((s) => {
                                    const edit = edits[s.id] || { status: "", note: "" };
                                    const status = edit.status || "";
                                    return (
                                        <tr key={s.id} className="hover:bg-orange-50/50 transition-colors">
                                            <td className="p-4 text-gray-900 font-medium">{s.rollNumber}</td>
                                            <td className="p-4 text-gray-900">{s.name}</td>
                                            <td className="p-4 text-gray-600">{s.grade}</td>
                                            <td className="p-4">
                                                <select
                                                    value={status}
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            s.id,
                                                            e.target.value as AttendanceStatus | "",
                                                        )
                                                    }
                                                    className={`px-3 border py-2 rounded-lg text-sm font-semibold w-full max-w-[150px] outline-none transition-colors
                                                        ${!status ? 'bg-white text-gray-500 border-gray-300' :
                                                          status === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                          status === 'ABSENT' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                          status === 'LATE' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                                          'bg-gray-50 text-gray-700 border-gray-200'}`}
                                                >
                                                    <option value="">Select status</option>
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
                {!loading && displayStudents.length > ATTENDANCE_PAGE_SIZE ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 px-4 py-3">
                        <p className="text-xs text-gray-500">{pageRangeLabel} students on this list</p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage <= 1}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>
                            <span className="text-sm font-medium text-gray-700">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

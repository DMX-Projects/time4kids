"use client";

import { useEffect, useMemo, useState } from "react";
import {
    useSchoolData,
    type AttendanceRecord,
    type SchoolStudent,
} from "@/components/dashboard/shared/SchoolDataProvider";
import { mergeClassOptions, studentGradeMatchesClassFilter } from "@/lib/student-class-match";
import { CalendarDays, Save, CheckCircle, AlertCircle, Search } from "lucide-react";

const STUDENT_LIST_PREVIEW = 12;

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

function statusRowClass(status: AttendanceStatus | ""): string {
    if (!status) return "border-gray-200 bg-gray-50/60";
    if (status === "PRESENT") return "border-green-100 bg-green-50/40";
    if (status === "ABSENT") return "border-red-100 bg-red-50/50";
    if (status === "LATE") return "border-amber-100 bg-amber-50/50";
    return "border-orange-100 bg-orange-50/40";
}

function isPresentChecked(status: AttendanceStatus | ""): boolean {
    return status === "PRESENT";
}

export type FranchiseAttendancePanelProps = {
    controlledDate?: string;
    onControlledDateChange?: (date: string) => void;
};

export function FranchiseAttendancePanel({
    controlledDate,
    onControlledDateChange,
}: FranchiseAttendancePanelProps = {}) {
    const { students, attendance, loadAttendance, markAttendance, refreshAll } = useSchoolData();
    const [internalDate, setInternalDate] = useState(toLocalYYYYMMDD(new Date()));
    const selectedDate = controlledDate ?? internalDate;
    const setSelectedDate = onControlledDateChange ?? setInternalDate;
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [edits, setEdits] = useState<Record<string, AttendanceEdit>>({});
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [showAllStudents, setShowAllStudents] = useState(false);

    useEffect(() => {
        void refreshAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        const initialEdits: Record<string, AttendanceEdit> = {};
        for (const s of students) {
            initialEdits[s.id] = { status: "", note: "" };
        }
        setEdits(initialEdits);
        setMessage(null);
    }, [selectedDate, students]);

    useEffect(() => {
        setShowAllStudents(false);
        setSearchQuery("");
        if (!classFilter) return;
        setEdits((prev) => {
            const next = { ...prev };
            for (const s of students) {
                if (studentGradeMatchesClassFilter(s.grade, classFilter)) {
                    next[s.id] = { status: "", note: "" };
                }
            }
            return next;
        });
    }, [classFilter, students]);

    const handleStatusChange = (studentId: string, status: AttendanceStatus | "") => {
        setEdits((prev) => ({
            ...prev,
            [studentId]: {
                status,
                note: prev[studentId]?.note || "",
            },
        }));
    };

    const handleNoteChange = (studentId: string, note: string) => {
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

    const classOptions = useMemo(
        () => mergeClassOptions(sortedStudents.map((s) => s.grade)),
        [sortedStudents],
    );

    const classStudents = useMemo(() => {
        if (!classFilter) return [];
        const q = searchQuery.trim().toLowerCase();
        return sortedStudents.filter((s) => {
            if (!studentGradeMatchesClassFilter(s.grade, classFilter)) return false;
            if (!q) return true;
            return (
                s.name.toLowerCase().includes(q) ||
                s.rollNumber.toLowerCase().includes(q)
            );
        });
    }, [sortedStudents, classFilter, searchQuery]);

    const saveTargets = classStudents;

    const visibleStudents = useMemo(() => {
        if (showAllStudents || classStudents.length <= STUDENT_LIST_PREVIEW) {
            return classStudents;
        }
        return classStudents.slice(0, STUDENT_LIST_PREVIEW);
    }, [classStudents, showAllStudents]);

    const hiddenStudentCount = classStudents.length - visibleStudents.length;

    const markedCount = useMemo(
        () => saveTargets.filter((s) => (edits[s.id]?.status || "") !== "").length,
        [saveTargets, edits],
    );

    const savedOnDateCount = useMemo(
        () =>
            classStudents.filter((s) => attendance.some((r) => r.studentId === s.id)).length,
        [classStudents, attendance],
    );

    const allPresentChecked = useMemo(
        () =>
            saveTargets.length > 0 &&
            saveTargets.every((s) => edits[s.id]?.status === "PRESENT"),
        [saveTargets, edits],
    );

    const setStatusForStudents = (targets: SchoolStudent[], status: AttendanceStatus | "") => {
        const next: Record<string, AttendanceEdit> = { ...edits };
        targets.forEach((s) => {
            next[s.id] = {
                status,
                note: next[s.id]?.note ?? "",
            };
        });
        setEdits(next);
    };

    const handleSave = async () => {
        if (!classFilter) {
            setMessage({ type: "error", text: "Select a class first." });
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            const toSave: Omit<AttendanceRecord, "id">[] = saveTargets.flatMap((s) => {
                const status = edits[s.id]?.status ?? "";
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
                    text: "Select a status for at least one student before saving.",
                });
                return;
            }

            await markAttendance(toSave, selectedDate);
            setEdits((prev) => {
                const next = { ...prev };
                for (const row of toSave) {
                    next[row.studentId] = { status: "", note: "" };
                }
                return next;
            });
            setMessage({
                type: "success",
                text: `Status saved — ${toSave.length} student(s) in ${classFilter} for ${selectedDate}. Parents can view this in the Parent App → Attendance.`,
            });
        } catch {
            setMessage({ type: "error", text: "Failed to save attendance. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    const handlePresentToggle = (studentId: string, present: boolean) => {
        handleStatusChange(studentId, present ? "PRESENT" : "");
    };

    const renderStudentRow = (s: SchoolStudent) => {
        const edit = edits[s.id] || { status: "", note: "" };
        const status = edit.status || "";
        const present = isPresentChecked(status);

        return (
            <div
                key={s.id}
                className={`flex flex-col gap-2 rounded-xl border px-3 py-3 sm:flex-row sm:items-center sm:gap-4 ${statusRowClass(status)}`}
            >
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 sm:items-center">
                    <input
                        type="checkbox"
                        checked={present}
                        onChange={(e) => handlePresentToggle(s.id, e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        aria-label={`Mark ${s.name} present`}
                    />
                    <span className="min-w-0">
                        <span className="block truncate font-medium text-gray-900">{s.name}</span>
                        <span className="text-xs text-gray-500">Roll {s.rollNumber || "—"}</span>
                    </span>
                </label>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <select
                        value={status}
                        onChange={(e) =>
                            handleStatusChange(s.id, e.target.value as AttendanceStatus | "")
                        }
                        className={`rounded-lg border px-2 py-1.5 text-xs font-semibold outline-none focus:border-orange-500 sm:min-w-[140px] ${
                            !status
                                ? "border-gray-300 bg-white text-gray-500"
                                : status === "PRESENT"
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : status === "ABSENT"
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : status === "LATE"
                                      ? "border-amber-200 bg-amber-50 text-amber-700"
                                      : "border-orange-200 bg-orange-50 text-orange-800"
                        }`}
                        aria-label={`Attendance status for ${s.name}`}
                    >
                        <option value="">Select status</option>
                        {ATTENDANCE_STATUSES.map((value) => (
                            <option key={value} value={value}>
                                {STATUS_LABELS[value]}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={edit.note || ""}
                        onChange={(e) => handleNoteChange(s.id, e.target.value)}
                        placeholder="Note (optional)"
                        className="min-w-[120px] flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-black outline-none focus:border-orange-500 sm:max-w-[180px]"
                    />
                </div>
            </div>
        );
    };

    const classSelected = Boolean(classFilter);

    return (
        <div className="space-y-6">
            <section className="space-y-4 rounded-2xl border border-orange-100 bg-white p-6 text-black shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Mark Attendance</h1>
                        <p className="text-sm text-gray-500">
                            Choose a <strong>class</strong> and mark each student manually, then save. Nothing is
                            pre-selected. Parents see saved records in Parent App → Attendance.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-orange-100 bg-orange-50 p-4 sm:flex-row sm:items-end">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Select Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-orange-500 focus:ring-orange-500 sm:w-48"
                        />
                    </div>
                    <label className="space-y-1 sm:min-w-[220px]">
                        <span className="text-sm font-medium text-gray-700">Class</span>
                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-orange-500 focus:ring-orange-500"
                        >
                            <option value="">Select class</option>
                            {classOptions.map((grade) => (
                                <option key={grade} value={grade}>
                                    {grade}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !classSelected || saveTargets.length === 0}
                            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Saving…" : "Save attendance"}
                        </button>
                    </div>
                </div>

                {classSelected ? (
                    <label className="block space-y-1">
                        <span className="text-sm font-medium text-gray-700">Search in {classFilter}</span>
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
                ) : null}
            </section>

            {message ? (
                <div
                    className={`flex items-center gap-2 rounded-lg p-4 ${
                        message.type === "success"
                            ? "border border-green-200 bg-green-50 text-green-800"
                            : "border border-red-200 bg-red-50 text-red-800"
                    }`}
                >
                    {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span>{message.text}</span>
                </div>
            ) : null}

            <div className="space-y-3">
                {loading ? (
                    <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center text-gray-500 shadow-sm">
                        Loading students and attendance…
                    </div>
                ) : sortedStudents.length === 0 ? (
                    <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center text-gray-500 shadow-sm">
                        No students found. Add students first.
                    </div>
                ) : !classSelected ? (
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-8 text-center text-gray-600 shadow-sm">
                        Select a class above to see students and mark attendance.
                    </div>
                ) : classStudents.length === 0 ? (
                    <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center text-gray-500 shadow-sm">
                        No students in {classFilter}
                        {searchQuery.trim() ? " match your search." : "."}
                    </div>
                ) : (
                    <section className="rounded-2xl border border-orange-100 bg-white p-3 shadow-sm">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-2">
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={allPresentChecked}
                                    onChange={(e) =>
                                        setStatusForStudents(saveTargets, e.target.checked ? "PRESENT" : "")
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    aria-label={`Select all in ${classFilter}`}
                                />
                                <h2 className="text-sm font-semibold text-orange-900">{classFilter}</h2>
                            </label>
                            <p className="text-xs text-gray-500">
                                {markedCount} of {saveTargets.length} marked · {savedOnDateCount} saved on{" "}
                                {selectedDate}
                            </p>
                        </div>
                        <div className="space-y-2">
                            {visibleStudents.map((s) => renderStudentRow(s))}
                        </div>
                        {hiddenStudentCount > 0 ? (
                            <button
                                type="button"
                                onClick={() => setShowAllStudents(true)}
                                className="mt-2 w-full rounded-lg border border-dashed border-orange-200 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
                            >
                                Show {hiddenStudentCount} more
                            </button>
                        ) : null}
                        {showAllStudents && classStudents.length > STUDENT_LIST_PREVIEW ? (
                            <button
                                type="button"
                                onClick={() => setShowAllStudents(false)}
                                className="mt-2 w-full rounded-lg border border-dashed border-orange-200 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
                            >
                                Show less
                            </button>
                        ) : null}
                    </section>
                )}
            </div>
        </div>
    );
}

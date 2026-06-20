"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
    useSchoolData,
    type AttendanceRecord,
    type SchoolStudent,
} from "@/components/dashboard/shared/SchoolDataProvider";
import {
    CMS_CLASS_SELECT_OPTIONS,
    classLabelFromSelectValue,
} from "@/lib/student-class-match";
import {
    ATTENDANCE_ACADEMIC_YEAR_OPTIONS,
    DEFAULT_ATTENDANCE_ACADEMIC_YEAR,
    studentInAttendanceRoster,
} from "@/lib/student-academic-year";
import {
    ATTENDANCE_DROPDOWN_STATUSES,
    ATTENDANCE_SAVE_STATUSES,
    ATTENDANCE_STATUS_LABELS,
    attendanceStatusLabel,
    attendanceStatusRowClass,
    extractAttendanceList,
    extractFranchiseDayInfo,
    isAttendanceSaveStatus,
    type AttendanceResolvedStatus,
    type AttendanceSaveStatus,
    type FranchiseAttendanceDayInfo,
} from "@/lib/attendance";
import { CalendarDays, ChevronDown, ChevronRight, History, Save, CheckCircle, AlertCircle, Search } from "lucide-react";

const STUDENT_LIST_PREVIEW = 12;
const HISTORY_PREVIEW_ROWS = 20;

type AttendanceEdit = { status: AttendanceSaveStatus | ""; note: string };

const DROPDOWN_STATUSES = ATTENDANCE_DROPDOWN_STATUSES;

const STATUS_LEGEND: { key: AttendanceResolvedStatus; hint: string }[] = [
    { key: "PRESENT", hint: "Centre marks child present" },
    { key: "ABSENT", hint: "Centre marks child absent" },
    { key: "UNMARKED", hint: "Working day, not saved yet — excluded from %" },
    { key: "HOLIDAY", hint: "Weekend / holiday calendar — select in dropdown or auto-filled" },
];

const toLocalYYYYMMDD = (d: Date) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
};

const STATUS_LABELS = ATTENDANCE_STATUS_LABELS;

function statusRowClass(status: string): string {
    return attendanceStatusRowClass(status);
}

function formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    if (Number.isNaN(d.getTime())) return monthKey;
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function buildEditsForClass(
    classStudents: SchoolStudent[],
    attendance: AttendanceRecord[],
    selectedDate: string,
    defaultHoliday = false,
): Record<string, AttendanceEdit> {
    const dayKey = selectedDate.slice(0, 10);
    const next: Record<string, AttendanceEdit> = {};
    for (const s of classStudents) {
        const saved = attendance.find(
            (r) => r.studentId === s.id && r.date.slice(0, 10) === dayKey,
        );
        if (saved && isAttendanceSaveStatus(saved.status)) {
            next[s.id] = { status: saved.status, note: saved.note || "" };
        } else if (defaultHoliday) {
            next[s.id] = { status: "HOLIDAY", note: "" };
        } else {
            next[s.id] = { status: "", note: "" };
        }
    }
    return next;
}

function rosterStudentsForClass(
    students: SchoolStudent[],
    classFilter: string,
    academicYearFilter: string,
): SchoolStudent[] {
    return students
        .filter((s) => studentInAttendanceRoster(s, classFilter, academicYearFilter))
        .sort((a, b) => a.name.localeCompare(b.name));
}

export type FranchiseAttendancePanelProps = {
    controlledDate?: string;
    onControlledDateChange?: (date: string) => void;
};

export function FranchiseAttendancePanel({
    controlledDate,
    onControlledDateChange,
}: FranchiseAttendancePanelProps = {}) {
    const { authFetch } = useAuth();
    const { students, fetchFranchiseAttendance, markAttendance, refreshAll } = useSchoolData();
    const [internalDate, setInternalDate] = useState(toLocalYYYYMMDD(new Date()));
    const selectedDate = controlledDate ?? internalDate;
    const setSelectedDate = onControlledDateChange ?? setInternalDate;
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [edits, setEdits] = useState<Record<string, AttendanceEdit>>({});
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [classSelectValue, setClassSelectValue] = useState("");
    const [academicYearFilter, setAcademicYearFilter] = useState(DEFAULT_ATTENDANCE_ACADEMIC_YEAR);
    const [showAllStudents, setShowAllStudents] = useState(false);

    const [historyMonth, setHistoryMonth] = useState(() => selectedDate.slice(0, 7));
    const [historyRows, setHistoryRows] = useState<AttendanceRecord[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(true);
    const [historyExpanded, setHistoryExpanded] = useState(false);
    const [dayAttendance, setDayAttendance] = useState<AttendanceRecord[]>([]);
    const [dayInfo, setDayInfo] = useState<FranchiseAttendanceDayInfo | null>(null);
    const loadSeqRef = useRef(0);
    const authFetchRef = useRef(authFetch);
    authFetchRef.current = authFetch;

    const mapAttendanceRows = useCallback((data: unknown): AttendanceRecord[] => {
        return extractAttendanceList(data).map((raw) => ({
            id: String((raw as { id?: number | string }).id ?? ""),
            studentId: String((raw as { student?: number | string }).student ?? ""),
            studentName: (raw as { student_name?: string }).student_name,
            date: String((raw as { date?: string }).date ?? "").slice(0, 10),
            status: String((raw as { status?: string }).status ?? "") as AttendanceRecord["status"],
            note: (raw as { note?: string }).note,
        }));
    }, []);

    const loadDayAttendance = useCallback(async () => {
        if (!classFilter) {
            setDayAttendance([]);
            setDayInfo(null);
            setEdits({});
            return;
        }

        const seq = ++loadSeqRef.current;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                date: selectedDate,
                class_name: classFilter,
            });
            if (academicYearFilter && academicYearFilter !== "all") {
                params.set("academic_year", academicYearFilter);
            }
            const data = await authFetchRef.current<unknown>(
                `/students/franchise/attendance/?${params.toString()}`,
            );
            if (seq !== loadSeqRef.current) return;

            const rows = mapAttendanceRows(data);
            const roster = rosterStudentsForClass(students, classFilter, academicYearFilter);
            const dayInfoNext = extractFranchiseDayInfo(data);
            setDayAttendance(rows);
            setDayInfo(dayInfoNext);
            setEdits(buildEditsForClass(roster, rows, selectedDate, dayInfoNext?.is_holiday ?? false));
        } catch {
            if (seq !== loadSeqRef.current) return;
            setDayAttendance([]);
            setDayInfo(null);
            setEdits({});
        } finally {
            if (seq === loadSeqRef.current) setLoading(false);
        }
    }, [academicYearFilter, classFilter, mapAttendanceRows, selectedDate, students]);

    useEffect(() => {
        void refreshAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setHistoryMonth(selectedDate.slice(0, 7));
    }, [selectedDate]);

    useEffect(() => {
        void loadDayAttendance();
    }, [loadDayAttendance]);

    const classStudents = useMemo(() => {
        if (!classFilter) return [];
        const q = searchQuery.trim().toLowerCase();
        return rosterStudentsForClass(students, classFilter, academicYearFilter).filter((s) => {
            if (!q) return true;
            return (
                s.name.toLowerCase().includes(q) ||
                s.rollNumber.toLowerCase().includes(q)
            );
        });
    }, [students, classFilter, academicYearFilter, searchQuery]);

    useEffect(() => {
        setShowAllStudents(false);
        setSearchQuery("");
    }, [classFilter, academicYearFilter, selectedDate]);

    useEffect(() => {
        if (!classFilter) {
            setHistoryRows([]);
            return;
        }
        let cancelled = false;
        setHistoryLoading(true);
        (async () => {
            const rows = await fetchFranchiseAttendance({
                month: historyMonth,
                className: classFilter,
                academicYear: academicYearFilter,
            });
            if (!cancelled) {
                setHistoryRows(rows);
                setHistoryLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [classFilter, historyMonth, academicYearFilter, fetchFranchiseAttendance]);

    const handleClassSelect = (value: string) => {
        setClassSelectValue(value);
        setClassFilter(classLabelFromSelectValue(value));
    };

    const handleStatusChange = (studentId: string, status: AttendanceSaveStatus | "") => {
        setEdits((prev) => ({
            ...prev,
            [studentId]: {
                status,
                note: prev[studentId]?.note || "",
            },
        }));
        setMessage(null);
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
            classStudents.filter((s) =>
                dayAttendance.some((r) => r.studentId === s.id && r.date === selectedDate),
            ).length,
        [classStudents, dayAttendance, selectedDate],
    );

    const allPresentChecked = useMemo(
        () =>
            saveTargets.length > 0 &&
            saveTargets.every((s) => edits[s.id]?.status === "PRESENT"),
        [saveTargets, edits],
    );

    const historyByDate = useMemo(() => {
        const map = new Map<string, AttendanceRecord[]>();
        for (const row of historyRows) {
            const key = row.date || "—";
            map.set(key, [...(map.get(key) || []), row]);
        }
        return Array.from(map.entries())
            .sort(([a], [b]) => (a > b ? -1 : 1))
            .map(([date, items]) => [
                date,
                items.sort((a, b) => (a.studentName || "").localeCompare(b.studentName || "")),
            ] as const);
    }, [historyRows]);

    const visibleHistoryDates = historyExpanded
        ? historyByDate
        : historyByDate.slice(0, 5);

    const setStatusForStudents = (targets: SchoolStudent[], status: AttendanceSaveStatus | "") => {
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
                if (!status || !isAttendanceSaveStatus(status)) return [];
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
            await loadDayAttendance();
            const historyRowsNext = await fetchFranchiseAttendance({
                month: historyMonth,
                className: classFilter,
                academicYear: academicYearFilter,
            });
            setHistoryRows(historyRowsNext);
            setMessage({
                type: "success",
                text: `Saved ${toSave.length} student(s) in ${classFilter} for ${selectedDate}. Parents see this in the real parent app → Attendance.`,
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

    const openHistoryDate = (date: string) => {
        setSelectedDate(date);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const renderStudentRow = (s: SchoolStudent) => {
        const edit = edits[s.id] || { status: "", note: "" };
        const selectValue = edit.status || "UNMARKED";
        const present = edit.status === "PRESENT";

        return (
            <div
                key={s.id}
                className={`flex flex-col gap-2 rounded-xl border px-3 py-3 sm:flex-row sm:items-center sm:gap-4 ${statusRowClass(selectValue)}`}
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
                        <span className="text-xs text-gray-500">
                            Roll {s.rollNumber || "—"}
                            {s.grade ? ` · ${s.grade}` : ""}
                        </span>
                    </span>
                </label>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <select
                        value={selectValue}
                        onChange={(e) => {
                            const next = e.target.value;
                            if (next === "UNMARKED") {
                                handleStatusChange(s.id, "");
                            } else if (isAttendanceSaveStatus(next)) {
                                handleStatusChange(s.id, next);
                            }
                        }}
                        className={`rounded-lg border px-2 py-1.5 text-xs font-semibold outline-none focus:border-orange-500 sm:min-w-[148px] ${
                            selectValue === "UNMARKED"
                                ? "border-gray-300 bg-white text-gray-600"
                                : selectValue === "PRESENT"
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : selectValue === "ABSENT"
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : "border-violet-200 bg-violet-50 text-violet-800"
                        }`}
                        aria-label={`Attendance status for ${s.name}`}
                    >
                        {DROPDOWN_STATUSES.map((value) => (
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
                            Four attendance types: Present, Absent, Unmarked, Holiday. Mark Present or Absent on working days; Holiday is automatic (weekends + holiday list).
                        </p>
                    </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {STATUS_LEGEND.map(({ key, hint }) => (
                        <div
                            key={key}
                            className={`rounded-lg border px-3 py-2 text-xs ${attendanceStatusRowClass(key)}`}
                        >
                            <p className="font-semibold text-gray-900">{STATUS_LABELS[key]}</p>
                            <p className="mt-0.5 text-gray-600">{hint}</p>
                        </div>
                    ))}
                </div>

                {dayInfo?.is_holiday ? (
                    <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
                        <strong>{selectedDate}</strong> is on the holiday calendar
                        {dayInfo.holiday_label ? ` (${dayInfo.holiday_label})` : ""}. Students default to <strong>Holiday</strong> — change in the dropdown if needed, then Save.
                    </div>
                ) : null}

                <div className="flex flex-col gap-4 rounded-xl border border-orange-100 bg-orange-50 p-4 sm:flex-row sm:flex-wrap sm:items-end">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Select Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-orange-500 focus:ring-orange-500 sm:w-48"
                        />
                    </div>
                    <label className="space-y-1 sm:min-w-[180px]">
                        <span className="text-sm font-medium text-gray-700">Academic year</span>
                        <select
                            value={academicYearFilter}
                            onChange={(e) => setAcademicYearFilter(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-orange-500 focus:ring-orange-500"
                        >
                            {ATTENDANCE_ACADEMIC_YEAR_OPTIONS.map((year) => (
                                <option key={year} value={year}>
                                    {year === "all" ? "All years (legacy roster)" : year}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="space-y-1 sm:min-w-[240px]">
                        <span className="text-sm font-medium text-gray-700">Class</span>
                        <select
                            value={classSelectValue}
                            onChange={(e) => handleClassSelect(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-orange-500 focus:ring-orange-500"
                        >
                            <option value="">Select class</option>
                            {CMS_CLASS_SELECT_OPTIONS.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.label}
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
                        <p className="text-xs text-gray-500">
                            {classStudents.length} student(s) in {classFilter}
                            {academicYearFilter !== "all" ? ` · ${academicYearFilter}` : ""}.
                        </p>
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
                ) : students.length === 0 ? (
                    <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center text-gray-500 shadow-sm">
                        No students found for {academicYearFilter}. Try another academic year or add students first.
                    </div>
                ) : !classSelected ? (
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-8 text-center text-gray-600 shadow-sm">
                        Select a class above to see students and mark attendance.
                    </div>
                ) : classStudents.length === 0 ? (
                    <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center text-gray-500 shadow-sm">
                        No students in {classFilter}
                        {academicYearFilter !== "all" ? ` for ${academicYearFilter}` : ""}
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

            {classSelected ? (
                <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
                    <button
                        type="button"
                        onClick={() => setHistoryOpen((open) => !open)}
                        className="flex w-full items-center justify-between gap-3 bg-orange-50/80 px-4 py-3 text-left"
                    >
                        <span className="flex items-center gap-2 text-sm font-bold text-orange-900">
                            {historyOpen ? (
                                <ChevronDown className="h-4 w-4 shrink-0" />
                            ) : (
                                <ChevronRight className="h-4 w-4 shrink-0" />
                            )}
                            <History className="h-4 w-4" />
                            Attendance history — {classFilter}
                        </span>
                        <span className="text-xs font-normal text-orange-700">
                            {historyRows.length} record(s)
                        </span>
                    </button>

                    {historyOpen ? (
                        <div className="space-y-4 p-4">
                            <label className="block space-y-1 sm:max-w-xs">
                                <span className="text-sm font-medium text-gray-700">Month</span>
                                <input
                                    type="month"
                                    value={historyMonth}
                                    onChange={(e) => setHistoryMonth(e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-orange-500"
                                />
                            </label>

                            {historyLoading ? (
                                <p className="text-sm text-gray-500">Loading {formatMonthLabel(historyMonth)}…</p>
                            ) : historyByDate.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-orange-200 bg-orange-50/40 p-4 text-sm text-gray-600">
                                    No saved attendance for {classFilter} in {formatMonthLabel(historyMonth)}.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {visibleHistoryDates.map(([date, items]) => (
                                        <div
                                            key={date}
                                            className="overflow-hidden rounded-xl border border-orange-100"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2 bg-orange-50/60 px-3 py-2">
                                                <span className="text-sm font-semibold text-orange-900">{date}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => openHistoryDate(date)}
                                                    className="text-xs font-semibold text-orange-700 hover:underline"
                                                >
                                                    Open in editor
                                                </button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-white text-gray-600">
                                                        <tr>
                                                            <th className="p-2">Student</th>
                                                            <th className="p-2">Status</th>
                                                            <th className="p-2">Note</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {items.slice(0, HISTORY_PREVIEW_ROWS).map((row) => (
                                                            <tr key={row.id} className="border-t border-orange-50">
                                                                <td className="p-2 text-gray-900">
                                                                    {row.studentName || "—"}
                                                                </td>
                                                                <td className="p-2 font-medium text-gray-800">
                                                                    {attendanceStatusLabel(row.status)}
                                                                </td>
                                                                <td className="p-2 text-gray-600">{row.note || "—"}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {items.length > HISTORY_PREVIEW_ROWS ? (
                                                    <p className="border-t border-orange-50 px-3 py-2 text-xs text-gray-500">
                                                        + {items.length - HISTORY_PREVIEW_ROWS} more on this day
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                    {historyByDate.length > 5 && !historyExpanded ? (
                                        <button
                                            type="button"
                                            onClick={() => setHistoryExpanded(true)}
                                            className="w-full rounded-lg border border-dashed border-orange-200 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
                                        >
                                            Show all {historyByDate.length} days in {formatMonthLabel(historyMonth)}
                                        </button>
                                    ) : null}
                                    {historyExpanded && historyByDate.length > 5 ? (
                                        <button
                                            type="button"
                                            onClick={() => setHistoryExpanded(false)}
                                            className="w-full rounded-lg border border-dashed border-orange-200 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
                                        >
                                            Show fewer days
                                        </button>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    ) : null}
                </section>
            ) : null}
        </div>
    );
}

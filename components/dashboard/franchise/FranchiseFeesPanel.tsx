"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";
import { jsonHeaders } from "@/lib/api-client";
import { fetchAllApiList } from "@/lib/parent-school-api";
import {
    ParentFeeDetailsView,
    type FeeSummaryLine,
    type FeeSummaryPayload,
} from "@/components/dashboard/parent/ParentFeeDetailsView";

type MiniStudent = { id: number; full_name: string; class_name: string };

type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
type ShowToastFn = (message: string, variant?: "success" | "error") => void;

type CentreFeeLine = FeeSummaryLine & {
    centre_status?: string;
    fee_record_id?: number | null;
    paid_on?: string | null;
    notes?: string;
};

type CentreFeeSummary = Omit<FeeSummaryPayload, "lines"> & {
    student_id?: number;
    lines?: CentreFeeLine[];
};

type LineEdit = {
    status: string;
    paid_on: string;
    notes: string;
};

const FEE_STATUSES = ["PENDING", "PAID", "OVERDUE"] as const;

function lineKey(line: CentreFeeLine) {
    return `${line.serial}-${line.fee_type}`;
}

function editsFromSummary(data: CentreFeeSummary | null): Record<string, LineEdit> {
    const next: Record<string, LineEdit> = {};
    for (const line of data?.lines || []) {
        const key = lineKey(line);
        next[key] = {
            status: (line.centre_status || "PENDING").toUpperCase(),
            paid_on: line.paid_on ? String(line.paid_on).slice(0, 10) : "",
            notes: line.notes || "",
        };
    }
    return next;
}

function mapMiniStudent(raw: unknown): MiniStudent | null {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    const id = Number(r.id ?? r.pk);
    if (!Number.isFinite(id) || id <= 0) return null;
    const fromParts =
        r.first_name != null || r.last_name != null
            ? `${String(r.first_name ?? "").trim()} ${String(r.last_name ?? "").trim()}`.trim()
            : "";
    const full_name =
        String(r.full_name ?? "").trim() ||
        String(r.name ?? "").trim() ||
        fromParts ||
        "Student";
    const class_name = String(r.class_name ?? r.grade ?? "").trim();
    return { id, full_name, class_name };
}

function mergeStudentLists(schoolRows: MiniStudent[], miniRows: MiniStudent[]): MiniStudent[] {
    const byId = new Map<number, MiniStudent>();
    for (const row of miniRows) byId.set(row.id, row);
    for (const row of schoolRows) {
        if (!byId.has(row.id)) byId.set(row.id, row);
    }
    return Array.from(byId.values()).sort((a, b) => a.full_name.localeCompare(b.full_name));
}

export function FranchiseFeesPanel({
    authFetch,
    showToast,
}: {
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
}) {
    const { user } = useAuth();
    const { students: schoolStudents } = useSchoolData();
    const [miniStudents, setMiniStudents] = useState<MiniStudent[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(true);
    const [studentId, setStudentId] = useState("");
    const [summary, setSummary] = useState<CentreFeeSummary | null>(null);
    const [edits, setEdits] = useState<Record<string, LineEdit>>({});
    const [loading, setLoading] = useState(false);
    const [savingKey, setSavingKey] = useState<string | null>(null);

    const loadStudents = useCallback(async () => {
        if (!user || user.role !== "franchise") {
            setMiniStudents([]);
            setStudentsLoading(false);
            return;
        }
        setStudentsLoading(true);
        try {
            const rows = await fetchAllApiList(authFetch, "/students/franchise/students/mini/");
            setMiniStudents(rows.map(mapMiniStudent).filter((s): s is MiniStudent => s !== null));
        } catch {
            setMiniStudents([]);
        } finally {
            setStudentsLoading(false);
        }
    }, [authFetch, user]);

    useEffect(() => {
        void loadStudents();
    }, [loadStudents]);

    const students = useMemo(() => {
        const fromSchool = schoolStudents
            .filter((s) => s.isActive !== false)
            .map((s) => ({
                id: Number(s.id),
                full_name: s.name,
                class_name: s.grade,
            }))
            .filter((s) => Number.isFinite(s.id) && s.id > 0);
        return mergeStudentLists(fromSchool, miniStudents);
    }, [miniStudents, schoolStudents]);

    const studentOptions = useMemo(
        () =>
            students.map((s) => ({
                value: String(s.id),
                label: s.class_name ? `${s.full_name} (${s.class_name})` : s.full_name,
            })),
        [students],
    );

    const loadSummary = useCallback(async () => {
        if (!studentId) {
            setSummary(null);
            setEdits({});
            return;
        }
        setLoading(true);
        try {
            const data = await authFetch<CentreFeeSummary>(
                `/students/franchise/fees/summary/?student_id=${encodeURIComponent(studentId)}`,
            );
            setSummary(data);
            setEdits(editsFromSummary(data));
        } catch {
            setSummary(null);
            setEdits({});
            showToast("Could not load fee details from TiKES", "error");
        } finally {
            setLoading(false);
        }
    }, [authFetch, showToast, studentId]);

    useEffect(() => {
        void loadSummary();
    }, [loadSummary]);

    const selectedStudent = useMemo(
        () => students.find((s) => String(s.id) === studentId),
        [studentId, students],
    );

    const saveLine = async (line: CentreFeeLine) => {
        if (!studentId) return;
        const key = lineKey(line);
        const edit = edits[key];
        if (!edit) return;
        setSavingKey(key);
        try {
            await authFetch("/students/franchise/fees/line-status/", {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    student: Number(studentId),
                    line_serial: line.serial,
                    status: edit.status,
                    paid_on: edit.paid_on || null,
                    notes: edit.notes,
                }),
            });
            showToast(`Status updated for ${line.fee_type}`, "success");
            await loadSummary();
        } catch {
            showToast("Status update failed", "error");
        } finally {
            setSavingKey(null);
        }
    };

    const tikesConfigured = summary?.legacy_configured !== false;
    const hasLines = (summary?.lines?.length || 0) > 0;

    return (
        <div className="space-y-4 max-w-6xl">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#374151]">
                <p className="font-semibold text-[#111827]">Fees from TiKES</p>
                <p className="mt-1">
                    Fee structure, amounts, and due dates are loaded automatically from TiKES. Your centre can update
                    <span className="font-medium"> status</span>, optional paid date, and notes only.
                </p>
            </div>

            <label className="block text-xs font-semibold text-[#111827] max-w-md">
                Student
                <SearchableSelect
                    value={studentId}
                    onChange={setStudentId}
                    options={studentOptions}
                    placeholder="Select a student"
                    searchPlaceholder="Search student name or class…"
                    disabled={studentsLoading || students.length === 0}
                    loading={studentsLoading}
                    emptyMessage={studentsLoading ? "Loading students…" : "No student matches your search."}
                    className="font-normal"
                />
            </label>

            {!studentsLoading && students.length === 0 ? (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    No students found for your centre. Add or import students from the Students section first.
                </p>
            ) : null}

            {!studentId ? (
                <p className="text-sm text-[#6B7280]">Choose a student to view TiKES fee details.</p>
            ) : (
                <>
                    {selectedStudent ? (
                        <p className="text-sm text-[#4B5563]">
                            Showing fees for <span className="font-medium text-[#111827]">{selectedStudent.full_name}</span>
                        </p>
                    ) : null}

                    <ParentFeeDetailsView data={summary} loading={loading} />

                    {summary?.lookup_message && !hasLines ? (
                        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                            {summary.lookup_message}
                        </p>
                    ) : null}

                    {hasLines && tikesConfigured ? (
                        <section className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
                            <h2 className="text-sm font-semibold text-[#111827]">Update payment status</h2>
                            <p className="text-xs text-[#6B7280]">
                                TiKES amounts above are read-only. Change status here when a payment is recorded at the
                                centre.
                            </p>
                            <div className="space-y-3">
                                {(summary?.lines || []).map((line) => {
                                    const key = lineKey(line);
                                    const edit = edits[key] || {
                                        status: "PENDING",
                                        paid_on: "",
                                        notes: "",
                                    };
                                    const dirty =
                                        edit.status !== (line.centre_status || "PENDING").toUpperCase() ||
                                        edit.paid_on !== (line.paid_on ? String(line.paid_on).slice(0, 10) : "") ||
                                        edit.notes !== (line.notes || "");
                                    return (
                                        <div
                                            key={key}
                                            className="rounded-xl border border-[#E5E7EB] px-3 py-3 grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-[#111827]">
                                                    {line.serial}. {line.fee_type}
                                                </p>
                                                <p className="text-xs text-[#6B7280]">
                                                    Net ₹{Number(line.net_payable || 0).toFixed(2)} • Due{" "}
                                                    {line.due_date || "—"}
                                                </p>
                                            </div>
                                            <label className="text-xs font-semibold">
                                                Status
                                                <select
                                                    value={edit.status}
                                                    onChange={(e) =>
                                                        setEdits((prev) => ({
                                                            ...prev,
                                                            [key]: { ...edit, status: e.target.value },
                                                        }))
                                                    }
                                                    className="mt-1 block w-full min-w-[7rem] rounded-lg border px-2 py-1.5 text-sm"
                                                >
                                                    {FEE_STATUSES.map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                            <label className="text-xs font-semibold">
                                                Paid on
                                                <input
                                                    type="date"
                                                    value={edit.paid_on}
                                                    onChange={(e) =>
                                                        setEdits((prev) => ({
                                                            ...prev,
                                                            [key]: { ...edit, paid_on: e.target.value },
                                                        }))
                                                    }
                                                    className="mt-1 block w-full rounded-lg border px-2 py-1.5 text-sm"
                                                />
                                            </label>
                                            <label className="text-xs font-semibold md:col-span-2">
                                                Notes
                                                <input
                                                    value={edit.notes}
                                                    onChange={(e) =>
                                                        setEdits((prev) => ({
                                                            ...prev,
                                                            [key]: { ...edit, notes: e.target.value },
                                                        }))
                                                    }
                                                    placeholder="Optional"
                                                    className="mt-1 block w-full rounded-lg border px-2 py-1.5 text-sm"
                                                />
                                            </label>
                                            <div className="md:col-span-5 flex justify-end">
                                                <Button
                                                    type="button"
                                                    disabled={!dirty || savingKey === key}
                                                    onClick={() => void saveLine(line)}
                                                    className="bg-[#FF922B] text-white text-sm h-9 px-4"
                                                >
                                                    {savingKey === key ? "Saving…" : "Save status"}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ) : null}
                </>
            )}
        </div>
    );
}

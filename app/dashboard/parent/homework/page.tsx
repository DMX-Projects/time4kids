"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";

type HwRow = {
    id: number;
    assigned_date: string;
    title: string;
    description?: string;
    student?: number | null;
    student_name?: string | null;
    class_name?: string;
    is_read?: boolean;
    attachment?: string | null;
    attachment_name?: string;
    attachment_kind?: "IMAGE" | "PDF" | string;
    submission?: {
        id: number;
        student: number;
        homework: number;
        completed_image?: string | null;
        images?: { id: number; image: string }[] | null;
        is_completed: boolean;
        completed_at: string;
        updated_at: string;
    } | null;
};

const normalizeHomework = (data: unknown): HwRow[] => {
    if (Array.isArray(data)) return data as HwRow[];
    if (data && typeof data === "object") {
        const obj = data as { results?: unknown; homework?: unknown; data?: unknown };
        if (Array.isArray(obj.results)) return obj.results as HwRow[];
        if (Array.isArray(obj.homework)) return obj.homework as HwRow[];
        if (Array.isArray(obj.data)) return obj.data as HwRow[];
    }
    return [];
};

export default function HomeworkPage() {
    const { authFetch } = useAuth();
    const { selectedStudent, hasMultipleChildren, studentScopeReady, scopedApiPath } = useParentData();
    const [rows, setRows] = useState<HwRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [selectedFiles, setSelectedFiles] = useState<Record<number, File[]>>({});
    const [submittingId, setSubmittingId] = useState<number | null>(null);

    const submitHomework = async (homeworkId: number) => {
        if (!selectedStudent?.id) return;
        setSubmittingId(homeworkId);
        try {
            const formData = new FormData();
            formData.append("student", String(selectedStudent.id));
            const files = selectedFiles[homeworkId];
            if (files && files.length > 0) {
                files.forEach((file) => {
                    formData.append("completed_image", file);
                });
            }

            const sub = await authFetch<HwRow["submission"]>(`/students/parent/homework/${homeworkId}/submit/`, {
                method: "POST",
                body: formData,
            });

            setRows((prev) =>
                prev.map((r) => (r.id === homeworkId ? { ...r, submission: sub } : r))
            );
            setSelectedFiles((prev) => {
                const next = { ...prev };
                delete next[homeworkId];
                return next;
            });
        } catch (err) {
            console.error("Failed to submit homework", err);
        } finally {
            setSubmittingId(null);
        }
    };

    const markAsIncomplete = async (homeworkId: number) => {
        if (!selectedStudent?.id) return;
        try {
            const params = new URLSearchParams({
                student: String(selectedStudent.id),
            });
            await authFetch(`/students/parent/homework/${homeworkId}/submit/?${params.toString()}`, {
                method: "DELETE",
            });

            setRows((prev) =>
                prev.map((r) => (r.id === homeworkId ? { ...r, submission: null } : r))
            );
        } catch (err) {
            console.error("Failed to mark as incomplete", err);
        }
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authFetch<unknown>(scopedApiPath("/students/parent/homework/"));
            setRows(normalizeHomework(data));
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, scopedApiPath]);

    useEffect(() => {
        if (!studentScopeReady) return;
        setRows([]);
        setLoading(true);
        void load();
    }, [load, studentScopeReady, selectedStudent?.id]);

    const markAsRead = async (id: number) => {
        try {
            await authFetch("/students/parent/notifications/read/", {
                method: "POST",
                body: JSON.stringify({ notification_id: `homework-${id}` }),
            });
            setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_read: true } : r)));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const toggleExpand = (id: number, currentlyRead: boolean) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
                if (!currentlyRead) {
                    void markAsRead(id);
                }
            }
            return next;
        });
    };

    const visibleRows = rows;

    const byDate = useMemo(() => {
        const m = new Map<string, HwRow[]>();
        for (const r of visibleRows) {
            const d = r.assigned_date || "—";
            m.set(d, [...(m.get(d) || []), r]);
        }
        return Array.from(m.entries()).sort(([a], [b]) => (a > b ? -1 : a < b ? 1 : 0));
    }, [visibleRows]);

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-3xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-orange-900">Learning Center</h1>
                        <p className="text-sm text-orange-700">
                            Explore today&apos;s homework and class activities.
                            {hasMultipleChildren && selectedStudent
                                ? ` Showing work for ${selectedStudent.name}.`
                                : ""}
                        </p>
                    </div>
                </div>
            </section>

            {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                    <p className="text-sm text-orange-700 font-medium">Fetching updates...</p>
                </div>
            )}

            {!loading && visibleRows.length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-orange-200">
                    <p className="text-sm text-orange-700 font-medium">
                        {rows.length > 0 && selectedStudent
                            ? `No homework for ${selectedStudent.name} right now.`
                            : "No homework posted yet. Check back later!"}
                    </p>
                </div>
            )}

            <div className="space-y-8 pb-10">
                {byDate.map(([date, items]) => (
                    <div key={date} className="space-y-3">
                        <div className="flex items-center gap-3 px-1">
                            <h2 className="text-xs font-black text-orange-400 uppercase tracking-widest">{date}</h2>
                            <div className="h-px flex-1 bg-orange-100"></div>
                        </div>
                        <ul className="space-y-3">
                            {items.map((h) => {
                                const isExpanded = expandedIds.has(h.id);
                                return (
                                    <li
                                        key={h.id}
                                        onClick={() => toggleExpand(h.id, !!h.is_read)}
                                        className={`group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden ${
                                            isExpanded
                                                ? "bg-white border-orange-200 shadow-md ring-4 ring-orange-50/50"
                                                : "bg-white border-orange-50 hover:border-orange-100 hover:shadow-sm"
                                        }`}
                                    >
                                        <div className="p-5 flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className={`font-bold transition-colors ${isExpanded ? "text-orange-900" : "text-gray-900"}`}>
                                                        {h.title}
                                                    </p>
                                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg border border-orange-100 bg-orange-50 text-orange-700">
                                                        {h.class_name?.trim() || "All classes"}
                                                    </span>
                                                    {!h.is_read ? (
                                                        <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-black rounded-lg shadow-sm animate-pulse">
                                                            NEW
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black rounded-lg border border-green-100 flex items-center gap-1">
                                                            VIEWED <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                                        </span>
                                                    )}
                                                </div>
                                                {h.student_name ? (
                                                    <p className="text-[11px] font-bold text-orange-400 flex items-center gap-1">
                                                        <span className="opacity-60">For student:</span> {h.student_name}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className={`mt-1 text-orange-300 group-hover:text-orange-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                            </div>
                                        </div>

                                        <div
                                            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                                isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                                            }`}
                                        >
                                            <div className="px-5 pb-6 pt-0 border-t border-orange-50 mt-1">
                                                {h.description ? (
                                                    <div className="pt-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                                        {h.description}
                                                    </div>
                                                ) : (
                                                    <p className="pt-4 text-sm text-gray-400 italic">No description provided.</p>
                                                )}
                                                {h.attachment ? (
                                                    <div className="pt-4 space-y-2">
                                                        <p className="text-[11px] font-black text-orange-500 uppercase tracking-widest">
                                                            Attachment
                                                        </p>
                                                        {String(h.attachment_kind || "").toUpperCase() === "IMAGE" ? (
                                                            <div className="space-y-2">
                                                                <img
                                                                    src={h.attachment}
                                                                    alt={h.attachment_name || "Homework attachment"}
                                                                    className="w-full max-w-md rounded-2xl border border-orange-100"
                                                                />
                                                                <a
                                                                    href={h.attachment}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex text-sm font-bold text-blue-600 underline"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    Open image
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <a
                                                                href={h.attachment}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex text-sm font-bold text-blue-600 underline break-all"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {h.attachment_name || "Open PDF"}
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : null}
                                                {/* Homework Submission Panel */}
                                                <div className="mt-6 pt-5 border-t border-orange-50 space-y-4">
                                                    <p className="text-[11px] font-black text-orange-500 uppercase tracking-widest">
                                                        Completion Status
                                                    </p>

                                                    {h.submission?.is_completed ? (
                                                        <div className="bg-green-50/60 border border-green-100 rounded-2xl p-4 space-y-3">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                                                    Completed
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        void markAsIncomplete(h.id);
                                                                    }}
                                                                    className="text-xs text-red-600 hover:text-red-800 hover:underline font-bold"
                                                                >
                                                                    Mark as Incomplete
                                                                </button>
                                                            </div>
                                                            {h.submission.images && h.submission.images.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                                        Submitted Page Images ({h.submission.images.length}):
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-3">
                                                                        {h.submission.images.map((imgObj) => (
                                                                            <div key={imgObj.id} className="relative group/img w-32 h-32 rounded-xl overflow-hidden border border-green-100 bg-white shadow-xs">
                                                                                <img
                                                                                    src={imgObj.image}
                                                                                    alt="Completed homework page"
                                                                                    className="h-full w-full object-cover"
                                                                                />
                                                                                <a
                                                                                    href={imgObj.image}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    Open Image
                                                                                </a>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : h.submission.completed_image ? (
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                                        Submitted Page Image:
                                                                    </p>
                                                                    <div className="relative group/img max-w-sm rounded-xl overflow-hidden border border-green-100 bg-white">
                                                                        <img
                                                                            src={h.submission.completed_image}
                                                                            alt="Completed homework page"
                                                                            className="max-h-48 object-cover w-full"
                                                                        />
                                                                        <a
                                                                            href={h.submission.completed_image}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            Open full image
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    ) : (
                                                        <div className="bg-orange-50/30 border border-orange-100/60 rounded-2xl p-4 space-y-4">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                                <div className="space-y-1">
                                                                    <p className="text-xs font-bold text-gray-700">
                                                                        Mark this homework as completed
                                                                    </p>
                                                                    <p className="text-[10px] text-gray-500 font-medium">
                                                                        You can optionally upload photos of the completed pages.
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    disabled={submittingId === h.id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        void submitHomework(h.id);
                                                                    }}
                                                                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
                                                                >
                                                                    {submittingId === h.id ? "Saving..." : "Mark as Completed"}
                                                                </button>
                                                            </div>

                                                            {/* Image Upload Input */}
                                                            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                                                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                                                                    Upload Completed Homework Page(s) (Optional)
                                                                </label>
                                                                <div className="flex items-center gap-3">
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        multiple
                                                                        id={`file-input-${h.id}`}
                                                                        onChange={(e) => {
                                                                            const files = e.target.files;
                                                                            if (files && files.length > 0) {
                                                                                setSelectedFiles((prev) => ({ ...prev, [h.id]: Array.from(files) }));
                                                                            }
                                                                        }}
                                                                        className="hidden"
                                                                    />
                                                                    <label
                                                                        htmlFor={`file-input-${h.id}`}
                                                                        className="cursor-pointer px-3 py-1.5 bg-white border border-gray-200 hover:border-orange-300 text-gray-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                                                                    >
                                                                        📁 Choose Image(s)
                                                                    </label>
                                                                    <span className="text-xs text-gray-500 font-medium truncate max-w-xs">
                                                                        {selectedFiles[h.id] && selectedFiles[h.id].length > 0
                                                                            ? `${selectedFiles[h.id].length} file(s) chosen`
                                                                            : "No files chosen"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}


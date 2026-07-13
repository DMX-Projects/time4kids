"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Edit3, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { jsonHeaders } from "@/lib/api-client";
import { CENTRE_PROGRAM_LABELS } from "@/config/centre-program-cards-defaults";
import {
    buildMonthGrid,
    dateMonthKey,
    formatMonthLabel,
    localDateString,
    monthStartEnd,
    shiftMonth,
    sliceDate,
    toLocalMonth,
} from "@/lib/parent-portal-calendar";

type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
type ShowToastFn = (message: string, type?: "success" | "error" | "info") => void;

type DailyActivityRow = {
    id: number;
    class_name: string;
    activity_date: string;
    description: string;
};

const CLASS_OPTIONS = [
    { value: "", label: "All Classes" },
    ...CENTRE_PROGRAM_LABELS.map((p) => ({ value: p.label, label: p.label })),
];

const todayLocal = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

export function FranchiseDailyActivitiesPanel({
    authFetch,
    showToast,
}: {
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
}) {
    const [activities, setActivities] = useState<DailyActivityRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(() => toLocalMonth(new Date()));
    const [selectedClass, setSelectedClass] = useState<string>("");
    
    // Editor modal state
    const [editorModal, setEditorModal] = useState<{
        isOpen: boolean;
        date: string;
        class_name: string;
        activityId: number | null;
        description: string;
    }>({
        isOpen: false,
        date: "",
        class_name: "",
        activityId: null,
        description: "",
    });
    
    const [saving, setSaving] = useState(false);

    // Fetch activities for the franchise
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authFetch<DailyActivityRow[]>("/students/franchise/daily-activities/");
            setActivities(Array.isArray(data) ? data : []);
        } catch {
            showToast("Failed to load daily activities.", "error");
            setActivities([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    // Group activities by date and class for easy lookup
    const activitiesLookup = useMemo(() => {
        const map = new Map<string, Map<string, DailyActivityRow>>();
        for (const act of activities) {
            const d = sliceDate(act.activity_date);
            if (!map.has(d)) {
                map.set(d, new Map());
            }
            map.get(d)!.set(act.class_name || "All classes", act);
        }
        return map;
    }, [activities]);

    const handleSelectDay = (date: string, classNameOverride?: string) => {
        const targetClass = classNameOverride !== undefined ? classNameOverride : selectedClass;
        // Search if activity exists for this day and class
        const dateMap = activitiesLookup.get(date);
        const existing = dateMap?.get(targetClass || "All classes");

        setEditorModal({
            isOpen: true,
            date,
            class_name: targetClass || CLASS_OPTIONS[1].value, // Default to first concrete class if "All classes"
            activityId: existing ? existing.id : null,
            description: existing ? existing.description : "",
        });
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        const { date, class_name, activityId, description } = editorModal;

        if (!description.trim()) {
            showToast("Activity description is required.", "error");
            return;
        }

        setSaving(true);
        try {
            if (activityId) {
                // Update
                await authFetch(`/students/franchise/daily-activities/${activityId}/`, {
                    method: "PATCH",
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        class_name: class_name.trim(),
                        activity_date: date,
                        description: description.trim(),
                    }),
                });
                showToast("Activity updated.", "success");
            } else {
                // Create new
                await authFetch("/students/franchise/daily-activities/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        class_name: class_name.trim(),
                        activity_date: date,
                        description: description.trim(),
                    }),
                });
                showToast("Activity added.", "success");
            }
            setEditorModal((prev) => ({ ...prev, isOpen: false }));
            await load();
        } catch (err: any) {
            showToast(err instanceof Error ? err.message : "Failed to save activity.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const { activityId } = editorModal;
        if (!activityId) return;

        if (!window.confirm("Are you sure you want to delete this activity?")) {
            return;
        }

        setSaving(true);
        try {
            await authFetch(`/students/franchise/daily-activities/${activityId}/`, {
                method: "DELETE",
            });
            showToast("Activity deleted.", "success");
            setEditorModal((prev) => ({ ...prev, isOpen: false }));
            await load();
        } catch {
            showToast("Failed to delete activity.", "error");
        } finally {
            setSaving(false);
        }
    };

    const weeks = buildMonthGrid(month);
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
        <div className="space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-600">
                            <CalendarDays className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Today's Activities CMS</h2>
                            <p className="text-xs text-gray-500">
                                Upload and schedule descriptions of activities conducted each day for each class.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Class Selector */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-gray-600">Class:</span>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-pink-500"
                            >
                                {CLASS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Month Navigator */}
                        <div className="flex items-center gap-1.5 border border-[#E5E7EB] rounded-xl p-1 bg-gray-50">
                            <button
                                type="button"
                                onClick={() => setMonth(shiftMonth(month, -1))}
                                className="p-1.5 hover:bg-white rounded-lg text-gray-600 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-bold text-gray-800 px-2 min-w-[6.5rem] text-center">
                                {formatMonthLabel(month)}
                            </span>
                            <button
                                type="button"
                                onClick={() => setMonth(shiftMonth(month, 1))}
                                className="p-1.5 hover:bg-white rounded-lg text-gray-600 transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="border border-pink-100 rounded-2xl overflow-hidden bg-white">
                    <div className="grid grid-cols-7 border-b border-pink-100 bg-pink-50/50 text-center text-xs font-bold text-pink-900">
                        {weekdays.map((day) => (
                            <div key={day} className="py-2.5">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="divide-y divide-pink-50">
                        {weeks.map((week, wi) => (
                            <div key={wi} className="grid grid-cols-7 divide-x divide-pink-50">
                                {week.map((date, di) => {
                                    if (!date) {
                                        return <div key={`${wi}-${di}`} className="min-h-[6.5rem] bg-gray-50/20" />;
                                    }

                                    const dateStr = sliceDate(date);
                                    const dateObj = new Date(`${dateStr}T12:00:00`);
                                    const dayNum = dateObj.getDate();
                                    const isToday = dateStr === localDateString();

                                    // Get activity status
                                    const dateMap = activitiesLookup.get(dateStr);
                                    
                                    // If "All Classes" is selected, we want to know how many classes have uploaded items
                                    const uploadedActivities = dateMap ? Array.from(dateMap.values()) : [];
                                    
                                    // If a specific class is selected
                                    const classActivity = selectedClass
                                        ? dateMap?.get(selectedClass)
                                        : null;

                                    return (
                                        <div
                                            key={dateStr}
                                            className={`min-h-[6.5rem] p-2 flex flex-col justify-between group hover:bg-pink-50/10 transition-colors relative cursor-pointer ${isToday ? "bg-amber-50/20" : ""}`}
                                            onClick={() => handleSelectDay(dateStr)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={`text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${
                                                        isToday
                                                            ? "bg-pink-600 text-white"
                                                            : "text-gray-700"
                                                    }`}
                                                >
                                                    {dayNum}
                                                </span>

                                                {/* Add icon shown on hover */}
                                                {!selectedClass && uploadedActivities.length === 0 && (
                                                    <span className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-gray-100 hover:bg-pink-100 text-gray-500 hover:text-pink-600 transition-opacity">
                                                        <Plus className="h-3 w-3" />
                                                    </span>
                                                )}
                                                {selectedClass && !classActivity && (
                                                    <span className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-gray-100 hover:bg-pink-100 text-gray-500 hover:text-pink-600 transition-opacity">
                                                        <Plus className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1 flex-grow flex flex-col justify-end">
                                                {selectedClass ? (
                                                    classActivity ? (
                                                        <div className="bg-pink-50 border border-pink-100 text-pink-900 rounded-lg p-1.5 text-[10px] leading-tight font-medium shadow-xs">
                                                            <div className="flex items-start justify-between gap-1">
                                                                <span className="line-clamp-3">{classActivity.description}</span>
                                                                <Edit3 className="h-2.5 w-2.5 text-pink-600 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] text-gray-400 font-normal italic select-none text-right">Pending</span>
                                                    )
                                                ) : (
                                                    // All Classes view
                                                    uploadedActivities.length > 0 ? (
                                                        <div className="space-y-1">
                                                            <div className="bg-pink-50 border border-pink-100 text-pink-900 rounded-lg py-1 px-1.5 text-[10px] font-bold text-center">
                                                                {uploadedActivities.length} Class{uploadedActivities.length === 1 ? "" : "es"}
                                                            </div>
                                                            <div className="max-h-[3.25rem] overflow-y-auto hidden group-hover:block absolute left-0 right-0 bottom-0 bg-white border border-pink-100 rounded-b-xl p-1 z-10 space-y-0.5 max-w-full">
                                                                {uploadedActivities.map((act) => (
                                                                    <div
                                                                        key={act.id}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSelectDay(dateStr, act.class_name);
                                                                        }}
                                                                        className="flex justify-between items-center bg-pink-50/50 hover:bg-pink-100/50 rounded px-1 py-0.5 text-[9px] text-pink-950 font-semibold cursor-pointer gap-1"
                                                                    >
                                                                        <span className="truncate shrink-0 text-pink-800">{act.class_name}:</span>
                                                                        <span className="truncate">{act.description}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] text-gray-400 font-normal italic select-none text-right">No Activities</span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit / Add Modal */}
            <Modal
                isOpen={editorModal.isOpen}
                onClose={() => setEditorModal((prev) => ({ ...prev, isOpen: false }))}
                title={editorModal.activityId ? "Edit Activity" : "Add Activity"}
                size="md"
                placement="center"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="block text-xs font-bold text-gray-500 mb-1">Date</span>
                            <span className="block text-sm font-semibold text-gray-800 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                                {editorModal.date ? new Date(`${editorModal.date}T12:00:00`).toLocaleDateString(undefined, {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                }) : ""}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-gray-500 mb-1">Class</span>
                            {editorModal.activityId ? (
                                <span className="block text-sm font-semibold text-gray-800 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                                    {editorModal.class_name}
                                </span>
                            ) : (
                                <select
                                    value={editorModal.class_name}
                                    onChange={(e) => setEditorModal((prev) => ({ ...prev, class_name: e.target.value }))}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:border-pink-500"
                                >
                                    {CLASS_OPTIONS.filter(o => o.value).map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">
                            Activity Description (Short Brief)
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={editorModal.description}
                            onChange={(e) => setEditorModal((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="e.g. Drawing – Alphabet A, Dance Activity, Storytelling"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-pink-500"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                        <Button
                            type="submit"
                            className="bg-pink-600 hover:bg-pink-700 text-white"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Activity"}
                        </Button>
                        {editorModal.activityId && (
                            <Button
                                type="button"
                                onClick={handleDelete}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100"
                                disabled={saving}
                            >
                                <Trash2 className="h-4 w-4 mr-1.5 inline" />
                                Delete
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={() => setEditorModal((prev) => ({ ...prev, isOpen: false }))}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

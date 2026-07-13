"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";
import { localDateString, sliceDate } from "@/lib/parent-portal-calendar";

type DailyActivityRow = {
    id: number;
    class_name: string;
    activity_date: string;
    description: string;
};

export default function ParentActivitiesPage() {
    const { authFetch } = useAuth();
    const { selectedStudent } = useParentData();
    const [activities, setActivities] = useState<DailyActivityRow[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!selectedStudent?.id) {
            setActivities([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const params = new URLSearchParams({
                student: String(selectedStudent.id),
            });
            const data = await authFetch<DailyActivityRow[]>(`/students/parent/daily-activities/?${params.toString()}`);
            setActivities(Array.isArray(data) ? data : []);
        } catch {
            setActivities([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, selectedStudent]);

    useEffect(() => {
        void load();
    }, [load]);

    const todayDateStr = localDateString();

    // Today's activity
    const todayActivity = useMemo(() => {
        return activities.find((act) => sliceDate(act.activity_date) === todayDateStr) || null;
    }, [activities, todayDateStr]);

    // Older activities
    const olderActivities = useMemo(() => {
        return activities.filter((act) => sliceDate(act.activity_date) !== todayDateStr);
    }, [activities, todayDateStr]);

    const formatDate = (dateStr: string) => {
        const d = new Date(`${sliceDate(dateStr)}T12:00:00`);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-up">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-pink-500" />
                    Today's Activities
                </h1>
                {selectedStudent ? (
                    <p className="text-sm text-gray-500 mt-1">
                        Daily activities conducted in <strong className="text-gray-800">{selectedStudent.name}</strong>'s class ({selectedStudent.grade}).
                    </p>
                ) : (
                    <p className="text-sm text-gray-500 mt-1">
                        Daily activities conducted in your child's class.
                    </p>
                )}
            </div>

            {loading ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-sm text-gray-400 font-semibold shadow-xs">
                    Loading activities...
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Today's Section */}
                    <section className="bg-pink-50/40 border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                            <h2 className="text-base font-bold text-pink-950 uppercase tracking-wide">
                                Conducted Today
                            </h2>
                        </div>
                        {todayActivity ? (
                            <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-2xs space-y-2">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                    {formatDate(todayActivity.activity_date)}
                                </p>
                                <p className="text-base font-semibold text-gray-800 leading-relaxed">
                                    {todayActivity.description}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white/50 border border-dashed border-pink-200 rounded-2xl p-8 text-center">
                                <p className="text-sm text-gray-500 font-medium">
                                    No activities uploaded for today yet. Check back later!
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Timeline of Past Activities */}
                    <section className="space-y-4">
                        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 px-1">
                            <CalendarDays className="h-5 w-5 text-gray-400" />
                            Recent Activities
                        </h2>

                        {olderActivities.length > 0 ? (
                            <div className="space-y-3">
                                {olderActivities.map((act) => (
                                    <div
                                        key={act.id}
                                        className="bg-white border border-gray-100 hover:border-pink-100 rounded-2xl p-5 shadow-xs transition-all hover:translate-x-0.5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[11px] text-pink-600 font-bold uppercase tracking-wider">
                                                    {formatDate(act.activity_date)}
                                                </p>
                                                <p className="text-sm text-gray-700 leading-relaxed font-semibold">
                                                    {act.description}
                                                </p>
                                            </div>
                                            <div className="h-8 w-8 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                                                <BookOpen className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-100 border-dashed rounded-2xl p-12 text-center">
                                <p className="text-sm text-gray-400 font-semibold">
                                    No past activities recorded.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}

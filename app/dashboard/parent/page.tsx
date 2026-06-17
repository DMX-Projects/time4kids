"use client";

import { Sparkles } from "lucide-react";
import { ParentDashboardQuickLinks } from "@/components/dashboard/parent/ParentDashboardQuickLinks";
import { ParentDocuments } from "@/components/dashboard/parent/ParentDocuments";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";
import { countUpcomingEvents } from "@/lib/parent-dashboard-utils";
import { gradeVisibleForStudent } from "@/lib/parent-child-content-filter";

export default function ParentDashboardPage() {
    const { user } = useAuth();
    const { achievements, selectedStudent } = useParentData();
    const { grades, events, parentSchoolLoading } = useSchoolData();

    const visibleGradesCount = useMemo(() => {
        if (!selectedStudent) return grades.length;
        return grades.filter((g) => gradeVisibleForStudent(g, selectedStudent)).length;
    }, [grades, selectedStudent]);

    const upcomingEventsCount = countUpcomingEvents(events);

    const childLabel = selectedStudent?.name?.trim() || "";
    const welcomeName = childLabel.split(/\s+/)[0] || "there";

    const [showConfetti, setShowConfetti] = useState(true);
    const cartoonStrip = [
        { label: "Lion", emoji: "🦁" },
        { label: "Rocket", emoji: "🚀" },
        { label: "Rainbow", emoji: "🌈" },
        { label: "Unicorn", emoji: "🦄" },
        { label: "Paint", emoji: "🎨" },
        { label: "Star", emoji: "⭐" },
        { label: "Music", emoji: "🎵" },
    ];

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            <div className="relative min-w-0 flex-1 space-y-8">
            <section className="relative overflow-hidden rounded-3xl bg-white shadow-sm p-6 md:p-8 animate-fade-up">
                <div className="pointer-events-none absolute -top-6 right-4 text-4xl opacity-70 animate-float-slow-vertical" aria-hidden>🎈</div>
                <div className="pointer-events-none absolute -bottom-8 left-3 text-4xl opacity-60 animate-float-slow-vertical" aria-hidden>☁️</div>
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF4CC] px-3 py-1 text-xs font-semibold text-[#1F2937]">
                            <Sparkles className="w-4 h-4" />
                            Parent App
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937] leading-tight">
                            Welcome, {welcomeName}!
                        </h1>
                        {selectedStudent?.grade ? (
                            <p className="text-sm text-[#6B7280]">
                                {selectedStudent.name} · {selectedStudent.grade}
                                {selectedStudent.section ? ` · Section ${selectedStudent.section}` : ""}
                            </p>
                        ) : null}
                        <div className="flex flex-wrap gap-2 text-sm text-orange-800">
                            {cartoonStrip.map((item) => (
                                <span key={item.label} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7F5FF] text-[#1F2937] animate-fade-up" style={{ animationDelay: "120ms" }}>
                                    <span aria-hidden>{item.emoji}</span>
                                    {item.label}
                                </span>
                            ))}
                        </div>
                        {showConfetti && (
                            <div className="flex flex-wrap gap-1 text-lg" aria-hidden>
                                {"✨🎉⭐🎈🎀".split("").map((c, idx) => (
                                    <span key={idx} className="animate-fade-up" style={{ animationDelay: `${idx * 50}ms` }}>
                                        {c}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <div className="w-28 h-28 rounded-3xl bg-[#A5D8FF] flex items-center justify-center text-5xl shadow-sm" aria-hidden>
                            🧸
                        </div>
                        <div className="absolute -left-6 -bottom-3 px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#1F2937] shadow-sm">Kid-safe space</div>
                    </div>
                </div>
            </section>

            <div id="parent-documents" className="scroll-mt-24">
                <ParentDocuments />
            </div>

            {achievements.length > 0 && (
                <p className="text-xs text-[#6B7280] text-center">
                    {achievements.length} achievement{achievements.length === 1 ? "" : "s"} on the Achievements page.
                </p>
            )}
            </div>

            <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:z-[5] lg:w-[280px] xl:w-[300px]">
                <ParentDashboardQuickLinks
                    upcomingEventsCount={upcomingEventsCount}
                    gradesCount={visibleGradesCount}
                    gradesLoading={parentSchoolLoading}
                />
            </aside>
        </div>
    );
}

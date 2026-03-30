"use client";

import type React from "react";
import { Star } from "lucide-react";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";

export default function AchievementsPage() {
    const { achievements, achievementsLoading } = useParentData();

    return (
        <div className="space-y-6">
            <Section
                id="achievements"
                title="Achievements"
                description="Milestones, awards, and recognitions shared by your centre. View-only for parents."
                icon={<Star className="w-5 h-5 text-orange-600" />}
            >
                <p className="text-sm text-orange-700">These achievements are published by your centre. If something looks incorrect, please contact them.</p>
            </Section>

            {achievementsLoading && <p className="text-sm text-orange-700">Loading achievements…</p>}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements.map((ach) => (
                    <div key={ach.id} className="bg-white border border-orange-100 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                            <span className="font-semibold text-orange-900 text-sm">{ach.title}</span>
                            <span className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-100 shrink-0">{ach.date || "—"}</span>
                        </div>
                        {ach.scope === "centre" && (
                            <p className="text-[11px] uppercase tracking-wide text-orange-600 font-semibold mb-1">All families</p>
                        )}
                        {ach.scope === "student" && ach.studentName && (
                            <p className="text-xs text-orange-800 font-medium mb-1">For: {ach.studentName}</p>
                        )}
                        <p className="text-sm text-orange-700">{ach.notes || ""}</p>
                    </div>
                ))}
                {!achievementsLoading && achievements.length === 0 && <p className="text-sm text-orange-700">No achievements shared yet.</p>}
            </div>
        </div>
    );
}

function Section({ id, title, description, icon, children }: { id: string; title: string; description: string; icon: React.ReactNode; children?: React.ReactNode }) {
    return (
        <section id={id} className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-orange-900">{title}</h2>
                    <p className="text-sm text-orange-700">{description}</p>
                </div>
            </div>
            {children && <div>{children}</div>}
        </section>
    );
}

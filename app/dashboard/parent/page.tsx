"use client";

import { CalendarDays, ClipboardList, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { ParentDocuments } from "@/components/dashboard/parent/ParentDocuments";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";

export default function ParentDashboardPage() {
    const { studentProfile, grades, events, achievements } = useParentData();
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
        <div className="space-y-8 relative">
            <section className="relative overflow-hidden rounded-3xl bg-white shadow-sm p-6 md:p-8 animate-fade-up">
                <div className="pointer-events-none absolute -top-6 right-4 text-4xl opacity-70 animate-float-slow-vertical" aria-hidden>🎈</div>
                <div className="pointer-events-none absolute -bottom-8 left-3 text-4xl opacity-60 animate-float-slow-vertical" aria-hidden>☁️</div>
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF4CC] px-3 py-1 text-xs font-semibold text-[#1F2937]">
                            <Sparkles className="w-4 h-4" />
                            Parent portal
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937] leading-tight">Welcome, {studentProfile.name}&apos;s family!</h1>
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

            <div className="grid md:grid-cols-3 gap-4">
                <ParentCard icon={<User className="w-5 h-5" />} title="Student" value={studentProfile.name} caption={`${studentProfile.grade} · Section ${studentProfile.section}`} color="#FFE066" badge="All set" delay={0} />
                <ParentCard icon={<ClipboardList className="w-5 h-5" />} title="Marks / Grades" value={`${grades.length}`} caption="Records saved" color="#A5D8FF" badge="Keep tracking" delay={80} />
                <ParentCard icon={<CalendarDays className="w-5 h-5" />} title="Upcoming Events" value={`${events.length}`} caption="Stay updated" color="#FF922B" badge="Don't miss" delay={160} />
            </div>

            <ParentDocuments />

        </div>
    );
}

function ParentCard({ icon, title, value, caption, color, badge, delay = 0 }: { icon: React.ReactNode; title: string; value: string; caption: string; color: string; badge: string; delay?: number }) {
    return (
        <div
            className="relative overflow-hidden rounded-2xl shadow-sm p-5 flex items-center gap-4 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md animate-fade-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} aria-hidden />
            <div className="w-12 h-12 rounded-2xl text-[#1F2937] flex items-center justify-center shadow-sm" style={{ backgroundColor: color }}>
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-[#1F2937] font-semibold flex items-center gap-2">
                    {title}
                    <span className="text-[11px] uppercase tracking-wide rounded-full bg-[#FFF4CC] px-2 py-1 text-[#1F2937]">{badge}</span>
                </p>
                <p className="text-2xl font-bold text-[#1F2937]">{value}</p>
                <p className="text-xs text-[#4B5563]">{caption}</p>
            </div>
            <div className="absolute -right-6 -top-4 text-4xl opacity-40" aria-hidden>
                🎈
            </div>
        </div>
    );
}

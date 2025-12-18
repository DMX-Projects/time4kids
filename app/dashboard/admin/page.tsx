"use client";

import { AlertTriangle, Briefcase, CheckCircle2, ClipboardList, FileText, ShieldCheck, Users } from "lucide-react";

type SummaryCard = {
    title: string;
    value: string;
    caption: string;
    icon: React.ReactNode;
    tone: "yellow" | "blue" | "orange";
};

const toneMap: Record<SummaryCard["tone"], { bg: string; text: string }> = {
    yellow: { bg: "bg-[#FFF4CC] text-[#111827]", text: "text-[#111827]" },
    blue: { bg: "bg-[#E7F5FF] text-[#0F3B67]", text: "text-[#0F3B67]" },
    orange: { bg: "bg-[#FFE8D6] text-[#111827]", text: "text-[#111827]" },
};

const summary: SummaryCard[] = [
    { title: "Users", value: "4,812", caption: "Active accounts", icon: <Users className="w-5 h-5" />, tone: "blue" },
    { title: "Franchises", value: "24", caption: "Operating", icon: <Briefcase className="w-5 h-5" />, tone: "yellow" },
    { title: "Reports", value: "18", caption: "Awaiting review", icon: <FileText className="w-5 h-5" />, tone: "orange" },
    { title: "Tickets", value: "42", caption: "Open support", icon: <ClipboardList className="w-5 h-5" />, tone: "blue" },
];

const recentRows = [
    { id: "FR-2481", owner: "North Hub", type: "Franchise", status: "Pending", updated: "2h ago" },
    { id: "CR-9821", owner: "Careers", type: "Report", status: "In Review", updated: "5h ago" },
    { id: "EQ-6342", owner: "West Zone", type: "Enquiry", status: "Open", updated: "Today" },
    { id: "FR-2456", owner: "South Hub", type: "Franchise", status: "Approved", updated: "Yesterday" },
];

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8 animate-fade-up" style={{ animationDelay: "40ms" }}>
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summary.map((item) => (
                    <DashboardCard key={item.title} {...item} />
                ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Workflows</p>
                            <h2 className="text-xl font-semibold text-[#111827]">Active requests</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF4CC] px-3 py-1 text-xs font-semibold text-[#111827]">
                                <ShieldCheck className="w-4 h-4" />
                                Moderated
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#E7F5FF] px-3 py-1 text-xs font-semibold text-[#0F3B67]">
                                <CheckCircle2 className="w-4 h-4" />
                                SLA 98%
                            </span>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-[#F8FAFC] text-[#111827] text-xs uppercase tracking-wide sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">ID</th>
                                        <th className="px-4 py-3 font-semibold">Owner</th>
                                        <th className="px-4 py-3 font-semibold">Type</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Updated</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[#374151]">
                                    {recentRows.map((row, idx) => (
                                        <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"}>
                                            <td className="px-4 py-3 font-semibold text-[#111827]">{row.id}</td>
                                            <td className="px-4 py-3">{row.owner}</td>
                                            <td className="px-4 py-3">{row.type}</td>
                                            <td className="px-4 py-3">
                                                <StatusPill status={row.status} />
                                            </td>
                                            <td className="px-4 py-3 text-[#6B7280]">{row.updated}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="inline-flex gap-2">
                                                    <ActionButton label="View" tone="blue" />
                                                    <ActionButton label="Edit" tone="orange" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">System</p>
                            <h3 className="text-lg font-semibold text-[#111827]">Health & controls</h3>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-[#F97316]" />
                    </div>
                    <div className="space-y-3 text-sm text-[#374151]">
                        <HealthRow label="Auth service" status="Operational" tone="blue" />
                        <HealthRow label="Payments" status="Stable" tone="yellow" />
                        <HealthRow label="Content moderation" status="Monitoring" tone="orange" />
                        <HealthRow label="Data exports" status="Queued" tone="orange" />
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">
                        <PrimaryButton>Publish bulletin</PrimaryButton>
                        <SecondaryButton>Generate report</SecondaryButton>
                    </div>
                </div>
            </section>
        </div>
    );
}

function DashboardCard({ title, value, caption, icon, tone }: SummaryCard) {
    const toneStyles = toneMap[tone];
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm flex items-center gap-4 transition-shadow duration-150 hover:shadow-md">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${toneStyles.bg}`}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wide text-[#6B7280] font-semibold">{title}</span>
                <span className="text-2xl font-bold text-[#111827] leading-tight">{value}</span>
                <span className="text-xs text-[#6B7280]">{caption}</span>
            </div>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const tone = status === "Approved" ? "bg-[#E7F5FF] text-[#0F3B67]" : status === "Pending" ? "bg-[#FFF4CC] text-[#111827]" : "bg-[#FFE8D6] text-[#111827]";
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${tone}`}>{status}</span>;
}

function ActionButton({ label, tone }: { label: string; tone: "blue" | "orange" }) {
    const styles = tone === "blue" ? "bg-[#74C0FC] text-white hover:brightness-105" : "bg-[#FF922B] text-white hover:brightness-105";
    return <button className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${styles}`}>{label}</button>;
}

function HealthRow({ label, status, tone }: { label: string; status: string; tone: "yellow" | "blue" | "orange" }) {
    const badge = tone === "blue" ? "bg-[#E7F5FF] text-[#0F3B67]" : tone === "yellow" ? "bg-[#FFF4CC] text-[#111827]" : "bg-[#FFE8D6] text-[#111827]";
    return (
        <div className="flex items-center justify-between">
            <span className="text-[#111827] font-semibold">{label}</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge}`}>{status}</span>
        </div>
    );
}

function PrimaryButton({ children }: { children: React.ReactNode }) {
    return (
        <button className="inline-flex items-center justify-center rounded-md bg-[#FF922B] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:brightness-105">
            {children}
        </button>
    );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
    return (
        <button className="inline-flex items-center justify-center rounded-md bg-[#74C0FC] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:brightness-105">
            {children}
        </button>
    );
}

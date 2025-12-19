"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, ClipboardList, FileText, MapPin, Phone, Users } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useAdminData, AdminFranchise } from "@/components/dashboard/admin/AdminDataProvider";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

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

export default function AdminDashboardPage() {
    const { franchises, stats, refreshStats, getFranchiseDetail } = useAdminData();
    const { enquiries } = useSchoolData();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedFranchise, setSelectedFranchise] = useState<AdminFranchise | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    useEffect(() => {
        refreshStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const summary: SummaryCard[] = [
        { title: "Users", value: stats.activeUsers.toLocaleString(), caption: "Active accounts", icon: <Users className="w-5 h-5" />, tone: "blue" },
        { title: "Franchises", value: stats.franchises.toLocaleString(), caption: "Operating", icon: <Briefcase className="w-5 h-5" />, tone: "yellow" },
        { title: "Enquiries", value: stats.enquiries.toLocaleString(), caption: "Total received", icon: <ClipboardList className="w-5 h-5" />, tone: "orange" },
        { title: "Parents", value: stats.parents.toLocaleString(), caption: "Linked profiles", icon: <FileText className="w-5 h-5" />, tone: "blue" },
    ];

    const enquiriesByType = useMemo(() => {
        return enquiries.reduce(
            (acc, curr) => {
                const key = curr.type as "admission" | "franchise" | "contact";
                if (!acc[key]) acc[key] = [];
                acc[key].push(curr);
                return acc;
            },
            { admission: [] as typeof enquiries, franchise: [] as typeof enquiries, contact: [] as typeof enquiries },
        );
    }, [enquiries]);

    const openFranchise = async (id: string) => {
        setSelectedId(id);
        setSelectedFranchise(null);
        setDetailError(null);
        setLoadingDetail(true);
        try {
            const detail = await getFranchiseDetail(id);
            setSelectedFranchise(detail);
        } catch (err: any) {
            setDetailError(err?.message || "Unable to load franchise");
        } finally {
            setLoadingDetail(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-up" style={{ animationDelay: "40ms" }}>
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summary.map((item) => (
                    <DashboardCard key={item.title} {...item} />
                ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Franchises</p>
                            <h2 className="text-xl font-semibold text-[#111827]">Your franchises</h2>
                        </div>
                        <span className="text-xs text-[#6B7280]">{franchises.length} total</span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
                        {franchises.length === 0 ? (
                            <div className="p-6 text-sm text-[#6B7280]">No franchises yet. Use Add Franchise to create one.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-[#F8FAFC] text-[#111827] text-xs uppercase tracking-wide sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Franchise</th>
                                            <th className="px-4 py-3 font-semibold">Location</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[#374151]">
                                        {franchises.map((fr, idx) => (
                                            <tr key={fr.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"}>
                                                <td className="px-4 py-3 font-semibold text-[#111827]">{fr.name}</td>
                                                <td className="px-4 py-3 flex items-center gap-2 text-[#6B7280]">
                                                    <MapPin className="w-4 h-4" />
                                                    {fr.region || "—"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusPill status={fr.status} />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors bg-[#74C0FC] text-white hover:brightness-105"
                                                        onClick={() => openFranchise(fr.id)}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Enquiries</p>
                            <h3 className="text-lg font-semibold text-[#111827]">Latest enquiries</h3>
                        </div>
                        <span className="text-xs text-[#6B7280]">{enquiries.length} total</span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                        {([
                            { key: "admission", label: "Admission" },
                            { key: "franchise", label: "Franchise" },
                            { key: "contact", label: "Contact Us" },
                        ] as const).map(({ key, label }) => (
                            <div key={key} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-[#111827]">{label}</span>
                                    <span className="text-xs text-[#6B7280]">{enquiriesByType[key].length}</span>
                                </div>
                                <div className="space-y-2">
                                    {enquiriesByType[key].slice(0, 3).map((enq) => (
                                        <div key={enq.id} className="rounded-lg bg-white border border-[#E5E7EB] px-3 py-2">
                                            <p className="text-sm font-semibold text-[#111827]">{enq.name}</p>
                                            <p className="text-xs text-[#6B7280]">{enq.email}</p>
                                            <p className="text-xs text-[#6B7280] truncate">{enq.message}</p>
                                        </div>
                                    ))}
                                    {enquiriesByType[key].length === 0 && <p className="text-xs text-[#6B7280]">No enquiries yet.</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link href="/dashboard/admin/enquiries" className="text-sm font-semibold text-[#F97316] hover:underline inline-flex items-center gap-2">
                        View all enquiries
                    </Link>
                </div>
            </section>

            {selectedId && (
                <Modal isOpen onClose={() => setSelectedId(null)} title="Franchise details">
                    {loadingDetail && <p className="text-sm text-[#6B7280]">Loading franchise...</p>}
                    {detailError && <p className="text-sm text-red-600">{detailError}</p>}
                    {selectedFranchise && (
                        <div className="space-y-3 text-sm text-[#111827]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-semibold">{selectedFranchise.name}</p>
                                    <p className="text-xs text-[#6B7280]">{selectedFranchise.region || "Location not set"}</p>
                                </div>
                                <StatusPill status={selectedFranchise.status} />
                            </div>
                            <div className="flex flex-col gap-2 text-[#374151]">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{selectedFranchise.city || selectedFranchise.region || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>{selectedFranchise.phone || "—"}</span>
                                </div>
                                <p>{selectedFranchise.about || "No profile provided."}</p>
                                {selectedFranchise.programs && <p className="text-xs text-[#6B7280]">Programs: {selectedFranchise.programs}</p>}
                                {selectedFranchise.facilities && <p className="text-xs text-[#6B7280]">Facilities: {selectedFranchise.facilities}</p>}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Link
                                    href={`/dashboard/admin/manage-franchise/${selectedFranchise.id}`}
                                    className="px-4 py-2 rounded-md text-sm font-semibold bg-[#FF922B] text-white hover:brightness-105"
                                >
                                    Edit
                                </Link>
                                <button
                                    className="px-4 py-2 rounded-md text-sm font-semibold bg-[#F3F4F6] text-[#111827]"
                                    onClick={() => setSelectedId(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            )}
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
    const tone = status.toLowerCase() === "active" ? "bg-[#E7F5FF] text-[#0F3B67]" : "bg-[#FFE8D6] text-[#111827]";
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${tone}`}>{status}</span>;
}

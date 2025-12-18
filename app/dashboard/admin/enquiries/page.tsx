"use client";

import { useMemo, useState } from "react";
import { Inbox, PhoneCall, Mail, User } from "lucide-react";
import { useSchoolData, EnquiryType } from "@/components/dashboard/shared/SchoolDataProvider";

const tabs: { key: EnquiryType; label: string }[] = [
    { key: "admission", label: "Admission" },
    { key: "franchise", label: "Franchise" },
    { key: "contact", label: "Contact" },
];

export default function AdminEnquiriesPage() {
    const { enquiries } = useSchoolData();
    const [active, setActive] = useState<EnquiryType>("admission");

    const filtered = useMemo(() => enquiries.filter((e) => e.type === active), [enquiries, active]);

    const counts = useMemo(() => {
        const map: Record<EnquiryType, number> = { admission: 0, franchise: 0, contact: 0 };
        enquiries.forEach((e) => { map[e.type] += 1; });
        return map;
    }, [enquiries]);

    return (
        <div className="space-y-6">
            <Section
                id="overview"
                title="Enquiries"
                description="View incoming enquiries by category."
                icon={<Inbox className="w-5 h-5 text-orange-600" />}
            >
                <div className="flex gap-3 flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActive(tab.key)}
                            className={`px-3 py-2 rounded-lg border text-sm ${active === tab.key ? "bg-orange-50 border-orange-200 text-orange-700" : "border-gray-200 text-gray-700"}`}
                        >
                            {tab.label} ({counts[tab.key] || 0})
                        </button>
                    ))}
                </div>
            </Section>

            <Section
                id="list"
                title={`${tabs.find((t) => t.key === active)?.label || ""} Enquiries`}
                description="Latest first"
                icon={<Inbox className="w-5 h-5 text-orange-600" />}
            >
                <div className="grid gap-3">
                    {filtered.map((enq) => (
                        <div key={enq.id} className="border border-orange-100 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div className="font-semibold text-orange-900 text-sm">{enq.name}</div>
                                <span className="text-[11px] px-2 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700">{enq.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-orange-800">
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {enq.email}</span>
                                {enq.phone && <span className="flex items-center gap-1"><PhoneCall className="w-3 h-3" /> {enq.phone}</span>}
                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {new Date(enq.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-orange-900 leading-relaxed">{enq.message}</p>
                        </div>
                    ))}
                    {filtered.length === 0 && <p className="text-sm text-orange-800">No enquiries yet.</p>}
                </div>
            </Section>
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
            {children && <div className="space-y-3">{children}</div>}
        </section>
    );
}

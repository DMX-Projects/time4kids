"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Inbox, Phone, Mail, Eye, Search } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiUrl, jsonHeaders } from "@/lib/api-client";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

type EnquiryType = "admission" | "franchise" | "contact" | "all";

type Enquiry = {
    id: string;
    type: EnquiryType;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    childAge?: string;
    message: string;
    createdAt: string;
    status: string;
    franchiseName?: string;
    recordSource?: string;
};

const STATUS_OPTIONS = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "called", label: "Called" },
    { value: "follow_up", label: "Follow Up" },
    { value: "interested", label: "Interested" },
    { value: "meeting_scheduled", label: "Meeting Scheduled" },
    { value: "dropped", label: "Dropped" },
    { value: "not_interested", label: "Not Interested" },
    { value: "converted", label: "Converted" },
    { value: "in-progress", label: "In Progress" },
    { value: "closed", label: "Closed" },
];

const tabs: { key: EnquiryType; label: string }[] = [
    { key: "all", label: "All Enquiries" },
    { key: "admission", label: "Admission" },
    { key: "franchise", label: "Franchise" },
    { key: "contact", label: "Contact" },
];

function mapApiEnquiry(enq: any): Enquiry {
    const source = enq.record_source || (enq.enquiry_type === "FRANCHISE" ? "franchise_enquiry" : "enquiry");
    const idPrefix = source === "franchise_enquiry" ? "f" : "e";
    const type = (enq.enquiry_type || "contact").toLowerCase() as EnquiryType;
    return {
        id: `${idPrefix}-${enq.id}`,
        type: type === "franchise" ? "franchise" : type === "admission" ? "admission" : "contact",
        name: enq.name,
        email: enq.email || "",
        phone: enq.phone,
        city: enq.city,
        childAge: enq.child_age,
        message: enq.message || "",
        createdAt: enq.created_at,
        status: enq.status || "new",
        franchiseName: enq.franchise_name,
        recordSource: source,
    };
}

export default function AdminEnquiriesPage() {
    const { authFetch } = useAuth();
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<EnquiryType>("all");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

    const fetchEnquiries = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authFetch<any>("/enquiries/admin/all/");
            const items = Array.isArray(data) ? data : data?.results || [];
            setEnquiries(items.map(mapApiEnquiry));
        } catch (err) {
            console.error("Failed to load admin enquiries", err);
            toast.error("Failed to load enquiries.");
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        void fetchEnquiries();
    }, [fetchEnquiries]);

    const handleStatusChange = async (enq: Enquiry, newStatus: string) => {
        const rawId = enq.id.replace(/^[ef]-/, "");
        const isFranchise = enq.recordSource === "franchise_enquiry";
        const url = isFranchise
            ? apiUrl(`/enquiries/admin/franchise/${rawId}/`)
            : apiUrl(`/enquiries/admin/${rawId}/`);

        try {
            await fetch(url, {
                method: "PATCH",
                headers: jsonHeaders(),
                credentials: "include",
                body: JSON.stringify({ status: newStatus }),
            });
            setEnquiries((prev) =>
                prev.map((e) => (e.id === enq.id ? { ...e, status: newStatus } : e))
            );
            toast.success("Status updated!");
        } catch {
            toast.error("Failed to update status.");
        }
    };

    const filtered = useMemo(() => {
        let items = enquiries;
        if (activeTab !== "all") {
            items = items.filter((e) => e.type === activeTab);
        }
        if (statusFilter !== "all") {
            items = items.filter((e) => e.status === statusFilter);
        }
        if (search) {
            const lower = search.toLowerCase();
            items = items.filter((e) =>
                e.name.toLowerCase().includes(lower) ||
                e.email.toLowerCase().includes(lower) ||
                e.phone?.includes(search) ||
                e.city?.toLowerCase().includes(lower)
            );
        }
        return items;
    }, [enquiries, activeTab, search, statusFilter]);

    const getTabColor = (key: string, isActive: boolean) => {
        if (!isActive) return "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
        switch (key) {
            case "admission": return "bg-purple-600 text-white border-purple-600";
            case "franchise": return "bg-orange-500 text-white border-orange-500";
            case "contact": return "bg-emerald-600 text-white border-emerald-600";
            default: return "bg-slate-900 text-white border-slate-900";
        }
    };

    const getTypeTheme = (type: string) => {
        switch (type) {
            case "admission": return { badge: "bg-purple-50 text-purple-700 border-purple-100", text: "text-purple-700", border: "border-purple-100", bg: "bg-purple-50", button: "bg-purple-600 hover:bg-purple-700" };
            case "franchise": return { badge: "bg-orange-50 text-orange-700 border-orange-100", text: "text-orange-700", border: "border-orange-100", bg: "bg-orange-50", button: "bg-orange-500 hover:bg-orange-600" };
            default: return { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", text: "text-emerald-700", border: "border-emerald-100", bg: "bg-emerald-50", button: "bg-emerald-600 hover:bg-emerald-700" };
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "new": return "text-sky-600 bg-sky-50 border-sky-100";
            case "converted": return "text-green-600 bg-green-50 border-green-100";
            case "dropped": case "not_interested": return "text-red-500 bg-red-50 border-red-100";
            case "follow_up": case "meeting_scheduled": return "text-amber-600 bg-amber-50 border-amber-100";
            case "in-progress": case "contacted": case "called": case "interested": return "text-blue-600 bg-blue-50 border-blue-100";
            default: return "text-slate-600 bg-slate-50 border-slate-100";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Enquiries</h1>
                        <p className="text-slate-500 text-sm">Manage admission and franchise requests</p>
                    </div>
                    <button
                        onClick={fetchEnquiries}
                        className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                    >
                        ↻ Refresh
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-3 items-end md:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${getTabColor(tab.key, activeTab === tab.key)}`}
                            >
                                {tab.label}
                                <span className="ml-1.5 text-xs opacity-70">
                                    ({tab.key === "all" ? enquiries.length : enquiries.filter(e => e.type === tab.key).length})
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-40 pl-3 pr-8 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                        >
                            <option value="all">All Statuses</option>
                            {STATUS_OPTIONS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                        <div className="relative flex-1 md:w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search name, phone, city..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-4 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Loading enquiries...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        No enquiries found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((enq) => {
                                    const theme = getTypeTheme(enq.type);
                                    return (
                                        <tr key={enq.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">{enq.name}</span>
                                                    <div className="flex flex-col gap-0.5 mt-1 text-slate-500 text-xs">
                                                        <a href={`mailto:${enq.email}`} className="hover:text-primary-600 flex items-center gap-1.5"><Mail className="w-3 h-3" /> {enq.email}</a>
                                                        {enq.phone && <a href={`tel:${enq.phone}`} className="hover:text-primary-600 flex items-center gap-1.5"><Phone className="w-3 h-3" /> {enq.phone}</a>}
                                                    </div>
                                                    <div className="mt-1 text-[10px] text-slate-400">
                                                        {new Date(enq.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <span className="font-medium text-slate-700">{enq.city || "—"}</span>
                                                {enq.franchiseName && <div className="text-xs text-slate-400">{enq.franchiseName}</div>}
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wide ${theme.badge}`}>
                                                    {enq.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <select
                                                    value={enq.status}
                                                    onChange={(e) => handleStatusChange(enq, e.target.value)}
                                                    className={`text-xs font-medium px-2 py-1.5 rounded-md border text-center appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-200 transition-all w-36 ${getStatusColor(enq.status)}`}
                                                >
                                                    {STATUS_OPTIONS.map(s => (
                                                        <option key={s.value} value={s.value}>{s.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-4 align-top text-center">
                                                <button
                                                    onClick={() => setSelectedEnquiry(enq)}
                                                    className={`p-1.5 rounded-md transition-colors border ${theme.border} ${theme.bg} ${theme.text}`}
                                                    title="View"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={!!selectedEnquiry} onClose={() => setSelectedEnquiry(null)} title="Enquiry Details">
                {selectedEnquiry && (() => {
                    const theme = getTypeTheme(selectedEnquiry.type);
                    return (
                        <div className="space-y-6">
                            <div className={`flex items-start justify-between pb-4 border-b ${theme.border}`}>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{selectedEnquiry.name}</h3>
                                    <p className="text-sm text-slate-500">{new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wide ${theme.badge}`}>
                                    {selectedEnquiry.type}
                                </span>
                            </div>

                            <div className={`${theme.bg} rounded-xl p-4 grid grid-cols-2 gap-y-4 gap-x-6 border ${theme.border}`}>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                                    <p className="text-slate-900 font-medium text-sm">{selectedEnquiry.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
                                    <p className="text-slate-900 font-medium text-sm">{selectedEnquiry.phone || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">City</label>
                                    <p className="text-slate-900 font-medium text-sm">{selectedEnquiry.city || "—"}</p>
                                </div>
                                {selectedEnquiry.childAge && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Child Age</label>
                                        <p className="text-slate-900 font-medium text-sm">{selectedEnquiry.childAge}</p>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(selectedEnquiry.status)}`}>
                                        {STATUS_OPTIONS.find(s => s.value === selectedEnquiry.status)?.label || selectedEnquiry.status}
                                    </span>
                                </div>
                                {selectedEnquiry.franchiseName && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Centre</label>
                                        <p className="text-slate-900 font-medium text-sm">{selectedEnquiry.franchiseName}</p>
                                    </div>
                                )}
                            </div>

                            {selectedEnquiry.message && (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-2">
                                        <Inbox className="w-3 h-3" /> Message
                                    </label>
                                    <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed bg-white border border-slate-200 p-3 rounded-lg">
                                        {selectedEnquiry.message || "No message."}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                {selectedEnquiry.phone && (
                                    <a href={`tel:${selectedEnquiry.phone}`} className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-lg transition shadow-sm font-medium text-sm ${theme.button}`}>
                                        <Phone className="w-4 h-4" /> Call Now
                                    </a>
                                )}
                                <a href={`mailto:${selectedEnquiry.email}`} className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 py-2.5 rounded-lg hover:bg-slate-50 transition shadow-sm font-medium text-sm">
                                    <Mail className="w-4 h-4" /> Send Email
                                </a>
                            </div>
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
}

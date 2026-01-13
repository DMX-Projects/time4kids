"use client";

import { useMemo, useState } from "react";
import { Inbox, Phone, Mail, Eye, Calendar, MapPin, Search, Filter } from "lucide-react";
import { useSchoolData, EnquiryType, Enquiry } from "@/components/dashboard/shared/SchoolDataProvider";
import Modal from "@/components/ui/Modal";

const tabs: { key: EnquiryType | 'all'; label: string }[] = [
    { key: "all", label: "All Enquiries" },
    { key: "admission", label: "Admission" },
    { key: "franchise", label: "Franchise" },
    { key: "contact", label: "Contact" },
];

// Helper to parse the message string
function parseEnquiryMessage(message: string, type: string) {
    if (!message) return { note: "", details: {} };

    // Normalize string to handle different separators
    // Franchise: "City: ..., State: ..., Note: ..."
    // Admission: "... | Note: ..."

    let note = "";
    let metaString = message;

    // Extract Note
    const noteMatch = message.match(/\|\s*Note:\s*(.*)/i) || message.match(/,\s*Note:\s*(.*)/i) || message.match(/Note:\s*(.*)/i);
    if (noteMatch) {
        note = noteMatch[1].trim();
        metaString = message.substring(0, noteMatch.index).trim();
    } else {
        // If no explicit "Note:" prefix, but it's just a message (e.g. Contact form)
        if (!message.includes("City:") && !message.includes("Child:")) {
            note = message;
            metaString = "";
        }
    }

    const details: Record<string, string> = {};

    if (type === 'franchise') {
        const investment = metaString.match(/Investment:\s*([^,]+)/i)?.[1];
        const experience = metaString.match(/Experience:\s*([^,]+)/i)?.[1];
        const state = metaString.match(/State:\s*([^,]+)/i)?.[1];
        if (investment) details.Investment = investment.trim();
        if (experience) details.Experience = experience.trim();
        if (state) details.State = state.trim();
    } else if (type === 'admission') {
        const child = metaString.match(/Child:\s*([^,]+)/i)?.[1];
        const age = metaString.match(/Age:\s*([^,]+)/i)?.[1];
        const program = metaString.match(/Program:\s*([^,]+)/i)?.[1];
        if (child) details['Child Name'] = child.trim();
        if (age) details['Child Age'] = age.trim();
        if (program) details.Program = program.trim();
    }

    return { note, details };
}

export default function AdminEnquiriesPage() {
    const { enquiries, locations, updateEnquiryStatus } = useSchoolData();
    const [activeTab, setActiveTab] = useState<EnquiryType | 'all'>("all");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("all");
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

    // Get unique cities from enquiries + available franchise locations
    const availableCities = useMemo(() => {
        const cities = new Set<string>();
        locations.forEach(l => cities.add(l.city_name));
        enquiries.forEach(e => { if (e.city) cities.add(e.city); });
        return Array.from(cities).sort();
    }, [locations, enquiries]);

    const filtered = useMemo(() => {
        let items = enquiries;
        // Tab Filter
        if (activeTab !== 'all') {
            items = items.filter((e) => e.type === activeTab);
        }
        // Status Filter
        if (statusFilter !== 'all') {
            items = items.filter((e) => e.status === statusFilter);
        }
        // City Filter
        if (cityFilter !== 'all') {
            items = items.filter((e) => e.city?.toLowerCase() === cityFilter.toLowerCase());
        }
        // Text Search
        if (search) {
            const lower = search.toLowerCase();
            items = items.filter(e =>
                e.name.toLowerCase().includes(lower) ||
                e.email.toLowerCase().includes(lower) ||
                e.phone?.includes(search) ||
                e.city?.toLowerCase().includes(lower)
            );
        }
        return items;
    }, [enquiries, activeTab, search, statusFilter, cityFilter]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        await updateEnquiryStatus(id, newStatus);
    };

    // Color helpers
    const getTabColor = (key: string, isActive: boolean) => {
        if (!isActive) return "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
        switch (key) {
            case 'admission': return "bg-purple-600 text-white border-purple-600";
            case 'franchise': return "bg-blue-600 text-white border-blue-600";
            case 'contact': return "bg-emerald-600 text-white border-emerald-600";
            default: return "bg-slate-900 text-white border-slate-900";
        }
    };

    const getTypeTheme = (type: string) => {
        switch (type) {
            case 'admission': return { badge: 'bg-purple-50 text-purple-700 border-purple-100', text: 'text-purple-700', border: 'border-purple-100', bg: 'bg-purple-50', button: 'bg-purple-600 hover:bg-purple-700' };
            case 'franchise': return { badge: 'bg-blue-50 text-blue-700 border-blue-100', text: 'text-blue-700', border: 'border-blue-100', bg: 'bg-blue-50', button: 'bg-blue-600 hover:bg-blue-700' };
            default: return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', text: 'text-emerald-700', border: 'border-emerald-100', bg: 'bg-emerald-50', button: 'bg-emerald-600 hover:bg-emerald-700' };
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'text-sky-600 bg-sky-50 border-sky-100';
            case 'in-progress': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'closed': return 'text-slate-500 bg-slate-50 border-slate-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Enquiries</h1>
                        <p className="text-slate-500 text-sm">Manage admission and franchise requests</p>
                    </div>
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
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        <div className="relative flex-none">
                            <select
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                className="w-40 pl-3 pr-8 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                            >
                                <option value="all">All Cities</option>
                                {availableCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative flex-none">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-32 pl-3 pr-8 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="new">New</option>
                                <option value="in-progress">In Progress</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div className="relative flex-1 md:w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 w-48">Applicant</th>
                                <th className="px-6 py-4 w-40">Location</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4 w-64">Note</th>
                                <th className="px-6 py-4 w-32">Status</th>
                                <th className="px-4 py-4 w-24 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No enquiries found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((enq) => {
                                    const { note, details } = parseEnquiryMessage(enq.message, enq.type);
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
                                                    <div className="mt-2 text-[10px] text-slate-400">
                                                        {new Date(enq.createdAt).toLocaleDateString()} • <span className={`uppercase font-bold ${theme.text}`}>{enq.type}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-slate-700">{enq.city || "—"}</span>
                                                    {details.State && <span className="text-xs text-slate-500">{details.State}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex flex-col gap-1.5">
                                                    {Object.entries(details).map(([key, val]) => (
                                                        key !== 'State' && (
                                                            <div key={key} className="text-xs">
                                                                <span className="text-slate-500">{key}:</span> <span className="text-slate-700 font-medium">{val}</span>
                                                            </div>
                                                        )
                                                    ))}
                                                    {Object.keys(details).length === 0 && <span className="text-slate-400 text-xs italic">—</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3" title={note}>
                                                    {note || "—"}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <select
                                                    value={enq.status}
                                                    onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                                                    className={`text-xs font-medium px-2 py-1.5 rounded-md border text-center appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-200 transition-all w-28 ${getStatusColor(enq.status)}`}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-4 align-top text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setSelectedEnquiry(enq)}
                                                        className={`p-1.5 rounded-md transition-colors border ${theme.border} ${theme.bg} ${theme.text}`}
                                                        title="View"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    {enq.phone && (
                                                        <a
                                                            href={`tel:${enq.phone}`}
                                                            className="p-1.5 text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors border border-slate-100"
                                                            title="Call"
                                                        >
                                                            <Phone className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            <Modal
                isOpen={!!selectedEnquiry}
                onClose={() => setSelectedEnquiry(null)}
                title="Enquiry Details"
            >
                {selectedEnquiry && (
                    <div className="space-y-6">
                        {(() => {
                            const theme = getTypeTheme(selectedEnquiry.type);
                            return (
                                <>
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
                                            <p className="text-slate-900 font-medium text-sm">{selectedEnquiry.phone || '—'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">City</label>
                                            <p className="text-slate-900 font-medium text-sm">{selectedEnquiry.city || '—'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(selectedEnquiry.status)}`}>
                                                {selectedEnquiry.status.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Details</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {Object.entries(parseEnquiryMessage(selectedEnquiry.message, selectedEnquiry.type).details).map(([key, val]) => (
                                                <div key={key} className="flex flex-col">
                                                    <span className="text-slate-500 text-xs">{key}</span>
                                                    <span className="text-slate-800">{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-2">
                                            <Inbox className="w-3 h-3" /> Note / Message
                                        </label>
                                        <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed bg-white border border-slate-200 p-3 rounded-lg">
                                            {parseEnquiryMessage(selectedEnquiry.message, selectedEnquiry.type).note || "No additional message."}
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        {selectedEnquiry.phone && (
                                            <a
                                                href={`tel:${selectedEnquiry.phone}`}
                                                className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-lg transition shadow-sm font-medium text-sm ${theme.button}`}
                                            >
                                                <Phone className="w-4 h-4" /> Call Now
                                            </a>
                                        )}
                                        <a
                                            href={`mailto:${selectedEnquiry.email}`}
                                            className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 py-2.5 rounded-lg hover:bg-slate-50 transition shadow-sm font-medium text-sm"
                                        >
                                            <Mail className="w-4 h-4" /> Send Email
                                        </a>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}
            </Modal>
        </div>
    );
}

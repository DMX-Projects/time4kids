"use client";

import { useState, useEffect, useCallback } from "react";
import { Inbox, Phone, Mail, Eye, Search, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiUrl, jsonHeaders } from "@/lib/api-client";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { EnquiryNote } from "@/components/dashboard/shared/SchoolDataProvider";

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
    { value: "contacted", label: "Called/Contacted" },
    { value: "follow_up", label: "Follow Up" },
    { value: "interested", label: "Interested" },
    { value: "meeting_scheduled", label: "Meeting Scheduled" },
    { value: "dropped", label: "Dropped/Not Interested" },
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

// PAGE_SIZE is now a dynamic state variable

const API_TYPE: Record<EnquiryType, string | undefined> = {
    all: undefined,
    admission: "ADMISSION",
    franchise: "FRANCHISE",
    contact: "CONTACT",
};

// Helper to parse the message string
function parseEnquiryMessage(message: string, type: string) {
    if (!message) return { originalPrefix: "", userMessage: "", note: "", details: {} };

    let note = "";
    let originalPrefix = message;

    const noteMatch = message.match(/\|\s*Note:\s*(.*)/i) || message.match(/,\s*Note:\s*(.*)/i) || message.match(/(?:^|\s)Note:\s*(.*)/i);
    if (noteMatch) {
        note = noteMatch[1].trim();
        originalPrefix = message.substring(0, noteMatch.index).trim();
        originalPrefix = originalPrefix.replace(/(\||,)\s*$/, "").trim();
    }

    let userMessage = "";
    let metaString = originalPrefix;

    const subjectMatch = metaString.match(/^(ADMISSION|FRANCHISE|GENERAL|CONTACT|FEEDBACK|CAREERS):\s*(.*)/i);
    if (subjectMatch) {
        userMessage = subjectMatch[2].trim();
    } else if (!metaString.includes("City:") && !metaString.includes("Child:")) {
        userMessage = metaString;
    }

    const details: Record<string, string> = {};
    if (type === 'admission') {
        const child = metaString.match(/Child:\s*([^,\|]+)/i)?.[1];
        const age = metaString.match(/Age:\s*([^,\|]+)/i)?.[1];
        const program = metaString.match(/Program:\s*([^,\|]+)/i)?.[1];
        if (child) details['Child Name'] = child.trim();
        if (age) details['Child Age'] = age.trim();
        if (program) details.Program = program.trim();
    }

    return { originalPrefix, userMessage, note, details };
}

type TabCounts = Record<EnquiryType, number>;

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
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [notesHistory, setNotesHistory] = useState<EnquiryNote[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);
    const [editedNote, setEditedNote] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [tabCounts, setTabCounts] = useState<TabCounts>({
        all: 0,
        admission: 0,
        franchise: 0,
        contact: 0,
    });

    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 350);
        return () => clearTimeout(t);
    }, [searchInput]);

    const fetchEnquiries = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
            });
            const typeParam = API_TYPE[activeTab];
            if (typeParam) params.append("type", typeParam);
            if (statusFilter !== "all") params.append("status", statusFilter);
            if (search) params.append("search", search);

            const data = await authFetch<any>(`/enquiries/admin/all/?${params.toString()}`);
            const items = Array.isArray(data) ? data : data?.results || [];
            setEnquiries(items.map(mapApiEnquiry));
            setTotal(typeof data?.total === "number" ? data.total : items.length);
            if (data?.counts) {
                setTabCounts({
                    all: data.counts.all ?? 0,
                    admission: data.counts.admission ?? 0,
                    franchise: data.counts.franchise ?? 0,
                    contact: data.counts.contact ?? 0,
                });
            }
        } catch (err) {
            console.error("Failed to load admin enquiries", err);
            toast.error("Failed to load enquiries.");
        } finally {
            setLoading(false);
        }
    }, [authFetch, page, pageSize, activeTab, statusFilter, search]);

    useEffect(() => {
        void fetchEnquiries();
    }, [fetchEnquiries]);

    useEffect(() => {
        if (selectedEnquiry) {
            authFetch<EnquiryNote[]>(`/enquiries/notes/${selectedEnquiry.id.replace(/^[ef]-/, "").replace("-", "_")}/`)
                .then(setNotesHistory)
                .catch(() => setNotesHistory([]));
        } else {
            setNotesHistory([]);
            setEditedNote("");
        }
    }, [selectedEnquiry, authFetch]);

    useEffect(() => {
        setPage(1);
    }, [search, pageSize]);

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
            if (selectedEnquiry?.id === enq.id) {
                setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
            }
            setEnquiries((prev) =>
                prev.map((e) => (e.id === enq.id ? { ...e, status: newStatus } : e))
            );
            toast.success("Status updated successfully");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleSaveNote = async () => {
        if (!selectedEnquiry || !editedNote.trim()) return;
        setIsSavingNote(true);
        try {
            const newNote = await authFetch<EnquiryNote>(`/enquiries/notes/${selectedEnquiry.id.replace(/^[ef]-/, "").replace("-", "_")}/`, {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ content: editedNote.trim() }),
            });
            setNotesHistory((prev) => [...prev, newNote]);
            setEditedNote("");
            toast.success("Comment posted successfully");
        } catch (error) {
            toast.error("Failed to post comment");
        } finally {
            setIsSavingNote(false);
        }
    };

    const filtered = enquiries;

    const tabCount = (key: EnquiryType) => tabCounts[key] ?? 0;

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
                        <p className="text-slate-500 text-sm">Admission, contact, and franchise leads only</p>
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
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${getTabColor(tab.key, activeTab === tab.key)}`}
                            >
                                {tab.label}
                                <span className="ml-1.5 text-xs opacity-70">
                                    ({tabCount(tab.key)})
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
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
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
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
                                {activeTab === 'admission' && (
                                    <>
                                        <th className="px-6 py-4">Child Name</th>
                                        <th className="px-6 py-4">Child Age</th>
                                        <th className="px-6 py-4">Program</th>
                                    </>
                                )}
                                <th className="px-6 py-4">Status</th>
                                <th className="px-4 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={activeTab === 'admission' ? 8 : 5} className="px-6 py-12 text-center text-slate-500">
                                        Loading enquiries...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'admission' ? 8 : 5} className="px-6 py-12 text-center text-slate-500">
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
                                            {activeTab === 'admission' && (() => {
                                                const msg = enq.message || '';
                                                const child = msg.match(/Child:\s*([^,\|]+)/i)?.[1]?.trim() || '—';
                                                const age = enq.childAge || msg.match(/Age:\s*([^,\|]+)/i)?.[1]?.trim() || '—';
                                                const program = msg.match(/Program:\s*([^,\|]+)/i)?.[1]?.trim() || '—';
                                                return (
                                                    <>
                                                        <td className="px-6 py-4 align-top text-slate-600 font-medium">{child}</td>
                                                        <td className="px-6 py-4 align-top text-slate-600">{age}</td>
                                                        <td className="px-6 py-4 align-top text-slate-600">{program}</td>
                                                    </>
                                                );
                                            })()}
                                            <td className="px-6 py-4 align-top">
                                                <select
                                                    value={enq.status}
                                                    onChange={(e) => handleStatusChange(enq, e.target.value)}
                                                    className={`text-xs font-medium px-2 py-1.5 rounded-md border text-center appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-200 transition-all w-36 ${getStatusColor(enq.status)}`}
                                                >
                                                    {enq.status === 'new' && <option value="new" disabled>Select</option>}
                                                    {enq.status === 'called' && <option value="called" disabled>Called/Contacted</option>}
                                                    {enq.status === 'not_interested' && <option value="not_interested" disabled>Dropped/Not Interested</option>}
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
                {!loading && total > 0 && (() => {
                    const totalPages = Math.ceil(total / pageSize);
                    
                    // Generate pagination items
                    const getPageNumbers = () => {
                        const items: (number | string)[] = [];
                        if (totalPages <= 7) {
                            for (let i = 1; i <= totalPages; i++) items.push(i);
                        } else {
                            if (page <= 4) {
                                items.push(1, 2, 3, 4, 5, "...", totalPages);
                            } else if (page >= totalPages - 3) {
                                items.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                            } else {
                                items.push(1, "...", page - 1, page, page + 1, "...", totalPages);
                            }
                        }
                        return items;
                    };

                    return (
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
                            <div className="flex items-center gap-4">
                                <span>
                                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} enquiries
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-slate-500">Show:</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                        className="bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-500 text-xs font-semibold text-slate-700"
                                    >
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50 text-xs font-medium"
                                >
                                    Prev
                                </button>
                                
                                {getPageNumbers().map((item, idx) => (
                                    item === "..." ? (
                                        <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400">...</span>
                                    ) : (
                                        <button
                                            key={`page-${item}`}
                                            type="button"
                                            onClick={() => setPage(Number(item))}
                                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                                page === item
                                                    ? "bg-slate-950 text-white border-slate-950 font-bold"
                                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    )
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50 text-xs font-medium"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    );
                })()}
            </div>

            <Modal isOpen={!!selectedEnquiry} onClose={() => { setSelectedEnquiry(null); setEditedNote(""); }} title="Enquiry Details">
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

                            {parseEnquiryMessage(selectedEnquiry.message, selectedEnquiry.type).userMessage && (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-2">
                                        <Inbox className="w-3 h-3" /> Enquiry Message
                                    </label>
                                    <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded-lg">
                                        {parseEnquiryMessage(selectedEnquiry.message, selectedEnquiry.type).userMessage}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" /> Comments History
                                </label>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {notesHistory.length === 0 ? (
                                        <p className="text-slate-500 text-sm italic">No comments yet.</p>
                                    ) : (
                                        notesHistory.map((n) => (
                                            <div key={n.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                <p className="text-slate-700 text-sm whitespace-pre-wrap">{n.content}</p>
                                                <span className="text-[10px] text-slate-400 mt-1 block">
                                                    {new Date(n.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <textarea
                                    value={editedNote}
                                    onChange={(e) => setEditedNote(e.target.value)}
                                    className="w-full text-slate-700 text-sm leading-relaxed bg-white border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    rows={2}
                                    placeholder="Add your comments here..."
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={handleSaveNote}
                                        disabled={isSavingNote || !editedNote.trim()}
                                        className={`px-4 py-2 text-white text-sm font-medium rounded-lg ${theme.button} disabled:opacity-50`}
                                    >
                                        {isSavingNote ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </div>

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

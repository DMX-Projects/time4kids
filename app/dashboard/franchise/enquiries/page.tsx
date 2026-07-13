"use client";

import { useMemo, useState, useEffect } from "react";
import { Inbox, Phone, Mail, Eye, Search, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useSchoolData, EnquiryType, Enquiry, EnquiryNote } from "@/components/dashboard/shared/SchoolDataProvider";
import Modal from "@/components/ui/Modal";
import LeadSourceChart from "@/components/crm/admin/LeadSourceChart";
import ConversionFunnel from "@/components/crm/admin/ConversionFunnel";

const tabs: { key: EnquiryType | 'all'; label: string }[] = [
    { key: "all", label: "All Enquiries" },
    { key: "admission", label: "Admission" },
    { key: "contact", label: "Contact" },
];

const STATUS_LABELS: Record<string, string> = {
  // New statuses
  untouched: 'Untouched',
  not_answering: 'Not answering',
  follow_up: 'Follow-up',
  visited_school: 'Visited the school',
  converted_admission: 'Converted to Admission',
  joined_competition: 'Joined competition',
  not_interested: 'Not Interested',
  wrong_enquiry: 'Wrong enquiry',

  // Legacy mappings for display fallback
  new: 'Untouched',
  called: 'Not answering',
  contacted: 'Not answering',
  not_answering_calls: 'Not answering',
  hot: 'Follow-up',
  warm: 'Follow-up',
  cold: 'Follow-up',
  meeting_scheduled: 'Visited the school',
  converted: 'Converted to Admission',
  converted_mou_signed: 'Converted to Admission',
  converted_agreement_signed: 'Converted to Admission',
  dropped: 'Not Interested',
  join_later: 'Not Interested',
  interested: 'Follow-up',
}

const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight || !highlight.trim() || !text) return <>{text}</>;
    const safeHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeHighlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-200 text-gray-900 rounded-sm px-0.5 font-semibold">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
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

export default function FranchiseEnquiriesPage() {
    const { enquiries, updateEnquiryStatus, fetchEnquiryNotes, addEnquiryNote } = useSchoolData();
    const [activeTab, setActiveTab] = useState<EnquiryType | 'all'>("all");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [modalStatus, setModalStatus] = useState("");
    const [notesHistory, setNotesHistory] = useState<EnquiryNote[]>([]);
    const [editedNote, setEditedNote] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (selectedEnquiry) {
            fetchEnquiryNotes(selectedEnquiry.id).then(setNotesHistory);
            setModalStatus(selectedEnquiry.status);
        } else {
            setNotesHistory([]);
            setEditedNote("");
            setModalStatus("");
        }
    }, [selectedEnquiry, fetchEnquiryNotes]);

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
        // Text Search
        if (search) {
            const lower = search.toLowerCase();
            items = items.filter(e =>
                e.name.toLowerCase().includes(lower) ||
                e.email.toLowerCase().includes(lower) ||
                e.phone?.includes(search)
            );
        }
        return items;
    }, [enquiries, activeTab, search, statusFilter]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await updateEnquiryStatus(id, newStatus);
        } catch {
            // SchoolDataProvider shows the error toast and reloads the list.
        }
    };

    // Color helpers
    const getTabColor = (key: string, isActive: boolean) => {
        if (!isActive) return "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
        switch (key) {
            case 'admission': return "bg-purple-600 text-white border-purple-600";
            case 'contact': return "bg-emerald-600 text-white border-emerald-600";
            default: return "bg-orange-500 text-white border-orange-500";
        }
    };

    const getTypeTheme = (type: string) => {
        switch (type) {
            case 'admission': return { badge: 'text-blue-600 bg-blue-50 border-blue-100', text: 'text-blue-600', bg: 'hover:bg-blue-50', border: 'border-blue-200', button: 'bg-blue-600 hover:bg-blue-700' };
            case 'franchise': return { badge: 'text-purple-600 bg-purple-50 border-purple-100', text: 'text-purple-600', bg: 'hover:bg-purple-50', border: 'border-purple-200', button: 'bg-purple-600 hover:bg-purple-700' };
            case 'contact': return { badge: 'text-sky-600 bg-sky-50 border-sky-100', text: 'text-sky-600', bg: 'hover:bg-sky-50', border: 'border-sky-200', button: 'bg-sky-600 hover:bg-sky-700' };
            default: return { badge: 'text-slate-600 bg-slate-50 border-slate-100', text: 'text-slate-600', bg: 'hover:bg-slate-50', border: 'border-slate-200', button: 'bg-slate-600 hover:bg-slate-700' };
        }
    };

    const sourceData = useMemo(() => {
        const counts: Record<string, number> = {};
        filtered.forEach(e => {
            const source = e.type || "other";
            counts[source] = (counts[source] || 0) + 1;
        });
        return Object.entries(counts).map(([source, count]) => ({ source, count: count.toString() }));
    }, [filtered]);

    const statusData = useMemo(() => {
        const counts: Record<string, number> = {};
        filtered.forEach(e => {
            const status = e.status || "new";
            counts[status] = (counts[status] || 0) + 1;
        });
        return Object.entries(counts).map(([status, count]) => ({ status, count: count.toString() }));
    }, [filtered]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'untouched': return 'text-slate-600 bg-slate-50 border-slate-200';
            case 'not_answering': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'follow_up': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'visited_school': return 'text-teal-600 bg-teal-50 border-teal-200';
            case 'joined_competition': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'converted_admission': return 'text-green-600 bg-green-50 border-green-200';
            case 'not_interested': return 'text-red-600 bg-red-50 border-red-200';
            case 'wrong_enquiry': return 'text-orange-600 bg-orange-50 border-orange-200';

            // legacy
            case 'new': return 'text-slate-600 bg-slate-50 border-slate-200';
            case 'contacted': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'called': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'not_answering_calls': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'hot': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'warm': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'cold': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'meeting_scheduled': return 'text-teal-600 bg-teal-50 border-teal-200';
            case 'converted': return 'text-green-600 bg-green-50 border-green-200';
            case 'converted_mou_signed': return 'text-green-600 bg-green-50 border-green-200';
            case 'converted_agreement_signed': return 'text-green-600 bg-green-50 border-green-200';
            case 'dropped': return 'text-red-600 bg-red-50 border-red-200';
            case 'join_later': return 'text-red-600 bg-red-50 border-red-200';
            case 'interested': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0 space-y-6">
                {/* Header & Controls */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 font-fredoka">Enquiries</h1>
                            <p className="text-slate-500 text-sm">Manage student and contact requests for your center</p>
                        </div>
                    </div>

                    <div className="sticky top-[61px] z-20 flex flex-col md:flex-row gap-3 items-end md:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
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
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-40 pl-3 pr-8 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="untouched">Untouched</option>
                                    <option value="not_answering">Not answering</option>
                                    <option value="follow_up">Follow-up</option>
                                    <option value="visited_school">Visited the school</option>
                                    <option value="converted_admission">Converted to Admission</option>
                                    <option value="joined_competition">Joined competition</option>
                                    <option value="not_interested">Not Interested</option>
                                    <option value="wrong_enquiry">Wrong enquiry</option>
                                </select>
                            </div>
                            <div className="relative flex-1 md:w-56">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                                    <th className="px-6 py-4 w-48 font-fredoka uppercase tracking-wider text-xs">Applicant</th>
                                    <th className="px-6 py-4 w-64 font-fredoka uppercase tracking-wider text-xs">Message</th>
                                    <th className="px-6 py-4 w-32 font-fredoka uppercase tracking-wider text-xs text-center">Status</th>
                                    <th className="px-4 py-4 w-24 text-center font-fredoka uppercase tracking-wider text-xs">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            No enquiries found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((enq) => {
                                        const { note, details: parsedDetails } = parseEnquiryMessage(enq.message, enq.type);
                                        const details = { ...parsedDetails };

                                        // Prefer structured childAge if available
                                        if (enq.childAge && !details['Child Age']) {
                                            details['Child Age'] = enq.childAge;
                                        }

                                        const theme = getTypeTheme(enq.type);

                                        return (
                                            <tr key={enq.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-900">
                                                            <HighlightText text={enq.name} highlight={search} />
                                                        </span>
                                                        <div className="flex flex-col gap-0.5 mt-1 text-slate-500 text-xs">
                                                            <a href={`mailto:${enq.email}`} className="hover:text-orange-600 flex items-center gap-1.5">
                                                                <Mail className="w-3 h-3" /> <HighlightText text={enq.email} highlight={search} />
                                                            </a>
                                                            {enq.phone && (
                                                                <a href={`tel:${enq.phone}`} className="hover:text-orange-600 flex items-center gap-1.5">
                                                                    <Phone className="w-3 h-3" /> <HighlightText text={enq.phone} highlight={search} />
                                                                </a>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 text-[10px] text-slate-400">
                                                            {new Date(enq.createdAt).toLocaleDateString()} • <span className={`uppercase font-bold ${theme.text}`}>{enq.type}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 align-top">
                                                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3" title={parseEnquiryMessage(enq.message, enq.type).userMessage || parseEnquiryMessage(enq.message, enq.type).note}>
                                                        <HighlightText text={parseEnquiryMessage(enq.message, enq.type).userMessage || parseEnquiryMessage(enq.message, enq.type).note || "-"} highlight={search} />
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 align-top text-center">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(enq.status)}`}>
                                                        {STATUS_LABELS[enq.status] || enq.status.replace(/_/g, ' ')}
                                                    </span>
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
            </div>

            {/* Right side: Charts */}
            {filtered.length > 0 && (
                <div className="w-full lg:w-[350px] flex-none flex flex-col gap-6">
                    <LeadSourceChart data={sourceData} />
                    <ConversionFunnel data={statusData} />
                </div>
            )}

            {/* View Modal */}
            <Modal
                isOpen={!!selectedEnquiry}
                onClose={() => {
                    setSelectedEnquiry(null);
                    setEditedNote("");
                }}
                title="Enquiry Details"
                size="lg"
            >
                {selectedEnquiry && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {(() => {
                            const theme = getTypeTheme(selectedEnquiry.type);
                            return (
                                <>
                                    {/* Left Column: Details & Initial Message */}
                                    <div className="space-y-6">
                                    <div className={`flex items-start justify-between pb-4 border-b ${theme.border}`}>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 font-fredoka">{selectedEnquiry.name}</h3>
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
                                        <div className="col-span-2 space-y-2 mt-2 pt-4 border-t border-slate-200/60">
                                            <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-2">
                                                <Inbox className="w-3 h-3" /> Initial Message
                                            </label>
                                            <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                                                {parseEnquiryMessage(selectedEnquiry.message, selectedEnquiry.type).userMessage || parseEnquiryMessage(selectedEnquiry.message, selectedEnquiry.type).note || "No additional message provided."}
                                            </p>
                                        </div>
                                        <div className="space-y-1 col-span-2 mt-2">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                                            <select
                                                value={modalStatus}
                                                onChange={(e) => setModalStatus(e.target.value)}
                                                className={`text-sm font-semibold px-3 py-2 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-200 transition-all block w-full max-w-[250px] shadow-sm ${getStatusColor(modalStatus)}`}
                                            >
                                                {modalStatus && !['untouched', 'not_answering', 'follow_up', 'visited_school', 'converted_admission', 'joined_competition', 'not_interested', 'wrong_enquiry'].includes(modalStatus) && (
                                                    <option value={modalStatus} disabled>
                                                        {STATUS_LABELS[modalStatus] || modalStatus}
                                                    </option>
                                                )}
                                                <option value="untouched">Untouched</option>
                                                <option value="not_answering">Not answering</option>
                                                <option value="follow_up">Follow-up</option>
                                                <option value="visited_school">Visited the school</option>
                                                <option value="converted_admission">Converted to Admission</option>
                                                <option value="joined_competition">Joined competition</option>
                                                <option value="not_interested">Not Interested</option>
                                                <option value="wrong_enquiry">Wrong enquiry</option>
                                            </select>
                                        </div>
                                    </div>

                                    </div>

                                    {/* Right Column: Notes & Actions */}
                                    <div className="space-y-6 flex flex-col">
                                        <div className="flex-1 space-y-3 min-h-[200px]">
                                            <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-2">
                                                <MessageSquare className="w-3 h-3" /> Notes History
                                            </label>
                                            {notesHistory.length > 0 ? (
                                                <div className="bg-slate-50 rounded-lg p-3 space-y-3 max-h-48 overflow-y-auto border border-slate-100">
                                                    {notesHistory.map((n, i) => (
                                                        <div key={i} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                                            <p className="text-slate-700 text-sm">{n.content}</p>
                                                            <p className="text-slate-400 text-xs mt-1">
                                                                {new Date(n.created_at).toLocaleString()} {n.created_by_name ? `by ${n.created_by_name}` : ""}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 rounded-lg p-6 flex flex-col items-center justify-center border border-slate-100 text-slate-400 text-sm">
                                                    <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                                                    No notes yet
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-2">
                                                <Inbox className="w-3 h-3" /> Add New Note
                                            </label>
                                            <textarea
                                                value={editedNote}
                                                onChange={(e) => setEditedNote(e.target.value)}
                                                className="w-full text-slate-700 text-sm leading-relaxed bg-white border border-slate-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                rows={3}
                                                placeholder="Add your comments here..."
                                            />
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    onClick={async () => {
                                                        if (!selectedEnquiry || !editedNote.trim()) return;
                                                        setIsSavingNote(true);
                                                        try {
                                                            const newNote = await addEnquiryNote(selectedEnquiry.id, editedNote.trim());
                                                            setNotesHistory((prev) => [...prev, newNote]);
                                                            
                                                            // Update status if it changed
                                                            if (modalStatus && modalStatus !== selectedEnquiry.status) {
                                                                await updateEnquiryStatus(selectedEnquiry.id, modalStatus);
                                                                // Also update the local state so it doesn't trigger again on subsequent saves
                                                                selectedEnquiry.status = modalStatus as any;
                                                            }

                                                            setEditedNote("");
                                                            showToast("Enquiry saved successfully!", "success");
                                                        } catch (error) {
                                                            showToast("Failed to save changes.", "error");
                                                        } finally {
                                                            setIsSavingNote(false);
                                                        }
                                                    }}
                                                    disabled={isSavingNote || !editedNote.trim()}
                                                    className={`px-4 py-2 text-white text-sm font-medium rounded-lg ${theme.button} disabled:opacity-50`}
                                                >
                                                    {isSavingNote ? "Saving..." : "Save"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4 border-t border-slate-100 mt-auto">
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

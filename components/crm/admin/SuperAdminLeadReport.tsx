"use client";

/**
 * Super-admin only: Lead Reports - 13-column lead list (incl. phone) across ALL sources
 * (BCWW, ANTS, website, centerpage, franchise forms, landing pages) with
 * Lead Type / required From/To date range / State, City & Status dropdown filters.
 * Uses GET /leads/reports?mode=all_leads[&leadKind=campaign|landing][&export=csv]
 */

import { useMemo, useState } from "react";
import api from "@/lib/crmApi";
import { Download, Loader2, Search } from "lucide-react";
import StateSelector from "@/components/crm/admin/StateSelector";
import CitySelector from "@/components/crm/admin/CitySelector";
import { MultiSelectCheckbox } from "@/components/crm/MultiSelectCheckbox";

/** Union of the CRM dashboard Status filters (campaign/admission + franchise). */
// "franchise" = franchise-only statuses, hidden when Lead Type is Campaign/Admission.
const STATUS_OPTIONS: { value: string; label: string; franchise?: boolean }[] = [
    { value: "untouched", label: "Untouched" },
    { value: "follow_up", label: "Follow-up" },
    { value: "not_answering", label: "Not answering" },
    { value: "not_answering_calls", label: "Not Answering Calls", franchise: true },
    { value: "wrong_enquiry", label: "Wrong enquiry" },
    { value: "not_interested", label: "Not Interested" },
    { value: "joined_competition", label: "Joined competition" },
    { value: "visited_school", label: "Visited the school" },
    { value: "meeting_done", label: "Meetings done" },
    { value: "converted_admission", label: "Converted to Admission" },
    { value: "join_later", label: "Join Later", franchise: true },
    { value: "cold", label: "Cold", franchise: true },
    { value: "warm", label: "Warm", franchise: true },
    { value: "hot", label: "Hot", franchise: true },
    { value: "interested", label: "Interested", franchise: true },
    { value: "converted_mou_signed", label: "Converted - MOU", franchise: true },
    { value: "converted_agreement_signed", label: "Converted - Agreement", franchise: true },
];

type LeadKind = "" | "campaign" | "landing";

function toInputDate(d: Date | null | undefined): string {
    if (!d) return "";
    const x = new Date(d);
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    return `${x.getFullYear()}-${m}-${day}`;
}

const COLUMNS = [
    "name",
    "phone",
    "email",
    "state",
    "city",
    "lead_type",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "status",
    "created_at",
    "utm_content",
    "gclid",
    "description",
] as const;

export default function SuperAdminLeadReport({
    defaultStartDate,
    defaultEndDate,
}: {
    defaultStartDate?: Date | null;
    defaultEndDate?: Date | null;
}) {
    const [leadKind, setLeadKind] = useState<LeadKind>("");
    const [startDate, setStartDate] = useState(toInputDate(defaultStartDate));
    const [endDate, setEndDate] = useState(toInputDate(defaultEndDate));
    const [selectedStates, setSelectedStates] = useState<string[]>([]);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [leads, setLeads] = useState<any[]>([]);
    const [loaded, setLoaded] = useState(false);
    // Filters used by the last successful Generate (CSV downloads exactly these).
    const [generated, setGenerated] = useState<{ qs: string; kind: LeadKind; start: string; end: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 50;

    const buildParams = () => {
        const params = new URLSearchParams();
        if (startDate) {
            const s = new Date(`${startDate}T00:00:00`);
            params.append("startDate", s.toISOString());
        }
        if (endDate) {
            const e = new Date(`${endDate}T23:59:59.999`);
            params.append("endDate", e.toISOString());
        }
        if (selectedStates.length) params.append("state", selectedStates.join(","));
        if (selectedCities.length) params.append("city", selectedCities.join(","));
        if (selectedStatuses.length) params.append("status", selectedStatuses.join(","));
        params.append("mode", "all_leads");
        if (leadKind) params.append("leadKind", leadKind);
        return params;
    };

    // Filters are interlinked (date min/max, state->city, lead type->status), so no error text is shown.
    const today = toInputDate(new Date());
    const datesReady = Boolean(startDate && endDate && startDate <= endDate);
    const statusOptions = useMemo(
        () => STATUS_OPTIONS.filter((o) => !leadKind || !o.franchise).map(({ value, label }) => ({ value, label })),
        [leadKind],
    );

    const generate = async () => {
        if (!datesReady) return;
        setLoading(true);
        try {
            const qs = buildParams().toString();
            const res = await api.get(`/leads/reports?${qs}`);
            setGenerated({ qs, kind: leadKind, start: startDate, end: endDate });
            setLeads(res.data?.leads || []);
            setLoaded(true);
            setPage(1);
        } catch (err: any) {
            console.error("Failed to load lead report:", err);
            // Quiet failure: show the empty table state instead of an error banner.
            setGenerated(null);
            setLeads([]);
            setLoaded(true);
            setPage(1);
        } finally {
            setLoading(false);
        }
    };

    const downloadCsv = async () => {
        if (!generated) return;
        setExporting(true);
        try {
            const params = new URLSearchParams(generated.qs);
            params.append("export", "csv");
            const res = await api.get(`/leads/reports?${params.toString()}`, { responseType: "arraybuffer" });
            const contentType = String(res.headers?.["content-type"] || "");
            if (contentType.includes("application/json")) {
                const text = new TextDecoder().decode(new Uint8Array(res.data as ArrayBuffer));
                console.error("Lead report CSV download failed:", text);
                return;
            }
            const blob = new Blob([new Uint8Array(res.data as ArrayBuffer)], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            const kind = generated.kind ? `_${generated.kind === "landing" ? "Admission" : "Campaign"}` : "";
            const range = `_${generated.start}_to_${generated.end}`;
            a.download = `Lead_Report${kind}${range}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
        } catch (err) {
            console.error("Failed to download lead report CSV:", err);
        } finally {
            setExporting(false);
        }
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return leads;
        return leads.filter((l) =>
            COLUMNS.some((col) => String(l?.[col] ?? "").toLowerCase().includes(q)),
        );
    }, [leads, search]);

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
    const kindLabel = leadKind === "landing" ? "Admission" : leadKind === "campaign" ? "Campaign" : "All";

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="relative z-30 p-5 border-b border-gray-200 bg-gray-50/50 rounded-t-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                            <span>Lead Reports</span>
                            {loaded && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                    {filtered.length} Leads
                                </span>
                            )}
                            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                {kindLabel}
                            </span>
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            All leads from every source. Pick filters and dates, click Generate, then Download CSV from the results.
                        </p>
                    </div>
                </div>

                <div className="relative z-30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-end">
                    <label className="text-sm font-semibold text-gray-700">
                        Lead Type
                        <select
                            value={leadKind}
                            onChange={(e) => {
                                const kind = e.target.value as LeadKind;
                                setLeadKind(kind);
                                if (kind) {
                                    const franchiseOnly = new Set(STATUS_OPTIONS.filter((o) => o.franchise).map((o) => o.value));
                                    setSelectedStatuses((prev) => prev.filter((s) => !franchiseOnly.has(s)));
                                }
                            }}
                            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-normal"
                        >
                            <option value="">All</option>
                            <option value="campaign">Campaign</option>
                            <option value="landing">Admission</option>
                        </select>
                    </label>
                    <StateSelector
                        value={selectedStates}
                        onChange={(v) => {
                            setSelectedStates(v);
                            setSelectedCities([]);
                        }}
                    />
                    <CitySelector
                        key={`lead-report-cities-${selectedStates.join("|")}`}
                        value={selectedCities}
                        onChange={setSelectedCities}
                        state={selectedStates.join(",")}
                    />
                    <div className="w-full">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Status</label>
                        <MultiSelectCheckbox
                            options={statusOptions}
                            value={selectedStatuses}
                            onChange={setSelectedStatuses}
                            placeholder="All"
                        />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">
                        From
                        <input
                            type="date"
                            value={startDate}
                            max={endDate || today}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setLoaded(false);
                            }}
                            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-normal"
                        />
                    </label>
                    <label className="text-sm font-semibold text-gray-700">
                        To
                        <input
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            max={today}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setLoaded(false);
                            }}
                            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-normal"
                        />
                    </label>
                    <button
                        onClick={generate}
                        disabled={loading || !datesReady}
                        className="h-[38px] px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Generate"}
                    </button>
                </div>
            </div>

            {loaded && (
                <>
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Filter leads by name, phone, email, city, UTM..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <button
                                onClick={downloadCsv}
                                disabled={exporting || !generated}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 mr-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 whitespace-nowrap"
                            >
                                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                <span>{exporting ? "Downloading CSV..." : "Download CSV"}</span>
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1200px] text-sm">
                            <thead>
                                <tr className="bg-slate-900 text-white text-xs uppercase">
                                    {COLUMNS.map((col) => (
                                        <th key={col} className="p-3 border border-slate-800">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pageRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={COLUMNS.length} className="p-8 text-center text-gray-500">
                                            No leads found matching the current filters.
                                        </td>
                                    </tr>
                                ) : (
                                    pageRows.map((lead) => (
                                        <tr key={String(lead.id)} className="border-b border-gray-200 hover:bg-slate-50">
                                            {COLUMNS.map((col) => (
                                                <td
                                                    key={col}
                                                    className={`p-3 text-gray-700 ${col === "description" ? "max-w-xs" : "whitespace-nowrap"}`}
                                                >
                                                    {lead?.[col] || "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-2 text-sm text-gray-600">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1 border rounded disabled:opacity-40"
                        >
                            Prev
                        </button>
                        <span>
                            Page {page} / {totalPages}
                        </span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="px-3 py-1 border rounded disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
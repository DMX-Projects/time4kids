"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Download, FileText, School } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";
import { formatHolidayDate, parseHolidayEntries, type HolidayEntry } from "@/config/holiday-entries";
import { openParentDocumentFile } from "@/lib/parent-document-file-open";

type HolidayDoc = {
    id: number;
    title: string;
    display_title?: string;
    state?: string | null;
    state_display?: string | null;
    academic_year?: string;
    franchise?: number | null;
    franchise_name?: string | null;
    source_label?: string;
    file?: string;
    file_view_path?: string | null;
    holiday_entries?: HolidayEntry[] | unknown;
    created_at?: string;
    updated_at?: string;
};

type HolidayPdfDownload = {
    sourceType: "head_office" | "centre";
    sourceName: string;
    title: string;
    openDoc: { id: number; title: string; file: string; display_title?: string };
};

type PreparedHoliday = {
    id: number;
    label: string;
    state_display?: string | null;
    academic_year?: string;
    entries: HolidayEntry[];
    pdfDownloads: HolidayPdfDownload[];
    openDoc: { id: number; title: string; file: string; display_title?: string };
};

const normalizeDocs = (data: unknown): HolidayDoc[] => {
    if (Array.isArray(data)) return data as HolidayDoc[];
    if (data && typeof data === "object") {
        const obj = data as { results?: unknown; data?: unknown; documents?: unknown };
        if (Array.isArray(obj.results)) return obj.results as HolidayDoc[];
        if (Array.isArray(obj.data)) return obj.data as HolidayDoc[];
        if (Array.isArray(obj.documents)) return obj.documents as HolidayDoc[];
    }
    return [];
};

function holidayStateKey(doc: HolidayDoc): string {
    return `${doc.state || ""}|${doc.academic_year || ""}`;
}

function docHasFile(doc: HolidayDoc | undefined): boolean {
    if (!doc) return false;
    return Boolean((doc.file || "").trim() || (doc.file_view_path || "").trim());
}

function docUpdatedTime(doc: HolidayDoc): number {
    return new Date(doc.updated_at ?? doc.created_at ?? 0).getTime() || 0;
}

function centreSourceName(doc: HolidayDoc): string {
    return (doc.franchise_name || doc.source_label || "Your centre").trim();
}

function collectPdfDownloads(group: HolidayDoc[]): HolidayPdfDownload[] {
    return [...group]
        .filter(docHasFile)
        .sort((a, b) => {
            const aHo = a.franchise == null ? 0 : 1;
            const bHo = b.franchise == null ? 0 : 1;
            if (aHo !== bHo) return aHo - bHo;
            return docUpdatedTime(b) - docUpdatedTime(a);
        })
        .map((doc) => {
            const isCentre = doc.franchise != null;
            return {
                sourceType: isCentre ? "centre" : "head_office",
                sourceName: isCentre ? centreSourceName(doc) : "Head office",
                title: doc.display_title || doc.title || (isCentre ? "Centre holiday list" : "Head office holiday list"),
                openDoc: toOpenDoc(doc),
            };
        });
}

function toOpenDoc(doc: HolidayDoc): PreparedHoliday["openDoc"] {
    return {
        id: doc.id,
        title: doc.title,
        display_title: doc.display_title,
        file: doc.file || doc.file_view_path || "",
    };
}

function toPreparedHoliday(
    display: HolidayDoc,
    pdfDownloads: HolidayPdfDownload[],
    entries: HolidayEntry[],
): PreparedHoliday {
    const primaryPdf = pdfDownloads[0]?.openDoc;
    return {
        id: display.id,
        label: display.display_title || display.title,
        state_display: display.state_display,
        academic_year: display.academic_year,
        entries,
        pdfDownloads,
        openDoc: primaryPdf ?? toOpenDoc(display),
    };
}

function mergeHolidayEntryRows(rows: HolidayEntry[]): HolidayEntry[] {
    const byDate = new Map<string, HolidayEntry>();
    for (const row of rows) {
        const date = (row.date || "").slice(0, 10);
        if (!date) continue;
        byDate.set(date, { city: row.city || "", name: row.name, date });
    }
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/** One card per state/year — HO + centre PDFs and merged manual holiday tables. */
function prepareHolidayDocs(docs: HolidayDoc[]): PreparedHoliday[] {
    const byKey = new Map<string, HolidayDoc[]>();
    const standalone: HolidayDoc[] = [];

    for (const doc of docs) {
        const key = holidayStateKey(doc);
        const hasKey = Boolean(key.replace("|", "").trim());
        if (!hasKey) {
            if (docHasFile(doc) || parseHolidayEntries(doc.holiday_entries).length > 0) {
                standalone.push(doc);
            }
            continue;
        }
        const bucket = byKey.get(key) ?? [];
        bucket.push(doc);
        byKey.set(key, bucket);
    }

    const out: PreparedHoliday[] = [];
    const usedIds = new Set<number>();

    for (const group of Array.from(byKey.values())) {
        const centre = group.find((d) => d.franchise != null);
        const globals = group.filter((d) => d.franchise == null);
        const display = globals[0] ?? centre;
        if (!display) continue;

        const pdfDownloads = collectPdfDownloads(group);
        const entries = mergeHolidayEntryRows(group.flatMap((d) => parseHolidayEntries(d.holiday_entries)));

        if (pdfDownloads.length === 0 && entries.length === 0) continue;

        for (const doc of group) usedIds.add(doc.id);
        out.push(toPreparedHoliday(display, pdfDownloads, entries));
    }

    for (const doc of standalone) {
        if (usedIds.has(doc.id)) continue;
        const entries = parseHolidayEntries(doc.holiday_entries);
        const pdfDownloads = collectPdfDownloads([doc]);
        if (pdfDownloads.length === 0 && entries.length === 0) continue;
        out.push(toPreparedHoliday(doc, pdfDownloads, entries));
    }

    return out.sort((a, b) => a.label.localeCompare(b.label));
}

export function ParentHolidayList() {
    const { authFetch, authFetchBlobResponse, getAccessTokenForDocumentView } = useAuth();
    const { scopedApiPath, studentScopeReady, selectedStudent, hasMultipleChildren } = useParentData();
    const [docs, setDocs] = useState<HolidayDoc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentScopeReady) return;
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const data = await authFetch<unknown>(
                    scopedApiPath("/documents/parent/documents/category/HOLIDAY_LISTS/?wrap=list"),
                );
                if (!cancelled) setDocs(normalizeDocs(data));
            } catch {
                if (!cancelled) setDocs([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [authFetch, scopedApiPath, studentScopeReady]);

    const prepared = useMemo(() => prepareHolidayDocs(docs), [docs]);

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Holiday list</h1>
                        <p className="text-sm text-orange-700">
                            Head office and your centre holiday lists are shown here. Centre-only lists are not repeated on
                            the main dashboard.
                        </p>
                        {hasMultipleChildren && selectedStudent ? (
                            <p className="text-xs text-orange-600 mt-1">
                                Showing holidays for {selectedStudent.name}
                                {selectedStudent.grade ? ` (${selectedStudent.grade})` : ""}.
                            </p>
                        ) : null}
                    </div>
                </div>
            </section>

            {(!studentScopeReady || loading) ? (
                <p className="text-sm text-orange-700">
                    {!studentScopeReady ? "Loading your child's profile…" : "Loading…"}
                </p>
            ) : null}

            {studentScopeReady && !loading && prepared.length > 0 ? (
                <div className="space-y-4">
                    {prepared.map((doc) => (
                        <section key={`${doc.id}-${doc.label}`} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm space-y-4">
                            <div>
                                <h2 className="text-sm font-semibold text-orange-900">{doc.label}</h2>
                                {doc.state_display || doc.academic_year ? (
                                    <p className="text-xs text-orange-700 mt-0.5">
                                        {[doc.state_display, doc.academic_year].filter(Boolean).join(" · ")}
                                    </p>
                                ) : null}
                            </div>

                            {doc.pdfDownloads.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {doc.pdfDownloads.map((pdf) => {
                                        const isHo = pdf.sourceType === "head_office";
                                        return (
                                            <div
                                                key={`${doc.id}-${pdf.openDoc.id}-${pdf.sourceType}`}
                                                className={`rounded-xl border p-3 space-y-2 ${
                                                    isHo
                                                        ? "border-sky-200 bg-sky-50/80"
                                                        : "border-orange-200 bg-orange-50/80"
                                                }`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                                            isHo
                                                                ? "bg-sky-100 text-sky-800 border border-sky-200"
                                                                : "bg-orange-100 text-orange-800 border border-orange-200"
                                                        }`}
                                                    >
                                                        {isHo ? (
                                                            <Building2 className="h-3 w-3" aria-hidden />
                                                        ) : (
                                                            <School className="h-3 w-3" aria-hidden />
                                                        )}
                                                        {isHo ? "Head office" : "Your centre"}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900 leading-snug">{pdf.title}</p>
                                                {!isHo ? (
                                                    <p className="text-xs text-orange-800">{pdf.sourceName}</p>
                                                ) : (
                                                    <p className="text-xs text-sky-800">Published by Time4Kids head office</p>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openParentDocumentFile(
                                                            getAccessTokenForDocumentView,
                                                            authFetchBlobResponse,
                                                            pdf.openDoc,
                                                            selectedStudent?.id,
                                                        )
                                                    }
                                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold border ${
                                                        isHo
                                                            ? "bg-white text-sky-900 border-sky-200 hover:bg-sky-100"
                                                            : "bg-white text-orange-900 border-orange-200 hover:bg-orange-100"
                                                    }`}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    View / download PDF
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null}

                            {doc.entries.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-orange-100">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-orange-50/70 text-left text-xs text-orange-800">
                                            <tr>
                                                <th className="px-3 py-2 font-semibold">Date</th>
                                                <th className="px-3 py-2 font-semibold">Holiday</th>
                                                <th className="px-3 py-2 font-semibold">City</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-orange-50">
                                            {doc.entries.map((row, index) => (
                                                <tr key={`${doc.id}-${index}`}>
                                                    <td className="px-3 py-2 text-orange-900 whitespace-nowrap">
                                                        {formatHolidayDate(row.date)}
                                                    </td>
                                                    <td className="px-3 py-2 text-orange-900 font-medium">{row.name}</td>
                                                    <td className="px-3 py-2 text-orange-800">{row.city || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : null}
                        </section>
                    ))}
                </div>
            ) : null}

            {studentScopeReady && !loading && prepared.length === 0 ? (
                <section className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-6">
                    <p className="text-sm text-orange-900 font-medium">
                        No holiday list added yet. Head office or your centre will add holidays here.
                    </p>
                </section>
            ) : null}
        </div>
    );
}

export default ParentHolidayList;

"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatHolidayDate, parseHolidayEntries, type HolidayEntry } from "@/config/holiday-entries";
import { openParentDocumentFile } from "@/lib/parent-document-file-open";

type HolidayDoc = {
    id: number;
    title: string;
    display_title?: string;
    state_display?: string | null;
    academic_year?: string;
    file?: string;
    file_view_path?: string | null;
    holiday_entries?: HolidayEntry[] | unknown;
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

export function ParentHolidayList() {
    const { authFetch, authFetchBlobResponse, getAccessTokenForDocumentView } = useAuth();
    const [docs, setDocs] = useState<HolidayDoc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await authFetch<unknown>("/documents/parent/documents/category/HOLIDAY_LISTS/");
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
    }, [authFetch]);

    const prepared = useMemo(
        () =>
            docs
                .map((doc) => ({
                    ...doc,
                    entries: parseHolidayEntries(doc.holiday_entries),
                    label: doc.display_title || doc.title,
                    hasFile: Boolean(doc.file || doc.file_view_path),
                }))
                .filter((doc) => doc.entries.length > 0 || doc.hasFile),
        [docs],
    );

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Holiday list</h1>
                        <p className="text-sm text-orange-700">Academic year holidays for your state / centre.</p>
                    </div>
                </div>
            </section>

            {loading ? <p className="text-sm text-orange-700">Loading…</p> : null}

            {!loading && prepared.length > 0 ? (
                <div className="space-y-4">
                    {prepared.map((doc) => (
                        <section key={doc.id} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm space-y-3">
                            <div>
                                <h2 className="text-sm font-semibold text-orange-900">{doc.label}</h2>
                                {doc.state_display || doc.academic_year ? (
                                    <p className="text-xs text-orange-700 mt-0.5">
                                        {[doc.state_display, doc.academic_year].filter(Boolean).join(" · ")}
                                    </p>
                                ) : null}
                            </div>

                            {doc.hasFile ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, {
                                            id: doc.id,
                                            title: doc.label,
                                            file: doc.file || doc.file_view_path || "",
                                        })
                                    }
                                    className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-800 border border-orange-100 hover:bg-orange-100"
                                >
                                    <Download className="w-4 h-4" />
                                    View / download PDF
                                </button>
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

            {!loading && prepared.length === 0 ? (
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

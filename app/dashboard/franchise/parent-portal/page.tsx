"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchAllApiList } from "@/lib/parent-school-api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { jsonHeaders } from "@/lib/api-client";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";
import { openNewsletterVideoEmbedLink, openParentDocumentAudioFile, openParentDocumentFile } from "@/lib/parent-document-file-open";
import {
    PARENT_NEWSLETTER_LABEL,
    newsletterRowKind,
    newsletterKindLabel,
} from "@/config/parent-newsletter";
import { DEFAULT_HOLIDAY_ACADEMIC_YEAR } from "@/config/parent-document-categories";
import {
    filterHolidayEntries,
    formatHolidayDate,
    formatHolidayDateFilter,
    holidayEntryYears,
    monthSelectOptions,
    parseHolidayEntries,
    type HolidayEntry,
} from "@/config/holiday-entries";
import HolidayEntriesReadOnly from "@/components/dashboard/HolidayEntriesReadOnly";
import { CENTRE_PROGRAM_LABELS } from "@/config/centre-program-cards-defaults";
import dynamic from "next/dynamic";

const HOMEWORK_CLASS_OPTIONS = [
    { value: "", label: "All classes" },
    ...CENTRE_PROGRAM_LABELS.map((p) => ({ value: p.label, label: p.label })),
];

const HOMEWORK_CARD_PREVIEW = 3;
const HOMEWORK_VISIBLE_CLASSES = 3;

/** Existing franchise pages — embedded here instead of separate sidebar links. */
const FranchiseAttendancePanel = dynamic(
    () => import("@/components/dashboard/franchise/FranchiseAttendancePanel").then((m) => m.FranchiseAttendancePanel),
    { ssr: false },
);
const ParentPortalCalendarPanel = dynamic(
    () => import("@/components/dashboard/shared/ParentPortalCalendarPanel").then((m) => m.ParentPortalCalendarPanel),
    { ssr: false },
);
const FranchiseEventsPanel = dynamic(() => import("../events/page"), { ssr: false });
type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
type ShowToastFn = (message: string, variant?: "success" | "error") => void;

type MiniStudent = { id: number; full_name: string; class_name: string };

/** API dates may arrive as YYYY-MM-DD or ISO datetime — compare using first 10 chars. */
const homeworkDate = (value: string | undefined | null) => String(value || "").slice(0, 10);

const formatUploadDate = (value: string | undefined | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return homeworkDate(value);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const todayLocal = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const normalizeList = <T,>(data: unknown): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object") {
        const obj = data as { results?: unknown[]; homework?: unknown[]; data?: unknown[] };
        if (Array.isArray(obj.results)) return obj.results as T[];
        if (Array.isArray(obj.homework)) return obj.homework as T[];
        if (Array.isArray(obj.data)) return obj.data as T[];
    }
    return [];
};

/**
 * Matches parent login sidebar (`config/parent-sidebar-nav.tsx`).
 * Former sidebar items Attendance and Event Gallery are embedded here as tabs.
 * Add Grades is a separate sidebar link (`/dashboard/franchise/add-grades/`).
 */
type Tab =
    | "homework"
    | "notifications"
    | "timetable"
    | "transport"
    | "calendar"
    | "showcase"
    | "fees"
    | "holidays";

const TAB_CONFIG: { id: Tab; label: string }[] = [
    { id: "homework", label: "Homework" },
    { id: "notifications", label: "Notifications" },
    { id: "timetable", label: "Newsletter" },
    { id: "transport", label: "Transport" },
    { id: "calendar", label: "Calendar & Attendance" },
    { id: "showcase", label: "Event Gallery" },
    { id: "fees", label: "Fee" },
    { id: "holidays", label: "Holiday list" },
];

const TAB_IDS = new Set<Tab>(TAB_CONFIG.map((t) => t.id));

function parseTabParam(value: string | null): Tab | null {
    if (!value || !TAB_IDS.has(value as Tab)) return null;
    return value as Tab;
}

export default function ParentPortalAdminPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { authFetch } = useAuth();
    const { showToast } = useToast();
    const [tab, setTab] = useState<Tab>("homework");
    const [students, setStudents] = useState<MiniStudent[]>([]);

    useEffect(() => {
        if (searchParams.get("tab") === "grades") {
            router.replace("/dashboard/franchise/add-grades/");
            return;
        }
        if (searchParams.get("tab") === "support") {
            router.replace("/dashboard/franchise/parent-tickets/");
            return;
        }
        const fromUrl = parseTabParam(searchParams.get("tab"));
        if (fromUrl) setTab(fromUrl);
    }, [searchParams, router]);

    const selectTab = (id: Tab) => {
        setTab(id);
        router.replace(`/dashboard/franchise/parent-portal/?tab=${id}`, { scroll: false });
    };

    const loadStudents = useCallback(async () => {
        try {
            const rows = await fetchAllApiList(authFetch, "/students/franchise/students/mini/");
            setStudents(rows as MiniStudent[]);
        } catch {
            setStudents([]);
        }
    }, [authFetch]);

    useEffect(() => {
        void loadStudents();
    }, [loadStudents]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
                    <LayoutGrid className="w-7 h-7 text-orange-500" />
                    Parent App
                </h1>
                <p className="text-sm text-[#374151] mt-1">
                    Manage what parents see in the app. Holiday lists, newsletters, and notifications are uploaded by
                    head office only — centres can view them here. Homework, fees, transport, and other tabs are still
                    managed at your centre.
                </p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-2">
                {TAB_CONFIG.map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => selectTab(id)}
                        className={`rounded-full px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${tab === id ? "bg-[#FFF4CC] text-[#111827]" : "text-[#6B7280] hover:bg-[#F3F4F6]"}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === "homework" && <HomeworkTab authFetch={authFetch} showToast={showToast} onRefresh={loadStudents} />}
            {tab === "notifications" && <AnnouncementsTab authFetch={authFetch} />}
            {tab === "timetable" && <NewsLetterTab authFetch={authFetch} />}
            {tab === "transport" && <TransportTab authFetch={authFetch} showToast={showToast} />}
            {tab === "calendar" && <CalendarAttendanceTab />}
            {tab === "showcase" && <FranchiseEventsPanel />}
            {tab === "fees" && <FeesTab authFetch={authFetch} showToast={showToast} students={students} />}
            {tab === "holidays" && <HolidayListTab authFetch={authFetch} />}
        </div>
    );
}

type NewsLetterRow = {
    id: number;
    title: string;
    display_title?: string;
    file: string;
    video_embed_url?: string;
    audio_file?: string;
    audio_embed_url?: string;
    period_start?: string | null;
    period_end?: string | null;
    created_at?: string;
};

const newsletterRowDate = (row: NewsLetterRow) =>
    homeworkDate(row.period_start) || homeworkDate(row.period_end) || homeworkDate(row.created_at) || "—";

const newsletterCoversDate = (row: NewsLetterRow, date: string) => {
    const start = homeworkDate(row.period_start);
    const end = homeworkDate(row.period_end);
    const created = homeworkDate(row.created_at);
    if (start && end && date >= start && date <= end) return true;
    return start === date || end === date || created === date;
};

const apiErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error && err.message.trim() ? err.message : fallback;

function CalendarAttendanceTab() {
    const [attendanceDate, setAttendanceDate] = useState(todayLocal);

    return (
        <div className="space-y-6">
            <ParentPortalCalendarPanel
                mode="franchise"
                linkedDate={attendanceDate}
                onLinkedDateChange={setAttendanceDate}
            />
            <FranchiseAttendancePanel controlledDate={attendanceDate} onControlledDateChange={setAttendanceDate} />
        </div>
    );
}

function NewsLetterTab({ authFetch }: { authFetch: AuthFetchFn; showToast?: ShowToastFn }) {
    const { authFetchBlobResponse, getAccessTokenForDocumentView } = useAuth();
    const [rows, setRows] = useState<NewsLetterRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [trackDate, setTrackDate] = useState(todayLocal);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ manage: "newsletter", date: trackDate });
            const data = await authFetch<unknown>(`/documents/franchise/parent-documents/?${params.toString()}`);
            setRows(normalizeList<NewsLetterRow>(data));
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, trackDate]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <div className="max-w-2xl rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4">
            <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#111827]">{PARENT_NEWSLETTER_LABEL}</h3>
                <p className="text-xs text-[#6B7280]">
                    Uploaded by head office. View what parents see for the selected date.
                </p>
            </div>
            <label className="block text-xs font-semibold text-[#4B5563]">
                Track date
                <input
                    type="date"
                    value={trackDate}
                    onChange={(e) => setTrackDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                />
            </label>
            {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : null}
            {!loading && rows.length === 0 ? (
                <p className="text-sm text-center text-[#6B7280] rounded-xl border border-dashed border-[#E5E7EB] px-4 py-8">
                    No newsletter for {trackDate}. Head office adds these in Admin → Parent documents.
                </p>
            ) : null}
            {!loading && rows.length > 0 ? (
                <ul className="divide-y border rounded-xl max-h-[420px] overflow-y-auto">
                    {rows.map((row) => {
                        const kind = newsletterRowKind(row);
                        const openRow = () => {
                            if (kind === "video") {
                                openNewsletterVideoEmbedLink(row.video_embed_url || "", row.display_title || row.title);
                                return;
                            }
                            if (kind === "audio") {
                                if (row.audio_file) {
                                    openParentDocumentAudioFile(getAccessTokenForDocumentView, authFetchBlobResponse, row);
                                } else if (row.audio_embed_url) {
                                    window.open(row.audio_embed_url, "_blank", "noopener,noreferrer");
                                }
                                return;
                            }
                            if (row.file) {
                                openParentDocumentFile(getAccessTokenForDocumentView, authFetchBlobResponse, row);
                            }
                        };
                        return (
                            <li key={row.id} className="px-4 py-3 text-sm">
                                <button
                                    type="button"
                                    onClick={openRow}
                                    className="w-full text-left font-medium text-[#1F2937] hover:text-[#FF922B] hover:underline"
                                >
                                    <span className="block truncate">{row.display_title || row.title}</span>
                                    <span className="block text-[11px] text-[#6B7280] mt-0.5 font-normal">
                                        {newsletterRowDate(row)} · {newsletterKindLabel(kind)}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </div>
    );
}


type HolidayRow = {
    id: number;
    title: string;
    display_title?: string;
    file: string;
    file_view_path?: string | null;
    state?: string | null;
    state_display?: string | null;
    academic_year?: string;
    franchise?: number | null;
    holiday_entries?: HolidayEntry[] | unknown;
    created_at?: string;
    updated_at?: string;
};

function holidayRowHasFile(row: HolidayRow | null | undefined): boolean {
    if (!row) return false;
    return Boolean((row.file || "").trim() || (row.file_view_path || "").trim());
}

function holidayRowOpenDoc(row: HolidayRow) {
    return {
        id: row.id,
        title: row.title,
        display_title: row.display_title,
        file: row.file || row.file_view_path || "",
    };
}

type HolidayStateGroup = {
    state: string;
    stateDisplay: string;
    academicYear: string;
    global: HolidayRow | null;
    centre: HolidayRow | null;
};

function HolidayListTab({ authFetch }: { authFetch: AuthFetchFn }) {
    const { authFetchBlobResponse, getAccessTokenForDocumentView } = useAuth();
    const [rows, setRows] = useState<HolidayRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [trackMonth, setTrackMonth] = useState("");
    const [trackYear, setTrackYear] = useState("");
    const [trackDate, setTrackDate] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ manage: "holidays" });
            const data = await authFetch<unknown>(`/documents/franchise/parent-documents/?${params.toString()}`);
            setRows(normalizeList<HolidayRow>(data));
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    const stateGroups = useMemo((): HolidayStateGroup[] => {
        const globalRows = rows.filter((r) => !r.franchise);
        const states = new Set<string>();
        for (const row of globalRows) {
            if (row.state) states.add(row.state);
        }
        return Array.from(states)
            .sort((a, b) => {
                const labelA = globalRows.find((g) => g.state === a)?.state_display || a;
                const labelB = globalRows.find((g) => g.state === b)?.state_display || b;
                return labelA.localeCompare(labelB);
            })
            .map((state) => {
                const global = globalRows.find((g) => g.state === state) ?? null;
                return {
                    state,
                    stateDisplay: global?.state_display || state,
                    academicYear: global?.academic_year || DEFAULT_HOLIDAY_ACADEMIC_YEAR,
                    global,
                    centre: null,
                };
            });
    }, [rows]);

    const selectedGroup = useMemo(() => {
        if (!stateGroups.length) return null;
        return stateGroups.find((g) => g.state === selectedState) ?? stateGroups[0];
    }, [stateGroups, selectedState]);

    const holidayFilterYears = useMemo(() => {
        if (!selectedGroup) return [];
        return holidayEntryYears(parseHolidayEntries(selectedGroup.global?.holiday_entries));
    }, [selectedGroup]);

    const holidayFilterLabel = formatHolidayDateFilter(trackMonth, trackYear, trackDate);

    useEffect(() => {
        if (!stateGroups.length) {
            setSelectedState(null);
            return;
        }
        if (!selectedState || !stateGroups.some((g) => g.state === selectedState)) {
            setSelectedState(stateGroups[0].state);
        }
    }, [stateGroups, selectedState]);

    const renderHolidayDateFilters = (years: string[]) => (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 space-y-2">
            <p className="text-[11px] font-semibold text-[#374151]">Filter by date</p>
            <div className="flex flex-wrap items-end gap-3">
                <label className="block text-[11px] font-semibold text-[#4B5563]">
                    Date
                    <input
                        type="date"
                        value={trackDate}
                        onChange={(e) => {
                            const next = e.target.value.slice(0, 10);
                            setTrackDate(next);
                            if (next.length >= 10) {
                                setTrackYear(next.slice(0, 4));
                                setTrackMonth(next.slice(5, 7));
                            }
                        }}
                        className="mt-1 block w-full min-w-[9.5rem] rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 text-xs"
                    />
                </label>
                <label className="block text-[11px] font-semibold text-[#4B5563]">
                    Month
                    <select
                        value={trackMonth}
                        onChange={(e) => {
                            setTrackMonth(e.target.value);
                            setTrackDate("");
                        }}
                        className="mt-1 block w-full min-w-[7.5rem] rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 text-xs"
                    >
                        {monthSelectOptions().map((opt) => (
                            <option key={opt.value || "all"} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="block text-[11px] font-semibold text-[#4B5563]">
                    Year
                    <select
                        value={trackYear}
                        onChange={(e) => {
                            setTrackYear(e.target.value);
                            setTrackDate("");
                        }}
                        className="mt-1 block w-full min-w-[5.5rem] rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 text-xs"
                    >
                        <option value="">All years</option>
                        {years.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </label>
                {trackDate || trackMonth || trackYear ? (
                    <button
                        type="button"
                        onClick={() => {
                            setTrackDate("");
                            setTrackMonth("");
                            setTrackYear("");
                        }}
                        className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:bg-[#F3F4F6]"
                    >
                        Clear
                    </button>
                ) : null}
            </div>
            <p className="text-[10px] text-[#6B7280]">Showing: {holidayFilterLabel}</p>
        </div>
    );

    const renderHolidayListCard = (group: HolidayStateGroup) => {
        const globalEntries = parseHolidayEntries(group.global?.holiday_entries);
        const merged = globalEntries;
        const filteredMerged = filterHolidayEntries(merged, {
            month: trackMonth,
            year: trackYear,
            date: trackDate,
        });
        const adminHasPdf = holidayRowHasFile(group.global);
        const parentsPdfSource = adminHasPdf && group.global ? group.global : null;

        return (
            <div className="rounded-xl border border-[#BFDBFE] bg-[#F8FAFC] p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="font-semibold text-[#111827]">{group.stateDisplay}</p>
                        <p className="text-[11px] text-[#6B7280]">{group.academicYear}</p>
                    </div>
                </div>

                {parentsPdfSource ? (
                    <button
                        type="button"
                        onClick={() =>
                            openParentDocumentFile(
                                getAccessTokenForDocumentView,
                                authFetchBlobResponse,
                                holidayRowOpenDoc(parentsPdfSource),
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] hover:bg-[#EFF6FF]"
                    >
                        View holiday PDF (head office)
                    </button>
                ) : null}

                {merged.length > 0 ? (
                    filteredMerged.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white px-2 py-2">
                            <table className="min-w-full text-xs">
                                <thead>
                                    <tr className="text-left text-slate-500">
                                        <th className="px-2 py-1 font-semibold">Date</th>
                                        <th className="px-2 py-1 font-semibold">Holiday</th>
                                        <th className="px-2 py-1 font-semibold">City</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMerged.map((row, index) => (
                                        <tr key={`${row.date}-${index}`} className="text-slate-800">
                                            <td className="px-2 py-1 whitespace-nowrap">{formatHolidayDate(row.date)}</td>
                                            <td className="px-2 py-1 font-medium">{row.name}</td>
                                            <td className="px-2 py-1">{row.city || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-[#6B7280] text-center rounded-lg border border-dashed border-[#E5E7EB] bg-white px-4 py-6">
                            No holidays in {holidayFilterLabel}. Change date, month, or year above.
                        </p>
                    )
                ) : (
                    <p className="text-sm text-[#6B7280] text-center rounded-lg border border-dashed border-[#E5E7EB] bg-white px-4 py-6">
                        No holidays from head office yet for this state.
                    </p>
                )}
            </div>
        );
    };

    const renderHolidayTracking = (group: HolidayStateGroup) => {
        const globalEntries = parseHolidayEntries(group.global?.holiday_entries);
        const allAdminRows = globalEntries;
        const filteredAdmin = filterHolidayEntries(allAdminRows, {
            month: trackMonth,
            year: trackYear,
            date: trackDate,
        });
        const adminHasPdf = holidayRowHasFile(group.global);
        const adminUpdated = formatUploadDate(group.global?.updated_at || group.global?.created_at);

        return (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span
                        className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${
                            adminHasPdf ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
                        }`}
                    >
                        PDF {adminHasPdf ? "uploaded" : "missing"}
                    </span>
                    <span className="text-[#64748B]">Updated {adminUpdated}</span>
                </div>

                {group.global && adminHasPdf ? (
                    <button
                        type="button"
                        onClick={() =>
                            openParentDocumentFile(
                                getAccessTokenForDocumentView,
                                authFetchBlobResponse,
                                holidayRowOpenDoc(group.global!),
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] hover:bg-[#DBEAFE]"
                    >
                        View admin PDF
                    </button>
                ) : (
                    <p className="text-[11px] text-[#64748B]">No admin PDF for this state.</p>
                )}

                {allAdminRows.length > 0 ? (
                    filteredAdmin.length > 0 ? (
                        <HolidayEntriesReadOnly
                            rows={filteredAdmin}
                            title={`Admin holidays — ${holidayFilterLabel} (${filteredAdmin.length})`}
                            emptyMessage=""
                        />
                    ) : (
                        <p className="text-[11px] text-[#6B7280]">No admin holidays in {holidayFilterLabel}.</p>
                    )
                ) : (
                    <p className="text-[11px] text-[#6B7280]">Admin has not added holiday rows for this state.</p>
                )}
            </div>
        );
    };

    return (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start max-w-5xl">
            {!loading && selectedGroup ? (
                <div className="lg:col-span-2">{renderHolidayDateFilters(holidayFilterYears)}</div>
            ) : null}

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[#111827]">Holiday list</h3>
                    <p className="text-xs text-[#6B7280]">
                        Managed by head office for your state. View-only — parents see this list in the app.
                    </p>
                </div>

                {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : null}

                {!loading && stateGroups.length > 1 ? (
                    <div className="flex flex-wrap gap-2">
                        {stateGroups.map((group) => (
                            <button
                                key={group.state}
                                type="button"
                                onClick={() => setSelectedState(group.state)}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                                    selectedGroup?.state === group.state
                                        ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]"
                                        : "bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"
                                }`}
                            >
                                {group.stateDisplay}
                            </button>
                        ))}
                    </div>
                ) : null}

                {!loading && stateGroups.length === 0 ? (
                    <p className="text-sm text-[#6B7280]">
                        No holiday list for your state yet. Head office adds it in Admin CMS → Parent documents → Holiday Lists.
                    </p>
                ) : null}

                {!loading && selectedGroup ? renderHolidayListCard(selectedGroup) : null}
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-3 lg:sticky lg:top-4 flex flex-col max-h-[calc(100vh-6rem)] overflow-y-auto">
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[#111827]">Tracking</h3>
                    {selectedGroup ? (
                        <p className="text-xs text-[#6B7280]">
                            {selectedGroup.stateDisplay} · {selectedGroup.academicYear}
                        </p>
                    ) : (
                        <p className="text-xs text-[#6B7280]">Admin upload for selected state.</p>
                    )}
                </div>
                {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : null}
                {!loading && selectedGroup ? renderHolidayTracking(selectedGroup) : null}
            </div>
        </div>
    );
}

type HomeworkRow = {
    id: number;
    title: string;
    description?: string;
    class_name?: string;
    assigned_date: string;
    attachment?: string | null;
    attachment_name?: string;
    attachment_kind?: string;
    read_count?: number;
    viewed_by_parents?: any[];
};

function HomeworkTab({
    authFetch,
    showToast,
    onRefresh,
}: {
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
    onRefresh: () => void;
}) {
    const [rows, setRows] = useState<HomeworkRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        class_name: "",
        assigned_date: todayLocal(),
        title: "",
        description: "",
        attachment: null as File | null,
    });
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [editModal, setEditModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [editSaving, setEditSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        class_name: "",
        assigned_date: "",
        title: "",
        description: "",
        attachment: null as File | null,
        existingAttachmentName: "",
    });
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [trackDate, setTrackDate] = useState(todayLocal);
    const [viewAllOpen, setViewAllOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authFetch<unknown>(
                `/students/franchise/homework/?assigned_date=${encodeURIComponent(trackDate)}`,
            );
            setRows(normalizeList<HomeworkRow>(data));
        } catch {
            showToast("Failed to load homework", "error");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, trackDate, showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const normalizedClassName = form.class_name.trim();

            if (form.attachment) {
                const maxSize = 5 * 1024 * 1024;
                if (form.attachment.size > maxSize) {
                    showToast("Attachment too large. Max 5MB.", "error");
                    return;
                }
                const ct = (form.attachment.type || "").toLowerCase();
                const isPdf = ct === "application/pdf" || form.attachment.name.toLowerCase().endsWith(".pdf");
                const isImage = ct.startsWith("image/");
                if (!isPdf && !isImage) {
                    showToast("Only image or PDF attachments allowed.", "error");
                    return;
                }

                const fd = new FormData();
                fd.append("title", form.title.trim());
                fd.append("description", form.description.trim());
                fd.append("assigned_date", form.assigned_date);
                fd.append("class_name", normalizedClassName);
                fd.append("attachment", form.attachment);
                fd.append("attachment_name", form.attachment.name);
                fd.append("attachment_kind", isPdf ? "PDF" : "IMAGE");
                await authFetch("/students/franchise/homework/", { method: "POST", body: fd });
            } else {
                const body: Record<string, unknown> = {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    assigned_date: form.assigned_date,
                    class_name: normalizedClassName,
                };
                body.student = null;
                await authFetch("/students/franchise/homework/", { method: "POST", headers: jsonHeaders(), body: JSON.stringify(body) });
            }

            const uploadedDate = form.assigned_date.trim() || trackDate;
            setForm({ class_name: "", assigned_date: todayLocal(), title: "", description: "", attachment: null });
            setTrackDate(uploadedDate);
            setSelectedClass(null);
            showToast("Homework published", "success");
            onRefresh();
        } catch {
            showToast("Save failed", "error");
        }
    };

    const remove = async (id: number) => {
        try {
            await authFetch(`/students/franchise/homework/${id}/`, { method: "DELETE" });
            showToast("Deleted", "success");
            await load();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    const openEdit = async (row: HomeworkRow) => {
        try {
            const detail = await authFetch<HomeworkRow>(`/students/franchise/homework/${row.id}/`);
            setEditForm({
                class_name: detail.class_name?.trim() || "",
                assigned_date: detail.assigned_date || "",
                title: detail.title || "",
                description: detail.description || "",
                attachment: null,
                existingAttachmentName: detail.attachment_name || "",
            });
            setEditModal({ isOpen: true, id: row.id });
        } catch {
            showToast("Could not load homework", "error");
        }
    };

    const closeEdit = () => {
        setEditModal({ isOpen: false, id: null });
        setEditForm({
            class_name: "",
            assigned_date: "",
            title: "",
            description: "",
            attachment: null,
            existingAttachmentName: "",
        });
    };

    const saveEdit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editModal.id) return;

        try {
            setEditSaving(true);
            const normalizedClassName = editForm.class_name.trim();

            if (editForm.attachment) {
                const maxSize = 5 * 1024 * 1024;
                if (editForm.attachment.size > maxSize) {
                    showToast("Attachment too large. Max 5MB.", "error");
                    return;
                }
                const ct = (editForm.attachment.type || "").toLowerCase();
                const isPdf = ct === "application/pdf" || editForm.attachment.name.toLowerCase().endsWith(".pdf");
                const isImage = ct.startsWith("image/");
                if (!isPdf && !isImage) {
                    showToast("Only image or PDF attachments allowed.", "error");
                    return;
                }

                const fd = new FormData();
                fd.append("title", editForm.title.trim());
                fd.append("description", editForm.description.trim());
                fd.append("assigned_date", editForm.assigned_date);
                fd.append("class_name", normalizedClassName);
                fd.append("attachment", editForm.attachment);
                fd.append("attachment_name", editForm.attachment.name);
                fd.append("attachment_kind", isPdf ? "PDF" : "IMAGE");
                await authFetch(`/students/franchise/homework/${editModal.id}/`, { method: "PATCH", body: fd });
            } else {
                await authFetch(`/students/franchise/homework/${editModal.id}/`, {
                    method: "PATCH",
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        title: editForm.title.trim(),
                        description: editForm.description.trim(),
                        assigned_date: editForm.assigned_date,
                        class_name: normalizedClassName,
                    }),
                });
            }

            closeEdit();
            showToast("Homework updated", "success");
            await load();
            onRefresh();
        } catch {
            showToast("Update failed", "error");
        } finally {
            setEditSaving(false);
        }
    };

    const classLabels = useMemo(() => {
        const fromOptions = HOMEWORK_CLASS_OPTIONS.filter((o) => o.value).map((o) => o.label);
        const fromRows = rows.map((r) => r.class_name?.trim() || "").filter(Boolean);
        return Array.from(new Set([...fromOptions, ...fromRows]));
    }, [rows]);

    const postedClassesForDate = useMemo(() => {
        const posted = new Set<string>();
        const hasAllClasses = rows.some(
            (r) => homeworkDate(r.assigned_date) === trackDate && !(r.class_name || "").trim(),
        );
        if (hasAllClasses) {
            classLabels.forEach((c) => posted.add(c));
        }
        for (const r of rows) {
            if (homeworkDate(r.assigned_date) === trackDate) {
                const name = r.class_name?.trim();
                if (name) posted.add(name);
            }
        }
        return posted;
    }, [rows, trackDate, classLabels]);

    const pendingClasses = useMemo(
        () => classLabels.filter((c) => !postedClassesForDate.has(c)),
        [classLabels, postedClassesForDate],
    );

    const listRows = useMemo(
        () => rows.filter((r) => homeworkDate(r.assigned_date) === trackDate),
        [rows, trackDate],
    );

    const byClass = useMemo(() => {
        const m = new Map<string, typeof rows>();
        for (const r of listRows) {
            const key = r.class_name?.trim() || "All classes";
            m.set(key, [...(m.get(key) || []), r]);
        }
        return Array.from(m.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([className, items]) => [className, [...items].sort((a, b) => b.id - a.id)] as const);
    }, [listRows]);

    const visibleByClass = useMemo(
        () => (selectedClass ? byClass.filter(([name]) => name === selectedClass) : byClass),
        [byClass, selectedClass],
    );

    const totalItemCount = useMemo(
        () => visibleByClass.reduce((count, [, items]) => count + items.length, 0),
        [visibleByClass],
    );

    const previewClasses = useMemo(() => visibleByClass.slice(0, HOMEWORK_VISIBLE_CLASSES), [visibleByClass]);

    const shownItemCount = useMemo(
        () => previewClasses.reduce((count, [, items]) => count + Math.min(items.length, HOMEWORK_CARD_PREVIEW), 0),
        [previewClasses],
    );

    const showViewAll =
        totalItemCount > shownItemCount || visibleByClass.length > HOMEWORK_VISIBLE_CLASSES;

    useEffect(() => {
        if (viewAllOpen && totalItemCount === 0) setViewAllOpen(false);
    }, [viewAllOpen, totalItemCount]);

    const renderHomeworkRow = (r: HomeworkRow) => (
        <li key={r.id} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
            <span className="font-medium text-[#1F2937] min-w-0">{r.title}</span>
            <div className="flex items-center gap-3 shrink-0">
                <button type="button" className="text-[#2563EB] text-xs font-semibold" onClick={() => void openEdit(r)}>
                    Edit
                </button>
                <button
                    type="button"
                    className="text-red-600 text-xs font-semibold"
                    onClick={() => setConfirmDelete({ isOpen: true, id: r.id })}
                >
                    Delete
                </button>
            </div>
        </li>
    );

    return (
        <div className="space-y-4">
            <form onSubmit={submit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 grid md:grid-cols-2 gap-3">
                <div className="md:col-span-2 grid gap-3 grid-cols-1 sm:grid-cols-2 items-end">
                    <label className="text-xs font-semibold text-[#4B5563] min-w-0">
                        Title
                        <input
                            required
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#FF922B] focus:outline-none"
                            placeholder="e.g. Alphabet practice"
                        />
                    </label>
                    <label className="text-xs font-semibold text-[#4B5563] min-w-0">
                        Class name
                        <select
                            value={form.class_name}
                            onChange={(e) => setForm((p) => ({ ...p, class_name: e.target.value }))}
                            className="mt-1 w-full min-w-0 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] bg-white focus:border-[#FF922B] focus:outline-none"
                        >
                            {HOMEWORK_CLASS_OPTIONS.map((opt) => (
                                <option key={opt.value || "all"} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <label className="text-xs font-semibold text-[#4B5563]">
                    Date
                    <input type="date" required value={form.assigned_date} onChange={(e) => setForm((p) => ({ ...p, assigned_date: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                    <span className="mt-1 block text-[11px] font-normal text-[#6B7280]">
                        Parents only see homework on this date (from midnight IST), not before.
                    </span>
                </label>
                <label className="text-xs font-semibold text-[#4B5563] md:col-span-2">
                    Description
                    <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold text-[#4B5563] md:col-span-2">
                    Attachment (optional: image or PDF, max 5MB)
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setForm((p) => ({ ...p, attachment: e.target.files?.[0] || null }))}
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-white"
                    />
                </label>
                <Button type="submit" className="md:col-span-2 bg-[#FF922B] text-white w-fit">
                    Add homework
                </Button>
            </form>
            <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-3 lg:sticky lg:top-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-[#111827]">Homework by class</h3>
                            <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-700 border border-orange-100">
                                {trackDate}
                            </span>
                        </div>
                        {selectedClass ? (
                            <button
                                type="button"
                                onClick={() => setSelectedClass(null)}
                                className="text-xs font-semibold text-[#FF922B] hover:underline"
                            >
                                Show all classes
                            </button>
                        ) : null}
                    </div>
                    <p className="text-xs text-[#6B7280]">
                        Linked to the track date on the right. Preview shows a few classes — use View all for the full list.
                    </p>
                    {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : null}
                    {!loading && visibleByClass.length === 0 ? (
                        <p className="text-sm text-[#6B7280] rounded-xl border border-dashed border-[#E5E7EB] px-4 py-8 text-center">
                            {selectedClass
                                ? `No homework posted for ${selectedClass} on ${trackDate}.`
                                : `No homework posted for ${trackDate}. Change the track date on the right.`}
                        </p>
                    ) : (
                        <>
                            <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
                                {previewClasses.map(([className, items]) => {
                                    const previewItems = items.slice(0, HOMEWORK_CARD_PREVIEW);
                                    return (
                                        <div key={className} className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
                                            <div className="flex items-center justify-between gap-2 border-b border-[#F3F4F6] bg-[#FFFBEB] px-4 py-2">
                                                <span className="text-xs font-bold text-orange-800">{className}</span>
                                                <span className="text-[10px] font-semibold text-orange-600">
                                                    {items.length} item{items.length === 1 ? "" : "s"}
                                                </span>
                                            </div>
                                            <ul className="divide-y">{previewItems.map((r) => renderHomeworkRow(r))}</ul>
                                        </div>
                                    );
                                })}
                            </div>
                            {showViewAll ? (
                                <button
                                    type="button"
                                    onClick={() => setViewAllOpen(true)}
                                    className="w-full rounded-xl border border-orange-100 bg-orange-50 px-4 py-2.5 text-xs font-bold text-[#FF922B] transition-colors hover:bg-orange-100"
                                >
                                    View all ({totalItemCount})
                                </button>
                            ) : null}
                        </>
                    )}
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4 lg:sticky lg:top-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-[#111827]">Pending homework tracker</h3>
                        <p className="text-xs text-[#6B7280]">See which classes still need homework posted for a date.</p>
                    </div>
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Track date
                        <input
                            type="date"
                            value={trackDate}
                            onChange={(e) => {
                                setTrackDate(e.target.value);
                                setSelectedClass(null);
                            }}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700">
                            Posted: {postedClassesForDate.size}
                        </span>
                        <span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700">
                            Pending: {pendingClasses.length}
                        </span>
                    </div>
                    <ul className="divide-y border rounded-xl max-h-[420px] overflow-y-auto">
                        {classLabels.map((className) => {
                            const isPosted = postedClassesForDate.has(className);
                            return (
                                <li key={className}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedClass(className)}
                                        className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#F9FAFB] ${
                                            selectedClass === className ? "bg-orange-50" : ""
                                        }`}
                                    >
                                        <span className="font-medium text-[#1F2937] min-w-0 truncate">{className}</span>
                                        <span
                                            className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                                                isPosted
                                                    ? "border border-green-100 bg-green-50 text-green-700"
                                                    : "border border-red-100 bg-red-50 text-red-700"
                                            }`}
                                        >
                                            {isPosted ? "Posted" : "Pending"}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            <Modal
                isOpen={viewAllOpen}
                onClose={() => setViewAllOpen(false)}
                title={`All homework — ${trackDate}`}
                size="md"
                placement="center"
            >
                <p className="mb-3 text-xs text-[#6B7280]">
                    {totalItemCount} homework item{totalItemCount === 1 ? "" : "s"} across {visibleByClass.length} class
                    {visibleByClass.length === 1 ? "" : "es"}.
                </p>
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                    {visibleByClass.map(([className, items]) => (
                        <div key={className} className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                            <div className="flex items-center justify-between gap-2 border-b border-[#F3F4F6] bg-[#FFFBEB] px-4 py-2">
                                <span className="text-xs font-bold text-orange-800">{className}</span>
                                <span className="text-[10px] font-semibold text-orange-600">
                                    {items.length} item{items.length === 1 ? "" : "s"}
                                </span>
                            </div>
                            <ul className="divide-y">{items.map((r) => renderHomeworkRow(r))}</ul>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal isOpen={editModal.isOpen} onClose={closeEdit} title="Edit homework" size="md" placement="center">
                <form onSubmit={saveEdit} className="space-y-3">
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Title
                        <input
                            required
                            value={editForm.title}
                            onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Class name
                        <select
                            value={editForm.class_name}
                            onChange={(e) => setEditForm((p) => ({ ...p, class_name: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-white"
                        >
                            {HOMEWORK_CLASS_OPTIONS.map((opt) => (
                                <option key={opt.value || "all"} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Date
                        <input
                            type="date"
                            required
                            value={editForm.assigned_date}
                            onChange={(e) => setEditForm((p) => ({ ...p, assigned_date: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Description
                        <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                            rows={4}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Attachment (optional: replace with new image or PDF, max 5MB)
                        {editForm.existingAttachmentName ? (
                            <p className="mt-1 text-[11px] font-normal text-[#6B7280]">
                                Current file: {editForm.existingAttachmentName}
                            </p>
                        ) : null}
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setEditForm((p) => ({ ...p, attachment: e.target.files?.[0] || null }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-white"
                        />
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                        <Button type="submit" className="bg-[#FF922B] text-white" disabled={editSaving}>
                            {editSaving ? "Saving…" : "Save changes"}
                        </Button>
                        <Button type="button" onClick={closeEdit} className="bg-gray-100 text-gray-700">
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => confirmDelete.id && remove(confirmDelete.id)}
                title="Delete Homework"
                description="Are you sure you want to delete this homework? This action cannot be undone."
                confirmText="Yes, Delete"
                variant="danger"
            />
        </div>
    );
}

type AnnouncementRow = {
    id: number;
    title: string;
    body?: string;
    published_at?: string;
    student?: number | null;
    student_name?: string;
    class_name?: string;
    audience_label?: string;
    is_scheduled?: boolean;
};

const announcementRowDate = (row: AnnouncementRow) => homeworkDate(row.published_at) || "—";

function AnnouncementsTab({ authFetch }: { authFetch: AuthFetchFn }) {
    const [rows, setRows] = useState<AnnouncementRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [trackDate, setTrackDate] = useState(todayLocal);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ published_date: trackDate });
            const data = await authFetch<unknown>(`/students/franchise/announcements/?${params.toString()}`);
            setRows(normalizeList<AnnouncementRow>(data));
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, trackDate]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <div className="max-w-2xl rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4">
            <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#111827]">Notifications</h3>
                <p className="text-xs text-[#6B7280]">
                    Sent by head office. View what parents see for the selected date. Centres also receive these in
                    Franchise → Notifications.
                </p>
            </div>
            <label className="block text-xs font-semibold text-[#4B5563]">
                Track date
                <input
                    type="date"
                    value={trackDate}
                    onChange={(e) => setTrackDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                />
            </label>
            {!loading ? (
                <span className="w-fit rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 border border-orange-100">
                    Sent: {rows.length}
                </span>
            ) : null}
            {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : null}
            {!loading && rows.length === 0 ? (
                <p className="text-sm text-center text-[#6B7280] rounded-xl border border-dashed border-[#E5E7EB] px-4 py-8">
                    No notifications for {trackDate}. Head office adds these in Admin → Notifications CMS.
                </p>
            ) : null}
            {!loading && rows.length > 0 ? (
                <ul className="divide-y border rounded-xl max-h-[420px] overflow-y-auto">
                    {rows.map((r) => (
                        <li key={r.id} className="px-4 py-3 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-[#1F2937]">{r.title}</p>
                                <span className="shrink-0 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold text-[#4B5563]">
                                    {r.audience_label || "All parents"}
                                </span>
                                {r.is_scheduled ? (
                                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-100">
                                        Scheduled
                                    </span>
                                ) : null}
                            </div>
                            {r.body ? (
                                <p className="mt-1 text-xs text-[#4B5563] whitespace-pre-wrap">{r.body}</p>
                            ) : null}
                            <p className="text-[11px] text-[#6B7280] mt-0.5">
                                {r.published_at ? new Date(r.published_at).toLocaleString() : announcementRowDate(r)}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}

function FeesTab({ authFetch, showToast, students }: { authFetch: AuthFetchFn; showToast: ShowToastFn; students: MiniStudent[] }) {
    const [form, setForm] = useState({
        student: "",
        fee_structure_name: "",
        id_card_no: "",
        course: "",
        title: "",
        amount: "",
        discount: "0",
        amount_paid: "0",
        due_date: "",
        status: "PENDING",
        paid_on: "",
        notes: "",
    });
    const [rows, setRows] = useState<
        { id: number; student_name?: string; title: string; amount: string | number; due_date: string; status: string; paid_on?: string | null }[]
    >([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const raw = await authFetch<unknown>("/students/franchise/fees/");
            const list = normalizeList<{
                id: number;
                student_name?: string;
                title: string;
                amount: string | number;
                due_date: string;
                status: string;
                paid_on?: string | null;
            }>(raw);
            setRows(list);
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.student) return;
        try {
            await authFetch("/students/franchise/fees/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    student: Number(form.student),
                    fee_structure_name: form.fee_structure_name.trim(),
                    id_card_no: form.id_card_no.trim(),
                    course: form.course.trim(),
                    title: form.title.trim(),
                    amount: form.amount,
                    discount: form.discount || "0",
                    amount_paid: form.amount_paid || "0",
                    due_date: form.due_date,
                    status: form.status,
                    paid_on: form.paid_on || null,
                    notes: form.notes,
                }),
            });
            showToast("Fee entry saved", "success");
            setForm({
                student: "",
                fee_structure_name: "",
                id_card_no: "",
                course: "",
                title: "",
                amount: "",
                discount: "0",
                amount_paid: "0",
                due_date: "",
                status: "PENDING",
                paid_on: "",
                notes: "",
            });
            await load();
        } catch {
            showToast("Save failed", "error");
        }
    };

    return (
        <div className="space-y-4 max-w-3xl">
            <form onSubmit={submit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 grid md:grid-cols-2 gap-3">
                <label className="text-xs font-semibold md:col-span-2">
                    Student
                    <select required value={form.student} onChange={(e) => setForm((p) => ({ ...p, student: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
                        <option value="">—</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.full_name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-semibold">
                    Fee structure name
                    <input value={form.fee_structure_name} onChange={(e) => setForm((p) => ({ ...p, fee_structure_name: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    ID card no
                    <input value={form.id_card_no} onChange={(e) => setForm((p) => ({ ...p, id_card_no: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold md:col-span-2">
                    Course
                    <input value={form.course} onChange={(e) => setForm((p) => ({ ...p, course: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    Title
                    <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    Amount
                    <input required type="number" step="0.01" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    Discount
                    <input type="number" step="0.01" value={form.discount} onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    Amount paid till date
                    <input type="number" step="0.01" value={form.amount_paid} onChange={(e) => setForm((p) => ({ ...p, amount_paid: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    Due date
                    <input type="date" required value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold">
                    Status
                    <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
                        {["PENDING", "PAID", "OVERDUE"].map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-xs font-semibold">
                    Paid on (optional)
                    <input type="date" value={form.paid_on} onChange={(e) => setForm((p) => ({ ...p, paid_on: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <label className="text-xs font-semibold md:col-span-2">
                    Notes
                    <input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                </label>
                <Button type="submit" className="bg-[#FF922B] text-white w-fit">
                    Save fee
                </Button>
            </form>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
                <p className="text-sm font-semibold text-[#111827] mb-3">Saved fee entries</p>
                {loading && <p className="text-sm text-[#6B7280]">Loading…</p>}
                {!loading && rows.length === 0 && <p className="text-sm text-[#6B7280]">No fee entries yet.</p>}
                <ul className="space-y-2">
                    {rows.map((r) => (
                        <li key={r.id} className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm">
                            <p className="font-medium text-[#111827]">{r.title}</p>
                            <p className="text-[#4B5563] text-xs">
                                {r.student_name || "Student"} • ₹{r.amount} • Due {r.due_date} • {r.status}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function TransportTab({
    authFetch,
    showToast,
}: {
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
}) {
    const emptyRouteForm = {
        route_name: "",
        driver_profile: "",
    };

    const [form, setForm] = useState(emptyRouteForm);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [rows, setRows] = useState<
        Array<{
            id: number;
            route_name: string;
            vehicle_number?: string;
            driver_name?: string;
            driver_token?: string;
            driver_info?: {
                full_name: string;
                email: string;
            };
            tracking_note?: string;
        }>
    >([]);
    const [editingRouteId, setEditingRouteId] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean;
        id: number | null;
    }>({
        isOpen: false,
        id: null,
    });

    const load = useCallback(async () => {
        try {
            const [routeData, driverData] = await Promise.all([
                authFetch<unknown>("/students/franchise/transport/"),
                authFetch<unknown>("/students/franchise/drivers/"),
            ]);
            setRows(normalizeList<any>(routeData));
            setDrivers(normalizeList<any>(driverData));
        } catch {
            setRows([]);
            setDrivers([]);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                route_name: form.route_name.trim(),
                driver_profile: form.driver_profile ? Number(form.driver_profile) : null,
            };

            if (editingRouteId) {
                await authFetch(`/students/franchise/transport/${editingRouteId}/`, {
                    method: "PATCH",
                    headers: jsonHeaders(),
                    body: JSON.stringify(payload),
                });
                showToast("Route updated successfully", "success");
            } else {
                await authFetch("/students/franchise/transport/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify(payload),
                });
                showToast("Route added successfully", "success");
            }

            setForm(emptyRouteForm);
            setEditingRouteId(null);
            await load();
        } catch {
            showToast("Save failed", "error");
        }
    };

    const deleteRoute = async (id: number) => {
        try {
            await authFetch(`/students/franchise/transport/${id}/`, { method: "DELETE" });
            showToast("Route deleted", "success");
            await load();
        } catch {
            showToast("Could not delete route", "error");
        }
    };

    const startEditing = (route: any) => {
        setEditingRouteId(route.id);
        setForm({
            route_name: route.route_name || "",
            driver_profile: route.driver_profile?.id?.toString() || route.driver_profile?.toString() || "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="space-y-4 max-w-3xl">
            <form onSubmit={submit} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3 max-w-md">
                <input
                    required
                    placeholder="Route name"
                    value={form.route_name}
                    onChange={(e) => setForm((p) => ({ ...p, route_name: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                />
                <select
                    value={form.driver_profile}
                    onChange={(e) => setForm((p) => ({ ...p, driver_profile: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
                >
                    <option value="">Assign driver account</option>
                    {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.user?.full_name || d.user?.email}
                        </option>
                    ))}
                </select>
                <div className="flex flex-wrap gap-2 pt-1">
                <Button type="submit" className="bg-[#FF922B] text-white w-fit">
                    {editingRouteId ? "Update route" : "Add route"}
                </Button>
                {editingRouteId && (
                    <Button 
                        type="button" 
                        onClick={() => {
                            setEditingRouteId(null);
                            setForm(emptyRouteForm);
                        }}
                        className="bg-gray-100 text-gray-700 w-fit"
                    >
                        Cancel
                    </Button>
                )}
                </div>
            </form>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#111827]">Driver links</p>
                    <button type="button" onClick={() => void load()} className="text-xs text-[#2563EB] underline">
                        Refresh
                    </button>
                </div>
                {rows.length === 0 && <p className="text-sm text-[#6B7280]">No routes added yet.</p>}
                <ul className="space-y-2">
                    {rows.map((r) => (
                            <li key={r.id} className="rounded-xl border border-[#E5E7EB] p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-[#111827]">{r.route_name}</p>
                                        <p className="text-xs text-[#4B5563]">
                                            {r.driver_info
                                                ? `Driver: ${r.driver_info.full_name} (${r.driver_info.email})`
                                                : "No driver assigned"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => startEditing(r)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit route"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDelete({ isOpen: true, id: r.id })}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete route"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                                {r.driver_token && (
                                    <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                        Route Authorized for Live Tracking
                                    </div>
                                )}
                            </li>
                    ))}
                </ul>
            </div>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => {
                    if (confirmDelete.id) void deleteRoute(confirmDelete.id);
                }}
                title="Delete route"
                description="Are you sure you want to delete this route?"
                confirmText="Yes, delete"
                variant="danger"
            />
        </div>
    );
}

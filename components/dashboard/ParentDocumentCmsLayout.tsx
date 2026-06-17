"use client";

import type { FormEvent, ReactNode } from "react";

export type ParentDocumentSentRow = {
    id: number;
    title: string;
    meta?: string;
    badge?: string;
    published_at?: string;
};

type Props = {
    onSubmit?: (e: FormEvent) => void;
    uploadTitle?: string;
    uploadIntro?: string;
    uploadFields?: ReactNode;
    submitButton?: ReactNode;
    sentTitle: string;
    sentIntro: string;
    sentFilters?: ReactNode;
    trackDate?: string;
    onTrackDateChange?: (value: string) => void;
    loading: boolean;
    rows: ParentDocumentSentRow[];
    emptySentMessage: string;
    onEdit?: (row: ParentDocumentSentRow) => void;
    onDelete?: (row: ParentDocumentSentRow) => void;
    onView?: (row: ParentDocumentSentRow) => void;
    canEditRow?: (row: ParentDocumentSentRow) => boolean;
    canDeleteRow?: (row: ParentDocumentSentRow) => boolean;
    canViewRow?: (row: ParentDocumentSentRow) => boolean;
    viewRowLabel?: string;
    /** Render only the saved-items panel (no upload form column). */
    listOnly?: boolean;
};

function formatSentTimestamp(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export function ParentDocumentCmsLayout({
    onSubmit,
    uploadTitle,
    uploadIntro,
    uploadFields,
    submitButton,
    sentTitle,
    sentIntro,
    sentFilters,
    trackDate,
    onTrackDateChange,
    loading,
    rows,
    emptySentMessage,
    onEdit,
    onDelete,
    onView,
    canEditRow,
    canDeleteRow,
    canViewRow,
    viewRowLabel = "View",
    listOnly = false,
}: Props) {
    const showTrackDate = trackDate != null && onTrackDateChange != null;

    const sentPanel = (
        <div className={`rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4 ${listOnly ? "" : "lg:sticky lg:top-4"}`}>
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[#111827]">{sentTitle}</h3>
                    <p className="text-xs text-[#6B7280]">{sentIntro}</p>
                </div>

                {sentFilters}

                {showTrackDate ? (
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Track date
                        <input
                            type="date"
                            value={trackDate}
                            onChange={(e) => onTrackDateChange(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                ) : null}

                {!loading ? (
                    <span className="inline-flex w-fit rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 border border-orange-100">
                        {rows.length} item{rows.length === 1 ? "" : "s"}
                    </span>
                ) : null}

                {loading ? <p className="text-sm text-[#6B7280]">Loading…</p> : null}

                {!loading && rows.length === 0 ? (
                    <p className="text-sm text-center text-[#6B7280] rounded-xl border border-dashed border-[#E5E7EB] px-4 py-8">
                        {emptySentMessage}
                    </p>
                ) : null}

                {!loading && rows.length > 0 ? (
                    <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
                        {rows.map((row) => {
                            const timestamp = formatSentTimestamp(row.published_at);
                            const showView = onView && (canViewRow ? canViewRow(row) : true);
                            const showEdit = onEdit && (canEditRow ? canEditRow(row) : true);
                            const showDelete = onDelete && (canDeleteRow ? canDeleteRow(row) : true);

                            return (
                                <li
                                    key={row.id}
                                    className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium text-[#1F2937]">{row.title}</span>
                                                {row.badge ? (
                                                    <span className="shrink-0 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-medium text-[#374151]">
                                                        {row.badge}
                                                    </span>
                                                ) : null}
                                            </div>
                                            {row.meta ? (
                                                <p className="mt-1 text-[11px] text-[#6B7280]">{row.meta}</p>
                                            ) : null}
                                            {timestamp ? (
                                                <p className="mt-1 text-xs text-[#6B7280]">{timestamp}</p>
                                            ) : null}
                                        </div>

                                        {showView || showEdit || showDelete ? (
                                            <div className="flex shrink-0 items-center gap-3 text-xs font-semibold">
                                                {showView ? (
                                                    <button
                                                        type="button"
                                                        className="text-[#2563EB] hover:underline"
                                                        onClick={() => onView!(row)}
                                                    >
                                                        {viewRowLabel}
                                                    </button>
                                                ) : null}
                                                {showEdit ? (
                                                    <button
                                                        type="button"
                                                        className="text-[#2563EB] hover:underline"
                                                        onClick={() => onEdit!(row)}
                                                    >
                                                        Edit
                                                    </button>
                                                ) : null}
                                                {showDelete ? (
                                                    <button
                                                        type="button"
                                                        className="text-red-600 hover:underline"
                                                        onClick={() => onDelete!(row)}
                                                    >
                                                        Delete
                                                    </button>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : null}
            </div>
    );

    if (listOnly) return sentPanel;

    return (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start max-w-5xl">
            <form onSubmit={onSubmit} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[#111827]">{uploadTitle}</h3>
                    <p className="text-xs text-[#6B7280]">{uploadIntro}</p>
                </div>
                {uploadFields}
                {submitButton}
            </form>
            {sentPanel}
        </div>
    );
}

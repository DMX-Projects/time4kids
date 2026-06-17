"use client";

import type { FormEvent, ReactNode } from "react";

export type ManualNotificationSentRow = {
    id: number;
    title: string;
    body?: string;
    audience_label?: string;
    notification_origin?: "centre" | "head_office";
    is_scheduled?: boolean;
    published_at?: string;
    meta?: string;
};

type Props = {
    onSubmit: (e: FormEvent) => void;
    sendIntro?: string;
    sendExtra?: ReactNode;
    sendTo: ReactNode;
    publishDate: ReactNode;
    title: ReactNode;
    message: ReactNode;
    submitButton: ReactNode;
    sentIntro?: string;
    trackDate: string;
    onTrackDateChange: (value: string) => void;
    loading: boolean;
    rows: ManualNotificationSentRow[];
    emptySentMessage: string;
    onEdit?: (row: ManualNotificationSentRow) => void;
    onDelete?: (row: ManualNotificationSentRow) => void;
    canEditRow?: (row: ManualNotificationSentRow) => boolean;
    /** @deprecated Prefer onEdit / onDelete */
    renderRowActions?: (row: ManualNotificationSentRow) => ReactNode;
};

function formatSentTimestamp(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function originBadge(origin?: ManualNotificationSentRow["notification_origin"]) {
    if (origin === "head_office") {
        return { label: "Head office", className: "bg-blue-50 text-blue-700 border-blue-100" };
    }
    if (origin === "centre") {
        return { label: "Your centre", className: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    }
    return null;
}

function audienceBadge(label?: string) {
    const text = (label || "").trim();
    if (!text || text.toLowerCase() === "all parents") return null;
    return text;
}

export function ManualNotificationCmsLayout({
    onSubmit,
    sendIntro = "Send a message to all parents, a class (e.g. Nursery), or one student's family. Choose a publish date — parents only see it on that day (from midnight IST). Email is sent when it goes live.",
    sendExtra,
    sendTo,
    publishDate,
    title,
    message,
    submitButton,
    sentIntro = "Parent-facing notifications sent on the selected date — from your centre or head office.",
    trackDate,
    onTrackDateChange,
    loading,
    rows,
    emptySentMessage,
    onEdit,
    onDelete,
    canEditRow,
    renderRowActions,
}: Props) {
    return (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start max-w-5xl">
            <form onSubmit={onSubmit} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[#111827]">Send manual notification</h3>
                    <p className="text-xs text-[#6B7280]">{sendIntro}</p>
                </div>

                {sendExtra}

                <label className="block text-xs font-semibold text-[#4B5563]">
                    Send to
                    {sendTo}
                </label>

                <label className="block text-xs font-semibold text-[#4B5563]">
                    Publish date
                    {publishDate}
                </label>

                <label className="block text-xs font-semibold text-[#4B5563]">
                    Title
                    {title}
                </label>

                <label className="block text-xs font-semibold text-[#4B5563]">
                    Message
                    {message}
                </label>

                {submitButton}
            </form>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4 lg:sticky lg:top-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[#111827]">Sent notifications</h3>
                    <p className="text-xs text-[#6B7280]">{sentIntro}</p>
                </div>

                <label className="block text-xs font-semibold text-[#4B5563]">
                    Track date
                    <input
                        type="date"
                        value={trackDate}
                        onChange={(e) => onTrackDateChange(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                    />
                </label>

                {!loading ? (
                    <span className="inline-flex w-fit rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 border border-orange-100">
                        Sent: {rows.length}
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
                            const badge = audienceBadge(row.audience_label);
                            const origin = originBadge(row.notification_origin);
                            const timestamp = formatSentTimestamp(row.published_at);
                            const useTextActions = Boolean(onEdit || onDelete);

                            return (
                                <li
                                    key={row.id}
                                    className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium text-[#1F2937]">{row.title}</span>
                                                {origin ? (
                                                    <span
                                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${origin.className}`}
                                                    >
                                                        {origin.label}
                                                    </span>
                                                ) : null}
                                                {badge ? (
                                                    <span className="shrink-0 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-medium text-[#374151]">
                                                        {badge}
                                                    </span>
                                                ) : null}
                                                {row.is_scheduled ? (
                                                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-100">
                                                        Scheduled
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

                                        {useTextActions ? (
                                            <div className="flex shrink-0 items-center gap-3 text-xs font-semibold">
                                                {onEdit && (canEditRow ? canEditRow(row) : true) ? (
                                                    <button
                                                        type="button"
                                                        className="text-[#2563EB] hover:underline"
                                                        onClick={() => onEdit(row)}
                                                    >
                                                        Edit
                                                    </button>
                                                ) : null}
                                                {onDelete ? (
                                                    <button
                                                        type="button"
                                                        className="text-red-600 hover:underline"
                                                        onClick={() => onDelete(row)}
                                                    >
                                                        Delete
                                                    </button>
                                                ) : null}
                                            </div>
                                        ) : renderRowActions ? (
                                            renderRowActions(row)
                                        ) : null}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : null}
            </div>
        </div>
    );
}

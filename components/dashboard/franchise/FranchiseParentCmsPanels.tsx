"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { jsonHeaders } from "@/lib/api-client";
import { ManualNotificationCmsLayout } from "@/components/dashboard/ManualNotificationCmsLayout";
import { ManualNotificationSendToFields } from "@/components/dashboard/ManualNotificationSendToFields";
import { ParentHolidayCmsPanel } from "@/components/dashboard/ParentHolidayCmsPanel";
import { useFranchiseData } from "@/components/dashboard/franchise/FranchiseDataProvider";
import { ParentNewsletterCmsPanel } from "@/components/dashboard/ParentNewsletterCmsPanel";
import { ParentParentalTipsCmsPanel } from "@/components/dashboard/ParentParentalTipsCmsPanel";
import { CENTRE_CLASS_LABELS } from "@/lib/student-class-match";
import {
    emptySendToForm,
    sendToFormFromRow,
    sendToFormToPayload,
    validateSendToForm,
} from "@/lib/manual-notification-send-to";

type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
type ShowToastFn = (message: string, type?: "success" | "error" | "info") => void;

function normalizeList<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && Array.isArray((data as { results?: unknown[] }).results)) {
        return (data as { results: T[] }).results;
    }
    return [];
}

const todayLocal = () => new Date().toISOString().slice(0, 10);

type MiniStudent = { id: number; full_name: string; class_name: string };

type AnnouncementRow = {
    id: number;
    title: string;
    body?: string;
    published_at?: string;
    class_name?: string;
    student?: number | null;
    student_name?: string;
    audience_label?: string;
    notification_origin?: "centre" | "head_office";
    is_scheduled?: boolean;
    campaign?: number | null;
};

const emptyAnnouncementForm = () => ({
    title: "",
    body: "",
    schedule_date: todayLocal(),
    send_to: emptySendToForm(),
});

export function FranchiseAnnouncementsPanel({
    authFetch,
    showToast,
    students,
}: {
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
    students: MiniStudent[];
}) {
    const [rows, setRows] = useState<AnnouncementRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [trackDate, setTrackDate] = useState(todayLocal);
    const [form, setForm] = useState(emptyAnnouncementForm());
    const [editModal, setEditModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [editForm, setEditForm] = useState(emptyAnnouncementForm());
    const [editSaving, setEditSaving] = useState(false);

    const classOptions = CENTRE_CLASS_LABELS;

    const load = useCallback(async (dateOverride?: string) => {
        setLoading(true);
        const date = dateOverride ?? trackDate;
        try {
            const params = new URLSearchParams({ published_date: date });
            const data = await authFetch<unknown>(`/students/franchise/announcements/?${params.toString()}`);
            setRows(normalizeList(data));
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, trackDate]);

    useEffect(() => {
        void load();
    }, [load]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            showToast("Title is required.", "error");
            return;
        }
        const sendErr = validateSendToForm(form.send_to);
        if (sendErr) {
            showToast(sendErr, "error");
            return;
        }
        try {
            const { class_name, student } = sendToFormToPayload(form.send_to);
            await authFetch("/students/franchise/announcements/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    title: form.title.trim(),
                    body: form.body.trim(),
                    schedule_date: form.schedule_date.trim() || todayLocal(),
                    class_name,
                    student,
                }),
            });
            const sentDate = form.schedule_date.trim() || todayLocal();
            setForm(emptyAnnouncementForm());
            setTrackDate(sentDate);
            showToast("Notification sent to parents.", "success");
            await load(sentDate);
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Could not publish.", "error");
        }
    };

    const remove = async (row: AnnouncementRow) => {
        if (!window.confirm("Delete this notification?")) return;
        try {
            await authFetch(`/students/franchise/announcements/${row.id}/`, { method: "DELETE" });
            if (editModal.id === row.id) closeEdit();
            showToast("Deleted.", "success");
            await load();
        } catch {
            showToast("Delete failed.", "error");
        }
    };

    const openEdit = async (row: AnnouncementRow) => {
        if (row.campaign) {
            showToast("Head-office notifications cannot be edited here.", "info");
            return;
        }
        try {
            const detail = await authFetch<AnnouncementRow>(`/students/franchise/announcements/${row.id}/`);
            const scheduleDate = detail.published_at?.slice(0, 10) || trackDate;
            setEditForm({
                title: detail.title || "",
                body: detail.body || "",
                schedule_date: scheduleDate,
                send_to: sendToFormFromRow(detail.class_name, detail.student),
            });
            setEditModal({ isOpen: true, id: row.id });
        } catch {
            showToast("Could not load notification.", "error");
        }
    };

    const closeEdit = () => {
        setEditModal({ isOpen: false, id: null });
        setEditForm(emptyAnnouncementForm());
    };

    const saveEdit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editModal.id) return;
        if (!editForm.title.trim()) {
            showToast("Title is required.", "error");
            return;
        }
        const sendErr = validateSendToForm(editForm.send_to);
        if (sendErr) {
            showToast(sendErr, "error");
            return;
        }
        setEditSaving(true);
        try {
            const { class_name, student } = sendToFormToPayload(editForm.send_to);
            await authFetch(`/students/franchise/announcements/${editModal.id}/`, {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    title: editForm.title.trim(),
                    body: editForm.body.trim(),
                    schedule_date: editForm.schedule_date.trim() || todayLocal(),
                    class_name,
                    student,
                }),
            });
            const sentDate = editForm.schedule_date.trim() || trackDate;
            closeEdit();
            setTrackDate(sentDate);
            showToast("Notification updated.", "success");
            await load(sentDate);
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Update failed.", "error");
        } finally {
            setEditSaving(false);
        }
    };

    const canEditRow = (row: AnnouncementRow) => !row.campaign;

    return (
        <>
            <ManualNotificationCmsLayout
            onSubmit={submit}
            sendTo={
                <ManualNotificationSendToFields
                    value={form.send_to}
                    onChange={(send_to) => setForm((p) => ({ ...p, send_to }))}
                    classOptions={classOptions}
                    students={students}
                />
            }
            publishDate={
                <input
                    type="date"
                    required
                    value={form.schedule_date}
                    onChange={(e) => setForm((p) => ({ ...p, schedule_date: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                />
            }
            title={
                <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Title — e.g. PTM reminder"
                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                />
            }
            message={
                <textarea
                    value={form.body}
                    onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                    rows={4}
                    placeholder="Message — your update for parents"
                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                />
            }
            submitButton={
                <Button type="submit" className="bg-[#FF922B] text-white w-full sm:w-auto">
                    Send to parents
                </Button>
            }
            trackDate={trackDate}
            onTrackDateChange={setTrackDate}
            loading={loading}
            rows={rows}
            emptySentMessage={`No notifications sent on ${trackDate}. Change the track date or send one.`}
            onEdit={(row) => {
                const full = rows.find((r) => r.id === row.id);
                if (full) void openEdit(full);
            }}
            canEditRow={(row) => {
                const full = rows.find((r) => r.id === row.id);
                return full ? canEditRow(full) : true;
            }}
            onDelete={(row) => void remove(rows.find((r) => r.id === row.id) || row)}
        />

            <Modal isOpen={editModal.isOpen} onClose={closeEdit} title="Edit notification" size="md" placement="center">
                <form onSubmit={saveEdit} className="space-y-4">
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Send to
                        <ManualNotificationSendToFields
                            value={editForm.send_to}
                            onChange={(send_to) => setEditForm((p) => ({ ...p, send_to }))}
                            classOptions={classOptions}
                            students={students}
                        />
                    </label>
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Publish date
                        <input
                            type="date"
                            required
                            value={editForm.schedule_date}
                            onChange={(e) => setEditForm((p) => ({ ...p, schedule_date: e.target.value }))}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
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
                        Message
                        <textarea
                            value={editForm.body}
                            onChange={(e) => setEditForm((p) => ({ ...p, body: e.target.value }))}
                            rows={4}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        />
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                        <Button type="submit" disabled={editSaving} className="bg-[#FF922B] text-white">
                            {editSaving ? "Saving…" : "Save changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={closeEdit}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export function FranchiseNewsletterPanel({ authFetch, showToast }: { authFetch: AuthFetchFn; showToast: ShowToastFn }) {
    return <ParentNewsletterCmsPanel mode="franchise" authFetch={authFetch} showToast={showToast} />;
}

export function FranchiseParentalTipsPanel({ authFetch, showToast }: { authFetch: AuthFetchFn; showToast: ShowToastFn }) {
    return <ParentParentalTipsCmsPanel mode="franchise" authFetch={authFetch} showToast={showToast} />;
}

export function FranchiseHolidayPanel({ authFetch, showToast }: { authFetch: AuthFetchFn; showToast: ShowToastFn }) {
    const { profile } = useFranchiseData();
    return (
        <ParentHolidayCmsPanel
            mode="franchise"
            authFetch={authFetch}
            showToast={showToast}
            centreStateFromProfile={profile.state}
            centreCityFromProfile={profile.city}
        />
    );
}

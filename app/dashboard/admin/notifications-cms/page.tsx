"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import { CmsPublishTargetFields } from "@/components/dashboard/admin/CmsPublishTargetFields";
import { ManualNotificationCmsLayout } from "@/components/dashboard/ManualNotificationCmsLayout";
import { ManualNotificationSendToFields } from "@/components/dashboard/ManualNotificationSendToFields";
import { jsonHeaders } from "@/lib/api-client";
import { fetchAllApiList, normalizeApiList } from "@/lib/parent-school-api";
import { CENTRE_PROGRAM_LABELS } from "@/config/centre-program-cards-defaults";
import {
    emptySendToForm,
    sendToFormFromRow,
    sendToFormToPayload,
    validateSendToForm,
    type SendToForm,
} from "@/lib/manual-notification-send-to";
import {
    announcementTargetPayload,
    emptyCmsPublishTarget,
    publishTargetFromAnnouncement,
    publishTargetSummary,
    type CmsPublishTargetForm,
} from "@/lib/cms-publish-target";

type MiniStudent = { id: number; full_name: string; class_name: string; roll_number: string };

type AnnouncementRow = {
    id: number;
    franchise?: number | null;
    franchise_name?: string;
    title: string;
    body?: string;
    student?: number | null;
    student_name?: string;
    class_name?: string;
    audience_label?: string;
    publish_scope?: string;
    target_states?: string[];
    target_cities?: string[];
    target_franchise_ids?: number[];
    publish_target_label?: string;
    visible_to_parents?: boolean;
    visible_to_centres?: boolean;
    published_at?: string;
    is_active?: boolean;
};

type NotificationAudience = "all" | "class" | "student";

const NOTIFICATION_CLASS_OPTIONS = CENTRE_PROGRAM_LABELS.map((p) => ({ value: p.label, label: p.label }));

const emptyForm = {
    send_to: emptySendToForm(),
    title: "",
    body: "",
    schedule_date: new Date().toISOString().slice(0, 10),
    visible_to_parents: true,
    visible_to_centres: true,
};

function todayLocal() {
    return new Date().toISOString().slice(0, 10);
}

function scheduleDateFromRow(row: AnnouncementRow) {
    if (!row.published_at) return todayLocal();
    return row.published_at.slice(0, 10);
}

export default function AdminNotificationsCmsPage() {
    const { authFetch } = useAuth();
    const { franchises } = useAdminData();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rows, setRows] = useState<AnnouncementRow[]>([]);
    const [trackDate, setTrackDate] = useState(todayLocal);
    const [students, setStudents] = useState<MiniStudent[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [publishTarget, setPublishTarget] = useState<CmsPublishTargetForm>(emptyCmsPublishTarget());
    const [editModal, setEditModal] = useState<{ isOpen: boolean; row: AnnouncementRow | null }>({
        isOpen: false,
        row: null,
    });
    const [editForm, setEditForm] = useState(emptyForm);
    const [editTarget, setEditTarget] = useState<CmsPublishTargetForm>(emptyCmsPublishTarget());
    const [editSaving, setEditSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const rows = await fetchAllApiList(authFetch, "/students/admin/announcements/?global=1");
            setRows(normalizeApiList(rows) as AnnouncementRow[]);
        } catch {
            showToast("Unable to load notifications", "error");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        const target = editModal.isOpen ? editTarget : publishTarget;
        if (target.scope !== "one_centre" || !target.franchiseId) {
            setStudents([]);
            setStudentsLoading(false);
            return;
        }
        let cancelled = false;
        setStudentsLoading(true);
        (async () => {
            try {
                const rows = await fetchAllApiList(
                    authFetch,
                    `/students/admin/students/mini/?franchise=${encodeURIComponent(target.franchiseId)}`,
                );
                if (!cancelled) {
                    setStudents(rows as MiniStudent[]);
                }
            } catch {
                if (!cancelled) {
                    setStudents([]);
                    showToast("Could not load students for this centre.", "error");
                }
            } finally {
                if (!cancelled) setStudentsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [authFetch, editModal.isOpen, editTarget, publishTarget, showToast]);

    const validateForm = (
        target: CmsPublishTargetForm,
        values: typeof emptyForm,
        mode: "create" | "edit",
    ): string | null => {
        if (!values.title.trim()) return "Title is required.";
        if (target.scope === "one_centre" && !target.franchiseId) return "Select a centre.";
        if (target.scope === "franchises" && target.franchiseIds.length === 0) {
            return "Select at least one centre.";
        }
        if (target.scope === "state" && target.targetStates.length === 0) return "Select at least one state.";
        if (target.scope === "city" && target.targetCities.length === 0) return "Select at least one city.";
        if (!values.visible_to_parents && !values.visible_to_centres) {
            return "Choose at least one audience: parents or centres.";
        }
        if (target.scope === "one_centre") {
            const sendErr = validateSendToForm(values.send_to);
            if (sendErr) return sendErr;
            const { student } = sendToFormToPayload(values.send_to);
            if (student && target.className.trim()) {
                return "Choose either a class filter in Publish to or one student in Send to, not both.";
            }
        } else if (values.send_to.mode !== "all") {
            return "Class or student targeting is only available for one centre.";
        }
        if (mode === "create" && !values.schedule_date.trim()) return "Publish date is required.";
        return null;
    };

    const targetForSendTo = (target: CmsPublishTargetForm, sendTo: SendToForm): CmsPublishTargetForm => {
        if (target.scope !== "one_centre") return target;
        const { class_name, student } = sendToFormToPayload(sendTo);
        if (student) return { ...target, className: "" };
        if (class_name) return { ...target, className: class_name };
        return target;
    };

    const audienceFromSendTo = (target: CmsPublishTargetForm, sendTo: SendToForm): NotificationAudience => {
        const { class_name, student } = sendToFormToPayload(sendTo);
        if (target.scope === "one_centre") {
            if (student) return "student";
            if (class_name) return "class";
            return "all";
        }
        if (target.className.trim()) return "class";
        return "all";
    };

    const studentFromSendTo = (target: CmsPublishTargetForm, sendTo: SendToForm): string => {
        const { student } = sendToFormToPayload(sendTo);
        if (target.scope !== "one_centre" || !student) return "";
        return String(student);
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const err = validateForm(publishTarget, form, "create");
        if (err) {
            showToast(err, "error");
            return;
        }
        setSubmitting(true);
        try {
            const payloadTarget = targetForSendTo(publishTarget, form.send_to);
            await authFetch("/students/admin/announcements/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify(
                    announcementTargetPayload(payloadTarget, {
                        title: form.title,
                        body: form.body,
                        schedule_date: form.schedule_date.trim() || todayLocal(),
                        audience: audienceFromSendTo(publishTarget, form.send_to),
                        student: studentFromSendTo(publishTarget, form.send_to),
                        visible_to_parents: form.visible_to_parents,
                        visible_to_centres: form.visible_to_centres,
                    }),
                ),
            });
            const sentDate = form.schedule_date.trim() || todayLocal();
            setForm({ ...emptyForm, schedule_date: todayLocal() });
            setPublishTarget(emptyCmsPublishTarget());
            setTrackDate(sentDate);
            showToast(`Notification published to ${publishTargetSummary(publishTarget, franchises)}.`, "success");
            await load();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Could not publish notification", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const openEdit = (row: AnnouncementRow) => {
        const target = publishTargetFromAnnouncement(row);
        setEditTarget(target);
        setEditForm({
            send_to: sendToFormFromRow(row.class_name, row.student),
            title: row.title || "",
            body: row.body || "",
            schedule_date: scheduleDateFromRow(row),
            visible_to_parents: row.visible_to_parents !== false,
            visible_to_centres: row.visible_to_centres !== false,
        });
        setEditModal({ isOpen: true, row });
    };

    const closeEdit = () => {
        setEditModal({ isOpen: false, row: null });
        setEditForm(emptyForm);
        setEditTarget(emptyCmsPublishTarget());
    };

    const saveEdit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editModal.row) return;
        const err = validateForm(editTarget, editForm, "edit");
        if (err) {
            showToast(err, "error");
            return;
        }
        setEditSaving(true);
        try {
            const payloadTarget = targetForSendTo(editTarget, editForm.send_to);
            await authFetch(`/students/admin/announcements/${editModal.row.id}/`, {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify(
                    announcementTargetPayload(payloadTarget, {
                        title: editForm.title,
                        body: editForm.body,
                        schedule_date: editForm.schedule_date.trim() || todayLocal(),
                        audience: audienceFromSendTo(editTarget, editForm.send_to),
                        student: studentFromSendTo(editTarget, editForm.send_to),
                        visible_to_parents: editForm.visible_to_parents,
                        visible_to_centres: editForm.visible_to_centres,
                    }),
                ),
            });
            closeEdit();
            showToast("Notification updated.", "success");
            await load();
        } catch {
            showToast("Update failed.", "error");
        } finally {
            setEditSaving(false);
        }
    };

    const remove = async (id: number) => {
        if (!window.confirm("Delete this notification? Centres and parents will no longer see it.")) return;
        try {
            await authFetch(`/students/admin/announcements/${id}/`, { method: "DELETE" });
            showToast("Deleted.", "success");
            await load();
        } catch {
            showToast("Delete failed.", "error");
        }
    };

    const classLabels = NOTIFICATION_CLASS_OPTIONS.map((opt) => opt.label);
    const allowClassStudentSendTo =
        publishTarget.scope === "one_centre" && Boolean(publishTarget.franchiseId);
    const allowEditClassStudentSendTo =
        editTarget.scope === "one_centre" && Boolean(editTarget.franchiseId);

    const visibleRows = useMemo(
        () => rows.filter((row) => scheduleDateFromRow(row) === trackDate),
        [rows, trackDate],
    );

    const audienceBadges = (row: AnnouncementRow) => {
        const parts: string[] = [];
        if (row.visible_to_parents !== false) parts.push("Parents");
        if (row.visible_to_centres !== false) parts.push("Centres");
        return parts.length ? parts.join(" + ") : "—";
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
                        <p className="text-sm text-slate-600 mt-1">
                            Same manual notification flow as centres, plus head-office targeting — pan-India, states,
                            cities, or specific centres. Messages appear in franchise notifications and the parent app.
                        </p>
                    </div>
                </div>
            </div>

            <ManualNotificationCmsLayout
                onSubmit={onSubmit}
                sendIntro="Send a message to parents and/or centres. Choose a publish date — parents only see it on that day (from midnight IST). Email is sent when it goes live to parents."
                sendExtra={
                    <div className="space-y-3">
                        <CmsPublishTargetFields
                            franchises={franchises}
                            value={publishTarget}
                            onChange={(next) => {
                                setPublishTarget(next);
                                if (next.scope !== "one_centre") {
                                    setForm((p) => ({ ...p, send_to: emptySendToForm() }));
                                }
                            }}
                            showClassTarget={publishTarget.scope !== "one_centre"}
                            classOptions={NOTIFICATION_CLASS_OPTIONS}
                        />
                        <div className="flex flex-wrap gap-4 text-sm">
                            <label className="inline-flex items-center gap-2 font-medium text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={form.visible_to_parents}
                                    onChange={(e) => setForm((p) => ({ ...p, visible_to_parents: e.target.checked }))}
                                />
                                Show to parents (parent app)
                            </label>
                            <label className="inline-flex items-center gap-2 font-medium text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={form.visible_to_centres}
                                    onChange={(e) => setForm((p) => ({ ...p, visible_to_centres: e.target.checked }))}
                                />
                                Show to centres (franchise notifications)
                            </label>
                        </div>
                    </div>
                }
                sendTo={
                    <ManualNotificationSendToFields
                        value={form.send_to}
                        onChange={(send_to) => setForm((p) => ({ ...p, send_to }))}
                        classOptions={classLabels}
                        students={students}
                        allowClassStudent={allowClassStudentSendTo}
                        studentsLoading={studentsLoading}
                        disabled={!allowClassStudentSendTo && publishTarget.scope === "one_centre" && !publishTarget.franchiseId}
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
                    <Button type="submit" disabled={submitting} className="bg-[#FF922B] text-white w-full sm:w-auto">
                        {submitting ? "Publishing…" : "Send to parents"}
                    </Button>
                }
                sentIntro="See which head-office notifications were published on the selected date."
                trackDate={trackDate}
                onTrackDateChange={setTrackDate}
                loading={loading}
                rows={visibleRows.map((row) => ({
                    id: row.id,
                    title: row.title,
                    audience_label: row.audience_label || "All parents",
                    published_at: row.published_at,
                    is_scheduled: false,
                    meta: `${row.publish_target_label || publishTargetSummary(publishTargetFromAnnouncement(row), franchises)} · ${audienceBadges(row)}`,
                }))}
                emptySentMessage={`No notifications sent on ${trackDate}. Change the track date or send one.`}
                onEdit={(row) => {
                    const fullRow = rows.find((r) => r.id === row.id);
                    if (fullRow) openEdit(fullRow);
                }}
                onDelete={(row) => void remove(row.id)}
            />

            <Modal isOpen={editModal.isOpen} onClose={closeEdit} title="Edit notification" size="lg">
                <form onSubmit={saveEdit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    <CmsPublishTargetFields
                        franchises={franchises}
                        value={editTarget}
                        onChange={(next) => {
                            setEditTarget(next);
                            if (next.scope !== "one_centre") {
                                setEditForm((p) => ({ ...p, send_to: emptySendToForm() }));
                            }
                        }}
                        showClassTarget={editTarget.scope !== "one_centre"}
                        classOptions={NOTIFICATION_CLASS_OPTIONS}
                    />
                    <div className="flex flex-wrap gap-4 text-sm">
                        <label className="inline-flex items-center gap-2 font-medium text-slate-700">
                            <input
                                type="checkbox"
                                checked={editForm.visible_to_parents}
                                onChange={(e) =>
                                    setEditForm((p) => ({ ...p, visible_to_parents: e.target.checked }))
                                }
                            />
                            Show to parents
                        </label>
                        <label className="inline-flex items-center gap-2 font-medium text-slate-700">
                            <input
                                type="checkbox"
                                checked={editForm.visible_to_centres}
                                onChange={(e) =>
                                    setEditForm((p) => ({ ...p, visible_to_centres: e.target.checked }))
                                }
                            />
                            Show to centres
                        </label>
                    </div>
                    <label className="block text-xs font-semibold text-slate-600">
                        Send to
                        <ManualNotificationSendToFields
                            value={editForm.send_to}
                            onChange={(send_to) => setEditForm((p) => ({ ...p, send_to }))}
                            classOptions={classLabels}
                            students={students}
                            allowClassStudent={allowEditClassStudentSendTo}
                            studentsLoading={studentsLoading}
                        />
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">
                        Publish date
                        <input
                            type="date"
                            required
                            value={editForm.schedule_date}
                            onChange={(e) => setEditForm((p) => ({ ...p, schedule_date: e.target.value }))}
                            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">
                        Title
                        <input
                            required
                            value={editForm.title}
                            onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">
                        Message
                        <textarea
                            value={editForm.body}
                            onChange={(e) => setEditForm((p) => ({ ...p, body: e.target.value }))}
                            rows={4}
                            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        />
                    </label>
                    <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={editSaving} className="bg-orange-500">
                            {editSaving ? "Saving…" : "Save changes"}
                        </Button>
                        <Button type="button" variant="secondary" onClick={closeEdit}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

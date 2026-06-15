"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Bell, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import { CmsPublishTargetFields } from "@/components/dashboard/admin/CmsPublishTargetFields";
import { jsonHeaders } from "@/lib/api-client";
import { CENTRE_PROGRAM_LABELS } from "@/config/centre-program-cards-defaults";
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
    audience: "all" as NotificationAudience,
    student: "",
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

function audienceFromRow(row: AnnouncementRow): NotificationAudience {
    if (row.student) return "student";
    if ((row.class_name || "").trim()) return "class";
    return "all";
}

export default function AdminNotificationsCmsPage() {
    const { authFetch } = useAuth();
    const { franchises } = useAdminData();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rows, setRows] = useState<AnnouncementRow[]>([]);
    const [students, setStudents] = useState<MiniStudent[]>([]);
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
            const data = await authFetch<AnnouncementRow[]>("/students/admin/announcements/?global=1");
            setRows(Array.isArray(data) ? data : []);
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
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const data = await authFetch<MiniStudent[]>(
                    `/students/admin/students/mini/?franchise=${encodeURIComponent(target.franchiseId)}`,
                );
                if (!cancelled) setStudents(Array.isArray(data) ? data : []);
            } catch {
                if (!cancelled) setStudents([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [authFetch, editModal.isOpen, editTarget, publishTarget]);

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
        if (target.className.trim() && values.audience === "student" && values.student) {
            return "Choose either a class filter or one student, not both.";
        }
        if (values.audience === "student" && !values.student) return "Select a student.";
        if (values.audience === "student" && target.scope !== "one_centre") {
            return "Student targeting is only available for one centre.";
        }
        if (mode === "create" && !values.schedule_date.trim()) return "Publish date is required.";
        return null;
    };

    const buildAudience = (values: typeof emptyForm, target: CmsPublishTargetForm) => {
        if (values.audience === "student") return "student" as const;
        if (values.audience === "class" || target.className.trim()) return "class" as const;
        return "all" as const;
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
            await authFetch("/students/admin/announcements/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify(
                    announcementTargetPayload(publishTarget, {
                        title: form.title,
                        body: form.body,
                        schedule_date: form.schedule_date.trim() || todayLocal(),
                        audience: buildAudience(form, publishTarget),
                        student: form.student,
                        visible_to_parents: form.visible_to_parents,
                        visible_to_centres: form.visible_to_centres,
                    }),
                ),
            });
            setForm({ ...emptyForm, schedule_date: todayLocal() });
            setPublishTarget(emptyCmsPublishTarget());
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
        const audience = audienceFromRow(row);
        setEditTarget(target);
        setEditForm({
            audience,
            student: row.student ? String(row.student) : "",
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
            await authFetch(`/students/admin/announcements/${editModal.row.id}/`, {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify(
                    announcementTargetPayload(editTarget, {
                        title: editForm.title,
                        body: editForm.body,
                        schedule_date: editForm.schedule_date.trim() || todayLocal(),
                        audience: buildAudience(editForm, editTarget),
                        student: editForm.student,
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
                        <h1 className="text-2xl font-semibold text-slate-900">Notifications CMS</h1>
                        <p className="text-sm text-slate-600 mt-1">
                            Publish global notifications from head office. Target pan-India, states, cities, or specific
                            centres and classes. Messages appear in franchise centre inboxes and the parent app.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">New notification</h2>

                <CmsPublishTargetFields
                    franchises={franchises}
                    value={publishTarget}
                    onChange={setPublishTarget}
                    showClassTarget
                    classOptions={NOTIFICATION_CLASS_OPTIONS}
                />

                <div className="flex flex-wrap gap-4 text-sm">
                    <label className="inline-flex items-center gap-2 font-medium text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.visible_to_parents}
                            onChange={(e) => setForm((p) => ({ ...p, visible_to_parents: e.target.checked }))}
                        />
                        Show to parents (parent app + email)
                    </label>
                    <label className="inline-flex items-center gap-2 font-medium text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.visible_to_centres}
                            onChange={(e) => setForm((p) => ({ ...p, visible_to_centres: e.target.checked }))}
                        />
                        Show to centres (franchise notifications inbox)
                    </label>
                </div>

                {publishTarget.scope === "one_centre" ? (
                    <label className="block text-xs font-semibold text-slate-600">
                        Narrow to one student (optional)
                        <select
                            value={form.audience === "student" ? form.student : ""}
                            onChange={(e) => {
                                const student = e.target.value;
                                setForm((p) => ({
                                    ...p,
                                    audience: student ? "student" : "all",
                                    student,
                                }));
                            }}
                            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                        >
                            <option value="">All parents (or class filter above)</option>
                            {students.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.full_name} ({s.class_name})
                                </option>
                            ))}
                        </select>
                    </label>
                ) : null}

                <label className="block text-xs font-semibold text-slate-600">
                    Publish date
                    <input
                        type="date"
                        required
                        value={form.schedule_date}
                        onChange={(e) => setForm((p) => ({ ...p, schedule_date: e.target.value }))}
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    />
                </label>
                <label className="block text-xs font-semibold text-slate-600">
                    Title
                    <input
                        required
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    />
                </label>
                <label className="block text-xs font-semibold text-slate-600">
                    Message
                    <textarea
                        value={form.body}
                        onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                        rows={4}
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    />
                </label>
                <Button type="submit" disabled={submitting} className="bg-orange-500">
                    {submitting ? "Publishing…" : "Publish notification"}
                </Button>
            </form>

            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-900">Published notifications</h2>
                {loading && <p className="text-sm text-slate-500">Loading…</p>}
                {!loading && rows.length === 0 && (
                    <p className="text-sm text-slate-500">No global notifications published yet.</p>
                )}
                <ul className="space-y-2">
                    {rows.map((row) => (
                        <li
                            key={row.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap justify-between gap-3"
                        >
                            <div className="min-w-0 space-y-1">
                                <p className="font-semibold text-slate-900">{row.title}</p>
                                <p className="text-xs text-slate-500">
                                    {row.publish_target_label || publishTargetSummary(publishTargetFromAnnouncement(row), franchises)}
                                    {" · "}
                                    {row.audience_label || "All parents"}
                                    {" · "}
                                    {audienceBadges(row)}
                                </p>
                                {row.body ? <p className="text-sm text-slate-700 whitespace-pre-wrap">{row.body}</p> : null}
                                {row.published_at ? (
                                    <p className="text-[11px] text-slate-400">
                                        {new Date(row.published_at).toLocaleString()}
                                    </p>
                                ) : null}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => openEdit(row)}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-red-700 border-red-200"
                                    onClick={() => void remove(row.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <Modal isOpen={editModal.isOpen} onClose={closeEdit} title="Edit notification" size="lg">
                <form onSubmit={saveEdit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    <CmsPublishTargetFields
                        franchises={franchises}
                        value={editTarget}
                        onChange={setEditTarget}
                        showClassTarget
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
                    {editTarget.scope === "one_centre" ? (
                        <label className="block text-xs font-semibold text-slate-600">
                            Narrow to one student (optional)
                            <select
                                value={editForm.audience === "student" ? editForm.student : ""}
                                onChange={(e) => {
                                    const student = e.target.value;
                                    setEditForm((p) => ({
                                        ...p,
                                        audience: student ? "student" : "all",
                                        student,
                                    }));
                                }}
                                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                            >
                                <option value="">All parents (or class filter above)</option>
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.full_name} ({s.class_name})
                                    </option>
                                ))}
                            </select>
                        </label>
                    ) : null}
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

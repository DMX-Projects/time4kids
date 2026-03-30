"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { CalendarDays, Plus, Pencil, Trash2, CheckCircle2, Clock, Image as ImageIcon, Video as VideoIcon, XCircle } from "lucide-react";
import { mediaUrl } from "@/lib/api-client";

type UpdateItem = {
    id: number;
    text: string;
    date: string;
};

type SocialMediaUpload = {
    id: number;
    media_type: "image" | "video";
    title?: string;
    caption?: string;
    file: string;
    status: "pending" | "approved" | "rejected" | string;
    admin_notes?: string;
    created_at: string;
};

const emptyUpdate = { text: "", date: "" };

export default function AdminUpdatesPage() {
    const { authFetch } = useAuth();
    const [updates, setUpdates] = useState<UpdateItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyUpdate);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [socialUploads, setSocialUploads] = useState<SocialMediaUpload[]>([]);
    const [socialLoading, setSocialLoading] = useState(true);
    const [socialReviewLoadingId, setSocialReviewLoadingId] = useState<number | null>(null);

    const fetchSocialUploads = async () => {
        setSocialLoading(true);
        try {
            const data = await authFetch<any>("/updates/social-media/admin/");
            const items = Array.isArray(data) ? data : data?.results || [];
            setSocialUploads(items);
        } catch (err) {
            console.error("Failed to fetch social uploads", err);
        } finally {
            setSocialLoading(false);
        }
    };

    useEffect(() => {
        loadUpdates();
        fetchSocialUploads();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadUpdates = async () => {
        setLoading(true);
        try {
            const data = await authFetch<UpdateItem[]>("/updates/");
            // Handle if data is wrapped in results (pagination)
            const items = Array.isArray(data) ? data : (data as any).results || [];
            setUpdates(items);
        } catch (err) {
            console.error(err);
            // setError("Failed to load updates");
        } finally {
            setLoading(false);
        }
    };

    const startCreate = () => {
        setEditingId(null);
        setForm(emptyUpdate);
        setModalOpen(true);
        setError(null);
    };

    const startEdit = (item: UpdateItem) => {
        setEditingId(item.id);
        setForm({ text: item.text, date: item.date });
        setModalOpen(true);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            if (editingId) {
                await authFetch(`/updates/${editingId}/`, {
                    method: "PATCH",
                    headers: jsonHeaders(),
                    body: JSON.stringify(form),
                });
            } else {
                await authFetch("/updates/", {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify(form),
                });
            }
            await loadUpdates();
            setModalOpen(false);
        } catch (err: any) {
            setError(err?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this update?")) return;
        try {
            await authFetch(`/updates/${id}/`, { method: "DELETE" });
            setUpdates(updates.filter((u) => u.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete update");
        }
    };

    const statusText = (status: SocialMediaUpload["status"]) => {
        if (status === "approved") return "Approved";
        if (status === "rejected") return "Rejected";
        return "Pending";
    };

    const statusIcon = (status: SocialMediaUpload["status"]) => {
        if (status === "approved") return <CheckCircle2 className="w-4 h-4 text-green-600" />;
        if (status === "rejected") return <XCircle className="w-4 h-4 text-red-600" />;
        return <Clock className="w-4 h-4 text-[#FF922B]" />;
    };

    const reviewUpload = async (id: number, status: "approved" | "rejected") => {
        setSocialReviewLoadingId(id);
        try {
            await authFetch(`/updates/social-media/admin/${id}/`, {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify({ status }),
            });
            await fetchSocialUploads();
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Could not update status");
        } finally {
            setSocialReviewLoadingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Updates</h1>
                    <p className="text-sm text-slate-600">Manage the updates shown on the home page.</p>
                </div>
                <Button size="sm" onClick={startCreate} className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Update
                </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-2 text-sm text-slate-700 mb-3">
                    <CalendarDays className="w-4 h-4 text-orange-500" />
                    <span>{updates.length} updates</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-900 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Date</th>
                                <th className="px-4 py-3 font-semibold">Text</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {updates.length === 0 && !loading && (
                                <tr>
                                    <td className="px-4 py-6 text-sm text-slate-500" colSpan={3}>
                                        No updates found.
                                    </td>
                                </tr>
                            )}
                            {updates.map((item, idx) => (
                                <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                                    <td className="px-4 py-3 whitespace-nowrap font-medium">{item.date}</td>
                                    <td className="px-4 py-3 max-w-md truncate">{item.text}</td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                                            onClick={() => startEdit(item)}
                                        >
                                            <Pencil className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Update" : "New Update"} size="md">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                        <input
                            type="date"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Text</label>
                        <textarea
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none min-h-[100px]"
                            value={form.text}
                            onChange={(e) => setForm({ ...form, text: e.target.value })}
                            required
                            placeholder="Enter update details..."
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" size="sm" disabled={submitting}>
                            {submitting ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Social Media Upload Approvals */}
            <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Social Media Upload Approvals</h2>
                        <p className="text-sm text-slate-600">Approve or reject franchise uploads.</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                        {socialUploads.length} items
                    </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                    {socialLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Clock className="w-8 h-8 animate-spin text-orange-500" />
                        </div>
                    ) : socialUploads.length === 0 ? (
                        <p className="text-sm text-slate-600">No social uploads found.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {socialUploads.map((u) => (
                                <div key={u.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                                {u.media_type === "video" ? (
                                                    <VideoIcon className="w-5 h-5 text-orange-600" />
                                                ) : (
                                                    <ImageIcon className="w-5 h-5 text-orange-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">{u.title || (u.media_type === "video" ? "Video Upload" : "Image Upload")}</p>
                                                <p className="text-xs text-slate-600 truncate">{u.caption || "—"}</p>
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200">
                                            {statusIcon(u.status)}
                                            <span className="text-xs font-semibold text-slate-800">{statusText(u.status)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <a
                                            href={mediaUrl(u.file)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-semibold text-orange-600 hover:underline"
                                        >
                                            Open
                                        </a>

                                        <div className="flex gap-2">
                                            <button
                                                disabled={u.status !== "pending" || socialReviewLoadingId === u.id}
                                                onClick={() => reviewUpload(u.id, "approved")}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                disabled={u.status !== "pending" || socialReviewLoadingId === u.id}
                                                onClick={() => reviewUpload(u.id, "rejected")}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

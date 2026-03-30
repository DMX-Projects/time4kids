"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, FileText, Loader2, Save, Pencil, CheckCircle2, Clock, Image as ImageIcon, Video as VideoIcon, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { mediaUrl } from "@/lib/api-client";

interface Update {
    id: number;
    text: string;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
}

interface FormValues {
    text: string;
    start_date: string;
    end_date?: string;
}

type SocialMediaUpload = {
    id: number;
    media_type: "image" | "video";
    title?: string;
    caption?: string;
    file: string;
    status: "pending" | "approved" | "rejected" | string;
    admin_notes?: string;
    created_at: string;
    franchise_name?: string;
};

export default function UpdatesPage() {
    const { authFetch } = useAuth();
    const [updates, setUpdates] = useState<Update[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<FormValues>();
    const { showToast } = useToast();

    // Social Media Uploads & Support Files
    const [socialUploads, setSocialUploads] = useState<SocialMediaUpload[]>([]);
    const [socialLoading, setSocialLoading] = useState(true);
    const [socialSubmitting, setSocialSubmitting] = useState(false);
    const [socialMediaType, setSocialMediaType] = useState<"image" | "video">("image");
    const [socialTitle, setSocialTitle] = useState("");
    const [socialCaption, setSocialCaption] = useState("");
    const [socialFile, setSocialFile] = useState<File | null>(null);

    const fetchUpdates = async (signal?: { cancelled: boolean }) => {
        try {
            const data = await authFetch<any>("/updates/");
            if (signal?.cancelled) return;
            const updatesList = Array.isArray(data) ? data : data?.results || [];
            setUpdates(updatesList);
        } catch (error) {
            console.error("Failed to fetch updates", error);
            if (!signal?.cancelled) {
                showToast("Could not load updates. Please try again.", "error");
            }
        } finally {
            if (!signal?.cancelled) setLoading(false);
        }
    };

    const fetchSocialUploads = async (signal?: { cancelled: boolean }) => {
        try {
            const data = await authFetch<any>("/updates/social-media/");
            if (signal?.cancelled) return;
            const items = Array.isArray(data) ? data : data?.results || [];
            setSocialUploads(items);
        } catch (error) {
            console.error("Failed to fetch social uploads", error);
            if (signal?.cancelled) return;
            const status =
                error && typeof error === "object" && "status" in error
                    ? (error as { status?: number }).status
                    : undefined;
            const msg =
                status === 403
                    ? "Social uploads require a franchise centre login. If you are a centre user, contact support."
                    : "Could not load social uploads. Check that the API is running and try again.";
            showToast(msg, "error");
        } finally {
            if (!signal?.cancelled) setSocialLoading(false);
        }
    };

    useEffect(() => {
        const signal = { cancelled: false };
        void fetchUpdates(signal);
        void fetchSocialUploads(signal);
        return () => {
            signal.cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (data: FormValues) => {
        try {
            // Clean optional end_date if empty
            const payload = { ...data, end_date: data.end_date || null };

            const url = editingUpdate ? `/updates/${editingUpdate.id}/` : "/updates/";
            const method = editingUpdate ? "PUT" : "POST";

            await authFetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            showToast("Saved successfully.", "success");
            closeModal();
            fetchUpdates();
        } catch (error) {
            console.error("Error saving update", error);
            showToast("Could not save. Please try again.", "error");
        }
    };

    const handleEdit = (update: Update) => {
        setEditingUpdate(update);
        setValue("text", update.text);
        setValue("start_date", update.start_date);
        setValue("end_date", update.end_date || "");
        setIsAddOpen(true);
    };

    const closeModal = () => {
        setIsAddOpen(false);
        setEditingUpdate(null);
        reset();
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this update?")) return;
        try {
            await authFetch(`/updates/${id}/`, {
                method: "DELETE",
            });

            showToast("Deleted successfully.", "success");
            setUpdates(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            console.error("Error deleting update", error);
            showToast("Could not delete. Please try again.", "error");
        }
    };

    const handleSocialUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!socialFile) {
            showToast("Please choose an image/video first.", "error");
            return;
        }

        setSocialSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("media_type", socialMediaType);
            formData.append("title", socialTitle);
            formData.append("caption", socialCaption);
            formData.append("file", socialFile);

            await authFetch("/updates/social-media/", {
                method: "POST",
                body: formData,
            });

            showToast("Upload submitted for approval.", "success");
            setSocialTitle("");
            setSocialCaption("");
            setSocialFile(null);
            setSocialMediaType("image");
            await fetchSocialUploads();
        } catch (error) {
            console.error("Failed to upload social media", error);
            showToast("Could not submit upload. Please try again.", "error");
        } finally {
            setSocialSubmitting(false);
        }
    };

    const renderStatusIcon = (status: SocialMediaUpload["status"]) => {
        if (status === "approved") return <CheckCircle2 className="w-4 h-4 text-green-600" />;
        if (status === "rejected") return <XCircle className="w-4 h-4 text-red-600" />;
        return <Clock className="w-4 h-4 text-[#FF922B]" />;
    };

    const statusText = (status: SocialMediaUpload["status"]) => {
        if (status === "approved") return "Approved";
        if (status === "rejected") return "Rejected";
        return "Pending";
    };

    const filteredUpdates = updates.filter(update =>
        update.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Updates & Announcements</h1>
                    <p className="text-sm text-gray-500">Manage important updates for your school webpage.</p>
                </div>
                <Button className="bg-[#FF9F1C] hover:bg-[#FFA935] text-white" onClick={() => setIsAddOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Update
                </Button>
            </div>

            {/* Modal for Add/Edit Update */}
            <Modal isOpen={isAddOpen} onClose={closeModal} title={editingUpdate ? "Edit Update" : "Add New Update"}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                                {...register("start_date", { required: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">End Date (Optional)</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                                {...register("end_date")}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Content</label>
                        <textarea
                            placeholder="Enter update details..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9F1C] resize-none"
                            rows={4}
                            {...register("text", { required: true })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={closeModal} className="bg-white text-gray-700 border-gray-300">Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-[#FF9F1C] text-white">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            {editingUpdate ? "Update Announcement" : "Save Update"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Social Media Uploads & Support Files */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Social Media Uploads & Support Files</h2>
                        <p className="text-sm text-gray-500">Upload image/video posts. HO will approve or reject them.</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                        {socialUploads.length} uploads
                    </span>
                </div>

                <form onSubmit={handleSocialUpload} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <label className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700">Type</span>
                            <select
                                value={socialMediaType}
                                onChange={(e) => setSocialMediaType(e.target.value as "image" | "video")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none"
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </label>

                        <label className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700">Title (optional)</span>
                            <input
                                value={socialTitle}
                                onChange={(e) => setSocialTitle(e.target.value)}
                                placeholder="e.g., Admissions Poster"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none"
                            />
                        </label>

                        <label className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700">File</span>
                            <input
                                type="file"
                                accept={socialMediaType === "image" ? "image/*" : "video/*"}
                                onChange={(e) => setSocialFile(e.target.files?.[0] || null)}
                                className="w-full text-sm"
                            />
                        </label>
                    </div>

                    <label className="space-y-2 block">
                        <span className="block text-sm font-medium text-gray-700">Caption (optional)</span>
                        <textarea
                            value={socialCaption}
                            onChange={(e) => setSocialCaption(e.target.value)}
                            rows={3}
                            placeholder="Short description for HO review..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9F1C] focus:outline-none resize-none"
                        />
                    </label>

                    <div className="flex justify-end">
                        <Button type="submit" className="bg-[#FF9F1C] hover:bg-[#FFA935] text-white" disabled={socialSubmitting}>
                            {socialSubmitting ? "Uploading..." : "Submit for Approval"}
                        </Button>
                    </div>
                </form>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                    {socialLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                        </div>
                    ) : socialUploads.length === 0 ? (
                        <p className="text-sm text-gray-500">No uploads yet.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {socialUploads.map((u) => (
                                <div key={u.id} className="border border-gray-200 rounded-xl p-4 space-y-2">
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
                                                <p className="font-semibold text-gray-900 text-sm">{u.title || (u.media_type === "video" ? "Video Upload" : "Image Upload")}</p>
                                                <p className="text-xs text-gray-500 truncate">{u.caption || "—"}</p>
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200">
                                            {renderStatusIcon(u.status)}
                                            <span className="text-xs font-semibold text-gray-800">{statusText(u.status)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 pt-1">
                                        <span className="text-[11px] text-gray-500">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString("en-GB") : ""}
                                        </span>
                                        <a
                                            href={mediaUrl(u.file)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-semibold text-orange-600 hover:underline"
                                        >
                                            Open
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-2 max-w-sm">
                <input
                    placeholder="Search updates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : filteredUpdates.length === 0 ? (
                <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No updates found</h3>
                        <p className="text-gray-500 mt-1">Start by adding your first update announcement.</p>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredUpdates.map((update) => (
                        <Card key={update.id} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-stretch">
                                <div className="w-2 bg-[#FF9F1C]"></div>
                                <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {new Date(update.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                {update.end_date && ` - ${new Date(update.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                                            </span>
                                        </div>
                                        <p className="text-gray-900 font-medium text-lg">{update.text}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="p-2 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                            onClick={() => handleEdit(update)}
                                            title="Edit Update"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                            onClick={() => handleDelete(update.id)}
                                            title="Delete Update"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

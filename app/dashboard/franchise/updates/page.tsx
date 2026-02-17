"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, FileText, Loader2, Save, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";

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

export default function UpdatesPage() {
    const { authFetch } = useAuth();
    const [updates, setUpdates] = useState<Update[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<FormValues>();
    const { showToast } = useToast();

    const fetchUpdates = async () => {
        try {
            const data = await authFetch<any>("/updates/");
            // Handle DRF pagination if present
            const updatesList = Array.isArray(data) ? data : data?.results || [];
            setUpdates(updatesList);
        } catch (error) {
            console.error("Failed to fetch updates", error);
            showToast("Failed to load updates", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUpdates();
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

            showToast(editingUpdate ? "Update modified successfully" : "Update added successfully", "success");
            closeModal();
            fetchUpdates();
        } catch (error) {
            console.error("Error saving update", error);
            showToast("Failed to save update", "error");
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

            showToast("Update deleted", "success");
            setUpdates(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            console.error("Error deleting update", error);
            showToast("Something went wrong", "error");
        }
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

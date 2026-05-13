"use client";

import { useMemo, useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Images, Plus, Pencil, Trash2, Eye, EyeOff, Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Image from "next/image";
import { mediaUrl, apiUrl } from "@/lib/api-client";

interface HeroSlide {
    id: number;
    image: string;
    alt_text: string;
    link: string;
    order: number;
    is_active: boolean;
}

const emptySlide = { alt_text: "", link: "", order: 0, is_active: true };

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB — enforced; dimensions below are UI guidance only
const HERO_RECOMMENDED = { w: 1920, h: 600 };
const HERO_MIN = { w: 1600, h: 600 };
const HERO_ASPECT = HERO_RECOMMENDED.w / HERO_RECOMMENDED.h;

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    // Prefer createImageBitmap when available (fast, no DOM).
    if (typeof createImageBitmap === "function") {
        const bmp = await createImageBitmap(file);
        const dims = { width: bmp.width, height: bmp.height };
        bmp.close?.();
        return dims;
    }

    // Fallback to Image() (works in older environments).
    const url = URL.createObjectURL(file);
    try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new window.Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error("Could not read image"));
            el.src = url;
        });
        return { width: img.naturalWidth, height: img.naturalHeight };
    } finally {
        URL.revokeObjectURL(url);
    }
}

function formatBytes(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)}MB`;
}

export default function HeroSlidesPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<any>(emptySlide);

    // Changed to array for bulk upload
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

    const fetchSlides = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl('/common/hero-slides/'));
            if (response.ok) {
                const data = await response.json();
                setSlides(data);
            }
        } catch (err) {
            console.error("Failed to fetch slides", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlides();
    }, []);

    const startCreate = () => {
        setEditingId(null);
        setForm(emptySlide);
        setImageFiles([]);
        setPreviews([]);
        setModalOpen(true);
        setError(null);
    };

    const startEdit = (slide: HeroSlide) => {
        setEditingId(slide.id);
        setForm({
            alt_text: slide.alt_text,
            link: slide.link || "",
            order: slide.order,
            is_active: slide.is_active,
        });
        setImageFiles([]);
        setPreviews([]);
        setModalOpen(true);
        setError(null);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        // Clear any previous error and cleanup old previews
        setError(null);
        setPreviews((prev) => {
            prev.forEach((u) => URL.revokeObjectURL(u));
            return [];
        });

        const files = Array.from(e.target.files);
        const accepted: File[] = [];
        const acceptedPreviews: string[] = [];
        const problems: string[] = [];

        for (const file of files) {
            if (file.size > MAX_FILE_BYTES) {
                problems.push(`"${file.name}" is too large (${formatBytes(file.size)}). Max allowed is 5MB.`);
                continue;
            }

            try {
                await getImageDimensions(file);
            } catch {
                /* still allow upload if under size cap */
            }
            accepted.push(file);
            acceptedPreviews.push(URL.createObjectURL(file));
        }

        setImageFiles(accepted);
        setPreviews(acceptedPreviews);
        if (problems.length) {
            setError(problems.join("\n"));
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...imageFiles];
        newFiles.splice(index, 1);
        setImageFiles(newFiles);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]); // Clean up URL
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(apiUrl(`/common/hero-slides/${id}/`), {
                method: 'DELETE',
            });
            if (response.ok) {
                setSlides(slides.filter(s => s.id !== id));
                showToast("Slide deleted successfully", "success");
            } else {
                showToast("Failed to delete slide", "error");
            }
        } catch (err) {
            showToast("Error deleting slide", "error");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            if (editingId) {
                // Edit mode (Single slide)
                const formData = new FormData();
                formData.append("alt_text", form.alt_text);
                formData.append("link", form.link);
                formData.append("order", form.order.toString());
                formData.append("is_active", form.is_active ? "true" : "false");

                if (imageFiles.length > 0) {
                    formData.append("image", imageFiles[0]); // Only take first file for edit
                }

                const response = await fetch(apiUrl(`/common/hero-slides/${editingId}/`), {
                    method: 'PATCH',
                    body: formData,
                });

                if (!response.ok) throw new Error("Failed to update slide");

            } else {
                // Create mode (Potential Bulk)
                if (imageFiles.length === 0) {
                    setError("Please select at least one image.");
                    setSubmitting(false);
                    return;
                }

                // Loop through all selected files and create a slide for each
                const uploadPromises = imageFiles.map((file, index) => {
                    const formData = new FormData();
                    formData.append("image", file);
                    // Append metadata (optional: could append index to order)
                    formData.append("alt_text", form.alt_text || ""); // Use empty string if alt empty
                    formData.append("link", form.link || "");
                    formData.append("order", (form.order + index).toString());
                    formData.append("is_active", form.is_active ? "true" : "false");

                    return fetch(apiUrl('/common/hero-slides/'), {
                        method: 'POST',
                        body: formData,
                    });
                });

                const responses = await Promise.all(uploadPromises);
                const failed = responses.some(r => !r.ok);

                if (failed) throw new Error("Some images failed to upload.");
            }

            setModalOpen(false);
            fetchSlides();
        } catch (err: any) {
            setError(err.message || "An error occurred while saving");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Hero Slider</h1>
                    <p className="text-sm text-slate-600">Manage homepage banner images.</p>
                </div>
                <Button size="sm" onClick={startCreate} className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Slide(s)
                </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-900 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-4 py-3">Image</th>
                            <th className="px-4 py-3">Alt Text</th>
                            <th className="px-4 py-3">Link</th>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {slides.map((slide) => (
                            <tr key={slide.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <div className="relative w-24 h-12 rounded overflow-hidden bg-slate-100 border border-slate-200">
                                        <Image
                                            src={mediaUrl(slide.image)}
                                            alt={slide.alt_text}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-700">{slide.alt_text}</td>
                                <td className="px-4 py-3 text-xs text-slate-500 truncate max-w-[150px]">{slide.link || "-"}</td>
                                <td className="px-4 py-3">{slide.order}</td>
                                <td className="px-4 py-3">
                                    {slide.is_active ? (
                                        <span className="inline-flex items-center gap-1 text-green-700 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                            <Eye className="w-3 h-3" /> Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-medium bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                                            <EyeOff className="w-3 h-3" /> Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <button
                                        onClick={() => startEdit(slide)}
                                        className="p-1.5 hover:bg-orange-50 text-slate-500 hover:text-orange-600 rounded transition"
                                        title="Edit"
                                        type="button"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete({ isOpen: true, id: slide.id })}
                                        className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded transition"
                                        title="Delete"
                                        type="button"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {slides.length === 0 && !loading && (
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                            <Images className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900">No slides yet</h3>
                        <p className="text-sm text-slate-500 mt-1">Upload images to get started.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Slide" : "Add New Slide(s)"} size="md">
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Image Upload Area */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {editingId ? "Change Image (Optional)" : "Select Images (Bulk Upload)"}
                        </label>

                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:bg-slate-50 transition cursor-pointer relative group">
                            <input
                                type="file"
                                accept="image/*"
                                multiple={!editingId} // Allow multiple only when creating
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 text-orange-500 mb-2 group-hover:scale-110 transition">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <p className="text-sm font-medium text-slate-700">Click to upload images</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    PNG/JPG/WebP (max 5MB). Recommended <strong>{HERO_RECOMMENDED.w}×{HERO_RECOMMENDED.h}px</strong> (wide banner).
                                </p>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-slate-600 space-y-1">
                            <div>
                                <span className="font-semibold text-slate-700">Requirements (recommended):</span> max{" "}
                                <strong>5MB</strong>, at least <strong>
                                    {HERO_MIN.w}×{HERO_MIN.h}px
                                </strong>
                                , wide banner ratio ~<strong>{HERO_ASPECT.toFixed(1)}:1</strong>. Best:{" "}
                                <strong>
                                    {HERO_RECOMMENDED.w}×{HERO_RECOMMENDED.h}px
                                </strong>
                                .
                            </div>
                            <div className="text-slate-500">
                                <span className="font-semibold text-slate-600">Enforced:</span> file size ≤5MB only — smaller dimensions or other ratios still upload.
                            </div>
                        </div>

                        {/* Image Previews */}
                        {previews.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-4">
                                {previews.map((src, idx) => (
                                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                                        <Image src={src} alt="Preview" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="absolute top-1 right-1 p-1 bg-white/90 text-slate-600 rounded-full hover:text-red-600 opacity-0 group-hover:opacity-100 transition shadow-sm"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {previews.length > 5 && (
                            <p className="text-xs text-slate-500 mt-2">and {previews.length - 5} more...</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Alt Text {editingId ? "" : "(Default for all)"}</label>
                        <input
                            type="text"
                            value={form.alt_text}
                            onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                            placeholder="Descriptive text"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Link URL (Optional)</label>
                        <input
                            type="text"
                            value={form.link}
                            onChange={(e) => setForm({ ...form, link: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                            placeholder="https://test.com/page"
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Order</label>
                            <input
                                type="number"
                                value={form.order}
                                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-end mb-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded text-orange-600 border-slate-300 focus:ring-orange-500"
                                />
                                <span className="text-sm font-medium text-slate-700">Active</span>
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm whitespace-pre-line">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Uploading..." : editingId ? "Save Changes" : `Upload ${imageFiles.length > 0 ? imageFiles.length : ''} Slide(s)`}
                        </Button>
                    </div>
                </form>
            </Modal>
            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
                title="Delete Slide"
                description="Are you sure you want to delete this hero slide? This will remove it from the homepage banner."
                confirmText="Yes, Delete"
                variant="danger"
            />
        </div>
    );
}

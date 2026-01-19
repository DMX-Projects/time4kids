'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit, ExternalLink, GripVertical, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { apiUrl, mediaUrl } from '@/lib/api-client';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import FranchiseHeroSlider from '@/components/franchise/FranchiseHeroSlider';

interface HeroSlide {
    id: number;
    image: string;
    alt_text: string;
    link: string;
    order: number;
    is_active: boolean;
}

export default function ManageHeroSlider() {
    const { showToast } = useToast();
    const { tokens } = useAuth();
    const token = tokens?.access;
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const [uploading, setUploading] = useState(false);

    const { register, handleSubmit, reset, setValue } = useForm();
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

    const fetchSlides = async () => {
        try {
            const response = await fetch(apiUrl('/franchises/franchise/hero-slides/'), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setSlides(data.results || data);
            }
        } catch (error) {
            console.error('Error fetching slides:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchSlides();
    }, [token]);

    const handleOpenModal = (slide?: HeroSlide) => {
        if (slide) {
            setEditingSlide(slide);
            setValue('alt_text', slide.alt_text);
            setValue('link', slide.link);
            setValue('order', slide.order);
            setPreviewImages([mediaUrl(slide.image)]);
        } else {
            setEditingSlide(null);
            reset();
            setPreviewImages([]);
            // Auto increment order
            const maxOrder = Math.max(...slides.map(s => s.order), 0);
            setValue('order', maxOrder + 1);
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this slide?')) return;
        try {
            await fetch(apiUrl(`/franchises/franchise/hero-slides/${id}/`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchSlides();
        } catch (error) {
            console.error('Error deleting slide:', error);
        }
    };

    const onSubmit = async (data: any) => {
        setUploading(true);
        setUploadProgress(null);

        try {
            // EDIT MODE
            if (editingSlide) {
                const formData = new FormData();
                formData.append('alt_text', data.alt_text);
                formData.append('link', data.link);
                formData.append('order', data.order);
                if (data.image && data.image[0]) {
                    formData.append('image', data.image[0]);
                }

                const response = await fetch(apiUrl(`/franchises/franchise/hero-slides/${editingSlide.id}/`), {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                if (response.ok) {
                    setIsModalOpen(false);
                    fetchSlides();
                    reset();
                    showToast('Slide updated successfully!', 'success');
                } else {
                    const errData = await response.json().catch(() => ({}));
                    showToast(errData.detail || 'Failed to update slide.', 'error');
                }
            }
            // CREATE MODE (Batch Upload)
            else {
                const files = data.image ? Array.from(data.image as FileList) : [];
                if (files.length === 0) {
                    showToast('Please select at least one image.', 'error');
                    setUploading(false);
                    return;
                }

                setUploadProgress({ current: 0, total: files.length });
                let successCount = 0;
                let failCount = 0;
                let startOrder = parseInt(data.order) || 1;

                // Upload sequentially to maintain order and prevent server overwhelm
                for (let i = 0; i < files.length; i++) {
                    const formData = new FormData();
                    formData.append('alt_text', data.alt_text); // Same alt text for all in batch
                    formData.append('link', data.link);
                    formData.append('order', (startOrder + i).toString());
                    formData.append('image', files[i]);

                    try {
                        const response = await fetch(apiUrl('/franchises/franchise/hero-slides/'), {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${token}` },
                            body: formData,
                        });

                        if (response.ok) {
                            successCount++;
                        } else {
                            failCount++;
                            console.error(`Failed to upload file ${i + 1}`);
                        }
                    } catch (err) {
                        failCount++;
                        console.error(`Error uploading file ${i + 1}:`, err);
                    }

                    setUploadProgress({ current: i + 1, total: files.length });
                }

                setIsModalOpen(false);
                fetchSlides();
                reset();

                if (failCount === 0) {
                    showToast(`${successCount} slides saved successfully!`, 'success');
                } else {
                    showToast(`Saved ${successCount} slides. ${failCount} failed.`, 'info');
                }
            }
        } catch (error) {
            console.error('Error saving slides:', error);
            showToast('An unexpected error occurred.', 'error');
        } finally {
            setUploading(false);
            setUploadProgress(null);
        }
    };

    // Handle Image Preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
            setPreviewImages(newPreviews);
        }
    };

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-800">Hero Slider</h1>
                    <p className="text-gray-500 mt-1">Manage the slides displayed on your public page.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-5 h-5 mr-2" /> Add Slide
                </Button>
            </div>

            {/* List Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {slides.map((slide) => (
                    <div key={slide.id} className="bg-white group rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden">
                        <div className="relative h-48 w-full bg-gray-100">
                            <Image
                                src={mediaUrl(slide.image)}
                                alt={slide.alt_text}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                    onClick={() => handleOpenModal(slide)}
                                    className="p-2 bg-white rounded-full hover:bg-orange-50 text-orange-600 transition-colors"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(slide.id)}
                                    className="p-2 bg-white rounded-full hover:bg-red-50 text-red-600 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                Order: {slide.order}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-800 truncate">{slide.alt_text || "No Title"}</h3>
                            {slide.link && (
                                <a href={slide.link} target="_blank" className="text-sm text-blue-600 flex items-center mt-1 hover:underline">
                                    <ExternalLink className="w-3 h-3 mr-1" /> {slide.link}
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {slides.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No slides added yet. Click "Add Slide" to get started.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSlide ? "Edit Slide" : "Add New Slide"}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Slide Image(s) {!editingSlide && <span className="text-gray-400 font-normal ml-1">(Can select multiple)</span>}
                        </label>
                        <div className="relative min-h-[12rem] w-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden group hover:border-orange-400 transition-colors p-4">
                            {previewImages.length > 0 ? (
                                <div className={`grid gap-2 w-full h-full ${previewImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {previewImages.slice(0, 4).map((img, i) => (
                                        <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                                            <Image src={img} alt={`Preview ${i}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                    {previewImages.length > 4 && (
                                        <div className="flex items-center justify-center bg-gray-100 text-gray-500 text-sm font-medium rounded-lg">
                                            +{previewImages.length - 4} more
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">
                                        {editingSlide ? "Click to replace image" : "Click to upload image(s)"}
                                    </p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                multiple={!editingSlide}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                {...register('image', { required: !editingSlide, onChange: handleImageChange })}
                            />
                        </div>
                        <p className="text-xs text-gray-400">Recommended size: 1920x600px</p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Alt Text / Title</label>
                        <input
                            {...register('alt_text')}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="e.g. Summer Camp 2026"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Link URL (Optional)</label>
                        <input
                            {...register('link')}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Display Order</label>
                        <input
                            type="number"
                            {...register('order')}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? 'Saving...' : 'Save Slide'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

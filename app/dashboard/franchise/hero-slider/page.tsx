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
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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
            setPreviewImage(mediaUrl(slide.image));
        } else {
            setEditingSlide(null);
            reset();
            setPreviewImage(null);
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
        const formData = new FormData();
        formData.append('alt_text', data.alt_text);
        formData.append('link', data.link);
        formData.append('order', data.order);

        if (data.image && data.image[0]) {
            formData.append('image', data.image[0]);
        }

        try {
            const url = editingSlide
                ? apiUrl(`/franchises/franchise/hero-slides/${editingSlide.id}/`)
                : apiUrl('/franchises/franchise/hero-slides/');

            const method = editingSlide ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchSlides();
                reset();
                showToast('Slide saved successfully!', 'success');
            } else {
                console.error("Save failed:", response.status, response.statusText);
                const errData = await response.json().catch(() => ({}));
                console.error("Error body:", errData);
                showToast(errData.detail || 'Failed to save slide.', 'error');
            }
        } catch (error) {
            console.error('Error saving slide:', error);
            showToast('An unexpected error occurred.', 'error');
        } finally {
            setUploading(false);
        }
    };

    // Handle Image Preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
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
                        <label className="block text-sm font-semibold text-gray-700">Slide Image</label>
                        <div className="relative h-48 w-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden group hover:border-orange-400 transition-colors">
                            {previewImage ? (
                                <Image src={previewImage} alt="Preview" fill className="object-cover" />
                            ) : (
                                <div className="text-center p-4">
                                    <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">Click to upload image</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
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

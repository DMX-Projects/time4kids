'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit, ExternalLink, Image as ImageIcon, Video, Calendar, Folder } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { apiUrl, mediaUrl } from '@/lib/api-client';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface GalleryItem {
    id: number;
    media_type: 'photo' | 'video';
    title: string;
    image: string;
    video_link: string;
    academic_year: string;
    event_category: string;
    is_active: boolean;
}

export default function ManageGallery() {
    const { showToast } = useToast();
    const { tokens } = useAuth();
    const token = tokens?.access;
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [uploading, setUploading] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Watch media type to conditional rendering
    const mediaType = watch('media_type', 'photo');

    const fetchItems = async () => {
        try {
            const response = await fetch(apiUrl('/franchises/franchise/gallery/'), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setItems(data.results || data);
            }
        } catch (error) {
            console.error('Error fetching gallery items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchItems();
    }, [token]);

    const handleOpenModal = (item?: GalleryItem) => {
        if (item) {
            setEditingItem(item);
            setValue('media_type', item.media_type);
            setValue('title', item.title);
            setValue('video_link', item.video_link);
            setValue('academic_year', item.academic_year);
            setValue('event_category', item.event_category);
            setPreviewImage(mediaUrl(item.image));
        } else {
            setEditingItem(null);
            reset({
                media_type: 'photo',
                academic_year: '2023-24', // Default
                event_category: 'General'
            });
            setPreviewImage(null);
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await fetch(apiUrl(`/franchises/franchise/gallery/${id}/`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchItems();
            showToast('Item deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting item:', error);
            showToast('Failed to delete item', 'error');
        }
    };

    const onSubmit = async (data: any) => {
        setUploading(true);
        try {
            const promises = [];
            const files = data.image as FileList;

            // If editing or only one file or video, handle normally (single request)
            if (editingItem || mediaType === 'video' || (files && files.length <= 1)) {
                const formData = new FormData();
                formData.append('media_type', data.media_type);
                formData.append('title', data.title);
                formData.append('academic_year', data.academic_year);
                formData.append('event_category', data.event_category);

                if (data.media_type === 'video') {
                    formData.append('video_link', data.video_link);
                } else {
                    formData.append('video_link', '');
                }

                if (files && files[0]) {
                    formData.append('image', files[0]);
                }

                const url = editingItem
                    ? apiUrl(`/franchises/franchise/gallery/${editingItem.id}/`)
                    : apiUrl('/franchises/franchise/gallery/');

                const method = editingItem ? 'PATCH' : 'POST';

                promises.push(
                    fetch(url, {
                        method: method,
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    })
                );
            } else {
                // Bulk Upload for Photos
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const formData = new FormData();
                    formData.append('media_type', 'photo');
                    // Append index to title if multiple files
                    formData.append('title', `${data.title} ${i + 1}`);
                    formData.append('academic_year', data.academic_year);
                    formData.append('event_category', data.event_category);
                    formData.append('video_link', '');
                    formData.append('image', file);

                    promises.push(
                        fetch(apiUrl('/franchises/franchise/gallery/'), {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${token}` },
                            body: formData,
                        })
                    );
                }
            }

            const responses = await Promise.all(promises);
            const allOk = responses.every(r => r.ok);

            if (allOk) {
                setIsModalOpen(false);
                fetchItems();
                reset();
                showToast(files && files.length > 1 ? 'All items uploaded successfully!' : 'Gallery item saved successfully!', 'success');
            } else {
                // Try to get error from first failed response
                const failedRes = responses.find(r => !r.ok);
                const errData = await failedRes?.json().catch(() => ({}));
                console.error("Save failed:", errData);
                showToast(errData.detail || 'Failed to save some items.', 'error');
            }
        } catch (error) {
            console.error('Error saving item:', error);
            showToast('An unexpected error occurred.', 'error');
        } finally {
            setUploading(false);
        }
    };

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
                    <h1 className="text-3xl font-display font-bold text-gray-800">Gallery</h1>
                    <p className="text-gray-500 mt-1">Manage photos and videos for your school gallery.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-5 h-5 mr-2" /> Add Item
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                    <div key={item.id} className="bg-white group rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden flex flex-col">
                        <div className="relative h-48 w-full bg-gray-100">
                            <Image
                                src={mediaUrl(item.image)}
                                alt={item.title}
                                fill
                                className="object-cover"
                            />
                            {item.media_type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white">
                                        <Video className="w-5 h-5 fill-white" />
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                    onClick={() => handleOpenModal(item)}
                                    className="p-2 bg-white rounded-full hover:bg-orange-50 text-orange-600 transition-colors"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 bg-white rounded-full hover:bg-red-50 text-red-600 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1">
                                <span className="bg-white/90 text-gray-800 text-xs px-2 py-1 rounded font-medium shadow-sm">
                                    {item.academic_year}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-800 truncate mb-1" title={item.title}>{item.title}</h3>
                            <div className="flex items-center text-xs text-gray-500 gap-2 mb-2">
                                <span className="flex items-center"><Folder className="w-3 h-3 mr-1" /> {item.event_category}</span>
                            </div>
                            {item.video_link && (
                                <a href={item.video_link} target="_blank" rel="noopener noreferrer" className="mt-auto text-xs text-blue-600 flex items-center hover:underline truncate">
                                    <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" /> {item.video_link}
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {items.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No gallery items added yet. Click "Add Item" to get started.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Gallery Item" : "Add New Item"}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Media Type</label>
                            <select
                                {...register('media_type')}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                            >
                                <option value="photo">Photo</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Academic Year</label>
                            <input
                                {...register('academic_year')}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="e.g. 2023-24"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            {mediaType === 'video' || editingItem ? 'Title' : 'Title (Prefix for bulk upload)'}
                        </label>
                        <input
                            {...register('title', { required: "Title is required" })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="e.g. Annual Day Fun"
                        />
                        {errors.title && <p className="text-xs text-red-500">{String(errors.title.message)}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Event Category</label>
                        <input
                            {...register('event_category')}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="e.g. Annual Day, Sports Day"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            {mediaType === 'video' ? 'Thumbnail Image' : 'Photo(s)'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative h-40 w-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden group hover:border-orange-400 transition-colors">
                            {previewImage ? (
                                <Image src={previewImage} alt="Preview" fill className="object-cover" />
                            ) : (
                                <div className="text-center p-4">
                                    <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-500">
                                        {mediaType === 'photo' && !editingItem ? 'Click to upload multiple photos' : 'Click to upload'}
                                    </p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                multiple={mediaType === 'photo' && !editingItem}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                {...register('image', { required: !editingItem && "Image is required", onChange: handleImageChange })}
                            />
                        </div>
                        {errors.image && <p className="text-xs text-red-500">{String(errors.image.message)}</p>}
                        {mediaType === 'photo' && !editingItem && <p className="text-xs text-gray-400 text-center">You can select multiple images.</p>}
                    </div>

                    {mediaType === 'video' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Video Link (YouTube/Vimeo) <span className="text-red-500">*</span></label>
                            <input
                                {...register('video_link', { required: mediaType === 'video' && "Video link is required" })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="https://..."
                            />
                            {errors.video_link && <p className="text-xs text-red-500">{String(errors.video_link.message)}</p>}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? 'Saving...' : 'Save Item'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

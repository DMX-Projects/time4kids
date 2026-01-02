'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Trash2, Film, Image as ImageIcon } from 'lucide-react';
import { mediaUrl, apiUrl } from '@/lib/api-client';

interface MediaItem {
    id: number;
    title: string;
    file: string;
    media_type: 'image' | 'video';
    created_at: string;
}

export default function AdminMediaPage() {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMedia = async () => {
        try {
            const response = await fetch(apiUrl('/media/'));
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setMediaItems(data);
                } else if (data.results && Array.isArray(data.results)) {
                    setMediaItems(data.results);
                } else {
                    setMediaItems([]);
                }
            }
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this media item?')) return;

        try {
            const response = await fetch(apiUrl(`/media/${id}/`), {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchMedia(); // Refresh list
            } else {
                alert('Failed to delete item.');
            }
        } catch (error) {
            console.error('Error deleting media:', error);
            alert('Error deleting item.');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Media Files</h1>
                <Link
                    href="/dashboard/admin/media/add"
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Media</span>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {mediaItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                            <div className="relative h-48 bg-gray-100">
                                {item.media_type === 'video' ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <video src={mediaUrl(item.file)} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Film size={40} className="text-white opacity-80" />
                                        </div>
                                    </div>
                                ) : (
                                    <Image
                                        src={mediaUrl(item.file)}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-800 truncate" title={item.title}>{item.title}</h3>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                    {item.media_type === 'video' ? <Film size={14} /> : <ImageIcon size={14} />}
                                    <span className="capitalize">{item.media_type}</span>
                                    <span>•</span>
                                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!loading && mediaItems.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No media files found. Click "Add Media" to upload.</p>
                </div>
            )}
        </div>
    );
}

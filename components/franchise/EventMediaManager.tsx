'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { apiUrl, mediaUrl } from '@/lib/api-client';
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, Play, Loader } from 'lucide-react';
import Button from '@/components/ui/Button';
import Image from 'next/image';

interface EventMediaItem {
    id: number;
    file: string;
    media_type: 'IMAGE' | 'VIDEO';
    caption: string;
    uploaded_at: string;
}

interface Event {
    id: number;
    title: string;
    description: string;
}

interface EventMediaManagerProps {
    event: Event;
    onBack: () => void;
}

export default function EventMediaManager({ event, onBack }: EventMediaManagerProps) {
    const { tokens } = useAuth();
    const { showToast } = useToast();
    const token = tokens?.access;

    const [mediaItems, setMediaItems] = useState<EventMediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
    const [caption, setCaption] = useState('');

    const fetchMedia = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch(apiUrl(`/events/franchise/${event.id}/media/`), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setMediaItems(data.results || data);
            } else {
                showToast('Failed to fetch media', 'error');
            }
        } catch (error) {
            console.error('Error fetching media:', error);
            showToast('Error loading media', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, [event.id, token]);

    const handleUpload = async () => {
        if (!token || !selectedFiles || selectedFiles.length === 0) return;

        setUploading(true);
        try {
            let successCount = 0;
            let failCount = 0;

            for (const file of Array.from(selectedFiles)) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('media_type', mediaType);
                formData.append('caption', caption || file.name);

                try {
                    const response = await fetch(apiUrl(`/events/franchise/${event.id}/media/`), {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        body: formData,
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        failCount++;
                        const errBody = await response.text().catch(() => 'No response body');
                        console.error('Failed to upload', file.name, 'Status:', response.status, errBody);
                    }
                } catch (err) {
                    failCount++;
                    console.error('Error uploading', file.name, err);
                }
            }

            if (successCount > 0) {
                showToast(`Successfully uploaded ${successCount} file(s)! ${failCount > 0 ? `${failCount} failed.` : ''}`, failCount > 0 ? 'info' : 'success');
                setSelectedFiles(null);
                setCaption('');
                fetchMedia();
            } else if (failCount > 0) {
                showToast('All file uploads failed. Check server connection.', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Upload failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (mediaId: number) => {
        if (!token || !confirm('Delete this media item?')) return;

        try {
            const response = await fetch(apiUrl(`/events/franchise/${event.id}/media/${mediaId}/`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                showToast('Media deleted successfully', 'success');
                fetchMedia();
            } else {
                showToast('Failed to delete media', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast('An error occurred', 'error');
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-800">{event.title}</h1>
                        <p className="text-gray-500 mt-1">Manage photos and videos for this event</p>
                    </div>
                </div>
                <div className="text-sm text-gray-500 font-semibold">
                    {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Upload Media</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Media Type</label>
                            <select
                                value={mediaType}
                                onChange={(e) => setMediaType(e.target.value as 'IMAGE' | 'VIDEO')}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                <option value="IMAGE">Photo</option>
                                <option value="VIDEO">Video</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Caption (Optional)</label>
                            <input
                                type="text"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="Describe the media"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Select Files {mediaType === 'IMAGE' && '(Multiple allowed)'}
                            </label>
                            <input
                                type="file"
                                accept={mediaType === 'IMAGE' ? 'image/*' : 'video/*'}
                                multiple={mediaType === 'IMAGE'}
                                onChange={(e) => setSelectedFiles(e.target.files)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFiles || uploading}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading ? 'Uploading...' : `Upload ${selectedFiles?.length || 0} file(s)`}
                        </Button>
                        {selectedFiles && selectedFiles.length > 0 && (
                            <span className="text-sm text-gray-500">
                                {selectedFiles.length} file(s) selected
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Media Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : mediaItems.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">No Media Yet</h3>
                    <p className="text-gray-500">Upload photos or videos to showcase this event.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {mediaItems.map((item) => (
                        <div
                            key={item.id}
                            className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <Image
                                src={mediaUrl(item.file)}
                                alt={item.caption || 'Event media'}
                                fill
                                className="object-cover"
                            />
                            {item.media_type === 'VIDEO' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                        <Play className="w-6 h-6 text-red-600 fill-current" />
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            {item.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                    <p className="text-white text-xs truncate">{item.caption}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Upload, FileVideo, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiUrl } from '@/lib/api-client';

export default function AddMediaPage() {
    const router = useRouter();
    const { tokens } = useAuth(); // Get auth token
    const token = tokens?.access;
    const [title, setTitle] = useState('');
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);

            // Append new files
            setFiles(prev => [...prev, ...selectedFiles]);

            // Create previews
            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            // Revoke URL to avoid memory leaks
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0 || !title) return;
        if (!token) {
            alert("You are not authenticated. Please login again.");
            return;
        }

        setSubmitting(true);
        setUploadProgress(0);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            // If multiple files, append index to title
            const itemTitle = files.length > 1 ? `${title} - ${i + 1}` : title;

            formData.append('title', itemTitle);
            formData.append('media_type', mediaType);
            formData.append('file', file);

            try {
                const response = await fetch(apiUrl('/media/'), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData,
                });

                if (response.ok) {
                    successCount++;
                } else {
                    failCount++;
                    console.error(`Failed to upload ${file.name}`);
                }
            } catch (error) {
                failCount++;
                console.error(`Error uploading ${file.name}:`, error);
            }

            // Update progress
            setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        }

        setSubmitting(false);

        if (failCount === 0) {
            router.push('/dashboard/admin/media');
        } else {
            alert(`Uploaded ${successCount} files. Failed to upload ${failCount} files.`);
            if (successCount > 0) {
                router.push('/dashboard/admin/media');
            }
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Link
                href="/dashboard/admin/media"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                <ChevronLeft size={20} />
                <span>Back to Media</span>
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h1 className="text-xl font-bold text-gray-800">Add New Media</h1>
                    <p className="text-sm text-gray-500 mt-1">Upload items to the gallery</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Batch Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="e.g., Annual Sports Day 2024"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">If uploading multiple files, numbers will be appended automatically (e.g., "Annual Sports Day 2024 - 1").</p>
                    </div>

                    {/* Media Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
                        <div className="flex gap-4">
                            <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${mediaType === 'image' ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    name="mediaType"
                                    value="image"
                                    checked={mediaType === 'image'}
                                    onChange={() => setMediaType('image')}
                                    className="hidden"
                                />
                                <div className="p-2 bg-white rounded-lg shadow-sm text-orange-500">
                                    <ImageIcon size={20} />
                                </div>
                                <span className="font-medium">Image</span>
                            </label>

                            <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${mediaType === 'video' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    name="mediaType"
                                    value="video"
                                    checked={mediaType === 'video'}
                                    onChange={() => setMediaType('video')}
                                    className="hidden"
                                />
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500">
                                    <FileVideo size={20} />
                                </div>
                                <span className="font-medium">Video</span>
                            </label>
                        </div>
                    </div>

                    {/* File Upload Area */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Files <span className="text-red-500">*</span></label>

                        <div className="relative group">
                            <div className="h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center bg-gray-50 transition-colors group-hover:bg-white group-hover:border-orange-400 cursor-pointer">
                                <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className={`w-6 h-6 ${mediaType === 'image' ? 'text-orange-500' : 'text-blue-500'}`} />
                                </div>
                                <p className="text-gray-900 font-medium text-sm">Click to upload files</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {mediaType === 'image' ? 'Supports multiple images' : 'Supports multiple videos'}
                                </p>
                            </div>
                            <input
                                type="file"
                                accept={mediaType === 'image' ? "image/*" : "video/*"}
                                onChange={handleFileChange}
                                multiple
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        {/* Previews Grid */}
                        {files.length > 0 && (
                            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors z-10 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={14} />
                                        </button>

                                        {mediaType === 'image' ? (
                                            <Image src={preview} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <video src={preview} className="w-full h-full object-cover" />
                                        )}

                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white truncate">
                                            {files[index].name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {files.length > 0 && (
                            <div className="mt-2 text-sm text-gray-500">
                                {files.length} file{files.length !== 1 ? 's' : ''} selected
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div>
                            {submitting && (
                                <div className="flex items-center gap-3 text-sm text-orange-600 font-medium">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Uploading... {uploadProgress}%</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href="/dashboard/admin/media"
                                className="px-6 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting || files.length === 0 || !title}
                                className={`px-8 py-2.5 rounded-xl font-medium text-white shadow-lg shadow-orange-500/20 transition-all
                                    ${submitting || files.length === 0 || !title
                                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:translate-y-[-1px] hover:shadow-orange-500/30'
                                    }`}
                            >
                                {submitting ? 'Uploading...' : 'Upload All'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

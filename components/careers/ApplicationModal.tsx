'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { apiUrl } from '@/lib/api-client';

interface ApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    career: {
        id: number;
        title: string;
        department: string;
    };
}

export default function ApplicationModal({ isOpen, onClose, career }: ApplicationModalProps) {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        linkedin_url: '',
        cover_letter: '',
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, resume: 'File size must not exceed 5MB' }));
                return;
            }

            // Validate file type
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
                setErrors(prev => ({ ...prev, resume: 'Only PDF, DOC, or DOCX files are allowed' }));
                return;
            }

            setResumeFile(file);
            setErrors(prev => ({ ...prev, resume: '' }));
        }
    };

    const removeFile = () => {
        setResumeFile(null);
        setErrors(prev => ({ ...prev, resume: '' }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s\-()]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }
        if (formData.linkedin_url && !/^https?:/.test(formData.linkedin_url)) {
            newErrors.linkedin_url = 'Please enter a valid URL (starting with http:// or https://)';
        }
        if (!resumeFile) {
            newErrors.resume = 'Resume is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);
        setError('');

        try {
            const data = new FormData();
            data.append('career', career.id.toString());
            data.append('full_name', formData.full_name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            if (formData.linkedin_url) data.append('linkedin_url', formData.linkedin_url);
            if (formData.cover_letter) data.append('cover_letter', formData.cover_letter);
            if (resumeFile) data.append('resume', resumeFile);

            const response = await fetch(apiUrl('/careers/applications/'), {
                method: 'POST',
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to submit application');
            }

            setSuccess(true);

            // Reset form after 2 seconds and close modal
            setTimeout(() => {
                handleClose();
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            full_name: '',
            email: '',
            phone: '',
            linkedin_url: '',
            cover_letter: '',
        });
        setResumeFile(null);
        setErrors({});
        setError('');
        setSuccess(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Apply for ${career.title}`} size="lg">
            {success ? (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h3>
                    <p className="text-slate-600">
                        Thank you for your interest. We'll review your application and get back to you soon.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                        <p className="text-sm text-blue-900 font-medium">
                            <strong className="text-base">Position:</strong> {career.title} ({career.department})
                        </p>
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${errors.full_name
                                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                : 'border-slate-300 focus:ring-orange-500 bg-white'
                                }`}
                            placeholder="John Doe"
                        />
                        {errors.full_name && (
                            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                <span>⚠</span> {errors.full_name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${errors.email
                                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                : 'border-slate-300 focus:ring-orange-500 bg-white'
                                }`}
                            placeholder="john.doe@example.com"
                        />
                        {errors.email && (
                            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                <span>⚠</span> {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${errors.phone
                                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                : 'border-slate-300 focus:ring-orange-500 bg-white'
                                }`}
                            placeholder="+1 (555) 123-4567"
                        />
                        {errors.phone && (
                            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                <span>⚠</span> {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* LinkedIn */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            LinkedIn Profile <span className="text-slate-400 text-xs">(Optional)</span>
                        </label>
                        <input
                            type="url"
                            name="linkedin_url"
                            value={formData.linkedin_url}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${errors.linkedin_url
                                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                : 'border-slate-300 focus:ring-orange-500 bg-white'
                                }`}
                            placeholder="https://linkedin.com/in/yourprofile"
                        />
                        {errors.linkedin_url && (
                            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                <span>⚠</span> {errors.linkedin_url}
                            </p>
                        )}
                    </div>

                    {/* Resume Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Resume <span className="text-red-500">*</span>
                        </label>
                        {!resumeFile ? (
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 hover:border-orange-300 transition-all cursor-pointer relative group">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="text-center pointer-events-none">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 mb-1">Click to upload resume</p>
                                    <p className="text-xs text-slate-500">PDF, DOC, or DOCX (max 5MB)</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
                                <div className="flex-1 truncate">
                                    <p className="text-sm font-semibold text-green-900">{resumeFile.name}</p>
                                    <p className="text-xs text-green-700 mt-1">
                                        {(resumeFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="p-2 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        {errors.resume && (
                            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                <span>⚠</span> {errors.resume}
                            </p>
                        )}
                    </div>

                    {/* Cover Letter */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Cover Letter <span className="text-slate-400 text-xs">(Optional)</span>
                        </label>
                        <textarea
                            name="cover_letter"
                            value={formData.cover_letter}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none bg-white transition-all"
                            placeholder="Tell us why you're a great fit for this position..."
                        />
                    </div>

                    {/* Submit Buttons - Enhanced with proper spacing */}
                    <div className="flex justify-end gap-3 pt-8 pb-4 mt-2">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}

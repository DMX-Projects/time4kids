'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import QRCode from '@/components/ui/QRCode';
import { useForm } from 'react-hook-form';
import { CheckCircle } from 'lucide-react';

interface AdmissionFormData {
    parentName: string;
    email: string;
    phone: string;
    childName: string;
    childAge: string;
    program: string;
    city: string;
    message?: string;
}

const AdmissionForm = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<AdmissionFormData>();

    const onSubmit = (data: AdmissionFormData) => {
        console.log('Form submitted:', data);
        setIsSubmitted(true);
        setShowQR(true);
        reset();

        // Reset success message after 5 seconds
        setTimeout(() => {
            setIsSubmitted(false);
        }, 5000);
    };

    const formUrl = typeof window !== 'undefined' ? window.location.href : 'https://timekids.com/admission';

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
            {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3 animate-slide-down">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <p className="text-green-800 font-medium">Thank you! We'll contact you soon.</p>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="mb-8">
                        <div className="inline-block bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 px-12 py-4 rounded-full shadow-lg border-2 border-amber-400">
                            <h3 className="font-display font-bold text-3xl text-gray-900 text-center">Admission Enquiry</h3>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Parent Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Parent/Guardian Name *
                                </label>
                                <input
                                    {...register('parentName', { required: 'Name is required' })}
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="Enter your name"
                                />
                                {errors.parentName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.parentName.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                    type="email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="your@email.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    {...register('phone', {
                                        required: 'Phone is required',
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: 'Enter valid 10-digit number'
                                        }
                                    })}
                                    type="tel"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="1234567890"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                                )}
                            </div>

                            {/* Child Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Child's Name *
                                </label>
                                <input
                                    {...register('childName', { required: 'Child name is required' })}
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="Enter child's name"
                                />
                                {errors.childName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.childName.message}</p>
                                )}
                            </div>

                            {/* Child Age */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Child's Age *
                                </label>
                                <select
                                    {...register('childAge', { required: 'Age is required' })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select age</option>
                                    <option value="1.5-2">1.5 - 2 years</option>
                                    <option value="2-2.5">2 - 2.5 years</option>
                                    <option value="2.5-3">2.5 - 3 years</option>
                                    <option value="3-3.5">3 - 3.5 years</option>
                                    <option value="3.5-4">3.5 - 4 years</option>
                                    <option value="4-4.5">4 - 4.5 years</option>
                                    <option value="4.5-5">4.5 - 5 years</option>
                                    <option value="5+">5+ years</option>
                                </select>
                                {errors.childAge && (
                                    <p className="text-red-500 text-sm mt-1">{errors.childAge.message}</p>
                                )}
                            </div>

                            {/* Program */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Program of Interest *
                                </label>
                                <select
                                    {...register('program', { required: 'Program is required' })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select program</option>
                                    <option value="playgroup">Play Group</option>
                                    <option value="nursery">Nursery</option>
                                    <option value="pp1">Pre-Primary 1 (PP-1)</option>
                                    <option value="pp2">Pre-Primary 2 (PP-2)</option>
                                    <option value="daycare">Day Care</option>
                                </select>
                                {errors.program && (
                                    <p className="text-red-500 text-sm mt-1">{errors.program.message}</p>
                                )}
                            </div>
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                City *
                            </label>
                            <input
                                {...register('city', { required: 'City is required' })}
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Enter your city"
                            />
                            {errors.city && (
                                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                            )}
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Additional Message (Optional)
                            </label>
                            <textarea
                                {...register('message')}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                                placeholder="Any specific questions or requirements..."
                            />
                        </div>

                        <Button type="submit" size="lg" className="w-full">
                            Submit Enquiry
                        </Button>
                    </form>
                </div>

                {/* QR Code Section */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 text-center">
                            <h4 className="font-display font-bold text-lg mb-4 text-gray-900">Quick Enquiry</h4>
                            <p className="text-sm text-gray-600 mb-6">Scan to fill the form on your mobile</p>
                            <div className="flex justify-center">
                                <QRCode value={formUrl} size={180} />
                            </div>
                            <p className="text-xs text-gray-500 mt-4">Or call us at<br /><strong className="text-primary-600">+91 123 456 7890</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionForm;

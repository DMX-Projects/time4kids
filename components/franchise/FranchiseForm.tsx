'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import QRCode from '@/components/ui/QRCode';
import { useForm } from 'react-hook-form';
import { CheckCircle } from 'lucide-react';

interface FranchiseFormData {
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    investment: string;
    experience: string;
    message?: string;
}

const FranchiseForm = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FranchiseFormData>();

    const onSubmit = (data: FranchiseFormData) => {
        console.log('Franchise form submitted:', data);
        setIsSubmitted(true);
        reset();

        setTimeout(() => {
            setIsSubmitted(false);
        }, 5000);
    };

    const formUrl = typeof window !== 'undefined' ? window.location.href : 'https://timekids.com/franchise';

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
            {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3 animate-slide-down">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <p className="text-green-800 font-medium">Thank you! Our franchise team will contact you soon.</p>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="font-display font-bold text-2xl mb-6 text-gray-900">Franchise Enquiry Form</h3>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                                <input
                                    {...register('name', { required: 'Name is required' })}
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Enter your name"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                                <input
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                                    })}
                                    type="email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="your@email.com"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                                <input
                                    {...register('phone', {
                                        required: 'Phone is required',
                                        pattern: { value: /^[0-9]{10}$/, message: 'Enter valid 10-digit number' }
                                    })}
                                    type="tel"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="1234567890"
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                                <input
                                    {...register('city', { required: 'City is required' })}
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Enter city"
                                />
                                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                                <input
                                    {...register('state', { required: 'State is required' })}
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Enter state"
                                />
                                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Investment Capacity *</label>
                                <select
                                    {...register('investment', { required: 'Investment capacity is required' })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Select range</option>
                                    <option value="10-20L">₹10-20 Lakhs</option>
                                    <option value="20-30L">₹20-30 Lakhs</option>
                                    <option value="30-50L">₹30-50 Lakhs</option>
                                    <option value="50L+">₹50 Lakhs+</option>
                                </select>
                                {errors.investment && <p className="text-red-500 text-sm mt-1">{errors.investment.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Business Experience</label>
                            <input
                                {...register('experience')}
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Years of experience in education or business"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Information</label>
                            <textarea
                                {...register('message')}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                placeholder="Tell us about your interest in T.I.M.E. Kids franchise..."
                            />
                        </div>

                        <Button type="submit" size="lg" className="w-full">Submit Franchise Enquiry</Button>
                    </form>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 text-center">
                        <h4 className="font-display font-bold text-lg mb-4">Quick Enquiry</h4>
                        <p className="text-sm text-gray-600 mb-6">Scan to fill on mobile</p>
                        <div className="flex justify-center">
                            <QRCode value={formUrl} size={180} />
                        </div>
                        <p className="text-xs text-gray-500 mt-4">Or call us at<br /><strong className="text-primary-600">+91 123 456 7890</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranchiseForm;

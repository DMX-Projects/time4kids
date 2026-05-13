'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { useForm } from 'react-hook-form';
import { CheckCircle } from 'lucide-react';
import { useSchoolData } from '@/components/dashboard/shared/SchoolDataProvider';
import { useToast } from '@/components/ui/Toast';

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

const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500';
const labelClass = 'mb-1.5 block text-xs font-semibold text-gray-700';

type FranchiseFormProps = {
    compact?: boolean;
    className?: string;
};

const FranchiseForm = ({ compact = false, className = '' }: FranchiseFormProps) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FranchiseFormData>();
    const { addEnquiry } = useSchoolData();
    const { showToast } = useToast();

    const onSubmit = async (data: FranchiseFormData) => {
        setSubmitError(null);
        try {
            await addEnquiry({
                type: 'franchise',
                name: data.name,
                email: data.email,
                phone: data.phone,
                city: data.city,
                message: `City: ${data.city}, State: ${data.state}, Investment: ${data.investment}, Experience: ${data.experience || 'n/a'}, Note: ${data.message || ''}`,
            });
            setIsSubmitted(true);
            reset();
            showToast("Franchise enquiry submitted successfully!");
            setTimeout(() => {
                setIsSubmitted(false);
            }, 5000);
        } catch (err: any) {
            setSubmitError(err?.message || 'Unable to submit your enquiry. Please try again.');
            showToast(err?.message || 'Submission failed. Please try again.', "error");
        }
    };

    const onInvalid = () => {
        showToast("Please fill all required fields correctly", "error");
    };

    const wrap = compact ? 'rounded-2xl border border-slate-200/90 bg-white p-5 shadow-lg md:p-6' : 'rounded-2xl bg-white p-8 shadow-xl';
    const titleClass = compact ? 'mb-4 text-lg font-bold text-gray-900' : 'mb-6 text-2xl font-bold text-gray-900';
    const gridGap = compact ? 'gap-3' : 'gap-6';
    const formSpace = compact ? 'space-y-4' : 'space-y-6';

    return (
        <div className={`${wrap} ${className}`.trim()}>
            {isSubmitted && (
                <div className="mb-4 flex items-center space-x-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm animate-slide-down">
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                    <p className="font-medium text-green-800">Thank you! Our franchise team will contact you soon.</p>
                </div>
            )}
            {submitError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {submitError}
                </div>
            )}

            <h3 className={`font-display ${titleClass}`}>Franchise Enquiry Form</h3>

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className={formSpace}>
                <div className={`grid md:grid-cols-2 ${gridGap}`}>
                    <div>
                        <label className={labelClass}>
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('name', { required: 'Name is required' })}
                            type="text"
                            className={inputClass}
                            placeholder="Enter your name"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className={labelClass}>
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('email', {
                                required: 'Email is required',
                                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                            })}
                            type="email"
                            className={inputClass}
                            placeholder="your@email.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className={labelClass}>
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('phone', {
                                required: 'Phone is required',
                                pattern: { value: /^[0-9]{10}$/, message: 'Enter valid 10-digit number' }
                            })}
                            type="tel"
                            className={inputClass}
                            placeholder="1234567890"
                        />
                        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <label className={labelClass}>
                            City <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('city', { required: 'City is required' })}
                            type="text"
                            className={inputClass}
                            placeholder="Enter city"
                        />
                        {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
                    </div>

                    <div>
                        <label className={labelClass}>
                            State <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('state', { required: 'State is required' })}
                            type="text"
                            className={inputClass}
                            placeholder="Enter state"
                        />
                        {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
                    </div>

                    <div>
                        <label className={labelClass}>
                            Investment Capacity <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('investment', { required: 'Investment capacity is required' })}
                            className={inputClass}
                        >
                            <option value="">Select range</option>
                            <option value="10-20L">₹10-20 Lakhs</option>
                            <option value="20-30L">₹20-30 Lakhs</option>
                            <option value="30-50L">₹30-50 Lakhs</option>
                            <option value="50L+">₹50 Lakhs+</option>
                        </select>
                        {errors.investment && <p className="mt-1 text-xs text-red-500">{errors.investment.message}</p>}
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Business Experience</label>
                    <input
                        {...register('experience')}
                        type="text"
                        className={inputClass}
                        placeholder="Years of experience in education or business"
                    />
                </div>

                <div>
                    <label className={labelClass}>Additional Information</label>
                    <textarea
                        {...register('message')}
                        rows={compact ? 3 : 4}
                        className={`${inputClass} resize-none`}
                        placeholder="Tell us about your interest in T.I.M.E. Kids franchise..."
                    />
                </div>

                <Button type="submit" size={compact ? 'md' : 'lg'} className="w-full">
                    Submit Franchise Enquiry
                </Button>
            </form>
        </div>
    );
};

export default FranchiseForm;

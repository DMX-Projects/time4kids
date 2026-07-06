'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useStateCity } from './../crm/useStateCity';

interface FormData {
    name: string;
    email: string;
    phone: string;
    state: string;
    city: string;
    acknowledge: boolean;
}

export default function CustomFranchiseEnquiryForm() {
    const { states, stateCity } = useStateCity();
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [availableCities, setAvailableCities] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormData>({ mode: 'onTouched', defaultValues: { acknowledge: false } });

    const selectedState = watch('state');
    const acknowledged = watch('acknowledge');

    useEffect(() => {
        if (selectedState && stateCity[selectedState]) {
            setAvailableCities(stateCity[selectedState]);
        } else {
            setAvailableCities([]);
        }
    }, [selectedState, stateCity]);

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValue('state', e.target.value, { shouldValidate: true });
        setValue('city', ''); // Reset city on state change
    };

    const onSubmit = async (data: FormData) => {
        const phone = data.phone?.trim().replace(/\D/g, '').slice(-10) ?? '';
        if (phone.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number.');
            return;
        }
        
        if (!data.acknowledge) return;

        setLoading(true);
        try {
            const res = await fetch('/api/enquiries/franchise-submit/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name?.trim(),
                    email: data.email?.trim(),
                    phone: phone,
                    state: data.state?.trim(),
                    city: data.city?.trim(),
                    message: '', // Sent as empty string since textarea was removed
                }),
            });

            if (res.ok) {
                toast.success('Thank you! Your enquiry has been submitted.');
                setIsSuccess(true);
            } else {
                toast.error('Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Failed to submit enquiry.');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 className="text-3xl font-bold text-[#003366]">Thank You!</h3>
                <p className="text-lg text-slate-600 max-w-md mx-auto">
                    Your franchise enquiry has been successfully submitted. Our team will review your details and get back to you shortly.
                </p>
                <button
                    onClick={() => {
                        reset();
                        setIsSuccess(false);
                    }}
                    className="mt-6 bg-[#E67E22] hover:bg-[#d6711c] text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Submit Another Enquiry
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="text-2xl font-bold text-[#003366] mb-6">Franchise Enquiry</h3>
            
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                    type="text"
                    id="name"
                    {...register('name', { required: 'Full name is required', minLength: { value: 3, message: 'Name must be at least 3 characters' } })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none transition-all"
                    placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                    <input
                        type="email"
                        id="email"
                        {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Please enter a valid email address' } })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none transition-all"
                        placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                    <input
                        type="tel"
                        id="phone"
                        inputMode="numeric"
                        maxLength={10}
                        {...register('phone', { required: 'Mobile number is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Please enter a valid 10-digit mobile number' } })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none transition-all"
                        placeholder="10-digit number"
                        onInput={(e) => {
                            const el = e.target as HTMLInputElement;
                            el.value = el.value.replace(/\D/g, '').slice(0, 10);
                        }}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                    <select
                        id="state"
                        {...register('state', { required: 'State is required' })}
                        onChange={handleStateChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none transition-all bg-white"
                    >
                        <option value="" disabled>Select a state</option>
                        {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                </div>

                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                    {availableCities.length > 0 ? (
                        <select
                            id="city"
                            {...register('city', { required: 'City is required' })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none transition-all bg-white"
                        >
                            <option value="" disabled>Select a city</option>
                            {availableCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            id="city"
                            {...register('city', { required: 'City is required' })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none transition-all"
                            placeholder={selectedState ? "Enter your city" : "Select a state first"}
                            disabled={!selectedState}
                        />
                    )}
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
            </div>

            <div className="flex items-start gap-3 mt-4">
                <input
                    type="checkbox"
                    id="acknowledge"
                    {...register('acknowledge', { required: 'You must acknowledge the terms to proceed' })}
                    className="mt-1 w-4 h-4 text-[#E67E22] border-slate-300 rounded focus:ring-[#E67E22] cursor-pointer"
                />
                <label htmlFor="acknowledge" className="text-xs md:text-sm text-slate-600 leading-relaxed cursor-pointer select-none">
                    By ticking on the box, I acknowledge I need a minimum investment of 10-15 lacs* for the preschool. I have read, understood & accepted TKPL privacy policy and the terms & conditions.
                </label>
            </div>
            {errors.acknowledge && <p className="text-red-500 text-xs mt-1">{errors.acknowledge.message}</p>}

            <button
                type="submit"
                disabled={loading || !acknowledged}
                className="w-full bg-[#E67E22] hover:bg-[#d6711c] text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
                {loading ? 'Submitting...' : 'Submit Enquiry'}
            </button>
        </form>
    );
}

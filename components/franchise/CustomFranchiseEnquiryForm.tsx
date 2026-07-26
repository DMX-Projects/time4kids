'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useStateCity } from './../crm/useStateCity';

interface FormData {
    name: string;
    email: string;
    phone: string;
    otp: string;
    state: string;
    city: string;
    acknowledge: boolean;
}

const inputClass =
    'w-full h-11 px-4 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none transition-all bg-white';

function formatCountdown(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CustomFranchiseEnquiryForm() {
    const { states, stateCity } = useStateCity();
    const [loading, setLoading] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpSentForPhone, setOtpSentForPhone] = useState('');
    const [otpCooldown, setOtpCooldown] = useState(0);
    const [otpVerified, setOtpVerified] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [availableCities, setAvailableCities] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        mode: 'onTouched',
        defaultValues: {
            acknowledge: false,
            otp: '',
            name: '',
            email: '',
            phone: '',
            state: '',
            city: '',
        },
    });

    const selectedState = watch('state');
    const acknowledged = watch('acknowledge');
    const phoneValue = watch('phone') || '';
    const otpValue = (watch('otp') || '').trim();
    const normalizedPhone = phoneValue.replace(/\D/g, '').slice(-10);
    const phoneReady = /^[6-9]\d{9}$/.test(normalizedPhone);

    useEffect(() => {
        if (selectedState && stateCity[selectedState]) {
            setAvailableCities(stateCity[selectedState]);
        } else {
            setAvailableCities([]);
        }
    }, [selectedState, stateCity]);

    useEffect(() => {
        if (otpSentForPhone && otpSentForPhone !== normalizedPhone) {
            setOtpSentForPhone('');
            setOtpVerified(false);
            setValue('otp', '');
        }
    }, [normalizedPhone, otpSentForPhone, setValue]);

    useEffect(() => {
        if (otpCooldown <= 0) return;
        const t = window.setTimeout(() => setOtpCooldown((s) => s - 1), 1000);
        return () => window.clearTimeout(t);
    }, [otpCooldown]);

    useEffect(() => {
        // Mark verified when user has entered a full 4-digit OTP after send
        if (otpSentForPhone && /^\d{4}$/.test(otpValue)) {
            setOtpVerified(true);
        } else if (!/^\d{4}$/.test(otpValue)) {
            setOtpVerified(false);
        }
    }, [otpValue, otpSentForPhone]);

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValue('state', e.target.value, { shouldValidate: true });
        setValue('city', '');
    };

    const handleSendOtp = async () => {
        if (!phoneReady) {
            toast.error('Enter a valid 10-digit mobile number first.');
            return;
        }
        if (sendingOtp || otpCooldown > 0) return;

        setSendingOtp(true);
        setOtpVerified(false);
        try {
            const res = await fetch('/api/enquiries/send-otp/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: normalizedPhone }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.success === false) {
                toast.error(data.detail || data.error || 'Failed to send OTP. Please try again.');
                return;
            }
            setOtpSentForPhone(normalizedPhone);
            setOtpCooldown(30);
            setValue('otp', '');
            toast.success(data.detail || 'OTP sent to your mobile.');
        } catch (error) {
            console.error('Send OTP failed:', error);
            toast.error('Failed to send OTP. Please try again.');
        } finally {
            setSendingOtp(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        const phone = data.phone?.trim().replace(/\D/g, '').slice(-10) ?? '';
        if (phone.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number.');
            return;
        }
        if (!otpSentForPhone || otpSentForPhone !== phone) {
            toast.error('Please send and enter the OTP for this mobile number.');
            return;
        }
        const otp = (data.otp || '').trim();
        if (!/^\d{4}$/.test(otp)) {
            toast.error('Please enter the 4-digit OTP sent to your mobile.');
            return;
        }
        if (!data.acknowledge) return;

        setLoading(true);
        try {
            const res = await fetch('/api/enquiries/franchise-submit/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name?.trim(),
                    email: data.email?.trim(),
                    phone: phone,
                    otp: otp,
                    state: data.state?.trim(),
                    city: data.city?.trim(),
                    message: '',
                }),
            });

            const body = await res.json().catch(() => ({}));
            if (res.ok) {
                toast.success('Thank you! Your enquiry has been submitted.');
                setIsSuccess(true);
                setOtpSentForPhone('');
                setOtpVerified(false);
            } else {
                toast.error(
                    body.error || body.detail || body.message || 'Something went wrong. Please try again.',
                );
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
                    type="button"
                    onClick={() => {
                        reset({ acknowledge: false, otp: '', name: '', email: '', phone: '', state: '', city: '' });
                        setOtpSentForPhone('');
                        setOtpVerified(false);
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
                    className={inputClass}
                    placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                    type="email"
                    id="email"
                    {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Please enter a valid email address' } })}
                    className={inputClass}
                    placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <div className="flex overflow-hidden rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-[#E67E22] focus-within:border-[#E67E22]">
                    <input
                        type="tel"
                        id="phone"
                        inputMode="numeric"
                        maxLength={10}
                        {...register('phone', { required: 'Mobile number is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Please enter a valid 10-digit mobile number' } })}
                        className="h-11 min-w-0 flex-1 border-0 px-4 text-sm outline-none"
                        placeholder="Enter Mobile Number"
                        onInput={(e) => {
                            const el = e.target as HTMLInputElement;
                            el.value = el.value.replace(/\D/g, '').slice(0, 10);
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!phoneReady || sendingOtp || otpCooldown > 0}
                        className="h-11 shrink-0 border-l border-slate-300 bg-[#003366] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#00264d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {sendingOtp ? 'Sending…' : otpSentForPhone && otpCooldown > 0 ? 'Sent' : otpSentForPhone ? 'Resend OTP' : 'Send OTP'}
                    </button>
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
                <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-1">OTP *</label>
                <input
                    type="text"
                    id="otp"
                    inputMode="numeric"
                    maxLength={4}
                    autoComplete="one-time-code"
                    {...register('otp', {
                        required: 'OTP is required',
                        pattern: { value: /^\d{4}$/, message: 'Enter the 4-digit OTP' },
                    })}
                    className={inputClass}
                    placeholder="Enter 4-digit OTP"
                    onInput={(e) => {
                        const el = e.target as HTMLInputElement;
                        el.value = el.value.replace(/\D/g, '').slice(0, 4);
                    }}
                />
                {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>}
                {otpVerified && (
                    <p className="mt-2 text-sm font-medium text-green-600">✓ Mobile Number Verified</p>
                )}
                {otpSentForPhone && otpCooldown > 0 && (
                    <p className="mt-1 text-xs text-slate-500">Resend OTP in {formatCountdown(otpCooldown)}</p>
                )}
                {otpSentForPhone && otpCooldown <= 0 && !otpVerified && (
                    <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="mt-1 text-xs font-semibold text-[#003366] underline-offset-2 hover:underline"
                    >
                        Resend OTP
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                    <select
                        id="state"
                        {...register('state', { required: 'State is required' })}
                        onChange={handleStateChange}
                        className={inputClass}
                    >
                        <option value="">Select a state</option>
                        {states.map((state) => (
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
                            className={inputClass}
                        >
                            <option value="">Select a city</option>
                            {availableCities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            id="city"
                            {...register('city', { required: 'City is required' })}
                            className={inputClass}
                            placeholder={selectedState ? 'Enter your city' : 'Select a state first'}
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

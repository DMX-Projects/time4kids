'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useStateCity } from './../crm/useStateCity';

export default function CustomFranchiseEnquiryForm() {
    const { states, stateCity } = useStateCity();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        state: '',
        city: '',
    });
    const [acknowledged, setAcknowledged] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [availableCities, setAvailableCities] = useState<string[]>([]);

    useEffect(() => {
        if (formData.state && stateCity[formData.state]) {
            setAvailableCities(stateCity[formData.state]);
            // If the current city is not in the new state's cities, reset it
            if (!stateCity[formData.state].includes(formData.city)) {
                setFormData(prev => ({ ...prev, city: '' }));
            }
        } else {
            setAvailableCities([]);
        }
    }, [formData.state, stateCity]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        let value = e.target.value;
        if (e.target.name === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }
        setFormData(prev => ({
            ...prev,
            [e.target.name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/enquiries/franchise-submit/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    state: formData.state,
                    city: formData.city,
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
                        setFormData({ name: '', email: '', phone: '', state: '', city: '' });
                        setAcknowledged(false);
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-2xl font-bold text-[#003366] mb-6">Franchise Enquiry</h3>
            
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none transition-all"
                    placeholder="Enter your full name"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none transition-all"
                        placeholder="your@email.com"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        pattern="[0-9]{10}"
                        maxLength={10}
                        title="Please enter a valid 10-digit phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none transition-all"
                        placeholder="10-digit number"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                    <select
                        id="state"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none transition-all bg-white"
                    >
                        <option value="" disabled>Select a state</option>
                        {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                    {availableCities.length > 0 ? (
                        <select
                            id="city"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
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
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none transition-all"
                            placeholder={formData.state ? "Enter your city" : "Select a state first"}
                            disabled={!formData.state}
                        />
                    )}
                </div>
            </div>

            <div className="flex items-start gap-3 mt-4">
                <input
                    type="checkbox"
                    id="acknowledge"
                    required
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#E67E22] border-slate-300 rounded focus:ring-[#E67E22] cursor-pointer"
                />
                <label htmlFor="acknowledge" className="text-xs md:text-sm text-slate-600 leading-relaxed cursor-pointer select-none">
                    By ticking on the box, I acknowledge I need a minimum investment of 10-15 lacs* for the preschool. I have read, understood & accepted TKPL privacy policy and the terms & conditions.
                </label>
            </div>

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

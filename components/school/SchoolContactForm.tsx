"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSchoolData } from '@/components/dashboard/shared/SchoolDataProvider';
import { useToast } from '@/components/ui/Toast';

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

interface SchoolContactFormProps {
    franchiseSlug?: string;
    city?: string;
}

const SchoolContactForm = ({ franchiseSlug, city }: SchoolContactFormProps) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>();
    const { addEnquiry } = useSchoolData();
    const { showToast } = useToast();

    const onSubmit = async (data: ContactFormData) => {
        setSubmitError(null);
        try {
            await addEnquiry({
                type: 'contact',
                name: data.name,
                email: data.email,
                phone: data.phone,
                city: city || "",
                message: data.message,
                // @ts-ignore - passing extra field that is handled by the provider
                franchiseSlug: franchiseSlug
            });
            setIsSubmitted(true);
            reset();
            showToast("Your message has been sent to the school!");
            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (err: any) {
            setSubmitError(err?.message || 'Unable to send your message. Please try again.');
            showToast(err?.message || 'Message failed to send.', "error");
        }
    };

    return (
        <div className="bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/50 relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100/50 rounded-full blur-2xl -z-10"></div>

            <h3 className="text-2xl font-fredoka font-bold text-gray-900 mb-8 border-b border-orange-100 pb-4">
                Send us a Message
            </h3>

            {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center space-x-3 animate-slide-down">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <p className="text-green-800 font-medium font-fredoka">Thank you! We'll get back to you soon.</p>
                </div>
            )}

            {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium font-fredoka">
                    {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 font-fredoka uppercase tracking-wider opacity-70">
                        Full Name
                    </label>
                    <input
                        {...register('name', { required: 'Name is required' })}
                        type="text"
                        className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium"
                        placeholder="John Doe"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-xs mt-2 font-bold ml-2 italic">{errors.name.message}</p>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 font-fredoka uppercase tracking-wider opacity-70">
                            Email
                        </label>
                        <input
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email'
                                }
                            })}
                            type="email"
                            className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium"
                            placeholder="john@example.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-2 font-bold ml-2 italic">{errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 font-fredoka uppercase tracking-wider opacity-70">
                            Phone
                        </label>
                        <input
                            {...register('phone', {
                                required: 'Phone is required',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: '10 digits please'
                                }
                            })}
                            type="tel"
                            className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium"
                            placeholder="9876543210"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-2 font-bold ml-2 italic">{errors.phone.message}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 font-fredoka uppercase tracking-wider opacity-70">
                        Message
                    </label>
                    <textarea
                        {...register('message', { required: 'Message is required' })}
                        rows={4}
                        className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium resize-none"
                        placeholder="How can we help you?"
                    />
                    {errors.message && (
                        <p className="text-red-500 text-xs mt-2 font-bold ml-2 italic">{errors.message.message}</p>
                    )}
                </div>

                <Button type="submit" size="lg" className="w-full py-5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                </Button>
            </form>
        </div>
    );
};

export default SchoolContactForm;

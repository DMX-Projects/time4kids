'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchoolData } from '@/components/dashboard/shared/SchoolDataProvider';
import { useToast } from '@/components/ui/Toast';
import { trackLeadSubmission } from '@/lib/tracking';
import { apiUrl } from '@/lib/api-client';

interface AdmissionFormData {
    parentName: string;
    email: string;
    phone: string;
    childName: string;
    childAge: string;
    program: string;
    city: string;
    center: string;
    message?: string;
}

interface AdmissionFormProps {
    franchiseSlug?: string;
    defaultCity?: string;
    contactPhone?: string;
}

interface Center {
    id: number;
    name: string;
    slug: string;
    city: string;
}

const AdmissionForm = ({ franchiseSlug, defaultCity }: AdmissionFormProps) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [centers, setCenters] = useState<Center[]>([]);
    const [loadingCenters, setLoadingCenters] = useState(false);
    
    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<AdmissionFormData>({
        defaultValues: {
            city: defaultCity || ''
        }
    });
    
    const selectedCity = watch('city');
    const { addEnquiry, locations } = useSchoolData();
    const { showToast } = useToast();

    // Fetch centers when city changes
    useEffect(() => {
        if (!selectedCity) {
            setCenters([]);
            return;
        }

        const fetchCenters = async () => {
            setLoadingCenters(true);
            try {
                const res = await fetch(`${apiUrl('/franchises/public/list/')}?city=${encodeURIComponent(selectedCity)}`);
                if (res.ok) {
                    const data = await res.json();
                    setCenters(Array.isArray(data) ? data : data.results || []);
                }
            } catch (err) {
                console.error("Failed to fetch centers:", err);
            } finally {
                setLoadingCenters(false);
            }
        };

        void fetchCenters();
    }, [selectedCity]);

    const onSubmit = async (data: AdmissionFormData) => {
        setSubmitError(null);
        // Determine which slug to use: prop or selected from dropdown
        const activeSlug = franchiseSlug || data.center;
        
        try {
            await addEnquiry({
                type: 'admission',
                name: data.parentName,
                email: data.email,
                phone: data.phone,
                city: data.city,
                childAge: data.childAge,
                message: `Child: ${data.childName}, Age: ${data.childAge}, Program: ${data.program}, City: ${data.city}${data.message ? ' | Note: ' + data.message : ''}`,
                franchiseSlug: activeSlug,
            });
            setIsSubmitted(true);
            reset();
            trackLeadSubmission({
                formType: "admission",
                location: window.location.href,
                franchiseSlug: activeSlug,
            });
            showToast("Admission enquiry submitted successfully!");
            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (err: any) {
            setSubmitError(err?.message || 'Unable to submit your enquiry. Please try again.');
            showToast(err?.message || 'Unable to submit your enquiry. Please try again.', "error");
        }
    };

    return (
        <div className="relative">
            <div className="relative">

                {/* Main Form Area */}
                <div className="p-2 md:p-4">
                    <h3 className="mb-7 font-display text-3xl font-black leading-tight text-[#253247] md:text-4xl">
                        Admission Enquiry
                    </h3>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-6">
                            {[
                                { name: 'parentName', label: 'Parent/Guardian Name', placeholder: 'Enter your name' },
                                { name: 'email', label: 'Email Address', placeholder: 'your@email.com' },
                                { name: 'phone', label: 'Phone Number', placeholder: '10-digit mobile number' },
                                { name: 'childName', label: "Child's Name", placeholder: "Enter child's name" }
                            ].map((field) => (
                                <div key={field.name} className="space-y-2">
                                    <label className="text-lg font-fredoka font-semibold text-[#2D2D52] pl-1">
                                        {field.label} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register(field.name as any, { required: true })}
                                        className="w-full px-6 py-4 bg-[#FFFCF5] border-2 border-[#FFEBB7] rounded-2xl focus:ring-4 focus:ring-yellow-100 focus:border-[#FFD95A] outline-none transition-all placeholder:text-gray-400 font-medium text-[#2D2D52]"
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            ))}

                            <div className="space-y-2">
                                <label className="text-lg font-fredoka font-semibold text-[#2D2D52] pl-1">
                                    Your City <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('city', { required: true })}
                                    className="w-full px-6 py-4 bg-[#FFFCF5] border-2 border-[#FFEBB7] rounded-2xl appearance-none font-medium text-[#2D2D52] focus:ring-4 focus:ring-yellow-100 outline-none"
                                >
                                    <option value="">Select your city</option>
                                    {locations.map((loc) => (
                                        <option key={loc.city_name} value={loc.city_name}>{loc.city_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-fredoka font-semibold text-[#2D2D52] pl-1 flex items-center justify-between">
                                    <span>Nearest Center <span className="text-red-500">*</span></span>
                                    {loadingCenters && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
                                </label>
                                <select
                                    {...register('center', { required: !franchiseSlug })}
                                    disabled={!selectedCity || franchiseSlug !== undefined}
                                    className="w-full px-6 py-4 bg-[#FFFCF5] border-2 border-[#FFEBB7] rounded-2xl appearance-none font-medium text-[#2D2D52] focus:ring-4 focus:ring-yellow-100 outline-none disabled:opacity-50"
                                >
                                    {franchiseSlug ? (
                                        <option value={franchiseSlug}>Selected Center</option>
                                    ) : (
                                        <>
                                            <option value="">{selectedCity ? 'Select a center' : 'Select city first'}</option>
                                            {centers.map((c) => (
                                                <option key={c.id} value={c.slug}>{c.name}</option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-fredoka font-semibold text-[#2D2D52] pl-1">
                                    Child&apos;s Age <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('childAge', { required: true })}
                                    className="w-full px-6 py-4 bg-[#FFFCF5] border-2 border-[#FFEBB7] rounded-2xl appearance-none font-medium text-[#2D2D52] focus:ring-4 focus:ring-yellow-100 outline-none"
                                >
                                    <option value="">Select age</option>
                                    <option value="2">2+ Years</option>
                                    <option value="3">3+ Years</option>
                                    <option value="4">4+ Years</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-fredoka font-semibold text-[#2D2D52] pl-1">
                                    Program of Interest <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('program', { required: true })}
                                    className="w-full px-6 py-4 bg-[#FFFCF5] border-2 border-[#FFEBB7] rounded-2xl appearance-none font-medium text-[#2D2D52] focus:ring-4 focus:ring-yellow-100 outline-none"
                                >
                                    <option value="">Select program</option>
                                    <option value="playgroup">Playgroup</option>
                                    <option value="nursery">Nursery</option>
                                    <option value="pp1">PP1</option>
                                    <option value="pp2">PP2</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-lg font-fredoka font-semibold text-[#2D2D52] pl-1">
                                Additional Message (Optional)
                            </label>
                            <textarea
                                {...register('message')}
                                rows={3}
                                className="w-full px-6 py-4 bg-[#FFFCF5] border-2 border-[#FFEBB7] rounded-2xl focus:ring-4 focus:ring-yellow-100 focus:border-[#FFD95A] outline-none transition-all resize-none font-medium text-[#2D2D52] placeholder:text-gray-400"
                                placeholder="Any specific questions or requirements..."
                            />
                        </div>

                        <div className="flex justify-center md:justify-start pt-6">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                className="bg-[#FF7A2F] text-white px-16 py-5 rounded-2xl font-fredoka font-bold text-2xl shadow-[0_8px_0_#D35400] border-2 border-white transition-all"
                            >
                                Submit Enquiry
                            </motion.button>
                        </div>
                    </form>
                </div>
            </div>

            <AnimatePresence>
                {isSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white border-4 border-green-400 rounded-full px-10 py-5 shadow-2xl z-[100] flex items-center gap-4"
                    >
                        <CheckCircle className="text-green-500 w-8 h-8" />
                        <span className="font-fredoka font-bold text-xl text-[#2D2D52]">Thank you! We&apos;ll contact you soon. ✨</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdmissionForm;

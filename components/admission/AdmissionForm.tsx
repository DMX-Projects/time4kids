'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchoolData } from '@/components/dashboard/shared/SchoolDataProvider';
import { useToast } from '@/components/ui/Toast';
import { trackLeadSubmission } from '@/lib/tracking';
import { fetchCentersByCity, fetchCities, type CentreOption } from '@/lib/api/franchise-lookup';

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

const AdmissionForm = ({ franchiseSlug, defaultCity }: AdmissionFormProps) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [cities, setCities] = useState<string[]>([]);
    const [loadingCities, setLoadingCities] = useState(true);
    const [citiesError, setCitiesError] = useState<string | null>(null);
    const [centers, setCenters] = useState<CentreOption[]>([]);
    const [loadingCenters, setLoadingCenters] = useState(false);
    const [centersError, setCentersError] = useState<string | null>(null);
    
    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<AdmissionFormData>({
        defaultValues: {
            city: defaultCity || ''
        }
    });
    
    const selectedCity = watch('city');
    const { addEnquiry } = useSchoolData();
    const { showToast } = useToast();

    useEffect(() => {
        let cancelled = false;
        const loadCities = async () => {
            setLoadingCities(true);
            setCitiesError(null);
            try {
                const rows = await fetchCities();
                if (cancelled) return;
                setCities(rows.map((r) => r.name).filter(Boolean));
            } catch (err: unknown) {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "Could not load cities.";
                setCitiesError(message);
                setCities([]);
            } finally {
                if (!cancelled) setLoadingCities(false);
            }
        };
        void loadCities();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        setValue('center', '');
        if (!selectedCity) {
            setCenters([]);
            setCentersError(null);
            return;
        }

        let cancelled = false;
        const loadCenters = async () => {
            setLoadingCenters(true);
            setCentersError(null);
            try {
                const rows = await fetchCentersByCity(selectedCity);
                if (cancelled) return;
                setCenters(rows);
            } catch (err: unknown) {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "Could not load centers.";
                setCentersError(message);
                setCenters([]);
            } finally {
                if (!cancelled) setLoadingCenters(false);
            }
        };

        void loadCenters();
        return () => {
            cancelled = true;
        };
    }, [selectedCity, setValue]);

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

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                                <label className="text-lg font-fredoka font-semibold text-[#2D2D52] pl-1 flex items-center justify-between">
                                    <span>
                                        Your City <span className="text-red-500">*</span>
                                    </span>
                                    {loadingCities && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
                                </label>
                                <select
                                    {...register('city', { required: true })}
                                    disabled={loadingCities}
                                    className="w-full px-6 py-4 bg-[#FFFCF5] border-2 border-[#FFEBB7] rounded-2xl appearance-none font-medium text-[#2D2D52] focus:ring-4 focus:ring-yellow-100 outline-none disabled:opacity-50"
                                >
                                    <option value="">
                                        {loadingCities ? 'Loading cities...' : 'Select your city'}
                                    </option>
                                    {cities.map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                                {citiesError && (
                                    <p className="text-xs text-red-600" role="alert">
                                        {citiesError}
                                    </p>
                                )}
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
                                {centersError && (
                                    <p className="text-xs text-red-600" role="alert">
                                        {centersError}
                                    </p>
                                )}
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

                        <div className="flex flex-col gap-3 md:grid md:grid-cols-12 md:items-start md:gap-x-6 md:gap-y-4">
                            <div className="flex flex-col gap-3 md:col-span-8">
                                <div className="space-y-2">
                                    <label className="text-lg font-fredoka font-semibold text-[#2D2D52] pl-1">
                                        Additional Message (Optional)
                                    </label>
                                    <textarea
                                        {...register('message')}
                                        rows={3}
                                        className="w-full resize-none px-6 py-4 bg-[#FFFCF5] border-2 border-[#FFEBB7] rounded-2xl focus:ring-4 focus:ring-yellow-100 focus:border-[#FFD95A] outline-none transition-all font-medium text-[#2D2D52] placeholder:text-gray-400"
                                        placeholder="Any specific questions or requirements..."
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-2 pt-1 md:items-start">
                                    {submitError && (
                                        <p className="text-sm text-red-600" role="alert">
                                            {submitError}
                                        </p>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.03, y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        type="submit"
                                        disabled={loadingCities}
                                        className="bg-[#FF7A2F] text-white px-8 py-2.5 rounded-xl font-fredoka font-bold text-base md:text-lg shadow-[0_5px_0_#D35400] border border-white/90 transition-all whitespace-nowrap disabled:opacity-60"
                                    >
                                        Submit Enquiry
                                    </motion.button>
                                </div>
                            </div>
                            <div className="relative aspect-[10/13] w-full overflow-visible border-0 bg-transparent ring-0 outline-none md:col-span-4 md:aspect-[4/5] md:-mt-28 max-md:mx-auto max-md:-mt-1 max-md:max-w-sm">
                                <Image
                                    src="/student-welcome.png"
                                    alt="Welcome to T.I.M.E. Kids"
                                    fill
                                    sizes="(max-width: 768px) 90vw, 400px"
                                    className="object-contain object-center"
                                />
                            </div>
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

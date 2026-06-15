'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";
import { useForm } from 'react-hook-form';
import { CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchoolData } from '@/components/dashboard/shared/SchoolDataProvider';
import { useToast } from '@/components/ui/Toast';
import { trackLeadSubmission } from '@/lib/tracking';
import { apiUrl, jsonHeaders, nextImageSrc } from '@/lib/api-client';
import { DEFAULT_ADMISSION_PAGE_DATA, mergeAdmissionPageData } from '@/config/admission-page-defaults';
import { fetchCentersByCity, fetchCities, type CentreOption } from '@/lib/api/franchise-lookup';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const ALREADY_REGISTERED_MSG = 'This email is already registered.';

async function assertEmailNotRegistered(email: string): Promise<void> {
    const res = await fetch(apiUrl('/auth/check-parent-email/'), {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ email }),
    });
    const data = (await res.json().catch(() => ({}))) as {
        registered?: boolean;
        detail?: string;
    };
    if (data.registered) {
        throw new Error(
            typeof data.detail === 'string' && data.detail.trim()
                ? data.detail
                : ALREADY_REGISTERED_MSG,
        );
    }
}

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
    /** Rainbow welcome illustration — from admission CMS (`form_welcome_image`). */
    welcomeImage?: string;
    /** `register` — parent sign-up from login; submits enquiry + creates account. */
    variant?: 'enquiry' | 'register';
    /** When the page supplies the main heading (e.g. register page). */
    hideHeading?: boolean;
}

const CHILD_AGE_OPTIONS = [
    '2 to 3 years',
    '3 to 4 years',
    '4 to 5 years',
    '5 to 6 years',
    '6 to 7 years',
    '7 to 8 years',
    '8 years and above',
] as const;

const PROGRAM_OPTIONS = [
    'Play group',
    'Nursery',
    'PP-1 / Junior KG / LKG',
    'PP-2 / Senior KG / UKG',
    'Summer Camp',
    'Refresher Course (Level-1)',
    'Refresher Course (Level-2)',
] as const;

const AdmissionForm = ({
    franchiseSlug,
    defaultCity,
    variant = 'enquiry',
    hideHeading = false,
    welcomeImage: welcomeImageProp,
}: AdmissionFormProps) => {
    const isRegister = variant === 'register';
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [resetUrl, setResetUrl] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [cities, setCities] = useState<string[]>([]);
    const [loadingCities, setLoadingCities] = useState(true);
    const [citiesError, setCitiesError] = useState<string | null>(null);
    const [centers, setCenters] = useState<CentreOption[]>([]);
    const [loadingCenters, setLoadingCenters] = useState(false);
    const [centersError, setCentersError] = useState<string | null>(null);
    const [welcomeImage, setWelcomeImage] = useState(
        welcomeImageProp?.trim() || DEFAULT_ADMISSION_PAGE_DATA.form_welcome_image || '/student-welcome.png',
    );
    
    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<AdmissionFormData>({
        defaultValues: {
            city: defaultCity || ''
        }
    });
    
    const selectedCity = watch('city');
    const { addEnquiry } = useSchoolData();
    const { showToast } = useToast();

    useEffect(() => {
        if (welcomeImageProp?.trim()) {
            setWelcomeImage(welcomeImageProp.trim());
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(apiUrl('/common/page-content/admission/'));
                if (!res.ok) return;
                const json = await res.json();
                if (cancelled) return;
                const merged = mergeAdmissionPageData(json);
                const img = (merged.form_welcome_image || '').trim();
                if (img) setWelcomeImage(img);
            } catch {
                /* keep default */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [welcomeImageProp]);

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
        setResetUrl(null);
        const activeSlug = franchiseSlug || data.center;
        const trimmedEmail = data.email.trim().toLowerCase();
        const normalizedPhone = data.phone.replace(/\D/g, '').slice(0, 10);

        if (!EMAIL_REGEX.test(trimmedEmail)) {
            setSubmitError('Please enter a valid email address.');
            return;
        }
        if (!PHONE_REGEX.test(normalizedPhone)) {
            setSubmitError('Phone number must be 10 digits and start with 6, 7, 8, or 9.');
            return;
        }

        setSubmitting(true);
        let accountResetUrl: string | null = null;
        try {
            try {
                await assertEmailNotRegistered(trimmedEmail);
            } catch (regErr: unknown) {
                const message =
                    regErr instanceof Error ? regErr.message : ALREADY_REGISTERED_MSG;
                setSubmitError(message);
                showToast(message, 'error');
                return;
            }

            if (isRegister) {
                const regRes = await fetch(apiUrl('/auth/register/'), {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        full_name: data.parentName.trim(),
                        email: trimmedEmail,
                        phone: normalizedPhone,
                        child_name: data.childName.trim(),
                        child_age: data.childAge,
                        program: data.program,
                        city: data.city,
                        franchise_slug: activeSlug,
                        message: data.message?.trim() || '',
                    }),
                });
                const regData = (await regRes.json().catch(() => ({}))) as {
                    detail?: string;
                    reset_url?: string;
                };
                if (!regRes.ok) {
                    const msg =
                        typeof regData?.detail === 'string'
                            ? regData.detail
                            : 'Registration failed. If you already have an account, sign in or use Forgot password.';
                    setSubmitError(msg);
                    showToast(msg, 'error');
                    return;
                }
                accountResetUrl =
                    typeof regData?.reset_url === 'string' ? regData.reset_url : null;
                setResetUrl(accountResetUrl);
            } else {
                await addEnquiry({
                    type: 'admission',
                    name: data.parentName.trim(),
                    email: trimmedEmail,
                    phone: normalizedPhone,
                    city: data.city,
                    childAge: data.childAge,
                    message: `Child: ${data.childName}, Age: ${data.childAge}, Program: ${data.program}, City: ${data.city}${data.message ? ' | Note: ' + data.message : ''}`,
                    franchiseSlug: activeSlug,
                });
            }

            setIsSubmitted(true);
            reset();
            trackLeadSubmission({
                formType: isRegister ? 'parent_register' : 'admission',
                location: window.location.href,
                franchiseSlug: activeSlug,
            });
            if (isRegister) {
                showToast(
                    accountResetUrl
                        ? 'Registration successful. Check your email to set your password.'
                        : 'Registration submitted successfully.',
                    'success',
                );
            } else {
                showToast('Admission enquiry submitted successfully!');
            }
            setTimeout(
                () => setIsSubmitted(false),
                isRegister && accountResetUrl ? 30000 : 5000,
            );
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Unable to submit. Please try again.';
            setSubmitError(message);
            showToast(message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative">
            <div className="relative">

                {/* Main Form Area */}
                <div className="p-2 md:p-4">
                    {!hideHeading && (
                        <h3 className="mb-7 font-display text-3xl font-black leading-tight text-[#253247] md:text-4xl">
                            Admission Enquiry
                        </h3>
                    )}

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
                                    {CHILD_AGE_OPTIONS.map((age) => (
                                        <option key={age} value={age}>
                                            {age}
                                        </option>
                                    ))}
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
                                    {PROGRAM_OPTIONS.map((program) => (
                                        <option key={program} value={program}>
                                            {program}
                                        </option>
                                    ))}
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
                                        disabled={loadingCities || submitting}
                                        className="bg-[#FF7A2F] text-white px-8 py-2.5 rounded-xl font-fredoka font-bold text-base md:text-lg shadow-[0_5px_0_#D35400] border border-white/90 transition-all whitespace-nowrap disabled:opacity-60 inline-flex items-center gap-2"
                                    >
                                        {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                        {isRegister ? 'Register & Submit Enquiry' : 'Submit Enquiry'}
                                    </motion.button>
                                    {isRegister && resetUrl && (
                                        <div className="mt-4 w-full rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 space-y-3">
                                            <p className="font-semibold">
                                                Account created. Set your password using the link below (also sent to your
                                                email):
                                            </p>
                                            <Link
                                                href={resetUrl}
                                                className="inline-flex items-center rounded-lg bg-green-600 text-white px-4 py-2 font-semibold hover:bg-green-700"
                                            >
                                                Open Reset Password Link
                                            </Link>
                                            <p className="text-xs break-all">{resetUrl}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div
                                className={`relative aspect-[10/13] w-full overflow-visible border-0 bg-transparent ring-0 outline-none md:col-span-4 md:aspect-[4/5] max-md:mx-auto max-md:max-w-sm ${
                                    isRegister ? "md:mt-4" : "md:-mt-28 max-md:-mt-1"
                                }`}
                            >
                                <Image
                                    src={nextImageSrc(welcomeImage) || welcomeImage}
                                    alt="Welcome to T.I.M.E. Kids"
                                    fill
                                    sizes="(max-width: 768px) 90vw, 400px"
                                    className="object-contain object-center"
                                    unoptimized
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
